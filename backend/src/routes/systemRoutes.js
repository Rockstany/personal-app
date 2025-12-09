import express from 'express';
import * as systemController from '../controllers/systemController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.get('/status', authenticate, systemController.getSystemStatusHandler);

export default router;
