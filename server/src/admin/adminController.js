import { PrismaClient } from '@prisma/client';
import { validateTaskAssignment } from '../middlewares/taskValidator.js';
const prisma = new PrismaClient();



export const createProduct = async (req, res) => {
  try {
    const { 
      name, 
      image, 
      reviewText, 
      defaultProfit, 
      defaultDeposit 
    } = req.body;

    // Validate required fields
    if (!name || !image || defaultProfit === undefined) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const product = await prisma.product.create({
      data: {
        name,
        image,
        reviewText,
        defaultProfit,
        defaultDeposit,
        isActive: true
      }
    });

    res.json({
      message: "Product created successfully",
      product: {
        id: product.id,
        name: product.name,
        defaultProfit: product.defaultProfit,
        isActive: product.isActive
      }
    });
  } catch (error) {
    console.error("Create product error:", error);
    res.status(500).json({ message: "Failed to create product" });
  }
};




export const updateProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const {
      name,
      image,
      reviewText,
      defaultProfit,
      defaultDeposit,
      isActive
    } = req.body;

    // Validate at least one field to update
    if (!name && !image && !reviewText && 
        defaultProfit === undefined && 
        defaultDeposit === undefined && 
        isActive === undefined) {
      return res.status(400).json({ message: "No fields to update" });
    }

    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: {
        ...(name && { name }),
        ...(image && { image }),
        ...(reviewText && { reviewText }),
        ...(defaultProfit !== undefined && { defaultProfit }),
        ...(defaultDeposit !== undefined && { defaultDeposit }),
        ...(isActive !== undefined && { isActive }),
        updatedAt: new Date()
      }
    });

    res.json({
      message: "Product updated successfully",
      product: {
        id: updatedProduct.id,
        name: updatedProduct.name,
        isActive: updatedProduct.isActive
      }
    });
  } catch (error) {
    console.error("Update product error:", error);
    if (error.code === 'P2025') {
      return res.status(404).json({ message: "Product not found" });
    }
    res.status(500).json({ message: "Failed to update product" });
  }
};





export const toggleProductStatus = async (req, res) => {
  try {
    const { productId } = req.params;

    const product = await prisma.product.findUnique({
      where: { id: productId }
    });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Soft delete by toggling isActive
    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: {
        isActive: !product.isActive,
        updatedAt: new Date()
      }
    });

    res.json({
      message: `Product ${updatedProduct.isActive ? 'activated' : 'deactivated'} successfully`,
      product: {
        id: updatedProduct.id,
        name: updatedProduct.name,
        isActive: updatedProduct.isActive
      }
    });
  } catch (error) {
    console.error("Toggle product status error:", error);
    res.status(500).json({ message: "Failed to toggle product status" });
  }
};





export const getAllProducts = async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: {
            userTasks: true
          }
        }
      }
    });

    res.json(products.map(product => ({
      id: product.id,
      name: product.name,
      image: product.image,
      defaultProfit: product.defaultProfit,
      defaultDeposit: product.defaultDeposit,
      isActive: product.isActive,
      taskCount: product._count.userTasks,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt
    })));
  } catch (error) {
    console.error("Get products error:", error);
    res.status(500).json({ message: "Failed to get products" });
  }
};





export const getProduct = async (req, res) => {
  try {
    const { productId } = req.params;

    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        _count: {
          select: {
            userTasks: true
          }
        }
      }
    });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json({
      id: product.id,
      name: product.name,
      image: product.image,
      reviewText: product.reviewText,
      defaultProfit: product.defaultProfit,
      defaultDeposit: product.defaultDeposit,
      isActive: product.isActive,
      taskCount: product._count.userTasks,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt
    });
  } catch (error) {
    console.error("Get product error:", error);
    res.status(500).json({ message: "Failed to get product" });
  }
};



export const deleteProduct = async (req, res) => {
  try {
    const { productId } = req.params;

    // First check if the product exists
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        _count: {
          select: {
            userTasks: true
          }
        }
      }
    });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Check if product has associated tasks
    if (product._count.userTasks > 0) {
      return res.status(400).json({ 
        message: "Cannot delete product with associated tasks" 
      });
    }

    // Perform hard delete
    await prisma.product.delete({
      where: { id: productId }
    });

    res.json({
      message: "Product deleted successfully",
      deletedProduct: {
        id: product.id,
        name: product.name
      }
    });
  } catch (error) {
    console.error("Delete product error:", error);
    if (error.code === 'P2025') {
      return res.status(404).json({ message: "Product not found" });
    }
    res.status(500).json({ message: "Failed to delete product" });
  }
};





