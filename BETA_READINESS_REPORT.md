# TOPIC Digital — Beta Readiness Report

**Date:** June 7, 2026  
**Branch:** `claude/topic-digital-church-app-ZnBJg`  
**Scope:** Full codebase audit — every screen, service, rule, and function reviewed

---

## Overall Readiness Score: 38 / 100

> **Not ready for public beta.** The app has exceptional UI polish and solid
> architectural bones, but contains critical financial security holes, several
> screens that are permanently hardcoded stubs, push notifications that are
> completely non-functional, and multiple data-integrity bugs that will corrupt
> user records silently. None of these are theoretical — they will trigger for
> the first real user on a real device.

---

## Critical Launch Blockers

These issues will cause direct financial loss, data theft, or complete feature
failure the moment real users interact with the app.

---

### BLOCKER 1 — Chapa Webhook Has No Signature Verification

**File:** `functions/src/index.ts` — `chapaWebhook` handler  
**Risk:** Financial fraud / payment spoofing

The webhook endpoint accepts any POST request and immediately queries Chapa's
verify API using the `tx_ref` from the request body. There is no check of the
`x-chapa-signature` HMAC header that Chapa sends with every genuine callback.

**Attack:** An attacker who knows any valid `tx_ref` (which follows the
predictable pattern `TOPIC-{donationId}-{timestamp}`) can POST directly to the
public Cloud Function URL. Chapa's verify endpoint confirms the transaction
was initiated (which is true), the webhook marks the donation `completed`, and
the user's `stats.totalDonations` is credited — without any actual charge.

**Fix required:** Compute `HMAC-SHA256(request.body, CHAPA_WEBHOOK_SECRET)` and
compare to the `x-chapa-signature` header. Reject if they don't match.

---

### BLOCKER 2 — Any User Can Self-Promote to Admin via Firestore

**File:** `firestore.rules`, line 48  
**Risk:** Unauthorized admin access

The user update rule is:
```
allow update: if isAuthenticated() && (isOwner(userId) || isAdmin());
```

`isOwner(userId)` is true for any user editing their own document. The rule
does not restrict **which fields** the owner can update. A regular member can
call `updateDoc(doc(db, 'users', uid), { role: 'admin' })` from a browser
console, and the rule permits it. On the next profile sync, `useAuthStore`
reflects the new role and the `(admin)` layout passes them through.

The admin dashboard itself does read `role` from Firestore (not a client-side
claim), but the rule allows the field to be written by the owner.

**Fix required:**
```
allow update: if isAuthenticated() && (
  (isOwner(userId) &&
   !request.resource.data.diff(resource.data).affectedKeys().hasAny(['role'])) ||
  isAdmin()
);
```

---

### BLOCKER 3 — Push Notifications Are Dead in Production

**File:** `services/notifications.ts`, line 85  
**Risk:** Complete feature failure for all users

```typescript
const token = await Notifications.getExpoPushTokenAsync({
  projectId: 'topic-digital-church-app',   // ← WRONG: this is the slug, not the EAS UUID
});
```

`getExpoPushTokenAsync` requires the UUID assigned by Expo EAS (format:
`xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`). Passing the human-readable slug throws
`Error: No experience found for the identifier`. The `catch` block swallows the
error silently and returns `null`. No push tokens are ever stored in Firestore.
Every Cloud Function that tries to deliver a push notification sends to an empty
token list. The entire push notification system is a no-op on any real device.

**Fix required:** Replace with the actual EAS `projectId` UUID from
`app.json` extra settings or the Expo dashboard.

---

### BLOCKER 4 — Admin Analytics Screen Is 100% Hardcoded Mock Data

**File:** `app/(admin)/analytics.tsx`, line 74–77  
**Risk:** Misleading operational data

```typescript
// Mock chart values — in production, load from Firebase Analytics
const dauData = [120, 145, 132, 178, 165, 190, 210];
const newMembersData = [8, 12, 6, 15, 11, 9, 14];
const devotionalData = [45, 67, 52, 78, 65, 58, 82];
```

The date range selector (7 days / Month / Year) changes state but has **no
effect** — all charts always display the same seven hardcoded numbers. The
comment acknowledges this is unfinished. A pastor reviewing this screen is
looking at fiction.

**Fix required:** Query real aggregated data from Firestore or Firebase
Analytics export. This requires either custom aggregation Cloud Functions or
BigQuery export.

---

### BLOCKER 5 — Profile Giving Totals Are Hardcoded at $0.00

**File:** `app/(tabs)/profile.tsx`, lines 145 and 149  
**Risk:** Feature completely non-functional

