import { Platform } from 'react-native';

let _analytics: any = null;

function getAnalyticsInstance() {
  if (Platform.OS !== 'web') return null;
  if (_analytics) return _analytics;
  try {
    const { getAnalytics } = require('firebase/analytics');
    const { getApp } = require('firebase/app');
    _analytics = getAnalytics(getApp());
  } catch {
    return null;
  }
  return _analytics;
}

function logEvent(name: string, params?: Record<string, string | number | boolean>) {
  try {
    const a = getAnalyticsInstance();
    if (!a) return;
    const { logEvent: firebaseLogEvent } = require('firebase/analytics');
    firebaseLogEvent(a, name, params);
  } catch {}
}

export function analyticsSetUser(uid: string) {
  try {
    const a = getAnalyticsInstance();
    if (!a) return;
    const { setUserId } = require('firebase/analytics');
    setUserId(a, uid);
  } catch {}
}

export function trackEvent(name: string, params?: Record<string, string | number | boolean>) {
  logEvent(name, params);
}

export const Analytics = {
  login: () => logEvent('login', { method: 'email' }),
  signUp: () => logEvent('sign_up', { method: 'email' }),
  onboardingCompleted: (interestCount: number) =>
    logEvent('onboarding_completed', { interest_count: interestCount }),
  devotionalOpened: (id: string, category: string) =>
    logEvent('devotional_opened', { devotional_id: id, category }),
  devotionalPlayStarted: (id: string, title: string) =>
    logEvent('devotional_play_started', { devotional_id: id, title }),
  devotionalPlayCompleted: (id: string) =>
    logEvent('devotional_completed', { devotional_id: id }),
  devotionalShared: (id: string) =>
    logEvent('devotional_shared', { devotional_id: id }),
  bibleReadingCompleted: (planId: string, day: number) =>
    logEvent('bible_reading_completed', { plan_id: planId, day }),
  streakMilestone: (days: number) =>
    logEvent('streak_milestone', { days }),
  prayerSubmitted: (category: string, isAnonymous: boolean) =>
    logEvent('prayer_submitted', { category, is_anonymous: isAnonymous }),
  prayerReaction: (prayerId: string) =>
    logEvent('prayer_reaction', { prayer_id: prayerId }),
  groupJoined: (groupId: string, category: string) =>
    logEvent('group_joined', { group_id: groupId, category }),
  givingCompleted: (type: string, amount: number) =>
    logEvent('donation_completed', { type, amount, currency: 'ETB' }),
  givingInitiated: (type: string) =>
    logEvent('donation_initiated', { type }),
  announcementOpened: (id: string, type: string) =>
    logEvent('announcement_opened', { announcement_id: id, type }),
  adminActionTaken: (action: string, module: string) =>
    logEvent('admin_action', { action, module }),
};
