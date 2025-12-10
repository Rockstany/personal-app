import { useState } from 'react';
import { moneyService } from '../services/moneyService';
import '../styles/Money.css';

function ManageCategories({ categories, onUpdate, showToast }) {
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'expense',
    icon: '🎯',
    color: '#667eea'
  });
  const [activeTab, setActiveTab] = useState('expense');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await moneyService.categories.update(editingCategory.id, formData);
        showToast('✅ Category updated successfully!', 'success');
      } else {
        await moneyService.categories.create(formData);
        showToast('✅ Category created successfully!', 'success');
      }
      resetForm();
      onUpdate();
    } catch (error) {
      console.error('Save category error:', error);
      const errorMsg = error.response?.data?.error || error.message || 'Failed to save category';
      showToast(`❌ ${errorMsg}`, 'error');
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      type: category.type,
      icon: category.icon,
      color: category.color
    });
    setShowForm(true);
  };

  const handleDelete = async (categoryId) => {
    if (window.confirm('Are you sure you want to delete this category? Existing transactions will not be affected.')) {
      try {
        await moneyService.categories.delete(categoryId);
        showToast('🗑️ Category deleted successfully!', 'success');
        onUpdate();
      } catch (error) {
        showToast('❌ Failed to delete category', 'error');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'expense',
      icon: '🎯',
      color: '#667eea'
    });
    setEditingCategory(null);
    setShowForm(false);
  };

  const defaultCategories = categories.filter(cat => cat.is_default);
  const customCategories = categories.filter(cat => !cat.is_default);

  const filteredDefault = defaultCategories.filter(cat => cat.type === activeTab);
  const filteredCustom = customCategories.filter(cat => cat.type === activeTab);

  return (
    <div className="money-card">
      <div className="card-header">
        <h3>🏷️ Manage Categories</h3>
        <button
          onClick={() => setShowForm(!showForm)}
          className="action-btn"
        >
          {showForm ? '❌ Cancel' : '➕ Add Category'}
        </button>
      </div>

      <div className="type-tabs">
        <button
          className={`type-tab ${activeTab === 'income' ? 'active income' : ''}`}
          onClick={() => setActiveTab('income')}
        >
          📈 Income
        </button>
        <button
          className={`type-tab ${activeTab === 'expense' ? 'active expense' : ''}`}
          onClick={() => setActiveTab('expense')}
        >
          📉 Expense
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="money-form category-form">
          <div className="form-group">
            <label>Category Type</label>
            <div className="type-toggle">
              <button
                type="button"
                className={`type-btn ${formData.type === 'income' ? 'active income' : ''}`}
                onClick={() => setFormData(prev => ({ ...prev, type: 'income' }))}
              >
                📈 Income
              </button>
              <button
                type="button"
                className={`type-btn ${formData.type === 'expense' ? 'active expense' : ''}`}
                onClick={() => setFormData(prev => ({ ...prev, type: 'expense' }))}
              >
                📉 Expense
              </button>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Category Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g., Groceries"
                required
              />
            </div>

            <div className="form-group">
              <label>Icon</label>
              <input
                type="text"
                name="icon"
                value={formData.icon}
                onChange={handleChange}
                placeholder="🎯"
                maxLength="2"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Color</label>
            <input
              type="color"
              name="color"
              value={formData.color}
              onChange={handleChange}
            />
          </div>

          <button type="submit" className="submit-btn">
            {editingCategory ? '✅ Update Category' : '➕ Create Category'}
          </button>
        </form>
      )}

      {filteredDefault.length > 0 && (
        <div className="category-section">
          <h4>Default Categories</h4>
          <div className="categories-grid">
            {filteredDefault.map(category => (
              <div
                key={category.id}
                className="category-item"
                style={{ borderColor: category.color }}
              >
                <span className="category-icon">{category.icon}</span>
                <span className="category-name">{category.name}</span>
                <span className="category-badge default-badge">Default</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {filteredCustom.length > 0 && (
        <div className="category-section">
          <h4>Custom Categories</h4>
          <div className="categories-grid">
            {filteredCustom.map(category => (
              <div
                key={category.id}
                className="category-item custom"
                style={{ borderColor: category.color }}
              >
                <span className="category-icon">{category.icon}</span>
                <span className="category-name">{category.name}</span>
                <div className="category-actions">
                  <button
                    onClick={() => handleEdit(category)}
                    className="btn-icon"
                    title="Edit"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDelete(category.id)}
                    className="btn-icon"
                    title="Delete"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {filteredDefault.length === 0 && filteredCustom.length === 0 && !showForm && (
        <div className="empty-state">
          <div className="empty-icon">🏷️</div>
          <p>No {activeTab} categories yet. Add your first category!</p>
        </div>
      )}
    </div>
  );
}

export default ManageCategories;
