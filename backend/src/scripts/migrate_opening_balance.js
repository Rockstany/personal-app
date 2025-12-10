import { query } from '../config/database.js';

async function migrate() {
  try {
    console.log('Starting migration: Add opening_balance column...');

    // Step 1: Add opening_balance column
    await query(`
      ALTER TABLE accounts
      ADD COLUMN IF NOT EXISTS opening_balance DECIMAL(12, 2) DEFAULT 0.00 AFTER balance
    `);
    console.log('✓ Added opening_balance column');

    // Step 2: Migrate existing data - set opening_balance to current balance
    const result = await query(`
      UPDATE accounts
      SET opening_balance = balance
      WHERE opening_balance IS NULL OR opening_balance = 0
    `);
    console.log(`✓ Migrated ${result.affectedRows} existing accounts`);

    console.log('Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrate();
