import { query } from '../config/database.js';
import { calculateDurationLevel, calculateNumericLevel, getToday, addDays } from '../utils/levelCalculator.js';

export async function createHabit(userId, habitData) {
  const {
    name,
    motivation,
    target_type,
    target_value,
    target_unit,
    daily_target,
    trigger,
    category,
    priority
  } = habitData;

  const result = await query(
    `INSERT INTO habits (user_id, name, motivation, target_type, target_value, target_unit, daily_target, \`trigger\`, category, priority, start_date)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [userId, name, motivation, target_type, target_value, target_unit, daily_target, trigger, category, priority, getToday()]
  );

  return result.insertId;
}

export async function getHabitsByUser(userId, view = 'active') {
  let whereClause = 'WHERE user_id = ?';

  if (view === 'active') {
    whereClause += ' AND deleted_at IS NULL AND graduated_date IS NULL';
  } else if (view === 'completed') {
    whereClause += ' AND graduated_date IS NOT NULL';
  } else if (view === 'deleted') {
    whereClause += ' AND deleted_at IS NOT NULL';
  } else {
    // Default to active if invalid view
    whereClause += ' AND deleted_at IS NULL AND graduated_date IS NULL';
  }

  return await query(
    `SELECT * FROM habits
     ${whereClause}
     ORDER BY current_level DESC, created_at ASC`,
    [userId]
  );
}

export async function getHabitById(habitId, userId) {
  const habits = await query(
    `SELECT * FROM habits
     WHERE id = ? AND user_id = ? AND deleted_at IS NULL`,
    [habitId, userId]
  );

  return habits[0] || null;
}

export async function updateHabit(habitId, userId, updates) {
  const allowedFields = ['name', 'motivation', 'target_value', 'target_unit', 'daily_target', 'trigger', 'category', 'priority'];
  const fields = [];
  const values = [];

  for (const [key, value] of Object.entries(updates)) {
    if (allowedFields.includes(key)) {
      const fieldName = key === 'trigger' ? '`trigger`' : key;
      fields.push(`${fieldName} = ?`);
      values.push(value);
    }
  }

  if (fields.length === 0) {
    return false;
  }

  if (updates.target_value !== undefined) {
    fields.push('current_progress = ?');
    values.push(0);
  }

  values.push(habitId, userId);

  await query(
    `UPDATE habits SET ${fields.join(', ')}
     WHERE id = ? AND user_id = ? AND deleted_at IS NULL`,
    values
  );

  return true;
}

export async function deleteHabit(habitId, userId, reason) {
  await query(
    `UPDATE habits SET deleted_at = NOW(), deletion_reason = ?
     WHERE id = ? AND user_id = ?`,
    [reason, habitId, userId]
  );

  await query(
    `DELETE FROM habit_skip_days WHERE habit_id = ?`,
    [habitId]
  );

  return true;
}

export async function recordCompletion(habitId, date, status, value = null, markedOffline = false) {
  await query(
    `INSERT INTO habit_completions (habit_id, date, status, value, marked_offline, synced_at)
     VALUES (?, ?, ?, ?, ?, NOW())
     ON DUPLICATE KEY UPDATE status = ?, value = ?, synced_at = NOW()`,
    [habitId, date, status, value, markedOffline, status, value]
  );

  await updateHabitLevel(habitId);

  return true;
}

export async function updateHabitLevel(habitId) {
  const habits = await query('SELECT * FROM habits WHERE id = ?', [habitId]);
  const habit = habits[0];

  if (!habit) return;

  if (habit.target_type === 'duration_90') {
    const completions = await query(
      `SELECT date, status FROM habit_completions
       WHERE habit_id = ? AND status = 'done'
       ORDER BY date DESC`,
      [habitId]
    );

    let consecutiveDays = 0;
    const today = new Date();

    for (const completion of completions) {
      const completionDate = new Date(completion.date);
      const dayDiff = Math.floor((today - completionDate) / (1000 * 60 * 60 * 24));

      if (dayDiff === consecutiveDays) {
        consecutiveDays++;
      } else {
        break;
      }
    }

    const newLevel = calculateDurationLevel(consecutiveDays);
    const oldLevel = habit.current_level;

    await query(
      `UPDATE habits SET current_level = ? WHERE id = ?`,
      [newLevel, habitId]
    );

    if (newLevel > oldLevel) {
      await addSkipDaysForLevel(habitId, newLevel);
    }

    if (consecutiveDays >= 90 && !habit.graduated_date) {
      await query(
        `UPDATE habits SET graduated_date = ? WHERE id = ?`,
        [getToday(), habitId]
      );
    }
  } else if (habit.target_type === 'numeric') {
    const completions = await query(
      `SELECT SUM(value) as total FROM habit_completions
       WHERE habit_id = ? AND status = 'done'`,
      [habitId]
    );

    const totalProgress = completions[0]?.total || 0;
    const newLevel = calculateNumericLevel(totalProgress, habit.target_value);
    const oldLevel = habit.current_level;

    await query(
      `UPDATE habits SET current_level = ?, current_progress = ? WHERE id = ?`,
      [newLevel, totalProgress, habitId]
    );

    if (newLevel > oldLevel) {
      await addSkipDaysForLevel(habitId, newLevel);
    }
  }
}

export async function addSkipDaysForLevel(habitId, level) {
  const settings = await query('SELECT skip_expiry_days FROM settings WHERE user_id = (SELECT user_id FROM habits WHERE id = ?)', [habitId]);
  const expiryDays = settings[0]?.skip_expiry_days || 5;

  const today = getToday();
  const expiryDate = addDays(today, expiryDays);

  await query(
    `INSERT INTO habit_skip_days (habit_id, level_earned_at, earned_date, expiry_date)
     VALUES (?, ?, ?, ?)`,
    [habitId, level, today, expiryDate]
  );
}

export async function getAvailableSkipDays(habitId) {
  return await query(
    `SELECT * FROM habit_skip_days
     WHERE habit_id = ? AND status = 'available'
     ORDER BY expiry_date ASC`,
    [habitId]
  );
}

export async function useSkipDay(habitId, skipDayId, date) {
  await query(
    `UPDATE habit_skip_days SET status = 'used', used_date = ?
     WHERE id = ? AND habit_id = ? AND status = 'available'`,
    [date, skipDayId, habitId]
  );
}

export async function getMonthlyCalendar(habitId, month) {
  return await query(
    `SELECT date, status FROM habit_completions
     WHERE habit_id = ? AND DATE_FORMAT(date, '%Y-%m') = ?
     ORDER BY date ASC`,
    [habitId, month]
  );
}
