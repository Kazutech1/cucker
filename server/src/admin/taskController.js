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




// POST /admin/tasks
export const createTask = async (req, res) => {
  try {
    const { appName, appImage, appReview, profit, depositAmount } = req.body;

    // if (!req.file) {
    //   return res.status(400).json({ error: 'Task image is required' });
    // }

    // const uploadResult = await uploadToCloudinary(req.file.buffer, req.file.originalname);

    const task = await prisma.task.create({
      data: {
        appName,
        appImage,
        appReview,
        profit: parseFloat(profit),
        depositAmount: depositAmount ? parseFloat(depositAmount) : null,
      }
    });

    res.status(201).json({ task });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create task' });
  }
};


export const getAllTasks = async (req, res) => {
  try {
    const tasks = await prisma.task.findMany({
      orderBy: { createdAt: 'desc' }
    });

    res.json({ tasks });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
};



export const getTaskById = async (req, res) => {
  try {
    const { id } = req.params;

    const task = await prisma.task.findUnique({
      where: { id }
    });

    if (!task) return res.status(404).json({ error: 'Task not found' });

    res.json({ task });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch task' });
  }
};



export const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { appName, appReview, profit, depositAmount } = req.body;

    const task = await prisma.task.findUnique({ where: { id } });
    if (!task) return res.status(404).json({ error: 'Task not found' });

    let appImage = task.appImage;

    if (req.file) {
      const uploadResult = await uploadToCloudinary(req.file.buffer, req.file.originalname);
      appImage = uploadResult.secure_url;
    }

    const updated = await prisma.task.update({
      where: { id },
      data: {
        appName,
        appReview,
        profit: parseFloat(profit),
        depositAmount: depositAmount ? parseFloat(depositAmount) : null,
        appImage
      }
    });

    res.json({ message: 'Task updated', task: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update task' });
  }
};



export const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;

    const task = await prisma.task.findUnique({ where: { id } });
    if (!task) return res.status(404).json({ error: 'Task not found' });

    await prisma.task.delete({ where: { id } });

    res.json({ message: 'Task deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete task' });
  }
};




export const assignTasksToUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        taskLimit: true,
        userTasks: {
          where: {
            status: { in: ['assigned', 'pending'] },
            task: { depositAmount: null }
          },
          select: { id: true }
        }
      }
    });

    console.log(user.taskLimit);
    

    if (!user) return res.status(404).json({ error: 'User not found' });

    const existingTaskCount = user.userTasks.length;
    const tasksToAssignCount = user.taskLimit - existingTaskCount;

    if (tasksToAssignCount <= 0) {
      return res.status(200).json({ message: 'User already has enough tasks' });
    }

    const availableTasks = await prisma.task.findMany({
      where: {
        depositAmount: null
      }
    });

    // Shuffle tasks randomly
    for (let i = availableTasks.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [availableTasks[i], availableTasks[j]] = [availableTasks[j], availableTasks[i]];
    }

  const allTasks = await prisma.task.findMany({
  where: { depositAmount: null }
});

let tasksToAssign = [];

for (let i = 0; i < user.taskLimit; i++) {
  const randomTask = allTasks[Math.floor(Math.random() * allTasks.length)];
  tasksToAssign.push(randomTask);
}

// Assign each task
await Promise.all(
  tasksToAssign.map(task =>
    prisma.userTask.create({
      data: {
        userId,
        taskId: task.id,
        status: 'assigned'
      }
    })
  )
);


    res.json({ message: `${tasksToAssign.length} task(s) assigned manually` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to assign tasks manually' });
  }
};



