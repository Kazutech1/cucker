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
} from './userController.js';
import { authenticateUser } from '../middlewares/auth.js';
import { adminAuth } from '../middlewares/adminAuth.js';
import { createAppReview, deleteAppReview, getAppReviews, getTaskAnalytics, getUsersWithPendingTasks, resetAllUserTasks, resetUserTasks, updateAppReview, updateUserTaskLimit } from './taskController.js';

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


router.post('/app-reviews',  createAppReview);
router.get('/app-reviews', getAppReviews);
router.put('/app-reviews/:appReviewId',  updateAppReview);
router.delete('/app-reviews/:appReviewId',  deleteAppReview);

// Admin Analytics
router.get('/analytics', getTaskAnalytics);

// Admin Reset Functions
router.post('/tasks/reset-all',  resetAllUserTasks);
router.post('/tasks/reset-user/:userId',  resetUserTasks);
router.get('/pending', getUsersWithPendingTasks);

// Admin User Management
router.put('/limit',  updateUserTaskLimit);

export default router;