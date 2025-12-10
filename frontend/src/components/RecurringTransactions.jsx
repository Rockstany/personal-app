import { useState, useEffect } from 'react';
import { moneyService } from '../services/moneyService';
import '../styles/Money.css';

function RecurringTransactions({ showToast, accounts, categories }) {
  const [recurring, setRecurring] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecurring();
  }, []);

  const loadRecurring = async () => {
    try {
      const response = await moneyService.getAllRecurring();
      setRecurring(response.data);
    } catch (error) {
      showToast('❌ Failed to load recurring transactions', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (id, currentStatus) => {
    try {
      await moneyService.updateRecurring(id, { is_active: !currentStatus });
      showToast(`🔄 Recurring transaction ${!currentStatus ? 'activated' : 'paused'}`, 'success');
      loadRecurring();
    } catch (error) {
      showToast('❌ Failed to update recurring transaction', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this recurring transaction?')) {
      try {
        await moneyService.deleteRecurring(id);
        showToast('🗑️ Recurring transaction deleted', 'success');
        loadRecurring();
      } catch (error) {
        showToast('❌ Failed to delete recurring transaction', 'error');
      }
    }
  };

  const handleProcessNow = async (id) => {
    try {
      await moneyService.processRecurring(id);
      showToast('✅ Recurring transaction processed!', 'success');
      loadRecurring();
    } catch (error) {
      showToast('❌ Failed to process recurring transaction', 'error');
    }
  };

  const getAccountName = (accountId) => {
    const account = accounts.find(acc => acc.id === accountId);
    return account ? `${account.icon} ${account.account_name}` : 'Unknown Account';
  };

  const getCategoryName = (categoryId) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? `${category.icon} ${category.name}` : 'Unknown Category';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getFrequencyLabel = (frequency) => {
    const labels = {
      daily: '📅 Daily',
      weekly: '📆 Weekly',
      monthly: '🗓️ Monthly',
      yearly: '📋 Yearly'
    };
    return labels[frequency] || frequency;
  };

  if (loading) {
    return (
      <div className="money-card">
        <div className="loading">⏳ Loading recurring transactions...</div>
      </div>
    );
  }

  return (
    <div className="money-card">
      <div className="card-header">
        <h3>🔄 Recurring Transactions</h3>
        <div className="header-info">
          <span className="info-badge">{recurring.length} Total</span>
          <span className="info-badge active">
            {recurring.filter(r => r.is_active).length} Active
          </span>
        </div>
      </div>

      {recurring.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🔄</div>
          <p>No recurring transactions yet.</p>
          <p className="empty-hint">Create one from the Add Transaction form!</p>
        </div>
      ) : (
        <div className="recurring-list">
          {recurring.map(item => (
            <div
              key={item.id}
              className={`recurring-item ${!item.is_active ? 'paused' : ''} ${item.type}`}
            >
              <div className="recurring-header">
                <div className="recurring-info">
                  <div className="recurring-category">
                    {getCategoryName(item.category_id)}
                  </div>
                  <div className="recurring-account">
                    {getAccountName(item.account_id)}
                  </div>
                </div>
                <div className="recurring-amount">
                  <span className={`amount ${item.type}`}>
                    {item.type === 'income' ? '+' : '-'}₹{parseFloat(item.amount).toFixed(2)}
                  </span>
                </div>
              </div>

              {item.description && (
                <div className="recurring-description">{item.description}</div>
              )}

              <div className="recurring-details">
                <div className="detail-item">
                  <span className="detail-label">{getFrequencyLabel(item.frequency)}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">💳 {item.payment_method.replace('_', ' ')}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">📅 Next: {formatDate(item.next_occurrence)}</span>
                </div>
                {item.end_date && (
                  <div className="detail-item">
                    <span className="detail-label">🏁 Until: {formatDate(item.end_date)}</span>
                  </div>
                )}
              </div>

              <div className="recurring-settings">
                <div className="setting-item">
                  <span className={`badge ${item.auto_add ? 'success' : 'neutral'}`}>
                    {item.auto_add ? '✅ Auto-add' : '⏸️ Manual'}
                  </span>
                </div>
                <div className="setting-item">
                  <span className={`badge ${item.reminder_enabled ? 'success' : 'neutral'}`}>
                    {item.reminder_enabled ? `🔔 Remind ${item.reminder_days_before}d before` : '🔕 No reminder'}
                  </span>
                </div>
              </div>

              <div className="recurring-actions">
                <button
                  onClick={() => handleToggleActive(item.id, item.is_active)}
                  className={`btn-action ${item.is_active ? 'pause' : 'play'}`}
                >
                  {item.is_active ? '⏸️ Pause' : '▶️ Resume'}
                </button>
                {item.is_active && (
                  <button
                    onClick={() => handleProcessNow(item.id)}
                    className="btn-action process"
                  >
                    ⚡ Process Now
                  </button>
                )}
                <button
                  onClick={() => handleDelete(item.id)}
                  className="btn-action delete"
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default RecurringTransactions;
