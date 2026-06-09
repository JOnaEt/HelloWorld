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
  arrayUnion,
  arrayRemove,
  increment,
  setDoc,
  DocumentSnapshot,
  QueryDocumentSnapshot,
} from 'firebase/firestore';
import { db } from './config';
import { Group, GroupMember, GroupCategory, GroupAttendance } from '../../types';

const GROUPS = 'groups';
const MEMBERS = 'groupMembers';
const ATTENDANCE = 'groupAttendance';

function fromDoc(snap: DocumentSnapshot | QueryDocumentSnapshot): Group {
  return { id: snap.id, ...snap.data() } as Group;
}

// ─── Read Groups ──────────────────────────────────────────────────────────────

export async function getAllGroups(count = 30): Promise<Group[]> {
  const q = query(
    collection(db, GROUPS),
    where('isActive', '==', true),
    orderBy('memberCount', 'desc'),
    limit(count)
  );
  const snap = await getDocs(q);
  return snap.docs.map(fromDoc);
}

export async function getGroupsByCategory(
  category: GroupCategory
): Promise<Group[]> {
  const q = query(
    collection(db, GROUPS),
    where('category', '==', category),
    where('isActive', '==', true),
    orderBy('memberCount', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map(fromDoc);
}

export async function getGroupById(id: string): Promise<Group | null> {
  const snap = await getDoc(doc(db, GROUPS, id));
  if (!snap.exists()) return null;
  return fromDoc(snap);
}

export async function getUserGroups(userId: string): Promise<Group[]> {
  const q = query(
    collection(db, GROUPS),
    where('memberIds', 'array-contains', userId),
    where('isActive', '==', true)
  );
  const snap = await getDocs(q);
  return snap.docs.map(fromDoc);
}

export async function getFeaturedGroups(count = 5): Promise<Group[]> {
  const q = query(
    collection(db, GROUPS),
    where('isActive', '==', true),
    orderBy('memberCount', 'desc'),
    limit(count)
  );
  const snap = await getDocs(q);
  return snap.docs.map(fromDoc);
}

// ─── Group Members ────────────────────────────────────────────────────────────

export async function getGroupMembers(groupId: string): Promise<GroupMember[]> {
  const q = query(
    collection(db, MEMBERS),
    where('groupId', '==', groupId)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as GroupMember));
}

export async function joinGroup(
  groupId: string,
  userId: string,
  userProfile: Partial<import('../../types').UserProfile>
): Promise<void> {
  const memberId = `${groupId}_${userId}`;
  const member: GroupMember = {
    id: memberId,
    userId,
    groupId,
    role: 'member',
    joinedAt: new Date().toISOString(),
    profile: userProfile,
  };

  await setDoc(doc(db, MEMBERS, memberId), member);
  await updateDoc(doc(db, GROUPS, groupId), {
    memberCount: increment(1),
    memberIds: arrayUnion(userId),
  });
  await updateDoc(doc(db, 'users', userId), {
    groupIds: arrayUnion(groupId),
    'stats.totalGroupsJoined': increment(1),
  });
}

export async function leaveGroup(
  groupId: string,
  userId: string
): Promise<void> {
  const memberId = `${groupId}_${userId}`;
  await deleteDoc(doc(db, MEMBERS, memberId));
  await updateDoc(doc(db, GROUPS, groupId), {
    memberCount: increment(-1),
    memberIds: arrayRemove(userId),
  });
  await updateDoc(doc(db, 'users', userId), {
    groupIds: arrayRemove(groupId),
  });
}

export async function isGroupMember(
  groupId: string,
  userId: string
): Promise<boolean> {
  const snap = await getDoc(doc(db, MEMBERS, `${groupId}_${userId}`));
  return snap.exists();
}

// ─── Create / Update Groups ───────────────────────────────────────────────────

export async function createGroup(
  groupData: Omit<Group, 'id'>
): Promise<string> {
  const ref = await addDoc(collection(db, GROUPS), {
    ...groupData,
    createdAt: new Date().toISOString(),
    memberCount: 1,
    isActive: true,
  });
  return ref.id;
}

export async function updateGroup(
  groupId: string,
  updates: Partial<Group>
): Promise<void> {
  await updateDoc(doc(db, GROUPS, groupId), updates);
}

// ─── Attendance ───────────────────────────────────────────────────────────────

export async function recordAttendance(
  attendance: Omit<GroupAttendance, 'id'>
): Promise<void> {
  const id = `${attendance.groupId}_${attendance.date}`;
  await setDoc(doc(db, ATTENDANCE, id), { ...attendance, id });
}

export async function getAttendanceHistory(
  groupId: string,
  count = 10
): Promise<GroupAttendance[]> {
  const q = query(
    collection(db, ATTENDANCE),
    where('groupId', '==', groupId),
    orderBy('date', 'desc'),
    limit(count)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as GroupAttendance);
}
