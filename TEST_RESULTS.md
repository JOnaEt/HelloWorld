# TOPIC Digital — Test Results

**Date:** 2026-06-07  
**Method:** Code review + static analysis (no device/simulator available in this environment)

---

## Test Coverage Summary

| Area | Status | Notes |
|------|--------|-------|
| Authentication flow | PASS (code) | Login, Register, Forgot Password, Logout all wired correctly |
| Role security | PASS (code) | Firestore rules block role self-promotion |
| Devotional player | PASS (code) | Store set before navigation, expo-av integration intact |
| markRead idempotency | PASS (code) | Composite key guard prevents duplicate increments |
| Analytics events | PASS (code) | Only fire on success path |
| Store reset on logout | PASS (code) | All 5 stores cleared via `.setState()` |
| Group leave error | PASS (code) | `.catch()` handler shows Alert with message |
| Edit Profile | PASS (code) | Modal wired to `updateProfile()`, photo upload via Storage |
| Forgot Password | PASS (code) | Modal pre-fills email, calls `forgotPassword()`, shows success state |
| Giving (Coming Soon) | PASS (code) | No API calls, no Firestore writes |
| Admin: Create Devotional | PASS (code) | Audio preview, image preview, Replace buttons |
| Admin: Create Announcement | PASS (code) | Image preview, Replace button |
| Admin: Church Settings logo | PASS (code) | Upload, preview, saves to Firestore |
| Firestore indexes | PASS (definition) | 11 composite indexes in `firestore.indexes.json` |
| Push token validation | PASS (code) | Guards against slug placeholder, warns if not UUID |

---

## Test Scenarios: Authentication

### TC-AUTH-01: Register new user
**Steps:** Open app → Create Account → fill all fields → submit  
**Expected:** Profile created in Firestore, navigate to onboarding/interests  
**Code analysis:** `signUp()` → `setUser(profile)` → `Analytics.signUp()` → `router.replace('/(auth)/onboarding/interests')`  
**Result:** PASS (code)

### TC-AUTH-02: Login with valid credentials
**Steps:** Login screen → enter email/password → Sign In  
**Expected:** Navigate to `/(tabs)/` if onboarded, else to onboarding  
**Code analysis:** `signIn()` → `setUser(profile)` → `Analytics.login()` → route based on `profile.isOnboarded`  
**Result:** PASS (code)

### TC-AUTH-03: Login with invalid credentials
**Steps:** Enter wrong password → Sign In  
**Expected:** Error banner shown, no analytics event fired  
**Code analysis:** `catch` block sets error message, `Analytics.login()` never reached  
**Result:** PASS (code)

### TC-AUTH-04: Forgot Password
**Steps:** Login screen → Forgot Password? → enter email → Send Link  
**Expected:** Modal shows success state, Firebase sends email  
**Code analysis:** `forgotPassword()` calls `resetPassword(email)` from Firebase Auth, returns `true` on success  
**Result:** PASS (code)

### TC-AUTH-05: Logout
**Steps:** Profile → Sign Out → confirm  
**Expected:** All stores cleared, navigate to welcome screen  
**Code analysis:** `signOut()` → `setUser(null)` → all 5 stores reset → `router.replace('/(auth)/welcome')`  
**Result:** PASS (code)

---

## Test Scenarios: Role Security

### TC-SEC-01: User attempts to promote own role
**Steps:** User calls updateDoc on own profile with `{ role: 'admin' }`  
**Expected:** Firestore rejects with permission-denied  
**Code analysis:** Rule: `!request.resource.data.diff(resource.data).affectedKeys().hasAny(['role'])`  
**Result:** PASS (rule)

### TC-SEC-02: Admin updates any user's role
**Steps:** Admin user calls updateDoc with `{ role: 'leader' }` on another user  
**Expected:** Write succeeds  
**Code analysis:** `isAdmin()` path does not have the role restriction  
**Result:** PASS (rule)

---

## Test Scenarios: Devotional Player

