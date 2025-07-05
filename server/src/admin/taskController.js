import { PrismaClient } from "@prisma/client";
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

// Configure multer for task images
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit for task images
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
}).single('appImage');

// Helper function to upload to Cloudinary
const uploadToCloudinary = (buffer, originalname) => {
  return new Promise((resolve, reject) => {
    const uploadOptions = {
      folder: 'task-images',
      public_id: `task-${uuidv4()}`,
      resource_type: 'image',
      format: 'jpg',
      quality: 'auto',
      fetch_format: 'auto',
      transformation: [
        { width: 300, height: 300, crop: 'fill' },
        { quality: 'auto' }
      ]
    };

    cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    ).end(buffer);
  });
};

// Helper function to check if user needs task reset
const checkAndResetUserTasks = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { profile: true }
  });

  if (!user?.profile?.lastTaskReset) {
    return false;
  }

  const now = new Date();
  const lastReset = new Date(user.profile.lastTaskReset);
  const hoursDiff = (now - lastReset) / (1000 * 60 * 60);

  if (hoursDiff >= 24) {
    // Reset user tasks
    await prisma.$transaction([
      prisma.profile.update({
        where: { userId },
        data: {
          dailyTasksCompleted: 0,
          lastTaskReset: now
        }
      }),
      prisma.taskAssignment.deleteMany({
        where: { userId }
      })
    ]);
    return true;
  }
  return false;
};

// Helper function to assign tasks to user
const assignTasksToUser = async (userId) => {
  const profile = await prisma.profile.findUnique({
    where: { userId }
  });

  if (!profile) return;

  const limit = profile.dailyTasksLimit;
  
  // Get available tasks
  const availableTasks = await prisma.task.findMany({
    where: { isActive: true },
    orderBy: { createdAt: 'desc' },
    take: limit
  });

  // Assign tasks to user
  const assignments = availableTasks.map(task => ({
    userId,
    taskId: task.id,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours from now
  }));

  await prisma.taskAssignment.createMany({
    data: assignments,
    skipDuplicates: true
  });
};

// ========== ADMIN CONTROLLERS ==========

