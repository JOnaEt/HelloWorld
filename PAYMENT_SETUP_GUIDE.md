# Payment Setup Guide — Chapa Integration

This guide explains how to set up Chapa (Ethiopia's leading payment gateway) so that church members can give online through the TOPIC Digital app. Payments support Telebirr, CBEBirr, Awash Bank, Dashen Bank, and all major Ethiopian banks.

---

## Part 1 — Create a Chapa Account

### Step 1: Register at Chapa

1. Open your web browser and go to **https://dashboard.chapa.co**
2. Click "Create Account."
3. Enter your church's information:
   - Business Name: `Temple of Priests International Church`
   - Business Email: use your church's official email
   - Phone number: your church's contact number
   - Country: Ethiopia
4. Click "Register."
5. Check your email for a verification link and click it.

### Step 2: Complete Business Verification

Chapa requires business verification before live payments can be processed. You will need:

- A copy of your church's registration certificate (from the relevant government authority in Ethiopia).
- A tax identification number (TIN) if your church has one.
- Church letterhead or official stamp.

1. Log in to the Chapa dashboard.
2. Click "Business Verification" in the left sidebar.
3. Upload the required documents.
4. Verification typically takes 3–7 business days.

### Step 3: Get Your API Keys

While waiting for verification, you can use Chapa's test keys to develop and test:

1. In the Chapa dashboard, click "API Keys" in the left sidebar.
2. You will see two keys:
   - **Test Secret Key** — starts with `CHASECK_TEST-`
   - **Live Secret Key** — starts with `CHASECK-` (available after verification)
3. Copy the test key for now. Keep it confidential — do not share it publicly.

---

## Part 2 — Deploy Firebase Cloud Functions

The app uses Firebase Cloud Functions to keep the Chapa secret key secure on the server. Follow these steps to deploy the functions.

### Step 4: Install Required Tools

Ask your developer to run the following commands:

```bash
# Install Firebase CLI (if not already installed)
npm install -g firebase-tools

# Install Node.js 20 (if not already installed)
# Visit https://nodejs.org and download LTS version
```

### Step 5: Install Function Dependencies

```bash
cd functions
npm install
```

### Step 6: Set the Chapa Secret Key

This stores your secret key securely in Firebase — it is never put in the app code.

```bash
# For testing (use Chapa test key):
firebase functions:config:set chapa.secret_key="CHASECK_TEST-your-test-key-here"

# For production (use Chapa live key after verification):
firebase functions:config:set chapa.secret_key="CHASECK-your-live-key-here"
```

### Step 7: Deploy the Functions

```bash
cd functions
npm run deploy
```

This deploys four Cloud Functions:
- `initializeChapaPayment` — creates Chapa transaction when user taps Give
- `chapaWebhook` — called by Chapa when payment is confirmed
- `onAnnouncementPublished` — sends push notification to all members when a new announcement is created
- `sendDailyDevotionalReminders` — sends morning push notifications at 7:00 AM EAT daily

Deployment takes about 3–5 minutes. You will see a success message when complete.

---

## Part 3 — Configure the Chapa Webhook

Chapa needs to know where to send payment confirmation. This is how the app knows a payment was successful.

### Step 8: Get Your Webhook URL

1. After deploying functions, Firebase will give you a URL like:
   `https://us-central1-topic-digital-church.cloudfunctions.net/chapaWebhook`
2. Copy this URL.

### Step 9: Register the Webhook in Chapa

1. Log in to the Chapa dashboard.
2. Click "Webhooks" in the left sidebar.
3. Click "Add Webhook."
4. Paste the URL from Step 8 into the Webhook URL field.
5. Select "Payment Success" as the event to listen to.
6. Click "Save."

---

## Part 4 — Test the Payment Flow

### Step 10: Test with Chapa Test Mode

Chapa provides test credentials that simulate real payments without moving actual money.

1. Open the TOPIC Digital app (in TestFlight or development build).
2. Go to the Giving screen.
3. Select "Tithe" and enter an amount (e.g., ETB 100).
4. Tap "Give."
5. The Chapa checkout page should open in a browser.
6. Use Chapa's test payment credentials (available in the Chapa dashboard under "Test Mode"):
   - Test phone number: `0900000000` (for Telebirr test)
   - Test OTP: `123456`
7. Complete the payment.
8. You should be returned to the app with a "Thank You" message.

### Step 11: Verify in Firebase

1. Go to Firebase Console > Firestore Database.
2. Open the `donations` collection.
3. Find the donation document. The `status` field should say `completed`.

---

## Part 5 — Go Live with Real Payments

### Step 12: Switch to Live Mode

Once Chapa has verified your account:

1. Get your Live Secret Key from the Chapa dashboard (starts with `CHASECK-`).
2. Update the Firebase Functions config:
   ```bash
   firebase functions:config:set chapa.secret_key="CHASECK-your-live-key-here"
   firebase deploy --only functions
   ```
3. Update the Chapa dashboard webhook to point to the live function URL.

### Step 13: Set Up Your Bank Account

To receive payouts from Chapa:

1. In the Chapa dashboard, click "Payouts" in the left sidebar.
2. Add your church's bank account details.
3. You can set up automatic weekly or monthly payouts, or manual withdrawals.

---

## Giving Summary for Members

Once the integration is live, church members can:

- Give Tithe, Offering, Building Fund, Missions contributions, or Special Giving
- Pay via Telebirr, CBEBirr, Awash Bank, Dashen Bank, or other Ethiopian banks
- See their full giving history in the app
- Give anonymously if preferred

Church admins can see total donations and giving history in the Firebase Console under the `donations` collection.

---

## Troubleshooting

**Problem:** "Payment Error: NOT_FOUND" appears in the app.
**Solution:** The Cloud Functions have not been deployed yet. Complete Part 2 of this guide.

**Problem:** Payment opens but does not redirect back to the app.
**Solution:** Confirm the app scheme is set to `topic-digital` in `app.json`. Rebuild the app after any changes.

**Problem:** Donation shows as "pending" and never changes to "completed."
**Solution:** Check that the webhook URL is correctly registered in the Chapa dashboard (Step 9). Check Firebase Functions logs: `firebase functions:log --only chapaWebhook`.

**Problem:** Chapa dashboard shows error during verification.
**Solution:** Contact Chapa support at support@chapa.co with your registration documents.

---

For technical assistance, contact your development team.
