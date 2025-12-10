import { query } from '../config/database.js';
import { updateAccountBalance } from './accountModel.js';

export async function createTransaction(userId, transactionData) {
  const {
    account_id,
    category_id,
    type,
    amount,
    description,
    transaction_date,
    payment_method = 'cash',
    is_recurring = false,
    recurring_id = null,
    marked_offline = false
  } = transactionData;

  const result = await query(
    `INSERT INTO transactions (user_id, account_id, category_id, type, amount, description, transaction_date, payment_method, is_recurring, recurring_id, marked_offline)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [userId, account_id, category_id, type, amount, description, transaction_date, payment_method, is_recurring, recurring_id, marked_offline]
  );

  // Update account balance
  if (type === 'income') {
    await updateAccountBalance(account_id, amount, 'add');
  } else if (type === 'expense') {
    await updateAccountBalance(account_id, amount, 'subtract');
  }

  return result.insertId;
}

export async function getTransactionsByUser(userId, filters = {}) {
  let sql = `
    SELECT
      t.*,
      a.account_name,
      a.account_type,
      a.icon as account_icon,
      mc.name as category_name,
      mc.icon as category_icon,
      mc.color as category_color
    FROM transactions t
    JOIN accounts a ON t.account_id = a.id
    JOIN money_categories mc ON t.category_id = mc.id
    WHERE t.user_id = ? AND t.deleted_at IS NULL
  `;

  const params = [userId];

  if (filters.account_id) {
    sql += ` AND t.account_id = ?`;
    params.push(filters.account_id);
  }

  if (filters.category_id) {
    sql += ` AND t.category_id = ?`;
    params.push(filters.category_id);
  }

  if (filters.type) {
    sql += ` AND t.type = ?`;
    params.push(filters.type);
  }

  if (filters.payment_method) {
    sql += ` AND t.payment_method = ?`;
    params.push(filters.payment_method);
  }

  if (filters.start_date) {
    sql += ` AND t.transaction_date >= ?`;
    params.push(filters.start_date);
  }

  if (filters.end_date) {
    sql += ` AND t.transaction_date <= ?`;
    params.push(filters.end_date);
  }

  if (filters.search) {
    sql += ` AND (t.description LIKE ? OR mc.name LIKE ?)`;
    const searchTerm = `%${filters.search}%`;
    params.push(searchTerm, searchTerm);
  }

  sql += ` ORDER BY t.transaction_date DESC, t.created_at DESC`;

  if (filters.limit) {
    sql += ` LIMIT ?`;
    params.push(parseInt(filters.limit));
  }

  return await query(sql, params);
}

export async function getTransactionById(transactionId, userId) {
  const transactions = await query(
    `SELECT
      t.*,
      a.account_name,
      a.account_type,
      mc.name as category_name,
      mc.icon as category_icon,
      mc.color as category_color
    FROM transactions t
    JOIN accounts a ON t.account_id = a.id
    JOIN money_categories mc ON t.category_id = mc.id
    WHERE t.id = ? AND t.user_id = ? AND t.deleted_at IS NULL`,
    [transactionId, userId]
  );

  return transactions[0] || null;
}

export async function updateTransaction(transactionId, userId, updates) {
  // Get original transaction to reverse balance changes
  const original = await getTransactionById(transactionId, userId);
  if (!original) return false;

  const allowedFields = ['category_id', 'amount', 'description', 'transaction_date', 'payment_method'];
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

  values.push(transactionId, userId);

  // Reverse original balance change
  if (original.type === 'income') {
    await updateAccountBalance(original.account_id, original.amount, 'subtract');
  } else {
    await updateAccountBalance(original.account_id, original.amount, 'add');
  }

  // Update transaction
  await query(
    `UPDATE transactions SET ${fields.join(', ')}
     WHERE id = ? AND user_id = ? AND deleted_at IS NULL`,
    values
  );

  // Apply new balance change
  const newAmount = updates.amount || original.amount;
  if (original.type === 'income') {
    await updateAccountBalance(original.account_id, newAmount, 'add');
  } else {
    await updateAccountBalance(original.account_id, newAmount, 'subtract');
  }

  return true;
}

export async function deleteTransaction(transactionId, userId) {
  // Get transaction to reverse balance
  const transaction = await getTransactionById(transactionId, userId);
  if (!transaction) return false;

  // Soft delete
  await query(
    `UPDATE transactions SET deleted_at = NOW()
     WHERE id = ? AND user_id = ?`,
    [transactionId, userId]
  );

  // Reverse balance change
  if (transaction.type === 'income') {
    await updateAccountBalance(transaction.account_id, transaction.amount, 'subtract');
  } else {
    await updateAccountBalance(transaction.account_id, transaction.amount, 'add');
  }

  return true;
}

export async function getDailySummary(userId, date) {
  const summary = await query(
    `SELECT
      type,
      COUNT(*) as count,
      COALESCE(SUM(amount), 0) as total
    FROM transactions
    WHERE user_id = ? AND transaction_date = ? AND deleted_at IS NULL
    GROUP BY type`,
    [userId, date]
  );

  const income = summary.find(s => s.type === 'income');
  const expense = summary.find(s => s.type === 'expense');

  return {
    income: income?.total || 0,
    expense: expense?.total || 0,
    balance: (income?.total || 0) - (expense?.total || 0),
    income_count: income?.count || 0,
    expense_count: expense?.count || 0
  };
}

export async function getPeriodSummary(userId, startDate, endDate) {
  const summary = await query(
    `SELECT
      type,
      COUNT(*) as count,
      COALESCE(SUM(amount), 0) as total
    FROM transactions
    WHERE user_id = ? AND transaction_date BETWEEN ? AND ? AND deleted_at IS NULL
    GROUP BY type`,
    [userId, startDate, endDate]
  );

  const income = summary.find(s => s.type === 'income');
  const expense = summary.find(s => s.type === 'expense');

  return {
    income: income?.total || 0,
    expense: expense?.total || 0,
    balance: (income?.total || 0) - (expense?.total || 0),
    income_count: income?.count || 0,
    expense_count: expense?.count || 0
  };
}

export async function getDailyReport(userId, startDate, endDate) {
  return await query(
    `SELECT
      transaction_date,
      type,
      COALESCE(SUM(amount), 0) as total,
      COUNT(*) as count
    FROM transactions
    WHERE user_id = ? AND transaction_date BETWEEN ? AND ? AND deleted_at IS NULL
    GROUP BY transaction_date, type
    ORDER BY transaction_date ASC`,
    [userId, startDate, endDate]
  );
}

export async function getMonthlyReport(userId, year, month) {
  const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
  const endDate = new Date(year, month, 0).toISOString().split('T')[0];

  const dailyData = await getDailyReport(userId, startDate, endDate);
  const summary = await getPeriodSummary(userId, startDate, endDate);

  return {
    summary,
    dailyData
  };
}

export async function getRecentTransactions(userId, limit = 10) {
  return await query(
    `SELECT
      t.*,
      a.account_name,
      a.icon as account_icon,
      mc.name as category_name,
      mc.icon as category_icon,
      mc.color as category_color
    FROM transactions t
    JOIN accounts a ON t.account_id = a.id
    JOIN money_categories mc ON t.category_id = mc.id
    WHERE t.user_id = ? AND t.deleted_at IS NULL
    ORDER BY t.transaction_date DESC, t.created_at DESC
    LIMIT ?`,
    [userId, limit]
  );
}
