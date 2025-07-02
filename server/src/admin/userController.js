import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Admin Dashboard Stats
export const getDashboardStats = async (req, res) => {
  try {
    const [users, deposits, withdrawals, earnings, totalDepositsAmount] = await Promise.all([
      prisma.user.count(),
      prisma.deposit.count(),
      prisma.withdrawal.count(),
      prisma.user.aggregate({
        _sum: { profitBalance: true }
      }),
      prisma.deposit.aggregate({
        _sum: { amount: true },
        where: { status: 'verified' } // Only sum verified deposits if needed
      })
    ]);

    res.json({
      totalUsers: users,
      totalDeposits: deposits, // This is still the count of deposits
      totalDepositsAmount: totalDepositsAmount._sum.amount || 0, // This is the sum of all deposit amounts
      totalWithdrawals: withdrawals,
      totalEarnings: earnings._sum.profitBalance || 0
    });
  } catch (error) {
    console.error("Admin stats error:", error);
    res.status(500).json({ message: "Failed to get dashboard stats" });
  }
};

// Manage Users
// Get all users with more detailed information
export const getUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        fullName: true,
        username: true,
        phoneNumber: true,
        balance: true,
        profitBalance: true,
        withdrawalAddress: true,
        profilePicture: true,
        role: true,
        createdAt: true,
        profile: {
          select: {
            vipLevel: true,
            totalInvested: true
          }
        },
        _count: {
          select: {
            deposit: true,
            withdrawal: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(users);
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({ message: "Failed to get users" });
  }
};

// Delete user
export const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;
    
    await prisma.user.delete({
      where: { id: userId }
    });

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({ message: "Failed to delete user" });
  }
};