export const assignTasksToUser = async (req, res) => {
  try {
    console.log('[TASK ASSIGNMENT] Starting complete override assignment');
    const { userId, taskCount, totalProfit, forcedNumber, depositAmount, customProfit } = req.body;

    // Validate input (same as before)
    console.log('[VALIDATION] Validating input');
    if (!userId || !taskCount || !totalProfit) {
      console.warn('[VALIDATION FAILED] Missing required fields');
      return res.status(400).json({
        success: false,
        message: "userId, taskCount and totalProfit are required"
      });
    }

    const numericTaskCount = parseInt(taskCount);
    const numericTotalProfit = parseFloat(totalProfit);
    const numericForcedNumber = forcedNumber ? parseInt(forcedNumber) : undefined;

    if (isNaN(numericTaskCount) || numericTaskCount < 1) {
      console.warn('[VALIDATION FAILED] Invalid taskCount');
      return res.status(400).json({
        success: false,
        message: "taskCount must be a positive number"
      });
    }

    // Verify user exists (same as before)
    console.log(`[USER] Fetching user ${userId}`);
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, isBlocked: true, nextTaskNumber: true }
    });

    if (!user) {
      console.warn('[USER] User not found');
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    if (user.isBlocked) {
      console.warn('[USER] User is blocked');
      return res.status(400).json({
        success: false,
        message: "User is blocked"
      });
    }

    // Get active products (same as before)
    console.log('[PRODUCTS] Fetching active products');
    const activeProducts = await prisma.product.findMany({
      where: { isActive: true },
      select: { id: true }
    });

    if (activeProducts.length === 0) {
      console.error('[PRODUCTS] No active products');
      return res.status(400).json({
        success: false,
        message: "No active products available"
      });
    }

    // Calculate base profit (same as before)
    const baseProfitPerTask = numericTotalProfit / numericTaskCount;
    console.log(`[PROFIT] Base profit per task: ${baseProfitPerTask}`);

    // Prepare all task data (same as before)
    const taskData = [];
    for (let i = 0; i < numericTaskCount; i++) {
      const taskNumber = i + 1;
      const isForced = numericForcedNumber === taskNumber;
      
      taskData.push({
        userId,
        productId: activeProducts[Math.floor(Math.random() * activeProducts.length)].id,
        taskNumber,
        status: "assigned",
        profitAmount: isForced ? (parseFloat(customProfit) || baseProfitPerTask) : baseProfitPerTask,
        isForced,
        depositAmount: isForced ? parseFloat(depositAmount) : null,
        depositStatus: isForced ? "pending" : null
      });
    }

    // Process in transaction to ensure atomic operation
       const result = await prisma.$transaction(async (tx) => {
      // FIRST: Mark existing tasks as inactive and track replacement
      console.log('[HISTORY] Marking existing tasks as inactive');
      await tx.userTask.updateMany({
        where: { userId },
        data: { 
          isActive: false,
          replacedById: taskData[0].id // Link to first new task
        }
      });

      // THEN: Create all new tasks
      console.log('[CREATION] Creating new tasks');
      const createdTasks = await Promise.all(
        taskData.map(task => tx.userTask.create({ data: task }))
      );

      // FINALLY: Update user's next task number
      console.log('[UPDATE] Updating user task counter');
      await tx.user.update({
        where: { id: userId },
        data: { nextTaskNumber: numericTaskCount + 1 }
      });

      return createdTasks;
    }, {
      timeout: 30000, // Increased timeout for larger operations
      maxWait: 30000
    });

    // Calculate statistics
    const actualForcedTasks = numericForcedNumber ? 1 : 0;
    const actualTotalProfit = result.reduce((sum, task) => sum + task.profitAmount, 0);

    console.log('[SUCCESS] Complete task override completed');
    return res.status(201).json({
      success: true,
      message: `${result.length} tasks assigned (complete override)`,
      data: {
        tasks: result,
        stats: {
          requestedTasks: numericTaskCount,
          createdTasks: result.length,
          normalTasks: numericTaskCount - actualForcedTasks,
          forcedTasks: actualForcedTasks,
          totalProfit: actualTotalProfit,
          averageProfitPerTask: actualTotalProfit / numericTaskCount
        }
      }
    });

  } catch (error) {
    console.error('[FINAL ERROR] Task assignment failed:', error);
    return res.status(500).json({
      success: false,
      message: "Failed to assign tasks",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};




export const updateTaskDetails = async (req, res) => {
  try {
    console.log('[TASK UPDATE] Starting task details update');
    const { userId, taskNumber, depositAmount, taskProfit } = req.body;

    // Validate input
    console.log('[VALIDATION] Validating input');
    if (!userId || !taskNumber) {
      console.warn('[VALIDATION FAILED] Missing required fields');
      return res.status(400).json({
        success: false,
        message: "userId and taskNumber are required"
      });
    }

    const numericTaskNumber = parseInt(taskNumber);
    const numericDepositAmount = depositAmount ? parseFloat(depositAmount) : null;
    const numericTaskProfit = taskProfit ? parseFloat(taskProfit) : null;

    if (isNaN(numericTaskNumber)) {
      console.warn('[VALIDATION FAILED] Invalid taskNumber');
      return res.status(400).json({
        success: false,
        message: "taskNumber must be a valid number"
      });
    }

    if (depositAmount && isNaN(numericDepositAmount)) {
      console.warn('[VALIDATION FAILED] Invalid depositAmount');
      return res.status(400).json({
        success: false,
        message: "depositAmount must be a valid number"
      });
    }

    if (taskProfit && isNaN(numericTaskProfit)) {
      console.warn('[VALIDATION FAILED] Invalid taskProfit');
      return res.status(400).json({
        success: false,
        message: "taskProfit must be a valid number"
      });
    }

    // Verify user exists
    console.log(`[USER] Verifying user ${userId} exists`);
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, isBlocked: true }
    });

    if (!user) {
      console.warn('[USER] User not found');
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    if (user.isBlocked) {
      console.warn('[USER] User is blocked');
      return res.status(400).json({
        success: false,
        message: "User is blocked"
      });
    }

    // Find the task to update
    console.log(`[TASK] Finding task number ${numericTaskNumber} for user ${userId}`);
    const task = await prisma.userTask.findFirst({
      where: {
        userId,
        taskNumber: numericTaskNumber
      }
    });

    if (!task) {
      console.warn('[TASK] Task not found');
      return res.status(404).json({
        success: false,
        message: "Task not found for this user"
      });
    }

    // Prepare update data
    const updateData = {
      profitAmount: numericTaskProfit !== null ? numericTaskProfit : task.profitAmount,
      isForced: numericTaskProfit !== null || numericDepositAmount !== null ? true : task.isForced,
      depositAmount: numericDepositAmount !== null ? numericDepositAmount : task.depositAmount,
      depositStatus: numericDepositAmount !== null ? "pending" : task.depositStatus
    };

    // Update the task
    console.log('[UPDATE] Updating task details');
    const updatedTask = await prisma.userTask.update({
      where: { id: task.id },
      data: updateData
    });

    console.log('[SUCCESS] Task details updated successfully');
    return res.status(200).json({
      success: true,
      message: "Task updated successfully",
      data: {
        task: updatedTask,
        changes: {
          profitAmountChanged: numericTaskProfit !== null,
          depositAmountChanged: numericDepositAmount !== null
        }
      }
    });

  } catch (error) {
    console.error('[FINAL ERROR] Task update failed:', error);
    return res.status(500).json({
      success: false,
      message: "Failed to update task",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};


// Bulk operation (fastest but may fail for very large sets)
async function bulkAssignTasks(userId, taskCount, taskProfit, activeProducts, forcedNumber, depositAmount, customProfit) {
  const taskData = prepareTaskData(userId, taskCount, taskProfit, activeProducts, forcedNumber, depositAmount, customProfit);

  return await prisma.$transaction(async (tx) => {
    // Clear existing tasks
    await tx.userTask.deleteMany({
      where: { userId, status: 'assigned' }
    });

    // Bulk create
    const createdTasks = await tx.userTask.createMany({
      data: taskData,
      skipDuplicates: true
    });

    // Update user counter
    await tx.user.update({
      where: { id: userId },
      data: { nextTaskNumber: taskCount + 1 }
    });

    return {
      success: true,
      message: `${taskCount} tasks assigned via bulk operation`,
      count: createdTasks.count
    };
  }, {
    timeout: 30000, // 30 second timeout
    maxWait: 30000
  });
}

// Batched processing (slower but more reliable)
async function batchedAssignTasks(userId, taskCount, taskProfit, activeProducts, forcedNumber, depositAmount, customProfit) {
  const BATCH_SIZE = 50; // Smaller batches for reliability
  const taskData = prepareTaskData(userId, taskCount, taskProfit, activeProducts, forcedNumber, depositAmount, customProfit);
  const createdTasks = [];

  for (let i = 0; i < taskData.length; i += BATCH_SIZE) {
    const batch = taskData.slice(i, i + BATCH_SIZE);
    
    await prisma.$transaction(async (tx) => {
      // Clear existing tasks in this range
      await tx.userTask.deleteMany({
        where: {
          userId,
          taskNumber: { in: batch.map(t => t.taskNumber) }
        }
      });

      // Create batch
      const batchResults = await Promise.all(
        batch.map(task => tx.userTask.create({ data: task }))
      );
      createdTasks.push(...batchResults);
    }, {
      timeout: 10000 // 10 seconds per batch
    });
  }

  // Final user update
  await prisma.user.update({
    where: { id: userId },
    data: { nextTaskNumber: taskCount + 1 }
  });

  return {
    success: true,
    message: `${taskCount} tasks assigned via batched processing`,
    data: createdTasks
  };
}

// Shared data preparation
function prepareTaskData(userId, taskCount, taskProfit, activeProducts, forcedNumber, depositAmount, customProfit) {
  return Array.from({ length: taskCount }, (_, i) => {
    const isForced = Number(forcedNumber) === i + 1;
    return {
      userId,
      productId: activeProducts[Math.floor(Math.random() * activeProducts.length)].id,
      taskNumber: i + 1,
      status: "assigned",
      profitAmount: isForced ? (Number(customProfit) || Number(taskProfit)) : Number(taskProfit),
      isForced,
      depositAmount: isForced ? Number(depositAmount) : null,
      depositStatus: isForced ? "pending" : null
    };
  });
}


// @desc    Get user's tasks
// @route   GET /api/tasks/user/:userId
// @access  User (own data) or Admin
// export const getUserTasks = async (req, res) => {
//   try {
//     const { userId } = req.params;
//     const { status } = req.query;

//     // Verify requesting user has access
//     if (req.user.role !== 'admin' && req.user.id !== userId) {
//       return res.status(403).json({
//         success: false,
//         message: "Unauthorized access to tasks"
//       });
//     }

//     const tasks = await prisma.userTask.findMany({
//       where: { 
//         userId,
//         ...(status && { status }),
//         isActive: true
//       },
//       include: {
//         product: {
//           select: {
//             name: true,
//             image: true,
//             defaultDeposit: true
//           }
//         }
//       },
//       orderBy: { taskNumber: 'asc' }
//     });

//     res.json({
//       success: true,
//       count: tasks.length,
//       data: tasks.map(task => ({
//         id: task.id,
//         taskNumber: task.taskNumber,
//         status: task.status,
//         profit: task.baseProfit,
//         isForced: task.isForced,
//         depositAmount: task.depositAmount,
//         depositStatus: task.depositStatus,
//         product: task.product,
//         createdAt: task.createdAt,
//         completedAt: task.completedAt
//       }))
//     });
//   } catch (error) {
//     console.error("Get user tasks error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Failed to get user tasks"
//     });
//   }
// };

// // @desc    Complete a task
// // @route   PATCH /api/tasks/:taskId/complete
// // @access  User (own task)
// export const completeTask = async (req, res) => {
//   try {
//     const { taskId } = req.params;
//     const userId = req.user.id;

//     // Get task with product details
//     const task = await prisma.userTask.findUnique({
//       where: { id: taskId },
//       include: { product: true }
//     });

//     if (!task || !task.isActive) {
//       return res.status(404).json({
//         success: false,
//         message: "Task not found"
//       });
//     }

//     // Verify task belongs to user
//     if (task.userId !== userId) {
//       return res.status(403).json({
//         success: false,
//         message: "Unauthorized to complete this task"
//       });
//     }

//     // Check task status
//     if (task.status !== 'assigned') {
//       return res.status(400).json({
//         success: false,
//         message: `Task already ${task.status}`
//       });
//     }

//     // Verify user has sufficient balance for profit amount
//     const user = await prisma.user.findUnique({
//       where: { id: userId },
//       select: { balance: true }
//     });

//     if (user.balance < task.baseProfit) {
//       return res.status(400).json({
//         success: false,
//         message: "Insufficient balance to complete task"
//       });
//     }

//     // Handle forced task deposit
//     if (task.isForced && task.depositStatus !== 'approved') {
//       return res.status(400).json({
//         success: false,
//         message: "Deposit not approved for this task"
//       });
//     }

//     // Update task and user balance in transaction
//     const result = await prisma.$transaction(async (prisma) => {
//       // Mark task as completed
//       const updatedTask = await prisma.userTask.update({
//         where: { id: taskId },
//         data: { 
//           status: 'completed',
//           completedAt: new Date() 
//         }
//       });

//       // Add profit to user's balance
//       await prisma.user.update({
//         where: { id: userId },
//         data: {
//           profitBalance: { increment: task.baseProfit }
//         }
//       });

//       return updatedTask;
//     });

//     res.json({
//       success: true,
//       message: "Task completed successfully",
//       data: {
//         taskId: result.id,
//         profitEarned: task.baseProfit
//       }
//     });
//   } catch (error) {
//     console.error("Complete task error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Failed to complete task"
//     });
//   }
// };

// // @desc    Decline a task
// // @route   PATCH /api/tasks/:taskId/decline
// // @access  User (own task)
// export const declineTask = async (req, res) => {
//   try {
//     const { taskId } = req.params;
//     const userId = req.user.id;

//     const task = await prisma.userTask.findUnique({
//       where: { id: taskId }
//     });

//     if (!task || !task.isActive) {
//       return res.status(404).json({
//         success: false,
//         message: "Task not found"
//       });
//     }

//     if (task.userId !== userId) {
//       return res.status(403).json({
//         success: false,
//         message: "Unauthorized to decline this task"
//       });
//     }

//     if (task.status !== 'assigned') {
//       return res.status(400).json({
//         success: false,
//         message: `Cannot decline ${task.status} task`
//       });
//     }

//     const result = await prisma.$transaction(async (prisma) => {
//       // Mark task as declined
//       const updatedTask = await prisma.userTask.update({
//         where: { id: taskId },
//         data: { 
//           status: 'rejected',
//           declinedAt: new Date()
//         }
//       });

//       // Deduct profit from user balances
//       await prisma.user.update({
//         where: { id: userId },
//         data: {
//           balance: { decrement: task.baseProfit },
//           profitBalance: { decrement: task.baseProfit }
//         }
//       });

//       return updatedTask;
//     });

//     res.json({
//       success: true,
//       message: "Task declined successfully",
//       data: {
//         taskId: result.id,
//         penalty: task.baseProfit
//       }
//     });
//   } catch (error) {
//     console.error("Decline task error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Failed to decline task"
//     });
//   }
// };

// @desc    Edit a task (Admin only)
// @route   PUT /api/tasks/:taskId
// @access  Admin
// @desc    Edit a task
// @route   PUT /api/admin/tasks/:taskId
// @access  Admin
export const editTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { 
      status,
      profitAmount,
      makeForced,  // Boolean to convert to forced task
      depositAmount,
      customProfit 
    } = req.body;

    // Validate input
    if (!taskId) {
      return res.status(400).json({
        success: false,
        message: "Task ID is required"
      });
    }

    // Check if task exists
    const existingTask = await prisma.userTask.findUnique({
      where: { id: taskId }
    });

    if (!existingTask) {
      return res.status(404).json({
        success: false,
        message: "Task not found"
      });
    }

    // Prepare update data
    const updateData = {
      ...(status && { status }),
      ...(profitAmount !== undefined && { profitAmount }),
    };

    // Handle forced task conversion
    if (makeForced) {
      if (!depositAmount) {
        return res.status(400).json({
          success: false,
          message: "depositAmount is required when making a task forced"
        });
      }

      updateData.isForced = true;
      updateData.depositAmount = depositAmount;
      updateData.depositStatus = 'pending';
      updateData.profitAmount = customProfit || existingTask.profitAmount;
    }

    // Update the task
    const updatedTask = await prisma.userTask.update({
      where: { id: taskId },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            username: true
          }
        },
        product: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    res.json({
      success: true,
      message: "Task updated successfully",
      data: {
        id: updatedTask.id,
        taskNumber: updatedTask.taskNumber,
        status: updatedTask.status,
        profitAmount: updatedTask.profitAmount,
        isForced: updatedTask.isForced,
        depositAmount: updatedTask.depositAmount,
        depositStatus: updatedTask.depositStatus,
        user: updatedTask.user,
        product: updatedTask.product
      }
    });

  } catch (error) {
    console.error("Edit task error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to edit task",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};



// @desc    Get all users' tasks (Admin)
// @route   GET /api/admin/tasks
// @access  Admin
// @desc    Get all users' tasks (Admin)
// @route   GET /api/admin/tasks
// @access  Admin
export const getAllUsersTasks = async (req, res) => {
  try {
    const { 
      userId,
      status,
      isForced,
      productId,
      dateFrom,
      dateTo,
      page = 1,
      limit = 120,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Validate pagination parameters
    const pageInt = parseInt(page);
    const limitInt = parseInt(limit);
    if (isNaN(pageInt) || isNaN(limitInt)) {
      return res.status(400).json({
        success: false,
        message: "Invalid pagination parameters"
      });
    }

    // Build filter conditions
    const whereClause = {
      isActive: true,
      ...(userId && { userId }),
      ...(status && { status }),
      ...(isForced && { isForced: isForced === 'true' }),
      ...(productId && { productId }),
      ...((dateFrom || dateTo) && {
        createdAt: {
          ...(dateFrom && { gte: new Date(dateFrom) }),
          ...(dateTo && { lte: new Date(dateTo) })
        }
      })
    };

    // Get total count for pagination
    const totalTasks = await prisma.userTask.count({
      where: whereClause
    });

    // Get tasks with related user and product info
    const tasks = await prisma.userTask.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true
          }
        },
        product: {
          select: {
            id: true,
            name: true,
            defaultProfit: true
          }
        }
      },
      orderBy: {
        [sortBy]: sortOrder
      },
      skip: (pageInt - 1) * limitInt,
      take: limitInt
    });

    // Format response
    const formattedTasks = tasks.map(task => ({
      id: task.id,
      taskNumber: task.taskNumber,
      status: task.status,
      profitAmount: task.profitAmount,
      isForced: task.isForced,
      depositAmount: task.depositAmount,
      depositStatus: task.depositStatus,
      createdAt: task.createdAt,
      completedAt: task.completedAt,
      declinedAt: task.declinedAt,
      user: {
        id: task.user.id,
        username: task.user.username,
        email: task.user.email
      },
      product: {
        id: task.product.id,
        name: task.product.name,
        defaultProfit: task.product.defaultProfit
      }
    }));

    res.json({
      success: true,
      pagination: {
        total: totalTasks,
        page: pageInt,
        pages: Math.ceil(totalTasks / limitInt),
        limit: limitInt
      },
      data: formattedTasks
    });

  } catch (error) {
    console.error("Get all users tasks error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get tasks",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};


// @desc    Delete a task (soft delete)
// @route   DELETE /api/admin/tasks/:taskId
// @access  Admin
export const deleteTask = async (req, res) => {
  try {
    const { taskId } = req.params;

    // Check if task exists
    const task = await prisma.userTask.findUnique({
      where: { id: taskId }
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found"
      });
    }

    // Soft delete (set isActive to false)
    await prisma.userTask.update({
      where: { id: taskId },
      data: { isActive: false }
    });

    res.json({
      success: true,
      message: "Task deleted successfully"
    });

  } catch (error) {
    console.error("Delete task error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete task",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};






export const deactivateUserTasks = async (req, res) => {
  try {
    const { userId } = req.body;

    // Validate input
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "userId is required"
      });
    }

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Deactivate user's ability to receive tasks
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { 
        canReceiveTasks: false,
        deactivatedAt: new Date() 
      },
      select: {
        id: true,
        username: true,
        canReceiveTasks: true,
        deactivatedAt: true
      }
    });

    return res.status(200).json({
      success: true,
      message: "User task reception deactivated successfully",
      data: updatedUser
    });

  } catch (error) {
    console.error('Error deactivating user tasks:', error);
    return res.status(500).json({
      success: false,
      message: "Failed to deactivate user tasks",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};




// @desc    Get all tasks for the authenticated user
// @route   GET /api/users/tasks
// @access  Private
export const getUserTasks = async (req, res) => {
  try {
    const userId = req.user.id;
    const { status, isForced } = req.query;

    // Remove pagination and get all tasks
    const tasks = await prisma.userTask.findMany({
      where: {
        userId,
        ...(status && { status }),
        ...(isForced && { isForced: isForced === 'true' }),
        isActive: true
      },
      include: {
        product: {
          select: {
            name: true,
            reviewText: true,
            image:true
          }
        }
      },
      // Remove any pagination-related options
      orderBy: {
        createdAt: 'asc' // or whatever order you prefer
      }
    });

    res.status(200).json({
      success: true,
      data: tasks
    });

  } catch (error) {
    console.error('Get user tasks error:', error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch tasks",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Mark a task as completed
// @route   PATCH /api/users/tasks/:taskId/complete
// @access  Private
export const completeTask = async (req, res) => {
  try {
    console.log('[DEBUG] Starting completeTask');

    const { taskId } = req.params;
    const { proof } = req.body;
    const userId = req.user.id;

    // Validate input
    if (!proof) {
      return res.status(400).json({
        success: false,
        message: "Proof is required"
      });
    }

    // Verify user and task
    const task = await prisma.userTask.findFirst({
      where: {
        id: taskId,
        userId,
        isActive: true
      },
      include: {
        product: {
          select: {
            name: true
          }
        }
      }
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found or not assigned to user"
      });
    }

    if (task.status !== 'assigned') {
      return res.status(400).json({
        success: false,
        message: "Task is not in a completable state"
      });
    }

    // Start transaction
    const [updatedTask, updatedUser] = await prisma.$transaction([
      prisma.userTask.update({
        where: { id: taskId },
        data: {
          status: 'completed',
          // completedAt: new Date(),
          // proof
        },
        include: {
          product: {
            select: {
              name: true
            }
          }
        }
      }),
      prisma.user.update({
        where: { id: userId },
        data: {
          profitBalance: {
            increment: task.profitAmount
          }
        }
      })
    ]);

    // Return response matching frontend expectation
    res.status(200).json({
      success: true,
      message: "Task completed successfully",
      data: {
        id: updatedTask.id,
        product: {
          name: updatedTask.product.name
        },
        completedAt: updatedTask.completedAt
      }
    });

  } catch (error) {
    console.error('Complete task error:', error);
    res.status(500).json({
      success: false,
      message: "Failed to complete task",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};


// @desc    Decline a task
// @route   PATCH /api/users/tasks/:taskId/decline
// @access  Private
export const declineTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    // const { reason } = req.body;
    const userId = req.user.id;

    // Validate input
    // if (!reason) {
    //   return res.status(400).json({
    //     success: false,
    //     message: "Reason is required for declining a task"
    //   });
    // }

    // Verify user and task
    const task = await prisma.userTask.findFirst({
      where: {
        id: taskId,
        userId,
        isActive: true,
        status: 'assigned'
      },
      include: {
        product: {
          select: {
            name: true
          }
        }
      }
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found or not in a declinable state"
      });
    }

    // Start transaction for atomic operations
    const [updatedTask, updatedUser] = await prisma.$transaction([
      // Update task status
      prisma.userTask.update({
        where: { id: taskId },
        data: {
          status: 'rejected',
          // declinedAt: new Date(),
          // declineReason: reason,
          // If this was a forced task with deposit, refund deposit
          // ...(task.isForced && task.depositAmount && {
          //   depositStatus: 'refunded'
          // })
        }
      }),
      
      // Update user balances (only if task had profitAmount)
      ...(task.profitAmount > 0 ? [
        prisma.user.update({
          where: { id: userId },
          data: {
            profitBalance: {
              decrement: task.profitAmount
            },
            balance: {
              decrement: task.profitAmount
            }
          }
        })
      ] : [])
    ]);

    const responseData = {
      task: updatedTask,
      ...(task.profitAmount > 0 && {
        balancesUpdated: true,
        newProfitBalance: updatedUser?.profitBalance,
        newBalance: updatedUser?.balance
      })
    };

    res.status(200).json({
      success: true,
      message: `Task "${task.product.name}" declined successfully${
        task.profitAmount > 0 
          ? ` and $${task.profitAmount} deducted from your balances` 
          : ''
      }`,
      data: responseData
    });

  } catch (error) {
    console.error('Decline task error:', error);
    
    // Handle insufficient balance error specifically
    // if (error.code === 'P2002' || error.message.includes('insufficient')) {
    //   return res.status(400).json({
    //     success: false,
    //     message: "Cannot decline task: Insufficient balance to deduct the task profit"
    //   });
    // }

    res.status(500).json({
      success: false,
      message: "Failed to decline task",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get user's current task (next task to complete)
// @route   GET /api/users/current-task
// @access  Private
export const getCurrentTask = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get the next task in sequence that's assigned
    const currentTask = await prisma.userTask.findFirst({
      where: {
        userId,
        status: 'assigned',
        isActive: true
      },
      orderBy: {
        taskNumber: 'asc'
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            description: true,
            steps: true,
            verificationSteps: true
          }
        }
      }
    });

    if (!currentTask) {
      return res.status(404).json({
        success: false,
        message: "No current task available"
      });
    }

    res.status(200).json({
      success: true,
      data: currentTask
    });

  } catch (error) {
    console.error('Get current task error:', error);
    res.status(500).json({
      success: false,
      message: "Failed to get current task",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};



// @desc    Get user's task history with filtering and pagination
// @route   GET /api/users/task-history
// @access  Private
export const getTaskHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { 
      page = 1, 
      limit = 10,
      includeInactive = 'true',
      status, 
      dateFrom, 
      dateTo,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Validate pagination
    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    if (isNaN(pageNumber) || isNaN(limitNumber) || pageNumber < 1 || limitNumber < 1) {
      return res.status(400).json({
        success: false,
        message: "Invalid pagination parameters"
      });
    }

    // Build where clause
    const where = {
      userId,
      ...(includeInactive === 'false' ? { isActive: true } : {}),
      ...(status && { status }),
      ...(dateFrom && { createdAt: { gte: new Date(dateFrom) } }),
      ...(dateTo && { createdAt: { lte: new Date(dateTo) } })
    };

    // Get total count
    const total = await prisma.userTask.count({ where });

    // Get paginated results
    const tasks = await prisma.userTask.findMany({
      where,
      skip: (pageNumber - 1) * limitNumber,
      take: limitNumber,
      include: {
        product: {
          select: {
            id: true,
            name: true,
            image: true
          }
        },
        replacedBy: {
          select: {
            id: true,
            taskNumber: true,
            createdAt: true
          }
        }
      },
      orderBy: {
        [sortBy]: sortOrder
      }
    });

    // Format response
    const formattedTasks = tasks.map(task => ({
      id: task.id,
      isActive: task.isActive,
      status: task.status,
      taskNumber: task.taskNumber,
      profitAmount: task.profitAmount,
      createdAt: task.createdAt,
      completedAt: task.completedAt,
      product: task.product,
      replacedBy: task.replacedBy
    }));

    res.status(200).json({
      success: true,
      data: {
        tasks: formattedTasks,
        pagination: {
          totalItems: total,
          totalPages: Math.ceil(total / limitNumber),
          currentPage: pageNumber,
          itemsPerPage: limitNumber
        }
      }
    });

  } catch (error) {
    console.error('Task history error:', error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch task history",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};