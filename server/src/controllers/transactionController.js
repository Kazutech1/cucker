// transactionController.js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Get all transactions for a user with pagination and filtering
export const getTransactionHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { 
      page = 1, 
      limit = 10, 
      type, // deposit, withdrawal, earnings
      status, // pending, completed, failed, verified, rejected
      startDate,
      endDate 
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    // Build where conditions for filtering
    const whereConditions = { userId };
    
    if (startDate || endDate) {
      whereConditions.createdAt = {};
      if (startDate) whereConditions.createdAt.gte = new Date(startDate);
      if (endDate) whereConditions.createdAt.lte = new Date(endDate);
    }

    let transactions = [];

    // Get deposits
    if (!type || type === 'deposit') {
      const depositWhere = { ...whereConditions };
      if (status) depositWhere.status = status;

      const deposits = await prisma.deposit.findMany({
        where: depositWhere,
        skip: type === 'deposit' ? skip : 0,
        take: type === 'deposit' ? take : undefined,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          amount: true,
          status: true,
          createdAt: true,
          verifiedAt: true,
          txHash: true
        }
      });

      transactions.push(...deposits.map(d => ({
        id: d.id,
        type: 'deposit',
        amount: d.amount,
        status: d.status,
        date: d.createdAt,
        completedAt: d.verifiedAt,
        reference: d.txHash,
        description: `Deposit of $${d.amount}`
      })));
    }

    // Get withdrawals
    if (!type || type === 'withdrawal') {
      const withdrawalWhere = { ...whereConditions };
      if (status) withdrawalWhere.status = status;

      const withdrawals = await prisma.withdrawal.findMany({
        where: withdrawalWhere,
        skip: type === 'withdrawal' ? skip : 0,
        take: type === 'withdrawal' ? take : undefined,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          amount: true,
          status: true,
          createdAt: true,
          completedAt: true,
          address: true
        }
      });

      transactions.push(...withdrawals.map(w => ({
        id: w.id,
        type: 'withdrawal',
        amount: -w.amount, // Negative for withdrawals
        status: w.status,
        date: w.createdAt,
        completedAt: w.completedAt,
        reference: w.address,
        description: `Withdrawal of $${w.amount} to ${w.address?.substring(0, 10)}...`
      })));
    }

    // Get earnings
    if (!type || type === 'earnings') {
      const earningsWhere = { ...whereConditions };

      const earnings = await prisma.earningsHistory.findMany({
        where: earningsWhere,
        skip: type === 'earnings' ? skip : 0,
        take: type === 'earnings' ? take : undefined,
        orderBy: { date: 'desc' },
        select: {
          id: true,
          amount: true,
          date: true
        }
      });

      transactions.push(...earnings.map(e => ({
        id: e.id,
        type: 'earnings',
        amount: e.amount,
        status: 'completed',
        date: e.date,
        completedAt: e.date,
        reference: null,
        description: `Daily earnings of $${e.amount}`
      })));
    }

    // Sort all transactions by date
    transactions.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Apply pagination if not filtering by specific type
    if (!type) {
      transactions = transactions.slice(skip, skip + take);
    }

    // Get total counts for pagination
    const totalCounts = await Promise.all([
      prisma.deposit.count({ where: { userId } }),
      prisma.withdrawal.count({ where: { userId } }),
      prisma.earningsHistory.count({ where: { userId } })
    ]);

    const totalTransactions = totalCounts.reduce((sum, count) => sum + count, 0);
    const totalPages = Math.ceil(totalTransactions / take);

    res.json({
      success: true,
      transactions,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalTransactions,
        hasNext: parseInt(page) < totalPages,
        hasPrev: parseInt(page) > 1
      }
    });

  } catch (error) {
    console.error("Get transaction history error:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to get transaction history" 
    });
  }
};