// Get all deposits with user info and proof images
export const getDeposits = async (req, res) => {
  try {
    const deposits = await prisma.deposit.findMany({
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(deposits);
  } catch (error) {
    console.error("Get deposits error:", error);
    res.status(500).json({ message: "Failed to get deposits" });
  }
};




// Verify/Reject Deposits with image proof handling
export const verifyDeposit = async (req, res) => {
  try {
    const { depositId, status, adminNote } = req.body;
    
    const deposit = await prisma.deposit.update({
      where: { id: depositId },
      data: { 
        status,
        verifiedAt: status === 'verified' ? new Date() : null,
      
      },
      include: { user: true }
    });

    // Credit user balance if verified
    if (status === 'verified') {
      await prisma.$transaction([
        prisma.user.update({
          where: { id: deposit.userId },
          data: { balance: { increment: deposit.amount } }
        }),
        prisma.profile.update({
          where: { userId: deposit.userId },
          data: { totalInvested: { increment: deposit.amount } }
        })
      ]);
    }

    res.json({
      message: `Deposit ${status}`,
      deposit
    });
  } catch (error) {
    console.error("Verify deposit error:", error);
    res.status(500).json({ message: "Failed to verify deposit" });
  }
};

// Process Withdrawals
// Get all withdrawals with user info
export const getWithdrawals = async (req, res) => {
  try {
    const withdrawals = await prisma.withdrawal.findMany({
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            balance: true,
            profitBalance: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(withdrawals);
  } catch (error) {
    console.error("Get withdrawals error:", error);
    res.status(500).json({ message: "Failed to get withdrawals" });
  }
};

// Process Withdrawals (approve/reject)
export const processWithdrawal = async (req, res) => {
  try {
    const { withdrawalId, status } = req.body;
    
    const withdrawal = await prisma.withdrawal.update({
      where: { id: withdrawalId },
      data: { 
        status,
        completedAt: status === 'completed' ? new Date() : null,
    
       
      },
      include: { user: true }
    });

    // If rejected, return funds to profit balance
    if (status === 'rejected') {
      await prisma.user.update({
        where: { id: withdrawal.userId },
        data: { profitBalance: { increment: withdrawal.amount } }
      });
    }

    res.json({
      message: `Withdrawal ${status}`,
      withdrawal
    });
  } catch (error) {
    console.error("Process withdrawal error:", error);
    res.status(500).json({ message: "Failed to process withdrawal" });
  }
};



// Get all VIP levels
export const getVipLevels = async (req, res) => {
  try {
    const levels = await prisma.vipLevel.findMany({
      orderBy: { level: 'asc' }
    });
    res.json(levels);
  } catch (error) {
    console.error("Get VIP levels error:", error);
    res.status(500).json({ message: "Failed to get VIP levels" });
  }
};



// Update user VIP level
// Update user VIP level
export const updateVipLevel = async (req, res) => {
  try {
    const { userId, level } = req.body;
    
    // Validate input
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }
    
    if (level === undefined || level === null) {
      return res.status(400).json({ message: "VIP level is required" });
    }

    // Convert level to number
    const vipLevel = parseInt(level);
    if (isNaN(vipLevel)) {
      return res.status(400).json({ message: "VIP level must be a number" });
    }

    // First check if user exists
    const userExists = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true }
    });
    
    if (!userExists) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if VIP level exists (using the converted number)
    const vipExists = await prisma.vipLevel.findUnique({
      where: { level: vipLevel }
    });
    
    if (!vipExists) {
      return res.status(400).json({ message: `VIP level ${vipLevel} doesn't exist` });
    }

    // Update user VIP level
    // First ensure the user has a profile
    await prisma.profile.upsert({
      where: { userId },
      update: { vipLevel },
      create: {
        userId,
        vipLevel,
        totalInvested: 0
      }
    });

    // Get updated user data to return
    const updatedUser = await prisma.user.findUnique({
      where: { id: userId },
      include: { 
        profile: {
          include: { vipLevelData: true }
        } 
      }
    });

    res.json({
      success: true,
      message: "VIP level updated successfully",
      user: updatedUser
    });
  } catch (error) {
    console.error("Update VIP error:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to update VIP level",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};


// Get admin wallets
export const getAdminWallets = async (req, res) => {
  try {
    const wallets = await prisma.adminWallet.findMany({
      where: { isActive: true }
    });
    res.json(wallets);
  } catch (error) {
    console.error("Get admin wallets error:", error);
    res.status(500).json({ message: "Failed to get admin wallets" });
  }
};


// Add new admin wallet
export const addAdminWallet = async (req, res) => {
  try {
    const { currency, address, network } = req.body;

    // Validate required fields
    if (!currency || !address) {
      return res.status(400).json({ message: "Currency and address are required" });
    }

    // Check if wallet already exists
    const existingWallet = await prisma.adminWallet.findFirst({
      where: {
        OR: [
          { address },
          { currency, network }
        ]
      }
    });

    if (existingWallet) {
      return res.status(400).json({ 
        message: existingWallet.address === address ? 
          "Wallet with this address already exists" : 
          "Wallet for this currency and network already exists"
      });
    }

    const newWallet = await prisma.adminWallet.create({
      data: {
        currency,
        address,
        network: network || null
      }
    });

    res.status(201).json({
      message: "Wallet added successfully",
      wallet: newWallet
    });
  } catch (error) {
    console.error("Add admin wallet error:", error);
    res.status(500).json({ message: "Failed to add admin wallet" });
  }
};

// Update admin wallet
export const updateAdminWallet = async (req, res) => {
  try {
    const { walletId } = req.params;
    const { currency, address, network, isActive } = req.body;

    const updatedWallet = await prisma.adminWallet.update({
      where: { id: walletId },
      data: {
        currency,
        address,
        network,
        isActive
      }
    });

    res.json({
      message: "Wallet updated successfully",
      wallet: updatedWallet
    });
  } catch (error) {
    console.error("Update admin wallet error:", error);
    res.status(500).json({ message: "Failed to update admin wallet" });
  }
};

// Delete admin wallet
export const deleteAdminWallet = async (req, res) => {
  try {
    const { walletId } = req.params;

    await prisma.adminWallet.delete({
      where: { id: walletId }
    });

    res.json({ message: "Wallet deleted successfully" });
  } catch (error) {
    console.error("Delete admin wallet error:", error);
    res.status(500).json({ message: "Failed to delete admin wallet" });
  }
};


// Get single user by ID
export const getUserById = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: {
          include: {
            vipLevelData: true
          }
        },
        deposit: true,
        withdrawal: true
      }
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error("Get user by ID error:", error);
    res.status(500).json({ message: "Failed to get user" });
  }
};

