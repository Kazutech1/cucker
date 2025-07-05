// earnings routes (earnings.js)
import express from 'express';
// import { calculateDailyProfit, getDailyEarningsInfo } from '../controllers/earningsController.js'
import { authenticateUser } from '../middlewares/auth.js';
import { completeTask, getUserTaskHistory, getUserTasks, getUserTaskStats } from '../controllers/earningsController.js';
// import { completeTask, getUserTaskEarnings, getUserTaskHistory, getUserTasks } from '../admin/taskController.js';
// import { assignTasksToUser, completeTask, getTaskStats, getUserTasks } from '../admin/taskController.js';

const router = express.Router();

router.use(authenticateUser);

// // GET route to check earnings info without claiming
// router.get('/daily', authenticateUser, getDailyEarningsInfo);

// // POST route to actually claim/calculate daily profit
// router.post('/daily', authenticateUser, calculateDailyProfit);


// router.get('/user/tasks',  getUserTasks);
// router.post('/user/tasks/assign',  assignTasksToUser);
// router.post('/user/tasks/:taskId/complete',  completeTask);
// router.get('/user/tasks/stats',  getTaskStats);






// router.get('/user/tasks',  getUserTasks);
// router.post('/user/complete/:assignmentId',  completeTask);
// router.get('/user/history',  getUserTaskHistory); 
// router.get('/user/earnings',  getUserTaskEarnings);

router.get('/', getUserTasks);
router.post('/complete', completeTask);
router.get('/:userId/tasks/history', getUserTaskHistory);
router.get('/:userId/tasks/stats', getUserTaskStats);




export default router; 