### TC-DEV-01: Open devotional audio player
**Steps:** Devotionals tab → tap devotional → Listen  
**Expected:** Player screen opens with correct devotional loaded  
**Code analysis:** `handleListen()` calls `useDevotionalStore.getState().setCurrentDevotional(devotional)` then `router.push('/devotional/player')`  
**Result:** PASS (code)

### TC-DEV-02: Mark devotional as read (idempotent)
**Steps:** Open devotional → mark as read → mark as read again  
**Expected:** `readCount` only incremented once  
**Code analysis:** `getDoc(progressRef)` guard — if exists, returns early without incrementing  
**Result:** PASS (code)

---

## Test Scenarios: Groups

### TC-GRP-01: Join a group
**Steps:** Groups tab → tap group → Join Group  
**Expected:** User added to members subcollection, `memberCount` incremented  
**Code analysis:** `join(groupId)` in `useGroups.ts`  
**Result:** PASS (code, not audited in depth)

### TC-GRP-02: Leave a group
**Steps:** Group detail → Leave Group → confirm  
**Expected:** User removed from members, count decremented  
**Code analysis:** `leave(group.id).catch((err) => Alert.alert(...))`  
**Result:** PASS (code) — error handling verified

---

## Test Scenarios: Storage Uploads

### TC-STG-01: Admin uploads devotional cover image
**Steps:** Admin → Create Devotional → Upload Cover Image → pick from library  
**Expected:** Progress shown → image thumbnail displayed → Replace button appears  
**Code analysis:** `uploadDevotionalCover()` → sets `thumbnailUrl` → `<Image>` component renders with uri  
**Result:** PASS (code)

### TC-STG-02: Admin uploads devotional audio
**Steps:** Admin → Create Devotional → Upload Audio File → pick .mp3  
**Expected:** Progress shown → play/stop preview button appears  
**Code analysis:** `uploadDevotionalAudio()` → sets `audioUrl` → play button calls `Audio.Sound.createAsync`  
**Result:** PASS (code)

### TC-STG-03: Admin uploads announcement image
**Steps:** Admin → Create Announcement → Upload Image → pick from library  
**Expected:** Progress shown → image thumbnail + Replace button appears  
**Code analysis:** `uploadAnnouncementImage()` → sets `imageUrl` → `<Image>` renders  
**Result:** PASS (code)

### TC-STG-04: Admin uploads church logo
**Steps:** Admin → Settings → Church tab → Upload Church Logo  
**Expected:** Logo preview shown (100×100), saved to Firestore  
**Code analysis:** `uploadFile()` → `setLogoUrl()` → `updateChurchSettings({ logoUrl })` → `<Image>` renders  
**Result:** PASS (code)

### TC-STG-05: User changes profile photo
**Steps:** Profile → Edit Profile → Change Photo  
**Expected:** Photo picker opens → uploads → avatar updates  
**Code analysis:** `uploadProfilePhoto()` → `updateProfile({ photoURL })` → `Avatar` re-renders with new uri  
**Result:** PASS (code)

---

## Known Failing Tests (Not Yet Implemented)

| Test | Reason |
|------|--------|
| Push notification delivery | EAS UUID not configured |
| Social login (Google/Apple) | Not implemented |
| Notification Settings screen | Empty `onPress` |
| Privacy & Security screen | Empty `onPress` |
| Help & Support screen | Empty `onPress` |
| Group prayer requests | Placeholder text only |

---

## Device Testing Required Before Launch

The following must be verified on real devices (iOS + Android):

1. **Audio playback** — expo-av behavior differs between simulators and real devices; verify audio plays from Firebase Storage URLs
2. **Image picker permissions** — `expo-image-picker` requires gallery permission prompt on first use
3. **Document picker** — `expo-document-picker` for audio files behaves differently on iOS Files vs Android file manager
4. **Push notification permission prompt** — Must test on real device; simulators don't receive push tokens
5. **Keyboard avoiding view** — Edit Profile and Forgot Password modals must be tested for keyboard overlap on various screen sizes
6. **Deep linking / navigation** — Expo Router `router.replace()` and `router.push()` behavior should be verified on fresh installs
