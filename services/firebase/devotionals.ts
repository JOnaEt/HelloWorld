import {
  collection,
  doc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  limit,
  setDoc,
  updateDoc,
  increment,
  DocumentSnapshot,
  QueryDocumentSnapshot,
} from 'firebase/firestore';
import { db } from './config';
import { Devotional, DevotionalCategory, ListenedRecord } from '../../types';
import { getTodayKey } from '../../utils/date';

const COLLECTION = 'devotionals';
const LISTENED_COLLECTION = 'listenedRecords';

function fromDoc(snap: DocumentSnapshot | QueryDocumentSnapshot): Devotional {
  return { id: snap.id, ...snap.data() } as Devotional;
}

// ─── Daily Devotional ─────────────────────────────────────────────────────────

export async function getDailyDevotional(): Promise<Devotional | null> {
  const todayKey = getTodayKey();
  const q = query(
    collection(db, COLLECTION),
    where('isDaily', '==', true),
    where('dailyDate', '==', todayKey),
    limit(1)
  );
  const snap = await getDocs(q);
  if (snap.empty) {
    // Fall back to featured
    return getFeaturedDevotional();
  }
  return fromDoc(snap.docs[0]);
}

export async function getFeaturedDevotional(): Promise<Devotional | null> {
  const q = query(
    collection(db, COLLECTION),
    where('isFeatured', '==', true),
    orderBy('publishedAt', 'desc'),
    limit(1)
  );
  const snap = await getDocs(q);
  if (snap.empty) return null;
  return fromDoc(snap.docs[0]);
}

// ─── All Devotionals ──────────────────────────────────────────────────────────

export async function getAllDevotionals(
  pageSize = 20
): Promise<Devotional[]> {
  const q = query(
    collection(db, COLLECTION),
    orderBy('publishedAt', 'desc'),
    limit(pageSize)
  );
  const snap = await getDocs(q);
  return snap.docs.map(fromDoc);
}

export async function getDevotionalsByCategory(
  category: DevotionalCategory,
  pageSize = 20
): Promise<Devotional[]> {
  const q = query(
    collection(db, COLLECTION),
    where('category', '==', category),
    orderBy('publishedAt', 'desc'),
    limit(pageSize)
  );
  const snap = await getDocs(q);
  return snap.docs.map(fromDoc);
}

export async function getDevotionalById(id: string): Promise<Devotional | null> {
  const snap = await getDoc(doc(db, COLLECTION, id));
  if (!snap.exists()) return null;
  return fromDoc(snap);
}

export async function getTrendingDevotionals(count = 6): Promise<Devotional[]> {
  const q = query(
    collection(db, COLLECTION),
    orderBy('listenCount', 'desc'),
    limit(count)
  );
  const snap = await getDocs(q);
  return snap.docs.map(fromDoc);
}

export async function searchDevotionals(
  searchTerm: string
): Promise<Devotional[]> {
  // Firestore doesn't support full-text search natively.
  // In production, use Algolia or a Firebase Extension.
  // For now, we fetch recent and filter client-side.
  const q = query(
    collection(db, COLLECTION),
    orderBy('publishedAt', 'desc'),
    limit(50)
  );
  const snap = await getDocs(q);
  const all = snap.docs.map(fromDoc);
  const lower = searchTerm.toLowerCase();
  return all.filter(
    (d) =>
      d.title.toLowerCase().includes(lower) ||
      d.scripture.book.toLowerCase().includes(lower) ||
      d.category.toLowerCase().includes(lower) ||
      d.tags.some((t) => t.toLowerCase().includes(lower))
  );
}

// ─── Engagement ───────────────────────────────────────────────────────────────

export async function markRead(devotionalId: string, userId: string): Promise<void> {
  await updateDoc(doc(db, COLLECTION, devotionalId), {
    readCount: increment(1),
  });
  await updateDoc(doc(db, 'users', userId), {
    'stats.totalDevotionalsRead': increment(1),
  });
}

export async function markListened(
  devotionalId: string,
  userId: string,
  progress: number,
  completed: boolean
): Promise<void> {
  const recordId = `${userId}_${devotionalId}`;
  const record: ListenedRecord = {
    devotionalId,
    userId,
    listenedAt: new Date().toISOString(),
    progress,
    completed,
  };
  await setDoc(doc(db, LISTENED_COLLECTION, recordId), record, { merge: true });

  if (completed) {
    await updateDoc(doc(db, COLLECTION, devotionalId), {
      listenCount: increment(1),
    });
    await updateDoc(doc(db, 'users', userId), {
      'stats.totalDevotionalsListened': increment(1),
    });
  }
}

export async function getListenedRecord(
  devotionalId: string,
  userId: string
): Promise<ListenedRecord | null> {
  const recordId = `${userId}_${devotionalId}`;
  const snap = await getDoc(doc(db, LISTENED_COLLECTION, recordId));
  if (!snap.exists()) return null;
  return snap.data() as ListenedRecord;
}

export async function getRecentlyListened(
  userId: string,
  count = 10
): Promise<ListenedRecord[]> {
  const q = query(
    collection(db, LISTENED_COLLECTION),
    where('userId', '==', userId),
    orderBy('listenedAt', 'desc'),
    limit(count)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as ListenedRecord);
}

export async function incrementShareCount(devotionalId: string): Promise<void> {
  await updateDoc(doc(db, COLLECTION, devotionalId), {
    shareCount: increment(1),
  });
}
