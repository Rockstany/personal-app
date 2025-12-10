# 📋 Changelog

All notable changes to the Habit & Daily Tracker project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.2.0] - 2024-12-10

### ✨ Features Added - Money Tracker Phase 1

#### 💰 Core Money Management
- **Multiple Account Support**
  - Create and manage unlimited accounts (Bank, Cash, Credit Card, Wallet, Investment, Business, Crypto)
  - Track individual account balances in real-time
  - Visual account cards with custom icons and colors
  - Account type indicators with emoji icons
  - Bank details (name, account number, credit limit, due date)
  - Total balance calculation across all accounts
  - Soft delete for data preservation

- **Transaction Management**
  - Add income and expense transactions
  - Transaction form with all essential fields (amount, date, category, account, payment method, description)
  - Payment method tracking (Cash, Credit Card, Debit Card, UPI, Bank Transfer, Wallet, Cheque, Crypto, Other)
  - Transaction type toggle (Income/Expense)
  - Real-time account balance updates
  - Transaction list with filtering capabilities
  - Delete transactions with confirmation

- **Category System**
  - Default income categories (Salary, Freelance, Gift, Investment Returns, Business, Refund, Other Income)
  - Default expense categories (Food & Dining, Rent & Bills, Transportation, Shopping, Entertainment, Healthcare, Education, Clothing, Subscriptions, Other Expenses)
  - Create custom categories with icons and colors
  - Edit and delete custom categories
  - Category type segregation (Income/Expense)
  - Visual category management UI

- **Recurring Transactions**
  - Set up automatic recurring income and expenses
  - Frequency options (Daily, Weekly, Monthly, Yearly)
  - Custom start and end dates
  - Auto-add functionality for automatic transaction creation
  - Reminder system (configurable days before due)
  - Pause/Resume recurring transactions
  - Process recurring transactions manually
  - View all recurring transactions with status indicators
  - Delete recurring transactions

- **Financial Reports & Analytics**
  - Multiple report timeframes (Today, Week, Month, Year, Custom range)
  - Summary cards showing total income, expenses, and net balance
  - Category breakdown with visual progress bars
  - Percentage calculations for spending analysis
  - Account-wise breakdown showing balances and transaction counts
  - Income vs Expense comparison
  - Visual indicators for surplus/deficit
  - Color-coded charts (Green for income, Red for expenses)

