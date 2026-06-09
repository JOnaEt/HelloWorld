import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import fetch from 'node-fetch';
import { Expo, ExpoPushMessage } from 'expo-server-sdk';

admin.initializeApp();
const db = admin.firestore();
const expo = new Expo();

const CHAPA_SECRET_KEY = functions.config().chapa?.secret_key ?? process.env.CHAPA_SECRET_KEY ?? '';
const CHAPA_BASE_URL = 'https://api.chapa.co/v1';

// ── Chapa Payment Initialization ─────────────────────────────────────────────

export const initializeChapaPayment = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Must be logged in to make a payment.');
  }

  const { amount, currency, email, firstName, lastName, title, donationId } = data as {
    amount: number;
    currency: string;
    email: string;
    firstName: string;
    lastName: string;
    title: string;
    donationId: string;
    type?: string;
  };

  if (!amount || amount <= 0) {
    throw new functions.https.HttpsError('invalid-argument', 'Invalid amount.');
  }

  const txRef = `TOPIC-${donationId}-${Date.now()}`;

  // Create a pending donation record in Firestore
  await db.collection('donations').doc(donationId).set({
    userId: context.auth.uid,
    amount,
    currency: currency ?? 'ETB',
    type: data.type ?? 'offering',
    status: 'pending',
    txRef,
    createdAt: new Date().toISOString(),
  }, { merge: true });

  // Initialize transaction with Chapa
  const chapaResponse = await fetch(`${CHAPA_BASE_URL}/transaction/initialize`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${CHAPA_SECRET_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      amount: amount.toString(),
      currency: currency ?? 'ETB',
      email,
      first_name: firstName,
      last_name: lastName,
      tx_ref: txRef,
      title: title ?? 'TOPIC Digital',
      description: `${title} - Temple of Priests International Church`,
      return_url: `https://topicdigital.page.link/giving?status=success&tx_ref=${txRef}`,
      callback_url: `https://${process.env.GCLOUD_PROJECT}.cloudfunctions.net/chapaWebhook`,
    }),
  });

  const chapaData = await chapaResponse.json() as { status: string; message: string; data: { checkout_url: string } };

  if (chapaData.status !== 'success') {
    throw new functions.https.HttpsError('internal', `Chapa error: ${chapaData.message}`);
  }

  return {
    checkoutUrl: chapaData.data.checkout_url,
    txRef,
  };
});

// ── Chapa Webhook ─────────────────────────────────────────────────────────────

export const chapaWebhook = functions.https.onRequest(async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).send('Method Not Allowed');
    return;
  }

  const { tx_ref } = req.body as { tx_ref: string; status: string };

  if (!tx_ref) {
    res.status(400).send('Missing tx_ref');
    return;
  }

  try {
    // Verify with Chapa
    const verifyResponse = await fetch(`${CHAPA_BASE_URL}/transaction/verify/${tx_ref}`, {
      headers: { 'Authorization': `Bearer ${CHAPA_SECRET_KEY}` },
    });
    const verifyData = await verifyResponse.json() as {
      status: string;
      data?: { status: string; id: string };
    };

    if (verifyData.status === 'success' && verifyData.data?.status === 'success') {
      // Find donation by txRef and mark completed
      const snapshot = await db.collection('donations')
        .where('txRef', '==', tx_ref).limit(1).get();

      if (!snapshot.empty) {
        const donationDoc = snapshot.docs[0];
        await donationDoc.ref.update({
          status: 'completed',
          processedAt: new Date().toISOString(),
          chapaTransactionId: verifyData.data.id ?? tx_ref,
        });

        // Update user stats
        const donationData = donationDoc.data();
        await db.collection('users').doc(donationData.userId as string).update({
          'stats.totalDonations': admin.firestore.FieldValue.increment(donationData.amount as number),
        });
      }
    }

    res.status(200).send('OK');
  } catch (error) {
    console.error('Chapa webhook error:', error);
    res.status(500).send('Internal Server Error');
  }
});

// ── Push Notifications on Announcement ───────────────────────────────────────

export const onAnnouncementPublished = functions.firestore
  .document('announcements/{announcementId}')
  .onCreate(async (snap, context) => {
    const announcement = snap.data();

    // Only send for non-scheduled announcements
    if (announcement.scheduledFor && new Date(announcement.scheduledFor as string) > new Date()) {
      return null;
    }

    // Get all push tokens
    const tokensSnap = await db.collection('pushTokens').get();

    const messages: ExpoPushMessage[] = [];

    for (const tokenDoc of tokensSnap.docs) {
      const { token } = tokenDoc.data() as { token: string };
      if (!Expo.isExpoPushToken(token)) continue;

      messages.push({
        to: token,
        sound: 'default',
        title: (announcement.title as string) ?? 'New Announcement',
        body: announcement.content
          ? (announcement.content as string).substring(0, 100) + ((announcement.content as string).length > 100 ? '...' : '')
          : 'Tap to read the latest announcement.',
        data: {
          type: 'announcement',
          id: context.params.announcementId,
          route: '/announcements',
        },
      });
    }

    // Send in chunks (Expo limit is 100 per batch)
    const chunks = expo.chunkPushNotifications(messages);
    for (const chunk of chunks) {
      try {
        await expo.sendPushNotificationsAsync(chunk);
      } catch (err) {
        console.error('Push chunk error:', err);
      }
    }

    return null;
  });

// ── Push Notification for Daily Devotional ────────────────────────────────────

export const sendDailyDevotionalReminders = functions.pubsub
  .schedule('0 7 * * *')  // 7:00 AM UTC daily
  .timeZone('Africa/Addis_Ababa')
  .onRun(async (_context) => {
    // Get today's daily devotional
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const devSnap = await db.collection('devotionals')
      .where('isDaily', '==', true)
      .where('dailyDate', '==', today)
      .limit(1).get();

    const title = devSnap.empty
      ? "Today's Devotional Is Ready"
      : (devSnap.docs[0].data().title as string);

    // Get all tokens for users with devotional notifications enabled
    const tokensSnap = await db.collection('pushTokens').get();

    const messages: ExpoPushMessage[] = [];
    for (const tokenDoc of tokensSnap.docs) {
      const { token } = tokenDoc.data() as { token: string };
      if (!Expo.isExpoPushToken(token)) continue;
      messages.push({
        to: token,
        sound: 'default',
        title: 'Morning Devotional',
        body: title,
        data: { type: 'devotional', route: '/' },
      });
    }

    const chunks = expo.chunkPushNotifications(messages);
    for (const chunk of chunks) {
      try {
        await expo.sendPushNotificationsAsync(chunk);
      } catch (err) {
        console.error('Devotional push error:', err);
      }
    }

    return null;
  });
