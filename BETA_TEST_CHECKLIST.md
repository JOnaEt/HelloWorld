# TOPIC Digital — Beta Test Checklist

This guide is for church staff testing the TOPIC Digital app before launch. Work through each section in order. For each item, mark it as Pass, Fail, or Skip (if the feature is not yet applicable).

---

## Before You Begin

- Install the TestFlight (iOS) or APK (Android) build provided by the development team.
- Make sure you have a stable internet connection.
- Use a real phone — do not test on a simulator.
- Have the Firebase Console open in a browser to verify data in real time (ask your IT coordinator for access).

---

## Section 1 — Registration and Login

### 1.1 New Account Registration
1. Open the app for the first time.
2. Tap "Create one" on the welcome screen.
3. Enter your full name, email address, and a password (at least 8 characters).
4. Accept the terms and conditions.
5. Tap "Create Account."

**Expected result:** You are taken to the onboarding screen or home screen.
**Check in Firebase Console:** A new user should appear under Authentication > Users.

- [ ] Pass / [ ] Fail

### 1.2 Login with Existing Account
1. Tap "Sign In" on the welcome screen.
2. Enter your email and password.
3. Tap "Sign In."

**Expected result:** You are taken to the home screen within 3 seconds.

- [ ] Pass / [ ] Fail

### 1.3 Invalid Login
1. Try to sign in with a wrong password.

**Expected result:** An error message appears. The app does not crash.

- [ ] Pass / [ ] Fail

---

## Section 2 — Devotionals

### 2.1 Browse Devotionals
1. Tap the Library tab (book icon at the bottom).
2. Scroll through the devotional list.

**Expected result:** At least 5 devotionals appear (from seed data). Each card shows a title, author, and category.

- [ ] Pass / [ ] Fail

### 2.2 Read a Devotional
1. Tap on any devotional card.
2. Read through the scripture, content, and prayer.

**Expected result:** Full devotional text loads correctly. Reflection prompts are visible.

- [ ] Pass / [ ] Fail

### 2.3 Audio Player (if audio file is uploaded)
1. Open a devotional that has an audio file.
2. Tap the Play button.
3. Let it play for at least 30 seconds.
4. Try the 15-second skip buttons.
5. Try changing the playback speed.

**Expected result:** Audio plays correctly. Seek and speed change work. Progress bar updates.

- [ ] Pass / [ ] Fail / [ ] Skip (no audio uploaded yet)

### 2.4 Daily Devotional Reminder
1. Go to Settings > Notifications.
2. Enable the daily devotional reminder.
3. Set a time.

**Expected result:** The setting saves. At the scheduled time, a notification appears on the phone.

- [ ] Pass / [ ] Fail

---

## Section 3 — Prayer Wall

### 3.1 Submit a Prayer Request
1. Tap the Prayer tab (hands icon at the bottom).
2. Tap the "+" button to add a prayer.
3. Enter a title, content, and select a category.
4. Choose whether to post anonymously.
5. Tap Submit.

**Expected result:** The prayer appears in the All Prayers list. Firebase Console shows a new document in the `prayerRequests` collection.

- [ ] Pass / [ ] Fail

### 3.2 React to a Prayer
1. Find any prayer in the list.
2. Tap the "Praying" button.

**Expected result:** The pray count increases by 1.

- [ ] Pass / [ ] Fail

### 3.3 My Prayers Tab
1. Tap the "My Prayers" tab on the prayer screen.

**Expected result:** Only your submitted prayers appear here.

- [ ] Pass / [ ] Fail

---

## Section 4 — Groups

### 4.1 Browse Groups
1. Tap the Groups icon from the home screen.
2. Scroll through the list.

**Expected result:** At least 5 groups appear (from seed data). Each shows name, member count, and next meeting time.

- [ ] Pass / [ ] Fail

### 4.2 Join a Group
1. Tap on any group you are not yet a member of.
2. Tap "Join Group."

**Expected result:** The button changes to "Joined." The member count increases by 1.

- [ ] Pass / [ ] Fail

### 4.3 Leave a Group
1. Tap on a group you have joined.
2. Tap "Leave Group."
3. Confirm when prompted.

**Expected result:** The group is removed from your list.

- [ ] Pass / [ ] Fail

---

## Section 5 — Giving (Requires Cloud Functions Deployment)

> Note: If Cloud Functions have not been deployed, giving will show a "Setup Required" message. This is expected behavior. Skip this section if functions are not yet deployed.

