-- Add opening_balance column to accounts table
-- This stores the initial balance when the account was created
-- The current balance field will be calculated as: opening_balance + income - expenses +/- transfers

ALTER TABLE accounts
ADD COLUMN opening_balance DECIMAL(12, 2) DEFAULT 0.00 AFTER balance;

-- Migrate existing data: set opening_balance to current balance
-- This preserves existing balances
UPDATE accounts
SET opening_balance = balance
WHERE opening_balance IS NULL;

-- Add comment to document the fields
ALTER TABLE accounts
MODIFY COLUMN balance DECIMAL(12, 2) DEFAULT 0.00 COMMENT 'Current balance (auto-calculated from transactions)',
MODIFY COLUMN opening_balance DECIMAL(12, 2) DEFAULT 0.00 COMMENT 'Initial balance when account was created';
