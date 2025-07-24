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
  // getAdminWallets,
  // addAdminWallet,
  // updateAdminWallet,
  // deleteAdminWallet,
  getUserById,
  getDepositById,
  getWithdrawalById,
  sendNotification,
  deleteNotification,
  getNotifications,
  createVipLevel,
  updateVipLevelDetails,
  deleteVipLevel,
  getAppSettings,
  updateAppSettings,
  getAdminUserReferralInfo,
  // createTask,
  // getAllTasks,
  // updateTask,
  // deleteTask,
  // assignTaskToUser,
  // removeTaskFromUser,
  // getAllTaskAssignments,
  // // getTaskStatistics,
  // getAdminDashboardStats,
  // updateUserTaskLimit,
  // assignComboTask,
  // convertToComboTask,
  // removeComboFromTask,
  // getTaskById,
  // assignMultipleTasks,
} from './userController.js';
import { authenticateUser } from '../middlewares/auth.js';
import { adminAuth } from '../middlewares/adminAuth.js';
// import { assignTask, assignTasksToUser, assignTaskToUser, createCustomUserTask, createTask,  deactivateUserTasks, deleteTask, getAllTasks, getAllUserTasks, getTaskById, updateTask, updateTaskLimit, updateUsersTask, updateUserTask, verifyForcedTask } from './taskController.js';
import { assignTasksToUser, createProduct, deactivateUserTasks, deleteProduct, deleteTask, editTask, getAllProducts, getAllUsersTasks, getProduct, toggleProductStatus, updateProduct, updateTaskDetails } from './adminController.js';
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
// router.get('/wallets', getAdminWallets);
// router.post('/wallets', addAdminWallet);
// router.put('/wallets/:walletId', updateAdminWallet);
// router.delete('/wallets/:walletId', deleteAdminWallet);

// Notification Management
router.post('/notifications', sendNotification);
router.get('/notifications', getNotifications);
router.delete('/notifications/:notificationId', deleteNotification);


router.get('/settings', getAppSettings);
router.put('/settings', updateAppSettings);



router.post('/products', createProduct);

// Get all products
router.get('/products', getAllProducts);

// Get a single product
router.get('/products/:productId', getProduct);

// Update a product
router.put('/products/:productId', updateProduct);

// Toggle product status (active/inactive)
router.patch('/products/:productId/toggle-status', toggleProductStatus);

// Delete a product
router.delete('/products/:productId', deleteProduct);


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



// router.post('/tasks', createTask);
// router.get('/tasks', getAllTasks);
// router.put('/tasks/:taskId', updateTask); 
// router.delete('/tasks/:taskId', deleteTask); 
// router.post('/tasks/assign', assignTaskToUser);
// router.delete('/tasks/assign/:assignmentId', removeTaskFromUser);
// router.get('/tasks/assignments', getAllTaskAssignments);
// router.get('/tasks/stats', getTaskStatistics);
// router.get('/tasks/dashboard', getAdminDashboardStats);
// router.put('/tasks/:userId/task-limit', updateUserTaskLimit)
// router.post('/tasks/assign-combo', assignComboTask)
// router.post('/tasks/:taskId/remove-combo', removeComboFromTask)
// router.put('/tasks/:taskId/make-combo', convertToComboTask)




// router.post('/tasks',   createTask);
// router.get('/tasks',  getAllTasks);
// router.get('/tasks/:id',  getTaskById);
// router.put('/tasks/:id',   updateTask);
// router.delete('/tasks/:id',  deleteTask);

// /** --- ADMIN ASSIGN TASKS --- **/
// router.post('/tasks/assign',  assignTask);
// router.post('/task/:userId/assign-tasks', assignTasksToUser);

// router.post('/admin/user-tasks/assign', assignTaskToUser);
// router.put('/admin/user-tasks/:id', updateUsersTask);
// router.post('/user-tasks/custom', createCustomUserTask);
// // Add to your admin task routes
// router.delete('/users/:userId/deactivate-tasks', deactivateUserTasks);






// /** --- ADMIN VERIFY FORCED TASK --- **/
// router.post('/user-tasks/:userTaskId/verify',  verifyForcedTask);

// /** --- ADMIN UPDATE USER TASK LIMIT --- **/
// router.put('/users/:id/task-limit',  updateTaskLimit);


// router.get('/users/:id/task-history',  getAllUserTasks)

// router.put('/user/tasks/:id', updateUserTask);




router.post('/assign',  assignTasksToUser);
router.post('/forced',  updateTaskDetails);
router.put('/:taskId', editTask);
router.delete('/:taskId', deleteTask);
router.post('/deactivate-tasks',  deactivateUserTasks);
router.get('/tasks',  getAllUsersTasks);




// router.get('/referrals',  getAllReferralData);
router.get('/referrals/:userId',  getAdminUserReferralInfo);


export default router;