### 5.1 Select a Giving Category
1. Tap the Give icon from the home screen.
2. Scroll through the giving categories (Tithe, Offering, Building Fund, etc.).
3. Select "Offering."

**Expected result:** The category highlights. A description appears below the selection.

- [ ] Pass / [ ] Fail

### 5.2 Select an Amount
1. Tap one of the quick-amount buttons (e.g., ETB 50).
2. Then type a custom amount.

**Expected result:** The amount display at the top updates correctly.

- [ ] Pass / [ ] Fail

### 5.3 Process a Payment via Chapa
1. Select a category and an amount.
2. Tap the Give button.
3. Chapa checkout should open in a browser window.
4. Complete (or cancel) the payment.

**Expected result:**
- If completed: "Thank You" message appears. History tab shows the donation.
- If cancelled: "Payment Cancelled" message appears.

- [ ] Pass / [ ] Fail / [ ] Skip

### 5.4 Giving History
1. Tap the "History" tab on the giving screen.

**Expected result:** Your previous donations appear with category, date, and amount.

- [ ] Pass / [ ] Fail

---

## Section 6 — Announcements

### 6.1 View Announcements
1. Tap the Announcements icon from the home screen.
2. Scroll through the list.

**Expected result:** At least 5 announcements appear (from seed data). Pinned announcements appear at the top.

- [ ] Pass / [ ] Fail

### 6.2 Open an Announcement
1. Tap on any announcement.

**Expected result:** Full content loads. If there is a button (action URL), it is tappable.

- [ ] Pass / [ ] Fail

---

## Section 7 — Admin Panel (Admin Accounts Only)

> Ask your IT coordinator to set your account role to "admin" in Firebase Console before testing this section.

### 7.1 Access Admin Panel
1. Log out and log back in after your role is set to admin.
2. Look for the Admin Panel button on the home screen or profile screen.

**Expected result:** Admin Panel is visible. Non-admin accounts should not see this.

- [ ] Pass / [ ] Fail

### 7.2 Create a Devotional
1. In Admin Panel, tap "Create Devotional."
2. Fill in the title, category, scripture, and content fields.
3. Upload a cover image using the "Upload Cover Image" button.
4. Upload an audio file using the "Upload Audio File" button.
5. Tap "Publish Devotional."

**Expected result:** The devotional appears in the Library. Cover and audio load correctly.

- [ ] Pass / [ ] Fail

### 7.3 Create an Announcement
1. In Admin Panel, tap "Create Announcement."
2. Fill in the title and content.
3. Upload an image using the "Upload Image" button.
4. Tap "Publish."

**Expected result:** The announcement appears in the Announcements list.

- [ ] Pass / [ ] Fail

---

## Section 8 — Push Notifications

### 8.1 Permission Request
1. On first launch (or after clearing app data), open the app and log in.

**Expected result:** The phone asks permission to send notifications. Accept it.

- [ ] Pass / [ ] Fail

### 8.2 Announcement Notification
1. Have an admin account publish a new announcement.
2. On a separate device (logged in as a regular member), wait up to 60 seconds.

**Expected result:** A push notification arrives with the announcement title.

- [ ] Pass / [ ] Fail

### 8.3 Notification Tap
1. With the app in the background, tap the notification.

**Expected result:** The app opens and navigates to the relevant screen (announcements list).

- [ ] Pass / [ ] Fail

---

## Section 9 — General App Quality

### 9.1 No Crashes
Run through all the sections above without force-quitting the app.

**Expected result:** The app does not crash at any point.

- [ ] Pass / [ ] Fail

### 9.2 Loading States
Check that loading indicators (spinners) appear whenever the app is fetching data.

- [ ] Pass / [ ] Fail

### 9.3 Error Handling
Try these edge cases:
- Submit a prayer with an empty title.
- Try to give ETB 0.
- Open a devotional with no internet connection.

**Expected result:** Helpful error messages appear. The app does not freeze or crash.

- [ ] Pass / [ ] Fail

### 9.4 Offline Behavior
Turn off Wi-Fi and mobile data. Try to load the home screen.

**Expected result:** Previously cached content may still appear. New requests show a friendly "No connection" message.

- [ ] Pass / [ ] Fail

---

## Reporting Issues

If you find a bug or something does not work as expected:

1. Take a screenshot or screen recording.
2. Note the exact steps you took before the problem occurred.
3. Note the phone model and operating system version (e.g., Samsung Galaxy A53, Android 14).
4. Send your report to the development team with the subject line: **TOPIC Beta Feedback — [Your Name]**

---

Thank you for helping make TOPIC Digital the best it can be for our church family!
