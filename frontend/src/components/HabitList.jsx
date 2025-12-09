import { useState } from 'react';
import { habitService } from '../services/habitService';
import { saveOfflineCompletion } from '../services/offlineSync';
import { getToday } from '../utils/levelCalculator';
import '../styles/HabitCard.css';

function HabitList({ habits, onUpdate, showToast, viewMode = 'active' }) {
  const [selectedHabit, setSelectedHabit] = useState(null);
  const [skipDays, setSkipDays] = useState([]);
  const [collapsedLevels, setCollapsedLevels] = useState({});
  const [numericValues, setNumericValues] = useState({});

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
        showToast('💾 Saved offline! Will sync when online.', 'info');
      } else {
        await habitService.complete(habitId, status, value, skipDayId);
        if (status === 'done') {
          showToast('🎉 Great job! Habit marked as done!', 'success');
        } else if (status === 'skip') {
          showToast('⏭️ Skip day used successfully', 'info');
        }
      }
      onUpdate();
    } catch (error) {
      console.error('Error completing habit:', error);
      showToast('❌ Failed to complete habit', 'error');
    }
  };

  const handleDelete = async (habitId) => {
    const reason = prompt('Why are you deleting this habit?');
    if (reason) {
      try {
        await habitService.delete(habitId, reason);
        showToast('🗑️ Habit deleted successfully', 'info');
        onUpdate();
      } catch (error) {
        console.error('Error deleting habit:', error);
        showToast('❌ Failed to delete habit', 'error');
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

  const toggleLevel = (level) => {
    setCollapsedLevels(prev => ({
      ...prev,
      [level]: !prev[level]
    }));
  };

  return (
    <div>
      {Object.keys(groupedByLevel)
        .sort((a, b) => b - a)
        .map((level) => (
          <div key={level}>
            <h2
              className="level-section-title"
              style={{ '--level-color': getLevelColor(parseInt(level)) }}
              onClick={() => toggleLevel(level)}
            >
              <span>🏆 Level {level} ({groupedByLevel[level].length})</span>
              <span className={`level-collapse-icon ${collapsedLevels[level] ? 'collapsed' : ''}`}>
                ▼
              </span>
            </h2>
            <div className={`level-section-content ${collapsedLevels[level] ? 'collapsed' : ''}`}>
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
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                      <span className="habit-category">📂 {habit.category}</span>
                      {habit.today_status === 'done' && (
                        <span style={{
                          background: '#E8F5E9',
                          color: '#2E7D32',
                          padding: '0.25rem 0.75rem',
                          borderRadius: '20px',
                          fontSize: '0.75rem',
                          fontWeight: '700'
                        }}>
                          ✅ Done Today
                        </span>
                      )}
                      {habit.today_status === 'skip' && (
                        <span style={{
                          background: '#FFF3E0',
                          color: '#E65100',
                          padding: '0.25rem 0.75rem',
                          borderRadius: '20px',
                          fontSize: '0.75rem',
                          fontWeight: '700'
                        }}>
                          ⏭️ Skipped Today
                        </span>
                      )}
                      {!habit.today_status && viewMode === 'active' && (
                        <span style={{
                          background: '#FFEBEE',
                          color: '#C62828',
                          padding: '0.25rem 0.75rem',
                          borderRadius: '20px',
                          fontSize: '0.75rem',
                          fontWeight: '700'
                        }}>
                          ⏰ Pending
                        </span>
                      )}
                    </div>
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

                {viewMode === 'active' && (
                  <div className="habit-actions">
                    {habit.today_status ? (
                      <div style={{
                        padding: '1rem',
                        background: '#E8F5E9',
                        borderRadius: '12px',
                        color: '#2E7D32',
                        fontWeight: '600',
                        textAlign: 'center',
                        flex: 1
                      }}>
                        {habit.today_status === 'done' && '🎉 Great job! You completed this habit today!'}
                        {habit.today_status === 'skip' && '⏭️ You used a skip day for this habit today'}
                      </div>
                    ) : (
                      <>
                        {habit.target_type === 'numeric' && (
                          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flex: 1 }}>
                            <input
                              type="number"
                              min="0"
                              value={numericValues[habit.id] || ''}
                              onChange={(e) => setNumericValues({ ...numericValues, [habit.id]: e.target.value })}
                              placeholder={`Units (${habit.target_unit || 'count'})`}
                              style={{
                                flex: 1,
                                padding: '0.5rem',
                                border: '2px solid #E0E0E0',
                                borderRadius: '8px',
                                fontSize: '0.8rem',
                                outline: 'none'
                              }}
                              onFocus={(e) => e.target.style.borderColor = '#51CF66'}
                              onBlur={(e) => e.target.style.borderColor = '#E0E0E0'}
                            />
                          </div>
                        )}
                        <button
                          onClick={() => {
                            const value = habit.target_type === 'numeric' ? parseInt(numericValues[habit.id]) : null;
                            if (habit.target_type === 'numeric' && (!value || value <= 0)) {
                              showToast('⚠️ Please enter a valid number of units completed', 'warning');
                              return;
                            }
                            handleComplete(habit.id, 'done', value);
                            setNumericValues({ ...numericValues, [habit.id]: '' });
                          }}
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
                      </>
                    )}
                    <button
                      onClick={() => handleDelete(habit.id)}
                      className="btn btn-delete"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                )}

                {viewMode === 'completed' && (
                  <div className="habit-actions">
                    <div style={{
                      padding: '1rem',
                      background: '#E8F5E9',
                      borderRadius: '12px',
                      color: '#2E7D32',
                      fontWeight: '600',
                      textAlign: 'center'
                    }}>
                      🎉 Congratulations! Habit Completed!
                    </div>
                  </div>
                )}

                {viewMode === 'deleted' && (
                  <div className="habit-actions">
                    <div style={{
                      padding: '1rem',
                      background: '#FFEBEE',
                      borderRadius: '12px',
                      color: '#C62828',
                      fontWeight: '600'
                    }}>
                      🗑️ Deleted: {habit.deletion_reason || 'No reason provided'}
                    </div>
                  </div>
                )}

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
          </div>
        ))}
    </div>
  );
}

export default HabitList;
