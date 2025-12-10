import express from 'express';
import * as recurringController from '../controllers/recurringController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.post('/', authenticate, recurringController.createRecurringHandler);
router.get('/', authenticate, recurringController.getRecurringHandler);
router.get('/due', authenticate, recurringController.getDueRecurringHandler);
router.get('/reminders', authenticate, recurringController.getRemindersHandler);
router.get('/:id', authenticate, recurringController.getRecurringByIdHandler);
router.patch('/:id', authenticate, recurringController.updateRecurringHandler);
router.delete('/:id', authenticate, recurringController.deleteRecurringHandler);
router.post('/:id/process', authenticate, recurringController.processRecurringHandler);

export default router;
