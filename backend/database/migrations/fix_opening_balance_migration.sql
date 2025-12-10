-- Fix the opening_balance migration
-- This completes the migration by copying existing balances to opening_balance

USE habit_tracker;

-- Temporarily disable safe update mode for this session
SET SQL_SAFE_UPDATES = 0;

-- Update all accounts to set opening_balance = current balance
-- This preserves your existing balances as the initial opening balance
UPDATE accounts
SET opening_balance = balance
WHERE opening_balance IS NULL OR opening_balance = 0;

-- Re-enable safe update mode
SET SQL_SAFE_UPDATES = 1;

-- Add comments to document the fields
ALTER TABLE accounts
MODIFY COLUMN balance DECIMAL(12, 2) DEFAULT 0.00 COMMENT 'Current balance (auto-calculated from transactions)',
MODIFY COLUMN opening_balance DECIMAL(12, 2) DEFAULT 0.00 COMMENT 'Initial balance when account was created';

-- Verify the migration - check that opening_balance is now populated
SELECT
  id,
  account_name,
  balance as current_balance,
  opening_balance,
  CASE
    WHEN opening_balance = 0 AND balance = 0 THEN 'OK - Both zero'
    WHEN opening_balance = balance THEN 'OK - Migrated'
    WHEN opening_balance != balance THEN 'WARNING - Different values'
    WHEN opening_balance IS NULL THEN 'ERROR - NULL opening_balance'
    ELSE 'Unknown'
  END as migration_status
FROM accounts
WHERE is_active = TRUE
ORDER BY id;
