import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Image,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Rect, Line, Path, Circle } from 'react-native-svg';
import { Colors } from '../../constants/colors';
import { FontSizes, FontWeights } from '../../constants/fonts';
import { Spacing, BorderRadius, Shadows } from '../../constants/layout';
import { useAuthStore } from '../../store/authStore';
import { useAdminStore } from '../../store/adminStore';
import { getDashboardStats, getRecentActivity, ActivityItem } from '../../services/firebase/admin';
import { signOut } from '../../services/firebase/auth';
import { StatCard } from '../../components/admin/StatCard';

const QUICK_ACTIONS = [
  { label: '+ Devotional', icon: 'book-outline' as const, route: '/(admin)/devotionals/create', color: Colors.primary },
  { label: '+ Announcement', icon: 'megaphone-outline' as const, route: '/(admin)/announcements/create', color: '#3B82F6' },
  { label: 'Manage Users', icon: 'people-outline' as const, route: '/(admin)/users', color: '#8B5CF6' },
  { label: 'View Reports', icon: 'bar-chart-outline' as const, route: '/(admin)/analytics', color: '#F59E0B' },
];

const ACTIVITY_ICONS: Record<ActivityItem['type'], { icon: React.ComponentProps<typeof Ionicons>['name']; color: string }> = {
  user_joined: { icon: 'person-add-outline', color: '#3B82F6' },
  devotional_published: { icon: 'book-outline', color: Colors.primary },
  prayer_answered: { icon: 'checkmark-circle-outline', color: Colors.success },
  donation_received: { icon: 'cash-outline', color: '#F59E0B' },
};

