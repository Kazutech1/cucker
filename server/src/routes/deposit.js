import express from 'express';
import { 
  getDepositAddresses,
  // getDepositInfo,
  submitDepositProof
} from '../controllers/depositController.js';
import { authenticateUser } from '../middlewares/auth.js';

const router = express.Router();

router.get('/info', authenticateUser, getDepositAddresses);
router.post('/submit', authenticateUser, (req, res, next) => {
  submitDepositProof(req, res, next);
});

export default router;