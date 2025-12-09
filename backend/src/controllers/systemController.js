import { query } from '../config/database.js';
import os from 'os';

export async function getSystemStatusHandler(req, res) {
  try {
    // Get server metrics
    const uptime = process.uptime();
    const memoryUsage = process.memoryUsage().heapUsed;
    const cpuUsage = process.cpuUsage();

    // Get database statistics
    const [userCount] = await query('SELECT COUNT(*) as count FROM users');
    const [habitCount] = await query('SELECT COUNT(*) as count FROM habits WHERE deleted_at IS NULL');
    const [taskCount] = await query('SELECT COUNT(*) as count FROM daily_tasks WHERE deleted_at IS NULL');
    const [completionCount] = await query('SELECT COUNT(*) as count FROM habit_completions');

    // Get recent activity (last 10 actions)
    const recentActivity = await query(`
      SELECT 'habit' as type, name, created_at as timestamp
      FROM habits
      WHERE deleted_at IS NULL
      ORDER BY created_at DESC
      LIMIT 5
      UNION ALL
      SELECT 'task' as type, name, created_at as timestamp
      FROM daily_tasks
      WHERE deleted_at IS NULL
      ORDER BY created_at DESC
      LIMIT 5
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
        totalUsers: userCount[0].count,
        totalHabits: habitCount[0].count,
        totalTasks: taskCount[0].count,
        completions: completionCount[0].count
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