```tsx
<Text style={styles.givingValue}>$0.00</Text>  {/* This Month */}
<Text style={styles.givingValue}>$0.00</Text>  {/* This Year */}
```

There is no call to `getGivingSummary` or any Firestore query. Every user
always sees $0.00 regardless of their donation history. The currency symbol
is also wrong (USD instead of ETB).

**Fix required:** Call `getGivingSummary(user.uid)` on mount and display real
values.

---

### BLOCKER 6 — Chapa Cloud Functions Are Not Deployed

**File:** `functions/src/index.ts`  
**Risk:** Entire giving flow broken for all users

The giving screen calls `initializeChapaPayment()` which hits a Cloud Function.
The `functions/` directory exists and the code is correct, but:

1. The functions have never been deployed (`firebase deploy --only functions`
   has not been run)
2. `CHAPA_SECRET_KEY` and `CHAPA_BASE_URL` environment variables are not
   configured in Firebase
3. No `firebase.json` exists defining function configuration

Until these functions are deployed and configured, every tap of the "Give"
button shows: *"Setup Required: Payment processing requires Cloud Functions to
be deployed."*

---

### BLOCKER 7 — No Firestore Composite Index Definitions

**Risk:** Multiple screens crash in production under real data

No `firestore.indexes.json` file exists. The following queries require
composite indexes that do not exist and **cannot be auto-created at query time**:

| Query | Collection | Fields |
|---|---|---|
| `getAllUsers` with role filter | `users` | `(role ASC, joinedAt DESC)` |
| `getGivingReport` | `donations` | `(status ASC, createdAt ASC)` |
| `getDonationsByType` | `donations` | `(userId ASC, type ASC, createdAt DESC)` |
| `getAllPrayersAdmin` flagged | `prayers` | `(status ASC, createdAt DESC)` |

When these queries execute without the indexes, Firestore rejects them with:
*"The query requires an index."* The affected screens show empty or error state.

**Fix required:** Create `firestore.indexes.json` and run `firebase deploy --only firestore:indexes`.

---

## High-Priority Issues

These bugs will corrupt data or break core features for a meaningful percentage
of users.

---

### HIGH 1 — Donation History Renders Wrong Category (type vs category Field Mismatch)

**File:** `app/giving/index.tsx`, line 393  
**File:** `app/giving/index.tsx`, line 113 (write side)

The Chapa giving flow writes a Firestore donation with field name `type`:
```typescript
type: selectedCategory,   // written as 'type'
```

The history render reads:
```typescript
const cat = GIVING_CATEGORIES.find((c) => c.id === donation.category);
// donation.category is always undefined — field is 'type', not 'category'
```

Every donation in history shows the fallback icon and label. The category
column always displays `undefined`.

---

### HIGH 2 — Double Payment Submission Is Trivially Reproducible

**File:** `app/giving/index.tsx`, line 136

```typescript
const { checkoutUrl } = await initializeChapaPayment(...);
setIsSubmitting(false);   // ← submit button re-enables HERE
const result = await openChapaCheckout(checkoutUrl);   // user is still in browser
```

`isSubmitting` is reset to `false` before the Chapa browser session closes.
The Give button re-enables while the user is still in the payment flow. Tapping
it creates a second pending Donation document and opens a second checkout
session, leading to a duplicate charge.

---

### HIGH 3 — All Zustand Stores Retain Previous User's Data After Logout

**File:** `hooks/useAuth.ts`, line 66

`logout()` calls `setUser(null)` and navigates to welcome, but never touches:
- `groupStore` — `joinedGroupIds`, `groups` list
- `prayerStore` — `myPrayers`, `prayers` list
- `devotionalStore` — `recentlyListened`, `currentDevotional`
- `adminStore` — `users`, `stats`, `recentActivity`

On a shared device, User B logs in and immediately sees User A's joined groups
marked as "joined", User A's prayer history, and User A's admin data (if User
A was an admin).

---

### HIGH 4 — "Listen" Button on Devotional Detail May Play Wrong Audio

**File:** `app/devotional/[id].tsx` — `handleListen` function

```typescript
const handleListen = () => router.push('/devotional/player');
```

The player reads `currentDevotional` from `useDevotionalStore()`. This is
only set when a devotional is loaded via the store's `fetchDevotional` action.
If the user arrives at the detail screen via a direct deep link or notification
tap (which pushes the route with just the ID), the store's `currentDevotional`
may be stale or null, causing the player to show the wrong content or an empty
state.

---

### HIGH 5 — Giving Summary Reports Currency as 'USD' (All Payments Are ETB)

**File:** `services/firebase/giving.ts`, line 165

```typescript
return { ..., currency: 'USD' };
```

