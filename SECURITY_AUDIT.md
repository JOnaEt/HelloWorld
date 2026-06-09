# TOPIC Digital — Security Audit

## Audit Date: June 6, 2026

## CRITICAL FINDINGS

### 1. No Firestore Security Rules [CRITICAL — RESOLVED]
**Status:** firestore.rules now deployed
**Previous Risk:** All Firestore data was either fully public or locked
**Impact (before):** Anyone with the API key could read/write all church member data, donations, prayers
**Resolution:** Full Firestore rules deployed covering all collections with proper role-based access

### 2. Firebase Config Exposed via Environment Variables [HIGH]
**Status:** API keys stored in EXPO_PUBLIC_ variables
**Risk:** EXPO_PUBLIC_ vars are bundled into the client — this is expected for Firebase Web SDK but API keys must be restricted in Firebase Console
**Fix:** Add authorized domains and restrict API key in Google Cloud Console

### 3. No Input Sanitization [MEDIUM]
**Risk:** Prayer requests, devotional content inputs not sanitized server-side
**Fix:** Add Cloud Function trigger to sanitize user-generated content

### 4. Admin Role Client-Side Only [HIGH]
**Status:** Role check done in client (useAuthStore) AND now also server-side via Firestore rules
**Previous Risk:** Malicious user could modify client state to bypass admin checks
**Resolution:** Firebase rules enforce role server-side — deploy rules immediately (done)

## Payment Security
- Stripe integration not yet implemented — no immediate risk
- When implemented: Never handle raw card data on client
- Use Stripe Payment Intents via Cloud Functions only

## Data Privacy
- Prayer requests: Users can mark private — rules enforce this via isPublic field
- Donations: Personal financial data — rules restrict to owner + admin (now enforced)
- Profile data: Phone numbers stored — add privacy controls

## Recommendations
1. Deploy Firestore rules (CRITICAL) ✓ DONE
2. Restrict Firebase API key in Google Cloud Console
3. Enable Firebase App Check for production
4. Review Firebase Storage rules when audio/image upload is added
5. Add rate limiting via Cloud Functions for prayer/announcement creation
6. Enable Firestore audit logging in production
