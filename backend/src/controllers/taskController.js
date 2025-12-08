import * as taskModel from '../models/taskModel.js';

export async function createTaskHandler(req, res) {
  try {
    const taskId = await taskModel.createTask(req.userId, req.body);
    res.status(201).json({ id: taskId, message: 'Task created successfully' });
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ error: 'Failed to create task' });
  }
}

export async function getTasksHandler(req, res) {
  try {
    const { filter } = req.query;
    const tasks = await taskModel.getTasks(req.userId, filter);
    res.json(tasks);
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
}

export async function getTaskHandler(req, res) {
  try {
    const task = await taskModel.getTaskById(req.params.id, req.userId);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.json(task);
  } catch (error) {
    console.error('Get task error:', error);
    res.status(500).json({ error: 'Failed to fetch task' });
  }
}

export async function updateTaskHandler(req, res) {
  try {
    const success = await taskModel.updateTask(req.params.id, req.userId, req.body);
    if (!success) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }
    res.json({ message: 'Task updated successfully' });
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ error: 'Failed to update task' });
  }
}

export async function completeTaskHandler(req, res) {
  try {
    await taskModel.completeTask(req.params.id, req.userId);
    res.json({ message: 'Task completed successfully' });
  } catch (error) {
    console.error('Complete task error:', error);
    res.status(500).json({ error: 'Failed to complete task' });
  }
}

export async function deleteTaskHandler(req, res) {
  try {
    const { reason } = req.body;
    await taskModel.deleteTask(req.params.id, req.userId, reason);
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ error: 'Failed to delete task' });
  }
}
