import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  arrayUnion,
  increment,
  DocumentSnapshot,
  QueryDocumentSnapshot,
} from 'firebase/firestore';
import { db } from './config';
import { PrayerRequest, PrayerCategory, PrayerStatus, PrayerReaction } from '../../types';

const PRAYERS = 'prayerRequests';
const REACTIONS = 'prayerReactions';

function fromDoc(snap: DocumentSnapshot | QueryDocumentSnapshot): PrayerRequest {
  return { id: snap.id, ...snap.data() } as PrayerRequest;
}

// ─── Read Prayer Requests ─────────────────────────────────────────────────────

export async function getPublicPrayers(
  pageSize = 20
): Promise<PrayerRequest[]> {
  const q = query(
    collection(db, PRAYERS),
    where('isPublic', '==', true),
    where('status', '==', 'active'),
    orderBy('createdAt', 'desc'),
    limit(pageSize)
  );
  const snap = await getDocs(q);
  return snap.docs.map(fromDoc);
}

export async function getPrayerById(id: string): Promise<PrayerRequest | null> {
  const snap = await getDoc(doc(db, PRAYERS, id));
  if (!snap.exists()) return null;
  return fromDoc(snap);
}

export async function getUserPrayers(userId: string): Promise<PrayerRequest[]> {
  const q = query(
    collection(db, PRAYERS),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map(fromDoc);
}

export async function getAnsweredPrayers(pageSize = 20): Promise<PrayerRequest[]> {
  const q = query(
    collection(db, PRAYERS),
    where('isPublic', '==', true),
    where('status', '==', 'answered'),
    orderBy('answeredAt', 'desc'),
    limit(pageSize)
  );
  const snap = await getDocs(q);
  return snap.docs.map(fromDoc);
}

export async function getGroupPrayers(groupId: string): Promise<PrayerRequest[]> {
  const q = query(
    collection(db, PRAYERS),
    where('groupId', '==', groupId),
    orderBy('createdAt', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map(fromDoc);
}

export async function getPrayersByCategory(
  category: PrayerCategory
): Promise<PrayerRequest[]> {
  const q = query(
    collection(db, PRAYERS),
    where('category', '==', category),
    where('isPublic', '==', true),
    where('status', '==', 'active'),
    orderBy('createdAt', 'desc'),
    limit(20)
  );
  const snap = await getDocs(q);
  return snap.docs.map(fromDoc);
}

// ─── Submit / Update Prayers ──────────────────────────────────────────────────

export async function submitPrayerRequest(
  prayer: Omit<PrayerRequest, 'id' | 'prayerCount' | 'reactedUserIds' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  const now = new Date().toISOString();
  const ref = await addDoc(collection(db, PRAYERS), {
    ...prayer,
    prayerCount: 0,
    reactedUserIds: [],
    createdAt: now,
    updatedAt: now,
  });

  await updateDoc(doc(db, 'users', prayer.userId), {
    'stats.totalPrayersSubmitted': increment(1),
  });

  return ref.id;
}

export async function markPrayerAnswered(
  prayerId: string,
  userId: string,
  answeredNote?: string
): Promise<void> {
  await updateDoc(doc(db, PRAYERS, prayerId), {
    status: 'answered' as PrayerStatus,
    answeredAt: new Date().toISOString(),
    answeredNote: answeredNote ?? '',
    updatedAt: new Date().toISOString(),
  });

  await updateDoc(doc(db, 'users', userId), {
    'stats.totalPrayersAnswered': increment(1),
  });
}

export async function prayForRequest(
  prayerId: string,
  userId: string,
  reactionType: 'praying' | 'amen' | 'heart' = 'praying'
): Promise<void> {
  // Add reaction
  const reaction: PrayerReaction = {
    id: `${prayerId}_${userId}`,
    prayerRequestId: prayerId,
    userId,
    type: reactionType,
    createdAt: new Date().toISOString(),
  };

  await updateDoc(doc(db, PRAYERS, prayerId), {
    prayerCount: increment(1),
    reactedUserIds: arrayUnion(userId),
    updatedAt: new Date().toISOString(),
  });
}

export async function updatePrayerRequest(
  prayerId: string,
  updates: Partial<PrayerRequest>
): Promise<void> {
  await updateDoc(doc(db, PRAYERS, prayerId), {
    ...updates,
    updatedAt: new Date().toISOString(),
  });
}
