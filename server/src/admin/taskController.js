// taskController.js
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { v2 as cloudinary } from 'cloudinary';

// ============================================
// ADMIN TASK MANAGEMENT
// ============================================

// Create a new app review task
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure multer for memory storage (since we're uploading to Cloudinary)
const storage = multer.memoryStorage();

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    // Accept only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
}).single('appImage'); // Changed from 'proofImage' to 'appImage'

// Helper function to upload to Cloudinary
const uploadToCloudinary = (buffer, originalname) => {
  return new Promise((resolve, reject) => {
    const uploadOptions = {
      folder: 'app-reviews', // Organize uploads in a folder for app reviews
      public_id: `app-${uuidv4()}`, // Custom public ID
      resource_type: 'image',
      format: 'jpg', // Convert to jpg for consistency
      quality: 'auto', // Automatic quality optimization
      fetch_format: 'auto' // Automatic format optimization
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

// Wrapper for async middleware
const asyncHandler = fn => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Create a new app review task with image upload
export const createAppReview = asyncHandler(async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ 
        success: false,
        message: err instanceof multer.MulterError 
          ? err.message 
          : 'File upload failed'
      });
    }

    const { appName, appReview, appProfit, totalTasks = 100 } = req.body;

    // Validate required fields
    if (!appName || !appReview || !appProfit || !req.file) {
      return res.status(400).json({ 
        success: false, 
        message: "All fields are required (appName, appImage file, appReview, appProfit)" 
      });
    }

    // Validate appProfit is a valid number
    const profitAmount = parseFloat(appProfit);
    if (isNaN(profitAmount) || profitAmount <= 0) {
      return res.status(400).json({ 
        success: false, 
        message: "App profit must be a positive number" 
      });
    }

    let appImageUrl = null;
    
    // Upload image to Cloudinary
    try {
      const uploadResult = await uploadToCloudinary(req.file.buffer, req.file.originalname);
      appImageUrl = uploadResult.secure_url; // Use secure HTTPS URL
      
      console.log('App image uploaded to Cloudinary:', {
        url: uploadResult.secure_url,
        publicId: uploadResult.public_id
      });
    } catch (uploadError) {
      console.error('Cloudinary upload error:', uploadError);
      return res.status(500).json({ 
        success: false,
        message: "Failed to upload app image. Please try again." 
      });
    }

    // Create app review record
    const newAppReview = await prisma.appReview.create({
      data: {
        appName,
        appImage: appImageUrl, // Store Cloudinary URL
        appReview,
        appProfit: profitAmount,
        totalTasks: parseInt(totalTasks),
        isActive: true
      }
    });

    res.status(201).json({
      success: true,
      message: "App review task created successfully",
      data: {
        ...newAppReview,
        appImageUrl: appImageUrl // Return the URL for confirmation
      }
    });
  });
});

// Get all app reviews for admin
export const getAppReviews = async (req, res) => {
  try {
    const { isActive } = req.query;
    
    const appReviews = await prisma.appReview.findMany({
      where: {
        isActive: isActive !== undefined ? isActive === 'true' : undefined
      },
      include: {
        _count: {
          select: {
            tasks: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      data: appReviews
    });
  } catch (error) {
    console.error("Get app reviews error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to get app reviews" 
    });
  }
};

// Update app review
export const updateAppReview = asyncHandler(async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ 
        success: false,
        message: err instanceof multer.MulterError 
          ? err.message 
          : 'File upload failed'
      });
    }

    const { appReviewId } = req.params;
    const { appName, appReview, appProfit, totalTasks, isActive } = req.body;

    const updateData = {};
    if (appName !== undefined) updateData.appName = appName;
    if (appReview !== undefined) updateData.appReview = appReview;
    if (appProfit !== undefined) {
      const profitAmount = parseFloat(appProfit);
      if (isNaN(profitAmount) || profitAmount <= 0) {
        return res.status(400).json({ 
          success: false, 
          message: "App profit must be a positive number" 
        });
      }
      updateData.appProfit = profitAmount;
    }
    if (totalTasks !== undefined) updateData.totalTasks = parseInt(totalTasks);
    if (isActive !== undefined) updateData.isActive = isActive;

    // Handle image upload if new image is provided
    if (req.file) {
      try {
        const uploadResult = await uploadToCloudinary(req.file.buffer, req.file.originalname);
        updateData.appImage = uploadResult.secure_url;
        
        console.log('App image updated on Cloudinary:', {
          url: uploadResult.secure_url,
          publicId: uploadResult.public_id
        });
      } catch (uploadError) {
        console.error('Cloudinary upload error:', uploadError);
        return res.status(500).json({ 
          success: false,
          message: "Failed to upload app image. Please try again." 
        });
      }
    }

    const updatedAppReview = await prisma.appReview.update({
      where: { id: appReviewId },
      data: updateData,
      include: {
        _count: {
          select: {
            tasks: true
          }
        }
      }
    });

    res.json({
      success: true,
      message: "App review updated successfully",
      data: updatedAppReview
    });
  });
});


