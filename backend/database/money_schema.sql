-- Money Tracker Database Schema
-- Phase 1: Complete schema for accounts, categories, transactions, recurring, and transfers

-- Table 1: Accounts (Bank accounts, wallets, cash, credit cards)
CREATE TABLE IF NOT EXISTS accounts (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  account_name VARCHAR(100) NOT NULL,
  account_type ENUM('cash', 'bank', 'credit_card', 'wallet', 'investment', 'business', 'crypto') NOT NULL,
  balance DECIMAL(12, 2) DEFAULT 0.00,
  opening_balance DECIMAL(12, 2) DEFAULT 0.00,
  bank_name VARCHAR(100),
  account_number VARCHAR(50),
  credit_limit DECIMAL(12, 2),
  due_date INT,
  color VARCHAR(7) DEFAULT '#667eea',
  icon VARCHAR(10) DEFAULT '💰',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_accounts (user_id, is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table 2: Categories (Income and Expense categories)
CREATE TABLE IF NOT EXISTS money_categories (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NULL,
  name VARCHAR(100) NOT NULL,
  type ENUM('income', 'expense') NOT NULL,
  icon VARCHAR(10) DEFAULT '🎯',
  color VARCHAR(7) DEFAULT '#667eea',
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_categories (user_id, type),
  INDEX idx_default_categories (is_default, type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table 3: Transactions (All income and expense entries)
CREATE TABLE IF NOT EXISTS transactions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  account_id INT NOT NULL,
  category_id INT NOT NULL,
  type ENUM('income', 'expense') NOT NULL,
  amount DECIMAL(12, 2) NOT NULL,
  description TEXT,
  transaction_date DATE NOT NULL,
  payment_method ENUM('cash', 'credit_card', 'debit_card', 'upi', 'bank_transfer', 'wallet', 'cheque', 'crypto', 'other') DEFAULT 'cash',
  is_recurring BOOLEAN DEFAULT FALSE,
  recurring_id INT NULL,
  marked_offline BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES money_categories(id) ON DELETE CASCADE,
  INDEX idx_user_transactions (user_id, transaction_date DESC),
  INDEX idx_account_transactions (account_id, transaction_date DESC),
  INDEX idx_category_transactions (category_id),
  INDEX idx_type_date (type, transaction_date),
  INDEX idx_deleted (deleted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table 4: Recurring Transactions
CREATE TABLE IF NOT EXISTS recurring_transactions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  account_id INT NOT NULL,
  category_id INT NOT NULL,
  type ENUM('income', 'expense') NOT NULL,
  amount DECIMAL(12, 2) NOT NULL,
  description TEXT,
  payment_method ENUM('cash', 'credit_card', 'debit_card', 'upi', 'bank_transfer', 'wallet', 'cheque', 'crypto', 'other') DEFAULT 'cash',
  frequency ENUM('daily', 'weekly', 'monthly', 'yearly', 'custom') NOT NULL,
  custom_interval INT NULL,
  start_date DATE NOT NULL,
  end_date DATE NULL,
  next_occurrence DATE NOT NULL,
  auto_add BOOLEAN DEFAULT TRUE,
  reminder_enabled BOOLEAN DEFAULT TRUE,
  reminder_days_before INT DEFAULT 3,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES money_categories(id) ON DELETE CASCADE,
  INDEX idx_user_recurring (user_id, is_active),
  INDEX idx_next_occurrence (next_occurrence, is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table 5: Transfers (Money movement between accounts)
CREATE TABLE IF NOT EXISTS transfers (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  from_account_id INT NOT NULL,
  to_account_id INT NOT NULL,
  amount DECIMAL(12, 2) NOT NULL,
  description TEXT,
  transfer_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (from_account_id) REFERENCES accounts(id) ON DELETE CASCADE,
  FOREIGN KEY (to_account_id) REFERENCES accounts(id) ON DELETE CASCADE,
  INDEX idx_user_transfers (user_id, transfer_date DESC),
  INDEX idx_from_account (from_account_id),
  INDEX idx_to_account (to_account_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
