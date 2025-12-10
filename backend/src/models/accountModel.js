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

  // Convert empty strings to null for numeric fields
  const sanitizedCreditLimit = credit_limit === '' || credit_limit === undefined ? null : credit_limit;
  const sanitizedDueDate = due_date === '' || due_date === undefined ? null : due_date;
  const sanitizedBankName = bank_name === '' ? null : bank_name;
  const sanitizedAccountNumber = account_number === '' ? null : account_number;

  const result = await query(
    `INSERT INTO accounts (user_id, account_name, account_type, balance, bank_name, account_number, credit_limit, due_date, color, icon)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [userId, account_name, account_type, balance, sanitizedBankName, sanitizedAccountNumber, sanitizedCreditLimit, sanitizedDueDate, color, icon]
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

export async function recalculateAccountBalance(accountId, userId) {
  // Get all transactions for this account
  const transactions = await query(
    `SELECT type, amount FROM transactions
     WHERE account_id = ? AND user_id = ?`,
    [accountId, userId]
  );

  // Get all transfers affecting this account
  const transfersFrom = await query(
    `SELECT amount FROM transfers
     WHERE from_account_id = ? AND user_id = ?`,
    [accountId, userId]
  );

  const transfersTo = await query(
    `SELECT amount FROM transfers
     WHERE to_account_id = ? AND user_id = ?`,
    [accountId, userId]
  );

  // Get sum of all income transactions
  const incomeSum = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);

  // Get sum of all expense transactions
  const expenseSum = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);

  // Get sum of transfers out
  const transfersOutSum = transfersFrom.reduce((sum, t) => sum + parseFloat(t.amount), 0);

  // Get sum of transfers in
  const transfersInSum = transfersTo.reduce((sum, t) => sum + parseFloat(t.amount), 0);

  // Calculate balance: starting from 0, add income, subtract expenses and outgoing transfers, add incoming transfers
  const calculatedBalance = incomeSum - expenseSum - transfersOutSum + transfersInSum;

  // Update the account balance
  await query(
    `UPDATE accounts SET balance = ? WHERE id = ? AND user_id = ?`,
    [calculatedBalance, accountId, userId]
  );

  return calculatedBalance;
}

export async function recalculateAllBalances(userId) {
  const accounts = await getAccountsByUser(userId);
  const results = [];

  for (const account of accounts) {
    const newBalance = await recalculateAccountBalance(account.id, userId);
    results.push({
      accountId: account.id,
      accountName: account.account_name,
      oldBalance: account.balance,
      newBalance: newBalance
    });
  }

  return results;
}