// Get single deposit by ID
export const getDepositById = async (req, res) => {
  try {
    const { depositId } = req.params;
    
    const deposit = await prisma.deposit.findUnique({
      where: { id: depositId },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true
          }
        }
      }
    });

    if (!deposit) {
      return res.status(404).json({ message: "Deposit not found" });
    }

    res.json(deposit);
  } catch (error) {
    console.error("Get deposit by ID error:", error);
    res.status(500).json({ message: "Failed to get deposit" });
  }
};

// Get single withdrawal by ID
export const getWithdrawalById = async (req, res) => {
  try {
    const { withdrawalId } = req.params;
    
    const withdrawal = await prisma.withdrawal.findUnique({
      where: { id: withdrawalId },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true
          }
        }
      }
    });

    if (!withdrawal) {
      return res.status(404).json({ message: "Withdrawal not found" });
    }

    res.json(withdrawal);
  } catch (error) {
    console.error("Get withdrawal by ID error:", error);
    res.status(500).json({ message: "Failed to get withdrawal" });
  }
};


// Admin: Send broadcast notification to all users

export const sendNotification = async (req, res) => {
  try {
    const { title, message, type = 'info' } = req.body

    if (!title || !message) {
      return res.status(400).json({ message: "Title and message are required" })
    }

    const notification = await prisma.notification.create({
      data: { title, message, type }
    })

    res.status(201).json({
      success: true,
      message: "Notification created successfully",
      data: notification
    })
  } catch (error) {
    console.error("Error creating notification:", error)
    res.status(500).json({
      success: false,
      message: "Failed to create notification",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
}

export const getNotifications = async (req, res) => {
  try {
    const { isRead, limit, type } = req.query
    
    const notifications = await prisma.notification.findMany({
      where: {
        isRead: isRead ? isRead === 'true' : undefined,
        type: type || undefined
      },
      orderBy: { createdAt: 'desc' },
      take: limit ? parseInt(limit) : undefined
    })

    res.json({
      success: true,
      data: notifications
    })
  } catch (error) {
    console.error("Error fetching notifications:", error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch notifications",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
}

export const deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.params

    await prisma.notification.delete({
      where: { id: notificationId }
    })

    res.json({
      success: true,
      message: "Notification deleted successfully"
    })
  } catch (error) {
    console.error("Error deleting notification:", error)
    res.status(500).json({
      success: false,
      message: "Failed to delete notification",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
}



// Update any user field as admin
export const updateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { vipLevel, ...otherFields } = req.body;

    // Validate user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true }
    });

    if (!existingUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Handle VIP level validation and conversion
    let vipLevelNumber;
    if (vipLevel !== undefined) {
      vipLevelNumber = parseInt(vipLevel);
      if (isNaN(vipLevelNumber)) {
        return res.status(400).json({ success: false, message: "VIP level must be a number" });
      }

      const vipExists = await prisma.vipLevel.findUnique({
        where: { level: vipLevelNumber }
      });
      
      if (!vipExists) {
        return res.status(400).json({ success: false, message: "Invalid VIP level" });
      }
    }

    // Prepare profile update
    const profileUpdate = {};
    if (vipLevel !== undefined) profileUpdate.vipLevel = vipLevelNumber;
    if (otherFields.totalInvested !== undefined) {
      profileUpdate.totalInvested = parseFloat(otherFields.totalInvested);
    }

    // Build update data
    const updateData = {
      ...otherFields,
      ...(Object.keys(profileUpdate).length > 0 && {
        profile: {
          update: profileUpdate
        }
      })
    };

    // Clean undefined values
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) delete updateData[key];
    });

    // Execute update
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      include: {
        profile: {
          include: { vipLevelData: true }
        }
      }
    });

    res.json({
      success: true,
      message: "User updated successfully",
      user: updatedUser
    });
  } catch (error) {
    console.error("Update user error:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to update user",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};




// Create new VIP level
export const createVipLevel = async (req, res) => {
  try {
    const { level, name, profitPerOrder, appsPerSet, minBalance } = req.body;

    // Validate required fields
    if (level === undefined || !name || profitPerOrder === undefined || 
        appsPerSet === undefined || minBalance === undefined) {
      return res.status(400).json({ 
        success: false,
        message: "All fields (level, name, profitPerOrder, appsPerSet, minBalance) are required"
      });
    }

    // Check if level already exists
    const existingLevel = await prisma.vipLevel.findUnique({
      where: { level: parseInt(level) }
    });

    if (existingLevel) {
      return res.status(400).json({
        success: false,
        message: `VIP level ${level} already exists`
      });
    }

    // Create new VIP level
    const newLevel = await prisma.vipLevel.create({
      data: {
        level: parseInt(level),
        name,
        profitPerOrder: parseFloat(profitPerOrder),
        appsPerSet: parseInt(appsPerSet),
        minBalance: parseFloat(minBalance)
      }
    });

    res.status(201).json({
      success: true,
      message: "VIP level created successfully",
      level: newLevel
    });
  } catch (error) {
    console.error("Create VIP level error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create VIP level",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Update VIP level
export const updateVipLevelDetails = async (req, res) => {
  try {
    const { level } = req.params;
    const { name, profitPerOrder, appsPerSet, minBalance } = req.body;

    // Convert level to number
    const levelNum = parseInt(level);
    if (isNaN(levelNum)) {
      return res.status(400).json({
        success: false,
        message: "Invalid VIP level"
      });
    }

    // Check if level exists
    const existingLevel = await prisma.vipLevel.findUnique({
      where: { level: levelNum }
    });

    if (!existingLevel) {
      return res.status(404).json({
        success: false,
        message: `VIP level ${levelNum} not found`
      });
    }

    // Prepare update data
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (profitPerOrder !== undefined) updateData.profitPerOrder = parseFloat(profitPerOrder);
    if (appsPerSet !== undefined) updateData.appsPerSet = parseInt(appsPerSet);
    if (minBalance !== undefined) updateData.minBalance = parseFloat(minBalance);

    // Update the VIP level
    const updatedLevel = await prisma.vipLevel.update({
      where: { level: levelNum },
      data: updateData
    });

    res.json({
      success: true,
      message: "VIP level updated successfully",
      level: updatedLevel
    });
  } catch (error) {
    console.error("Update VIP level error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update VIP level",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Delete VIP level
export const deleteVipLevel = async (req, res) => {
  try {
    const { level } = req.params;

    // Convert level to number
    const levelNum = parseInt(level);
    if (isNaN(levelNum)) {
      return res.status(400).json({
        success: false,
        message: "Invalid VIP level"
      });
    }

    // Check if any users have this VIP level
    const usersWithLevel = await prisma.profile.count({
      where: { vipLevel: levelNum }
    });

    if (usersWithLevel > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete VIP level ${levelNum} - ${usersWithLevel} users have this level`
      });
    }

    // Delete the VIP level
    await prisma.vipLevel.delete({
      where: { level: levelNum }
    });

    res.json({
      success: true,
      message: `VIP level ${levelNum} deleted successfully`
    });
  } catch (error) {
    console.error("Delete VIP level error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete VIP level",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};