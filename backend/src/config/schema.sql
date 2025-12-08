-- Habit & Daily Tracker Database Schema

CREATE DATABASE IF NOT EXISTS habit_tracker;
USE habit_tracker;

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Habits table
CREATE TABLE IF NOT EXISTS habits (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  motivation TEXT,
  target_type ENUM('duration_90', 'numeric') NOT NULL,
  target_value INT NULL,
  target_unit VARCHAR(50) NULL,
  daily_target INT NULL,
  `trigger` TEXT,
  category VARCHAR(100) NOT NULL,
  priority VARCHAR(50),
  current_level INT DEFAULT 0,
  current_progress INT DEFAULT 0,
  start_date DATE NOT NULL,
  graduated_date DATE NULL,
  deleted_at TIMESTAMP NULL,
  deletion_reason TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_deleted_at (deleted_at)
);

-- Habit completions table
CREATE TABLE IF NOT EXISTS habit_completions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  habit_id INT NOT NULL,
  date DATE NOT NULL,
  status ENUM('done', 'not_done', 'skip') NOT NULL,
  value INT NULL,
  marked_offline BOOLEAN DEFAULT FALSE,
  synced_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (habit_id) REFERENCES habits(id) ON DELETE CASCADE,
  UNIQUE KEY unique_habit_date (habit_id, date),
  INDEX idx_habit_date (habit_id, date)
);

-- Habit skip days table
CREATE TABLE IF NOT EXISTS habit_skip_days (
  id INT PRIMARY KEY AUTO_INCREMENT,
  habit_id INT NOT NULL,
  level_earned_at INT NOT NULL,
  earned_date DATE NOT NULL,
  used_date DATE NULL,
  expiry_date DATE NOT NULL,
  status ENUM('available', 'used', 'expired') DEFAULT 'available',
  FOREIGN KEY (habit_id) REFERENCES habits(id) ON DELETE CASCADE,
  INDEX idx_habit_status (habit_id, status)
);

-- Daily tasks table
CREATE TABLE IF NOT EXISTS daily_tasks (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  notes TEXT,
  deadline DATE NOT NULL,
  max_extensions INT DEFAULT 2,
  extension_count INT DEFAULT 0,
  reassignment_reason TEXT,
  completed_at TIMESTAMP NULL,
  deleted_at TIMESTAMP NULL,
  deletion_reason TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_deadline (user_id, deadline),
  INDEX idx_deleted_at (deleted_at)
);

-- Settings table
CREATE TABLE IF NOT EXISTS settings (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT UNIQUE NOT NULL,
  skip_expiry_days INT DEFAULT 5,
  auto_not_done_time TIME DEFAULT '23:59:00',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
