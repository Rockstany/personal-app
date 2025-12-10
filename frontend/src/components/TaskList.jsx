import { useState } from 'react';
import { taskService } from '../services/taskService';
import { isOverdue } from '../utils/levelCalculator';
import '../styles/TaskCard.css';

function TaskList({ tasks, onUpdate, showToast, viewMode = 'today' }) {
  const [collapsedTasks, setCollapsedTasks] = useState({});

  const toggleTask = (taskId) => {
    setCollapsedTasks(prev => ({
      ...prev,
      [taskId]: prev[taskId] === undefined ? false : !prev[taskId]
    }));
  };

  const handleComplete = async (taskId) => {
    try {
      await taskService.complete(taskId);
      showToast('✅ Task completed successfully!', 'success');
      onUpdate();
    } catch (error) {
      console.error('Error completing task:', error);
      showToast('❌ Failed to complete task', 'error');
    }
  };

  const handleDelete = async (taskId) => {
    const reason = prompt('Why are you deleting this task?');
    if (reason) {
      try {
        await taskService.delete(taskId, reason);
        showToast('🗑️ Task deleted successfully', 'info');
        onUpdate();
      } catch (error) {
        console.error('Error deleting task:', error);
        showToast('❌ Failed to delete task', 'error');
      }
    }
  };

  const handleExtend = async (task) => {
    if (task.extension_count >= task.max_extensions) {
      showToast('⚠️ Maximum extensions reached', 'warning');
      return;
    }

    const newDeadline = prompt('Enter new deadline (YYYY-MM-DD):');
    const reason = task.extension_count >= 2 ? prompt('Extension reason required:') : '';

    if (newDeadline) {
      try {
        await taskService.update(task.id, {
          deadline: newDeadline,
          extension_count: task.extension_count + 1,
          reassignment_reason: reason
        });
        showToast('📅 Task deadline extended', 'success');
        onUpdate();
      } catch (error) {
        console.error('Error extending task:', error);
        showToast('❌ Failed to extend task', 'error');
      }
    }
  };

  if (tasks.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">✅</div>
        <p className="empty-text">
          {viewMode === 'today' && 'No tasks due today. Great job!'}
          {viewMode === 'upcoming' && 'No upcoming tasks scheduled.'}
          {viewMode === 'completed' && 'No completed tasks yet.'}
          {viewMode === 'deleted' && 'No deleted tasks.'}
        </p>
      </div>
    );
  }

  return (
    <div>
      {tasks.map((task) => {
        const isCollapsed = collapsedTasks[task.id] === undefined ? true : collapsedTasks[task.id];

        return (
        <div
          key={task.id}
          className={`task-card ${isCollapsed ? 'collapsed' : ''} ${isOverdue(task.deadline) ? 'overdue' : ''}`}
        >
          <div className="task-header" onClick={() => toggleTask(task.id)} style={{ cursor: 'pointer' }}>
            <div className="task-title-section">
              <h3 className="task-name">{task.name}</h3>
              <span className={`task-collapse-icon ${isCollapsed ? 'collapsed' : ''}`}>
                ▼
              </span>
              <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center', flexWrap: 'wrap', marginTop: '0.25rem' }}>
                {viewMode === 'completed' && task.completed_at && (
                  <span style={{
                    background: '#E8F5E9',
                    color: '#2E7D32',
                    padding: '0.2rem 0.6rem',
                    borderRadius: '20px',
                    fontSize: '0.65rem',
                    fontWeight: '700'
                  }}>
                    ✅ Completed
                  </span>
                )}
                {(viewMode === 'today' || viewMode === 'upcoming') && !task.completed_at && (
                  <span style={{
                    background: isOverdue(task.deadline) ? '#FFEBEE' : '#FFF3E0',
                    color: isOverdue(task.deadline) ? '#C62828' : '#E65100',
                    padding: '0.2rem 0.6rem',
                    borderRadius: '20px',
                    fontSize: '0.65rem',
                    fontWeight: '700'
                  }}>
                    {isOverdue(task.deadline) ? '🚨 Overdue' : '⏰ Pending'}
                  </span>
                )}
              </div>
              {task.notes && (
                <p className="task-notes">📝 {task.notes}</p>
              )}
            </div>
          </div>

          <div className={`task-details ${isCollapsed ? 'hidden' : ''}`}>
          <div className="task-meta">
            <div className="task-meta-item">
              📅 Deadline: {task.deadline}
              {isOverdue(task.deadline) && (
                <span style={{ color: '#C62828', fontWeight: '700', marginLeft: '0.35rem' }}>
                  ⚠️ OVERDUE
                </span>
              )}
            </div>
            <div className="task-meta-item">
              🔄 Extensions: {task.extension_count || 0} / {task.max_extensions || 2}
            </div>
            {task.completed_at && (
              <div className="task-meta-item">
                ✅ Completed: {new Date(task.completed_at).toLocaleDateString()}
              </div>
            )}
            {task.deletion_reason && viewMode === 'deleted' && (
              <div className="task-meta-item">
                🗑️ Reason: {task.deletion_reason}
              </div>
            )}
          </div>

          {(viewMode === 'today' || viewMode === 'upcoming') && (
            <div className="task-actions">
              <button
                onClick={() => handleComplete(task.id)}
                className="btn btn-done"
              >
                ✅ Complete
              </button>
              <button
                onClick={() => handleExtend(task)}
                className="btn btn-extend"
              >
                📅 Extend
              </button>
              <button
                onClick={() => handleDelete(task.id)}
                className="btn btn-delete"
              >
                🗑️ Delete
              </button>
            </div>
          )}

          {viewMode === 'completed' && (
            <div className="task-actions">
              <div style={{
                padding: '0.6rem',
                background: '#E8F5E9',
                borderRadius: '8px',
                color: '#2E7D32',
                fontWeight: '600',
                textAlign: 'center'
              }}>
                ✅ Task Completed!
              </div>
            </div>
          )}

          {viewMode === 'deleted' && (
            <div className="task-actions">
              <div style={{
                padding: '0.6rem',
                background: '#FFEBEE',
                borderRadius: '8px',
                color: '#C62828',
                fontWeight: '600'
              }}>
                🗑️ Deleted: {task.deletion_reason || 'No reason provided'}
              </div>
            </div>
          )}
          </div>
        </div>
        );
      })}
    </div>
  );
}

export default TaskList;
