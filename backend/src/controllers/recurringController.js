import * as recurringModel from '../models/recurringModel.js';

export async function createRecurringHandler(req, res) {
  try {
    const recurringId = await recurringModel.createRecurring(req.userId, req.body);
    res.status(201).json({ id: recurringId, message: 'Recurring transaction created successfully' });
  } catch (error) {
    console.error('Create recurring error:', error);
    res.status(500).json({ error: 'Failed to create recurring transaction' });
  }
}

export async function getRecurringHandler(req, res) {
  try {
    const isActive = req.query.is_active !== undefined ? req.query.is_active === 'true' : true;
    const recurring = await recurringModel.getRecurringByUser(req.userId, isActive);
    res.json(recurring);
  } catch (error) {
    console.error('Get recurring error:', error);
    res.status(500).json({ error: 'Failed to fetch recurring transactions' });
  }
}

export async function getRecurringByIdHandler(req, res) {
  try {
    const recurring = await recurringModel.getRecurringById(req.params.id, req.userId);
    if (!recurring) {
      return res.status(404).json({ error: 'Recurring transaction not found' });
    }
    res.json(recurring);
  } catch (error) {
    console.error('Get recurring by id error:', error);
    res.status(500).json({ error: 'Failed to fetch recurring transaction' });
  }
}

export async function updateRecurringHandler(req, res) {
  try {
    const success = await recurringModel.updateRecurring(req.params.id, req.userId, req.body);
    if (!success) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }
    res.json({ message: 'Recurring transaction updated successfully' });
  } catch (error) {
    console.error('Update recurring error:', error);
    res.status(500).json({ error: 'Failed to update recurring transaction' });
  }
}

export async function deleteRecurringHandler(req, res) {
  try {
    await recurringModel.deleteRecurring(req.params.id, req.userId);
    res.json({ message: 'Recurring transaction deleted successfully' });
  } catch (error) {
    console.error('Delete recurring error:', error);
    res.status(500).json({ error: 'Failed to delete recurring transaction' });
  }
}

export async function getDueRecurringHandler(req, res) {
  try {
    const recurring = await recurringModel.getDueRecurring(req.userId);
    res.json(recurring);
  } catch (error) {
    console.error('Get due recurring error:', error);
    res.status(500).json({ error: 'Failed to fetch due recurring transactions' });
  }
}

export async function processRecurringHandler(req, res) {
  try {
    const transactionId = await recurringModel.processRecurringTransaction(req.params.id, req.userId);
    if (!transactionId) {
      return res.status(404).json({ error: 'Recurring transaction not found' });
    }
    res.json({ transactionId, message: 'Recurring transaction processed successfully' });
  } catch (error) {
    console.error('Process recurring error:', error);
    res.status(500).json({ error: 'Failed to process recurring transaction' });
  }
}

export async function getRemindersHandler(req, res) {
  try {
    const reminders = await recurringModel.getRemindersDue(req.userId);
    res.json(reminders);
  } catch (error) {
    console.error('Get reminders error:', error);
    res.status(500).json({ error: 'Failed to fetch reminders' });
  }
}
