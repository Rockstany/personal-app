import express from 'express';
import * as taskController from '../controllers/taskController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.post('/', authenticate, taskController.createTaskHandler);
router.get('/', authenticate, taskController.getTasksHandler);
router.get('/weekly-report', authenticate, taskController.getWeeklyReportHandler);
router.get('/monthly-report', authenticate, taskController.getMonthlyReportHandler);
router.get('/:id', authenticate, taskController.getTaskHandler);
router.patch('/:id', authenticate, taskController.updateTaskHandler);
router.post('/:id/complete', authenticate, taskController.completeTaskHandler);
router.delete('/:id', authenticate, taskController.deleteTaskHandler);

export default router;
