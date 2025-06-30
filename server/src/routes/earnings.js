// earnings routes (earnings.js)
import express from 'express';
import { calculateDailyProfit, getDailyEarningsInfo } from '../controllers/earningsController.js'
import { authenticateUser } from '../middlewares/auth.js';

const router = express.Router();

// GET route to check earnings info without claiming
router.get('/daily', authenticateUser, getDailyEarningsInfo);

// POST route to actually claim/calculate daily profit
router.post('/daily', authenticateUser, calculateDailyProfit);



export default router;