# Database Migrations

## How to Run Migrations

### Option 1: Using MySQL Workbench or MySQL CLI
1. Open MySQL Workbench or connect via CLI: `mysql -u your_username -p`
2. Select your database: `USE habit_tracker;`
3. Navigate to the migrations folder
4. Run migrations in order:
   ```sql
   source 000_migration_tracker.sql
   source 001_add_opening_balance.sql
   ```

### Option 2: Copy and Paste
1. Open the SQL file in a text editor
2. Copy the SQL commands
3. Paste and execute in your MySQL client

### Option 3: Check Migration Status (Programmatic)
Use the migration helper utility:
```javascript
import { getMigrationStatus } from './src/utils/migrationHelper.js';
const status = await getMigrationStatus();
console.log(status);
```

## Migration History

### 000_migration_tracker.sql
**Date:** 2026-01-10
**Purpose:** Create migration tracking system

**Why:** Provides automated tracking of which migrations have been executed:
- Creates `migration_tracker` table
- Records migration execution timestamps
- Prevents duplicate migration runs
- Enables programmatic migration status checks

**Before running:** This should be the first migration
**After running:** All subsequent migrations will be tracked

---

### 001_add_opening_balance.sql
**Date:** 2025-12-10
**Purpose:** Add `opening_balance` column to accounts table

**Why:** The account balance calculation was incorrect because it didn't preserve the initial balance when the account was created. This migration:
- Adds an `opening_balance` column to store the initial balance
- Migrates existing balances to opening_balance
- Allows the recalculate function to properly compute: `opening_balance + income - expenses - transfers_out + transfers_in`

**Before running:** Backup your database, ensure migration tracker is set up
**After running:** Click "Fix Balances" button in the Money Tracker to recalculate all balances

---

## Important Notes
- Always backup your database before running migrations
- Migrations are designed to be run once
- Run migrations in numeric order (000, 001, 002, etc.)
- The migration tracker prevents accidental re-runs
- If a migration fails, restore from backup and investigate the issue
- New installations should run all migrations in order

## Checking Migration Status
Query the tracker table to see what's been run:
```sql
SELECT * FROM migration_tracker ORDER BY executed_at;
```
