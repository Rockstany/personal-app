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
import Reports from '../components/Reports';
import SystemStatus from '../components/SystemStatus';
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
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [habitView, setHabitView] = useState('active'); // 'active', 'completed', 'deleted'
  const [taskView, setTaskView] = useState('today'); // 'today', 'upcoming', 'completed'
  const [isHeaderCollapsed, setIsHeaderCollapsed] = useState(false);
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

    // Check for service worker updates
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').then(registration => {
        // Check for updates every 60 seconds
        setInterval(() => {
          registration.update();
        }, 60000);

        // Listen for updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New version available
              setUpdateAvailable(true);
            }
          });
        });
      });

      // Listen for controller change (when new SW takes over)
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        setUpdateAvailable(true);
      });
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Reload data when view changes
  useEffect(() => {
    loadData();
  }, [habitView, taskView]);

  const loadData = async () => {
    try {
      const [habitsRes, tasksRes] = await Promise.all([
        habitService.getAll(habitView),
        taskService.getAll(taskView)
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
      // Clear service worker cache and reload
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (let registration of registrations) {
          await registration.update();
        }
      }

      // Clear browser cache for this page
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        );
      }

      // Reload data from server
      await loadData();
      showToast('✅ Data refreshed! Cache cleared.', 'success');
    } catch (error) {
      console.error('Refresh error:', error);
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

  const handleUpdateApp = () => {
    // Clear all caches and reload
    if ('caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => caches.delete(name));
      });
    }

    // Skip waiting and activate new service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then(registrations => {
        registrations.forEach(registration => {
          if (registration.waiting) {
            registration.waiting.postMessage({ type: 'SKIP_WAITING' });
          }
        });
      });
    }

    // Reload the page
    window.location.reload();
  };

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  return (
    <div className="dashboard">
      {updateAvailable && (
        <div className="update-banner">
          <div className="update-content">
            <span className="update-icon">🎉</span>
            <div className="update-text">
              <strong>New version available!</strong>
              <p>Click to update and get the latest features</p>
            </div>
            <button onClick={handleUpdateApp} className="update-btn">
              Update Now
            </button>
            <button onClick={() => setUpdateAvailable(false)} className="dismiss-btn">
              ✕
            </button>
          </div>
        </div>
      )}
      <header className={`header ${isHeaderCollapsed ? 'collapsed' : ''}`}>
        <button
          className="header-toggle"
          onClick={() => setIsHeaderCollapsed(!isHeaderCollapsed)}
          aria-label={isHeaderCollapsed ? "Expand header" : "Collapse header"}
        >
          {isHeaderCollapsed ? '▼' : '▲'}
        </button>
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
          <button
            onClick={() => setActiveTab('reports')}
            className={`tab ${activeTab === 'reports' ? 'active' : ''}`}
          >
            📊 Reports
          </button>
          <button
            onClick={() => setActiveTab('system')}
            className={`tab ${activeTab === 'system' ? 'active' : ''}`}
          >
            🖥️ System
          </button>
        </div>

        {activeTab === 'habits' && (
          <div className="content-wrapper">
            <div className="view-controls">
              <button
                onClick={() => setShowCreateHabit(!showCreateHabit)}
                className="create-btn"
              >
                {showCreateHabit ? '❌ Cancel' : '➕ Create New Habit'}
              </button>

              <div className="view-filter">
                <button
                  onClick={() => setHabitView('active')}
                  className={`filter-btn ${habitView === 'active' ? 'active' : ''}`}
                >
                  📋 Active
                </button>
                <button
                  onClick={() => setHabitView('completed')}
                  className={`filter-btn ${habitView === 'completed' ? 'active' : ''}`}
                >
                  ✅ Completed
                </button>
                <button
                  onClick={() => setHabitView('deleted')}
                  className={`filter-btn ${habitView === 'deleted' ? 'active' : ''}`}
                >
                  🗑️ Deleted
                </button>
              </div>
            </div>

            {showCreateHabit && (
              <CreateHabit
                onSuccess={() => {
                  setShowCreateHabit(false);
                  loadData();
                  showToast('🎉 Habit created successfully!', 'success');
                }}
              />
            )}

            <HabitList
              habits={habits}
              onUpdate={loadData}
              showToast={showToast}
              viewMode={habitView}
            />
          </div>
        )}

        {activeTab === 'tasks' && (
          <div className="content-wrapper">
            <div className="view-controls">
              <button
                onClick={() => setShowCreateTask(!showCreateTask)}
                className="create-btn"
              >
                {showCreateTask ? '❌ Cancel' : '➕ Create New Task'}
              </button>

              <div className="view-filter">
                <button
                  onClick={() => setTaskView('today')}
                  className={`filter-btn ${taskView === 'today' ? 'active' : ''}`}
                >
                  📅 Today
                </button>
                <button
                  onClick={() => setTaskView('upcoming')}
                  className={`filter-btn ${taskView === 'upcoming' ? 'active' : ''}`}
                >
                  📆 Upcoming
                </button>
                <button
                  onClick={() => setTaskView('completed')}
                  className={`filter-btn ${taskView === 'completed' ? 'active' : ''}`}
                >
                  ✅ Completed
                </button>
                <button
                  onClick={() => setTaskView('deleted')}
                  className={`filter-btn ${taskView === 'deleted' ? 'active' : ''}`}
                >
                  🗑️ Deleted
                </button>
              </div>
            </div>

            {showCreateTask && (
              <CreateTask
                onSuccess={() => {
                  setShowCreateTask(false);
                  loadData();
                  showToast('🎉 Task created successfully!', 'success');
                }}
              />
            )}

            <TaskList
              tasks={tasks}
              onUpdate={loadData}
              showToast={showToast}
              viewMode={taskView}
            />
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="content-wrapper">
            <Reports showToast={showToast} />
          </div>
        )}

        {activeTab === 'system' && (
          <div className="content-wrapper">
            <SystemStatus showToast={showToast} />
          </div>
        )}
      </div>

      <footer className="footer">
        <div className="footer-contact">Contact us</div>
        <a href="tel:7899015086" className="footer-phone">
          📞 7899015086
        </a>
      </footer>

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
