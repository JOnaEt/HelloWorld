# TOPIC Digital — Release Readiness Report

**Generated:** 2026-06-08  
**Branch:** `claude/topic-digital-church-app-ZnBJg`  
**Stack:** React Native 0.76.3 · Expo SDK 52 · Firebase JS SDK v10.12.2 · Expo Router 4.x

---

## Overall Score: 5 / 10 — Not Yet Production Ready

The app is structurally sound and the core devotional flow works end-to-end. Several critical crashes have been resolved. However, key features are incomplete placeholders, the giving integration is missing, and the app has not been tested through a full EAS build. The app is ready for internal TestFlight/APK testing only.

---

## Status by Phase

### ✅ Phase 1 — Android Stability
| Item | Status |
|---|---|
| `firebase/analytics` web-only crash | **FIXED** — Platform-guarded in `services/analytics.ts` |
| Root URL routing to "Access Restricted" | **FIXED** — `app/index.tsx` auth redirect added |
| No other web-only Firebase imports found | ✅ Clean |

### ✅ Phase 2 — Environment Reliability
| Item | Status |
|---|---|
| Missing env var validation | **FIXED** — `services/firebase/config.ts` logs all missing vars in dev |
| Windows BOM issue in `.env` | **Documented** — user must use `[System.IO.File]::WriteAllText()` not PowerShell `Out-File` |

### ⚠️ Phase 3 — Onboarding Flow
| Item | Status |
|---|---|
| Auth → Onboarding navigation | Working (tested) |
| `interests.tsx` Reanimated animations | No crash observed — `useSharedValue` safe on SDK 52 |
| Onboarding → Home navigation | Working via `router.push('/(auth)/onboarding/notifications')` |
| Missing profile on first sign-in | **FIXED** — `auth.ts` creates profile if missing |

### ✅ Phase 4 — Firestore Safety
| Item | Status |
|---|---|
| `devotionals/create.tsx` — undefined fields crash | **FIXED** |
| `announcements/create.tsx` — undefined fields crash | **FIXED** — payload built conditionally |
| `announcements/create.tsx` — Alert.alert on web | **FIXED** — inline `submitError` state |
| `settings.tsx` — Alert.alert on save | **FIXED** — inline `saveStatus` banner |
| Composite index failures in `getDailyDevotional` | **FIXED** — single-field query + client sort |
| `groups/create.tsx` — Babel parse error | **FIXED** — operator precedence fix |

### ✅ Phase 5 — Remove Fake Production Data
| Item | Status |
|---|---|
| Bible tab hidden from navigation | **FIXED** — `href: null` in layout, skipped in TabBar |
| Hardcoded notification badge count (= 2) | **FIXED** — removed from `HomeScreen` |
| Hardcoded Verse of the Day (Psalm 119:105) | **FIXED** — section removed |
| Giving tab | Not in tab bar — accessible only via quick action (acceptable) |

### ⚠️ Phase 6 — Firebase Deployment
| Item | Status |
|---|---|
| Firestore security rules | Deployed by user via Firebase Console |
| Storage security rules | Deployed by user via Firebase Console |
| Composite indexes for devotionals | No longer needed (queries simplified) |
| Composite indexes for prayers, users, donations | In `firestore.indexes.json` — not yet deployed |
| `listenedRecords` compound query | Needs `userId + listenedAt` index |

---

## Remaining Bugs

### High Priority
| Bug | File | Notes |
|---|---|---|
| Firestore indexes not deployed | `firestore.indexes.json` | Run `firebase deploy --only firestore:indexes` once Firebase CLI is available |
| EAS Build untested | — | Cloud build blocked by network policy in dev environment; user must run `eas build` locally |
| Giving feature is UI-only | `app/giving/` | No Chapa payment integration wired up. Never show to non-test users. |

### Medium Priority
| Bug | File | Notes |
|---|---|---|
| Prayer intercessor flow unverified | `app/prayer/` | Firestore queries exist but end-to-end flow not tested |
| User profile edit screen | `app/profile/` | Save path not fully verified |
| Admin analytics screen | `app/(admin)/analytics.tsx` | Hardcoded/placeholder data — do not show to real users |
| Push notifications | — | Requires valid EAS `projectId` UUID in `app.json`, not just slug |
| No error boundaries | All screens | Unhandled render errors will crash the app instead of showing a recovery UI |

### Low Priority
| Bug | File | Notes |
|---|---|---|
| No offline support | — | Firebase JS SDK has limited offline caching; no explicit offline mode |
| Group creation leader search | `app/(admin)/groups/create.tsx` | Search is client-side over fetched members; may be slow with large user base |
| Announcement image uses temp ID | `announcements/create.tsx` | `Date.now()` used as temp ID for storage path — images won't be cleaned up if save fails |

---

## Risks

| Risk | Severity | Mitigation |
|---|---|---|
| `.env` BOM on Windows corrupts Firebase init | **High** | Document PowerShell encoding fix; add env validation logging (done) |
| Giving screen visible to users with no payment backend | **High** | Keep quick action "Give" but ensure giving screen clearly shows "Coming Soon" |
| Firestore rules allow broad writes | **Medium** | Current rules require auth; tighten per-collection rules before public release |
| No rate limiting on auth | **Medium** | Firebase Auth has built-in abuse protection but no custom rate limits |
| Admin role is self-assigned on first sign-up | **Medium** | First user gets `role: 'member'`; admin role must be set manually in Firestore console |

---

## Estimated Hours to Production

| Work Item | Est. Hours |
|---|---|
| EAS Build + OTA testing on Android + iOS | 4 |
| Deploy Firestore indexes | 1 |
| Giving feature (Chapa integration, server function) | 20–40 |
| Push notifications (EAS + server trigger) | 8 |
| Error boundaries on all screens | 4 |
| Bible feature (real Bible API or static data) | 16 |
| End-to-end testing (auth, devotionals, groups, prayer) | 8 |
| Security audit of Firestore rules | 4 |
| **Total (excl. Bible + Giving)** | **~29 hours** |
| **Total (incl. Bible + Giving)** | **~70 hours** |

---

## What Works Right Now (Testable in Expo Go)

- Sign-up / Sign-in flow
- Onboarding (interests, notifications)
- Devotional browsing (Library tab)
- Devotional detail + read tracking
- Daily devotional on Home tab
- Admin: create devotional (with cover + audio upload)
- Admin: create announcement (fixed)
- Admin: settings (church info, notifications, giving config)
- Admin: group creation
- Prayer submission
- Community tab (groups list)
- Profile view

---

## What is NOT Ready for Real Users

- Giving (no payment backend)
- Bible tab (placeholder data — hidden from nav)
- Admin analytics (fake data)
- Push notifications (not tested end-to-end)
- Intercessor prayer matching (untested)
