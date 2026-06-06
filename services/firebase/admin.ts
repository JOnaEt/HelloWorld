import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  getCountFromServer,
  Timestamp,
  setDoc,
  DocumentSnapshot,
  QueryDocumentSnapshot,
} from 'firebase/firestore';
import { db } from './config';
import {
  UserProfile,
  UserRole,
  Devotional,
  Announcement,
  Group,
  PrayerRequest,
  Donation,
  DevotionalCategory,
  AnnouncementType,
  AnnouncementPriority,
  GroupCategory,
} from '../../types';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fromDoc<T>(snap: DocumentSnapshot | QueryDocumentSnapshot): T {
  return { id: snap.id, ...snap.data() } as T;
}

// ─── User Management ──────────────────────────────────────────────────────────

export async function getAllUsers(roleFilter?: UserRole): Promise<UserProfile[]> {
  try {
    let q;
    if (roleFilter) {
      q = query(
        collection(db, 'users'),
        where('role', '==', roleFilter),
        orderBy('joinedAt', 'desc'),
        limit(100)
      );
    } else {
      q = query(
        collection(db, 'users'),
        orderBy('joinedAt', 'desc'),
        limit(100)
      );
    }
    const snap = await getDocs(q);
    return snap.docs.map((d) => fromDoc<UserProfile>(d));
  } catch (error) {
    console.error('getAllUsers error:', error);
    throw error;
  }
}

export async function updateUserRole(userId: string, role: UserRole): Promise<void> {
  try {
    await updateDoc(doc(db, 'users', userId), { role });
  } catch (error) {
    console.error('updateUserRole error:', error);
    throw error;
  }
}

export async function disableUser(userId: string): Promise<void> {
  try {
    await updateDoc(doc(db, 'users', userId), { isDisabled: true });
  } catch (error) {
    console.error('disableUser error:', error);
    throw error;
  }
}

export async function deleteUser(userId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'users', userId));
  } catch (error) {
    console.error('deleteUser error:', error);
    throw error;
  }
}

export async function getUserEngagementStats(userId: string): Promise<object> {
  try {
    const snap = await getDoc(doc(db, 'users', userId));
    if (!snap.exists()) return {};
    const data = snap.data();
    return {
      stats: data.stats ?? {},
      spiritualGrowthScore: data.spiritualGrowthScore ?? 0,
      groupIds: data.groupIds ?? [],
      interests: data.interests ?? [],
    };
  } catch (error) {
    console.error('getUserEngagementStats error:', error);
    throw error;
  }
}

// ─── Devotional Management ────────────────────────────────────────────────────

export async function createDevotional(
  data: Omit<Devotional, 'id' | 'listenCount' | 'readCount' | 'shareCount'>
): Promise<string> {
  try {
    const ref = await addDoc(collection(db, 'devotionals'), {
      ...data,
      listenCount: 0,
      readCount: 0,
      shareCount: 0,
      publishedAt: data.publishedAt ?? new Date().toISOString(),
    });
    return ref.id;
  } catch (error) {
    console.error('createDevotional error:', error);
    throw error;
  }
}

export async function updateDevotional(id: string, data: Partial<Devotional>): Promise<void> {
  try {
    await updateDoc(doc(db, 'devotionals', id), { ...data });
  } catch (error) {
    console.error('updateDevotional error:', error);
    throw error;
  }
}

export async function deleteDevotional(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'devotionals', id));
  } catch (error) {
    console.error('deleteDevotional error:', error);
    throw error;
  }
}

export async function featureDevotional(id: string, featured: boolean): Promise<void> {
  try {
    await updateDoc(doc(db, 'devotionals', id), { isFeatured: featured });
  } catch (error) {
    console.error('featureDevotional error:', error);
    throw error;
  }
}

