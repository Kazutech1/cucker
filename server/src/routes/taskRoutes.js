// routes/taskRoutes.js
import express from 'express';
import {
  // Admin Task Management
  createAppReview,
  getAppReviews,
  updateAppReview,
  deleteAppReview,
  
  // User Task Management
  getUserTasks,
  assignTasksToUser,
  completeTask,
  getTaskStats,
  
  // Admin Analytics
  getTaskAnalytics,
  
  // Admin Reset Functions
  resetAllUserTasks,
  resetUserTasks,
  getUsersWithPendingTasks,
  updateUserTaskLimit
} from '../controllers/taskController.js';

import { authenticate } from '../middleware/auth.js';
import { adminOnly } from '../middleware/adminAuth.js';
import { authenticateUser } from '../middlewares/auth.js';

const router = express.Router();

router.use(authenticateUser);

// ============================================
// PUBLIC/USER ROUTES (require authentication)
// ============================================

// User Task Management
router.get('/user/tasks',  getUserTasks);
router.post('/user/tasks/assign',  assignTasksToUser);
router.post('/user/tasks/:taskId/complete',  completeTask);
router.get('/user/tasks/stats',  getTaskStats);

// ============================================
// ADMIN ROUTES (require authentication + admin role)
// ============================================

// Admin Task Management


export default router;