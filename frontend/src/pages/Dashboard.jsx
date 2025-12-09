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
import Toast from '../components/Toast';
import '../styles/Dashboard.css';

function Dashboard() {
  const [habits, setHabits] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [showCreateHabit, setShowCreateHabit] = useState(false);
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [activeTab, setActiveTab] = useState('habits');
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [toast, setToast] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const navigate = useNavigate();

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  useEffect(() => {
    loadData();
    syncOfflineData();

    // Listen for online/offline status
    const handleOnline = () => {
      setIsOnline(true);
      syncOfflineData();
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
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

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await loadData();
      showToast('✅ Data refreshed!', 'success');
    } catch (error) {
      showToast('❌ Failed to refresh data', 'error');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleSync = async () => {
    if (!isOnline) {
      showToast('⚠️ Cannot sync while offline', 'warning');
      return;
    }

    setIsSyncing(true);
    try {
      await syncOfflineData();
      await loadData();
      showToast('🔄 Data synced successfully!', 'success');
    } catch (error) {
      showToast('❌ Failed to sync data', 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  return (
    <div className="dashboard">
      <header className="header">
        <div className="header-content">
          <div className="logo">
            <div className="logo-icon">🎯</div>
            <div className="logo-text">
              <h1>Habit Tracker</h1>
              <p>Build better habits, track your progress</p>
            </div>
          </div>
          <div className="header-actions">
            <div className={`online-status ${isOnline ? 'online' : 'offline'}`}>
              {isOnline ? '🟢 Online' : '🔴 Offline'}
            </div>
            <button
              onClick={handleRefresh}
              className="action-btn"
              disabled={isRefreshing}
            >
              {isRefreshing ? '⏳' : '🔄'} Refresh
            </button>
            <button
              onClick={handleSync}
              className="action-btn"
              disabled={!isOnline || isSyncing}
            >
              {isSyncing ? '⏳' : '🔄'} Sync
            </button>
            <button onClick={handleLogout} className="logout-btn">
              🚪 Logout
            </button>
          </div>
        </div>
      </header>

      <div className="container">
        <div className="tabs">
          <button
            onClick={() => setActiveTab('habits')}
            className={`tab ${activeTab === 'habits' ? 'active' : ''}`}
          >
            🎯 Habits
          </button>
          <button
            onClick={() => setActiveTab('tasks')}
            className={`tab ${activeTab === 'tasks' ? 'active' : ''}`}
          >
            ✅ Daily Tasks
          </button>
        </div>

        {activeTab === 'habits' && (
          <div>
            <button
              onClick={() => setShowCreateHabit(!showCreateHabit)}
              className="create-btn"
            >
              {showCreateHabit ? '❌ Cancel' : '➕ Create New Habit'}
            </button>

            {showCreateHabit && (
              <CreateHabit
                onSuccess={() => {
                  setShowCreateHabit(false);
                  loadData();
                  showToast('🎉 Habit created successfully!', 'success');
                }}
              />
            )}

            <HabitList habits={habits} onUpdate={loadData} showToast={showToast} />
          </div>
        )}

        {activeTab === 'tasks' && (
          <div>
            <button
              onClick={() => setShowCreateTask(!showCreateTask)}
              className="create-btn"
            >
              {showCreateTask ? '❌ Cancel' : '➕ Create New Task'}
            </button>

            {showCreateTask && (
              <CreateTask
                onSuccess={() => {
                  setShowCreateTask(false);
                  loadData();
                }}
              />
            )}

            <TaskList tasks={tasks} onUpdate={loadData} showToast={showToast} />
          </div>
        )}
      </div>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}

export default Dashboard;