// Delete app review
export const deleteAppReview = async (req, res) => {
  try {
    const { appReviewId } = req.params;

    // Delete all associated tasks first
    await prisma.appReviewTask.deleteMany({
      where: { appReviewId }
    });

    // Delete the app review
    await prisma.appReview.delete({
      where: { id: appReviewId }
    });

    res.json({
      success: true,
      message: "App review deleted successfully"
    });
  } catch (error) {
    console.error("Delete app review error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to delete app review" 
    });
  }
};

// ============================================
// USER TASK MANAGEMENT
// ============================================

// Get available tasks for user
export const getUserTasks = async (req, res) => {
  try {
    const userId = req.user.id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get user's tasks for today
    const userTasks = await prisma.appReviewTask.findMany({
      where: {
        userId,
        createdAt: {
          gte: today
        }
      },
      include: {
        appReview: {
          select: {
            id: true,
            appName: true,
            appImage: true,
            appReview: true,
            appProfit: true,
            isActive: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Get user's daily task limit (default 5, can be customized per user)
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true }
    });

    const dailyTaskLimit = user?.profile?.dailyTasksLimit || 5;
    const completedTasks = userTasks.filter(task => task.status === 'completed').length;
    const pendingTasks = userTasks.filter(task => task.status === 'pending').length;

    res.json({
      success: true,
      data: {
        tasks: userTasks,
        dailyTaskLimit,
        completedTasks,
        pendingTasks,
        canGetNewTasks: userTasks.length < dailyTaskLimit
      }
    });
  } catch (error) {
    console.error("Get user tasks error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to get user tasks" 
    });
  }
};

// Assign random tasks to user
export const assignTasksToUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get user's daily task limit
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true }
    });

    const dailyTaskLimit = user?.profile?.dailyTasksLimit || 5;

    // Check how many tasks user already has today
    const existingTasks = await prisma.appReviewTask.count({
      where: {
        userId,
        createdAt: {
          gte: today
        }
      }
    });

    if (existingTasks >= dailyTaskLimit) {
      return res.status(400).json({
        success: false,
        message: `You have already reached your daily task limit of ${dailyTaskLimit} tasks`
      });
    }

    // Get available app reviews that user hasn't done today
    const existingTaskAppIds = await prisma.appReviewTask.findMany({
      where: {
        userId,
        createdAt: {
          gte: today
        }
      },
      select: { appReviewId: true }
    });

    const excludeAppIds = existingTaskAppIds.map(task => task.appReviewId);

    // Get active app reviews excluding ones user already has
    const availableAppReviews = await prisma.appReview.findMany({
      where: {
        isActive: true,
        id: {
          notIn: excludeAppIds
        },
        OR: [
          { totalTasks: { gt: prisma.appReview.fields.completedTasks } },
          { totalTasks: 0 } // Unlimited tasks
        ]
      },
      orderBy: { createdAt: 'desc' }
    });

    if (availableAppReviews.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No available tasks at the moment"
      });
    }

    // Calculate how many new tasks to assign
    const tasksToAssign = Math.min(
      dailyTaskLimit - existingTasks,
      availableAppReviews.length
    );

    // Randomly select tasks
    const shuffled = availableAppReviews.sort(() => 0.5 - Math.random());
    const selectedTasks = shuffled.slice(0, tasksToAssign);

    // Create task assignments
    const taskAssignments = selectedTasks.map(appReview => ({
      userId,
      appReviewId: appReview.id,
      status: 'pending'
    }));

    const createdTasks = await prisma.appReviewTask.createMany({
      data: taskAssignments
    });

    // Get the created tasks with app review details
    const newTasks = await prisma.appReviewTask.findMany({
      where: {
        userId,
        createdAt: {
          gte: today
        }
      },
      include: {
        appReview: {
          select: {
            id: true,
            appName: true,
            appImage: true,
            appReview: true,
            appProfit: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      message: `${tasksToAssign} tasks assigned successfully`,
      data: {
        assignedTasks: tasksToAssign,
        tasks: newTasks
      }
    });
  } catch (error) {
    console.error("Assign tasks error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to assign tasks" 
    });
  }
};

