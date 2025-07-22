import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Admin Dashboard Stats
export const getDashboardStats = async (req, res) => {
  try {
    const [
      users,
      blockedUsers,
      deposits,
      withdrawals,
      earnings,
      totalDepositsAmount,
      totalWithdrawalsAmount,
      products,
      deactivatedProducts,
      tasks,
      completedTasks
    ] = await Promise.all([
      // User stats
      prisma.user.count(),
      prisma.user.count({ where: { isBlocked: true } }),
      
      // Deposit/Withdrawal counts
      prisma.deposit.count(),
      prisma.withdrawal.count(),
      
      // Earnings
      prisma.user.aggregate({ _sum: { profitBalance: true } }),
      
      // Financial amounts
      prisma.deposit.aggregate({
        _sum: { amount: true },
        where: { status: 'verified' }
      }),
      prisma.withdrawal.aggregate({
        _sum: { amount: true },
        where: { status: 'completed' }
      }),
      
      // Product stats
      prisma.product.count(),
      prisma.product.count({ where: { isActive: false } }),
      
      // Task stats
      prisma.userTask.count(),
      prisma.userTask.count({ where: { status: 'completed' } })
    ]);

    res.json({
      // User stats
      totalUsers: users,
      blockedUsers: blockedUsers,
      
      // Financial counts
      totalDeposits: deposits,
      totalWithdrawals: withdrawals,
      
      // Financial amounts
      totalDepositsAmount: totalDepositsAmount._sum.amount || 0,
      totalWithdrawalsAmount: totalWithdrawalsAmount._sum.amount || 0,
      totalEarnings: earnings._sum.profitBalance || 0,
      
      // Product stats
      totalProducts: products,
      deactivatedProducts: deactivatedProducts,
      
      // Task stats
      totalTasks: tasks,
      completedTasks: completedTasks
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
        referredBy: true,
        withdrawalPassword: true,
        createdAt: true,
        profile: {
          select: {
            vipLevel: true,
            totalInvested: true
          }
        },
        _count: {
          select: {
            deposits: true,
            withdrawals: true
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

    // Map withdrawals to include payment method information
    const withdrawalsWithPaymentMethod = withdrawals.map(withdrawal => {
      let paymentMethod = 'Unknown';
      
      // Detect payment method from address
      if (withdrawal.address.startsWith('0x')) {
        paymentMethod = 'Ethereum';
      } else if (withdrawal.address.startsWith('1') || withdrawal.address.startsWith('3') || withdrawal.address.startsWith('bc1')) {
        paymentMethod = 'Bitcoin';
      } else if (withdrawal.address.startsWith('T')) {
        paymentMethod = 'USDT (TRC20)';
      } else if (withdrawal.address.length === 34) {
        paymentMethod = 'USDT (Omni)';
      }

      return {
        ...withdrawal,
        paymentMethod
      };
    });

    res.json(withdrawalsWithPaymentMethod);
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
// export const getAdminWallets = async (req, res) => {
//   try {
//     const wallets = await prisma.adminWallet.findMany({
//       where: { isActive: true }
//     });
//     res.json(wallets);
//   } catch (error) {
//     console.error("Get admin wallets error:", error);
//     res.status(500).json({ message: "Failed to get admin wallets" });
//   }
// };


// // Add new admin wallet
// export const addAdminWallet = async (req, res) => {
//   try {
//     const { currency, address, network } = req.body;

//     // Validate required fields
//     if (!currency || !address) {
//       return res.status(400).json({ message: "Currency and address are required" });
//     }

//     // Check if wallet already exists
//     const existingWallet = await prisma.adminWallet.findFirst({
//       where: {
//         OR: [
//           { address },
//           { currency, network }
//         ]
//       }
//     });

//     if (existingWallet) {
//       return res.status(400).json({ 
//         message: existingWallet.address === address ? 
//           "Wallet with this address already exists" : 
//           "Wallet for this currency and network already exists"
//       });
//     }

//     const newWallet = await prisma.adminWallet.create({
//       data: {
//         currency,
//         address,
//         network: network || null
//       }
//     });

//     res.status(201).json({
//       message: "Wallet added successfully",
//       wallet: newWallet
//     });
//   } catch (error) {
//     console.error("Add admin wallet error:", error);
//     res.status(500).json({ message: "Failed to add admin wallet" });
//   }
// };

// // Update admin wallet
// export const updateAdminWallet = async (req, res) => {
//   try {
//     const { walletId } = req.params;
//     const { currency, address, network, isActive } = req.body;

//     const updatedWallet = await prisma.adminWallet.update({
//       where: { id: walletId },
//       data: {
//         currency,
//         address,
//         network,
//         isActive
//       }
//     });

//     res.json({
//       message: "Wallet updated successfully",
//       wallet: updatedWallet
//     });
//   } catch (error) {
//     console.error("Update admin wallet error:", error);
//     res.status(500).json({ message: "Failed to update admin wallet" });
//   }
// };

// // Delete admin wallet
// export const deleteAdminWallet = async (req, res) => {
//   try {
//     const { walletId } = req.params;

//     await prisma.adminWallet.delete({
//       where: { id: walletId }
//     });

//     res.json({ message: "Wallet deleted successfully" });
//   } catch (error) {
//     console.error("Delete admin wallet error:", error);
//     res.status(500).json({ message: "Failed to delete admin wallet" });
//   }
// };


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
        deposits: true,
        withdrawals: true
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



export const createTask = async (req, res) => {
  try {
    const { appName, appImage, appReview, appProfit, isComboTask, comboAmount } = req.body;

    // Validate input
    if (!appName || !appImage || !appReview || appProfit === undefined) {
      return res.status(400).json({
        success: false,
        message: "All task fields are required"
      });
    }

    if (isComboTask && (!comboAmount || comboAmount <= 0)) {
      return res.status(400).json({
        success: false,
        message: "Combo tasks require a positive combo amount"
      });
    }

    const task = await prisma.task.create({
      data: {
        appName,
        appImage,
        appReview,
        appProfit,
        isComboTask: isComboTask || false,
        comboAmount: isComboTask ? comboAmount : null
      }
    });

    // Notify admins of new task
    await notifyAdmins({
      title: "New Task Created",
      message: `A new task "${appName}" was created`,
      type: "info"
    });

    res.status(201).json({
      success: true,
      message: "Task created successfully",
      task
    });
  } catch (error) {
    console.error("Create task error:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to create task",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get all tasks with filtering options
 */
export const getAllTasks = async (req, res) => {
  try {
    const { isActive, isComboTask, search } = req.query;

    const tasks = await prisma.task.findMany({
      where: {
        isActive: isActive ? isActive === 'true' : undefined,
        isComboTask: isComboTask ? isComboTask === 'true' : undefined,
        OR: search ? [
          { appName: { contains: search, mode: 'insensitive' } },
          { appReview: { contains: search, mode: 'insensitive' } }
        ] : undefined
      },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: {
            assignments: true,
            taskHistory: true
          }
        }
      }
    });

    res.json({
      success: true,
      count: tasks.length,
      tasks
    });
  } catch (error) {
    console.error("Get tasks error:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to get tasks"
    });
  }
};

/**
 * Get task by ID with detailed info
 */
export const getTaskById = async (req, res) => {
  try {
    const { taskId } = req.params;

    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        assignments: {
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
        },
        taskHistory: {
          orderBy: { completedAt: 'desc' },
          take: 10
        },
        _count: {
          select: {
            assignments: true,
            taskHistory: true
          }
        }
      }
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found"
      });
    }

    res.json({
      success: true,
      task
    });
  } catch (error) {
    console.error("Get task by ID error:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to get task"
    });
  }
};

/**
 * Update task details
 */
export const updateTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { appName, appImage, appReview, appProfit, isActive, isComboTask, comboAmount } = req.body;

    // Validate combo task requirements
    if (isComboTask && (!comboAmount || comboAmount <= 0)) {
      return res.status(400).json({
        success: false,
        message: "Combo tasks require a positive combo amount"
      });
    }

    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: {
        appName,
        appImage,
        appReview,
        appProfit,
        isActive,
        isComboTask,
        comboAmount: isComboTask ? comboAmount : null
      }
    });

    res.json({
      success: true,
      message: "Task updated successfully",
      task: updatedTask
    });
  } catch (error) {
    console.error("Update task error:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to update task"
    });
  }
};