All Chapa transactions are initiated in ETB. The `GivingSummary` object carries
`currency: 'USD'`. Any consumer that formats amounts using this field will display
incorrect currency symbols to Ethiopian users.

---

### HIGH 6 — Multiple Core UI Actions Are No-Ops

The following items appear as functional UI but their `onPress` handlers are
empty `() => {}`:

| Screen | Feature |
|---|---|
| `login.tsx` | "Forgot Password?" button |
| `profile.tsx` | "Edit Profile" menu item |
| `profile.tsx` | "Notification Settings" menu item |
| `profile.tsx` | "Privacy & Security" menu item |
| `login.tsx` | Google sign-in button |
| `login.tsx` | Apple sign-in button |

A beta user tapping any of these gets silent failure with no feedback.

---

### HIGH 7 — Analytics Events Fire on Failed Authentication

**File:** `app/(auth)/login.tsx`, line 51  
**File:** `app/(auth)/register.tsx`, line 62

`useAuth.login()` and `useAuth.register()` swallow errors internally (they
`catch`, call `setError`, and return normally without re-throwing). The screens
call `Analytics.login()` / `Analytics.signUp()` unconditionally after the
`await`. Every failed login attempt is counted as a successful auth event in
Firebase Analytics, making DAU and conversion metrics permanently unreliable.

---

## Medium-Priority Issues

---

### MEDIUM 1 — `readCount` and User Stats Double-Count Revisits

**File:** `hooks/useDevotional.ts`, line 92

`markRead()` is called every time `fetchDevotional` runs, with no check for
whether the user has already read that devotional. A user who opens the same
devotional detail screen three times has their `stats.totalDevotionalsRead`
incremented three times and the devotional's `readCount` incremented three
times. This corrupts the leaderboard and engagement analytics.

---

### MEDIUM 2 — `leave()` Is Fire-and-Forget in Group Detail

**File:** `app/groups/[id].tsx`, ~line 69

Inside the `Alert.alert` confirmation callback, `leave(group.id)` is called
without `await`. Firestore errors become unhandled promise rejections with no
visible feedback to the user. The UI may show stale membership state.

---

### MEDIUM 3 — Users with No `lastActiveAt` Silently Excluded from Active Count

**File:** `app/(admin)/users.tsx`, ~line 275

`new Date(undefined)` produces `NaN`. The 30-day active user count silently
drops any user whose `lastActiveAt` field was never set (e.g., newly registered
users who have not yet triggered a session update).

---

### MEDIUM 4 — Seed Data Has Empty `audioUrl` and Empty Scripture Text

**File:** `scripts/seed.ts`

All five seeded devotionals have `audioUrl: ''`. The audio player will show an
error state for every seed devotional. Bible reading plan passages have
`text: ''`. A first-time tester using seed data will see broken audio and
empty scripture readings.

---

### MEDIUM 5 — `getGivingSummary` Loads Up to 100 Donations on Every Profile View

**File:** `services/firebase/giving.ts`, line 129

```typescript
const allDonations = await getDonationHistory(userId, 100);
```

Called every time the giving summary is displayed. For active givers with large
histories this is wasteful; for the profile screen (which currently shows
hardcoded data anyway) it will be called on every profile open once the
placeholder is replaced. This should use aggregated totals stored on the user
document.

---

## Low-Priority Improvements

- **No test suite exists.** Zero unit tests, zero integration tests, zero
  snapshot tests. Any future change has no safety net.
- **`functions/package.json` uses `^12.0.0` for firebase-admin** but the latest
  is 13.x. The functions `tsconfig.json` targets `es2020` but Node 18 runtime
  supports `es2022`.
- **`AsyncStorage` persistence is not configured for Zustand stores.** On app
  restart, all state is reset and every screen shows a loading state.
- **The Bible tab reads static plan data** — no Firestore-backed reading progress
  for the seed plans; `updateReadingProgress` writes to `readingProgress/{uid}`
  but the bible screen doesn't read from it on mount.
- **Search UI exists in Library and Groups** but no search query is executed;
  the filter is applied only to the already-loaded in-memory list.
- **`react-native-svg` and `expo-blur`** are in use but not listed in `app.json`
  plugins — may cause issues in EAS Build.
- **No error boundaries** around any screen. An unhandled JS error will crash
  the entire app rather than showing a graceful error state.
- **`formatCurrency` in `utils/format.ts`** uses `navigator.language` (a Web
  API) which may return `undefined` on some React Native environments.

---

## Security Assessment: 35 / 100

