import { taskService } from '../services/taskService';
import { isOverdue } from '../utils/levelCalculator';
import '../styles/TaskCard.css';

function TaskList({ tasks, onUpdate, showToast, viewMode = 'today' }) {
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
      {tasks.map((task) => (
        <div
          key={task.id}
          className={`task-card ${isOverdue(task.deadline) ? 'overdue' : ''}`}
        >
          <div className="task-header">
            <div className="task-title-section">
              <h3 className="task-name">{task.name}</h3>
              {task.notes && (
                <p className="task-notes">📝 {task.notes}</p>
              )}
            </div>
          </div>

          <div className="task-meta">
            <div className="task-meta-item">
              📅 Deadline: {task.deadline}
              {isOverdue(task.deadline) && (
                <span style={{ color: '#C62828', fontWeight: '700', marginLeft: '0.5rem' }}>
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
                padding: '1rem',
                background: '#E8F5E9',
                borderRadius: '12px',
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
                padding: '1rem',
                background: '#FFEBEE',
                borderRadius: '12px',
                color: '#C62828',
                fontWeight: '600'
              }}>
                🗑️ Deleted: {task.deletion_reason || 'No reason provided'}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default TaskList;
