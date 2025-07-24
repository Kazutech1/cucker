// earnings routes (earnings.js)
import express from 'express';
// import { calculateDailyProfit, getDailyEarningsInfo } from '../controllers/earningsController.js'
import { authenticateUser } from '../middlewares/auth.js';
import { completeTask, declineTask, getCurrentTask, getTaskHistory, getUserTasks } from '../admin/adminController.js';
// import { completeTask, declineTask, getUserTasks } from '../admin/adminController.js';
// import { completeTask, getUserTaskHistory, getUserTasks, userRejectPendingTask } from '../admin/taskController.js';
// import { completeTask, getUserTaskHistory, getUserTasks, getUserTaskStats } from '../controllers/earningsController.js';
// import { completeComboTask, getComboTasks, getUserRegularTasks } from '../admin/userController.js';
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

// router.get('/', getUserTasks);
// router.post('/complete', completeTask);
// router.get('/:userId/tasks/history', getUserTaskHistory);
// router.get('/:userId/tasks/stats', getUserTaskStats);


// // Add to your taskRoutes.ts
// router.get('/',  getUserRegularTasks);
// router.patch('/complete/:assignmentId',  completeTask);
// router.patch('/combo/:assignmentId',  completeComboTask);

// // Special Task Routes
// router.get('/combo',  getComboTasks);


// router.get('/',  getUserTasks);

// // Submit task completion (normal or forced)
// router.post('/:userTaskId/complete',  completeTask);

// // User rejects a pending forced task
// router.post('/:userTaskId/reject',  userRejectPendingTask);

// // User task history
// router.get('/history',  getUserTaskHistory);






// User endpoints
router.get('/',  getUserTasks);
router.patch('/:taskId/complete',  completeTask);
router.patch('/:taskId/decline', declineTask);
router.get('/current-task', getCurrentTask) 
router.get('/task-history', getTaskHistory) 





export default router; 