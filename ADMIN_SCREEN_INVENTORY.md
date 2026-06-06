# TOPIC Digital — Admin Screen Inventory

## Screen Count: 12 screens across 10 routes

| Route | File | Description | Status |
|-------|------|-------------|--------|
| /(admin) | _layout.tsx | Stack navigator + role guard | Built |
| /(admin)/index | index.tsx | Analytics dashboard | Built |
| /(admin)/users | users.tsx | Member directory + role management | Built |
| /(admin)/devotionals | devotionals.tsx | Content management list | Built |
| /(admin)/devotionals/create | devotionals/create.tsx | Full devotional form | Built |
| /(admin)/announcements | announcements.tsx | Announcements list + pin | Built |
| /(admin)/announcements/create | announcements/create.tsx | Announcement form | Built |
| /(admin)/groups | groups.tsx | Community groups list | Built |
| /(admin)/groups/create | groups/create.tsx | Group creation form | Built |
| /(admin)/prayer | prayer.tsx | Prayer wall moderation | Built |
| /(admin)/giving | giving.tsx | Giving reports | Built |
| /(admin)/analytics | analytics.tsx | Detailed analytics | Built |
| /(admin)/settings | settings.tsx | Church configuration | Built |

## Component Inventory

### Admin-Specific Components (components/admin/)
| Component | Props | Description |
|-----------|-------|-------------|
| StatCard | title, value, subtitle, icon, color, trend? | Metric display card |
| AdminHeader | title, subtitle?, rightAction? | Dark admin header bar |
| DataTable | columns, rows, onRowPress? | Scrollable data table |

### Common Components Added (components/common/)
| Component | Props | Description |
|-----------|-------|-------------|
| ErrorBoundary | children, fallback? | React error boundary |
| ErrorState | title, message, onRetry?, icon? | Inline error display |
| NetworkError | onRetry, visible? | Full-screen offline overlay |

## Feature Coverage per Screen

### Dashboard (index.tsx)
- [x] Dark header with admin branding
- [x] Key metrics grid (4 stat cards)
- [x] Giving overview with SVG bar chart
- [x] 7-day engagement sparklines
- [x] Quick action buttons
- [x] Recent activity feed
- [x] Navigation grid to all modules
- [x] Pull-to-refresh
- [x] Logout button

### User Management (users.tsx)
- [x] Search by name/email
- [x] Filter tabs (all, member, leader, pastor, admin)
- [x] Stats bar (total, active 30d, new 7d)
- [x] User cards with role badges
- [x] Kebab menu (change role, disable, delete)
- [x] Role change bottom sheet
- [x] Confirmation alerts for destructive actions
- [x] Optimistic updates

### Devotional Management (devotionals.tsx)
- [x] Status filter tabs
- [x] Stats bar (total, featured, daily, avg plays)
- [x] Devotional cards with engagement stats
- [x] Feature/unfeature toggle
- [x] Delete with confirmation
- [x] FAB for create
- [x] Navigate to create screen

### Create Devotional (devotionals/create.tsx)
- [x] Title, category picker
- [x] Scripture (book, chapter, verses, text, translation)
- [x] Content (devotion, prayer, reflection prompts)
- [x] Reflection prompts add/remove list
- [x] Media (audio URL, thumbnail URL)
- [x] Publishing (author, featured, daily, daily date)
- [x] Publish + Save as Draft buttons
- [x] Firebase createDevotional call

### Announcement Management (announcements.tsx)
- [x] Announcement cards with type/priority badges
- [x] Pin/unpin action
- [x] Send push notification action
- [x] Delete with confirmation
- [x] FAB for create

### Create Announcement (announcements/create.tsx)
- [x] Title, content
- [x] Type picker (5 types)
- [x] Priority picker (4 levels)
- [x] Image URL, action button fields
- [x] Pin toggle, schedule date, expiry date
- [x] Publish + Publish + Push buttons

### Group Management (groups.tsx)
- [x] Group cards with member count, schedule
- [x] Active/inactive status
- [x] Stats cards (total, active, members)
- [x] Disable with confirmation
- [x] FAB for create

### Create Group (groups/create.tsx)
- [x] Name, description, category picker
- [x] Cover image, max members, private toggle
- [x] Meeting day picker, time, location
- [x] Online toggle + meeting URL
- [x] Leader search field

### Prayer Moderation (prayer.tsx)
- [x] Filter tabs (all, active, answered, archived, anonymous)
- [x] Stats bar (total, answered, this week)
- [x] Full prayer text displayed
- [x] Category + status badges
- [x] Anonymous indicator
- [x] Prayer count
- [x] Approve, feature, mark answered, remove actions
- [x] Mark answered modal with testimony note

### Giving Reports (giving.tsx)
- [x] Date range selector (week, month, year)
- [x] Summary cards horizontal scroll
- [x] Category breakdown bars
- [x] Export CSV button
- [x] Transactions FlatList with status badges

### Analytics (analytics.tsx)
- [x] Date range selector
- [x] Engagement overview (4 stat cards)
- [x] DAU sparkline chart
- [x] Devotional analytics section
- [x] Bible reading section
- [x] Community section
- [x] Growth chart + metrics

### Settings (settings.tsx)
- [x] Tabbed navigation (church, notifications, giving, content, admins)
- [x] Church profile fields
- [x] Notification toggles
- [x] Giving configuration
- [x] Content moderation options
- [x] Maintenance mode with danger confirmation
- [x] Per-section save buttons
