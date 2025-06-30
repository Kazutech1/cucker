import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Set withdrawal address
export const setWithdrawalAddress = async (req, res) => {
  try {
    const { address } = req.body;
    const userId = req.user.id;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { withdrawalAddress: address }
    });

    res.json({
      message: "Withdrawal address set successfully",
      address: updatedUser.withdrawalAddress
    });
  } catch (error) {
    console.error("Set address error:", error);
    res.status(500).json({ message: "Failed to set withdrawal address" });
  }
};

// Get withdrawal info
export const getWithdrawalInfo = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        profitBalance: true,
        withdrawalAddress: true
      }
    });

    res.json({
      profitBalance: user.profitBalance,
      withdrawalAddress: user.withdrawalAddress,
      minWithdrawal: 10 // Set your minimum amount
    });
  } catch (error) {
    console.error("Get withdrawal info error:", error);
    res.status(500).json({ message: "Failed to get withdrawal info" });
  }
};

// Process withdrawal
export const requestWithdrawal = async (req, res) => {
  try {
    const { amount } = req.body;
    const userId = req.user.id;
    const minWithdrawal = 10;

    // Verify user has address set
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user.withdrawalAddress) {
      return res.status(400).json({ message: "Withdrawal address not set" });
    }

    if (amount < minWithdrawal) {
      return res.status(400).json({ 
        message: `Minimum withdrawal is ${minWithdrawal}` 
      });
    }

    if (user.profitBalance < amount) {
      return res.status(400).json({ 
        message: "Insufficient profit balance" 
      });
    }

    // Create withdrawal record
    const withdrawal = await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: { profitBalance: { decrement: amount } }
      }),
      prisma.withdrawal.create({
        data: {
          userId,
          amount,
          address: user.withdrawalAddress
        }
      })
    ]);

    // Here you would typically:
    // 1. Process the crypto payment
    // 2. Update withdrawal status when transaction completes
    // 3. Send confirmation email

    res.json({
      message: "Withdrawal request submitted",
      withdrawalId: withdrawal[1].id,
      amount,
      address: user.withdrawalAddress,
      newProfitBalance: user.profitBalance - amount
    });

  } catch (error) {
    console.error("Withdrawal error:", error);
    res.status(500).json({ message: "Failed to process withdrawal" });
  }
};