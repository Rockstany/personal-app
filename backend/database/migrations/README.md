# Database Migrations

## How to Run Migrations

### Option 1: Using MySQL Workbench or MySQL CLI
1. Open MySQL Workbench or connect via CLI: `mysql -u your_username -p`
2. Navigate to the migrations folder
3. Run the SQL file: `source 001_add_opening_balance.sql`

### Option 2: Copy and Paste
1. Open the SQL file in a text editor
2. Copy the SQL commands
3. Paste and execute in your MySQL client

## Migration History

### 001_add_opening_balance.sql
**Date:** 2025-12-10
**Purpose:** Add `opening_balance` column to accounts table

**Why:** The account balance calculation was incorrect because it didn't preserve the initial balance when the account was created. This migration:
- Adds an `opening_balance` column to store the initial balance
- Migrates existing balances to opening_balance
- Allows the recalculate function to properly compute: `opening_balance + income - expenses - transfers_out + transfers_in`

**Before running:** Backup your database
**After running:** Click "Fix Balances" button in the Money Tracker to recalculate all balances

## Important Notes
- Always backup your database before running migrations
- Migrations are designed to be run once
- If a migration fails, restore from backup and investigate the issue