// Complete a task
export const completeTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const userId = req.user.id;

    // Find the task
    const task = await prisma.appReviewTask.findFirst({
      where: {
        id: taskId,
        userId,
        status: 'pending'
      },
      include: {
        appReview: true
      }
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found or already completed"
      });
    }

    // Check if app review is still active
    if (!task.appReview.isActive) {
      return res.status(400).json({
        success: false,
        message: "This task is no longer available"
      });
    }

    const profit = task.appReview.appProfit;

    // Update task status, user profit balance, and earnings history in a transaction
    await prisma.$transaction(async (tx) => {
      // Mark task as completed
      await tx.appReviewTask.update({
        where: { id: taskId },
        data: {
          status: 'completed',
          completedAt: new Date()
        }
      });

      // Add profit to user's profit balance
      await tx.user.update({
        where: { id: userId },
        data: {
          profitBalance: {
            increment: profit
          }
        }
      });

      // Record in earnings history
      await tx.earningsHistory.create({
        data: {
          userId,
          amount: profit,
          type: 'app_review',
          taskId
        }
      });

      // Increment completed tasks count for the app review
      await tx.appReview.update({
        where: { id: task.appReviewId },
        data: {
          completedTasks: {
            increment: 1
          }
        }
      });

      // Update user's daily tasks completed count
      await tx.profile.update({
        where: { userId },
        data: {
          dailyTasksCompleted: {
            increment: 1
          }
        }
      });
    });

    res.json({
      success: true,
      message: "Task completed successfully",
      data: {
        profit,
        taskId,
        appName: task.appReview.appName
      }
    });
  } catch (error) {
    console.error("Complete task error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to complete task" 
    });
  }
};

// Get task statistics for user
export const getTaskStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get today's task stats
    const todayTasks = await prisma.appReviewTask.count({
      where: {
        userId,
        createdAt: {
          gte: today
        }
      }
    });

    const todayCompleted = await prisma.appReviewTask.count({
      where: {
        userId,
        status: 'completed',
        completedAt: {
          gte: today
        }
      }
    });

    // Get total task stats
    const totalCompleted = await prisma.appReviewTask.count({
      where: {
        userId,
        status: 'completed'
      }
    });

    // Get total earnings from tasks
    const totalEarnings = await prisma.earningsHistory.aggregate({
      where: {
        userId,
        type: 'app_review'
      },
      _sum: {
        amount: true
      }
    });

    // Get user's daily task limit
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true }
    });

    const dailyTaskLimit = user?.profile?.dailyTasksLimit || 5;

    res.json({
      success: true,
      data: {
        today: {
          assigned: todayTasks,
          completed: todayCompleted,
          pending: todayTasks - todayCompleted,
          limit: dailyTaskLimit,
          canGetMore: todayTasks < dailyTaskLimit
        },
        total: {
          completed: totalCompleted,
          earnings: totalEarnings._sum.amount || 0
        }
      }
    });
  } catch (error) {
    console.error("Get task stats error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to get task statistics" 
    });
  }
};

