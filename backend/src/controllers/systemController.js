import { query } from '../config/database.js';
import os from 'os';

export async function getSystemStatusHandler(req, res) {
  try {
    // Get server metrics
    const uptime = process.uptime();
    const memoryUsage = process.memoryUsage().heapUsed;
    const cpuUsage = process.cpuUsage();

    // Get database statistics
    const userCountResult = await query('SELECT COUNT(*) as count FROM users');
    const habitCountResult = await query('SELECT COUNT(*) as count FROM habits WHERE deleted_at IS NULL');
    const taskCountResult = await query('SELECT COUNT(*) as count FROM daily_tasks WHERE deleted_at IS NULL');
    const completionCountResult = await query('SELECT COUNT(*) as count FROM habit_completions');

    const userCount = userCountResult[0]?.count || 0;
    const habitCount = habitCountResult[0]?.count || 0;
    const taskCount = taskCountResult[0]?.count || 0;
    const completionCount = completionCountResult[0]?.count || 0;

    // Get recent activity (last 10 actions)
    const recentActivity = await query(`
      (SELECT 'habit' as type, name, created_at as timestamp
       FROM habits
       WHERE deleted_at IS NULL
       ORDER BY created_at DESC
       LIMIT 5)
      UNION ALL
      (SELECT 'task' as type, name, created_at as timestamp
       FROM daily_tasks
       WHERE deleted_at IS NULL
       ORDER BY created_at DESC
       LIMIT 5)
      ORDER BY timestamp DESC
      LIMIT 10
    `);

    // Format recent activity
    const formattedActivity = recentActivity.map(activity => ({
      icon: activity.type === 'habit' ? '🎯' : '✅',
      message: `New ${activity.type} created: ${activity.name}`,
      timestamp: new Date(activity.timestamp).toLocaleString()
    }));

    // Build response
    const systemData = {
      timestamp: new Date().toISOString(),
      server: {
        status: 'healthy',
        uptime: uptime,
        cpu: '0',  // Placeholder - actual CPU calculation would need more processing
        memory: memoryUsage,
        connections: 0  // Placeholder
      },
      database: {
        status: 'connected',
        totalUsers: userCount,
        totalHabits: habitCount,
        totalTasks: taskCount,
        completions: completionCount
      },
      api: {
        status: 'healthy',
        avgResponseTime: 50,  // Placeholder
        requestsLastHour: 0,  // Placeholder
        errorRate: 0  // Placeholder
      },
      recentActivity: formattedActivity
    };

    res.json(systemData);
  } catch (error) {
    console.error('Get system status error:', error);
    res.status(500).json({ error: 'Failed to fetch system status' });
  }
}
