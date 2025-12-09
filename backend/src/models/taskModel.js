import { query } from '../config/database.js';
import { getToday } from '../utils/levelCalculator.js';

export async function createTask(userId, taskData) {
  const { name, notes, deadline, max_extensions } = taskData;

  const result = await query(
    `INSERT INTO daily_tasks (user_id, name, notes, deadline, max_extensions)
     VALUES (?, ?, ?, ?, ?)`,
    [userId, name, notes, deadline, max_extensions || 2]
  );

  return result.insertId;
}

export async function getTasks(userId, filter = 'today') {
  const today = getToday();

  let sql = '';
  let params = [];

  if (filter === 'today') {
    sql = `SELECT * FROM daily_tasks
           WHERE user_id = ? AND deadline = ? AND completed_at IS NULL AND deleted_at IS NULL
           ORDER BY deadline ASC`;
    params = [userId, today];
  } else if (filter === 'upcoming') {
    sql = `SELECT * FROM daily_tasks
           WHERE user_id = ? AND deadline > ? AND completed_at IS NULL AND deleted_at IS NULL
           ORDER BY deadline ASC`;
    params = [userId, today];
  } else if (filter === 'completed') {
    sql = `SELECT * FROM daily_tasks
           WHERE user_id = ? AND completed_at IS NOT NULL
           ORDER BY completed_at DESC`;
    params = [userId];
  } else if (filter === 'deleted') {
    sql = `SELECT id, name, deletion_reason, deleted_at FROM daily_tasks
           WHERE user_id = ? AND deleted_at IS NOT NULL
           ORDER BY deleted_at DESC`;
    params = [userId];
  } else if (filter === 'overdue') {
    sql = `SELECT * FROM daily_tasks
           WHERE user_id = ? AND deadline < ? AND completed_at IS NULL AND deleted_at IS NULL
           ORDER BY deadline ASC`;
    params = [userId, today];
  }

  return await query(sql, params);
}

export async function getTaskById(taskId, userId) {
  const tasks = await query(
    `SELECT * FROM daily_tasks
     WHERE id = ? AND user_id = ? AND deleted_at IS NULL`,
    [taskId, userId]
  );

  return tasks[0] || null;
}

export async function updateTask(taskId, userId, updates) {
  const allowedFields = ['name', 'notes', 'deadline', 'max_extensions', 'extension_count', 'reassignment_reason'];
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

  values.push(taskId, userId);

  await query(
    `UPDATE daily_tasks SET ${fields.join(', ')}
     WHERE id = ? AND user_id = ? AND deleted_at IS NULL`,
    values
  );

  return true;
}

export async function completeTask(taskId, userId) {
  await query(
    `UPDATE daily_tasks SET completed_at = NOW()
     WHERE id = ? AND user_id = ? AND deleted_at IS NULL`,
    [taskId, userId]
  );

  return true;
}

export async function deleteTask(taskId, userId, reason) {
  await query(
    `UPDATE daily_tasks SET deleted_at = NOW(), deletion_reason = ?
     WHERE id = ? AND user_id = ?`,
    [reason, taskId, userId]
  );

  return true;
}