/**
 * Delete a task and its assignments
 */
export const deleteTask = async (req, res) => {
  try {
    const { taskId } = req.params;

    await prisma.$transaction([
      prisma.taskAssignment.deleteMany({
        where: { taskId }
      }),
      prisma.taskHistory.deleteMany({
        where: { taskId }
      }),
      prisma.task.delete({
        where: { id: taskId }
      })
    ]);

    res.json({
      success: true,
      message: "Task and all related data deleted successfully"
    });
  } catch (error) {
    console.error("Delete task error:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to delete task"
    });
  }
};

/**
 * Assign task to user (admin-controlled)
 * Allows assigning duplicate tasks
 */
export const assignTaskToUser = async (req, res) => {
  try {
    const { userId, taskId } = req.body;

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Check if task exists and is active
    const task = await prisma.task.findUnique({
      where: { id: taskId, isActive: true }
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found or inactive"
      });
    }

    // Create new assignment (allows duplicates)
    const assignment = await prisma.taskAssignment.create({
      data: {
        taskId,
        userId,
        isComboTask: task.isComboTask,
        comboAmount: task.comboAmount
      },
      include: {
        task: true,
        user: {
          select: {
            id: true,
            username: true,
            email: true
          }
        }
      }
    });

    

    res.json({
      success: true,
      message: "Task assigned successfully",
      assignment
    });
  } catch (error) {
    console.error("Assign task error:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to assign task",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Assign multiple tasks to a user at once
 */
export const assignMultipleTasks = async (req, res) => {
  try {
    const { userId, taskIds } = req.body;

    // Validate input
    if (!userId || !taskIds || !Array.isArray(taskIds) || taskIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "User ID and array of task IDs are required"
      });
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Get all tasks to be assigned
    const tasks = await prisma.task.findMany({
      where: { 
        id: { in: taskIds },
        isActive: true 
      }
    });

    if (tasks.length !== taskIds.length) {
      const missingTasks = taskIds.filter(id => !tasks.some(t => t.id === id));
      return res.status(400).json({
        success: false,
        message: "Some tasks were not found or are inactive",
        missingTasks
      });
    }

    // Create assignments (allows duplicates)
    const assignments = await prisma.$transaction(
      tasks.map(task => 
        prisma.taskAssignment.create({
          data: {
            taskId: task.id,
            userId,
            isComboTask: task.isComboTask,
            comboAmount: task.comboAmount
          },
          include: {
            task: {
              select: {
                appName: true,
                appProfit: true
              }
            }
          }
        })
      )
    );

    // Notify user
    await createUserNotification(userId, {
      title: "New Tasks Assigned",
      message: `You have been assigned ${assignments.length} new tasks`,
      type: "info"
    });

    res.json({
      success: true,
      message: `${assignments.length} tasks assigned successfully`,
      assignments
    });
  } catch (error) {
    console.error("Assign multiple tasks error:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to assign tasks",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Remove task from user
 */
export const removeTaskFromUser = async (req, res) => {
  try {
    const { assignmentId } = req.params;

    const assignment = await prisma.taskAssignment.delete({
      where: { id: assignmentId },
      include: {
        user: {
          select: {
            id: true,
            username: true
          }
        },
        task: {
          select: {
            appName: true
          }
        }
      }
    });

    res.json({
      success: true,
      message: "Task removed from user successfully",
      assignment
    });
  } catch (error) {
    console.error("Remove task error:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to remove task from user"
    });
  }
};

/**
 * Get all task assignments with filtering
 */
export const getAllTaskAssignments = async (req, res) => {
  try {
    const { userId, taskId, status, isComboTask, limit } = req.query;

    const assignments = await prisma.taskAssignment.findMany({
      where: {
        userId: userId || undefined,
        taskId: taskId || undefined,
        isCompleted: status === 'completed' ? true : 
                   status === 'pending' ? false : undefined,
        isComboTask: isComboTask ? isComboTask === 'true' : undefined
      },
      include: {
        task: {
          select: {
            appName: true,
            appImage: true,
            appProfit: true
          }
        },
        user: {
          select: {
            id: true,
            username: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: limit ? parseInt(limit) : undefined
    });

    res.json({
      success: true,
      count: assignments.length,
      assignments
    });
  } catch (error) {
    console.error("Get task assignments error:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to get task assignments"
    });
  }
};


/**
 * Complete a regular task
 */
export const completeTask = async (req, res) => {
  try {
    const { assignmentId } = req.params;

    const assignment = await prisma.taskAssignment.findUnique({
      where: { id: assignmentId },
      include: {
        task: true,
        user: true
      }
    });

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "Task assignment not found"
      });
    }

    if (assignment.isCompleted) {
      return res.status(400).json({
        success: false,
        message: "Task already completed"
      });
    }

    if (assignment.isComboTask) {
      return res.status(400).json({
        success: false,
        message: "Use the completeComboTask endpoint for combo tasks"
      });
    }

    // Mark as completed and credit profit
    await prisma.$transaction([
      prisma.taskAssignment.update({
        where: { id: assignmentId },
        data: {
          isCompleted: true,
          completedAt: new Date()
        }
      }),
      prisma.user.update({
        where: { id: assignment.userId },
        data: { 
          profitBalance: { increment: assignment.task.appProfit }
        }
      }),
      prisma.taskHistory.create({
        data: {
          userId: assignment.userId,
          taskId: assignment.taskId,
          taskName: assignment.task.appName,
          profitEarned: assignment.task.appProfit,
          isComboTask: false
        }
      })
    ]);

    res.json({
      success: true,
      message: "Task completed successfully"
    });
  } catch (error) {
    console.error("Complete task error:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to complete task"
    });
  }
};

/**
 * Complete a combo task (verify deposit and mark as completed)
 */
export const completeComboTask = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    
    // Get the assignment
    const assignment = await prisma.taskAssignment.findUnique({
      where: { id: assignmentId },
      include: {
        task: true,
        user: true
      }
    });

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "Task assignment not found"
      });
    }

    if (!assignment.isComboTask) {
      return res.status(400).json({
        success: false,
        message: "This is not a combo task"
      });
    }

    if (assignment.isCompleted) {
      return res.status(400).json({
        success: false,
        message: "Task already completed"
      });
    }

    // Verify the user has made a deposit meeting the combo amount
    const totalDeposits = await prisma.deposit.aggregate({
      _sum: { amount: true },
      where: { 
        userId: assignment.userId,
        status: 'verified'
      }
    });

    const totalDeposited = totalDeposits._sum.amount || 0;

    if (totalDeposited < assignment.comboAmount) {
      return res.status(400).json({
        success: false,
        message: `User has not deposited enough (minimum ${assignment.comboAmount} required)`,
        deposited: totalDeposited,
        required: assignment.comboAmount
      });
    }

    // Mark as completed and credit profit
    await prisma.$transaction([
      prisma.taskAssignment.update({
        where: { id: assignmentId },
        data: {
          isCompleted: true,
          completedAt: new Date(),
          depositVerified: true
        }
      }),
      prisma.user.update({
        where: { id: assignment.userId },
        data: { 
          profitBalance: { increment: assignment.task.appProfit }
        }
      }),
      prisma.taskHistory.create({
        data: {
          userId: assignment.userId,
          taskId: assignment.taskId,
          taskName: assignment.task.appName,
          profitEarned: assignment.task.appProfit,
          isComboTask: true,
          comboAmount: assignment.comboAmount
        }
      })
    ]);

    res.json({
      success: true,
      message: "Combo task completed successfully"
    });
  } catch (error) {
    console.error("Complete combo task error:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to complete combo task"
    });
  }
};

