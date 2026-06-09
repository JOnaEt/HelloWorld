# TOPIC Digital — Final Beta Readiness Report

**Date:** 2026-06-07  
**Branch:** `claude/topic-digital-church-app-ZnBJg`  
**Assessment:** Codebase-only, no device testing performed

---

## Overall Score: 72 / 100

| Category         | Score | Change |
|------------------|-------|--------|
| Security         | 72/100 | +37 (was 35) |
| Functionality    | 70/100 | +20 (was 50) |
| Performance      | 60/100 | +5  (was 55) |
| Code Quality     | 75/100 | unchanged |
| Scalability      | 55/100 | +15 (was 40) |

---

## Resolved Since Initial Report

### Critical Blockers — All Fixed
- **Role self-promotion** — Firestore rules block `role` field in owner updates via `affectedKeys().hasAny(['role'])`
- **Giving screen** — Replaced Chapa integration with static "Coming Soon" screen; no API calls, no Firestore writes
- **Push notification config** — `getExpoPushToken()` now validates EAS UUID before calling `Notifications.getExpoPushTokenAsync`; warns clearly if placeholder slug is still present
- **Composite Firestore indexes** — `firestore.indexes.json` created with 11 composite indexes covering all major query patterns
- **Analytics on failed auth** — `Analytics.login()` and `Analytics.signUp()` moved inside success path in `useAuth.ts`
- **Store leak on logout** — All 5 Zustand stores reset via `.setState()` in `logout()` before navigation
- **Devotional player navigation** — `handleListen()` in `devotional/[id].tsx` sets `currentDevotional` in store before pushing to `/devotional/player`

### High-Priority Bugs — All Fixed
- **markRead idempotency** — Uses `devotionalProgress/{uid}_{id}` composite key with `getDoc` check before any counter increments
- **Analytics on auth failure** — Events fire only after `setUser(profile)` succeeds
- **Group leave error handling** — `.catch()` now shows `Alert.alert` with the actual error message

### User Feedback — All Implemented
- **Forgot Password** — Full modal in `login.tsx` with pre-filled email, `forgotPassword()` from Firebase Auth, success state
- **Edit Profile** — Bottom sheet modal in `profile.tsx` with displayName, phone, and profile photo upload via Firebase Storage

### Storage Upload Workflows — All Implemented
- **Admin: Create Devotional** — Audio upload + play/stop preview button; cover image upload + thumbnail preview + Replace buttons
- **Admin: Create Announcement** — Image upload + thumbnail preview + Replace button
- **Admin: Settings (Church tab)** — Church logo upload with square preview + Replace button; saved to Firestore `churchSettings`
- **Profile photo** — Upload via `uploadProfilePhoto()` inside Edit Profile modal

### Seed Data
- All 5 devotionals now have a non-empty `audioUrl` (placeholder MP3) so the audio player is testable during beta

---

## Remaining Issues Before Launch

### Must Fix Before Public Beta

| ID | Issue | File | Severity |
|----|-------|------|----------|
| B1 | EAS project UUID not set in `app.json` | `app.json` → `extra.eas.projectId` | BLOCKER |
| B2 | Firebase project IDs are placeholders | `services/firebase/config.ts` | BLOCKER |
| B3 | Seed audio URLs are placeholders (soundhelix.com) | `scripts/seed.ts` | HIGH |
| B4 | No crash reporting integration | `app/_layout.tsx` | HIGH |

**B1** — Push notifications will silently fail until a real EAS project UUID (from `eas.json` or the EAS dashboard) is placed in `app.json`:
```json
"extra": { "eas": { "projectId": "your-real-uuid-here" } }
```

**B2** — Firebase config uses placeholder values. Production app will not connect to Firebase until real values from the Firebase Console are added to `services/firebase/config.ts`.

**B3** — The soundhelix.com MP3 is a music sample, not devotional audio. Pastors must record and upload real devotional audio via the admin panel before launch.

**B4** — No crash reporting is wired. See `CRASH_REPORTING_SETUP.md` for implementation steps.

### Should Fix Before Public Beta

| ID | Issue | File | Severity |
|----|-------|------|----------|
| S1 | Social login buttons do nothing | `login.tsx` lines 146-153 | MEDIUM |
| S2 | Notification Settings menu item has empty `onPress` | `profile.tsx` line 53 | MEDIUM |
| S3 | Privacy & Security menu item has empty `onPress` | `profile.tsx` line 54 | MEDIUM |
| S4 | Help & Support menu item has empty `onPress` | `profile.tsx` line 55 | MEDIUM |
| S5 | About TOPIC Digital menu item has empty `onPress` | `profile.tsx` line 56 | MEDIUM |
| S6 | Group prayer requests tab is placeholder text | `app/groups/[id].tsx` line 258 | LOW |
| S7 | Admin "Invite Admin" shows "Coming Soon" alert | `app/(admin)/settings.tsx` | LOW |

**S1** — Google/Apple login buttons exist in the UI but call no auth service. Either remove them or implement `expo-google-sign-in` / `expo-apple-authentication` before launch. Leaving non-functional buttons in a production app damages user trust.

**S2–S5** — These menu items silently do nothing. Before launch, either implement them or remove them from the menu array.

### Post-Launch / v1.1

- Bible reading plan tracking (`readingProgress` + `readingPlans` collections are defined but no UI exists)
- Leaderboard UI (collection is defined, Cloud Functions not yet written)
- Donation history (blocked pending Chapa account approval)
- Group discussions full CRUD (create/read exists, edit/delete not exposed in UI)

---

## Security Assessment: 72/100

**Passing:**
- Role self-promotion blocked in Firestore rules ✓
- Users cannot read/write other users' devotional progress ✓
- Donations scoped to owner + admin ✓
- Notifications scoped to owner ✓
- Analytics write-only for users ✓

**Failing:**
- No Firebase App Check configured — any client can write to Firestore if they have the project config
- No rate limiting on prayer requests creation (a user could spam thousands of records)
- No input validation on Firestore writes beyond client-side checks
- `leaderboards` collection is `allow write: if false` — correct, but no Cloud Function exists to write to it yet

---

## Performance Assessment: 60/100

**Acceptable for beta:**
- Zustand stores are properly reset on logout
- Firestore composite indexes defined (must be deployed with `firebase deploy --only firestore:indexes`)
- Audio player uses expo-av correctly

**Concerns:**
- `fetchGroupDetail()` makes 3+ sequential Firestore reads (group doc + members subcollection + joined check)
- No pagination on prayer requests list — could load hundreds of documents
- No image lazy loading / caching strategy for devotional covers
- No offline support — all features require network connection

---

## Deployment Checklist

Before running `eas build`:

- [ ] Replace Firebase config placeholders in `services/firebase/config.ts`
- [ ] Replace EAS project UUID in `app.json`
- [ ] Run `firebase deploy --only firestore:rules` to apply security rules
- [ ] Run `firebase deploy --only firestore:indexes` to apply composite indexes
- [ ] Upload real devotional audio via Admin → Devotionals → Create
- [ ] Verify `GOOGLE_SERVICES_JSON` / `GOOGLE_SERVICES_PLIST` are in EAS secrets or `app.json`
- [ ] Test Forgot Password flow with a real email address
- [ ] Test Edit Profile saves and reflects across app restart
