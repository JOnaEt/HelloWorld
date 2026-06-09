# Push Notification Setup Guide — TOPIC Digital

This guide explains how to configure push notifications so that church members receive alerts for new announcements and daily devotional reminders.

---

## Overview

TOPIC Digital uses **Expo Push Notifications**, which work on both Android and iOS without needing separate Apple and Google developer accounts to get started. Here is how the system works:

1. When a user opens the app and logs in, the app registers their device and saves a push token to Firebase.
2. When an admin publishes a new announcement, a Firebase Cloud Function sends a push notification to all registered devices.
3. Every morning at 7:00 AM Ethiopian time (EAT), a scheduled function sends a devotional reminder to all registered devices.
4. Tapping a notification opens the app and navigates to the relevant screen.

---

## Part 1 — Expo Account Setup

### Step 1: Create an Expo Account

1. Go to **https://expo.dev** and click "Sign Up."
2. Use a church-owned email address.
3. Verify your email.

### Step 2: Create an Expo Project

1. Log in to the Expo dashboard.
2. Click "Create a project."
3. Enter the project name: `topic-digital`
4. Click "Create."
5. You will see a **Project ID** (looks like a UUID, e.g., `a1b2c3d4-e5f6-7890-abcd-ef1234567890`).
6. Copy this Project ID.

### Step 3: Update the App Configuration

> Ask your developer to do this step.

Open `app.json` in the project and confirm the `extra.eas.projectId` value matches your Expo Project ID:

```json
"extra": {
  "eas": {
    "projectId": "your-expo-project-id-here"
  }
}
```

Also confirm the same value is used in `app/_layout.tsx` in the `getExpoPushTokenAsync` call:

```typescript
const tokenData = await Notifications.getExpoPushTokenAsync({
  projectId: 'your-expo-project-id-here',
});
```

---

## Part 2 — Build the App with Push Notification Support

Push notifications require a native build of the app (not the Expo Go development app). You will need to build the app for distribution.

### Step 4: Install EAS CLI

> Ask your developer to run this.

```bash
npm install -g eas-cli
eas login
```

### Step 5: Configure EAS Build

In the project root, ask your developer to run:

```bash
eas build:configure
```

This creates an `eas.json` file with build profiles.

### Step 6: Build for iOS (TestFlight)

```bash
eas build --platform ios --profile preview
```

This takes about 15–20 minutes. The build is uploaded to Apple's TestFlight automatically if you have an Apple Developer account ($99/year). If you do not have one yet, the Android build will work for testing.

### Step 7: Build for Android (APK)

```bash
eas build --platform android --profile preview
```

This takes about 10–15 minutes. You will receive a download link for an APK file that can be installed directly on Android devices.

---

## Part 3 — Deploy Cloud Functions for Push Notifications

The push notification sending happens in Firebase Cloud Functions. If you have not deployed these yet, follow Part 2 of the PAYMENT_SETUP_GUIDE.md.

The two functions that handle push notifications are:

1. **`onAnnouncementPublished`** — fires automatically when a new announcement is created in Firestore. Sends a push notification to all registered devices.

2. **`sendDailyDevotionalReminders`** — runs every day at 7:00 AM EAT (04:00 UTC). Sends a morning devotional reminder to all registered devices.

### Step 8: Deploy the Functions

If not already deployed:

```bash
cd functions
npm install
npm run deploy
```

### Step 9: Verify the Scheduled Function

1. Go to **Firebase Console > Functions**.
2. You should see `sendDailyDevotionalReminders` listed.
3. Click on it and check that the schedule shows `0 7 * * *` (daily at 7:00 AM).

---

## Part 4 — Android Notification Channel

For Android devices, a notification channel must be set up. This is handled automatically by the app (in `services/notifications.ts`), but you need to confirm it is working.

### Step 10: Verify Android Channel

1. Install the app on an Android device.
2. Go to the device Settings > Apps > TOPIC Digital > Notifications.
3. You should see a "default" notification channel listed.
4. Make sure it is enabled and set to "High" importance.

---

## Part 5 — Testing Push Notifications

### Step 11: Test a Manual Notification

You can send a test notification using the Expo Push Tool:

1. Go to **https://expo.dev/notifications**
2. Log in with your Expo account.
3. Select your project.
4. Enter the Expo push token for a test device (it looks like `ExponentPushToken[...]`).
   - You can find a device's push token in the `pushTokens` collection in Firebase Firestore.
5. Enter a title (e.g., "Test Notification") and body.
6. Click "Send notification."
7. The notification should appear on the device within a few seconds.

### Step 12: Test Announcement Notification

1. Log into the app as an admin.
2. Go to Admin Panel > Create Announcement.
3. Fill in a title and content.
4. Tap "Publish."
5. On a second device logged in as a regular member, wait up to 60 seconds.
6. A push notification should arrive with the announcement title.

### Step 13: Test Devotional Reminder

The daily devotional function runs at 7:00 AM EAT. To test it immediately without waiting:

> Ask your developer to do this.

```bash
firebase functions:shell
# Inside the shell:
sendDailyDevotionalReminders({})
```

---

## Part 6 — Managing Notifications

### Viewing All Push Tokens

All registered device tokens are stored in Firestore under the `pushTokens` collection. Each document is named with the user's UID and contains:

- `token` — the Expo push token
- `uid` — the user's Firebase UID
- `platform` — `ios` or `android`
- `updatedAt` — the last time the token was refreshed

### Removing Stale Tokens

Tokens become invalid when a user uninstalls the app or revokes notification permission. Expo handles invalid tokens gracefully — sending to an invalid token simply fails silently.

### Monitoring Delivery

1. Go to **Firebase Console > Functions > Logs**.
2. Filter by the function name (e.g., `onAnnouncementPublished`).
3. Each push batch will log the number of messages sent and any errors.

---

## Troubleshooting

**Problem:** Notifications are not arriving on iOS.
**Solution:**
- Confirm the app was built with EAS (not Expo Go).
- Check that the Expo Project ID in `app.json` matches your actual Expo project.
- On the device, go to Settings > TOPIC Digital > Notifications and make sure they are enabled.

**Problem:** Notifications are not arriving on Android.
**Solution:**
- Check that the notification channel is enabled (Step 10).
- Confirm the functions are deployed (Step 8).
- Check Firebase Functions logs for errors.

**Problem:** "Push token registration failed" appears in the app logs.
**Solution:** This is a non-critical warning. It usually means the device refused notification permission or the Expo project ID is incorrect. The app will continue to work — only push notifications will be unavailable on that device.

**Problem:** `sendDailyDevotionalReminders` is not appearing in the Functions list.
**Solution:** The scheduled functions require the Blaze (pay-as-you-go) plan in Firebase. Upgrade from Spark (free) to Blaze in Firebase Console > Usage and billing. Note: Cloud Functions usage has a generous free tier and costs are minimal for a church app.

---

## Cost Estimate

For a church with up to 500 members:

- **Expo Push Notifications:** Free (no charge for sending notifications through Expo).
- **Firebase Cloud Functions:** The free Spark plan covers small usage. For larger churches, the Blaze plan costs approximately $0.40 per million function invocations. A church sending 500 notifications per day for a year would cost less than $1 in function costs.
- **Firebase Firestore:** The free Spark plan covers typical church app usage.

---

For technical assistance, contact your development team.
