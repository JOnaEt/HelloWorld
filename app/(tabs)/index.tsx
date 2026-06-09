import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { FontSizes, FontWeights } from '../../constants/fonts';
import { Spacing, BorderRadius, Shadows } from '../../constants/layout';
import { Header, NotificationBtn } from '../../components/common/Header';
import { DevotionalHero } from '../../components/devotional/DevotionalHero';
import { DailyStreakCard } from '../../components/home/DailyStreakCard';
import { QuickStats } from '../../components/home/QuickStats';
import { UpcomingEvents } from '../../components/home/UpcomingEvents';
import { LoadingScreen } from '../../components/common/LoadingScreen';
import { useAuth } from '../../hooks/useAuth';
import { useDevotional } from '../../hooks/useDevotional';
import { getGreeting } from '../../utils/date';

export default function HomeScreen() {
  const { user } = useAuth();
  const { dailyDevotional, isDailyLoading, fetchDailyDevotional, fetchTrending } = useDevotional();
  const [refreshing, setRefreshing] = React.useState(false);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    fetchDailyDevotional();
    fetchTrending();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchDailyDevotional();
    setRefreshing(false);
  };

  if (!user) return null;

  const greeting = getGreeting();
  const firstName = user.displayName.split(' ')[0];

  const quickActions = [
    { icon: 'book-outline', label: 'Read', color: Colors.primary, bg: Colors.light, onPress: () => router.push('/devotional/' + (dailyDevotional?.id ?? 'daily')) },
    { icon: 'headset-outline', label: 'Listen', color: '#0EA5E9', bg: '#E0F2FE', onPress: () => router.push('/devotional/player') },
    { icon: 'hand-right-outline', label: 'Pray', color: '#8B5CF6', bg: '#EDE9FE', onPress: () => router.push('/prayer/') },
    { icon: 'heart-outline', label: 'Give', color: '#EF4444', bg: '#FEE2E2', onPress: () => router.push('/giving/') },
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar style="dark" />

      <Header
        showLogo
        rightElement={
          <NotificationBtn onPress={() => router.push('/announcements/')} />
        }
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.primary}
            colors={[Colors.primary]}
          />
        }
      >
        {/* Greeting */}
        <View style={styles.greetingSection}>
          <View>
            <Text style={styles.greetingSmall}>{greeting},</Text>
            <Text style={styles.greetingName}>{firstName} 👋</Text>
          </View>
          <TouchableOpacity style={styles.searchBtn} onPress={() => router.push('/(tabs)/library')}>
            <Ionicons name="search-outline" size={20} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Daily Devotional Hero */}
        <View style={styles.section}>
          {isDailyLoading ? (
            <View style={styles.heroPlaceholder}>
              <LoadingScreen fullScreen={false} message="Loading today's word..." />
            </View>
          ) : dailyDevotional ? (
            <DevotionalHero devotional={dailyDevotional} />
          ) : (
            <View style={styles.heroPlaceholder}>
              <Ionicons name="book-outline" size={32} color={Colors.gray400} />
              <Text style={styles.heroPlaceholderText}>No devotional available</Text>
            </View>
          )}
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            {quickActions.map((action, i) => (
              <TouchableOpacity
                key={i}
                style={styles.quickActionItem}
                onPress={action.onPress}
                activeOpacity={0.85}
              >
                <View style={[styles.quickActionIcon, { backgroundColor: action.bg }]}>
                  <Ionicons name={action.icon as any} size={24} color={action.color} />
                </View>
                <Text style={styles.quickActionLabel}>{action.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Streak Card */}
        <View style={styles.section}>
          <DailyStreakCard
            currentStreak={user.stats.currentStreak}
            longestStreak={user.stats.longestStreak}
            lastReadDate={null}
          />
        </View>

        {/* Quick Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Progress</Text>
          <QuickStats stats={user.stats} />
        </View>

        {/* Upcoming Events */}
        <View style={styles.section}>
          <UpcomingEvents onViewAll={() => router.push('/announcements/')} />
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingBottom: Spacing[8],
    gap: Spacing[2],
  },
  greetingSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing[5],
    paddingTop: Spacing[2],
    paddingBottom: Spacing[3],
  },
  greetingSmall: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
  },
  greetingName: {
    fontSize: FontSizes['2xl'],
    fontWeight: FontWeights.black,
    color: Colors.textPrimary,
    marginTop: -2,
  },
  searchBtn: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    ...(Shadows.sm as object),
  },
  section: {
    paddingHorizontal: Spacing[5],
    gap: Spacing[3],
  },
  sectionTitle: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.bold,
    color: Colors.textPrimary,
  },
  heroPlaceholder: {
    height: 300,
    backgroundColor: Colors.card,
    borderRadius: BorderRadius['3xl'],
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing[3],
    ...(Shadows.sm as object),
  },
  heroPlaceholderText: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    gap: Spacing[3],
  },
  quickActionItem: {
    flex: 1,
    alignItems: 'center',
    gap: Spacing[2],
  },
  quickActionIcon: {
    width: 60,
    height: 60,
    borderRadius: BorderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    ...(Shadows.sm as object),
  },
  quickActionLabel: {
    fontSize: FontSizes.xs,
    fontWeight: FontWeights.semibold,
    color: Colors.textPrimary,
  },
});
