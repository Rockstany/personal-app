import { useState, useEffect } from 'react';
import { moneyService } from '../services/moneyService';
import AddTransaction from './AddTransaction';
import ManageAccounts from './ManageAccounts';
import ManageCategories from './ManageCategories';
import RecurringTransactions from './RecurringTransactions';
import MoneyReports from './MoneyReports';
import '../styles/Money.css';

function MoneyDashboard({ showToast }) {
  const [activeView, setActiveView] = useState('dashboard'); // dashboard, add, accounts, categories, recurring, reports
  const [accounts, setAccounts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [monthlySummary, setMonthlySummary] = useState({ income: 0, expense: 0, balance: 0 });
  const [dueRecurring, setDueRecurring] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    account_id: '',
    type: '',
    search: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (activeView === 'dashboard') {
      loadTransactions();
    }
  }, [filters]);

  const loadData = async () => {
    try {
      setLoading(true);

      // Only load essential data for dashboard
      const [accountsRes, categoriesRes] = await Promise.all([
        moneyService.accounts.getAll(),
        moneyService.categories.getAll()
      ]);

      setAccounts(accountsRes.data || []);
      setCategories(categoriesRes.data || []);

      // Load additional data only if on dashboard view
      if (activeView === 'dashboard') {
        // Calculate current month date range
        const today = new Date();
        const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const startDate = firstDayOfMonth.toISOString().split('T')[0];
        const endDate = today.toISOString().split('T')[0];

        const [monthlyRes, dueRes] = await Promise.all([
          moneyService.transactions.getPeriodSummary(startDate, endDate),
          moneyService.recurring.getDue()
        ]);

        setMonthlySummary(monthlyRes.data || { income: 0, expense: 0, balance: 0 });
        setDueRecurring(dueRes.data || []);

        await loadTransactions();
      }
    } catch (error) {
      console.error('Error loading money data:', error);
      const errorMsg = error.response?.data?.error || 'Failed to load money data';
      showToast(errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadTransactions = async () => {
    try {
      const res = await moneyService.transactions.getAll({
        ...filters,
        limit: 50
      });
      setTransactions(res.data);
    } catch (error) {
      console.error('Error loading transactions:', error);
    }
  };

  const handleDeleteTransaction = async (id) => {
    if (!confirm('Are you sure you want to delete this transaction?')) return;

    try {
      await moneyService.transactions.delete(id);
      showToast('Transaction deleted successfully', 'success');
      loadData();
    } catch (error) {
      console.error('Error deleting transaction:', error);
      showToast('Failed to delete transaction', 'error');
    }
  };

  const handleProcessRecurring = async (id) => {
    try {
      await moneyService.recurring.process(id);
      showToast('Recurring transaction processed successfully', 'success');
      loadData();
    } catch (error) {
      console.error('Error processing recurring:', error);
      showToast('Failed to process recurring transaction', 'error');
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
    }
  };

  if (loading) {
    return <div className="money-loading">Loading...</div>;
  }

  return (
    <div className="money-dashboard">
      {/* Navigation */}
      <div className="money-nav">
        <button
          className={`nav-btn ${activeView === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveView('dashboard')}
        >
          Dashboard
        </button>
        <button
          className={`nav-btn ${activeView === 'add' ? 'active' : ''}`}
          onClick={() => setActiveView('add')}
        >
          Add Transaction
        </button>
        <button
          className={`nav-btn ${activeView === 'accounts' ? 'active' : ''}`}
          onClick={() => setActiveView('accounts')}
        >
          Accounts
        </button>
        <button
          className={`nav-btn ${activeView === 'categories' ? 'active' : ''}`}
          onClick={() => setActiveView('categories')}
        >
          Categories
        </button>
        <button
          className={`nav-btn ${activeView === 'recurring' ? 'active' : ''}`}
          onClick={() => setActiveView('recurring')}
        >
          Recurring
        </button>
        <button
          className={`nav-btn ${activeView === 'reports' ? 'active' : ''}`}
          onClick={() => setActiveView('reports')}
        >
          Reports
        </button>
      </div>

      {/* Dashboard View */}
      {activeView === 'dashboard' && (
        <div className="dashboard-view">
          {/* Monthly Summary */}
          <div className="summary-cards">
            <div className="summary-card income">
              <div className="summary-icon">💰</div>
              <div className="summary-content">
                <div className="summary-label">This Month's Income</div>
                <div className="summary-value">{formatCurrency(monthlySummary.income)}</div>
              </div>
            </div>
            <div className="summary-card expense">
              <div className="summary-icon">💸</div>
              <div className="summary-content">
                <div className="summary-label">This Month's Expense</div>
                <div className="summary-value">{formatCurrency(monthlySummary.expense)}</div>
              </div>
            </div>
            <div className="summary-card balance">
              <div className="summary-icon">📊</div>
              <div className="summary-content">
                <div className="summary-label">This Month's Balance</div>
                <div className="summary-value">{formatCurrency(monthlySummary.balance)}</div>
              </div>
            </div>
          </div>

          {/* Accounts */}
          <div className="accounts-section">
            <h3>Your Accounts</h3>
            <div className="accounts-grid">
              {accounts.map(account => (
                <div key={account.id} className="account-card" style={{ borderLeftColor: account.color }}>
                  <div className="account-header">
                    <span className="account-icon">{account.icon}</span>
                    <span className="account-name">{account.account_name}</span>
                  </div>
                  <div className="account-balance">{formatCurrency(account.balance)}</div>
                  <div className="account-type">{account.account_type.replace('_', ' ')}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Due Recurring Transactions */}
          {dueRecurring.length > 0 && (
            <div className="due-recurring-section">
              <h3>Due Recurring Transactions</h3>
              <div className="due-recurring-list">
                {dueRecurring.map(recurring => (
                  <div key={recurring.id} className="due-recurring-item">
                    <div className="recurring-info">
                      <span className="recurring-icon">{recurring.category_icon}</span>
                      <div className="recurring-details">
                        <div className="recurring-name">{recurring.category_name}</div>
                        <div className="recurring-description">{recurring.description}</div>
                      </div>
                    </div>
                    <div className="recurring-amount" style={{ color: recurring.type === 'income' ? '#4caf50' : '#f44336' }}>
                      {formatCurrency(recurring.amount)}
                    </div>
                    <button
                      className="process-btn"
                      onClick={() => handleProcessRecurring(recurring.id)}
                    >
                      Process
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Filters */}
          <div className="filters-section">
            <select
              value={filters.account_id}
              onChange={(e) => setFilters({ ...filters, account_id: e.target.value })}
              className="filter-select"
            >
              <option value="">All Accounts</option>
              {accounts.map(acc => (
                <option key={acc.id} value={acc.id}>{acc.account_name}</option>
              ))}
            </select>

            <select
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
              className="filter-select"
            >
              <option value="">All Types</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>

            <input
              type="text"
              placeholder="Search transactions..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="filter-search"
            />
          </div>

          {/* Recent Transactions */}
          <div className="transactions-section">
            <h3>Recent Transactions</h3>
            <div className="transactions-list">
              {transactions.length === 0 ? (
                <div className="no-transactions">No transactions found</div>
              ) : (
                transactions.map(transaction => (
                  <div key={transaction.id} className="transaction-item">
                    <div className="transaction-left">
                      <span className="transaction-icon" style={{ backgroundColor: transaction.category_color }}>
                        {transaction.category_icon}
                      </span>
                      <div className="transaction-details">
                        <div className="transaction-category">{transaction.category_name}</div>
                        <div className="transaction-description">{transaction.description}</div>
                        <div className="transaction-meta">
                          <span className="transaction-account">{transaction.account_name}</span>
                          <span className="transaction-payment">{transaction.payment_method}</span>
                        </div>
                      </div>
                    </div>
                    <div className="transaction-right">
                      <div
                        className={`transaction-amount ${transaction.type}`}
                        style={{ color: transaction.type === 'income' ? '#4caf50' : '#f44336' }}
                      >
                        {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                      </div>
                      <div className="transaction-date">{formatDate(transaction.transaction_date)}</div>
                      <button
                        className="delete-btn"
                        onClick={() => handleDeleteTransaction(transaction.id)}
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add Transaction View */}
      {activeView === 'add' && (
        <AddTransaction
          accounts={accounts}
          categories={categories}
          onSuccess={() => {
            setActiveView('dashboard');
            loadData();
            showToast('Transaction added successfully!', 'success');
          }}
        />
      )}

      {/* Accounts View */}
      {activeView === 'accounts' && (
        <ManageAccounts
          accounts={accounts}
          onUpdate={loadData}
          showToast={showToast}
        />
      )}

      {/* Categories View */}
      {activeView === 'categories' && (
        <ManageCategories
          categories={categories}
          onUpdate={loadData}
          showToast={showToast}
        />
      )}

      {/* Recurring View */}
      {activeView === 'recurring' && (
        <RecurringTransactions
          accounts={accounts}
          categories={categories}
          showToast={showToast}
        />
      )}

      {/* Reports View */}
      {activeView === 'reports' && (
        <MoneyReports showToast={showToast} />
      )}
    </div>
  );
}

export default MoneyDashboard;
