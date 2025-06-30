// import express from 'express';
// import { 
//   getDashboardStats,
//   getUsers,
//   verifyDeposit,
//   processWithdrawal,
//   updateVipLevel
// } from './userController.js';
// import { authenticateUser } from '../middlewares/auth.js';
// import {  adminAuth } from '../middlewares/adminAuth.js';

// const router = express.Router();

// // All routes require admin authentication
// router.use(authenticateUser, adminAuth);

// // Dashboard
// router.get('/dashboard', getDashboardStats);

// // User Management
// router.get('/users', getUsers);

// // Deposit Management
// router.post('/deposits/verify', verifyDeposit);

// // Withdrawal Management
// router.post('/withdrawals/process', processWithdrawal);

// // VIP Management
// router.post('/vip/update', updateVipLevel);

// // In your admin routes (routes/admin.js)
// router.get('/test', authenticateUser, adminAuth, (req, res) => {
//   res.json({
//     message: "Admin access confirmed",
//     user: req.user
//   });
// });

// export default router;



import express from 'express';
import {
  getDashboardStats,
  getUsers,
  deleteUser,
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
} from './userController.js';
import { authenticateUser } from '../middlewares/auth.js';
import {  adminAuth } from '../middlewares/adminAuth.js';

const router = express.Router();

router.use(authenticateUser, adminAuth);

// Dashboard
router.get('/stats', getDashboardStats);

// Users
router.get('/users', getUsers);
router.get('/users/:userId', getUserById);
router.delete('/users/:userId', deleteUser);

// Deposits
router.get('/deposits', getDeposits);
router.put('/deposits/verify', verifyDeposit);
router.get('/deposits/:depositId', getDepositById);

// Withdrawals
router.get('/withdrawals', getWithdrawals);
router.put('/withdrawals/process', processWithdrawal);
router.get('/withdrawals/:withdrawalId', getWithdrawalById);


// VIP Levels
router.get('/vip-levels', getVipLevels);
router.put('/users/vip', updateVipLevel);

// Wallets
router.get('/wallets', getAdminWallets);
router.post('/wallets', addAdminWallet);
router.put('/wallets/:walletId', updateAdminWallet);
router.delete('/wallets/:walletId', deleteAdminWallet);

router.post('/admin/notifications', authenticateUser, adminAuth, sendNotification);
router.get('/admin/notifications', authenticateUser, adminAuth, getNotifications);
router.delete('/admin/notifications/:notificationId', authenticateUser, adminAuth, deleteNotification);

export default router;