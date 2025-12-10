import { useState } from 'react';
import { moneyService } from '../services/moneyService';
import '../styles/Money.css';

function ManageAccounts({ accounts, onUpdate, showToast }) {
  const [showForm, setShowForm] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [formData, setFormData] = useState({
    account_name: '',
    account_type: 'bank',
    balance: '0',
    bank_name: '',
    account_number: '',
    credit_limit: '',
    due_date: '',
    color: '#667eea',
    icon: '💰'
  });

  const accountTypeIcons = {
    cash: '💵',
    bank: '🏦',
    credit_card: '💳',
    wallet: '👛',
    investment: '📈',
    business: '🏪',
    crypto: '₿'
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
      ...(name === 'account_type' && { icon: accountTypeIcons[value] || '💰' })
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log('=== CREATE ACCOUNT DEBUG ===');
      console.log('Form Data:', formData);
      console.log('API URL:', import.meta.env.VITE_API_URL);
      console.log('Token:', localStorage.getItem('token') ? 'Present' : 'Missing');

      if (editingAccount) {
        const response = await moneyService.accounts.update(editingAccount.id, formData);
        console.log('Update response:', response);
        showToast('✅ Account updated successfully!', 'success');
      } else {
        const response = await moneyService.accounts.create(formData);
        console.log('Create response:', response);
        showToast('✅ Account created successfully!', 'success');
      }
      resetForm();
      onUpdate();
    } catch (error) {
      console.error('=== SAVE ACCOUNT ERROR ===');
      console.error('Full error:', error);
      console.error('Error response:', error.response);
      console.error('Error response data:', error.response?.data);
      console.error('Error message:', error.message);
      console.error('Error status:', error.response?.status);

      const errorMsg = error.response?.data?.error || error.message || 'Failed to save account';
      showToast(`❌ ${errorMsg}`, 'error');
    }
  };

  const handleEdit = (account) => {
    setEditingAccount(account);
    setFormData({
      account_name: account.account_name,
      account_type: account.account_type,
      balance: account.balance.toString(),
      bank_name: account.bank_name || '',
      account_number: account.account_number || '',
      credit_limit: account.credit_limit?.toString() || '',
      due_date: account.due_date?.toString() || '',
      color: account.color,
      icon: account.icon
    });
    setShowForm(true);
  };

  const handleDelete = async (accountId) => {
    if (window.confirm('Are you sure you want to delete this account? This will not delete associated transactions.')) {
      try {
        await moneyService.accounts.delete(accountId);
        showToast('🗑️ Account deleted successfully!', 'success');
        onUpdate();
      } catch (error) {
        showToast('❌ Failed to delete account', 'error');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      account_name: '',
      account_type: 'bank',
      balance: '0',
      bank_name: '',
      account_number: '',
      credit_limit: '',
      due_date: '',
      color: '#667eea',
      icon: '💰'
    });
    setEditingAccount(null);
    setShowForm(false);
  };

  const totalBalance = accounts.reduce((sum, acc) => sum + parseFloat(acc.balance || 0), 0);

  return (
    <div className="money-card">
      <div className="card-header">
        <h3>💼 Manage Accounts</h3>
        <button
          onClick={() => setShowForm(!showForm)}
          className="action-btn"
        >
          {showForm ? '❌ Cancel' : '➕ Add Account'}
        </button>
      </div>

      <div className="total-balance">
        <div className="balance-label">Total Balance</div>
        <div className="balance-amount">₹{totalBalance.toFixed(2)}</div>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="money-form account-form">
          <div className="form-row">
            <div className="form-group">
              <label>Account Name *</label>
              <input
                type="text"
                name="account_name"
                value={formData.account_name}
                onChange={handleChange}
                placeholder="e.g., HDFC Savings"
                required
              />
            </div>

            <div className="form-group">
              <label>Account Type *</label>
              <select
                name="account_type"
                value={formData.account_type}
                onChange={handleChange}
                required
              >
                <option value="bank">🏦 Bank Account</option>
                <option value="cash">💵 Cash</option>
                <option value="credit_card">💳 Credit Card</option>
                <option value="wallet">👛 Wallet</option>
                <option value="investment">📈 Investment</option>
                <option value="business">🏪 Business</option>
                <option value="crypto">₿ Crypto</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Initial Balance</label>
              <input
                type="number"
                name="balance"
                value={formData.balance}
                onChange={handleChange}
                step="0.01"
                placeholder="0.00"
              />
            </div>

            <div className="form-group">
              <label>Icon</label>
              <input
                type="text"
                name="icon"
                value={formData.icon}
                onChange={handleChange}
                placeholder="💰"
              />
            </div>
          </div>

          {formData.account_type === 'bank' && (
            <div className="form-row">
              <div className="form-group">
                <label>Bank Name</label>
                <input
                  type="text"
                  name="bank_name"
                  value={formData.bank_name}
                  onChange={handleChange}
                  placeholder="e.g., HDFC Bank"
                />
              </div>

              <div className="form-group">
                <label>Account Number</label>
                <input
                  type="text"
                  name="account_number"
                  value={formData.account_number}
                  onChange={handleChange}
                  placeholder="Last 4 digits"
                />
              </div>
            </div>
          )}

          {formData.account_type === 'credit_card' && (
            <div className="form-row">
              <div className="form-group">
                <label>Credit Limit</label>
                <input
                  type="number"
                  name="credit_limit"
                  value={formData.credit_limit}
                  onChange={handleChange}
                  step="0.01"
                  placeholder="0.00"
                />
              </div>

              <div className="form-group">
                <label>Due Date (Day of Month)</label>
                <input
                  type="number"
                  name="due_date"
                  value={formData.due_date}
                  onChange={handleChange}
                  min="1"
                  max="31"
                  placeholder="e.g., 15"
                />
              </div>
            </div>
          )}

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
            {editingAccount ? '✅ Update Account' : '➕ Create Account'}
          </button>
        </form>
      )}

      <div className="accounts-grid">
        {accounts.map(account => (
          <div
            key={account.id}
            className="account-card"
            style={{ borderLeft: `4px solid ${account.color}` }}
          >
            <div className="account-header">
              <div className="account-icon">{account.icon}</div>
              <div className="account-info">
                <div className="account-name">{account.account_name}</div>
                <div className="account-type">{account.account_type.replace('_', ' ')}</div>
              </div>
              <div className="account-balance">
                <div className="balance-amount">₹{parseFloat(account.balance || 0).toFixed(2)}</div>
              </div>
            </div>

            {account.bank_name && (
              <div className="account-detail">🏦 {account.bank_name}</div>
            )}
            {account.account_number && (
              <div className="account-detail">💳 ****{account.account_number}</div>
            )}
            {account.credit_limit && (
              <div className="account-detail">📊 Limit: ₹{parseFloat(account.credit_limit).toFixed(2)}</div>
            )}
            {account.due_date && (
              <div className="account-detail">📅 Due: {account.due_date}th of month</div>
            )}

            <div className="account-actions">
              <button
                onClick={() => handleEdit(account)}
                className="btn-edit"
              >
                ✏️ Edit
              </button>
              <button
                onClick={() => handleDelete(account.id)}
                className="btn-delete"
              >
                🗑️ Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {accounts.length === 0 && !showForm && (
        <div className="empty-state">
          <div className="empty-icon">💼</div>
          <p>No accounts yet. Add your first account to get started!</p>
        </div>
      )}
    </div>
  );
}

export default ManageAccounts;
