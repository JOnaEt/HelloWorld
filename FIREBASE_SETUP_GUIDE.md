# Firebase Setup Guide — TOPIC Digital

This guide walks you through setting up a Firebase project for the TOPIC Digital church app from scratch. You do not need programming experience, but you will need to follow the steps carefully.

Estimated time: 45–60 minutes for first-time setup.

---

## Part 1 — Create a Firebase Project

### Step 1: Sign in to Firebase

1. Open your web browser and go to **https://console.firebase.google.com**
2. Sign in with a Google account. Use a church-owned Google account (not a personal one).
3. Click "Add project" or "Create a project."

### Step 2: Name Your Project

1. Enter the project name: `topic-digital-church`
2. Click "Continue."
3. On the Google Analytics screen, make sure "Enable Google Analytics for this project" is turned ON.
4. Choose "Create a new Google Analytics account" (or use an existing one if your church already has Google Analytics).
5. Select your country as **Ethiopia**.
6. Click "Create project."
7. Wait about 30 seconds for the project to be created.
8. Click "Continue."

---

## Part 2 — Enable Authentication

### Step 3: Set Up Email/Password Login

1. In the left sidebar, click **Authentication**.
2. Click "Get started."
3. Under the "Sign-in method" tab, click on "Email/Password."
4. Toggle the first switch to "Enabled."
5. Click "Save."

---

## Part 3 — Set Up Firestore Database

### Step 4: Create the Database

1. In the left sidebar, click **Firestore Database**.
2. Click "Create database."
3. Select **"Start in production mode"** (we will add security rules next).
4. Choose the server location closest to Ethiopia. Select **"europe-west1 (Belgium)"** — this is the closest region with good performance for East Africa.
5. Click "Enable."
6. Wait about 1 minute for the database to be created.

### Step 5: Set Security Rules

1. Click on the **Rules** tab inside Firestore.
2. Replace ALL the existing text with the rules below.
3. Click **Publish**.

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Users can read and write their own profile
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }

    // Push tokens — only owner can write
    match /pushTokens/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Donations — owner can read, Cloud Functions can write via admin
    match /donations/{donationId} {
      allow read: if request.auth != null &&
        resource.data.userId == request.auth.uid;
      allow create: if request.auth != null;
    }

    // Devotionals — anyone logged in can read; only admins can write
    match /devotionals/{id} {
      allow read: if request.auth != null;
      allow write: if request.auth != null &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['admin', 'pastor'];
    }

    // Announcements — anyone logged in can read; only admins can write
    match /announcements/{id} {
      allow read: if request.auth != null;
      allow write: if request.auth != null &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['admin', 'pastor'];
    }

    // Groups — anyone logged in can read; leaders and admins can write
    match /groups/{id} {
      allow read: if request.auth != null;
      allow write: if request.auth != null &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['admin', 'pastor', 'leader'];
    }

    // Group members
    match /groupMembers/{id} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }

    // Prayer requests — public ones can be read by all; private ones only by owner
    match /prayerRequests/{id} {
      allow read: if request.auth != null &&
        (resource.data.isPublic == true || resource.data.userId == request.auth.uid);
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null &&
        resource.data.userId == request.auth.uid;
    }

    // Reading plans — public read
    match /readingPlans/{id} {
      allow read: if request.auth != null;
      allow write: if request.auth != null &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }

    // Church settings — admin only
    match /churchSettings/{id} {
      allow read: if request.auth != null;
      allow write: if request.auth != null &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```

---

## Part 4 — Set Up Firebase Storage

### Step 6: Enable Storage

1. In the left sidebar, click **Storage**.
2. Click "Get started."
3. Click "Next" on the rules screen (we will update rules next).
4. Select the same region as your Firestore database: **europe-west1**.
5. Click "Done."

### Step 7: Set Storage Rules

1. Click on the **Rules** tab inside Storage.
2. Replace ALL existing text with:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {

    // Anyone logged in can read files
    match /{allPaths=**} {
      allow read: if request.auth != null;
    }

    // Users can upload their own profile photos
    match /profiles/{userId}/{allPaths=**} {
      allow write: if request.auth != null && request.auth.uid == userId;
    }

    // Admins and pastors can upload devotional files
    match /devotionals/{allPaths=**} {
      allow write: if request.auth != null;
    }

    // Admins and pastors can upload announcement images
    match /announcements/{allPaths=**} {
      allow write: if request.auth != null;
    }
  }
}
```

3. Click **Publish**.

---

## Part 5 — Get Your Firebase Configuration Keys

### Step 8: Register the App

1. On the Firebase project home page, click the gear icon next to "Project Overview" in the left sidebar.
2. Click "Project settings."
3. Scroll down to the "Your apps" section.
4. Click the "</>" icon (Web app).
5. Enter the app nickname: `TOPIC Digital App`.
6. Do NOT check "Also set up Firebase Hosting."
7. Click "Register app."
8. You will see a block of code that starts with `const firebaseConfig = {`.
9. Copy the values for each key (you will need them in the next step).

### Step 9: Save Configuration Keys

Create a file called `.env` in the root of the project folder. Add the following, replacing each value with the ones from the Firebase configuration you just copied:

```
EXPO_PUBLIC_FIREBASE_API_KEY=paste-your-apiKey-here
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=paste-your-authDomain-here
EXPO_PUBLIC_FIREBASE_PROJECT_ID=paste-your-projectId-here
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=paste-your-storageBucket-here
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=paste-your-messagingSenderId-here
EXPO_PUBLIC_FIREBASE_APP_ID=paste-your-appId-here
EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID=paste-your-measurementId-here
```

---

## Part 6 — Set the First Admin Account

### Step 10: Assign Admin Role

After registering the first church administrator account in the app:

1. Go to **Firebase Console > Firestore Database**.
2. Click on the `users` collection.
3. Find the document for the admin user (the document ID matches the user's UID shown in Firebase Authentication).
4. Click the document to open it.
5. Find the `role` field.
6. Click the pencil (edit) icon next to it.
7. Change the value from `member` to `admin`.
8. Click "Update."

The admin can now log out and back in to see the Admin Panel in the app.

---

## Part 7 — Seed the Database with Sample Data

### Step 11: Run the Seed Script

> This step requires Node.js and the Firebase CLI to be installed. Ask your developer for assistance if needed.

1. Open a terminal in the project folder.
2. Run: `firebase login` (sign in with the same Google account used for Firebase).
3. Run: `firebase use topic-digital-church` (replace with your actual project ID).
4. Run: `cd scripts && npm install`
5. Set your project ID: `export FIREBASE_PROJECT_ID=topic-digital-church`
6. Run: `npm run seed`

This will populate the database with 5 devotionals, 5 announcements, 5 groups, 3 Bible reading plans, and church settings.

---

## Part 8 — Enable Google Analytics

Analytics are automatically collected once you enable them in your Firebase project. No additional setup is required. To view analytics:

1. Go to **Firebase Console > Analytics**.
2. It may take 24–48 hours for the first data to appear.
3. You can view active users, popular screens, and event counts.

---

## Troubleshooting

**Problem:** App shows "Permission Denied" error.
**Solution:** Check that your Firestore security rules were published correctly in Step 5.

**Problem:** Images do not upload.
**Solution:** Check that Firebase Storage rules were published in Step 7.

**Problem:** Cannot log in.
**Solution:** Confirm that Email/Password authentication is enabled in Step 3.

**Problem:** Admin Panel is not visible.
**Solution:** Make sure the user's `role` field in Firestore is set to `admin` (Step 10). Log out and back in after making the change.

---

For further assistance, contact your development team.