export async function getAllDevotionalsAdmin(statusFilter?: string): Promise<Devotional[]> {
  try {
    let q;
    if (statusFilter === 'featured') {
      q = query(
        collection(db, 'devotionals'),
        where('isFeatured', '==', true),
        orderBy('publishedAt', 'desc'),
        limit(50)
      );
    } else if (statusFilter === 'daily') {
      q = query(
        collection(db, 'devotionals'),
        where('isDaily', '==', true),
        orderBy('publishedAt', 'desc'),
        limit(50)
      );
    } else {
      q = query(
        collection(db, 'devotionals'),
        orderBy('publishedAt', 'desc'),
        limit(50)
      );
    }
    const snap = await getDocs(q);
    return snap.docs.map((d) => fromDoc<Devotional>(d));
  } catch (error) {
    console.error('getAllDevotionalsAdmin error:', error);
    throw error;
  }
}

// ─── Announcement Management ──────────────────────────────────────────────────

export async function createAnnouncement(
  data: Omit<Announcement, 'id' | 'readByUserIds'>
): Promise<string> {
  try {
    const ref = await addDoc(collection(db, 'announcements'), {
      ...data,
      readByUserIds: [],
      publishedAt: data.publishedAt ?? new Date().toISOString(),
    });
    return ref.id;
  } catch (error) {
    console.error('createAnnouncement error:', error);
    throw error;
  }
}

export async function updateAnnouncement(id: string, data: Partial<Announcement>): Promise<void> {
  try {
    await updateDoc(doc(db, 'announcements', id), { ...data });
  } catch (error) {
    console.error('updateAnnouncement error:', error);
    throw error;
  }
}

export async function deleteAnnouncement(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'announcements', id));
  } catch (error) {
    console.error('deleteAnnouncement error:', error);
    throw error;
  }
}

export async function pinAnnouncement(id: string, pinned: boolean): Promise<void> {
  try {
    await updateDoc(doc(db, 'announcements', id), { isPinned: pinned });
  } catch (error) {
    console.error('pinAnnouncement error:', error);
    throw error;
  }
}

export async function getAllAnnouncementsAdmin(): Promise<Announcement[]> {
  try {
    const q = query(
      collection(db, 'announcements'),
      orderBy('publishedAt', 'desc'),
      limit(50)
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => fromDoc<Announcement>(d));
  } catch (error) {
    console.error('getAllAnnouncementsAdmin error:', error);
    throw error;
  }
}

// ─── Group Management ─────────────────────────────────────────────────────────

export async function createGroup(
  data: Omit<Group, 'id' | 'memberCount'>
): Promise<string> {
  try {
    const ref = await addDoc(collection(db, 'groups'), {
      ...data,
      memberCount: 0,
      createdAt: data.createdAt ?? new Date().toISOString(),
      isActive: true,
    });
    return ref.id;
  } catch (error) {
    console.error('createGroup error:', error);
    throw error;
  }
}

export async function updateGroup(id: string, data: Partial<Group>): Promise<void> {
  try {
    await updateDoc(doc(db, 'groups', id), { ...data });
  } catch (error) {
    console.error('updateGroup error:', error);
    throw error;
  }
}

export async function deleteGroup(id: string): Promise<void> {
  try {
    await updateDoc(doc(db, 'groups', id), { isActive: false });
  } catch (error) {
    console.error('deleteGroup error:', error);
    throw error;
  }
}

export async function assignGroupLeader(groupId: string, userId: string): Promise<void> {
  try {
    const userSnap = await getDoc(doc(db, 'users', userId));
    if (!userSnap.exists()) throw new Error('User not found');
    const userData = userSnap.data() as UserProfile;
    await updateDoc(doc(db, 'groups', groupId), {
      leaderId: userId,
      leader: {
        id: userId,
        name: userData.displayName,
        photoURL: userData.photoURL ?? null,
        title: userData.role,
      },
    });
  } catch (error) {
    console.error('assignGroupLeader error:', error);
    throw error;
  }
}

export async function getAllGroupsAdmin(): Promise<Group[]> {
  try {
    const q = query(
      collection(db, 'groups'),
      orderBy('createdAt', 'desc'),
      limit(50)
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => fromDoc<Group>(d));
  } catch (error) {
    console.error('getAllGroupsAdmin error:', error);
    throw error;
  }
}

