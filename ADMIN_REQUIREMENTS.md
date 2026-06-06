# TOPIC Digital — Admin Portal Requirements

## Overview
The Admin Portal is a restricted section of the TOPIC Digital app accessible only to users with role: admin, pastor, or leader. It enables church staff to manage all content, users, and operations without needing Firebase Console access.

## User Roles
| Role | Access Level |
|------|-------------|
| member | Member-facing app only |
| leader | Member app + Group management |
| pastor | Member app + Full admin portal |
| admin | Full access to all admin features |

## Functional Requirements

### FR-01: Authentication & Authorization
- All admin routes must check user.role before rendering
- Unauthorized users must see an access-denied screen
- Session must be maintained across admin navigation

### FR-02: Dashboard
- Display real-time key metrics (total users, active today, new this week)
- Show giving summary for current month
- Display engagement sparklines (7-day devotional plays, prayer requests)
- Quick action buttons for common tasks
- Recent activity feed (last 10 items)
- Navigation tiles for all admin modules

### FR-03: User Management
- List all registered users with search and role filtering
- Display user card: avatar, name, email, role badge, last active, XP score
- Change user role via bottom sheet modal
- Disable user account (soft disable)
- Delete user account (with confirmation alert)
- Stats bar: total, active (30d), new (7d)

### FR-04: Devotional Management
- List all devotionals with status filtering (all, featured, daily)
- Display stats: total plays, reads, shares per devotional
- Create new devotional via full form
- Edit existing devotional
- Feature/unfeature toggle
- Delete with confirmation
- FAB button for quick create access

### FR-05: Devotional Creation
- Required fields: title, category, content
- Scripture: book, chapter, verses, text, translation
- Content: written devotion, prayer, reflection prompts (add/remove)
- Media: audio URL, thumbnail URL
- Publishing: author info, featured toggle, daily toggle, scheduled date
- Actions: Publish or Save as Draft

### FR-06: Announcement Management
- List all announcements with type and priority badges
- Pin/unpin announcements
- Send push notification for announcement
- Delete with confirmation
- FAB for quick create

### FR-07: Announcement Creation
- Required: title, content
- Type picker: event, service, news, alert, giving
- Priority picker: low, medium, high, urgent
- Optional: image URL, action button (label + URL)
- Publishing: pin toggle, schedule date, expiry date
- Actions: Publish, Publish + Send Push

### FR-08: Group Management
- List all groups with member count and meeting schedule
- Show active/inactive status
- Edit group details
- Disable group (soft delete)
- View attendance placeholder

### FR-09: Group Creation
- Required: group name
- Category picker (10 categories)
- Description, cover image URL
- Max members, private toggle
- Meeting schedule: day, time
- Location, online toggle, meeting URL
- Leader assignment

### FR-10: Prayer Moderation
- List all prayer requests with full text visible
- Filter by status: all, active, answered, archived, anonymous
- Actions: approve, feature, mark answered, remove
- Mark answered modal with optional testimony note
- Stats: total, answered, this week

### FR-11: Giving Reports
- Date range selector: this week, this month, this year
- Summary cards: total, by category (tithe, offering, building fund, missions, benevolence)
- Category breakdown horizontal bar chart
- Recent transactions list with status badges
- Export CSV button

### FR-12: Analytics
- Date range selector
- Engagement overview: DAU/WAU/MAU, retention
- Devotional analytics: plays, completion rate, top categories
- Bible reading: total readings, streaks, plan completion
- Community: prayer requests, answers, group attendance
- Growth: new members chart, onboarding completion, feature adoption

### FR-13: Church Settings
- Church profile: name, tagline, location, website, contact info, logo
- Notifications: devotional time, push enabled, admin email
- Giving: currency, Stripe toggle, tax receipt email
- Content: default language, Bible translation, moderation mode
- App: maintenance mode (with danger confirmation), force update version

## Non-Functional Requirements
- All lists must show loading state while fetching
- All destructive actions must show confirmation alert
- All Firebase operations must be wrapped in try/catch
- Optimistic updates for role changes, pin/unpin, feature/unfeature
- Navigation must work correctly with hardware back button on Android
