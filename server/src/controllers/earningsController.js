import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Helper to reset daily tasks if needed
const resetDailyTasksIfNeeded = async (userId) => {
  const profile = await prisma.profile.findUnique({
    where: { userId }
  });

  if (!profile) return;

  const now = new Date();
  const lastReset = profile.lastTaskReset || new Date(0);
  const shouldReset = lastReset.getDate() !== now.getDate() || 
                     lastReset.getMonth() !== now.getMonth() || 
                     lastReset.getFullYear() !== now.getFullYear();

  if (shouldReset) {
    await prisma.profile.update({
      where: { userId },
      data: {
        dailyTasksCompleted: 0,
        lastTaskReset: now
      }
    });
  }
};

// Get user's available tasks
export const getUserTasks = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Check VIP level - no tasks for VIP 0
    const profile = await prisma.profile.findUnique({
      where: { userId },
      include: { vipLevelData: true }
    });

    if (!profile || profile.vipLevel === 0) {
      return res.json({
        success: true,
        tasks: [],
        message: "No tasks available for your VIP level"
      });
    }

    // Reset daily tasks if needed
    await resetDailyTasksIfNeeded(userId);

    // Get current assignments
    const currentAssignments = await prisma.taskAssignment.findMany({
      where: {
        userId,
        isCompleted: false
      },
      include: {
        task: true
      }
    });

    // If user has reached daily limit
    if (currentAssignments.length >= profile.dailyTasksLimit) {
      return res.json({
        success: true,
        tasks: currentAssignments.map(a => a.task),
        message: "You've reached your daily task limit"
      });
    }

    // Get all active tasks user hasn't completed today
    const availableTasks = await prisma.task.findMany({
      where: {
        isActive: true,
        NOT: {
          assignments: {
            some: {
              userId,
              createdAt: {
                gte: new Date(new Date().setHours(0, 0, 0, 0))
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Randomly select tasks to assign (up to daily limit)
    const tasksToAssign = availableTasks
      .sort(() => 0.5 - Math.random())
      .slice(0, profile.dailyTasksLimit - currentAssignments.length);

    // Create new assignments
    const newAssignments = await Promise.all(
      tasksToAssign.map(task => 
        prisma.taskAssignment.create({
          data: {
            taskId: task.id,
            userId
          },
          include: {
            task: true
          }
        })
      )
    );

    // Combine existing and new assignments
    const allTasks = [
      ...currentAssignments.map(a => a.task),
      ...newAssignments.map(a => a.task)
    ];

    res.json({
      success: true,
      tasks: allTasks,
      remainingTasks: profile.dailyTasksLimit - allTasks.length
    });
  } catch (error) {
    console.error("Get user tasks error:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to get tasks"
    });
  }
};

// Complete a task
export const completeTask = async (req, res) => {
  try {
    const userId = req.user.id;
    const { taskId } = req.body;

    // Verify task assignment exists and isn't completed
    const assignment = await prisma.taskAssignment.findFirst({
      where: {
        taskId,
        userId,
        isCompleted: false
      },
      include: {
        task: true
      }
    });

    if (!assignment) {
      return res.status(400).json({
        success: false,
        message: "Task not found or already completed"
      });
    }

    // Update profile and complete task in transaction
const [updatedProfile, completedAssignment, historyRecord] = await prisma.$transaction([
      prisma.profile.update({
        where: { userId },
        data: {
          dailyTasksCompleted: { increment: 1 }
        }
      }),
      prisma.taskAssignment.update({
        where: { id: assignment.id },
        data: {
          isCompleted: true,
          completedAt: new Date()
        },
        include: {
          task: true
        }
      }),
      prisma.user.update({
        where: { id: userId },
        data: {
          profitBalance: { increment: assignment.task.appProfit }
        }
      }),
       prisma.taskHistory.create({
    data: {
      userId,
      taskId,
      taskName: assignment.task.appName,
      profitEarned: assignment.task.appProfit
    }
  })
    ]);

    res.json({
      success: true,
      message: "Task completed successfully",
      profitEarned: assignment.task.appProfit,
      tasksRemaining: updatedProfile.dailyTasksLimit - updatedProfile.dailyTasksCompleted
    });
  } catch (error) {
    console.error("Complete task error:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to complete task"
    });
  }
};



// Admin: Get user's task history
export const getUserTaskHistory = async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit, page = 1 } = req.query;
    const perPage = limit ? parseInt(limit) : 20;
    const skip = (page - 1) * perPage;

    // Verify user exists
    const userExists = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true }
    });

    if (!userExists) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    const [history, total] = await Promise.all([
      prisma.taskHistory.findMany({
        where: { userId },
        include: {
          task: {
            select: {
              appImage: true
            }
          }
        },
        orderBy: { completedAt: 'desc' },
        skip,
        take: perPage
      }),
      prisma.taskHistory.count({
        where: { userId }
      })
    ]);

    res.json({
      success: true,
      history,
      pagination: {
        total,
        pages: Math.ceil(total / perPage),
        currentPage: parseInt(page),
        perPage
      }
    });
  } catch (error) {
    console.error("Get user task history error:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to get task history"
    });
  }
};

// Admin: Get user task statistics
export const getUserTaskStats = async (req, res) => {
  try {
    const { userId } = req.params;

    // Get user profile with VIP info
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: {
          include: {
            vipLevelData: true
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Calculate time until reset
    const now = new Date();
    const resetTime = new Date(now);
    resetTime.setHours(24, 0, 0, 0); // Next midnight
    const timeUntilReset = resetTime - now;

    // Get task stats
    const [completedToday, pendingTasks, totalEarned] = await Promise.all([
      prisma.taskHistory.count({
        where: {
          userId,
          completedAt: {
            gte: new Date(now.setHours(0, 0, 0, 0))
          }
        }
      }),
      prisma.taskAssignment.count({
        where: {
          userId,
          isCompleted: false
        }
      }),
      prisma.taskHistory.aggregate({
        where: { userId },
        _sum: { profitEarned: true }
      })
    ]);

    res.json({
      success: true,
      stats: {
        user: {
          username: user.username,
          email: user.email,
          vipLevel: user.profile.vipLevelData?.level || 0
        },
        tasks: {
          dailyLimit: user.profile.dailyTasksLimit,
          completedToday,
          pendingTasks,
          timeUntilReset, // in milliseconds
          totalEarned: totalEarned._sum.profitEarned || 0
        }
      }
    });
  } catch (error) {
    console.error("Get user task stats error:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to get user task stats"
    });
  }
};