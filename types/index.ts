// ─── User & Auth ────────────────────────────────────────────────────────────

export type UserRole = 'member' | 'leader' | 'pastor' | 'admin';

export interface UserProfile {
  id: string;
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  phoneNumber?: string;
  role: UserRole;
  bio?: string;
  location?: string;
  joinedAt: Date | string;
  lastActiveAt: Date | string;
  interests: string[];
  groupIds: string[];
  notificationPreferences: NotificationPreferences;
  spiritualGrowthScore: number;
  stats: UserStats;
  isOnboarded: boolean;
}

export interface UserStats {
  totalDevotionalsRead: number;
  totalDevotionalsListened: number;
  totalPrayersSubmitted: number;
  totalPrayersAnswered: number;
  currentStreak: number;
  longestStreak: number;
  totalGroupsJoined: number;
  totalBibleReadings: number;
  totalDonations: number;
  joinedAt: Date | string;
}

export interface NotificationPreferences {
  dailyDevotional: boolean;
  dailyDevotionalTime: string; // "07:00"
  prayerReminders: boolean;
  groupUpdates: boolean;
  announcements: boolean;
  givingReminders: boolean;
}

// ─── Devotional ─────────────────────────────────────────────────────────────

export type DevotionalCategory =
  | 'faith'
  | 'prayer'
  | 'worship'
  | 'leadership'
  | 'family'
  | 'evangelism'
  | 'healing'
  | 'prophetic'
  | 'discipleship'
  | 'missions';

export interface Devotional {
  id: string;
  title: string;
  subtitle?: string;
  scripture: ScriptureReference;
  content: string;
  audioUrl?: string;
  audioDuration?: number; // seconds
  thumbnailUrl?: string;
  coverUrl?: string;
  category: DevotionalCategory;
  author: AuthorInfo;
  publishedAt: Date | string;
  isFeatured: boolean;
  isDaily: boolean;
  dailyDate?: string; // YYYY-MM-DD
  tags: string[];
  listenCount: number;
  readCount: number;
  shareCount: number;
  reflectionPrompts: string[];
  prayer?: string;
}

export interface ScriptureReference {
  book: string;
  chapter: number;
  verses: string; // "1-5" or "3"
  text: string;
  translation: string; // "NIV", "KJV", etc.
}

export interface AuthorInfo {
  id: string;
  name: string;
  title?: string;
  photoURL?: string;
}

export interface ListenedRecord {
  devotionalId: string;
  userId: string;
  listenedAt: Date | string;
  progress: number; // 0-1
  completed: boolean;
}

// ─── Groups ─────────────────────────────────────────────────────────────────

export type GroupCategory =
  | 'bible-study'
  | 'prayer'
  | 'youth'
  | 'women'
  | 'men'
  | 'couples'
  | 'singles'
  | 'worship'
  | 'outreach'
  | 'leadership';

export type GroupRole = 'member' | 'co-leader' | 'leader';

export interface Group {
  id: string;
  name: string;
  description: string;
  category: GroupCategory;
  coverUrl?: string;
  leaderId: string;
  leader: AuthorInfo;
  coLeaderIds: string[];
  memberCount: number;
  maxMembers?: number;
  isPrivate: boolean;
  meetingSchedule: MeetingSchedule;
  location?: string;
  isOnline: boolean;
  meetingUrl?: string;
  createdAt: Date | string;
  tags: string[];
  announcementsEnabled: boolean;
  prayerEnabled: boolean;
  isActive: boolean;
}

export interface GroupMember {
  id: string;
  userId: string;
  groupId: string;
  role: GroupRole;
  joinedAt: Date | string;
  profile: Partial<UserProfile>;
  attendanceRate?: number;
}

export interface MeetingSchedule {
  frequency: 'weekly' | 'biweekly' | 'monthly' | 'custom';
  dayOfWeek?: string; // "Sunday", "Monday", etc.
  time: string; // "18:00"
  timezone: string;
  nextMeeting?: Date | string;
}

export interface GroupAttendance {
  id: string;
  groupId: string;
  date: string; // YYYY-MM-DD
  presentMemberIds: string[];
  absentMemberIds: string[];
  notes?: string;
  recordedBy: string;
}

