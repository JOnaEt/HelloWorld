import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged,
  User,
  UserCredential,
} from 'firebase/auth';
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { auth, db } from './config';
import { UserProfile, UserRole } from '../../types';

// ─── Sign Up ──────────────────────────────────────────────────────────────────

export async function signUp(
  email: string,
  password: string,
  displayName: string,
  phoneNumber?: string
): Promise<UserProfile> {
  const credential: UserCredential = await createUserWithEmailAndPassword(
    auth,
    email,
    password
  );

  const { user } = credential;

  // Update display name
  await updateProfile(user, { displayName });

  // Create user profile in Firestore
  const profile: UserProfile = {
    id: user.uid,
    uid: user.uid,
    email: user.email ?? email,
    displayName,
    phoneNumber: phoneNumber ?? '',
    role: 'member' as UserRole,
    joinedAt: new Date().toISOString(),
    lastActiveAt: new Date().toISOString(),
    interests: [],
    groupIds: [],
    spiritualGrowthScore: 0,
    isOnboarded: false,
    notificationPreferences: {
      dailyDevotional: true,
      dailyDevotionalTime: '07:00',
      prayerReminders: true,
      groupUpdates: true,
      announcements: true,
      givingReminders: false,
    },
    stats: {
      totalDevotionalsRead: 0,
      totalDevotionalsListened: 0,
      totalPrayersSubmitted: 0,
      totalPrayersAnswered: 0,
      currentStreak: 0,
      longestStreak: 0,
      totalGroupsJoined: 0,
      totalBibleReadings: 0,
      totalDonations: 0,
      joinedAt: new Date().toISOString(),
    },
  };

  await setDoc(doc(db, 'users', user.uid), profile);

  return profile;
}

// ─── Sign In ──────────────────────────────────────────────────────────────────

export async function signIn(
  email: string,
  password: string
): Promise<UserProfile> {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  const { user } = credential;

  let profile = await getUserProfile(user.uid);

  if (!profile) {
    // Profile missing — create a minimal one so the user can continue
    profile = {
      id: user.uid,
      uid: user.uid,
      email: user.email ?? email,
      displayName: user.displayName ?? email.split('@')[0],
      phoneNumber: '',
      role: 'member' as UserRole,
      joinedAt: new Date().toISOString(),
      lastActiveAt: new Date().toISOString(),
      interests: [],
      groupIds: [],
      spiritualGrowthScore: 0,
      isOnboarded: false,
      notificationPreferences: {
        dailyDevotional: true,
        dailyDevotionalTime: '07:00',
        prayerReminders: true,
        groupUpdates: true,
        announcements: true,
        givingReminders: false,
      },
      stats: {
        totalDevotionalsRead: 0,
        totalDevotionalsListened: 0,
        totalPrayersSubmitted: 0,
        totalPrayersAnswered: 0,
        currentStreak: 0,
        longestStreak: 0,
        totalGroupsJoined: 0,
        totalBibleReadings: 0,
        totalDonations: 0,
        joinedAt: new Date().toISOString(),
      },
    };
    await setDoc(doc(db, 'users', user.uid), profile);
  } else {
    await updateDoc(doc(db, 'users', user.uid), {
      lastActiveAt: new Date().toISOString(),
    });
  }

  return profile;
}

// ─── Sign Out ─────────────────────────────────────────────────────────────────

export async function signOut(): Promise<void> {
  await firebaseSignOut(auth);
}

// ─── Password Reset ───────────────────────────────────────────────────────────

export async function resetPassword(email: string): Promise<void> {
  await sendPasswordResetEmail(auth, email);
}

// ─── Profile ──────────────────────────────────────────────────────────────────

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(doc(db, 'users', uid));
  if (!snap.exists()) return null;
  return snap.data() as UserProfile;
}

export async function updateUserProfile(
  uid: string,
  updates: Partial<UserProfile>
): Promise<void> {
  await updateDoc(doc(db, 'users', uid), {
    ...updates,
    lastActiveAt: new Date().toISOString(),
  });
}

export async function updateInterests(
  uid: string,
  interests: string[]
): Promise<void> {
  await updateDoc(doc(db, 'users', uid), { interests });
}

export async function completeOnboarding(uid: string): Promise<void> {
  await updateDoc(doc(db, 'users', uid), { isOnboarded: true });
}

// ─── Auth State ───────────────────────────────────────────────────────────────

export function subscribeToAuthState(
  callback: (user: User | null) => void
): () => void {
  return onAuthStateChanged(auth, callback);
}

export function getCurrentFirebaseUser(): User | null {
  return auth.currentUser;
}
