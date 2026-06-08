# Stabilization Sprint 2 — Report

**Date:** 2026-06-08  
**Branch:** `claude/topic-digital-church-app-ZnBJg`  
**Base commit:** `8bd8126`

---

## Files Changed

| File | Change |
|---|---|
| `hooks/useGroups.ts` | Phase 1 — added `joinedGroupIds` to return object (crash fix) |
| `app/groups/index.tsx` | Phase 1 + 3 — removed unused destructure; added Firestore error banner + retry |
| `app/prayer/index.tsx` | Phase 3 — added Firestore error banner + retry |
| `app/prayer/[id].tsx` | Phase 6 — `icon=` → `leadingIcon=` (Button prop, TS error) |
| `app/devotional/[id].tsx` | Phase 6 — `icon=` → `leadingIcon=` (Button prop, TS error) |
| `app/devotional/player.tsx` | Phase 4 — `Shadows.xl` → `Shadows.lg` (non-existent key) |
| `app/(tabs)/index.tsx` | Phase 6 — `"book-open-outline"` → `"book-outline"` (invalid Ionicons name) |
| `components/devotional/AudioPlayer.tsx` | Phase 4 — removed dead `@react-native-community/slider` import |
| `app/(admin)/announcements/create.tsx` | Phase 5 — disabled misleading "Publish + Send Push" button |
| `services/notifications.ts` | Phase 2/6 — fixed `SchedulableTriggerInputTypes.DAILY` trigger type (all 3 occurrences) |
| `firestore.indexes.json` | Phase 2 — rewrote with all 23 composite indexes for every compound query |

---

## Bugs Fixed

### CRITICAL (would crash screen)

| # | Bug | File | Fix |
|---|---|---|---|
| 1 | `joinedGroupIds` undefined — Community tab crashes on mount | `hooks/useGroups.ts` | Added missing return field |
| 2 | `Shadows.xl` undefined — player.tsx StyleSheet crash | `app/devotional/player.tsx:496` | Changed to `Shadows.lg` |
| 3 | Dead `@react-native-community/slider` import — Metro bundle error if package ever resolves | `AudioPlayer.tsx` | Removed import |

### HIGH (silent failure / wrong behavior)

| # | Bug | File | Fix |
|---|---|---|---|
| 4 | `notifications.ts` trigger type — `{ hour, minute, repeats: true }` not valid in Expo SDK 52 | `services/notifications.ts` | Used `SchedulableTriggerInputTypes.DAILY` enum |
| 5 | "Publish + Send Push" button — parameter was unused; button was identical to plain Publish | `announcements/create.tsx` | Disabled + labeled "Coming Soon" |
| 6 | `icon=` prop on Button — silently ignored (correct prop is `leadingIcon`) | `prayer/[id].tsx`, `devotional/[id].tsx` | Renamed to `leadingIcon=` |
| 7 | `"book-open-outline"` invalid Ionicons name — icon renders blank | `(tabs)/index.tsx:100` | Changed to `"book-outline"` |

### MEDIUM (UX degradation without feedback)

| # | Bug | File | Fix |
|---|---|---|---|
| 8 | Groups screen showed no error when Firestore query failed | `app/groups/index.tsx` | Added offline banner + retry |
| 9 | Prayer screen showed no error when Firestore query failed | `app/prayer/index.tsx` | Added offline banner + retry |

---

## Remaining Blockers (must fix before release)

### 1. Firestore Indexes Not Deployed

`firestore.indexes.json` is correct but the indexes are **not yet live** in Firebase.

**Action required (run on local machine with Firebase CLI):**
```bash
firebase deploy --only firestore:indexes --project topic-digital
```

Until deployed, any screen using a compound query (`where` + `orderBy` on different fields) will fail with a Firestore `FAILED_PRECONDITION` error. Affected screens:
- Groups (category filter)
- Prayer (public + status filter)
- Announcements (type/priority filter)
- Library/Devotionals (category filter)
- Donations history

### 2. EAS Push Notification Project ID Not Set

`services/notifications.ts:getExpoPushToken()` returns `null` because `app.json` has `extra.eas.projectId` set to the slug `"topic-digital-church-app"` instead of the EAS UUID.

**Action required:** Replace with the actual UUID from the Expo dashboard (`expo.dev` → project settings → Project ID field).

---

## Remaining TypeScript Errors (non-crash)

| Error | File | Risk | Notes |
|---|---|---|---|
| `TS1323` dynamic import module flag | `notifications.ts:86` | None | tsconfig strictness; Metro handles it; has try/catch |
| `TS2769` LinearGradient colors type | `DevotionalCard.tsx`, `DevotionalHero.tsx` | None | String arrays work at runtime; type definition mismatch |
| `TS2322` SkeletonLoader style array | `SkeletonLoader.tsx:114` | None | Harmless style type widening |
| `TS2307` firebase-functions not found | `functions/src/index.ts` | None | Server-side only; not part of client bundle |
| `TS2307` firebase-admin not found | `functions/src/index.ts`, `scripts/seed.ts` | None | Server-side only; not part of client bundle |

---

## Android Readiness

| Check | Status |
|---|---|
| Firebase analytics Platform guard | PASS — `Platform.OS !== 'android'` guard prevents web-only crash |
| Community tab crash | FIXED — `joinedGroupIds` now returned from hook |
| Audio player dead import | FIXED — slider import removed |
| Notification trigger type | FIXED — Expo SDK 52 enum used |
| Firestore indexes deployed | BLOCKED — deploy required from local machine |
| Push token configured | BLOCKED — EAS UUID not set |
| Onboarding white-screen | No regression detected — auth flow and navigation intact |

---

## Internal Church Testing Readiness

**Verdict: Ready for Internal Testing** (after Firestore index deploy)

The app is functionally complete for the core flows:
- Register → Onboarding → Home
- Daily devotionals + audio player
- Prayer wall (create, view, mark answered)
- Groups (browse, join, attendance)
- Announcements (admin create, member view)
- Donations (Chapa integration)
- Notification preferences

Features intentionally deferred:
- Push notification delivery (Publish + Send Push button disabled)
- Bible reader tab (hidden from nav)
- Admin analytics dashboard

---

*Generated by Stabilization Sprint 2*