// ============================================
// ADMIN TASK ANALYTICS
// ============================================

// Get task completion analytics for admin
export const getTaskAnalytics = async (req, res) => {
  try {
    const { period = '7days' } = req.query;
    
    let startDate = new Date();
    switch (period) {
      case '24hours':
        startDate.setHours(startDate.getHours() - 24);
        break;
      case '7days':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30days':
        startDate.setDate(startDate.getDate() - 30);
        break;
      default:
        startDate.setDate(startDate.getDate() - 7);
    }

    // Get task completion stats
    const completedTasks = await prisma.appReviewTask.count({
      where: {
        status: 'completed',
        completedAt: {
          gte: startDate
        }
      }
    });

    const pendingTasks = await prisma.appReviewTask.count({
      where: {
        status: 'pending',
        createdAt: {
          gte: startDate
        }
      }
    });

    // Get top performing apps
    const topApps = await prisma.appReview.findMany({
      where: {
        tasks: {
          some: {
            completedAt: {
              gte: startDate
            }
          }
        }
      },
      include: {
        _count: {
          select: {
            tasks: {
              where: {
                status: 'completed',
                completedAt: {
                  gte: startDate
                }
              }
            }
          }
        }
      },
      orderBy: {
        tasks: {
          _count: 'desc'
        }
      },
      take: 10
    });

    // Get total earnings distributed
    const totalEarnings = await prisma.earningsHistory.aggregate({
      where: {
        type: 'app_review',
        date: {
          gte: startDate
        }
      },
      _sum: {
        amount: true
      }
    });

    res.json({
      success: true,
      data: {
        period,
        completedTasks,
        pendingTasks,
        totalEarnings: totalEarnings._sum.amount || 0,
        topApps: topApps.map(app => ({
          id: app.id,
          appName: app.appName,
          appProfit: app.appProfit,
          completedTasks: app._count.tasks
        }))
      }
    });
  } catch (error) {
    console.error("Get task analytics error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to get task analytics" 
    });
  }
};

// ============================================
// ADMIN TASK RESET FUNCTIONALITY
// ============================================

// Reset tasks for all users (admin only)
export const resetAllUserTasks = async (req, res) => {
  try {
    const { resetType = 'pending' } = req.body; // 'pending' or 'all'

    let deletedTasksCount = 0;
    let updatedUsersCount = 0;

    await prisma.$transaction(async (tx) => {
      if (resetType === 'all') {
        // Delete all tasks (both pending and completed)
        const deletedTasks = await tx.appReviewTask.deleteMany({});
        deletedTasksCount = deletedTasks.count;
        
        // Reset app review completed tasks count
        await tx.appReview.updateMany({
          data: {
            completedTasks: 0
          }
        });
      } else {
        // Delete only pending tasks
        const deletedTasks = await tx.appReviewTask.deleteMany({
          where: {
            status: 'pending'
          }
        });
        deletedTasksCount = deletedTasks.count;
      }

      // Reset daily tasks completed count for all users
      const updatedUsers = await tx.profile.updateMany({
        data: {
          dailyTasksCompleted: 0,
          lastTaskReset: new Date()
        }
      });
      updatedUsersCount = updatedUsers.count;
    });

    res.json({
      success: true,
      message: `Tasks reset successfully for all users`,
      data: {
        resetType,
        deletedTasksCount,
        updatedUsersCount,
        resetTime: new Date()
      }
    });
  } catch (error) {
    console.error("Reset all user tasks error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to reset tasks for all users" 
    });
  }
};

