import { query } from '../config/database.js';
import { updateAccountBalance } from './accountModel.js';

export async function createTransfer(userId, transferData) {
  const {
    from_account_id,
    to_account_id,
    amount,
    description,
    transfer_date
  } = transferData;

  // Validate that accounts are different
  if (from_account_id === to_account_id) {
    throw new Error('Cannot transfer to the same account');
  }

  const result = await query(
    `INSERT INTO transfers (user_id, from_account_id, to_account_id, amount, description, transfer_date)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [userId, from_account_id, to_account_id, amount, description, transfer_date]
  );

  // Update account balances
  await updateAccountBalance(from_account_id, amount, 'subtract');
  await updateAccountBalance(to_account_id, amount, 'add');

  return result.insertId;
}

export async function getTransfersByUser(userId, filters = {}) {
  let sql = `
    SELECT
      tr.*,
      a1.account_name as from_account_name,
      a1.icon as from_account_icon,
      a2.account_name as to_account_name,
      a2.icon as to_account_icon
    FROM transfers tr
    JOIN accounts a1 ON tr.from_account_id = a1.id
    JOIN accounts a2 ON tr.to_account_id = a2.id
    WHERE tr.user_id = ?
  `;

  const params = [userId];

  if (filters.account_id) {
    sql += ` AND (tr.from_account_id = ? OR tr.to_account_id = ?)`;
    params.push(filters.account_id, filters.account_id);
  }

  if (filters.start_date) {
    sql += ` AND tr.transfer_date >= ?`;
    params.push(filters.start_date);
  }

  if (filters.end_date) {
    sql += ` AND tr.transfer_date <= ?`;
    params.push(filters.end_date);
  }

  sql += ` ORDER BY tr.transfer_date DESC, tr.created_at DESC`;

  if (filters.limit) {
    sql += ` LIMIT ?`;
    params.push(parseInt(filters.limit));
  }

  return await query(sql, params);
}

export async function getTransferById(transferId, userId) {
  const transfers = await query(
    `SELECT
      tr.*,
      a1.account_name as from_account_name,
      a1.icon as from_account_icon,
      a2.account_name as to_account_name,
      a2.icon as to_account_icon
    FROM transfers tr
    JOIN accounts a1 ON tr.from_account_id = a1.id
    JOIN accounts a2 ON tr.to_account_id = a2.id
    WHERE tr.id = ? AND tr.user_id = ?`,
    [transferId, userId]
  );

  return transfers[0] || null;
}

export async function deleteTransfer(transferId, userId) {
  // Get transfer to reverse balance changes
  const transfer = await getTransferById(transferId, userId);
  if (!transfer) return false;

  // Delete transfer
  await query(
    `DELETE FROM transfers WHERE id = ? AND user_id = ?`,
    [transferId, userId]
  );

  // Reverse balance changes
  await updateAccountBalance(transfer.from_account_id, transfer.amount, 'add');
  await updateAccountBalance(transfer.to_account_id, transfer.amount, 'subtract');

  return true;
}
