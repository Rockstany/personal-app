# Habit & Daily Tracker PWA - Technical Documentation

## Project Structure
```
Personal App/
├── frontend/                 # React + Vite PWA
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Page components
│   │   ├── services/        # API calls, offline sync
│   │   ├── utils/           # Helper functions, level calculator
│   │   ├── store/           # State management (Context/Redux)
│   │   └── App.jsx
│   ├── public/
│   │   └── manifest.json    # PWA manifest
│   └── package.json
├── backend/                 # Node.js + Express
│   ├── src/
│   │   ├── routes/          # API routes
│   │   ├── controllers/     # Business logic
│   │   ├── models/          # Database models
│   │   ├── middleware/      # Auth, validation
│   │   ├── jobs/            # Cron jobs (auto Not Done)
│   │   └── config/          # DB connection
│   └── package.json
└── PROJECT_DOCS.md          # This file
```

## Database Schema

### 1. users
- id (PK)
- email
- password_hash
- created_at
- updated_at

### 2. habits
- id (PK)
- user_id (FK)
- name
- motivation
- target_type (ENUM: 'duration_90', 'numeric')
- target_value (NULL for duration_90, number for numeric)
- target_unit (e.g., 'pages', 'minutes')
- daily_target (5, 10, 15, etc.)
- trigger (text)
- category (text, required)
- priority (text, optional)
- current_level (0-9, default 0)
- current_progress (for numeric habits)
- start_date
- graduated_date (NULL or date)
- deleted_at (soft delete)
- deletion_reason
- created_at
- updated_at

### 3. habit_completions
- id (PK)
- habit_id (FK)
- date (DATE)
- status (ENUM: 'done', 'not_done', 'skip')
- value (for numeric habits - how much completed)
- marked_offline (BOOLEAN)
- synced_at
- created_at

### 4. habit_skip_days
- id (PK)
- habit_id (FK)
- level_earned_at (which level earned this skip)
- earned_date
- used_date (NULL if unused)
- expiry_date (earned_date + X days)
- status (ENUM: 'available', 'used', 'expired')

### 5. daily_tasks
- id (PK)
- user_id (FK)
- name
- notes
- deadline (DATE)
- max_extensions (default 2)
- extension_count (default 0)
- reassignment_reason (text, for extensions)
- completed_at
- deleted_at
- deletion_reason
- created_at
- updated_at

### 6. settings
- id (PK)
- user_id (FK)
- skip_expiry_days (default 5-6)
- auto_not_done_time (default '23:59:00')
- created_at
- updated_at

## Key Business Logic

### Level Calculation

#### Duration-Based (90-Day) Habits
```javascript
// Level = consecutive completed days / 10 (max 9)
// Day 1-10 = Level 0, Day 11-20 = Level 1, ..., Day 90+ = Level 9
function calculateDurationLevel(consecutiveDays) {
  return Math.min(Math.floor(consecutiveDays / 10), 9);
}
```

#### Numeric Target Habits
```javascript
// Level = (current_progress / target_value) * 10, floor to 0-9
function calculateNumericLevel(currentProgress, targetValue) {
  const percentage = (currentProgress / targetValue) * 100;
  return Math.min(Math.floor(percentage / 10), 9);
}
```

### Skip Days Logic
- Skip days earned: 1 per level (Level 1 = 1 skip, Level 9 = 9 skips)
- When level increases, new skip days are added to habit_skip_days table
- Manual use only via UI
- Expiry: earned_date + skip_expiry_days setting
- Daily cron checks expiry and marks as 'expired'

### Auto "Not Done" at 11:59 PM
**Cron Job runs every day at 11:59 PM (server local time)**

```javascript
// Pseudocode for daily cron job
async function autoMarkNotDone() {
  const today = getToday(); // YYYY-MM-DD format

  // Find all habits that have NO completion record for today
  const habitsWithoutCompletion = await db.query(`
    SELECT h.id FROM habits h
    WHERE h.deleted_at IS NULL
    AND NOT EXISTS (
      SELECT 1 FROM habit_completions hc
      WHERE hc.habit_id = h.id AND hc.date = ?
    )
  `, [today]);

  // Insert 'not_done' for each
  for (habit of habitsWithoutCompletion) {
    await db.insert('habit_completions', {
      habit_id: habit.id,
      date: today,
      status: 'not_done',
      marked_offline: false
    });
  }

  // Update levels based on completions
  await recalculateAllLevels();
}
```

### Offline Sync Strategy
1. User marks habit "Done" or "Skip" while offline
2. Store in IndexedDB with `marked_offline: true, synced_at: null`
3. When online, sync to backend:
   - POST /api/habits/:id/completions/sync with offline data
   - Backend validates date, creates record, returns updated level
   - Frontend updates local state
