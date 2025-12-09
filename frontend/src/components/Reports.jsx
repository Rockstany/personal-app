import { useState, useEffect } from 'react';
import { habitService } from '../services/habitService';
import { taskService } from '../services/taskService';
import '../styles/Reports.css';

function Reports({ showToast }) {
  const [reportType, setReportType] = useState('weekly'); // 'weekly' or 'monthly'
  const [habitStats, setHabitStats] = useState(null);
  const [taskStats, setTaskStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  useEffect(() => {
    loadReportData();
  }, [reportType, selectedMonth]);

  const loadReportData = async () => {
    setLoading(true);
    try {
      const endpoint = reportType === 'weekly' ? 'weekly-report' : `monthly-report?month=${selectedMonth}`;

      const [habitsRes, tasksRes] = await Promise.all([
        habitService.getReport(endpoint),
        taskService.getReport(endpoint)
      ]);

      setHabitStats(habitsRes.data);
      setTaskStats(tasksRes.data);
    } catch (error) {
      console.error('Error loading report:', error);
      showToast('❌ Failed to load report data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const renderWeeklyReport = () => {
    if (!habitStats || !taskStats) return null;

    return (
      <div className="report-content">
        <div className="report-header">
          <h2 className="report-title">📊 Weekly Report</h2>
          <p className="report-subtitle">Last 7 days performance</p>
        </div>

        {/* Habits Section */}
        <div className="report-section">
          <h3 className="section-header">🎯 Habits Performance</h3>
          <div className="stats-grid">
            <div className="stat-card primary">
              <div className="stat-icon">✅</div>
              <div className="stat-content">
                <div className="stat-value">{habitStats.completedDays || 0}</div>
                <div className="stat-label">Days Completed</div>
              </div>
            </div>
            <div className="stat-card success">
              <div className="stat-icon">🔥</div>
              <div className="stat-content">
                <div className="stat-value">{habitStats.longestStreak || 0}</div>
                <div className="stat-label">Longest Streak</div>
              </div>
            </div>
            <div className="stat-card info">
              <div className="stat-icon">📈</div>
              <div className="stat-content">
                <div className="stat-value">{habitStats.completionRate || 0}%</div>
                <div className="stat-label">Completion Rate</div>
              </div>
            </div>
            <div className="stat-card warning">
              <div className="stat-icon">⭐</div>
              <div className="stat-content">
                <div className="stat-value">{habitStats.totalHabits || 0}</div>
                <div className="stat-label">Active Habits</div>
              </div>
            </div>
          </div>

          {/* Daily Calendar View */}
          {habitStats.dailyData && habitStats.dailyData.length > 0 && (
            <div className="calendar-view">
              <h4 className="calendar-title">Daily Progress</h4>
              <div className="calendar-grid">
                {habitStats.dailyData.map((day, index) => (
                  <div key={index} className="calendar-day">
                    <div className="day-name">{day.dayName}</div>
                    <div className={`day-status ${day.status}`}>
                      {day.completed || 0}/{day.total || 0}
                    </div>
                    <div className="day-date">{day.date}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Tasks Section */}
        <div className="report-section">
          <h3 className="section-header">✅ Tasks Performance</h3>
          <div className="stats-grid">
            <div className="stat-card primary">
              <div className="stat-icon">✔️</div>
              <div className="stat-content">
                <div className="stat-value">{taskStats.completedTasks || 0}</div>
                <div className="stat-label">Tasks Completed</div>
              </div>
            </div>
            <div className="stat-card danger">
              <div className="stat-icon">⚠️</div>
              <div className="stat-content">
                <div className="stat-value">{taskStats.overdueTasks || 0}</div>
                <div className="stat-label">Overdue Tasks</div>
              </div>
            </div>
            <div className="stat-card success">
              <div className="stat-icon">🎯</div>
              <div className="stat-content">
                <div className="stat-value">{taskStats.onTimeRate || 0}%</div>
                <div className="stat-label">On-Time Rate</div>
              </div>
            </div>
            <div className="stat-card info">
              <div className="stat-icon">📋</div>
              <div className="stat-content">
                <div className="stat-value">{taskStats.totalTasks || 0}</div>
                <div className="stat-label">Total Tasks</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderMonthlyReport = () => {
    if (!habitStats || !taskStats) return null;

    return (
      <div className="report-content">
        <div className="report-header">
          <h2 className="report-title">📅 Monthly Report</h2>
          <div className="month-selector">
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="month-input"
            />
          </div>
        </div>

        {/* Habits Section */}
        <div className="report-section">
          <h3 className="section-header">🎯 Habits Summary</h3>
          <div className="stats-grid">
            <div className="stat-card primary">
              <div className="stat-icon">📊</div>
              <div className="stat-content">
                <div className="stat-value">{habitStats.totalCompletions || 0}</div>
                <div className="stat-label">Total Completions</div>
              </div>
            </div>
            <div className="stat-card success">
              <div className="stat-icon">🏆</div>
              <div className="stat-content">
                <div className="stat-value">{habitStats.perfectDays || 0}</div>
                <div className="stat-label">Perfect Days</div>
              </div>
            </div>
            <div className="stat-card info">
              <div className="stat-icon">📈</div>
              <div className="stat-content">
                <div className="stat-value">{habitStats.averageDaily || 0}</div>
                <div className="stat-label">Avg Daily</div>
              </div>
            </div>
            <div className="stat-card warning">
              <div className="stat-icon">🔥</div>
              <div className="stat-content">
                <div className="stat-value">{habitStats.bestStreak || 0}</div>
                <div className="stat-label">Best Streak</div>
              </div>
            </div>
          </div>

          {/* Monthly Calendar Heatmap */}
          {habitStats.calendarData && habitStats.calendarData.length > 0 && (
            <div className="heatmap-container">
              <h4 className="calendar-title">Monthly Heatmap</h4>
              <div className="heatmap-grid">
                {habitStats.calendarData.map((day, index) => (
                  <div
                    key={index}
                    className={`heatmap-cell intensity-${day.intensity || 0}`}
                    title={`${day.date}: ${day.completed} completed`}
                  >
                    <span className="cell-date">{day.dayNumber}</span>
                  </div>
                ))}
              </div>
              <div className="heatmap-legend">
                <span>Less</span>
                <div className="legend-scale">
                  <div className="legend-cell intensity-0"></div>
                  <div className="legend-cell intensity-1"></div>
                  <div className="legend-cell intensity-2"></div>
                  <div className="legend-cell intensity-3"></div>
                  <div className="legend-cell intensity-4"></div>
                </div>
                <span>More</span>
              </div>
            </div>
          )}
        </div>

        {/* Tasks Section */}
        <div className="report-section">
          <h3 className="section-header">✅ Tasks Summary</h3>
          <div className="stats-grid">
            <div className="stat-card primary">
              <div className="stat-icon">✔️</div>
              <div className="stat-content">
                <div className="stat-value">{taskStats.completedTasks || 0}</div>
                <div className="stat-label">Completed</div>
              </div>
            </div>
            <div className="stat-card danger">
              <div className="stat-icon">❌</div>
              <div className="stat-content">
                <div className="stat-value">{taskStats.deletedTasks || 0}</div>
                <div className="stat-label">Deleted</div>
              </div>
            </div>
            <div className="stat-card success">
              <div className="stat-icon">⏰</div>
              <div className="stat-content">
                <div className="stat-value">{taskStats.onTimeCompletion || 0}%</div>
                <div className="stat-label">On-Time %</div>
              </div>
            </div>
            <div className="stat-card warning">
              <div className="stat-icon">🔄</div>
              <div className="stat-content">
                <div className="stat-value">{taskStats.totalExtensions || 0}</div>
                <div className="stat-label">Extensions</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="reports-container">
      <div className="reports-controls">
        <div className="report-type-selector">
          <button
            onClick={() => setReportType('weekly')}
            className={`report-type-btn ${reportType === 'weekly' ? 'active' : ''}`}
          >
            📊 Weekly
          </button>
          <button
            onClick={() => setReportType('monthly')}
            className={`report-type-btn ${reportType === 'monthly' ? 'active' : ''}`}
          >
            📅 Monthly
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner">⏳</div>
          <p>Loading report data...</p>
        </div>
      ) : (
        <div className="reports-wrapper">
          {reportType === 'weekly' ? renderWeeklyReport() : renderMonthlyReport()}
        </div>
      )}
    </div>
  );
}

export default Reports;
