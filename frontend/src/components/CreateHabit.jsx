import { useState } from 'react';
import { habitService } from '../services/habitService';

function CreateHabit({ onSuccess }) {
  const [formData, setFormData] = useState({
    name: '',
    motivation: '',
    target_type: 'duration_90',
    target_value: '',
    target_unit: '',
    daily_target: '',
    trigger: '',
    category: '',
    priority: ''
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const data = { ...formData };
      if (data.target_type === 'duration_90') {
        data.target_value = null;
        data.target_unit = null;
      } else {
        data.target_value = parseInt(data.target_value);
      }

      if (data.daily_target) {
        data.daily_target = parseInt(data.daily_target);
      }

      await habitService.create(data);
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create habit');
    }
  };

  return (
    <div style={{ border: '1px solid #ddd', padding: '20px', marginBottom: '20px' }}>
      <h3>Create New Habit</h3>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '10px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Name *</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '8px' }}
          />
        </div>

        <div style={{ marginBottom: '10px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Motivation / Why</label>
          <textarea
            name="motivation"
            value={formData.motivation}
            onChange={handleChange}
            style={{ width: '100%', padding: '8px', minHeight: '60px' }}
          />
        </div>

        <div style={{ marginBottom: '10px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Target Type *</label>
          <select
            name="target_type"
            value={formData.target_type}
            onChange={handleChange}
            style={{ width: '100%', padding: '8px' }}
          >
            <option value="duration_90">90-Day Duration</option>
            <option value="numeric">Numeric Target</option>
          </select>
        </div>

        {formData.target_type === 'numeric' && (
          <>
            <div style={{ marginBottom: '10px' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>Target Value *</label>
              <input
                type="number"
                name="target_value"
                value={formData.target_value}
                onChange={handleChange}
                required={formData.target_type === 'numeric'}
                style={{ width: '100%', padding: '8px' }}
              />
            </div>
            <div style={{ marginBottom: '10px' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>Target Unit</label>
              <input
                type="text"
                name="target_unit"
                value={formData.target_unit}
                onChange={handleChange}
                placeholder="e.g., pages, minutes, reps"
                style={{ width: '100%', padding: '8px' }}
              />
            </div>
          </>
        )}

        <div style={{ marginBottom: '10px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Daily Target</label>
          <input
            type="number"
            name="daily_target"
            value={formData.daily_target}
            onChange={handleChange}
            placeholder="5, 10, 15..."
            style={{ width: '100%', padding: '8px' }}
          />
        </div>

        <div style={{ marginBottom: '10px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Trigger</label>
          <input
            type="text"
            name="trigger"
            value={formData.trigger}
            onChange={handleChange}
            placeholder="What triggers this habit?"
            style={{ width: '100%', padding: '8px' }}
          />
        </div>

        <div style={{ marginBottom: '10px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Category *</label>
          <input
            type="text"
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
            placeholder="Health, Learning, Work..."
            style={{ width: '100%', padding: '8px' }}
          />
        </div>

        <div style={{ marginBottom: '10px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Priority</label>
          <select
            name="priority"
            value={formData.priority}
            onChange={handleChange}
            style={{ width: '100%', padding: '8px' }}
          >
            <option value="">None</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>

        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button type="submit" style={{ padding: '10px 20px' }}>Create Habit</button>
      </form>
    </div>
  );
}

export default CreateHabit;