4. If no action taken offline and user comes online:
   - Backend already ran auto "Not Done" at 11:59 PM
   - Frontend fetches latest data and shows "Not Done" status

### Habit Editing Rules
- Name, motivation, trigger, category, priority: editable anytime
- Target type change: NOT allowed (would break logic)
- Numeric target value change:
  ```javascript
  // When target changes from oldTarget to newTarget
  habit.current_progress = 0; // Reset progress for new level
  // habit.current_level stays same (e.g., remains at 4)
  // Next completion starts counting toward Level 4's new target range
  ```

### Habit Deletion
```javascript
async function deleteHabit(habitId, reason) {
  // Soft delete
  await db.update('habits', habitId, {
    deleted_at: new Date(),
    deletion_reason: reason
  });

  // Remove all skip days
  await db.delete('habit_skip_days', { habit_id: habitId });

  // Keep habit_completions for history
  // Keep habit record with name + reason only
}
```

### Daily Task Extensions
- Max 2 consecutive reassignments
- After 2 extensions, reason required for further changes
- Overdue tasks (deadline < today) appear at top, marked red

## API Endpoints

### Habits
- POST /api/habits - Create habit
- GET /api/habits - List all habits (grouped by level)
- GET /api/habits/:id - Get habit details
- PATCH /api/habits/:id - Update habit
- DELETE /api/habits/:id - Delete habit (soft delete)
- POST /api/habits/:id/complete - Mark done/not_done/skip for today
- POST /api/habits/:id/completions/sync - Sync offline completions
- GET /api/habits/:id/calendar/:month - Get monthly calendar data
- GET /api/habits/:id/skip-days - Get available skip days

### Daily Tasks
- POST /api/tasks - Create task
- GET /api/tasks?filter=today|completed|deleted - List tasks
- GET /api/tasks/:id - Get task details
- PATCH /api/tasks/:id - Update task (handles extensions)
- DELETE /api/tasks/:id - Delete task (soft delete)
- POST /api/tasks/:id/complete - Mark complete

### Settings
- GET /api/settings - Get user settings
- PATCH /api/settings - Update settings

## Time & Date Handling (Phase 1)

### Current Approach (Simple)
- **All times in server local timezone**
- Cron runs at 11:59 PM server time
- Frontend sends date as YYYY-MM-DD string
- Backend stores dates as DATE type in MySQL
- No timezone conversion in Phase 1

### Implementation
```javascript
// Backend - Get today's date in server timezone
function getToday() {
  return new Date().toISOString().split('T')[0]; // YYYY-MM-DD
}

// Frontend - Get today's date in user's device timezone
function getToday() {
  const now = new Date();
  return now.toISOString().split('T')[0]; // YYYY-MM-DD
}

// Note: This may cause mismatches if user is in different timezone
// Phase 3 will handle timezone properly with user's timezone setting
```

### Known Limitation
If user is in a different timezone than server:
- User may see "Not Done" before their local 11:59 PM
- Or may have extra time after their local 11:59 PM
- **Solution deferred to Phase 3** with timezone settings

## PWA Configuration

### manifest.json
```json
{
  "name": "Habit & Daily Tracker",
  "short_name": "HabitTracker",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#4CAF50",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

### Service Worker (Vite PWA Plugin)
- Cache API responses for offline access
- Sync queue for offline habit completions
- Background sync when connection restored

## Deployment

### Frontend (Vercel)
1. Connect GitHub repo
2. Set build command: `cd frontend && npm run build`
3. Set output directory: `frontend/dist`
4. Environment variables: `VITE_API_URL=https://yourdomain.com/api`

### Backend (Hostinger)
1. Upload backend files via FTP or Git
2. Install dependencies: `npm install`
3. Set environment variables in .env:
   ```
   DB_HOST=localhost
   DB_USER=your_user
   DB_PASSWORD=your_password
   DB_NAME=habit_tracker
   PORT=3000
   ```
4. Run with PM2: `pm2 start src/index.js --name habit-api`
5. Set up cron job for auto "Not Done" (11:59 PM daily)

## Development Workflow

1. Start MySQL database
2. Run migrations (create tables)
3. Start backend: `cd backend && npm run dev`
4. Start frontend: `cd frontend && npm run dev`
5. Access at http://localhost:5173

## Phase 2 & 3 Placeholders
- Money Tracker (Phase 2): Separate tables, routes
- Achievements (Phase 3): New table for unlocks
- Timezone handling (Phase 3): Add timezone field to users, convert all dates
- User-editable reminder time (Phase 3): Replace fixed 11:59 PM with setting

## Security Notes
- All routes require authentication (JWT)
- Input validation on all endpoints
- SQL injection prevention (parameterized queries)
- XSS prevention (sanitize inputs)
- CORS configured for Vercel domain only
