# TOPIC Digital — Google Play Store Launch Checklist

## Pre-Launch Critical (Must Complete Before Any Testing)

### Security
- [ ] Deploy `firestore.rules` to Firebase project: `firebase deploy --only firestore:rules`
- [ ] Restrict Firebase API key in Google Cloud Console (add app SHA fingerprint)
- [ ] Enable Firebase App Check in Firebase Console
- [ ] Confirm Firebase project is in production mode (not test mode)
- [ ] Review user data stored for GDPR compliance (prayer requests, donations)
- [ ] Add Privacy Policy URL to app.json > `expo.android.privacyPolicy`
- [ ] Build Terms of Service screen accessible from onboarding

### Environment Variables (EAS Secrets)
- [ ] `EXPO_PUBLIC_FIREBASE_API_KEY` set in EAS secrets
- [ ] `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN` set
- [ ] `EXPO_PUBLIC_FIREBASE_PROJECT_ID` set
- [ ] `EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET` set
- [ ] `EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` set
- [ ] `EXPO_PUBLIC_FIREBASE_APP_ID` set

### App Configuration (app.json)
- [ ] `expo.name`: "TOPIC Digital"
- [ ] `expo.slug`: "topic-digital"
- [ ] `expo.version`: "1.0.0"
- [ ] `expo.android.package`: "com.topic.digital"
- [ ] `expo.android.versionCode`: 1
- [ ] App icon: 1024×1024 PNG at `assets/icon.png`
- [ ] Adaptive icon: 1024×1024 PNG at `assets/adaptive-icon.png`
- [ ] Splash screen configured

## Feature Verification (Test on Real Android Device)

### Authentication
- [ ] Register new account works
- [ ] Login with existing account works
- [ ] Onboarding completes (3 steps)
- [ ] Logout works
- [ ] Auth state persists across app restart

### Member Features
- [ ] Daily devotional loads on Home screen
- [ ] Audio player plays devotional audio
- [ ] Devotional library browses by category
- [ ] Bible reading plan progresses
- [ ] Groups can be browsed and joined
- [ ] Prayer request can be submitted
- [ ] Giving form submits (even without payment processor)
- [ ] Church announcements load
- [ ] Push notification received when sent from admin

### Admin Features (Test with admin account)
- [ ] Admin Panel button visible on Profile screen for admin users
- [ ] Admin Panel NOT visible for member accounts
- [ ] Dashboard stats load
- [ ] Can create a devotional (fills all required fields)
- [ ] Can publish an announcement
- [ ] Can manage users (change role)
- [ ] Giving reports display

## Build
- [ ] `eas build --platform android --profile preview` succeeds
- [ ] APK installs on Android 8+ device
- [ ] `eas build --platform android --profile production` generates AAB
- [ ] No build errors, no TypeScript errors (`npm run type-check`)
- [ ] App launches on cold start within 4 seconds

## Play Store Submission
- [ ] Google Play Console account created
- [ ] App icon (512×512 PNG) uploaded
- [ ] Feature graphic (1024×500 PNG) created and uploaded
- [ ] Screenshots: minimum 2 phone screenshots, 2 tablet screenshots
- [ ] Short description (80 chars): "Your daily spiritual companion for worship, devotionals & community"
- [ ] Full description (4000 chars max): complete description in Play Console
- [ ] Content rating questionnaire completed (PEGI 3 / Everyone)
- [ ] Target audience: All ages
- [ ] Privacy Policy URL entered

## Post-Launch Monitoring (Day 1–7)
- [ ] Firebase Crashlytics: crash-free sessions > 99%
- [ ] Firebase Performance: cold start < 4s on mid-range Android
- [ ] Firebase Analytics: DAU tracking, funnel from registration to first devotional
- [ ] Admin: 1+ church staff has admin account and can manage content
- [ ] Support email configured and monitored for first-week feedback
