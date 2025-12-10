import express from 'express';
import * as accountController from '../controllers/accountController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.post('/', authenticate, accountController.createAccountHandler);
router.get('/', authenticate, accountController.getAccountsHandler);
router.get('/total-balance', authenticate, accountController.getTotalBalanceHandler);
router.post('/recalculate-all', authenticate, accountController.recalculateAllBalancesHandler);
router.post('/:id/recalculate', authenticate, accountController.recalculateBalanceHandler);
router.get('/:id', authenticate, accountController.getAccountHandler);
router.patch('/:id', authenticate, accountController.updateAccountHandler);
router.delete('/:id', authenticate, accountController.deleteAccountHandler);

export default router;
