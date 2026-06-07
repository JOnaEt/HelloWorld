import { getAnalytics, logEvent as firebaseLogEvent, setUserId } from 'firebase/analytics';
import { getApp } from 'firebase/app';

let _analytics: ReturnType<typeof getAnalytics> | null = null;

function getAnalyticsInstance() {
  if (!_analytics) {
    try {
      _analytics = getAnalytics(getApp());
    } catch {
      return null;
    }
  }
  return _analytics;
}

export function analyticsSetUser(uid: string) {
  try {
    const a = getAnalyticsInstance();
    if (a) setUserId(a, uid);
  } catch {}
}

export function trackEvent(name: string, params?: Record<string, string | number | boolean>) {
  try {
    const a = getAnalyticsInstance();
    if (a) firebaseLogEvent(a, name, params);
  } catch {}
}

// ── Named event helpers ───────────────────────────────────────────────────────

export const Analytics = {
  login: () => trackEvent('login', { method: 'email' }),

  signUp: () => trackEvent('sign_up', { method: 'email' }),

  onboardingCompleted: (interestCount: number) =>
    trackEvent('onboarding_completed', { interest_count: interestCount }),

  devotionalOpened: (id: string, category: string) =>
    trackEvent('devotional_opened', { devotional_id: id, category }),

  devotionalPlayStarted: (id: string, title: string) =>
    trackEvent('devotional_play_started', { devotional_id: id, title }),

  devotionalPlayCompleted: (id: string) =>
    trackEvent('devotional_completed', { devotional_id: id }),

  devotionalShared: (id: string) =>
    trackEvent('devotional_shared', { devotional_id: id }),

  bibleReadingCompleted: (planId: string, day: number) =>
    trackEvent('bible_reading_completed', { plan_id: planId, day }),

  streakMilestone: (days: number) =>
    trackEvent('streak_milestone', { days }),

  prayerSubmitted: (category: string, isAnonymous: boolean) =>
    trackEvent('prayer_submitted', { category, is_anonymous: isAnonymous }),

  prayerReaction: (prayerId: string) =>
    trackEvent('prayer_reaction', { prayer_id: prayerId }),

  groupJoined: (groupId: string, category: string) =>
    trackEvent('group_joined', { group_id: groupId, category }),

  givingCompleted: (type: string, amount: number) =>
    trackEvent('donation_completed', { type, amount, currency: 'ETB' }),

  givingInitiated: (type: string) =>
    trackEvent('donation_initiated', { type }),

  announcementOpened: (id: string, type: string) =>
    trackEvent('announcement_opened', { announcement_id: id, type }),

  adminActionTaken: (action: string, module: string) =>
    trackEvent('admin_action', { action, module }),
};