// ─── Prayer Moderation ────────────────────────────────────────────────────────

export async function moderatePrayer(
  prayerId: string,
  action: 'approve' | 'remove' | 'feature'
): Promise<void> {
  try {
    const updates: Record<string, unknown> = {
      updatedAt: new Date().toISOString(),
    };
    if (action === 'approve') {
      updates.isPublic = true;
    } else if (action === 'remove') {
      updates.isPublic = false;
      updates.status = 'archived';
    } else if (action === 'feature') {
      updates.isFeatured = true;
    }
    await updateDoc(doc(db, 'prayerRequests', prayerId), updates);
  } catch (error) {
    console.error('moderatePrayer error:', error);
    throw error;
  }
}

export async function markPrayerAnsweredAdmin(prayerId: string, note: string): Promise<void> {
  try {
    await updateDoc(doc(db, 'prayerRequests', prayerId), {
      status: 'answered',
      answeredAt: new Date().toISOString(),
      answeredNote: note,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('markPrayerAnsweredAdmin error:', error);
    throw error;
  }
}

export async function getAllPrayersAdmin(): Promise<PrayerRequest[]> {
  try {
    const q = query(
      collection(db, 'prayerRequests'),
      orderBy('createdAt', 'desc'),
      limit(50)
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => fromDoc<PrayerRequest>(d));
  } catch (error) {
    console.error('getAllPrayersAdmin error:', error);
    throw error;
  }
}

// ─── Analytics / Dashboard ────────────────────────────────────────────────────

export async function getDashboardStats(): Promise<{
  totalUsers: number;
  activeToday: number;
  newThisWeek: number;
  totalDonationsMonth: number;
  devotionalPlaysWeek: number;
  prayerRequestsWeek: number;
}> {
  try {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - 7);
    startOfWeek.setHours(0, 0, 0, 0);

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);

    const weekIso = startOfWeek.toISOString();
    const monthIso = startOfMonth.toISOString();
    const todayIso = startOfToday.toISOString();

    // Total users
    const usersSnap = await getCountFromServer(collection(db, 'users'));
    const totalUsers = usersSnap.data().count;

    // Active today
    const activeTodaySnap = await getCountFromServer(
      query(collection(db, 'users'), where('lastActiveAt', '>=', todayIso))
    );
    const activeToday = activeTodaySnap.data().count;

    // New this week
    const newThisWeekSnap = await getCountFromServer(
      query(collection(db, 'users'), where('joinedAt', '>=', weekIso))
    );
    const newThisWeek = newThisWeekSnap.data().count;

    // Donations this month
    const donationsSnap = await getDocs(
      query(
        collection(db, 'donations'),
        where('createdAt', '>=', monthIso),
        where('status', '==', 'completed')
      )
    );
    const totalDonationsMonth = donationsSnap.docs.reduce(
      (sum, d) => sum + ((d.data().amount as number) ?? 0),
      0
    );

    // Devotional plays this week (from listenedRecords)
    const playsSnap = await getCountFromServer(
      query(
        collection(db, 'listenedRecords'),
        where('listenedAt', '>=', weekIso),
        where('completed', '==', true)
      )
    );
    const devotionalPlaysWeek = playsSnap.data().count;

    // Prayer requests this week
    const prayersSnap = await getCountFromServer(
      query(
        collection(db, 'prayerRequests'),
        where('createdAt', '>=', weekIso)
      )
    );
    const prayerRequestsWeek = prayersSnap.data().count;

    return {
      totalUsers,
      activeToday,
      newThisWeek,
      totalDonationsMonth,
      devotionalPlaysWeek,
      prayerRequestsWeek,
    };
  } catch (error) {
    console.error('getDashboardStats error:', error);
    // Return fallback data so dashboard still renders
    return {
      totalUsers: 0,
      activeToday: 0,
      newThisWeek: 0,
      totalDonationsMonth: 0,
      devotionalPlaysWeek: 0,
      prayerRequestsWeek: 0,
    };
  }
}

