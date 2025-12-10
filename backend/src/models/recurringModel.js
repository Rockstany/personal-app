import { query } from '../config/database.js';
import { createTransaction } from './transactionModel.js';

export async function createRecurring(userId, recurringData) {
  const {
    account_id,
    category_id,
    type,
    amount,
    description,
    payment_method = 'cash',
    frequency,
    custom_interval = null,
    start_date,
    end_date = null,
    next_occurrence,
    auto_add = true,
    reminder_enabled = true,
    reminder_days_before = 3
  } = recurringData;

  const result = await query(
    `INSERT INTO recurring_transactions (user_id, account_id, category_id, type, amount, description, payment_method, frequency, custom_interval, start_date, end_date, next_occurrence, auto_add, reminder_enabled, reminder_days_before)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [userId, account_id, category_id, type, amount, description, payment_method, frequency, custom_interval, start_date, end_date, next_occurrence, auto_add, reminder_enabled, reminder_days_before]
  );

  return result.insertId;
}

export async function getRecurringByUser(userId, isActive = true) {
  let sql = `
    SELECT
      rt.*,
      a.account_name,
      a.icon as account_icon,
      mc.name as category_name,
      mc.icon as category_icon,
      mc.color as category_color
    FROM recurring_transactions rt
    JOIN accounts a ON rt.account_id = a.id
    JOIN money_categories mc ON rt.category_id = mc.id
    WHERE rt.user_id = ?
  `;

  const params = [userId];

  if (isActive !== null) {
    sql += ` AND rt.is_active = ?`;
    params.push(isActive);
  }

  sql += ` ORDER BY rt.next_occurrence ASC`;

  return await query(sql, params);
}

export async function getRecurringById(recurringId, userId) {
  const recurring = await query(
    `SELECT
      rt.*,
      a.account_name,
      mc.name as category_name,
      mc.icon as category_icon,
      mc.color as category_color
    FROM recurring_transactions rt
    JOIN accounts a ON rt.account_id = a.id
    JOIN money_categories mc ON rt.category_id = mc.id
    WHERE rt.id = ? AND rt.user_id = ?`,
    [recurringId, userId]
  );

  return recurring[0] || null;
}

export async function updateRecurring(recurringId, userId, updates) {
  const allowedFields = ['account_id', 'category_id', 'amount', 'description', 'payment_method', 'frequency', 'custom_interval', 'end_date', 'auto_add', 'reminder_enabled', 'reminder_days_before', 'is_active'];
  const fields = [];
  const values = [];

  for (const [key, value] of Object.entries(updates)) {
    if (allowedFields.includes(key)) {
      fields.push(`${key} = ?`);
      values.push(value);
    }
  }

  if (fields.length === 0) {
    return false;
  }

  values.push(recurringId, userId);

  await query(
    `UPDATE recurring_transactions SET ${fields.join(', ')}
     WHERE id = ? AND user_id = ?`,
    values
  );

  return true;
}

export async function deleteRecurring(recurringId, userId) {
  await query(
    `DELETE FROM recurring_transactions WHERE id = ? AND user_id = ?`,
    [recurringId, userId]
  );

  return true;
}

export async function getDueRecurring(userId) {
  const today = new Date().toISOString().split('T')[0];

  return await query(
    `SELECT
      rt.*,
      a.account_name,
      mc.name as category_name,
      mc.icon as category_icon,
      mc.color as category_color
    FROM recurring_transactions rt
    JOIN accounts a ON rt.account_id = a.id
    JOIN money_categories mc ON rt.category_id = mc.id
    WHERE rt.user_id = ? AND rt.is_active = TRUE AND rt.next_occurrence <= ?
    ORDER BY rt.next_occurrence ASC`,
    [userId, today]
  );
}

export async function processRecurringTransaction(recurringId, userId) {
  const recurring = await getRecurringById(recurringId, userId);
  if (!recurring) return false;

  // Create the transaction
  const transactionId = await createTransaction(userId, {
    account_id: recurring.account_id,
    category_id: recurring.category_id,
    type: recurring.type,
    amount: recurring.amount,
    description: recurring.description,
    transaction_date: recurring.next_occurrence,
    payment_method: recurring.payment_method,
    is_recurring: true,
    recurring_id: recurringId
  });

  // Calculate next occurrence
  const nextDate = calculateNextOccurrence(recurring.next_occurrence, recurring.frequency, recurring.custom_interval);

  // Update recurring transaction
  if (recurring.end_date && nextDate > recurring.end_date) {
    // End date reached, deactivate
    await query(
      `UPDATE recurring_transactions SET is_active = FALSE WHERE id = ?`,
      [recurringId]
    );
  } else {
    // Update next occurrence
    await query(
      `UPDATE recurring_transactions SET next_occurrence = ? WHERE id = ?`,
      [nextDate, recurringId]
    );
  }

  return transactionId;
}

function calculateNextOccurrence(currentDate, frequency, customInterval = null) {
  const date = new Date(currentDate);

  switch (frequency) {
    case 'daily':
      date.setDate(date.getDate() + 1);
      break;
    case 'weekly':
      date.setDate(date.getDate() + 7);
      break;
    case 'monthly':
      date.setMonth(date.getMonth() + 1);
      break;
    case 'yearly':
      date.setFullYear(date.getFullYear() + 1);
      break;
    case 'custom':
      if (customInterval) {
        date.setDate(date.getDate() + customInterval);
      }
      break;
  }

  return date.toISOString().split('T')[0];
}

export async function getRemindersDue(userId) {
  const today = new Date();
  const futureDate = new Date();
  futureDate.setDate(today.getDate() + 7); // Look ahead 7 days

  const todayStr = today.toISOString().split('T')[0];
  const futureDateStr = futureDate.toISOString().split('T')[0];

  return await query(
    `SELECT
      rt.*,
      a.account_name,
      mc.name as category_name,
      mc.icon as category_icon,
      mc.color as category_color,
      DATEDIFF(rt.next_occurrence, ?) as days_until
    FROM recurring_transactions rt
    JOIN accounts a ON rt.account_id = a.id
    JOIN money_categories mc ON rt.category_id = mc.id
    WHERE rt.user_id = ?
      AND rt.is_active = TRUE
      AND rt.reminder_enabled = TRUE
      AND rt.next_occurrence BETWEEN ? AND ?
      AND DATEDIFF(rt.next_occurrence, ?) <= rt.reminder_days_before
    ORDER BY rt.next_occurrence ASC`,
    [todayStr, userId, todayStr, futureDateStr, todayStr]
  );
}