// POST /admin/tasks/assign
export const assignTask = async (req, res) => {
  try {
    const { taskId, userIds } = req.body;

    const assignments = await Promise.all(
      userIds.map(userId =>
        prisma.userTask.create({
          data: {
            taskId,
            userId
          }
        })
      )
    );

    res.json({ assigned: assignments.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to assign task' });
  }
};


export const getAllUserTasks = async (req, res) => {
  try {
    const userTasks = await prisma.userTask.findMany({
      include: {
        task: true,
        user: {
          select: {
            id: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const formatted = userTasks.map(entry => ({
      userTaskId: entry.id,
      userId: entry.user.id,
      userName: entry.user.name,
      email: entry.user.email,
      taskId: entry.taskId,
      appName: entry.task.appName,
      appReview: entry.task.appReview,
      appImage: entry.task.appImage,
      profit: entry.task.profit,
      depositAmount: entry.task.depositAmount,
      status: entry.status,
      date: entry.createdAt
    }));

    res.json({ tasks: formatted });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch user tasks' });
  }
};




export const updateTaskLimit = async (req, res) => {
  try {
    const userId = req.params.id;
    const { taskLimit } = req.body;

    // Simple input validation
    if (!taskLimit || isNaN(taskLimit) || taskLimit < 1) {
      return res.status(400).json({ error: 'taskLimit must be a number greater than 0' });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { taskLimit: parseInt(taskLimit) }
    });

    res.json({ message: 'Task limit updated', user: updatedUser });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update task limit' });
  }
};



export const verifyForcedTask = async (req, res) => {
  try {
    const { userTaskId } = req.params; // UserTask id to verify
   const { approve } = req.body;
const isApproved = approve === true || approve === 'true';


    console.log(isApproved);
    

    const userTask = await prisma.userTask.findUnique({
      where: { id: userTaskId },
      include: { task: true, user: true }
    });

    if (!userTask) return res.status(404).json({ error: 'Task assignment not found' });
    // if (userTask.status !== 'assigned')
    //   return res.status(400).json({ error: 'Task is not pending verification' });

    if (isApproved) {
      // Approve: mark completed and add profit
      await prisma.userTask.update({
        where: { id: userTaskId },
        data: { status: 'completed' }
      });

      await prisma.user.update({
        where: { id: userTask.userId },
        data: {
          profitBalance: { increment: userTask.task.profit },
          balance: { increment: userTask.task.profit }
        }
      });

      return res.json({ message: 'Task approved and completed' });
    } else {
      // Reject: mark rejected, deduct profit if needed
      await prisma.userTask.update({
        where: { id: userTaskId },
        data: { status: 'rejected' }
      });

      await prisma.user.update({
        where: { id: userTask.userId },
        data: {
          profitBalance: { decrement: userTask.task.profit },
          balance: { decrement: userTask.task.profit }
        }
      });

      return res.json({ message: 'Task rejected and profit deducted' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to verify forced task' });
  }
};





// GET /user/tasks
export const getUserTasks = async (req, res) => {
  try {
    const userId = req.user.id;

    // Fetch user's VIP level and task limit
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        taskLimit: true,
        profile: {
          select: {
            vipLevel: true
          }
        }
      }
    });

    if (!user) return res.status(404).json({ error: 'User not found' });

    const vipLevel = user.profile?.vipLevel ?? 0;
    if (vipLevel === 0) {
      return res.status(403).json({ error: 'You must upgrade your VIP level to receive tasks.' });
    }

    // Fetch user's currently assigned normal tasks
    const userTasks = await prisma.userTask.findMany({
      where: {
        userId,
        status: { in: ['assigned'] },
        // task: { depositAmount: null }
      },
      include: { task: true }
    });

    const tasks = userTasks.map(ut => ({
      userTaskId: ut.id,
      ...ut.task,
      status: ut.status
    }));

    // Count all available (normal) tasks in the system
    const totalAvailableTasks = await prisma.task.count({
      where: { depositAmount: null }
    });

    res.json({
      tasks,
      totalTask: user.taskLimit,
      totalAvailableTasks,
      userAssignedCount: tasks.length
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to get tasks' });
  }
};






export const completeTask = async (req, res) => {
  try {
    const userId = req.user.id;
    const userTaskId = req.params.userTaskId;
    console.log(userTaskId);
    
    const { depositAmount } = req.body;

    const userTask = await prisma.userTask.findUnique({
      where: { id: userTaskId },
      include: {
        task: true,
        user: true
      }
    });

    if (!userTask || userTask.userId !== userId) {
      return res.status(404).json({ error: 'Task not found or unauthorized' });
    }

    if (userTask.status === 'completed' || userTask.status === 'rejected') {
      return res.status(400).json({ error: 'Task already processed' });
    }

    const task = userTask.task;

    if (task.depositAmount !== null) {
      // FORCE TASK
      if (!depositAmount || parseFloat(depositAmount) < task.depositAmount) {
        // ❌ Insufficient deposit, reject and deduct
        await prisma.$transaction([
          prisma.user.update({
            where: { id: userId },
            data: {
              profitBalance: { decrement: task.profit },
              balance: { decrement: task.profit }
            }
          }),
          prisma.userTask.update({
            where: { id: userTaskId },
            data: { status: 'rejected' }
          })
        ]);

        return res.status(400).json({ error: 'Insufficient deposit. Task rejected.' });
      }

      // ✅ Enough deposit – mark as pending, wait for admin to verify
      await prisma.userTask.update({
        where: { id: userTaskId },
        data: { status: 'pending' }
      });

      return res.json({ message: 'Task marked as pending. Awaiting admin confirmation.' });
    }

    // ✅ Normal task – mark as completed and reward user
    await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: {
          profitBalance: { increment: task.profit },
          balance: { increment: task.profit }
        }
      }),
      prisma.userTask.update({
        where: { id: userTaskId },
        data: { status: 'completed' }
      })
    ]);

    res.json({ message: 'Task completed successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to complete task' });
  }
};



export const userRejectPendingTask = async (req, res) => {
  try {
    const userId = req.user.id;
    const userTaskId = req.params.userTaskId;

    const userTask = await prisma.userTask.findUnique({
      where: { id: userTaskId }
    });

    if (!userTask) return res.status(404).json({ error: 'Task not found' });
    if (userTask.userId !== userId)
      return res.status(403).json({ error: 'Unauthorized' });

    if (userTask.status !== 'pending')
      return res.status(400).json({ error: 'Task is not pending' });

    // Reject task and deduct profit
    await prisma.userTask.update({
      where: { id: userTaskId },
      data: { status: 'rejected' }
    });

    await prisma.user.update({
      where: { id: userId },
      data: {
        profitBalance: { decrement: userTask.task.profit },
        balance: { decrement: userTask.task.profit }
      }
    });

    return res.json({ message: 'Task rejected and profit deducted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to reject task' });
  }
};



export const getUserTaskHistory = async (req, res) => {
  try {
    const userId = req.user.id;

    const history = await prisma.userTask.findMany({
      where: {
        userId,
        OR: [
          { status: 'completed' },
          { status: 'rejected' }
        ]
      },
      include: {
        task: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const formatted = history.map(entry => ({
      userTaskId: entry.id,
      taskId: entry.taskId,
      appName: entry.task.appName,
      appReview: entry.task.appReview,
      appImage: entry.task.appImage,
      profit: entry.task.profit,
      status: entry.status,
      date: entry.createdAt
    }));

    res.json({ history: formatted });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch task history' });
  }
};






