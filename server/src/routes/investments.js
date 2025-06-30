import express from 'express';

import { authenticateUser } from '../middlewares/auth.js';
import { createInvestment } from '../controllers/investmentController.js';

const router = express.Router();

router.post('/', authenticateUser, createInvestment);

export default router;