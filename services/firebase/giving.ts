import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  increment,
  DocumentSnapshot,
  QueryDocumentSnapshot,
} from 'firebase/firestore';
import { db } from './config';
import { Donation, DonationType, DonationStatus, GivingSummary, GivingCategory } from '../../types';

const DONATIONS = 'donations';

function fromDoc(snap: DocumentSnapshot | QueryDocumentSnapshot): Donation {
  return { id: snap.id, ...snap.data() } as Donation;
}

// ─── Giving Categories ────────────────────────────────────────────────────────

export const GIVING_CATEGORIES: GivingCategory[] = [
  {
    id: 'tithe',
    label: 'Tithe',
    description: 'Return 10% of your income as an act of worship',
    icon: 'heart',
    color: '#16A34A',
  },
  {
    id: 'offering',
    label: 'Offering',
    description: 'Give above your tithe as an offering to God',
    icon: 'gift',
    color: '#15803D',
  },
  {
    id: 'building-fund',
    label: 'Building Fund',
    description: 'Contribute to church facilities and expansion',
    icon: 'home',
    color: '#0EA5E9',
    targetAmount: 500000,
    raisedAmount: 287500,
  },
  {
    id: 'missions',
    label: 'Missions',
    description: 'Support our missionary teams around the world',
    icon: 'globe',
    color: '#8B5CF6',
    targetAmount: 100000,
    raisedAmount: 45200,
  },
  {
    id: 'special',
    label: 'Special Giving',
    description: 'Contribute to special church projects and events',
    icon: 'star',
    color: '#F59E0B',
  },
  {
    id: 'benevolence',
    label: 'Benevolence',
    description: 'Help members and community in times of need',
    icon: 'people',
    color: '#EF4444',
  },
];

// ─── Submit Donation ──────────────────────────────────────────────────────────

export async function submitDonation(
  donation: Omit<Donation, 'id' | 'status' | 'createdAt'>
): Promise<string> {
  const now = new Date().toISOString();
  const ref = await addDoc(collection(db, DONATIONS), {
    ...donation,
    status: 'completed' as DonationStatus,
    createdAt: now,
    processedAt: now,
  });

  // Update user stats
  await updateDoc(doc(db, 'users', donation.userId), {
    'stats.totalDonations': increment(donation.amount),
  });

  return ref.id;
}

// ─── Get Donation History ─────────────────────────────────────────────────────

export async function getDonationHistory(
  userId: string,
  pageSize = 20
): Promise<Donation[]> {
  const q = query(
    collection(db, DONATIONS),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
    limit(pageSize)
  );
  const snap = await getDocs(q);
  return snap.docs.map(fromDoc);
}

export async function getDonationsByType(
  userId: string,
  type: DonationType
): Promise<Donation[]> {
  const q = query(
    collection(db, DONATIONS),
    where('userId', '==', userId),
    where('type', '==', type),
    orderBy('createdAt', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map(fromDoc);
}

// ─── Giving Summary ───────────────────────────────────────────────────────────

export async function getGivingSummary(userId: string): Promise<GivingSummary> {
  const allDonations = await getDonationHistory(userId, 100);

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  let monthlyTotal = 0;
  let yearlyTotal = 0;
  let totalGiven = 0;
  let lastGiftDate: string | undefined;
  let lastGiftAmount: number | undefined;

  allDonations.forEach((d) => {
    const date = new Date(d.createdAt as string);
    totalGiven += d.amount;

    if (date.getFullYear() === currentYear) {
      yearlyTotal += d.amount;
      if (date.getMonth() === currentMonth) {
        monthlyTotal += d.amount;
      }
    }
  });

  if (allDonations.length > 0) {
    lastGiftDate = allDonations[0].createdAt as string;
    lastGiftAmount = allDonations[0].amount;
  }

  return {
    userId,
    totalGiven,
    monthlyTotal,
    yearlyTotal,
    lastGiftDate,
    lastGiftAmount,
    currency: 'USD',
  };
}
