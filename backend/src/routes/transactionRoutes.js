import express from 'express';
import * as transactionController from '../controllers/transactionController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Transaction routes
router.post('/', authenticate, transactionController.createTransactionHandler);
router.get('/', authenticate, transactionController.getTransactionsHandler);
router.get('/recent', authenticate, transactionController.getRecentTransactionsHandler);
router.get('/summary/daily', authenticate, transactionController.getDailySummaryHandler);
router.get('/summary/period', authenticate, transactionController.getPeriodSummaryHandler);
router.get('/reports/monthly', authenticate, transactionController.getMonthlyReportHandler);
router.get('/reports/daily', authenticate, transactionController.getDailyReportHandler);
router.get('/:id', authenticate, transactionController.getTransactionHandler);
router.patch('/:id', authenticate, transactionController.updateTransactionHandler);
router.delete('/:id', authenticate, transactionController.deleteTransactionHandler);

// Transfer routes
router.post('/transfers', authenticate, transactionController.createTransferHandler);
router.get('/transfers', authenticate, transactionController.getTransfersHandler);
router.delete('/transfers/:id', authenticate, transactionController.deleteTransferHandler);

export default router;
