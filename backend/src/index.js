import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import habitRoutes from './routes/habitRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import systemRoutes from './routes/systemRoutes.js';
import accountRoutes from './routes/accountRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import transactionRoutes from './routes/transactionRoutes.js';
import recurringRoutes from './routes/recurringRoutes.js';
import { startAutoNotDoneJob } from './jobs/autoNotDone.js';
import logger from './utils/logger.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}));

app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'Habit & Daily Tracker API' });
});

app.use('/api/auth', authRoutes);
app.use('/api/habits', habitRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/system', systemRoutes);
app.use('/api/money/accounts', accountRoutes);
app.use('/api/money/categories', categoryRoutes);
app.use('/api/money/transactions', transactionRoutes);
app.use('/api/money/recurring', recurringRoutes);

app.use((err, req, res, next) => {
  logger.error('Unhandled error', {
    error: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    path: req.path,
    method: req.method
  });
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
  startAutoNotDoneJob();
});
