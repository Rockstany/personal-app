import cron from 'node-cron';
import { query } from '../config/database.js';
import { getToday } from '../utils/levelCalculator.js';

export async function markHabitsAsNotDone() {
  const today = getToday();

  try {
    const habitsWithoutCompletion = await query(
      `SELECT h.id FROM habits h
       WHERE h.deleted_at IS NULL
       AND NOT EXISTS (
         SELECT 1 FROM habit_completions hc
         WHERE hc.habit_id = h.id AND hc.date = ?
       )`,
      [today]
    );

    for (const habit of habitsWithoutCompletion) {
      await query(
        `INSERT INTO habit_completions (habit_id, date, status, marked_offline)
         VALUES (?, ?, 'not_done', FALSE)`,
        [habit.id, today]
      );
    }

    console.log(`Auto marked ${habitsWithoutCompletion.length} habits as not_done for ${today}`);

    await expireSkipDays();
  } catch (error) {
    console.error('Error in auto not done job:', error);
  }
}

export async function expireSkipDays() {
  const today = getToday();

  try {
    const result = await query(
      `UPDATE habit_skip_days
       SET status = 'expired'
       WHERE status = 'available'
       AND expiry_date < ?`,
      [today]
    );

    console.log(`Expired ${result.affectedRows} skip days`);
  } catch (error) {
    console.error('Error expiring skip days:', error);
  }
}

export function startAutoNotDoneJob() {
  cron.schedule('59 23 * * *', async () => {
    console.log('Running auto not done job at 11:59 PM');
    await markHabitsAsNotDone();
  });

  console.log('Auto not done cron job scheduled for 11:59 PM daily');
}
