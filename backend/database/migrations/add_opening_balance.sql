
ALTER TABLE accounts
ADD COLUMN opening_balance DECIMAL(12, 2) DEFAULT 0.00 AFTER balance;


UPDATE accounts
SET opening_balance = balance
WHERE opening_balance IS NULL;

ALTER TABLE accounts
MODIFY COLUMN balance DECIMAL(12, 2) DEFAULT 0.00 COMMENT 'Current balance (auto-calculated from transactions)',
MODIFY COLUMN opening_balance DECIMAL(12, 2) DEFAULT 0.00 COMMENT 'Initial balance when account was created';
