import { useState } from 'react';
import { habitService } from '../services/habitService';
import { saveOfflineCompletion } from '../services/offlineSync';
import { getToday } from '../utils/levelCalculator';

function HabitList({ habits, onUpdate }) {
  const [selectedHabit, setSelectedHabit] = useState(null);
  const [skipDays, setSkipDays] = useState([]);

  const groupedByLevel = habits.reduce((acc, habit) => {
    const level = habit.current_level || 0;
    if (!acc[level]) acc[level] = [];
    acc[level].push(habit);
    return acc;
  }, {});

  const handleComplete = async (habitId, status, value = null, skipDayId = null) => {
    try {
      if (!navigator.onLine) {
        await saveOfflineCompletion(habitId, getToday(), status, value);
        alert('Saved offline. Will sync when connection is restored.');
      } else {
        await habitService.complete(habitId, status, value, skipDayId);
      }
      onUpdate();
    } catch (error) {
      console.error('Error completing habit:', error);
      alert('Failed to complete habit');
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
        alert('Failed to delete habit');
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

  return (
    <div>
      <h2>Your Habits</h2>
      {Object.keys(groupedByLevel)
        .sort((a, b) => b - a)
        .map((level) => (
          <div key={level} style={{ marginBottom: '30px' }}>
            <h3>Level {level}</h3>
            {groupedByLevel[level].map((habit) => (
              <div
                key={habit.id}
                style={{
                  border: '1px solid #ddd',
                  padding: '15px',
                  marginBottom: '10px',
                  borderRadius: '5px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <div>
                    <h4 style={{ margin: '0 0 10px 0' }}>{habit.name}</h4>
                    <p style={{ margin: '5px 0', fontSize: '0.9em', color: '#666' }}>
                      <strong>Category:</strong> {habit.category} | <strong>Level:</strong> {habit.current_level}
                    </p>
                    {habit.motivation && (
                      <p style={{ margin: '5px 0', fontSize: '0.9em', fontStyle: 'italic' }}>
                        Why: {habit.motivation}
                      </p>
                    )}
                    {habit.trigger && (
                      <p style={{ margin: '5px 0', fontSize: '0.9em' }}>
                        <strong>Trigger:</strong> {habit.trigger}
                      </p>
                    )}
                    {habit.target_type === 'numeric' && (
                      <p style={{ margin: '5px 0', fontSize: '0.9em' }}>
                        <strong>Progress:</strong> {habit.current_progress || 0} / {habit.target_value} {habit.target_unit}
                      </p>
                    )}
                  </div>
                  <div>
                    <button
                      onClick={() => handleComplete(habit.id, 'done')}
                      style={{ padding: '5px 15px', marginRight: '5px', backgroundColor: '#4CAF50', color: 'white' }}
                    >
                      Done
                    </button>
                    <button
                      onClick={() => loadSkipDays(habit.id)}
                      style={{ padding: '5px 15px', marginRight: '5px', backgroundColor: '#FFA500', color: 'white' }}
                    >
                      Skip
                    </button>
                    <button
                      onClick={() => handleDelete(habit.id)}
                      style={{ padding: '5px 15px', backgroundColor: '#f44336', color: 'white' }}
                    >
                      Delete
                    </button>
                  </div>
                </div>

                {selectedHabit === habit.id && skipDays.length > 0 && (
                  <div style={{ marginTop: '10px', padding: '10px', backgroundColor: '#fffacd' }}>
                    <p><strong>Available Skip Days:</strong></p>
                    {skipDays.map((skip) => (
                      <button
                        key={skip.id}
                        onClick={() => {
                          handleComplete(habit.id, 'skip', null, skip.id);
                          setSelectedHabit(null);
                        }}
                        style={{ padding: '5px 10px', marginRight: '5px' }}
                      >
                        Use Skip (Level {skip.level_earned_at}, Expires: {skip.expiry_date})
                      </button>
                    ))}
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