/**
 * Get tasks specifically designed for combo tasks
 */
export const getComboTasks = async (req, res) => {
  try {
    const comboTasks = await prisma.task.findMany({
      where: { 
        isComboTask: true,
        isActive: true 
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      count: comboTasks.length,
      tasks: comboTasks
    });
  } catch (error) {
    console.error("Get combo tasks error:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to get combo tasks"
    });
  }
};

/**
 * Get task statistics for admin dashboard
 */
export const getTaskStatistics = async (req, res) => {
  try {
    // Total tasks stats
    const [totalTasks, activeTasks] = await Promise.all([
      prisma.task.count(),
      prisma.task.count({ where: { isActive: true } })
    ]);
    
    // Completion stats
    const [totalAssignments, completedAssignments] = await Promise.all([
      prisma.taskAssignment.count(),
      prisma.taskAssignment.count({ where: { isCompleted: true } })
    ]);
    
    // Recent completions
    const recentCompletions = await prisma.taskHistory.findMany({
      take: 10,
      orderBy: { completedAt: 'desc' },
      include: {
        user: {
          select: {
            username: true,
            email: true
          }
        },
        task: {
          select: {
            appName: true
          }
        }
      }
    });

    // Top performing tasks
    const topTasks = await prisma.taskHistory.groupBy({
      by: ['taskId'],
      _count: { taskId: true },
      _sum: { profitEarned: true },
      orderBy: { _count: { taskId: 'desc' } },
      take: 5
    });

    // Get task details for top tasks
    const topTasksWithDetails = await Promise.all(
      topTasks.map(async (task) => {
        const taskDetails = await prisma.task.findUnique({
          where: { id: task.taskId },
          select: { appName: true, appImage: true }
        });
        return {
          ...task,
          ...taskDetails
        };
      })
    );

    res.json({
      success: true,
      stats: {
        totalTasks,
        activeTasks,
        totalAssignments,
        completedAssignments,
        completionRate: totalAssignments > 0 ? 
          (completedAssignments / totalAssignments * 100).toFixed(2) : 0,
        recentCompletions,
        topTasks: topTasksWithDetails
      }
    });
  } catch (error) {
    console.error("Get task statistics error:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to get task statistics"
    });
  }
};

