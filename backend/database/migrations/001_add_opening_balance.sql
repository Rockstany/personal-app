-- Migration: Add opening_balance column to accounts table
-- Run this SQL directly in your MySQL database

USE personal_tracker;

-- Step 1: Add the opening_balance column
ALTER TABLE accounts
ADD COLUMN opening_balance DECIMAL(12, 2) DEFAULT 0.00 AFTER balance;

-- Step 2: Migrate existing data - copy current balance to opening_balance
-- This preserves your existing balances as the initial/opening balance
UPDATE accounts
SET opening_balance = balance;

-- Step 3: Verify the migration
SELECT
  id,
  account_name,
  balance as current_balance,
  opening_balance
FROM accounts
WHERE is_active = TRUE;

-- Expected result: opening_balance should match current balance for all existing accounts
