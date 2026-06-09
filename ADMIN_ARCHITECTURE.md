# TOPIC Digital — Admin Portal Architecture

## Directory Structure
```
app/
  (admin)/
    _layout.tsx          — Stack navigator + role guard
    index.tsx            — Dashboard
    users.tsx            — User management
    devotionals.tsx      — Devotional management
    devotionals/
      create.tsx         — Create/edit devotional
    announcements.tsx    — Announcement management
    announcements/
      create.tsx         — Create announcement
    groups.tsx           — Group management
    groups/
      create.tsx         — Create group
    prayer.tsx           — Prayer moderation
    giving.tsx           — Giving reports
    analytics.tsx        — Analytics dashboard
    settings.tsx         — Church settings

services/firebase/
  admin.ts               — All admin Firebase operations

store/
  adminStore.ts          — Admin Zustand store

components/admin/
  StatCard.tsx           — Metric card component
  AdminHeader.tsx        — Dark admin header
  DataTable.tsx          — Scrollable data table

components/common/
  ErrorBoundary.tsx      — Class component crash boundary
  ErrorState.tsx         — Inline error state
  NetworkError.tsx       — Full-screen network error overlay
```

## Data Flow
```
Screen → Firebase Admin Service → Firestore
   ↓
Admin Store (Zustand) ← Optimistic Updates
   ↓
UI re-renders
```

## Auth Guard Pattern
The `app/(admin)/_layout.tsx` checks `useAuthStore` on every render:
1. If user is null → render access denied UI
2. If user.role is not in ADMIN_ROLES → render access denied UI
3. Otherwise → render Stack navigator

ADMIN_ROLES = ['admin', 'pastor', 'leader']

## Firebase Service Layer (admin.ts)
All Firebase operations are in `services/firebase/admin.ts`:
- User CRUD: getAllUsers, updateUserRole, disableUser, deleteUser
- Devotional CRUD: createDevotional, updateDevotional, deleteDevotional, featureDevotional
- Announcement CRUD: createAnnouncement, updateAnnouncement, deleteAnnouncement, pinAnnouncement
- Group CRUD: createGroup, updateGroup, deleteGroup, assignGroupLeader
- Prayer: moderatePrayer, markPrayerAnsweredAdmin, getAllPrayersAdmin
- Analytics: getDashboardStats, getGivingReport
- Settings: getChurchSettings, updateChurchSettings
- Activity: getRecentActivity

## State Management (adminStore.ts)
Zustand store with:
- Data arrays: users, devotionals, announcements, groups, prayers, donations
- Loading state: isLoading, error
- Optimistic update methods for each entity type
- No persistence (admin data is always fresh from Firestore)

## Security Architecture
1. **Client-side guard**: _layout.tsx blocks non-admin users from rendering admin screens
2. **Server-side enforcement**: Firestore rules validate role on every read/write
3. **Defense in depth**: Both layers required for complete security

## Navigation
Admin portal uses a nested Stack navigator within the root Stack.
Root layout registers `(admin)` as a screen with `animation: 'slide_from_right'`.
Admin layout manages its own stack for nested routes (devotionals/create, announcements/create, groups/create).
All admin screens have back navigation to previous screen.
Dashboard is the default admin screen (`index.tsx`).

## Charts & Data Visualization
All charts use react-native-svg (already installed).
Custom SVG components are co-located in the screen files:
- `Sparkline` — line chart with dots for 7-day trends
- `BarChart` — vertical bar chart for giving overview
- `LineChart` — smooth line chart for growth analytics
- `CategoryBar` — horizontal progress bar for giving breakdown
These are intentionally kept simple to avoid external charting library dependencies.
