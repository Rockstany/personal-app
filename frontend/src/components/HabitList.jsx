import { useState } from 'react';
import { habitService } from '../services/habitService';
import { saveOfflineCompletion } from '../services/offlineSync';
import { getToday } from '../utils/levelCalculator';
import '../styles/HabitCard.css';

function HabitList({ habits, onUpdate }) {
  const [selectedHabit, setSelectedHabit] = useState(null);
  const [skipDays, setSkipDays] = useState([]);

  const groupedByLevel = habits.reduce((acc, habit) => {
    const level = habit.current_level || 0;
    if (!acc[level]) acc[level] = [];
    acc[level].push(habit);
    return acc;
  }, {});

  const getLevelColor = (level) => {
    const colors = [
      '#95a5a6', // Level 0 - Gray
      '#3498db', // Level 1 - Blue
      '#9b59b6', // Level 2 - Purple
      '#e74c3c', // Level 3 - Red
      '#f39c12', // Level 4 - Orange
      '#27ae60', // Level 5 - Green
      '#1abc9c', // Level 6 - Teal
      '#e67e22', // Level 7 - Dark Orange
      '#c0392b', // Level 8 - Dark Red
      '#f1c40f', // Level 9 - Gold
    ];
    return colors[level] || colors[0];
  };

  const handleComplete = async (habitId, status, value = null, skipDayId = null) => {
    try {
      if (!navigator.onLine) {
        await saveOfflineCompletion(habitId, getToday(), status, value);
        alert('💾 Saved offline! Will sync when you\'re back online.');
      } else {
        await habitService.complete(habitId, status, value, skipDayId);
      }
      onUpdate();
    } catch (error) {
      console.error('Error completing habit:', error);
      alert('❌ Failed to complete habit');
    }
  };

  const handleDelete = async (habitId) => {
    const reason = prompt('Why are you deleting this habit?');
    if (reason) {
      try {
        await habitService.delete(habitId, reason);
        onUpdate();
      } catch (error) {
        console.error('Error deleting habit:', error);
        alert('❌ Failed to delete habit');
      }
    }
  };

  const loadSkipDays = async (habitId) => {
    try {
      const response = await habitService.getSkipDays(habitId);
      setSkipDays(response.data);
      setSelectedHabit(habitId);
    } catch (error) {
      console.error('Error loading skip days:', error);
    }
  };

  if (habits.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">🎯</div>
        <p className="empty-text">No habits yet. Create your first habit to get started!</p>
      </div>
    );
  }

  return (
    <div>
      {Object.keys(groupedByLevel)
        .sort((a, b) => b - a)
        .map((level) => (
          <div key={level}>
            <h2 className="level-section-title" style={{ '--level-color': getLevelColor(parseInt(level)) }}>
              🏆 Level {level}
            </h2>
            {groupedByLevel[level].map((habit) => (
              <div
                key={habit.id}
                className="habit-card"
                style={{ '--level-color': getLevelColor(habit.current_level) }}
              >
                <div className="habit-header">
                  <div className="habit-title-section">
                    <div className="habit-level-badge">
                      Level {habit.current_level}
                    </div>
                    <h3 className="habit-name">{habit.name}</h3>
                    <span className="habit-category">📂 {habit.category}</span>
                  </div>
                </div>

                <div className="habit-meta">
                  {habit.motivation && (
                    <div className="habit-motivation">
                      💭 Why: {habit.motivation}
                    </div>
                  )}

                  {habit.trigger && (
                    <div className="habit-meta-item">
                      ⚡ Trigger: {habit.trigger}
                    </div>
                  )}

                  {habit.target_type === 'numeric' && (
                    <div className="habit-progress">
                      <div className="habit-meta-item">
                        📊 Progress: {habit.current_progress || 0} / {habit.target_value} {habit.target_unit}
                      </div>
                      <div className="progress-bar">
                        <div
                          className="progress-fill"
                          style={{
                            width: `${Math.min((habit.current_progress / habit.target_value) * 100, 100)}%`
                          }}
                        ></div>
                      </div>
                    </div>
                  )}

                  {habit.target_type === 'duration_90' && (
                    <div className="habit-meta-item">
                      📅 Duration: 90-day challenge
                    </div>
                  )}
                </div>

                <div className="habit-actions">
                  <button
                    onClick={() => handleComplete(habit.id, 'done')}
                    className="btn btn-done"
                  >
                    ✅ Done
                  </button>
                  <button
                    onClick={() => loadSkipDays(habit.id)}
                    className="btn btn-skip"
                  >
                    ⏭️ Skip
                  </button>
                  <button
                    onClick={() => handleDelete(habit.id)}
                    className="btn btn-delete"
                  >
                    🗑️ Delete
                  </button>
                </div>

                {selectedHabit === habit.id && skipDays.length > 0 && (
                  <div className="skip-days-panel">
                    <p className="skip-days-title">✨ Available Skip Days:</p>
                    {skipDays.map((skip) => (
                      <button
                        key={skip.id}
                        onClick={() => {
                          handleComplete(habit.id, 'skip', null, skip.id);
                          setSelectedHabit(null);
                        }}
                        className="skip-day-btn"
                      >
                        Use Skip (Level {skip.level_earned_at}) - Expires: {skip.expiry_date}
                      </button>
                    ))}
                  </div>
                )}

                {selectedHabit === habit.id && skipDays.length === 0 && (
                  <div className="skip-days-panel">
                    <p className="skip-days-title">😢 No skip days available</p>
                    <p style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>
                      Complete more days to earn skip days!
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        ))}
    </div>
  );
}

export default HabitList;
