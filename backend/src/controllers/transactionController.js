import * as transactionModel from '../models/transactionModel.js';
import * as transferModel from '../models/transferModel.js';

export async function createTransactionHandler(req, res) {
  try {
    const transactionId = await transactionModel.createTransaction(req.userId, req.body);
    res.status(201).json({ id: transactionId, message: 'Transaction created successfully' });
  } catch (error) {
    console.error('Create transaction error:', error);
    res.status(500).json({ error: 'Failed to create transaction' });
  }
}

export async function getTransactionsHandler(req, res) {
  try {
    const filters = {
      account_id: req.query.account_id,
      category_id: req.query.category_id,
      type: req.query.type,
      payment_method: req.query.payment_method,
      start_date: req.query.start_date,
      end_date: req.query.end_date,
      search: req.query.search,
      limit: req.query.limit
    };

    const transactions = await transactionModel.getTransactionsByUser(req.userId, filters);
    res.json(transactions);
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
}

export async function getTransactionHandler(req, res) {
  try {
    const transaction = await transactionModel.getTransactionById(req.params.id, req.userId);
    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    res.json(transaction);
  } catch (error) {
    console.error('Get transaction error:', error);
    res.status(500).json({ error: 'Failed to fetch transaction' });
  }
}

export async function updateTransactionHandler(req, res) {
  try {
    const success = await transactionModel.updateTransaction(req.params.id, req.userId, req.body);
    if (!success) {
      return res.status(400).json({ error: 'No valid fields to update or transaction not found' });
    }
    res.json({ message: 'Transaction updated successfully' });
  } catch (error) {
    console.error('Update transaction error:', error);
    res.status(500).json({ error: 'Failed to update transaction' });
  }
}

export async function deleteTransactionHandler(req, res) {
  try {
    const success = await transactionModel.deleteTransaction(req.params.id, req.userId);
    if (!success) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    res.json({ message: 'Transaction deleted successfully' });
  } catch (error) {
    console.error('Delete transaction error:', error);
    res.status(500).json({ error: 'Failed to delete transaction' });
  }
}

export async function getDailySummaryHandler(req, res) {
  try {
    const date = req.query.date || new Date().toISOString().split('T')[0];
    const summary = await transactionModel.getDailySummary(req.userId, date);
    res.json(summary);
  } catch (error) {
    console.error('Get daily summary error:', error);
    res.status(500).json({ error: 'Failed to fetch daily summary' });
  }
}

export async function getPeriodSummaryHandler(req, res) {
  try {
    const { start_date, end_date } = req.query;

    if (!start_date || !end_date) {
      return res.status(400).json({ error: 'start_date and end_date are required' });
    }

    const summary = await transactionModel.getPeriodSummary(req.userId, start_date, end_date);
    res.json(summary);
  } catch (error) {
    console.error('Get period summary error:', error);
    res.status(500).json({ error: 'Failed to fetch period summary' });
  }
}

export async function getMonthlyReportHandler(req, res) {
  try {
    const year = req.query.year || new Date().getFullYear();
    const month = req.query.month || new Date().getMonth() + 1;

    const report = await transactionModel.getMonthlyReport(req.userId, year, month);
    res.json(report);
  } catch (error) {
    console.error('Get monthly report error:', error);
    res.status(500).json({ error: 'Failed to fetch monthly report' });
  }
}

export async function getDailyReportHandler(req, res) {
  try {
    const { start_date, end_date } = req.query;

    if (!start_date || !end_date) {
      return res.status(400).json({ error: 'start_date and end_date are required' });
    }

    const report = await transactionModel.getDailyReport(req.userId, start_date, end_date);
    res.json(report);
  } catch (error) {
    console.error('Get daily report error:', error);
    res.status(500).json({ error: 'Failed to fetch daily report' });
  }
}

export async function getRecentTransactionsHandler(req, res) {
  try {
    const limit = req.query.limit || 10;
    const transactions = await transactionModel.getRecentTransactions(req.userId, limit);
    res.json(transactions);
  } catch (error) {
    console.error('Get recent transactions error:', error);
    res.status(500).json({ error: 'Failed to fetch recent transactions' });
  }
}

// Transfer handlers
export async function createTransferHandler(req, res) {
  try {
    const transferId = await transferModel.createTransfer(req.userId, req.body);
    res.status(201).json({ id: transferId, message: 'Transfer created successfully' });
  } catch (error) {
    console.error('Create transfer error:', error);
    res.status(500).json({ error: error.message || 'Failed to create transfer' });
  }
}

export async function getTransfersHandler(req, res) {
  try {
    const filters = {
      account_id: req.query.account_id,
      start_date: req.query.start_date,
      end_date: req.query.end_date,
      limit: req.query.limit
    };

    const transfers = await transferModel.getTransfersByUser(req.userId, filters);
    res.json(transfers);
  } catch (error) {
    console.error('Get transfers error:', error);
    res.status(500).json({ error: 'Failed to fetch transfers' });
  }
}

export async function deleteTransferHandler(req, res) {
  try {
    const success = await transferModel.deleteTransfer(req.params.id, req.userId);
    if (!success) {
      return res.status(404).json({ error: 'Transfer not found' });
    }
    res.json({ message: 'Transfer deleted successfully' });
  } catch (error) {
    console.error('Delete transfer error:', error);
    res.status(500).json({ error: 'Failed to delete transfer' });
  }
}
