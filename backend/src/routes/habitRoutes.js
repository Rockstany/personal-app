import express from 'express';
import * as habitController from '../controllers/habitController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.post('/', authenticate, habitController.createHabitHandler);
router.get('/', authenticate, habitController.getHabitsHandler);
router.get('/:id', authenticate, habitController.getHabitHandler);
router.patch('/:id', authenticate, habitController.updateHabitHandler);
router.delete('/:id', authenticate, habitController.deleteHabitHandler);
router.post('/:id/complete', authenticate, habitController.completeHabitHandler);
router.post('/:id/completions/sync', authenticate, habitController.syncCompletionHandler);
router.get('/:id/calendar/:month', authenticate, habitController.getCalendarHandler);
router.get('/:id/skip-days', authenticate, habitController.getSkipDaysHandler);

export default router;
