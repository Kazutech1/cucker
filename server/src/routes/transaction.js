// routes/transactionRoutes.js
import express from 'express';
import { 
  getTransactionHistory, 
  getTransactionSummary, 
  getTransactionDetails,
  exportTransactionHistory 
} from '../controllers/transactionController.js';
import { authenticateUser } from '../middlewares/auth.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateUser);

/**
 * @route   GET /api/transactions
 * @desc    Get paginated transaction history with optional filters
 * @query   page, limit, type (deposit|withdrawal|earnings), status, startDate, endDate
 * @access  Private
 */
router.get('/', getTransactionHistory);

/**
 * @route   GET /api/transactions/summary
 * @desc    Get transaction summary and statistics
 * @query   period (default: 30 days)
 * @access  Private
 */
router.get('/summary', getTransactionSummary);

/**
 * @route   GET /api/transactions/:type/:id
 * @desc    Get specific transaction details
 * @params  type (deposit|withdrawal|earnings), id
 * @access  Private
 */
router.get('/:type/:id', getTransactionDetails);

/**
 * @route   GET /api/transactions/export/csv
 * @desc    Export transaction history as CSV
 * @query   type, startDate, endDate
 * @access  Private
 */
router.get('/export/csv', exportTransactionHistory);

export default router;