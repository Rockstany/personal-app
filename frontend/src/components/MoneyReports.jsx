import { useState, useEffect } from 'react';
import { moneyService } from '../services/moneyService';
import '../styles/Money.css';

function MoneyReports({ showToast }) {
  const [reportType, setReportType] = useState('daily');
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().setDate(new Date().getDate() - 7)).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  const [summary, setSummary] = useState(null);
  const [byCategory, setByCategory] = useState([]);
  const [byAccount, setByAccount] = useState([]);
  const [trend, setTrend] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadReports();
  }, [reportType, dateRange]);

  const loadReports = async () => {
    setLoading(true);
    try {
      const [summaryRes, categoryRes, accountRes, trendRes] = await Promise.all([
        moneyService.getSummary(dateRange.start, dateRange.end),
        moneyService.getCategoryReport(dateRange.start, dateRange.end),
        moneyService.getAccountReport(),
        moneyService.getTrend(dateRange.start, dateRange.end)
      ]);

      setSummary(summaryRes.data);
      setByCategory(categoryRes.data);
      setByAccount(accountRes.data);
      setTrend(trendRes.data);
    } catch (error) {
      showToast('❌ Failed to load reports', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleReportTypeChange = (type) => {
    setReportType(type);
    const today = new Date();
    let start;

    switch (type) {
      case 'daily':
        start = today;
        break;
      case 'weekly':
        start = new Date(today.setDate(today.getDate() - 7));
        break;
      case 'monthly':
        start = new Date(today.setMonth(today.getMonth() - 1));
        break;
      case 'yearly':
        start = new Date(today.setFullYear(today.getFullYear() - 1));
        break;
      default:
        start = new Date(today.setDate(today.getDate() - 7));
    }

    setDateRange({
      start: start.toISOString().split('T')[0],
      end: new Date().toISOString().split('T')[0]
    });
  };

  const formatCurrency = (amount) => {
    return `₹${parseFloat(amount || 0).toFixed(2)}`;
  };

  const getPercentage = (value, total) => {
    if (!total || total === 0) return 0;
    return ((value / total) * 100).toFixed(1);
  };

  if (loading) {
    return (
      <div className="money-card">
        <div className="loading">⏳ Loading reports...</div>
      </div>
    );
  }

  return (
    <div className="reports-container">
      <div className="money-card">
        <div className="card-header">
          <h3>📊 Financial Reports</h3>
        </div>

        <div className="report-controls">
          <div className="report-type-tabs">
            <button
              className={`report-tab ${reportType === 'daily' ? 'active' : ''}`}
              onClick={() => handleReportTypeChange('daily')}
            >
              📅 Today
            </button>
            <button
              className={`report-tab ${reportType === 'weekly' ? 'active' : ''}`}
              onClick={() => handleReportTypeChange('weekly')}
            >
              📆 Week
            </button>
            <button
              className={`report-tab ${reportType === 'monthly' ? 'active' : ''}`}
              onClick={() => handleReportTypeChange('monthly')}
            >
              🗓️ Month
            </button>
            <button
              className={`report-tab ${reportType === 'yearly' ? 'active' : ''}`}
              onClick={() => handleReportTypeChange('yearly')}
            >
              📋 Year
            </button>
            <button
              className={`report-tab ${reportType === 'custom' ? 'active' : ''}`}
              onClick={() => setReportType('custom')}
            >
              🎯 Custom
            </button>
          </div>

          {reportType === 'custom' && (
            <div className="date-range-picker">
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                max={dateRange.end}
              />
              <span>to</span>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                min={dateRange.start}
                max={new Date().toISOString().split('T')[0]}
              />
              <button onClick={loadReports} className="btn-refresh">
                🔄 Refresh
              </button>
            </div>
          )}
        </div>

        {summary && (
          <div className="summary-cards">
            <div className="summary-card income">
              <div className="summary-icon">📈</div>
              <div className="summary-info">
                <div className="summary-label">Total Income</div>
                <div className="summary-value">{formatCurrency(summary.total_income)}</div>
                <div className="summary-count">{summary.income_count} transactions</div>
              </div>
            </div>

            <div className="summary-card expense">
              <div className="summary-icon">📉</div>
              <div className="summary-info">
                <div className="summary-label">Total Expenses</div>
                <div className="summary-value">{formatCurrency(summary.total_expense)}</div>
                <div className="summary-count">{summary.expense_count} transactions</div>
              </div>
            </div>

            <div className={`summary-card net ${summary.net_balance >= 0 ? 'positive' : 'negative'}`}>
              <div className="summary-icon">{summary.net_balance >= 0 ? '✅' : '⚠️'}</div>
              <div className="summary-info">
                <div className="summary-label">Net Balance</div>
                <div className="summary-value">{formatCurrency(summary.net_balance)}</div>
                <div className="summary-count">
                  {summary.net_balance >= 0 ? 'Surplus' : 'Deficit'}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {byCategory.length > 0 && (
        <div className="money-card">
          <h3>📊 By Category</h3>
          <div className="category-breakdown">
            <div className="breakdown-section">
              <h4 className="breakdown-title income">📈 Income Categories</h4>
              <div className="breakdown-list">
                {byCategory
                  .filter(cat => cat.type === 'income')
                  .sort((a, b) => parseFloat(b.total) - parseFloat(a.total))
                  .map(cat => (
                    <div key={cat.category_id} className="breakdown-item">
                      <div className="breakdown-header">
                        <span className="breakdown-icon">{cat.icon}</span>
                        <span className="breakdown-name">{cat.category_name}</span>
                        <span className="breakdown-amount income">
                          {formatCurrency(cat.total)}
                        </span>
                      </div>
                      <div className="breakdown-bar">
                        <div
                          className="breakdown-fill income"
                          style={{ width: `${getPercentage(cat.total, summary?.total_income)}%` }}
                        />
                      </div>
                      <div className="breakdown-stats">
                        <span>{cat.count} transactions</span>
                        <span>{getPercentage(cat.total, summary?.total_income)}%</span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            <div className="breakdown-section">
              <h4 className="breakdown-title expense">📉 Expense Categories</h4>
              <div className="breakdown-list">
                {byCategory
                  .filter(cat => cat.type === 'expense')
                  .sort((a, b) => parseFloat(b.total) - parseFloat(a.total))
                  .map(cat => (
                    <div key={cat.category_id} className="breakdown-item">
                      <div className="breakdown-header">
                        <span className="breakdown-icon">{cat.icon}</span>
                        <span className="breakdown-name">{cat.category_name}</span>
                        <span className="breakdown-amount expense">
                          {formatCurrency(cat.total)}
                        </span>
                      </div>
                      <div className="breakdown-bar">
                        <div
                          className="breakdown-fill expense"
                          style={{ width: `${getPercentage(cat.total, summary?.total_expense)}%` }}
                        />
                      </div>
                      <div className="breakdown-stats">
                        <span>{cat.count} transactions</span>
                        <span>{getPercentage(cat.total, summary?.total_expense)}%</span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {byAccount.length > 0 && (
        <div className="money-card">
          <h3>💼 By Account</h3>
          <div className="account-breakdown">
            {byAccount
              .sort((a, b) => parseFloat(b.balance) - parseFloat(a.balance))
              .map(acc => (
                <div key={acc.account_id} className="account-breakdown-item">
                  <div className="account-breakdown-header">
                    <span className="account-icon">{acc.icon}</span>
                    <div className="account-details">
                      <div className="account-name">{acc.account_name}</div>
                      <div className="account-type">{acc.account_type}</div>
                    </div>
                    <div className="account-balance">
                      <div className="balance-amount">{formatCurrency(acc.balance)}</div>
                      <div className="transaction-count">{acc.transaction_count} transactions</div>
                    </div>
                  </div>
                  <div className="account-totals">
                    <div className="account-total income">
                      <span>Income:</span>
                      <span>{formatCurrency(acc.total_income)}</span>
                    </div>
                    <div className="account-total expense">
                      <span>Expenses:</span>
                      <span>{formatCurrency(acc.total_expense)}</span>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {trend.length === 0 && byCategory.length === 0 && (
        <div className="money-card">
          <div className="empty-state">
            <div className="empty-icon">📊</div>
            <p>No transaction data for this period.</p>
            <p className="empty-hint">Add some transactions to see reports!</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default MoneyReports;
