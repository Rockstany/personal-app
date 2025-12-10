-- Diagnose why opening_balance and balance are 0
USE habit_tracker;

-- Check all accounts with their balances
SELECT
  id,
  account_name,
  account_type,
  balance,
  opening_balance,
  created_at
FROM accounts
WHERE is_active = TRUE;

-- Check if there are any transactions for these accounts
SELECT
  t.id,
  t.account_id,
  a.account_name,
  t.type,
  t.amount,
  t.transaction_date,
  t.description
FROM transactions t
JOIN accounts a ON t.account_id = a.id
WHERE t.deleted_at IS NULL
ORDER BY t.transaction_date DESC;

-- Check the transaction summary by account
SELECT
  a.id as account_id,
  a.account_name,
  a.balance as current_balance,
  a.opening_balance,
  COUNT(CASE WHEN t.type = 'income' THEN 1 END) as income_count,
  COALESCE(SUM(CASE WHEN t.type = 'income' THEN t.amount ELSE 0 END), 0) as total_income,
  COUNT(CASE WHEN t.type = 'expense' THEN 1 END) as expense_count,
  COALESCE(SUM(CASE WHEN t.type = 'expense' THEN t.amount ELSE 0 END), 0) as total_expenses
FROM accounts a
LEFT JOIN transactions t ON a.id = t.account_id AND t.deleted_at IS NULL
WHERE a.is_active = TRUE
GROUP BY a.id, a.account_name, a.balance, a.opening_balance;