| Area | Status |
|---|---|
| Chapa webhook HMAC verification | ❌ Missing — critical financial risk |
| Firestore role self-promotion | ❌ Exploitable with one `updateDoc` call |
| Firestore rules (general) | ✅ Well-structured role hierarchy |
| Push token collection security | ⚠️ Tokens readable by any authenticated user |
| API keys in client code | ✅ All keys are `EXPO_PUBLIC_` (acceptable) |
| Chapa secret key server-side | ✅ Correctly in Cloud Function |
| Firebase App Check | ❌ Not configured |
| Admin access validation | ⚠️ Client-side gate only (role from Firestore, but writable by owner) |
| Input validation | ⚠️ Minimal — donation amounts not validated server-side |

The two critical security issues (webhook forgery and role self-promotion) must
be fixed before any real money flows through the app.

---

## Performance Assessment: 55 / 100

| Area | Status |
|---|---|
| Animations (Reanimated 3) | ✅ Correct use of worklets, no JS thread blocking |
| Image handling | ⚠️ No lazy loading, no image caching configured |
| Firebase queries | ⚠️ Several unbounded `getDocs` calls; no pagination on admin screens |
| Giving summary | ⚠️ Loads 100 documents to compute 3 totals |
| Audio player | ✅ expo-av streaming works correctly |
| List rendering | ✅ FlatList used appropriately in most screens |
| Bundle size | ⚠️ Not measured; likely large given all dependencies |
| App startup | ⚠️ Firebase `onAuthStateChanged` + profile fetch blocks splash; push token registration adds another async chain |

---

## Scalability Assessment: 40 / 100

| Area | Status |
|---|---|
| Firestore indexes | ❌ No `firestore.indexes.json` — queries will fail in production |
| Aggregation | ❌ Admin analytics requires per-query aggregation; no Cloud Aggregation Functions |
| User growth | ⚠️ `getAllUsers` loads all users — will OOM at scale |
| Push delivery | ⚠️ `onAnnouncementPublished` loads ALL push tokens then sends one at a time; will hit Cloud Function timeout limit past ~1,000 tokens |
| Giving reports | ⚠️ `getGivingReport` loads all donations in a date range; no aggregated totals |
| Data model | ✅ Subcollection design for groups/members is correct |
| Rate limiting | ❌ No Cloud Function rate limiting |

---

## What Actually Works (Confirmed by Code)

| Feature | Status |
|---|---|
| Firebase Auth (email/password) | ✅ Functional |
| User registration + profile creation | ✅ Functional |
| Onboarding flow (3 steps) | ✅ Functional |
| Devotional list + detail + reading | ✅ Functional (audio linking has bug) |
| Audio player (when store is populated) | ✅ Functional |
| Bible reading plans (UI) | ✅ Functional (no real scripture text in seeds) |
| Prayer wall (submit, react, comment) | ✅ Functional |
| Community/groups browsing | ✅ Functional |
| Admin dashboard stats | ✅ Functional (reads real Firestore data) |
| Admin devotional management | ✅ Functional (CRUD wired to Firestore) |
| Admin announcement management | ✅ Functional (CRUD wired to Firestore) |
| Admin user role management | ✅ Functional |
| Firestore Security Rules (general) | ✅ Well-written |
| Storage upload (devotional cover/audio) | ✅ Functional (code path correct) |

| Feature | Status |
|---|---|
| Digital giving (Chapa) | ❌ Functions not deployed; field name bug |
| Push notifications | ❌ Dead (wrong projectId) |
| Admin analytics charts | ❌ 100% hardcoded |
| Profile giving totals | ❌ Hardcoded $0.00 |
| Forgot password | ❌ No-op |
| Edit profile | ❌ No-op |
| Social login (Google/Apple) | ❌ No-op |
| Notification settings | ❌ No-op |

---

## Recommended Beta Testing Plan

### Pre-Beta (Complete Before Any External Testers)

**Week 1 — Critical Fixes (Non-Negotiable)**

1. Fix Firestore rule to prevent self-role-promotion (30 min)
2. Add Chapa webhook HMAC verification (2 hours)
3. Fix push notification `projectId` to EAS UUID (15 min)
4. Fix `donation.type` → `donation.category` field mismatch in history (30 min)
5. Fix `setIsSubmitting` timing in giving flow to prevent double-submit (30 min)
6. Reset all Zustand stores on logout (1 hour)
7. Deploy Cloud Functions with proper environment variables (1 day, including Chapa account setup)
8. Create `firestore.indexes.json` and deploy indexes (2 hours)
9. Fix giving summary currency from `'USD'` to `'ETB'` (15 min)
10. Fix `handleListen` to set `currentDevotional` in store before navigating (1 hour)

**Week 2 — Stub Replacement**

