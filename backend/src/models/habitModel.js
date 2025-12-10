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
  let whereClause = 'WHERE h.user_id = ?';

  if (view === 'active') {
    whereClause += ' AND h.deleted_at IS NULL AND h.graduated_date IS NULL';
  } else if (view === 'completed') {
    whereClause += ' AND h.graduated_date IS NOT NULL';
  } else if (view === 'deleted') {
    whereClause += ' AND h.deleted_at IS NOT NULL';
  } else {
    // Default to active if invalid view
    whereClause += ' AND h.deleted_at IS NULL AND h.graduated_date IS NULL';
  }

  const today = getToday();

  return await query(
    `SELECT h.*,
            hc.status as today_status,
            hc.date as last_completion_date,
            (SELECT COUNT(*) FROM habit_skip_days
             WHERE habit_id = h.id AND status = 'available') as skip_days_count
     FROM habits h
     LEFT JOIN habit_completions hc ON h.id = hc.habit_id AND hc.date = ?
     ${whereClause}
     ORDER BY h.current_level DESC, h.created_at ASC`,
    [today, userId]
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

export async function getWeeklyReport(userId) {
  const today = getToday();
  const lastWeek = addDays(today, -7);

  // Get completion stats for last 7 days
  const completions = await query(
    `SELECT DATE(hc.date) as date, COUNT(*) as completed
     FROM habit_completions hc
     JOIN habits h ON hc.habit_id = h.id
     WHERE h.user_id = ? AND hc.status = 'done' AND hc.date >= ?
     GROUP BY DATE(hc.date)
     ORDER BY date ASC`,
    [userId, lastWeek]
  );

  // Get total active habits
  const [habitsCount] = await query(
    `SELECT COUNT(*) as total FROM habits
     WHERE user_id = ? AND deleted_at IS NULL AND graduated_date IS NULL`,
    [userId]
  );

  // Calculate daily data for the week
  const dailyData = [];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  for (let i = 6; i >= 0; i--) {
    const date = addDays(today, -i);
    const dateStr = date;
    const dayOfWeek = new Date(date).getDay();
    const completion = completions.find(c => c.date.toISOString().split('T')[0] === dateStr);

    dailyData.push({
      date: dateStr,
      dayName: dayNames[dayOfWeek],
      completed: completion ? completion.completed : 0,
      total: habitsCount[0].total,
      status: completion && completion.completed >= habitsCount[0].total * 0.7 ? 'excellent' : 'fair'
    });
  }

  const totalCompletions = completions.reduce((sum, c) => sum + c.completed, 0);
  const completionRate = habitsCount[0].total > 0
    ? Math.round((totalCompletions / (habitsCount[0].total * 7)) * 100)
    : 0;

  return {
    completedDays: completions.length,
    longestStreak: completions.length, // Simplified
    completionRate: completionRate,
    totalHabits: habitsCount[0].total,
    dailyData: dailyData
  };
}

export async function getMonthlyReport(userId, month) {
  if (!month) {
    const now = new Date();
    month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  }

  // Get completion stats for the month
  const completions = await query(
    `SELECT DATE(hc.date) as date, COUNT(*) as completed
     FROM habit_completions hc
     JOIN habits h ON hc.habit_id = h.id
     WHERE h.user_id = ? AND DATE_FORMAT(hc.date, '%Y-%m') = ? AND hc.status = 'done'
     GROUP BY DATE(hc.date)
     ORDER BY date ASC`,
    [userId, month]
  );

  // Get total habits count
  const [habitsCount] = await query(
    `SELECT COUNT(*) as total FROM habits
     WHERE user_id = ? AND deleted_at IS NULL`,
    [userId]
  );

  // Build calendar data (intensity heatmap)
  const daysInMonth = new Date(month.split('-')[0], month.split('-')[1], 0).getDate();
  const calendarData = [];

  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${month}-${String(day).padStart(2, '0')}`;
    const completion = completions.find(c => {
      const compDate = c.date.toISOString().split('T')[0];
      return compDate === dateStr;
    });

    const completed = completion ? completion.completed : 0;
    let intensity = 0;
    if (completed > 0) {
      const ratio = completed / habitsCount[0].total;
      if (ratio >= 1) intensity = 4;
      else if (ratio >= 0.75) intensity = 3;
      else if (ratio >= 0.5) intensity = 2;
      else intensity = 1;
    }

    calendarData.push({
      date: dateStr,
      dayNumber: day,
      completed: completed,
      intensity: intensity
    });
  }

  const totalCompletions = completions.reduce((sum, c) => sum + c.completed, 0);
  const perfectDays = completions.filter(c => c.completed >= habitsCount[0].total).length;
  const averageDaily = completions.length > 0
    ? Math.round(totalCompletions / completions.length)
    : 0;

  return {
    totalCompletions: totalCompletions,
    perfectDays: perfectDays,
    averageDaily: averageDaily,
    bestStreak: completions.length, // Simplified
    calendarData: calendarData
  };
}
