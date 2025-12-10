-- Check the opening_balance values in your accounts table
USE habit_tracker;

-- Check if opening_balance column exists and has values
SELECT
  id,
  account_name,
  account_type,
  balance as current_balance,
  opening_balance,
  CASE
    WHEN opening_balance IS NULL THEN '❌ NULL - Migration not completed'
    WHEN opening_balance = 0 THEN '⚠️ ZERO - Need to set or recalculate'
    ELSE '✅ Has value'
  END as opening_balance_status,
  created_at
FROM accounts
WHERE is_active = TRUE
ORDER BY id;

-- Show the sum of all opening balances
SELECT
  COUNT(*) as total_accounts,
  COALESCE(SUM(opening_balance), 0) as total_opening_balance,
  COALESCE(SUM(balance), 0) as total_current_balance
FROM accounts
WHERE is_active = TRUE;
