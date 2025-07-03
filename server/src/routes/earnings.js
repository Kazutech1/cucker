// earnings routes (earnings.js)
import express from 'express';
import { calculateDailyProfit, getDailyEarningsInfo } from '../controllers/earningsController.js'
import { authenticateUser } from '../middlewares/auth.js';
import { assignTasksToUser, completeTask, getTaskStats, getUserTasks } from '../admin/taskController.js';

const router = express.Router();

router.use(authenticateUser);

// GET route to check earnings info without claiming
router.get('/daily', authenticateUser, getDailyEarningsInfo);

// POST route to actually claim/calculate daily profit
router.post('/daily', authenticateUser, calculateDailyProfit);


router.get('/user/tasks',  getUserTasks);
router.post('/user/tasks/assign',  assignTasksToUser);
router.post('/user/tasks/:taskId/complete',  completeTask);
router.get('/user/tasks/stats',  getTaskStats);



export default router;