// Reset tasks for specific user (admin only)
export const resetUserTasks = async (req, res) => {
  try {
    const { userId } = req.params;
    const { resetType = 'pending' } = req.body; // 'pending' or 'all'

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

    let deletedTasksCount = 0;

    await prisma.$transaction(async (tx) => {
      if (resetType === 'all') {
        // Delete all tasks for this user (both pending and completed)
        const deletedTasks = await tx.appReviewTask.deleteMany({
          where: { userId }
        });
        deletedTasksCount = deletedTasks.count;
        
        // Update app review completed tasks count for tasks that were completed by this user
        // This requires a more complex query, so we'll skip it for now
        // In a real scenario, you might want to track this differently
      } else {
        // Delete only pending tasks for this user
        const deletedTasks = await tx.appReviewTask.deleteMany({
          where: {
            userId,
            status: 'pending'
          }
        });
        deletedTasksCount = deletedTasks.count;
      }

      // Reset daily tasks completed count for this user
      await tx.profile.upsert({
        where: { userId },
        update: {
          dailyTasksCompleted: 0,
          lastTaskReset: new Date()
        },
        create: {
          userId,
          dailyTasksCompleted: 0,
          lastTaskReset: new Date(),
          vipLevel: 0,
          totalInvested: 0,
          dailyTasksLimit: 5
        }
      });
    });

    res.json({
      success: true,
      message: `Tasks reset successfully for user ${user.username || user.email}`,
      data: {
        userId,
        userName: user.username || user.email,
        resetType,
        deletedTasksCount,
        resetTime: new Date()
      }
    });
  } catch (error) {
    console.error("Reset user tasks error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to reset tasks for user" 
    });
  }
};

// Get users with pending tasks (admin only)
// Get users with pending tasks (admin only)
export const getUsersWithPendingTasks = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const usersWithTasks = await prisma.user.findMany({
      where: {
        appReviewTasks: {  // Changed from 'tasks' to 'appReviewTasks'
          some: {
            status: 'pending',
            createdAt: {
              gte: today
            }
          }
        }
      },
      include: {
        profile: true,
        _count: {
          select: {
            appReviewTasks: {  // Changed from 'tasks' to 'appReviewTasks'
              where: {
                status: 'pending',
                createdAt: {
                  gte: today
                }
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const usersData = usersWithTasks.map(user => ({
      id: user.id,
      username: user.username,
      email: user.email,
      pendingTasks: user._count.appReviewTasks,  // Changed from 'tasks' to 'appReviewTasks'
      dailyTasksLimit: user.profile?.dailyTasksLimit || 5,
      lastTaskReset: user.profile?.lastTaskReset
    }));

    res.json({
      success: true,
      data: {
        totalUsers: usersData.length,
        users: usersData
      }
    });
  } catch (error) {
    console.error("Get users with pending tasks error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to get users with pending tasks" 
    });
  }
};

// Update user's daily task limit (admin only)
export const updateUserTaskLimit = async (req, res) => {
  try {
    const { userId, dailyTaskLimit } = req.body;

    if (!userId || dailyTaskLimit === undefined) {
      return res.status(400).json({
        success: false,
        message: "User ID and daily task limit are required"
      });
    }

    const taskLimit = parseInt(dailyTaskLimit);
    if (isNaN(taskLimit) || taskLimit < 0) {
      return res.status(400).json({
        success: false,
        message: "Daily task limit must be a non-negative number"
      });
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Update user's profile with new task limit
    await prisma.profile.upsert({
      where: { userId },
      update: { dailyTasksLimit: taskLimit },
      create: {
        userId,
        dailyTasksLimit: taskLimit,
        vipLevel: 0,
        totalInvested: 0,
        dailyTasksCompleted: 0
      }
    });

    res.json({
      success: true,
      message: "User daily task limit updated successfully",
      data: {
        userId,
        userName: user.username || user.email,
        dailyTaskLimit: taskLimit
      }
    });
  } catch (error) {
    console.error("Update user task limit error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to update user task limit" 
    });
  }
};