// ─── Prayer ──────────────────────────────────────────────────────────────────

export type PrayerCategory =
  | 'healing'
  | 'provision'
  | 'guidance'
  | 'family'
  | 'salvation'
  | 'protection'
  | 'thanksgiving'
  | 'intercession'
  | 'breakthrough'
  | 'other';

export type PrayerStatus = 'active' | 'answered' | 'archived';

export interface PrayerRequest {
  id: string;
  userId: string;
  userProfile: Partial<UserProfile>;
  title: string;
  content: string;
  category: PrayerCategory;
  status: PrayerStatus;
  isAnonymous: boolean;
  isPublic: boolean;
  groupId?: string;
  prayerCount: number;
  reactedUserIds: string[];
  createdAt: Date | string;
  updatedAt: Date | string;
  answeredAt?: Date | string;
  answeredNote?: string;
}

export interface PrayerReaction {
  id: string;
  prayerRequestId: string;
  userId: string;
  type: 'praying' | 'amen' | 'heart';
  createdAt: Date | string;
}

// ─── Bible Reading ────────────────────────────────────────────────────────────

export interface BibleReadingPlan {
  id: string;
  title: string;
  description: string;
  coverUrl?: string;
  durationDays: number;
  category: string;
  author?: string;
  readings: DailyReading[];
  enrolledCount: number;
  completionRate: number;
}

export interface DailyReading {
  day: number;
  date?: string;
  passages: ScriptureReference[];
  notes?: string;
  estimated_minutes: number;
}

export interface ReadingStreak {
  userId: string;
  currentStreak: number;
  longestStreak: number;
  lastReadDate: string; // YYYY-MM-DD
  totalDaysRead: number;
  activePlanId?: string;
  completedPlanIds: string[];
  milestones: StreakMilestone[];
}

export interface StreakMilestone {
  days: number;
  achievedAt: Date | string;
  badge: string;
}

// ─── Announcements ────────────────────────────────────────────────────────────

export type AnnouncementType = 'event' | 'service' | 'news' | 'alert' | 'giving';
export type AnnouncementPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Announcement {
  id: string;
  title: string;
  content: string;
  type: AnnouncementType;
  priority: AnnouncementPriority;
  imageUrl?: string;
  publishedAt: Date | string;
  expiresAt?: Date | string;
  author: AuthorInfo;
  actionUrl?: string;
  actionLabel?: string;
  targetGroups?: string[]; // group IDs, empty = all
  readByUserIds: string[];
  isPinned: boolean;
  tags: string[];
}

// ─── Giving / Donations ───────────────────────────────────────────────────────

export type DonationType =
  | 'tithe'
  | 'offering'
  | 'building-fund'
  | 'missions'
  | 'special'
  | 'benevolence';

export type DonationStatus = 'pending' | 'completed' | 'failed' | 'refunded';

export interface Donation {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  type: DonationType;
  status: DonationStatus;
  transactionId?: string;
  note?: string;
  isAnonymous: boolean;
  createdAt: Date | string;
  processedAt?: Date | string;
}

export interface GivingCategory {
  id: DonationType;
  label: string;
  description: string;
  icon: string;
  targetAmount?: number;
  raisedAmount?: number;
  color: string;
}

export interface GivingSummary {
  userId: string;
  totalGiven: number;
  monthlyTotal: number;
  yearlyTotal: number;
  lastGiftDate?: Date | string;
  lastGiftAmount?: number;
  currency: string;
}

// ─── Notifications ────────────────────────────────────────────────────────────

export type NotificationType =
  | 'devotional'
  | 'prayer_response'
  | 'group_update'
  | 'announcement'
  | 'streak_reminder'
  | 'event_reminder'
  | 'giving';

export interface AppNotification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  data?: Record<string, string>;
  isRead: boolean;
  createdAt: Date | string;
  scheduledFor?: Date | string;
}

// ─── Navigation ──────────────────────────────────────────────────────────────

export interface TabBarBadge {
  count: number;
  visible: boolean;
}

// ─── API / Store ──────────────────────────────────────────────────────────────

export interface LoadingState {
  isLoading: boolean;
  error: string | null;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  hasMore: boolean;
  lastCursor?: string;
}
