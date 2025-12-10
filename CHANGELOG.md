# 📋 Changelog

All notable changes to the Habit & Daily Tracker project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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

### 🎨 Design Improvements
- Enhanced header with overflow management
- Smooth opacity transitions for header content
- Hover effects on collapse toggle button
- Active state animations for better user feedback

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
