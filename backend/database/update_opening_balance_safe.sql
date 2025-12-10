-- Update opening_balance safely (works with safe update mode enabled)
USE habit_tracker;

-- First, check current state
SELECT
  id,
  account_name,
  balance,
  opening_balance,
  CASE
    WHEN opening_balance IS NULL OR opening_balance = 0 THEN 'Needs Update'
    ELSE 'Already Set'
  END as status
FROM accounts
WHERE is_active = TRUE;

-- Update each account individually using ID (safe update mode compatible)
-- Copy the output from above and create individual UPDATE statements for each account that needs updating

-- Example format (replace with your actual account IDs and balances):
-- UPDATE accounts SET opening_balance = 500.00 WHERE id = 1;
-- UPDATE accounts SET opening_balance = 1000.00 WHERE id = 2;
-- etc...

-- OR, temporarily disable safe update mode for this session only:
SET SQL_SAFE_UPDATES = 0;

-- Now update all accounts
UPDATE accounts
SET opening_balance = balance
WHERE (opening_balance IS NULL OR opening_balance = 0)
  AND is_active = TRUE;

-- Re-enable safe update mode
SET SQL_SAFE_UPDATES = 1;

-- Verify the update
SELECT
  id,
  account_name,
  balance,
  opening_balance,
  CASE
    WHEN opening_balance = balance THEN '✅ Migrated Successfully'
    WHEN opening_balance IS NULL OR opening_balance = 0 THEN '❌ Still NULL/0'
    ELSE '⚠️ Different Values'
  END as migration_status
FROM accounts
WHERE is_active = TRUE;

-- Show totals
SELECT
  COUNT(*) as total_accounts,
  COALESCE(SUM(opening_balance), 0) as total_opening_balance,
  COALESCE(SUM(balance), 0) as total_current_balance
FROM accounts
WHERE is_active = TRUE;
