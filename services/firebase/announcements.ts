import {
  collection,
  doc,
  getDocs,
  getDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  arrayUnion,
  DocumentSnapshot,
  QueryDocumentSnapshot,
} from 'firebase/firestore';
import { db } from './config';
import { Announcement, AnnouncementType } from '../../types';

const ANNOUNCEMENTS = 'announcements';

function fromDoc(snap: DocumentSnapshot | QueryDocumentSnapshot): Announcement {
  return { id: snap.id, ...snap.data() } as Announcement;
}

// ─── Read Announcements ───────────────────────────────────────────────────────

export async function getAllAnnouncements(
  pageSize = 20
): Promise<Announcement[]> {
  const now = new Date().toISOString();
  const q = query(
    collection(db, ANNOUNCEMENTS),
    orderBy('isPinned', 'desc'),
    orderBy('publishedAt', 'desc'),
    limit(pageSize)
  );
  const snap = await getDocs(q);
  return snap.docs.map(fromDoc).filter((a) => {
    if (!a.expiresAt) return true;
    return new Date(a.expiresAt as string) > new Date();
  });
}

export async function getAnnouncementsByType(
  type: AnnouncementType
): Promise<Announcement[]> {
  const q = query(
    collection(db, ANNOUNCEMENTS),
    where('type', '==', type),
    orderBy('publishedAt', 'desc'),
    limit(20)
  );
  const snap = await getDocs(q);
  return snap.docs.map(fromDoc);
}

export async function getAnnouncementById(
  id: string
): Promise<Announcement | null> {
  const snap = await getDoc(doc(db, ANNOUNCEMENTS, id));
  if (!snap.exists()) return null;
  return fromDoc(snap);
}

export async function getPinnedAnnouncements(): Promise<Announcement[]> {
  const q = query(
    collection(db, ANNOUNCEMENTS),
    where('isPinned', '==', true),
    orderBy('publishedAt', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map(fromDoc);
}

export async function getUrgentAnnouncements(): Promise<Announcement[]> {
  const q = query(
    collection(db, ANNOUNCEMENTS),
    where('priority', '==', 'urgent'),
    orderBy('publishedAt', 'desc'),
    limit(5)
  );
  const snap = await getDocs(q);
  return snap.docs.map(fromDoc);
}

// ─── Mark Read ────────────────────────────────────────────────────────────────

export async function markAnnouncementRead(
  announcementId: string,
  userId: string
): Promise<void> {
  await updateDoc(doc(db, ANNOUNCEMENTS, announcementId), {
    readByUserIds: arrayUnion(userId),
  });
}

export async function getUnreadCount(
  userId: string
): Promise<number> {
  const announcements = await getAllAnnouncements(50);
  return announcements.filter(
    (a) => !a.readByUserIds.includes(userId)
  ).length;
}
