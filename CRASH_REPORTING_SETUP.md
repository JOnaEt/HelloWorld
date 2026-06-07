# TOPIC Digital — Crash Reporting Setup Guide

**Recommended approach:** Sentry for React Native (simpler than Firebase Crashlytics for Expo managed workflow)

---

## Option A: Sentry (Recommended)

Sentry has first-class Expo SDK support, works in managed workflow without ejecting, and provides real-time error grouping.

### Step 1: Install

```bash
npx expo install @sentry/react-native
```

### Step 2: Configure Sentry project

1. Go to [sentry.io](https://sentry.io) and create a new project
2. Select **React Native** as the platform
3. Copy your **DSN** (looks like `https://abc123@o123.ingest.sentry.io/456`)

### Step 3: Add to app.json

```json
{
  "expo": {
    "plugins": [
      [
        "@sentry/react-native/expo",
        {
          "organization": "your-sentry-org",
          "project": "topic-digital"
        }
      ]
    ]
  }
}
```

### Step 4: Initialize in app/_layout.tsx

Open `app/_layout.tsx` and add at the top of the file:

```typescript
import * as Sentry from '@sentry/react-native';

Sentry.init({
  dsn: 'YOUR_SENTRY_DSN_HERE',
  environment: __DEV__ ? 'development' : 'production',
  enableInExpoDevelopment: false,  // Only capture in production builds
  debug: __DEV__,
});
```

Then wrap the root layout export:

```typescript
export default Sentry.wrap(RootLayout);
```

Your `RootLayout` function should remain unchanged — just wrap the export.

### Step 5: Set user context after login

In `hooks/useAuth.ts`, add user identification after successful login:

```typescript
import * as Sentry from '@sentry/react-native';

// In the login() callback, after setUser(profile):
Sentry.setUser({ id: profile.uid, email: profile.email ?? undefined });

// In the logout() callback, after setUser(null):
Sentry.setUser(null);
```

### Step 6: Test crash reporting

In any screen (temporarily), add a crash test button:

```typescript
// Test button — remove before shipping
<TouchableOpacity onPress={() => { throw new Error('Sentry test crash'); }}>
  <Text>Test Crash</Text>
</TouchableOpacity>
```

Build with `eas build --profile preview` and verify the error appears in your Sentry dashboard within 30 seconds.

### Step 7: Upload source maps (EAS Build)

Add to `eas.json`:

```json
{
  "build": {
    "production": {
      "env": {
        "SENTRY_AUTH_TOKEN": "your-sentry-auth-token"
      }
    }
  }
}
```

Add `SENTRY_AUTH_TOKEN` to your EAS secrets (`eas secret:create`). The Sentry Expo plugin handles source map uploads automatically during `eas build`.

---

## Option B: Firebase Crashlytics

Firebase Crashlytics requires a bare (ejected) workflow or the `@react-native-firebase` package, which adds significant build complexity for an Expo managed workflow project.

**Not recommended** for this project unless you are willing to eject from Expo managed workflow. If you need Crashlytics specifically:

1. Run `npx expo prebuild` to generate native code
2. Switch to development builds (EAS Build custom profile)
3. Follow the [React Native Firebase setup guide](https://rnfirebase.io/crashlytics/usage)

This adds `android/` and `ios/` directories to the project and removes the ability to use Expo Go for testing.

---

## What to Monitor

After crash reporting is live, prioritize alerts on:

| Error | Likely Cause |
|-------|-------------|
| `FirebaseError: permission-denied` | User hitting Firestore rules they shouldn't — check auth state |
| `Error: No current user` | `useAuth()` called before Firebase Auth restored session |
| `Error: Could not play audio` | Firebase Storage audio URL expired or malformed |
| `TypeError: Cannot read property of null` | Null-check missing on Firestore document that doesn't exist |
| `Network request failed` | User offline — consider adding offline state detection |

---

## Minimum Acceptable Setup for Beta

For a private beta (TestFlight / internal track), the minimum viable crash reporting is:

1. Install `@sentry/react-native`
2. Add DSN to `app/_layout.tsx`
3. Wrap `RootLayout` export with `Sentry.wrap()`
4. Build with `eas build --profile preview`

This alone gives you crash reports, stack traces, and device context — sufficient for a beta testing period.

Do not ship to the App Store or Google Play without source map upload configured (Step 7 above), or stack traces will be unreadable.