export async function getGivingReport(
  startDate: Date,
  endDate: Date
): Promise<{
  total: number;
  byCategory: Record<string, number>;
  transactions: Donation[];
}> {
  try {
    const q = query(
      collection(db, 'donations'),
      where('createdAt', '>=', startDate.toISOString()),
      where('createdAt', '<=', endDate.toISOString()),
      where('status', '==', 'completed'),
      orderBy('createdAt', 'desc'),
      limit(200)
    );
    const snap = await getDocs(q);
    const transactions = snap.docs.map((d) => fromDoc<Donation>(d));

    let total = 0;
    const byCategory: Record<string, number> = {};
    for (const donation of transactions) {
      total += donation.amount;
      byCategory[donation.type] = (byCategory[donation.type] ?? 0) + donation.amount;
    }

    return { total, byCategory, transactions };
  } catch (error) {
    console.error('getGivingReport error:', error);
    throw error;
  }
}

// ─── Church Settings ──────────────────────────────────────────────────────────

export async function getChurchSettings(): Promise<Record<string, unknown>> {
  try {
    const snap = await getDoc(doc(db, 'churchSettings', 'main'));
    if (!snap.exists()) return {};
    return snap.data() as Record<string, unknown>;
  } catch (error) {
    console.error('getChurchSettings error:', error);
    throw error;
  }
}

export async function updateChurchSettings(settings: Record<string, unknown>): Promise<void> {
  try {
    await setDoc(doc(db, 'churchSettings', 'main'), settings, { merge: true });
  } catch (error) {
    console.error('updateChurchSettings error:', error);
    throw error;
  }
}

// ─── Recent Activity Feed ─────────────────────────────────────────────────────

export interface ActivityItem {
  id: string;
  type: 'user_joined' | 'devotional_published' | 'prayer_answered' | 'donation_received';
  title: string;
  subtitle: string;
  timestamp: string;
}

export async function getRecentActivity(count = 10): Promise<ActivityItem[]> {
  try {
    const activities: ActivityItem[] = [];

    // Recent users
    const usersQ = query(
      collection(db, 'users'),
      orderBy('joinedAt', 'desc'),
      limit(3)
    );
    const usersSnap = await getDocs(usersQ);
    usersSnap.docs.forEach((d) => {
      const u = d.data() as UserProfile;
      activities.push({
        id: `user_${d.id}`,
        type: 'user_joined',
        title: 'New member joined',
        subtitle: u.displayName ?? u.email,
        timestamp: u.joinedAt as string,
      });
    });

    // Recent donations
    const donationsQ = query(
      collection(db, 'donations'),
      where('status', '==', 'completed'),
      orderBy('createdAt', 'desc'),
      limit(3)
    );
    const donationsSnap = await getDocs(donationsQ);
    donationsSnap.docs.forEach((d) => {
      const donation = d.data() as Donation;
      activities.push({
        id: `donation_${d.id}`,
        type: 'donation_received',
        title: 'Donation received',
        subtitle: `${donation.currency} ${donation.amount.toLocaleString()} · ${donation.type}`,
        timestamp: donation.createdAt as string,
      });
    });

    // Recent answered prayers
    const answeredQ = query(
      collection(db, 'prayerRequests'),
      where('status', '==', 'answered'),
      orderBy('answeredAt', 'desc'),
      limit(2)
    );
    const answeredSnap = await getDocs(answeredQ);
    answeredSnap.docs.forEach((d) => {
      const p = d.data() as PrayerRequest;
      activities.push({
        id: `prayer_${d.id}`,
        type: 'prayer_answered',
        title: 'Prayer answered',
        subtitle: p.title,
        timestamp: p.answeredAt as string,
      });
    });

    // Sort by timestamp descending
    activities.sort((a, b) => {
      const ta = a.timestamp ? new Date(a.timestamp).getTime() : 0;
      const tb = b.timestamp ? new Date(b.timestamp).getTime() : 0;
      return tb - ta;
    });

    return activities.slice(0, count);
  } catch (error) {
    console.error('getRecentActivity error:', error);
    return [];
  }
}
