import { useState, useEffect } from 'react';
import { habitService } from '../services/habitService';
import '../styles/Form.css';

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
  const [categories, setCategories] = useState([]);
  const [showNewCategory, setShowNewCategory] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const response = await habitService.getAll();
      const uniqueCategories = [...new Set(response.data.map(h => h.category).filter(Boolean))];
      setCategories(uniqueCategories.sort());
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'category' && value === '__add_new__') {
      setShowNewCategory(true);
      setFormData({ ...formData, category: '' });
    } else {
      setFormData({ ...formData, [name]: value });
      if (name === 'category') {
        setShowNewCategory(false);
      }
    }
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
    <div className="form-container">
      <h3 className="form-title">🎯 Create New Habit</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Name *</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="form-input"
            placeholder="e.g., Read every day"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Motivation / Why</label>
          <textarea
            name="motivation"
            value={formData.motivation}
            onChange={handleChange}
            className="form-textarea"
            placeholder="Why is this habit important to you?"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Target Type *</label>
          <select
            name="target_type"
            value={formData.target_type}
            onChange={handleChange}
            className="form-select"
          >
            <option value="duration_90">90-Day Duration Challenge</option>
            <option value="numeric">Numeric Target</option>
          </select>
          <p className="form-help-text">
            {formData.target_type === 'duration_90'
              ? '📅 Complete this habit for 90 consecutive days'
              : '🎯 Set a specific number goal to achieve'}
          </p>
        </div>

        {formData.target_type === 'numeric' && (
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Target Value *</label>
              <input
                type="number"
                name="target_value"
                value={formData.target_value}
                onChange={handleChange}
                required={formData.target_type === 'numeric'}
                className="form-input"
                placeholder="100"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Target Unit</label>
              <input
                type="text"
                name="target_unit"
                value={formData.target_unit}
                onChange={handleChange}
                placeholder="pages, minutes, reps"
                className="form-input"
              />
            </div>
          </div>
        )}

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Daily Target</label>
            <input
              type="number"
              name="daily_target"
              value={formData.daily_target}
              onChange={handleChange}
              placeholder="5, 10, 15..."
              className="form-input"
            />
            <p className="form-help-text">How much per day? (optional)</p>
          </div>

          <div className="form-group">
            <label className="form-label">Trigger</label>
            <input
              type="text"
              name="trigger"
              value={formData.trigger}
              onChange={handleChange}
              placeholder="After breakfast, Before bed..."
              className="form-input"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Category *</label>
            {!showNewCategory ? (
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className="form-select"
              >
                <option value="">Select a category...</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
                <option value="__add_new__">➕ Add New Category</option>
              </select>
            ) : (
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <input
                  type="text"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                  placeholder="Enter new category..."
                  className="form-input"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => {
                    setShowNewCategory(false);
                    setFormData({ ...formData, category: '' });
                  }}
                  style={{
                    padding: '0.5rem 0.75rem',
                    background: '#e0e0e0',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '0.8rem'
                  }}
                >
                  Cancel
                </button>
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Priority</label>
            <select
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              className="form-select"
            >
              <option value="">None</option>
              <option value="high">🔴 High</option>
              <option value="medium">🟡 Medium</option>
              <option value="low">🟢 Low</option>
            </select>
          </div>
        </div>

        {error && <div className="error-message">❌ {error}</div>}
        <button type="submit" className="form-submit-btn">
          ✨ Create Habit
        </button>
      </form>
    </div>
  );
}

export default CreateHabit;
