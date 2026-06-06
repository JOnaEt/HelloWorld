import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { NotificationPreferences } from '../types';

// ─── Configuration ────────────────────────────────────────────────────────────

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// ─── Permissions ──────────────────────────────────────────────────────────────

export async function requestNotificationPermissions(): Promise<boolean> {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#16A34A',
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  return finalStatus === 'granted';
}

export async function getExpoPushToken(): Promise<string | null> {
  try {
    const token = await Notifications.getExpoPushTokenAsync({
      projectId: 'topic-digital-church-app',
    });
    return token.data;
  } catch {
    return null;
  }
}

// ─── Schedule Notifications ───────────────────────────────────────────────────

export async function scheduleDailyDevotional(
  time: string // "07:00"
): Promise<string> {
  const [hour, minute] = time.split(':').map(Number);

  // Cancel existing daily devotional notifications
  await cancelDailyDevotional();

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Daily Devotional Ready',
      body: "Your morning devotional is waiting. Start your day with God's Word.",
      sound: 'default',
      data: { type: 'devotional', screen: '/(tabs)/' },
    },
    trigger: {
      hour,
      minute,
      repeats: true,
    },
  });

  return id;
}

export async function cancelDailyDevotional(): Promise<void> {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  for (const notif of scheduled) {
    if (notif.content.data?.type === 'devotional') {
      await Notifications.cancelScheduledNotificationAsync(notif.identifier);
    }
  }
}

export async function scheduleStreakReminder(
  hour = 20,
  minute = 0
): Promise<string> {
  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: "Don't Break Your Streak!",
      body: "You haven't read today's devotional yet. Keep your streak alive!",
      sound: 'default',
      data: { type: 'streak', screen: '/(tabs)/' },
    },
    trigger: {
      hour,
      minute,
      repeats: true,
    },
  });
  return id;
}

// ─── Immediate Notifications ──────────────────────────────────────────────────

export async function sendLocalNotification(
  title: string,
  body: string,
  data?: Record<string, string>
): Promise<string> {
  return Notifications.scheduleNotificationAsync({
    content: { title, body, sound: 'default', data },
    trigger: null,
  });
}

export async function sendPrayerResponseNotification(
  prayerTitle: string
): Promise<void> {
  await sendLocalNotification(
    'Someone prayed for you!',
    `A member of your community prayed for "${prayerTitle}"`,
    { type: 'prayer_response', screen: '/prayer' }
  );
}

export async function sendGroupUpdateNotification(
  groupName: string,
  message: string
): Promise<void> {
  await sendLocalNotification(
    `${groupName} Update`,
    message,
    { type: 'group_update', screen: '/groups' }
  );
}

// ─── Update Preferences ───────────────────────────────────────────────────────

export async function applyNotificationPreferences(
  prefs: NotificationPreferences
): Promise<void> {
  // Cancel all scheduled notifications first
  await Notifications.cancelAllScheduledNotificationsAsync();

  if (prefs.dailyDevotional) {
    await scheduleDailyDevotional(prefs.dailyDevotionalTime);
  }

  if (prefs.prayerReminders) {
    await scheduleStreakReminder(20, 0);
  }
}

// ─── Badge ────────────────────────────────────────────────────────────────────

export async function setBadgeCount(count: number): Promise<void> {
  await Notifications.setBadgeCountAsync(count);
}

export async function clearBadge(): Promise<void> {
  await Notifications.setBadgeCountAsync(0);
}
