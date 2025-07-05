import express from 'express';
import {
  getDashboardStats,
  getUsers,
  deleteUser,
  updateUser, // Add the new import
  getDeposits,
  verifyDeposit,
  getWithdrawals,
  processWithdrawal,
  getVipLevels,
  updateVipLevel,
  getAdminWallets,
  addAdminWallet,
  updateAdminWallet,
  deleteAdminWallet,
  getUserById,
  getDepositById,
  getWithdrawalById,
  sendNotification,
  deleteNotification,
  getNotifications,
  createVipLevel,
  updateVipLevelDetails,
  deleteVipLevel,
  createTask,
  getAllTasks,
  updateTask,
  deleteTask,
  assignTaskToUser,
  removeTaskFromUser,
  getAllTaskAssignments,
  getTaskStatistics,
  getAdminDashboardStats,
  updateUserTaskLimit,
} from './userController.js';
import { authenticateUser } from '../middlewares/auth.js';
import { adminAuth } from '../middlewares/adminAuth.js';
// import { createTask, deleteTask, getAllTasks, getAllUsersTaskStats, getUserTaskHistorys, resetAllUserTasks, resetUserTasks, setUserTaskAmount, updateTask } from './taskController.js';
// import { createAppReview, createTask, deleteAppReview, deleteTask, getAllTasks, getAppReviews, getTaskAnalytics, getTaskSettings, getUsersWithPendingTasks, getUserTaskStats, resetAllUserTasks, resetUserTasks, setUserTaskLimit, updateAppReview, updateTask, updateTaskSettings, updateUserTaskLimit } from './taskController.js';

const router = express.Router();

// All routes require admin authentication
router.use(authenticateUser, adminAuth);

// Dashboard
router.get('/stats', getDashboardStats);

// User Management
router.get('/users', getUsers);
router.get('/users/:userId', getUserById);
router.put('/users/:userId', updateUser); // Add the new route
router.delete('/users/:userId', deleteUser);

// Deposit Management
router.get('/deposits', getDeposits);
router.put('/deposits/verify', verifyDeposit);
router.get('/deposits/:depositId', getDepositById);

// Withdrawal Management
router.get('/withdrawals', getWithdrawals);
router.put('/withdrawals/process', processWithdrawal);
router.get('/withdrawals/:withdrawalId', getWithdrawalById);

// VIP Management
router.get('/vip-levels', getVipLevels);
router.put('/users/vip', updateVipLevel);
router.post('/vip-levels', createVipLevel);
router.put('/vip-levels/:level', updateVipLevelDetails);
router.delete('/vip-levels/:level', deleteVipLevel);


// Wallet Management
router.get('/wallets', getAdminWallets);
router.post('/wallets', addAdminWallet);
router.put('/wallets/:walletId', updateAdminWallet);
router.delete('/wallets/:walletId', deleteAdminWallet);

// Notification Management
router.post('/notifications', sendNotification);
router.get('/notifications', getNotifications);
router.delete('/notifications/:notificationId', deleteNotification);


// router.post('/reviews',  createAppReview);
// router.get('/reviews', getAppReviews);
// router.put('/reviews/:appReviewId',  updateAppReview);
// router.delete('/reviews/:appReviewId',  deleteAppReview);

// // Admin Analytics
// router.get('/analytics', getTaskAnalytics);

// // Admin Reset Functions
// router.post('/tasks/reset-all',  resetAllUserTasks);
// router.post('/tasks/reset-user/:userId',  resetUserTasks);
// router.get('/pending', getUsersWithPendingTasks);

// // Admin User Management
// router.put('/limit',  updateUserTaskLimit);



// Create new task
// router.post('/create',  createTask);
// router.get('/all',  getAllTasks);
// router.put('/update/:taskId',  updateTask);
// router.delete('/delete/:taskId',  deleteTask);

// // Admin user task management
// router.post('/reset-all-users',  resetAllUserTasks);
// router.post('/reset-user/:userId',  resetUserTasks);
// router.put('/set-user-tasks/:userId',  setUserTaskAmount);

// // Admin task history and stats
// router.get('/user-history/:userId',  getUserTaskHistorys);
// router.get('/users-stats',  getAllUsersTaskStats);



router.post('/tasks', createTask);
router.get('/tasks', getAllTasks);
router.put('/tasks/:taskId', updateTask); 
router.delete('/tasks/:taskId', deleteTask); 
router.post('/tasks/assign', assignTaskToUser);
router.delete('/tasks/assign/:assignmentId', removeTaskFromUser);
router.get('/tasks/assignments', getAllTaskAssignments);
router.get('/tasks/stats', getTaskStatistics);
router.get('/tasks/dashboard', getAdminDashboardStats);
router.put('/tasks/:userId/task-limit', updateUserTaskLimit)



export default router;