11. Replace hardcoded analytics charts with real Firestore aggregation (3 days)
12. Replace hardcoded profile giving totals with `getGivingSummary` call (4 hours)
13. Implement Forgot Password screen (2 hours — Firebase `sendPasswordResetEmail` exists)
14. Add real audio URLs to seed devotionals (1 hour — need actual MP3 files)
15. Add user feedback for all no-op buttons (either implement or remove) (1 day)

### Beta Phase 1 — Internal (Staff Only, 10–15 people, 2 weeks)

**Goal:** Validate core flows work on real devices with real Firebase project

Test matrix:
- Android physical device (required — Expo Go + EAS build)
- iOS physical device (required — Expo Go + EAS build)
- Poor network simulation (3G throttling)
- Multi-user scenarios (two accounts on same device)

Focus areas:
1. Full auth flow: register → onboarding → home → logout → login as different user
2. Complete giving flow end-to-end with real Chapa test credentials (ETB)
3. Audio playback on cellular
4. Admin panel: create devotional with image + audio upload
5. Push notifications: publish announcement → receive notification
6. Verify no stale data after logout/login as different user

Go/no-go criteria for Phase 2:
- Zero payment processing errors in test transactions
- Push notifications delivered within 60 seconds
- No crashes in a 30-minute session on either platform
- Admin analytics show real data

### Beta Phase 2 — Soft Launch (Congregation, 50–100 people, 4 weeks)

**Goal:** Real-world stress testing and UX feedback

- Require EAS build (not Expo Go) for this phase
- Monitor Firebase console daily: Firestore read counts, Function invocations, Storage usage
- Set up Firebase Crashlytics (not currently configured)
- Chapa test mode → production mode transition after Week 1 if payments are clean

---

## Recommended Launch Plan

### Minimum Requirements for Public Launch

| Requirement | Current State |
|---|---|
| All critical blockers resolved | ❌ 7 blockers |
| Zero-data crash scenarios eliminated | ❌ Several |
| Real end-to-end payment tested in production mode | ❌ Functions not deployed |
| Push notifications confirmed working on real device | ❌ Dead |
| EAS Build configured with `eas.json` | ❌ Not found |
| `firestore.indexes.json` deployed | ❌ Missing |
| At least one round of internal beta complete | ❌ Not started |

### Timeline Estimate (Optimistic)

| Phase | Duration |
|---|---|
| Critical fixes (Weeks 1–2) | 2 weeks |
| Internal beta + iteration (Weeks 3–4) | 2 weeks |
| Congregation beta + iteration (Weeks 5–8) | 4 weeks |
| App Store submission + review | 1–2 weeks |
| **Earliest realistic public launch** | **~10 weeks from today** |

### Launch Scope Recommendation

At launch, explicitly **disable or remove** the following unfinished features
rather than shipping them as silent no-ops:

- Social login buttons (or implement them)
- Admin analytics charts (replace with "Coming Soon")
- Leaderboards (referenced in church settings toggle, not implemented)
- Edit Profile screen (implement the basics or remove the menu item)

### Monitoring Required at Launch

- Firebase Crashlytics (not yet configured — add before launch)
- Chapa transaction success rate (should be >95%)
- Push notification delivery rate (monitor via Expo push receipt API)
- Firestore read/write cost (the giving summary query is expensive at scale)
- Cloud Function error rate

---

## Summary Table

| Category | Score | Verdict |
|---|---|---|
| UI / UX Polish | 90/100 | Excellent — production quality visual design |
| Authentication | 70/100 | Core flow works; forgot password and social login are no-ops |
| Devotionals | 65/100 | Reading works; audio linking has bug; no real audio in seeds |
| Bible Reading | 60/100 | UI complete; no scripture text in seeds; progress not persisted |
| Community / Prayer | 72/100 | Functional; double-count bug; leave() error handling missing |
| Digital Giving | 15/100 | Multiple critical bugs; functions not deployed |
| Admin Dashboard | 55/100 | Stats real; analytics fake; indexes missing |
| Push Notifications | 5/100 | Completely non-functional due to wrong projectId |
| Security | 35/100 | Two critical holes; general rules are good |
| Performance | 55/100 | No obvious bottlenecks at small scale; will degrade at 1k+ users |
| Scalability | 40/100 | Missing indexes will break queries; push delivery won't scale |
| Test Coverage | 0/100 | No tests of any kind |
| **Overall** | **38/100** | **Not ready for external beta** |

---

*This report evaluates only what exists in the committed codebase on branch*
*`claude/topic-digital-church-app-ZnBJg` as of June 7, 2026.*
*No assumptions were made about planned or in-progress work.*
