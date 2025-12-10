import { query } from '../config/database.js';

export async function createAccount(userId, accountData) {
  const {
    account_name,
    account_type,
    balance = 0,
    bank_name,
    account_number,
    credit_limit,
    due_date,
    color = '#667eea',
    icon = '💰'
  } = accountData;

  const result = await query(
    `INSERT INTO accounts (user_id, account_name, account_type, balance, bank_name, account_number, credit_limit, due_date, color, icon)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [userId, account_name, account_type, balance, bank_name, account_number, credit_limit, due_date, color, icon]
  );

  return result.insertId;
}

export async function getAccountsByUser(userId) {
  return await query(
    `SELECT * FROM accounts
     WHERE user_id = ? AND is_active = TRUE
     ORDER BY created_at DESC`,
    [userId]
  );
}

export async function getAccountById(accountId, userId) {
  const accounts = await query(
    `SELECT * FROM accounts
     WHERE id = ? AND user_id = ? AND is_active = TRUE`,
    [accountId, userId]
  );

  return accounts[0] || null;
}

export async function updateAccount(accountId, userId, updates) {
  const allowedFields = ['account_name', 'account_type', 'bank_name', 'account_number', 'credit_limit', 'due_date', 'color', 'icon'];
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

  values.push(accountId, userId);

  await query(
    `UPDATE accounts SET ${fields.join(', ')}
     WHERE id = ? AND user_id = ? AND is_active = TRUE`,
    values
  );

  return true;
}

export async function deleteAccount(accountId, userId) {
  // Soft delete - mark as inactive
  await query(
    `UPDATE accounts SET is_active = FALSE
     WHERE id = ? AND user_id = ?`,
    [accountId, userId]
  );

  return true;
}

export async function updateAccountBalance(accountId, amount, operation = 'add') {
  if (operation === 'add') {
    await query(
      `UPDATE accounts SET balance = balance + ?
       WHERE id = ?`,
      [amount, accountId]
    );
  } else if (operation === 'subtract') {
    await query(
      `UPDATE accounts SET balance = balance - ?
       WHERE id = ?`,
      [amount, accountId]
    );
  } else if (operation === 'set') {
    await query(
      `UPDATE accounts SET balance = ?
       WHERE id = ?`,
      [amount, accountId]
    );
  }

  return true;
}

export async function getAccountBalance(accountId) {
  const accounts = await query(
    `SELECT balance FROM accounts WHERE id = ?`,
    [accountId]
  );

  return accounts[0]?.balance || 0;
}

export async function getTotalBalance(userId) {
  const result = await query(
    `SELECT SUM(balance) as total FROM accounts
     WHERE user_id = ? AND is_active = TRUE`,
    [userId]
  );

  return result[0]?.total || 0;
}
