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

export async function getWeeklyReport(userId) {
  const today = getToday();
  const lastWeek = new Date();
  lastWeek.setDate(lastWeek.getDate() - 7);
  const lastWeekStr = lastWeek.toISOString().split('T')[0];

  // Get completed tasks in last 7 days
  const [completedTasks] = await query(
    `SELECT COUNT(*) as count FROM daily_tasks
     WHERE user_id = ? AND completed_at >= ? AND completed_at IS NOT NULL`,
    [userId, lastWeekStr]
  );

  // Get overdue tasks
  const [overdueTasks] = await query(
    `SELECT COUNT(*) as count FROM daily_tasks
     WHERE user_id = ? AND deadline < ? AND completed_at IS NULL AND deleted_at IS NULL`,
    [userId, today]
  );

  // Get total tasks
  const [totalTasks] = await query(
    `SELECT COUNT(*) as count FROM daily_tasks
     WHERE user_id = ? AND deleted_at IS NULL`,
    [userId]
  );

  // Calculate on-time rate
  const [onTimeTasks] = await query(
    `SELECT COUNT(*) as count FROM daily_tasks
     WHERE user_id = ? AND completed_at <= deadline AND completed_at IS NOT NULL`,
    [userId]
  );

  const onTimeRate = completedTasks[0].count > 0
    ? Math.round((onTimeTasks[0].count / completedTasks[0].count) * 100)
    : 0;

  return {
    completedTasks: completedTasks[0].count,
    overdueTasks: overdueTasks[0].count,
    onTimeRate: onTimeRate,
    totalTasks: totalTasks[0].count
  };
}

export async function getMonthlyReport(userId, month) {
  if (!month) {
    const now = new Date();
    month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  }

  // Get completed tasks in the month
  const [completedTasks] = await query(
    `SELECT COUNT(*) as count FROM daily_tasks
     WHERE user_id = ? AND DATE_FORMAT(completed_at, '%Y-%m') = ? AND completed_at IS NOT NULL`,
    [userId, month]
  );

  // Get deleted tasks in the month
  const [deletedTasks] = await query(
    `SELECT COUNT(*) as count FROM daily_tasks
     WHERE user_id = ? AND DATE_FORMAT(deleted_at, '%Y-%m') = ? AND deleted_at IS NOT NULL`,
    [userId, month]
  );

  // Get on-time completion
  const [onTimeTasks] = await query(
    `SELECT COUNT(*) as count FROM daily_tasks
     WHERE user_id = ? AND DATE_FORMAT(completed_at, '%Y-%m') = ?
     AND completed_at <= deadline AND completed_at IS NOT NULL`,
    [userId, month]
  );

  const onTimeCompletion = completedTasks[0].count > 0
    ? Math.round((onTimeTasks[0].count / completedTasks[0].count) * 100)
    : 0;

  // Get total extensions used
  const [totalExtensions] = await query(
    `SELECT SUM(extension_count) as total FROM daily_tasks
     WHERE user_id = ? AND DATE_FORMAT(created_at, '%Y-%m') = ?`,
    [userId, month]
  );

  return {
    completedTasks: completedTasks[0].count,
    deletedTasks: deletedTasks[0].count,
    onTimeCompletion: onTimeCompletion,
    totalExtensions: totalExtensions[0].total || 0
  };
}
