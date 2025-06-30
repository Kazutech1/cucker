import express from 'express';
import { 
  setWithdrawalAddress,
  getWithdrawalInfo,
  requestWithdrawal
} from '../controllers/withdrawalController.js';
import { authenticateUser } from '../middlewares/auth.js';

const router = express.Router();

router.post('/address', authenticateUser, setWithdrawalAddress);
router.get('/info', authenticateUser, getWithdrawalInfo);
router.post('/request', authenticateUser, requestWithdrawal);

export default router;