/**
 * Get regular (non-combo) tasks assigned to current user
 */
export const getUserRegularTasks = async (req, res) => {
  try {
    const userId = req.user.id; // From auth middleware

    const tasks = await prisma.taskAssignment.findMany({
      where: {
        userId,
        isCompleted: false,
        isComboTask: false
      },
      include: {
        task: {
          select: {
            appName: true,
            appImage: true,
            appReview: true,
            appProfit: true,
            createdAt: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      count: tasks.length,
      tasks: tasks.map(assignment => ({
        ...assignment.task,
        assignmentId: assignment.id
      }))
    });
  } catch (error) {
    console.error("Get user regular tasks error:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to get regular tasks"
    });
  }
};








export const getAppSettings = async (req, res) => {
  try {
    let settings = await prisma.appSettings.findUnique({
      where: { id: 1 }
    });

    // If settings don't exist, create defaults
    if (!settings) {
      settings = await prisma.appSettings.create({
        data: {
          id: 1,
          totalSignupTasks: 40,
          signupBonus: 10,
          totalSignupBonus: 12,
          bitcoinWallet: null,
          ethereumWallet: null,
          usdtWallet: null
        }
      });
    }

    res.json(settings);
  } catch (error) {
    console.error("Get app settings error:", error);
    res.status(500).json({ message: "Failed to get app settings" });
  }
};

// Update settings
export const updateAppSettings = async (req, res) => {
  try {
    const {
      totalSignupTasks,
      signupBonus,
      totalSignupBonus,
      bitcoinWallet,
      ethereumWallet,
      usdtWallet
    } = req.body;

    // Validate required fields
    if (!totalSignupTasks || !signupBonus || !totalSignupBonus) {
      return res.status(400).json({ message: "Required fields are missing" });
    }

    const updatedSettings = await prisma.appSettings.upsert({
      where: { id: 1 },
      update: {
        totalSignupTasks: parseInt(totalSignupTasks),
        signupBonus: parseFloat(signupBonus),
        totalSignupBonus: parseInt(totalSignupBonus),
        bitcoinWallet: bitcoinWallet || null,
        ethereumWallet: ethereumWallet || null,
        usdtWallet: usdtWallet || null
      },
      create: {
        id: 1,
        totalSignupTasks: parseInt(totalSignupTasks),
        signupBonus: parseFloat(signupBonus),
        totalSignupBonus: parseInt(totalSignupBonus),
        bitcoinWallet: bitcoinWallet || null,
        ethereumWallet: ethereumWallet || null,
        usdtWallet: usdtWallet || null
      }
    });

    res.json({
      message: "Settings updated successfully",
      settings: updatedSettings
    });
  } catch (error) {
    console.error("Update app settings error:", error);
    res.status(500).json({ message: "Failed to update app settings" });
  }
};
