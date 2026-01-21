import express from 'express';
import * as monitoringController from '../controllers/monitoringController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// POST /api/monitoring/log - Log monitoring data (no auth required for client-side logging)
router.post('/log', monitoringController.logMonitoringData);

// GET /api/monitoring/logs - Get monitoring logs (requires auth)
router.get('/logs', authenticate, monitoringController.getMonitoringLogs);

// GET /api/monitoring/summary - Get monitoring summary (requires auth)
router.get('/summary', authenticate, monitoringController.getMonitoringSummary);

export default router;
