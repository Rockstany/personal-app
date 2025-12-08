import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { habitService } from '../services/habitService';
import { taskService } from '../services/taskService';
import { syncOfflineData } from '../services/offlineSync';
import HabitList from '../components/HabitList';
import TaskList from '../components/TaskList';
import CreateHabit from '../components/CreateHabit';
import CreateTask from '../components/CreateTask';

function Dashboard() {
  const [habits, setHabits] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [showCreateHabit, setShowCreateHabit] = useState(false);
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [activeTab, setActiveTab] = useState('habits');
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
    syncOfflineData();
  }, []);

  const loadData = async () => {
    try {
      const [habitsRes, tasksRes] = await Promise.all([
        habitService.getAll(),
        taskService.getAll('today')
      ]);
      setHabits(habitsRes.data);
      setTasks(tasksRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <h1>Habit & Daily Tracker</h1>
        <button onClick={handleLogout}>Logout</button>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <button
          onClick={() => setActiveTab('habits')}
          style={{
            padding: '10px 20px',
            marginRight: '10px',
            backgroundColor: activeTab === 'habits' ? '#4CAF50' : '#ddd'
          }}
        >
          Habits
        </button>
        <button
          onClick={() => setActiveTab('tasks')}
          style={{
            padding: '10px 20px',
            backgroundColor: activeTab === 'tasks' ? '#4CAF50' : '#ddd'
          }}
        >
          Daily Tasks
        </button>
      </div>

      {activeTab === 'habits' && (
        <div>
          <button
            onClick={() => setShowCreateHabit(!showCreateHabit)}
            style={{ padding: '10px 20px', marginBottom: '20px' }}
          >
            {showCreateHabit ? 'Cancel' : 'Create New Habit'}
          </button>

          {showCreateHabit && (
            <CreateHabit
              onSuccess={() => {
                setShowCreateHabit(false);
                loadData();
              }}
            />
          )}

          <HabitList habits={habits} onUpdate={loadData} />
        </div>
      )}

      {activeTab === 'tasks' && (
        <div>
          <button
            onClick={() => setShowCreateTask(!showCreateTask)}
            style={{ padding: '10px 20px', marginBottom: '20px' }}
          >
            {showCreateTask ? 'Cancel' : 'Create New Task'}
          </button>

          {showCreateTask && (
            <CreateTask
              onSuccess={() => {
                setShowCreateTask(false);
                loadData();
              }}
            />
          )}

          <TaskList tasks={tasks} onUpdate={loadData} />
        </div>
      )}
    </div>
  );
}

export default Dashboard;