// Create Task (Admin)
export const createTask = async (req, res) => {
  // Check if user is admin
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: "Access denied. Admin only." });
  }

  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ message: err.message });
    }

    try {
      const { appName, appReview, appProfit } = req.body;

      if (!appName || !appReview || !appProfit || !req.file) {
        return res.status(400).json({ message: "All fields are required including app image" });
      }

      // Upload image to Cloudinary
      const uploadResult = await uploadToCloudinary(req.file.buffer, req.file.originalname);

      const task = await prisma.task.create({
        data: {
          appName,
          appImage: uploadResult.secure_url,
          appReview,
          appProfit: parseFloat(appProfit)
        }
      });

      res.status(201).json({
        message: "Task created successfully",
        task
      });

    } catch (error) {
      console.error("Create task error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
};

// Get All Tasks (Admin)
export const getAllTasks = async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: "Access denied. Admin only." });
  }

  try {
    const tasks = await prisma.task.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: {
            taskAssignments: true,
            userTasks: true
          }
        }
      }
    });

    res.json({
      message: "Tasks retrieved successfully",
      tasks: tasks.map(task => ({
        ...task,
        assignedCount: task._count.taskAssignments,
        completedCount: task._count.userTasks
      }))
    });

  } catch (error) {
    console.error("Get all tasks error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Update Task (Admin)
export const updateTask = async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: "Access denied. Admin only." });
  }

  upload(req, res, async (err) => {
    if (err && !(err instanceof multer.MulterError && err.code === 'LIMIT_UNEXPECTED_FILE')) {
      return res.status(400).json({ message: err.message });
    }

    try {
      const { taskId } = req.params;
      const { appName, appReview, appProfit, isActive } = req.body;

      const updateData = {};
      if (appName) updateData.appName = appName;
      if (appReview) updateData.appReview = appReview;
      if (appProfit) updateData.appProfit = parseFloat(appProfit);
      if (isActive !== undefined) updateData.isActive = isActive === 'true';

      // Handle image update
      if (req.file) {
        const uploadResult = await uploadToCloudinary(req.file.buffer, req.file.originalname);
        updateData.appImage = uploadResult.secure_url;
      }

      const updatedTask = await prisma.task.update({
        where: { id: taskId },
        data: updateData
      });

      res.json({
        message: "Task updated successfully",
        task: updatedTask
      });

    } catch (error) {
      console.error("Update task error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
};

// Delete Task (Admin)
export const deleteTask = async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: "Access denied. Admin only." });
  }

  try {
    const { taskId } = req.params;

    await prisma.task.delete({
      where: { id: taskId }
    });

    res.json({ message: "Task deleted successfully" });

  } catch (error) {
    console.error("Delete task error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Reset Tasks for All Users (Admin)
export const resetAllUserTasks = async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: "Access denied. Admin only." });
  }

  try {
    await prisma.$transaction([
      prisma.taskAssignment.deleteMany({}),
      prisma.profile.updateMany({
        data: {
          dailyTasksCompleted: 0,
          lastTaskReset: new Date()
        }
      })
    ]);

    res.json({ message: "All user tasks reset successfully" });

  } catch (error) {
    console.error("Reset all user tasks error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Reset Tasks for Specific User (Admin)
export const resetUserTasks = async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: "Access denied. Admin only." });
  }

  try {
    const { userId } = req.params;

    await prisma.$transaction([
      prisma.taskAssignment.deleteMany({
        where: { userId }
      }),
      prisma.profile.update({
        where: { userId },
        data: {
          dailyTasksCompleted: 0,
          lastTaskReset: new Date()
        }
      })
    ]);

    res.json({ message: "User tasks reset successfully" });

  } catch (error) {
    console.error("Reset user tasks error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Set Task Amount for Specific User (Admin)
export const setUserTaskAmount = async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: "Access denied. Admin only." });
  }

  try {
    const { userId } = req.params;
    const { taskAmount } = req.body;

    if (!taskAmount || taskAmount < 0) {
      return res.status(400).json({ message: "Valid task amount is required" });
    }

    await prisma.profile.update({
      where: { userId },
      data: { dailyTasksLimit: parseInt(taskAmount) }
    });

    res.json({ message: "User task amount updated successfully" });

  } catch (error) {
    console.error("Set user task amount error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get User Task History (Admin)
export const getUserTaskHistory = async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: "Access denied. Admin only." });
  }

  try {
    const { userId } = req.params;
    const { status, page = 1, limit = 10 } = req.query;

    const skip = (page - 1) * limit;
    const where = { userId };
    if (status) where.status = status;

    const [userTasks, totalCount] = await Promise.all([
      prisma.userTask.findMany({
        where,
        include: {
          task: true,
          user: {
            select: {
              username: true,
              email: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: parseInt(skip),
        take: parseInt(limit)
      }),
      prisma.userTask.count({ where })
    ]);

    res.json({
      message: "User task history retrieved successfully",
      tasks: userTasks,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      }
    });

  } catch (error) {
    console.error("Get user task history error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get All Users Task Statistics (Admin)
export const getAllUsersTaskStats = async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: "Access denied. Admin only." });
  }

  try {
    const users = await prisma.user.findMany({
      where: { role: 'user' },
      include: {
        profile: true,
        _count: {
          select: {
            userTasks: true
          }
        }
      }
    });

    const stats = users.map(user => ({
      userId: user.id,
      username: user.username,
      email: user.email,
      dailyTasksCompleted: user.profile?.dailyTasksCompleted || 0,
      dailyTasksLimit: user.profile?.dailyTasksLimit || 5,
      totalTasksCompleted: user._count.userTasks,
      lastTaskReset: user.profile?.lastTaskReset
    }));

    res.json({
      message: "Users task statistics retrieved successfully",
      stats
    });

  } catch (error) {
    console.error("Get all users task stats error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ========== USER CONTROLLERS ==========

// Get User Tasks
export const getUserTasks = async (req, res) => {
  try {
    const userId = req.user.id;

    // Check and reset tasks if 24 hours have passed
    const wasReset = await checkAndResetUserTasks(userId);
    
    // Get user's current task assignments
    let assignments = await prisma.taskAssignment.findMany({
      where: { 
        userId,
        expiresAt: { gte: new Date() }
      },
      include: {
        task: true
      }
    });

    // If no assignments or tasks were reset, assign new tasks
    if (assignments.length === 0 || wasReset) {
      await assignTasksToUser(userId);
      
      assignments = await prisma.taskAssignment.findMany({
        where: { 
          userId,
          expiresAt: { gte: new Date() }
        },
        include: {
          task: true
        }
      });
    }

    // Get user's completed tasks for today
    const completedTasks = await prisma.userTask.findMany({
      where: {
        userId,
        createdAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0))
        }
      },
      include: {
        task: true
      }
    });

    // Get user profile for task stats
    const profile = await prisma.profile.findUnique({
      where: { userId }
    });

    res.json({
      message: "User tasks retrieved successfully",
      availableTasks: assignments.map(assignment => ({
        assignmentId: assignment.id,
        task: assignment.task,
        assignedAt: assignment.assignedAt,
        expiresAt: assignment.expiresAt,
        isCompleted: assignment.isCompleted
      })),
      completedTasks,
      taskStats: {
        dailyCompleted: profile?.dailyTasksCompleted || 0,
        dailyLimit: profile?.dailyTasksLimit || 5,
        remaining: (profile?.dailyTasksLimit || 5) - (profile?.dailyTasksCompleted || 0)
      }
    });

  } catch (error) {
    console.error("Get user tasks error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Complete Task
export const completeTask = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const userId = req.user.id;

    // Check if assignment exists and belongs to user
    const assignment = await prisma.taskAssignment.findFirst({
      where: {
        id: assignmentId,
        userId,
        isCompleted: false,
        expiresAt: { gte: new Date() }
      },
      include: {
        task: true
      }
    });

    if (!assignment) {
      return res.status(404).json({ message: "Task assignment not found or already completed" });
    }

    // Check if user has reached daily limit
    const profile = await prisma.profile.findUnique({
      where: { userId }
    });

    if (profile.dailyTasksCompleted >= profile.dailyTasksLimit) {
      return res.status(400).json({ message: "Daily task limit reached" });
    }

    // Complete the task in a transaction
    await prisma.$transaction([
      // Mark assignment as completed
      prisma.taskAssignment.update({
        where: { id: assignmentId },
        data: {
          isCompleted: true,
          completedAt: new Date()
        }
      }),
      // Create user task record
      prisma.userTask.create({
        data: {
          userId,
          taskId: assignment.task.id,
          status: 'completed',
          completedAt: new Date(),
          profit: assignment.task.appProfit
        }
      }),
      // Update user's profit balance
      prisma.user.update({
        where: { id: userId },
        data: {
          profitBalance: {
            increment: assignment.task.appProfit
          }
        }
      }),
      // Update profile task count
      prisma.profile.update({
        where: { userId },
        data: {
          dailyTasksCompleted: {
            increment: 1
          }
        }
      }),
      // Create earnings history record
      prisma.earningsHistory.create({
        data: {
          userId,
          amount: assignment.task.appProfit,
          type: 'task_completion',
          taskId: assignment.task.id
        }
      })
    ]);

    res.json({
      message: "Task completed successfully",
      profit: assignment.task.appProfit,
      taskName: assignment.task.appName
    });

  } catch (error) {
    console.error("Complete task error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get User Task History
export const getUserTaskHistorys = async (req, res) => {
  try {
    const userId = req.user.id;
    const { status, page = 1, limit = 10 } = req.query;

    const skip = (page - 1) * limit;
    const where = { userId };
    if (status) where.status = status;

    const [userTasks, totalCount] = await Promise.all([
      prisma.userTask.findMany({
        where,
        include: {
          task: true
        },
        orderBy: { createdAt: 'desc' },
        skip: parseInt(skip),
        take: parseInt(limit)
      }),
      prisma.userTask.count({ where })
    ]);

    res.json({
      message: "Task history retrieved successfully",
      tasks: userTasks,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      }
    });

  } catch (error) {
    console.error("Get user task history error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get User Earnings from Tasks
export const getUserTaskEarnings = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get task earnings
    const taskEarnings = await prisma.earningsHistory.findMany({
      where: {
        userId,
        type: 'task_completion'
      },
      include: {
        task: {
          select: {
            appName: true,
            appImage: true
          }
        }
      },
      orderBy: { date: 'desc' }
    });

    // Calculate total earnings
    const totalEarnings = taskEarnings.reduce((sum, earning) => sum + earning.amount, 0);

    // Get today's earnings
    const todayStart = new Date(new Date().setHours(0, 0, 0, 0));
    const todayEarnings = taskEarnings
      .filter(earning => earning.date >= todayStart)
      .reduce((sum, earning) => sum + earning.amount, 0);

    res.json({
      message: "Task earnings retrieved successfully",
      earnings: taskEarnings,
      totalEarnings,
      todayEarnings
    });

  } catch (error) {
    console.error("Get user task earnings error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};