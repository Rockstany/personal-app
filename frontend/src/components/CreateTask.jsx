import { useState } from 'react';
import { taskService } from '../services/taskService';
import { getToday } from '../utils/levelCalculator';

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
    <div style={{ border: '1px solid #ddd', padding: '20px', marginBottom: '20px' }}>
      <h3>Create New Task</h3>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '10px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Task Name *</label>
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
          <label style={{ display: 'block', marginBottom: '5px' }}>Notes</label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            style={{ width: '100%', padding: '8px', minHeight: '60px' }}
          />
        </div>

        <div style={{ marginBottom: '10px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Deadline *</label>
          <input
            type="date"
            name="deadline"
            value={formData.deadline}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '8px' }}
          />
        </div>

        <div style={{ marginBottom: '10px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Max Extensions</label>
          <input
            type="number"
            name="max_extensions"
            value={formData.max_extensions}
            onChange={handleChange}
            min="0"
            style={{ width: '100%', padding: '8px' }}
          />
        </div>

        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button type="submit" style={{ padding: '10px 20px' }}>Create Task</button>
      </form>
    </div>
  );
}

export default CreateTask;
