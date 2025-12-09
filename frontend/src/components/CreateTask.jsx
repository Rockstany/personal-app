import { useState } from 'react';
import { taskService } from '../services/taskService';
import { getToday } from '../utils/levelCalculator';
import '../styles/Form.css';

function CreateTask({ onSuccess }) {
  const [formData, setFormData] = useState({
    name: '',
    notes: '',
    deadline: getToday(),
    max_extensions: 2
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
      data.max_extensions = parseInt(data.max_extensions);

      await taskService.create(data);
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create task');
    }
  };

  return (
    <div className="form-container">
      <h3 className="form-title">✅ Create New Task</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Task Name *</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="form-input"
            placeholder="e.g., Complete project report"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Notes</label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            className="form-textarea"
            placeholder="Any additional details or context..."
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Deadline *</label>
            <input
              type="date"
              name="deadline"
              value={formData.deadline}
              onChange={handleChange}
              required
              className="form-input"
            />
            <p className="form-help-text">When should this task be completed?</p>
          </div>

          <div className="form-group">
            <label className="form-label">Max Extensions</label>
            <input
              type="number"
              name="max_extensions"
              value={formData.max_extensions}
              onChange={handleChange}
              min="0"
              max="10"
              className="form-input"
            />
            <p className="form-help-text">How many times can you extend?</p>
          </div>
        </div>

        {error && <div className="error-message">❌ {error}</div>}
        <button type="submit" className="form-submit-btn">
          ✨ Create Task
        </button>
      </form>
    </div>
  );
}

export default CreateTask;