// Get transaction summary/statistics
export const getTransactionSummary = async (req, res) => {
  try {
    const userId = req.user.id;
    const { period = '30' } = req.query; // days

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    // Get summary data
    const [
      totalDeposits,
      totalWithdrawals,
      totalEarnings,
      pendingDeposits,
      pendingWithdrawals,
      recentTransactionsCount
    ] = await Promise.all([
      // Total deposits (verified only)
      prisma.deposit.aggregate({
        where: { 
          userId, 
          status: 'verified' 
        },
        _sum: { amount: true },
        _count: true
      }),
      
      // Total withdrawals (completed only)
      prisma.withdrawal.aggregate({
        where: { 
          userId, 
          status: 'completed' 
        },
        _sum: { amount: true },
        _count: true
      }),
      
      // Total earnings
      prisma.earningsHistory.aggregate({
        where: { userId },
        _sum: { amount: true },
        _count: true
      }),
      
      // Pending deposits
      prisma.deposit.aggregate({
        where: { 
          userId, 
          status: 'pending' 
        },
        _sum: { amount: true },
        _count: true
      }),
      
      // Pending withdrawals
      prisma.withdrawal.aggregate({
        where: { 
          userId, 
          status: 'pending' 
        },
        _sum: { amount: true },
        _count: true
      }),
      
      // Recent transactions count
      prisma.deposit.count({
        where: {
          userId,
          createdAt: { gte: startDate }
        }
      }) + 
      prisma.withdrawal.count({
        where: {
          userId,
          createdAt: { gte: startDate }
        }
      }) + 
      prisma.earningsHistory.count({
        where: {
          userId,
          date: { gte: startDate }
        }
      })
    ]);

    // Get monthly earnings data for chart
    const monthlyEarnings = await prisma.earningsHistory.groupBy({
      by: ['date'],
      where: {
        userId,
        date: { gte: startDate }
      },
      _sum: { amount: true },
      orderBy: { date: 'asc' }
    });

    // Process monthly data
    const earningsChart = monthlyEarnings.reduce((acc, earning) => {
      const month = earning.date.toISOString().substring(0, 7); // YYYY-MM
      acc[month] = (acc[month] || 0) + earning._sum.amount;
      return acc;
    }, {});

    res.json({
      success: true,
      summary: {
        totalDeposits: {
          amount: totalDeposits._sum.amount || 0,
          count: totalDeposits._count
        },
        totalWithdrawals: {
          amount: totalWithdrawals._sum.amount || 0,
          count: totalWithdrawals._count
        },
        totalEarnings: {
          amount: totalEarnings._sum.amount || 0,
          count: totalEarnings._count
        },
        pending: {
          deposits: {
            amount: pendingDeposits._sum.amount || 0,
            count: pendingDeposits._count
          },
          withdrawals: {
            amount: pendingWithdrawals._sum.amount || 0,
            count: pendingWithdrawals._count
          }
        },
        recentActivity: {
          transactionsCount: recentTransactionsCount,
          period: `${period} days`
        }
      },
      earningsChart: Object.entries(earningsChart).map(([month, amount]) => ({
        month,
        amount
      }))
    });

  } catch (error) {
    console.error("Get transaction summary error:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to get transaction summary" 
    });
  }
};

// Get specific transaction details
export const getTransactionDetails = async (req, res) => {
  try {
    const { id, type } = req.params;
    const userId = req.user.id;

    let transaction = null;

    switch (type) {
      case 'deposit':
        transaction = await prisma.deposit.findFirst({
          where: { id, userId },
          select: {
            id: true,
            amount: true,
            status: true,
            createdAt: true,
            verifiedAt: true,
            txHash: true,
            proofImage: true
          }
        });
        
        if (transaction) {
          transaction.type = 'deposit';
          transaction.description = `Deposit of $${transaction.amount}`;
        }
        break;

      case 'withdrawal':
        transaction = await prisma.withdrawal.findFirst({
          where: { id, userId },
          select: {
            id: true,
            amount: true,
            status: true,
            createdAt: true,
            completedAt: true,
            address: true
          }
        });
        
        if (transaction) {
          transaction.type = 'withdrawal';
          transaction.description = `Withdrawal of $${transaction.amount}`;
        }
        break;

      case 'earnings':
        transaction = await prisma.earningsHistory.findFirst({
          where: { id, userId },
          select: {
            id: true,
            amount: true,
            date: true
          }
        });
        
        if (transaction) {
          transaction.type = 'earnings';
          transaction.status = 'completed';
          transaction.createdAt = transaction.date;
          transaction.description = `Daily earnings of $${transaction.amount}`;
        }
        break;

      default:
        return res.status(400).json({ 
          success: false,
          message: "Invalid transaction type" 
        });
    }

    if (!transaction) {
      return res.status(404).json({ 
        success: false,
        message: "Transaction not found" 
      });
    }

    res.json({
      success: true,
      transaction
    });

  } catch (error) {
    console.error("Get transaction details error:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to get transaction details" 
    });
  }
};

// Export earnings history as CSV
export const exportTransactionHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { type, startDate, endDate } = req.query;

    // Build where conditions
    const whereConditions = { userId };
    
    if (startDate || endDate) {
      whereConditions.createdAt = {};
      if (startDate) whereConditions.createdAt.gte = new Date(startDate);
      if (endDate) whereConditions.createdAt.lte = new Date(endDate);
    }

    let csvData = 'Date,Type,Amount,Status,Reference,Description\n';

    // Get all transaction types based on filter
    if (!type || type === 'deposit') {
      const deposits = await prisma.deposit.findMany({
        where: whereConditions,
        orderBy: { createdAt: 'desc' }
      });

      deposits.forEach(d => {
        csvData += `${d.createdAt.toISOString()},Deposit,${d.amount},${d.status},${d.txHash || ''},Deposit of $${d.amount}\n`;
      });
    }

    if (!type || type === 'withdrawal') {
      const withdrawals = await prisma.withdrawal.findMany({
        where: whereConditions,
        orderBy: { createdAt: 'desc' }
      });

      withdrawals.forEach(w => {
        csvData += `${w.createdAt.toISOString()},Withdrawal,-${w.amount},${w.status},${w.address},Withdrawal of $${w.amount}\n`;
      });
    }

    if (!type || type === 'earnings') {
      const earningsWhere = { ...whereConditions };
      if (startDate || endDate) {
        earningsWhere.date = whereConditions.createdAt;
        delete earningsWhere.createdAt;
      }

      const earnings = await prisma.earningsHistory.findMany({
        where: earningsWhere,
        orderBy: { date: 'desc' }
      });

      earnings.forEach(e => {
        csvData += `${e.date.toISOString()},Earnings,${e.amount},Completed,,Daily earnings of $${e.amount}\n`;
      });
    }

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=transaction-history.csv');
    res.send(csvData);

  } catch (error) {
    console.error("Export transaction history error:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to export transaction history" 
    });
  }
};