// Simple SVG sparkline
function Sparkline({ values, color, width = 200, height = 48 }: {
  values: number[];
  color: string;
  width?: number;
  height?: number;
}) {
  if (values.length < 2) return null;
  const max = Math.max(...values, 1);
  const step = width / (values.length - 1);
  const points = values.map((v, i) => ({
    x: i * step,
    y: height - (v / max) * (height - 8) - 4,
  }));
  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

  return (
    <Svg width={width} height={height}>
      <Path d={pathD} stroke={color} strokeWidth={2.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      {points.map((p, i) => (
        <Circle key={i} cx={p.x} cy={p.y} r={3} fill={color} />
      ))}
    </Svg>
  );
}

// Simple SVG bar chart
function BarChart({ values, labels, color, width = 300, height = 80 }: {
  values: number[];
  labels: string[];
  color: string;
  width?: number;
  height?: number;
}) {
  const max = Math.max(...values, 1);
  const barWidth = (width / values.length) * 0.6;
  const gap = width / values.length;

  return (
    <Svg width={width} height={height + 20}>
      {values.map((v, i) => {
        const barH = (v / max) * height;
        const x = i * gap + (gap - barWidth) / 2;
        const y = height - barH;
        return (
          <React.Fragment key={i}>
            <Rect
              x={x}
              y={y}
              width={barWidth}
              height={barH}
              rx={4}
              fill={color}
              opacity={0.8}
            />
            <Svg x={x} y={height + 4} width={barWidth} height={16}>
              <Path />
            </Svg>
          </React.Fragment>
        );
      })}
    </Svg>
  );
}

function formatAmount(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return n.toString();
}

function formatRelativeTime(isoString: string): string {
  if (!isoString) return '';
  const now = Date.now();
  const then = new Date(isoString).getTime();
  const diff = Math.floor((now - then) / 1000);
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function AdminDashboard() {
  const insets = useSafeAreaInsets();
  const { user, reset: resetAuth } = useAuthStore();
  const { stats, setStats } = useAdminStore();
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Mock chart data — in production, load from analytics
  const givingMonths = [45000, 52000, 48000, 61000, 58000, 67000];
  const givingLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  const devotionalPlays = [12, 18, 15, 22, 19, 25, 30];

  const fetchData = useCallback(async () => {
    try {
      const [dashStats, recentActivity] = await Promise.all([
        getDashboardStats(),
        getRecentActivity(10),
      ]);
      setStats(dashStats);
      setActivity(recentActivity);
    } catch (err) {
      console.error('Dashboard fetch error:', err);
    }
  }, [setStats]);

  useEffect(() => {
    setIsLoading(true);
    fetchData().finally(() => setIsLoading(false));
  }, [fetchData]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await fetchData();
    setIsRefreshing(false);
  }, [fetchData]);

  const handleLogout = useCallback(async () => {
    try {
      await signOut();
      resetAuth();
      router.replace('/(auth)/login');
    } catch (err) {
      console.error('Logout error:', err);
    }
  }, [resetAuth]);

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading dashboard...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: insets.bottom + Spacing[8] }}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} tintColor={Colors.primary} />
      }
    >
      {/* Dark Header */}
      <View style={[styles.header, { paddingTop: insets.top + Spacing[4] }]}>
        <View>
          <Text style={styles.headerAdminLabel}>ADMIN PORTAL</Text>
          <Text style={styles.headerTitle}>TOPIC Admin</Text>
          <Text style={styles.headerDate}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </Text>
        </View>
        <View style={styles.headerRight}>
          <View style={styles.avatarWrap}>
            {user?.photoURL ? (
              <Image source={{ uri: user.photoURL }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarFallback}>
                <Text style={styles.avatarInitial}>
                  {(user?.displayName ?? user?.email ?? 'A').charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
          </View>
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={20} color={Colors.gray400} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Key Metrics Grid */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Key Metrics</Text>
        <View style={styles.metricsGrid}>
          <StatCard
            title="Total Members"
            value={stats?.totalUsers ?? 0}
            icon="people-outline"
            color="#3B82F6"
            subtitle="Registered users"
          />
          <StatCard
            title="Active Today"
            value={stats?.activeToday ?? 0}
            icon="pulse-outline"
            color={Colors.primary}
            subtitle="Last 24 hours"
          />
        </View>
        <View style={[styles.metricsGrid, { marginTop: Spacing[3] }]}>
          <StatCard
            title="New This Week"
            value={stats?.newThisWeek ?? 0}
            icon="person-add-outline"
            color="#8B5CF6"
            trend="+12%"
          />
          <StatCard
            title="Retention Rate"
            value="78%"
            icon="trending-up-outline"
            color="#F59E0B"
            trend="+3%"
          />
        </View>
      </View>

      {/* Giving Overview */}
      <View style={styles.section}>
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View>
              <Text style={styles.cardTitle}>Giving Overview</Text>
              <Text style={styles.cardSubtitle}>This Month's Total</Text>
            </View>
            <Text style={styles.givingTotal}>
              ${formatAmount(stats?.totalDonationsMonth ?? 0)}
            </Text>
          </View>
          <View style={styles.givingBreakdown}>
            <View style={styles.givingItem}>
              <View style={[styles.givingDot, { backgroundColor: Colors.primary }]} />
              <Text style={styles.givingLabel}>Tithe</Text>
              <Text style={styles.givingAmount}>$12,400</Text>
            </View>
            <View style={styles.givingItem}>
              <View style={[styles.givingDot, { backgroundColor: '#3B82F6' }]} />
              <Text style={styles.givingLabel}>Offering</Text>
              <Text style={styles.givingAmount}>$8,200</Text>
            </View>
            <View style={styles.givingItem}>
              <View style={[styles.givingDot, { backgroundColor: '#F59E0B' }]} />
              <Text style={styles.givingLabel}>Building Fund</Text>
              <Text style={styles.givingAmount}>$5,100</Text>
            </View>
          </View>
          <Text style={styles.chartLabel}>Last 6 Months</Text>
          <View style={styles.chartWrap}>
            <BarChart
              values={givingMonths}
              labels={givingLabels}
              color={Colors.primary}
              width={300}
              height={64}
            />
          </View>
        </View>
      </View>

      {/* Engagement Sparkline */}
      <View style={styles.section}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Engagement (7 days)</Text>
          <View style={styles.sparkRow}>
            <View style={styles.sparkItem}>
              <Text style={styles.sparkLabel}>Devotional Plays</Text>
              <Text style={styles.sparkValue}>{stats?.devotionalPlaysWeek ?? 0}</Text>
              <Sparkline values={devotionalPlays} color={Colors.primary} width={140} height={40} />
            </View>
            <View style={styles.sparkDivider} />
            <View style={styles.sparkItem}>
              <Text style={styles.sparkLabel}>Prayer Requests</Text>
              <Text style={styles.sparkValue}>{stats?.prayerRequestsWeek ?? 0}</Text>
              <Sparkline values={[3, 5, 4, 8, 6, 9, 7]} color="#8B5CF6" width={140} height={40} />
            </View>
          </View>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickActionsRow}>
          {QUICK_ACTIONS.map((action) => (
            <TouchableOpacity
              key={action.label}
              style={[styles.quickAction, { borderColor: action.color + '40' }]}
              onPress={() => router.push(action.route as Parameters<typeof router.push>[0])}
              activeOpacity={0.8}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: action.color + '18' }]}>
                <Ionicons name={action.icon} size={22} color={action.color} />
              </View>
              <Text style={styles.quickActionLabel}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Recent Activity */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        <View style={styles.card}>
          {activity.length === 0 ? (
            <Text style={styles.emptyText}>No recent activity</Text>
          ) : (
            activity.map((item, idx) => {
              const meta = ACTIVITY_ICONS[item.type];
              return (
                <View key={item.id} style={[styles.activityItem, idx < activity.length - 1 && styles.activityItemBorder]}>
                  <View style={[styles.activityIconWrap, { backgroundColor: meta.color + '18' }]}>
                    <Ionicons name={meta.icon} size={16} color={meta.color} />
                  </View>
                  <View style={styles.activityContent}>
                    <Text style={styles.activityTitle}>{item.title}</Text>
                    <Text style={styles.activitySubtitle} numberOfLines={1}>{item.subtitle}</Text>
                  </View>
                  <Text style={styles.activityTime}>{formatRelativeTime(item.timestamp)}</Text>
                </View>
              );
            })
          )}
        </View>
      </View>

      {/* Nav Shortcuts */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Manage</Text>
        <View style={styles.navGrid}>
          {[
            { label: 'Users', icon: 'people' as const, route: '/(admin)/users', color: '#3B82F6' },
            { label: 'Devotionals', icon: 'book' as const, route: '/(admin)/devotionals', color: Colors.primary },
            { label: 'Groups', icon: 'people-circle' as const, route: '/(admin)/groups', color: '#8B5CF6' },
            { label: 'Prayer Wall', icon: 'heart' as const, route: '/(admin)/prayer', color: '#EF4444' },
            { label: 'Giving', icon: 'cash' as const, route: '/(admin)/giving', color: '#F59E0B' },
            { label: 'Settings', icon: 'settings' as const, route: '/(admin)/settings', color: Colors.gray600 },
          ].map((item) => (
            <TouchableOpacity
              key={item.label}
              style={styles.navItem}
              onPress={() => router.push(item.route as Parameters<typeof router.push>[0])}
              activeOpacity={0.8}
            >
              <View style={[styles.navIconWrap, { backgroundColor: item.color + '18' }]}>
                <Ionicons name={item.icon} size={24} color={item.color} />
              </View>
              <Text style={styles.navLabel}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0F172A',
    gap: Spacing[3],
  },
  loadingText: {
    color: Colors.gray400,
    fontSize: FontSizes.sm,
  },
  header: {
    backgroundColor: '#0F172A',
    paddingHorizontal: Spacing[5],
    paddingBottom: Spacing[6],
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerAdminLabel: {
    fontSize: FontSizes.xs,
    color: Colors.primaryLight,
    fontWeight: FontWeights.bold,
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: FontSizes['2xl'],
    fontWeight: FontWeights.bold,
    color: Colors.white,
  },
  headerDate: {
    fontSize: FontSizes.xs,
    color: Colors.gray400,
    marginTop: 2,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
  },
  avatarWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  avatar: {
    width: 40,
    height: 40,
  },
  avatarFallback: {
    width: 40,
    height: 40,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.bold,
    color: Colors.white,
  },
  logoutBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.gray800,
    alignItems: 'center',
    justifyContent: 'center',
  },
  section: {
    paddingHorizontal: Spacing[5],
    paddingTop: Spacing[5],
  },
  sectionTitle: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.bold,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: Spacing[3],
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: Spacing[3],
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing[4],
    borderWidth: 1,
    borderColor: Colors.border,
    ...(Shadows.sm as object),
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing[3],
  },
  cardTitle: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.bold,
    color: Colors.textPrimary,
  },
  cardSubtitle: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  givingTotal: {
    fontSize: FontSizes['2xl'],
    fontWeight: FontWeights.bold,
    color: Colors.primary,
  },
  givingBreakdown: {
    gap: Spacing[2],
    marginBottom: Spacing[4],
  },
  givingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
  },
  givingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  givingLabel: {
    flex: 1,
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
  },
  givingAmount: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.semibold,
    color: Colors.textPrimary,
  },
  chartLabel: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
    marginBottom: Spacing[2],
  },
  chartWrap: {
    alignItems: 'center',
  },
  sparkRow: {
    flexDirection: 'row',
    marginTop: Spacing[3],
    gap: Spacing[4],
  },
  sparkItem: {
    flex: 1,
    gap: Spacing[1],
  },
  sparkDivider: {
    width: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing[2],
  },
  sparkLabel: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
    fontWeight: FontWeights.medium,
  },
  sparkValue: {
    fontSize: FontSizes.xl,
    fontWeight: FontWeights.bold,
    color: Colors.textPrimary,
  },
  quickActionsRow: {
    gap: Spacing[3],
    paddingVertical: Spacing[1],
  },
  quickAction: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing[4],
    alignItems: 'center',
    gap: Spacing[2],
    width: 110,
    borderWidth: 1.5,
    ...(Shadows.sm as object),
  },
  quickActionIcon: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickActionLabel: {
    fontSize: FontSizes.xs,
    fontWeight: FontWeights.semibold,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
    paddingVertical: Spacing[3],
  },
  activityItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  activityIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.semibold,
    color: Colors.textPrimary,
  },
  activitySubtitle: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
  },
  activityTime: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
  },
  navGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing[3],
  },
  navItem: {
    width: '30%',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing[4],
    alignItems: 'center',
    gap: Spacing[2],
    borderWidth: 1,
    borderColor: Colors.border,
    ...(Shadows.sm as object),
  },
  navIconWrap: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navLabel: {
    fontSize: FontSizes.xs,
    fontWeight: FontWeights.semibold,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
    padding: Spacing[4],
  },
});
