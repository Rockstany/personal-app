-- Migration Tracker Table
-- This table keeps track of which migrations have been run

CREATE TABLE IF NOT EXISTS migration_tracker (
  id INT PRIMARY KEY AUTO_INCREMENT,
  migration_name VARCHAR(255) NOT NULL UNIQUE,
  executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  success BOOLEAN DEFAULT TRUE,
  notes TEXT,
  INDEX idx_migration_name (migration_name),
  INDEX idx_executed_at (executed_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Record this migration as executed
INSERT INTO migration_tracker (migration_name, notes)
VALUES ('000_migration_tracker', 'Created migration tracking system');
