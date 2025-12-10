import { useState, useEffect } from 'react';
import { moneyService } from '../services/moneyService';
import '../styles/Money.css';

function AddTransaction({ onSuccess, accounts, categories }) {
  const [formData, setFormData] = useState({
    type: 'expense',
    account_id: '',
    category_id: '',
    amount: '',
    description: '',
    transaction_date: new Date().toISOString().split('T')[0],
    payment_method: 'cash',
    is_recurring: false,
    frequency: 'monthly',
    end_date: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const filteredCategories = categories.filter(cat => cat.type === formData.type);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (formData.is_recurring) {
        // Create recurring transaction
        await moneyService.recurring.create({
          account_id: formData.account_id,
          category_id: formData.category_id,
          type: formData.type,
          amount: parseFloat(formData.amount),
          description: formData.description,
          payment_method: formData.payment_method,
          frequency: formData.frequency,
          start_date: formData.transaction_date,
          end_date: formData.end_date || null,
          auto_add: true,
          reminder_enabled: true
        });
      } else {
        // Create one-time transaction
        await moneyService.transactions.create({
          account_id: formData.account_id,
          category_id: formData.category_id,
          type: formData.type,
          amount: parseFloat(formData.amount),
          description: formData.description,
          transaction_date: formData.transaction_date,
          payment_method: formData.payment_method
        });
      }

      // Reset form
      setFormData({
        type: 'expense',
        account_id: '',
        category_id: '',
        amount: '',
        description: '',
        transaction_date: new Date().toISOString().split('T')[0],
        payment_method: 'cash',
        is_recurring: false,
        frequency: 'monthly',
        end_date: ''
      });

      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add transaction');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="money-card">
      <h3>💰 Add Transaction</h3>
      <form onSubmit={handleSubmit} className="money-form">
        {error && <div className="error-message">{error}</div>}

        <div className="form-row">
          <div className="form-group">
            <label>Type</label>
            <div className="type-toggle">
              <button
                type="button"
                className={`type-btn ${formData.type === 'income' ? 'active income' : ''}`}
                onClick={() => setFormData(prev => ({ ...prev, type: 'income', category_id: '' }))}
              >
                📈 Income
              </button>
              <button
                type="button"
                className={`type-btn ${formData.type === 'expense' ? 'active expense' : ''}`}
                onClick={() => setFormData(prev => ({ ...prev, type: 'expense', category_id: '' }))}
              >
                📉 Expense
              </button>
            </div>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Amount *</label>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              placeholder="0.00"
              step="0.01"
              min="0"
              required
            />
          </div>

          <div className="form-group">
            <label>Date *</label>
            <input
              type="date"
              name="transaction_date"
              value={formData.transaction_date}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Account *</label>
            <select
              name="account_id"
              value={formData.account_id}
              onChange={handleChange}
              required
            >
              <option value="">Select Account</option>
              {accounts.map(acc => (
                <option key={acc.id} value={acc.id}>
                  {acc.icon} {acc.account_name} - ₹{acc.balance}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Category *</label>
            <select
              name="category_id"
              value={formData.category_id}
              onChange={handleChange}
              required
            >
              <option value="">Select Category</option>
              {filteredCategories.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.icon} {cat.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-group">
          <label>Payment Method</label>
          <select
            name="payment_method"
            value={formData.payment_method}
            onChange={handleChange}
          >
            <option value="cash">💵 Cash</option>
            <option value="credit_card">💳 Credit Card</option>
            <option value="debit_card">💳 Debit Card</option>
            <option value="upi">📱 UPI</option>
            <option value="bank_transfer">🏦 Bank Transfer</option>
            <option value="wallet">👛 Wallet</option>
            <option value="cheque">📝 Cheque</option>
            <option value="crypto">₿ Crypto</option>
            <option value="other">🎯 Other</option>
          </select>
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Add notes..."
            rows="3"
          />
        </div>

        <div className="form-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              name="is_recurring"
              checked={formData.is_recurring}
              onChange={handleChange}
            />
            <span>🔄 Make this recurring</span>
          </label>
        </div>

        {formData.is_recurring && (
          <div className="recurring-options">
            <div className="form-row">
              <div className="form-group">
                <label>Frequency</label>
                <select
                  name="frequency"
                  value={formData.frequency}
                  onChange={handleChange}
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>

              <div className="form-group">
                <label>End Date (Optional)</label>
                <input
                  type="date"
                  name="end_date"
                  value={formData.end_date}
                  onChange={handleChange}
                  min={formData.transaction_date}
                />
              </div>
            </div>
          </div>
        )}

        <button type="submit" className="submit-btn" disabled={loading}>
          {loading ? '⏳ Adding...' : `➕ Add ${formData.type === 'income' ? 'Income' : 'Expense'}`}
        </button>
      </form>
    </div>
  );
}

export default AddTransaction;