#### 🎨 UI/UX Enhancements
- **Money Dashboard**
  - Main dashboard with tabbed navigation
  - Quick stats overview (Today's income, expenses, balance)
  - Account switcher for quick access
  - Filter options (All accounts, specific account, date range)
  - Responsive layout for mobile and desktop

- **Component Design**
  - Gradient card designs matching app theme
  - Icon-based visual language
  - Smooth transitions and hover effects
  - Empty states with helpful hints
  - Loading states for async operations
  - Error handling with user-friendly messages

- **Money Tab Integration**
  - New "💰 Money" tab in main navigation
  - Seamless integration with existing Habits and Tasks features
  - Toast notifications for success/error feedback
  - Consistent styling with app design system

### 🔧 Technical Implementation

#### Backend Architecture
- **Database Schema**
  - 5 new tables: accounts, money_categories, transactions, recurring_transactions, transfers
  - Foreign key relationships for data integrity
  - Indexes for optimized queries
  - DECIMAL(12,2) for precise money calculations
  - Timestamp tracking for all records
  - Soft delete support with is_active flags

- **Models Layer**
  - accountModel.js - CRUD operations for accounts
  - categoryModel.js - Category management
  - transactionModel.js - Transaction operations with balance updates
  - recurringModel.js - Recurring transaction logic
  - transferModel.js - Money transfers between accounts

- **Controllers**
  - accountController.js - Account endpoints
  - categoryController.js - Category endpoints
  - transactionController.js - Transaction endpoints with reporting
  - recurringController.js - Recurring transaction endpoints

- **API Routes**
  - /api/money/accounts - Account management
  - /api/money/categories - Category operations
  - /api/money/transactions - Transaction CRUD and reports
  - /api/money/recurring - Recurring transaction management

#### Frontend Architecture
- **Services**
  - moneyService.js - API communication layer for all money operations
  - Axios-based HTTP client with JWT authentication
  - Error handling and response formatting

- **Components**
  - MoneyDashboard.jsx - Main container with state management
  - AddTransaction.jsx - Transaction creation form with recurring options
  - ManageAccounts.jsx - Account CRUD interface
  - ManageCategories.jsx - Category management UI
  - RecurringTransactions.jsx - Recurring transaction list and controls
  - MoneyReports.jsx - Financial reports and charts

- **Styling**
  - Money.css - Comprehensive styles for all money components
  - Gradient color schemes (Purple for cards, Green for income, Red for expenses)
  - Responsive grid layouts
  - Mobile-first design approach
  - Smooth animations and transitions

### 📝 Files Added/Modified

**Database:**
- backend/database/money_schema.sql
- backend/database/seed_money_categories.sql

**Backend (9 files):**
- backend/src/models/accountModel.js
- backend/src/models/categoryModel.js
- backend/src/models/transactionModel.js
- backend/src/models/recurringModel.js
- backend/src/models/transferModel.js
- backend/src/controllers/accountController.js
- backend/src/controllers/categoryController.js
- backend/src/controllers/transactionController.js
- backend/src/controllers/recurringController.js

**Frontend (7 files):**
- frontend/src/services/moneyService.js
- frontend/src/components/MoneyDashboard.jsx
- frontend/src/components/AddTransaction.jsx
- frontend/src/components/ManageAccounts.jsx
- frontend/src/components/ManageCategories.jsx
- frontend/src/components/RecurringTransactions.jsx
- frontend/src/components/MoneyReports.jsx
- frontend/src/styles/Money.css

**Integration:**
- frontend/src/pages/Dashboard.jsx - Added Money tab
- backend/src/index.js - Registered money routes

---

## [1.1.1] - 2024-12-10

### ✨ Features Added
- **Not Done Button**
  - Added manual "Not Done" button for users to explicitly mark habits as not completed
  - Gray gradient styling to distinguish from other actions
  - Provides user control over habit status instead of just automatic marking

- **Skip Days Counter**
  - Skip button now displays available skip days count: "Skip (2)"
  - Button automatically disables when skip count is 0
  - Visual feedback with grayed-out disabled state
  - Backend query optimized to include skip_days_count

### 🎨 Design Improvements
- Disabled skip button styling with reduced opacity
- New gray gradient for "Not Done" button
- Better button spacing with flex-wrap layout

---

## [1.1.0] - 2024-12-10

### ✨ Features Added
- **Collapsible Navbar**
  - Toggle button to collapse/expand header for better mobile experience
  - Smooth animations with 0.3s transitions
  - Gradient toggle button positioned at bottom center of header
  - Arrow indicators (▲/▼) showing current state
  - Saves screen space when collapsed
  - Accessible with aria-label for screen readers
  - Mobile-responsive with optimized heights
- **Version Display**
  - Version number now visible in footer (v1.1.0)
  - Styled with gradient text and bordered badge
  - Mobile-responsive sizing

### 🐛 Bug Fixes
- Fixed collapsible navbar toggle button visibility issue
  - Toggle button now remains visible when header is collapsed
  - Added proper min-height and padding to header
  - Moved overflow:hidden to header-content only

### 🎨 Design Improvements
- Enhanced header with overflow management
- Smooth opacity transitions for header content
- Hover effects on collapse toggle button
- Active state animations for better user feedback
- Footer version badge with gradient styling

---

## [1.0.0] - 2024-12-10

### 🎉 Initial Release

#### ✨ Features Added
- **Habit Tracking System**
  - 90-day duration challenge tracking
  - Numeric target-based habits (e.g., read 100 books)
  - Daily progress tracking with status (done, skip, not done)
  - Level progression system (Novice → Beginner → Intermediate → Advanced → Expert → Master)
  - Skip days reward system
  - Category-based organization
  - Priority levels (High, Medium, Low)
  - Motivation and trigger fields

- **Daily Tasks Management**
  - Task creation with deadlines
  - Extension system (max extensions configurable)
  - Overdue task tracking
  - Task completion tracking
  - Deletion with reason tracking
  - Filter views (Today, Upcoming, Completed, Deleted)

- **Reports & Analytics**
  - Weekly reports with 7-day performance calendar
  - Monthly reports with heatmap visualization
  - Habit completion rates and streaks
  - Task on-time completion metrics
  - Perfect days tracking
  - Visual stat cards with color coding

- **System Status Dashboard** (Admin)
  - Real-time server metrics (uptime, memory, CPU)
  - Database statistics (users, habits, tasks, completions)
  - API performance monitoring
  - Recent activity feed
  - Auto-refresh every 30 seconds

- **User Interface**
  - Edge-to-edge mobile design (iPhone 13 optimized)
  - Modern gradient color scheme
  - Responsive design (mobile-first)
  - Tab-based navigation (Habits, Tasks, Reports, System)
  - Filter views for habits and tasks
  - Create/Cancel buttons with smooth animations

- **Progressive Web App (PWA)**
  - Offline support with service worker
  - Installable on mobile devices
  - Auto-sync when back online
  - Update notifications
  - App icons (192x192, 512x512)
  - Manifest configuration

- **Forms & Input**
  - Add new category on-the-fly
  - Dropdown category selector with existing categories
  - Target type selector (Duration/Numeric)
  - Date picker for deadlines
  - Numeric input for daily targets
  - Text areas for notes and motivation

#### 🔧 Technical Features
- JWT-based authentication
- MySQL database with proper indexing
- RESTful API architecture
- Offline data caching
- Automatic "not done" job (runs daily at 11:59 PM)
- CORS configuration for cross-origin requests
- Input validation and error handling
- SQL injection prevention

#### 🎨 Design Features
- Rounded corners (12px border-radius)
- Card-based layouts with shadows
- Color-coded level indicators
- Hover effects and transitions
- Focus states for accessibility
- Loading spinners and states
- Toast notifications
- Error message styling

---

## Version Format

### Semantic Versioning: `MAJOR.MINOR.PATCH`

- **MAJOR**: Incompatible API changes or complete redesigns
- **MINOR**: New features added in a backwards compatible manner
- **PATCH**: Backwards compatible bug fixes

### Change Categories

- ✨ **Features Added**: New functionality
- 🐛 **Bug Fixes**: Fixed issues
- 🔧 **Technical**: Backend/infrastructure changes
- 🎨 **Design**: UI/UX improvements
- 📝 **Documentation**: Documentation updates
- ⚡ **Performance**: Speed/optimization improvements
- 🔒 **Security**: Security improvements
- ⚠️ **Deprecated**: Features marked for removal
- 🗑️ **Removed**: Deleted features

---

## Upcoming Features (Roadmap)

### [1.2.0] - Planned
- Habit statistics graphs
- Export data to CSV/JSON
- Dark mode support
- Custom themes

### [1.3.0] - Planned
- Habit sharing with friends
- Social features
- Reminders and notifications
- Calendar view integration

---

## Bug Tracking

Report bugs at: [GitHub Issues](https://github.com/Rockstany/personal-app/issues)
