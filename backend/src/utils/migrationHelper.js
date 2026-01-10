import { query } from '../config/database.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Check if migration has been run
export async function hasMigrationRun(migrationName) {
  try {
    const results = await query(
      'SELECT * FROM migration_tracker WHERE migration_name = ?',
      [migrationName]
    );
    return results.length > 0;
  } catch (error) {
    // If table doesn't exist, no migrations have been run
    return false;
  }
}

// Record migration as executed
export async function recordMigration(migrationName, notes = '') {
  try {
    await query(
      'INSERT INTO migration_tracker (migration_name, notes) VALUES (?, ?)',
      [migrationName, notes]
    );
    return true;
  } catch (error) {
    console.error(`Failed to record migration ${migrationName}:`, error);
    return false;
  }
}

// Get all executed migrations
export async function getExecutedMigrations() {
  try {
    return await query(
      'SELECT * FROM migration_tracker ORDER BY executed_at ASC'
    );
  } catch (error) {
    return [];
  }
}

// List all migration files
export function getMigrationFiles() {
  const migrationsPath = path.join(__dirname, '../../database/migrations');

  try {
    const files = fs.readdirSync(migrationsPath);
    return files
      .filter(file => file.endsWith('.sql'))
      .sort()
      .map(file => ({
        name: file,
        path: path.join(migrationsPath, file)
      }));
  } catch (error) {
    console.error('Error reading migration files:', error);
    return [];
  }
}

// Check pending migrations
export async function getPendingMigrations() {
  const allMigrations = getMigrationFiles();
  const executed = await getExecutedMigrations();
  const executedNames = new Set(executed.map(m => m.migration_name));

  return allMigrations.filter(m => !executedNames.has(m.name));
}

// Helper to check migration status
export async function getMigrationStatus() {
  const all = getMigrationFiles();
  const executed = await getExecutedMigrations();
  const pending = await getPendingMigrations();

  return {
    total: all.length,
    executed: executed.length,
    pending: pending.length,
    migrations: {
      all: all.map(m => m.name),
      executed: executed.map(m => m.migration_name),
      pending: pending.map(m => m.name)
    }
  };
}
