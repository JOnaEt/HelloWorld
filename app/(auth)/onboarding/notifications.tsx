import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../constants/colors';
import { FontSizes, FontWeights } from '../../../constants/fonts';
import { BorderRadius, Spacing, Shadows } from '../../../constants/layout';
import { Button } from '../../../components/ui/Button';
import { useAuth } from '../../../hooks/useAuth';
import { requestNotificationPermissions } from '../../../services/notifications';
import { NotificationPreferences } from '../../../types';

const TIME_OPTIONS = ['6:00 AM', '7:00 AM', '8:00 AM', '9:00 AM', '12:00 PM', '6:00 PM', '8:00 PM', '9:00 PM'];

export default function NotificationsScreen() {
  const { updateProfile, isLoading } = useAuth();

  const [prefs, setPrefs] = useState<NotificationPreferences>({
    dailyDevotional: true,
    dailyDevotionalTime: '07:00',
    prayerReminders: true,
    groupUpdates: true,
    announcements: true,
    givingReminders: false,
  });

  const [selectedTime, setSelectedTime] = useState('7:00 AM');
  const [showTimePicker, setShowTimePicker] = useState(false);

  const togglePref = (key: keyof NotificationPreferences) => {
    if (key === 'dailyDevotionalTime') return;
    setPrefs((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleContinue = async () => {
    await requestNotificationPermissions();
    await updateProfile({ notificationPreferences: prefs });
    router.push('/(auth)/onboarding/groups');
  };

  const settings = [
    {
      key: 'dailyDevotional' as keyof NotificationPreferences,
      icon: 'book-outline',
      iconColor: Colors.primary,
      iconBg: Colors.light,
      title: 'Daily Devotional',
      desc: 'Receive your daily devotional reminder',
    },
    {
      key: 'prayerReminders' as keyof NotificationPreferences,
      icon: 'hand-right-outline',
      iconColor: '#8B5CF6',
      iconBg: '#EDE9FE',
      title: 'Prayer Reminders',
      desc: 'Stay consistent in your prayer life',
    },
    {
      key: 'groupUpdates' as keyof NotificationPreferences,
      icon: 'people-outline',
      iconColor: '#0EA5E9',
      iconBg: '#E0F2FE',
      title: 'Group Updates',
      desc: 'Notifications from your groups',
    },
    {
      key: 'announcements' as keyof NotificationPreferences,
      icon: 'megaphone-outline',
      iconColor: '#F59E0B',
      iconBg: '#FEF3C7',
      title: 'Announcements',
      desc: 'Church news and events',
    },
    {
      key: 'givingReminders' as keyof NotificationPreferences,
      icon: 'heart-outline',
      iconColor: '#EF4444',
      iconBg: '#FEE2E2',
      title: 'Giving Reminders',
      desc: 'Monthly giving reminders',
    },
  ];

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <LinearGradient
        colors={['#166534', '#16A34A']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: '66%' }]} />
        </View>
        <Text style={styles.step}>Step 2 of 3</Text>
        <Text style={styles.title}>Stay Connected</Text>
        <Text style={styles.subtitle}>
          Choose what matters to you. You can always change these later in settings.
        </Text>
      </LinearGradient>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {settings.map((setting) => (
          <View key={setting.key} style={styles.settingCard}>
            <View style={[styles.settingIcon, { backgroundColor: setting.iconBg }]}>
              <Ionicons name={setting.icon as any} size={22} color={setting.iconColor} />
            </View>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>{setting.title}</Text>
              <Text style={styles.settingDesc}>{setting.desc}</Text>

              {/* Time picker for daily devotional */}
              {setting.key === 'dailyDevotional' && prefs.dailyDevotional && (
                <TouchableOpacity
                  style={styles.timeSelector}
                  onPress={() => setShowTimePicker((v) => !v)}
                >
                  <Ionicons name="time-outline" size={14} color={Colors.primary} />
                  <Text style={styles.timeSelectorText}>{selectedTime}</Text>
                  <Ionicons
                    name={showTimePicker ? 'chevron-up' : 'chevron-down'}
                    size={14}
                    color={Colors.primary}
                  />
                </TouchableOpacity>
              )}
            </View>
            <Switch
              value={prefs[setting.key] as boolean}
              onValueChange={() => togglePref(setting.key)}
              trackColor={{ false: Colors.gray200, true: Colors.primaryLight }}
              thumbColor={prefs[setting.key] ? Colors.primary : Colors.white}
            />
          </View>
        ))}

        {/* Time options */}
        {showTimePicker && prefs.dailyDevotional && (
          <View style={styles.timeGrid}>
            {TIME_OPTIONS.map((t) => (
              <TouchableOpacity
                key={t}
                style={[
                  styles.timeOption,
                  selectedTime === t && styles.timeOptionActive,
                ]}
                onPress={() => {
                  setSelectedTime(t);
                  const [time, period] = t.split(' ');
                  const [h, m] = time.split(':');
                  let hour = parseInt(h);
                  if (period === 'PM' && hour !== 12) hour += 12;
                  if (period === 'AM' && hour === 12) hour = 0;
                  const timeStr = `${String(hour).padStart(2, '0')}:${m}`;
                  setPrefs((prev) => ({ ...prev, dailyDevotionalTime: timeStr }));
                  setShowTimePicker(false);
                }}
              >
                <Text
                  style={[
                    styles.timeOptionText,
                    selectedTime === t && styles.timeOptionTextActive,
                  ]}
                >
                  {t}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title="Continue"
          onPress={handleContinue}
          isLoading={isLoading}
          fullWidth
          size="lg"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingTop: 60,
    paddingBottom: Spacing[6],
    paddingHorizontal: Spacing[6],
    gap: Spacing[2],
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: BorderRadius.full,
    marginBottom: Spacing[4],
  },
  progressFill: {
    height: 4,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.full,
  },
  step: {
    fontSize: FontSizes.xs,
    fontWeight: FontWeights.semibold,
    color: 'rgba(255,255,255,0.7)',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  title: {
    fontSize: FontSizes['3xl'],
    fontWeight: FontWeights.black,
    color: Colors.white,
    marginTop: Spacing[1],
  },
  subtitle: {
    fontSize: FontSizes.sm,
    color: 'rgba(255,255,255,0.8)',
    lineHeight: 20,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing[5],
    paddingBottom: Spacing[4],
    gap: Spacing[3],
  },
  settingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[4],
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.xl,
    padding: Spacing[4],
    ...(Shadows.sm as object),
  },
  settingIcon: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingInfo: {
    flex: 1,
  },
  settingTitle: {
    fontSize: FontSizes.base,
    fontWeight: FontWeights.semibold,
    color: Colors.textPrimary,
  },
  settingDesc: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  timeSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: Spacing[2],
    backgroundColor: Colors.light,
    borderRadius: BorderRadius.full,
    paddingVertical: 4,
    paddingHorizontal: Spacing[3],
    alignSelf: 'flex-start',
  },
  timeSelectorText: {
    fontSize: FontSizes.xs,
    fontWeight: FontWeights.semibold,
    color: Colors.primary,
  },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing[2],
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.xl,
    padding: Spacing[4],
  },
  timeOption: {
    paddingVertical: Spacing[2],
    paddingHorizontal: Spacing[3],
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.gray100,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  timeOptionActive: {
    backgroundColor: Colors.light,
    borderColor: Colors.primary,
  },
  timeOptionText: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    fontWeight: FontWeights.medium,
  },
  timeOptionTextActive: {
    color: Colors.primary,
    fontWeight: FontWeights.semibold,
  },
  footer: {
    padding: Spacing[5],
    paddingBottom: Spacing[8],
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
});
