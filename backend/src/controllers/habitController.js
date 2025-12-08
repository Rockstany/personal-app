import * as habitModel from '../models/habitModel.js';
import { getToday } from '../utils/levelCalculator.js';

export async function createHabitHandler(req, res) {
  try {
    const habitId = await habitModel.createHabit(req.userId, req.body);
    res.status(201).json({ id: habitId, message: 'Habit created successfully' });
  } catch (error) {
    console.error('Create habit error:', error);
    res.status(500).json({ error: 'Failed to create habit' });
  }
}

export async function getHabitsHandler(req, res) {
  try {
    const habits = await habitModel.getHabitsByUser(req.userId);
    res.json(habits);
  } catch (error) {
    console.error('Get habits error:', error);
    res.status(500).json({ error: 'Failed to fetch habits' });
  }
}

export async function getHabitHandler(req, res) {
  try {
    const habit = await habitModel.getHabitById(req.params.id, req.userId);
    if (!habit) {
      return res.status(404).json({ error: 'Habit not found' });
    }
    res.json(habit);
  } catch (error) {
    console.error('Get habit error:', error);
    res.status(500).json({ error: 'Failed to fetch habit' });
  }
}

export async function updateHabitHandler(req, res) {
  try {
    const success = await habitModel.updateHabit(req.params.id, req.userId, req.body);
    if (!success) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }
    res.json({ message: 'Habit updated successfully' });
  } catch (error) {
    console.error('Update habit error:', error);
    res.status(500).json({ error: 'Failed to update habit' });
  }
}

export async function deleteHabitHandler(req, res) {
  try {
    const { reason } = req.body;
    await habitModel.deleteHabit(req.params.id, req.userId, reason);
    res.json({ message: 'Habit deleted successfully' });
  } catch (error) {
    console.error('Delete habit error:', error);
    res.status(500).json({ error: 'Failed to delete habit' });
  }
}

export async function completeHabitHandler(req, res) {
  try {
    const { status, value, skipDayId } = req.body;
    const date = req.body.date || getToday();

    if (status === 'skip' && skipDayId) {
      await habitModel.useSkipDay(req.params.id, skipDayId, date);
    }

    await habitModel.recordCompletion(req.params.id, date, status, value, false);

    const habit = await habitModel.getHabitById(req.params.id, req.userId);

    res.json({
      message: 'Completion recorded',
      habit
    });
  } catch (error) {
    console.error('Complete habit error:', error);
    res.status(500).json({ error: 'Failed to record completion' });
  }
}

export async function syncCompletionHandler(req, res) {
  try {
    const { date, status, value } = req.body;
    await habitModel.recordCompletion(req.params.id, date, status, value, true);

    const habit = await habitModel.getHabitById(req.params.id, req.userId);

    res.json({
      message: 'Completion synced',
      habit
    });
  } catch (error) {
    console.error('Sync completion error:', error);
    res.status(500).json({ error: 'Failed to sync completion' });
  }
}

export async function getCalendarHandler(req, res) {
  try {
    const { month } = req.params;
    const calendar = await habitModel.getMonthlyCalendar(req.params.id, month);
    res.json(calendar);
  } catch (error) {
    console.error('Get calendar error:', error);
    res.status(500).json({ error: 'Failed to fetch calendar' });
  }
}

export async function getSkipDaysHandler(req, res) {
  try {
    const skipDays = await habitModel.getAvailableSkipDays(req.params.id);
    res.json(skipDays);
  } catch (error) {
    console.error('Get skip days error:', error);
    res.status(500).json({ error: 'Failed to fetch skip days' });
  }
}
