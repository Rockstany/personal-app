import { taskService } from '../services/taskService';
import { isOverdue } from '../utils/levelCalculator';

function TaskList({ tasks, onUpdate }) {
  const handleComplete = async (taskId) => {
    try {
      await taskService.complete(taskId);
      onUpdate();
    } catch (error) {
      console.error('Error completing task:', error);
      alert('Failed to complete task');
    }
  };

  const handleDelete = async (taskId) => {
    const reason = prompt('Why are you deleting this task?');
    if (reason) {
      try {
        await taskService.delete(taskId, reason);
        onUpdate();
      } catch (error) {
        console.error('Error deleting task:', error);
        alert('Failed to delete task');
      }
    }
  };

  const handleExtend = async (task) => {
    if (task.extension_count >= task.max_extensions) {
      alert('Maximum extensions reached');
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
        onUpdate();
      } catch (error) {
        console.error('Error extending task:', error);
        alert('Failed to extend task');
      }
    }
  };

  const overdueTasks = tasks.filter(task => isOverdue(task.deadline));
  const todayTasks = tasks.filter(task => !isOverdue(task.deadline));

  return (
    <div>
      <h2>Daily Tasks</h2>

      {overdueTasks.length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ color: '#f44336' }}>Overdue Tasks</h3>
          {overdueTasks.map((task) => (
            <div
              key={task.id}
              style={{
                border: '2px solid #f44336',
                padding: '15px',
                marginBottom: '10px',
                borderRadius: '5px',
                backgroundColor: '#ffebee'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <div>
                  <h4 style={{ margin: '0 0 10px 0' }}>{task.name}</h4>
                  {task.notes && <p style={{ margin: '5px 0', fontSize: '0.9em' }}>{task.notes}</p>}
                  <p style={{ margin: '5px 0', fontSize: '0.9em', color: '#d32f2f' }}>
                    <strong>Deadline:</strong> {task.deadline} (OVERDUE)
                  </p>
                  <p style={{ margin: '5px 0', fontSize: '0.9em' }}>
                    <strong>Extensions:</strong> {task.extension_count} / {task.max_extensions}
                  </p>
                </div>
                <div>
                  <button
                    onClick={() => handleComplete(task.id)}
                    style={{ padding: '5px 15px', marginRight: '5px', backgroundColor: '#4CAF50', color: 'white' }}
                  >
                    Complete
                  </button>
                  <button
                    onClick={() => handleExtend(task)}
                    style={{ padding: '5px 15px', marginRight: '5px', backgroundColor: '#FFA500', color: 'white' }}
                  >
                    Extend
                  </button>
                  <button
                    onClick={() => handleDelete(task.id)}
                    style={{ padding: '5px 15px', backgroundColor: '#f44336', color: 'white' }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {todayTasks.length > 0 && (
        <div>
          <h3>Today's Tasks</h3>
          {todayTasks.map((task) => (
            <div
              key={task.id}
              style={{
                border: '1px solid #ddd',
                padding: '15px',
                marginBottom: '10px',
                borderRadius: '5px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <div>
                  <h4 style={{ margin: '0 0 10px 0' }}>{task.name}</h4>
                  {task.notes && <p style={{ margin: '5px 0', fontSize: '0.9em' }}>{task.notes}</p>}
                  <p style={{ margin: '5px 0', fontSize: '0.9em' }}>
                    <strong>Deadline:</strong> {task.deadline}
                  </p>
                  <p style={{ margin: '5px 0', fontSize: '0.9em' }}>
                    <strong>Extensions:</strong> {task.extension_count} / {task.max_extensions}
                  </p>
                </div>
                <div>
                  <button
                    onClick={() => handleComplete(task.id)}
                    style={{ padding: '5px 15px', marginRight: '5px', backgroundColor: '#4CAF50', color: 'white' }}
                  >
                    Complete
                  </button>
                  <button
                    onClick={() => handleExtend(task)}
                    style={{ padding: '5px 15px', marginRight: '5px', backgroundColor: '#FFA500', color: 'white' }}
                  >
                    Extend
                  </button>
                  <button
                    onClick={() => handleDelete(task.id)}
                    style={{ padding: '5px 15px', backgroundColor: '#f44336', color: 'white' }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {tasks.length === 0 && <p>No tasks for today.</p>}
    </div>
  );
}

export default TaskList;
