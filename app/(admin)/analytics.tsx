import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path, Circle, Line } from 'react-native-svg';
import { Colors } from '../../constants/colors';
import { FontSizes, FontWeights } from '../../constants/fonts';
import { Spacing, BorderRadius, Shadows } from '../../constants/layout';
import { useAdminStore } from '../../store/adminStore';
import { getDashboardStats } from '../../services/firebase/admin';
import { StatCard } from '../../components/admin/StatCard';

type DateRange = 'week' | 'month' | 'year';

// Simple SVG line chart
function LineChart({ values, color, width = 300, height = 80 }: {
  values: number[];
  color: string;
  width?: number;
  height?: number;
}) {
  if (values.length < 2) return null;
  const max = Math.max(...values, 1);
  const step = width / (values.length - 1);
  const pts = values.map((v, i) => ({
    x: i * step,
    y: height - (v / max) * (height - 10) - 5,
  }));
  const d = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

  return (
    <Svg width={width} height={height}>
      <Path d={d} stroke={color} strokeWidth={2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      {pts.map((p, i) => <Circle key={i} cx={p.x} cy={p.y} r={3} fill={color} />)}
    </Svg>
  );
}

interface MetricRowProps {
  label: string;
  value: string | number;
  sub?: string;
  color?: string;
}

function MetricRow({ label, value, sub, color = Colors.textPrimary }: MetricRowProps) {
  return (
    <View style={styles.metricRow}>
      <Text style={styles.metricLabel}>{label}</Text>
      <View style={styles.metricRight}>
        <Text style={[styles.metricValue, { color }]}>{value}</Text>
        {sub ? <Text style={styles.metricSub}>{sub}</Text> : null}
      </View>
    </View>
  );
}

export default function AnalyticsScreen() {
  const insets = useSafeAreaInsets();
  const { stats, setStats } = useAdminStore();
  const [dateRange, setDateRange] = useState<DateRange>('week');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Mock chart values — in production, load from Firebase Analytics
  const dauData = [120, 145, 132, 178, 165, 190, 210];
  const newMembersData = [12, 8, 15, 22, 18, 25, 20];
  const devotionalData = [45, 52, 48, 61, 58, 67, 72];

  const fetchData = useCallback(async () => {
    try {
      const data = await getDashboardStats();
      setStats(data);
    } catch (err) {
      console.error('Analytics fetch error:', err);
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

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centerContainer, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Analytics</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Date range */}
      <View style={styles.rangeRow}>
        {(['week', 'month', 'year'] as DateRange[]).map((r) => (
          <TouchableOpacity
            key={r}
            style={[styles.rangeBtn, dateRange === r && styles.rangeBtnActive]}
            onPress={() => setDateRange(r)}
          >
            <Text style={[styles.rangeBtnText, dateRange === r && styles.rangeBtnTextActive]}>
              {r.charAt(0).toUpperCase() + r.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + Spacing[8] }}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} tintColor={Colors.primary} />
        }
      >
        {/* Engagement Overview */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Engagement Overview</Text>
          <View style={styles.statsGrid}>
            <StatCard
              title="Active Users"
              value={stats?.activeToday ?? 0}
              icon="pulse-outline"
              color={Colors.primary}
              subtitle="Daily active"
            />
            <StatCard
              title="New Members"
              value={stats?.newThisWeek ?? 0}
              icon="person-add-outline"
              color="#3B82F6"
              subtitle="This week"
              trend="+12%"
            />
          </View>
          <View style={[styles.statsGrid, { marginTop: Spacing[3] }]}>
            <StatCard
              title="Total Members"
              value={stats?.totalUsers ?? 0}
              icon="people-outline"
              color="#8B5CF6"
            />
            <StatCard
              title="Retention 7d"
              value="78%"
              icon="trending-up-outline"
              color="#F59E0B"
              trend="+3%"
            />
          </View>
        </View>

        {/* DAU Chart */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Daily Active Users</Text>
          <View style={styles.chartCard}>
            <View style={styles.chartHeader}>
              <Text style={styles.chartTitle}>Last 7 Days</Text>
              <Text style={styles.chartValue}>{stats?.activeToday ?? 0} today</Text>
            </View>
            <View style={styles.chartWrap}>
              <LineChart values={dauData} color={Colors.primary} width={300} height={72} />
            </View>
          </View>
        </View>

        {/* Devotional Analytics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Devotional Analytics</Text>
          <View style={styles.card}>
            <MetricRow label="Total Plays" value={stats?.devotionalPlaysWeek ?? 0} color={Colors.primary} />
            <View style={styles.divider} />
            <MetricRow label="Avg Completion Rate" value="68%" color={Colors.success} sub="target: 60%" />
            <View style={styles.divider} />
            <MetricRow label="Most Played Category" value="Prayer" />
            <View style={styles.divider} />
            <MetricRow label="New Devotionals" value="3" sub="this week" />
          </View>
          <Text style={styles.miniSectionTitle}>Play Trend</Text>
          <View style={styles.chartCard}>
            <View style={styles.chartWrap}>
              <LineChart values={devotionalData} color="#3B82F6" width={300} height={60} />
            </View>
          </View>
        </View>

        {/* Bible Reading */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Bible Reading</Text>
          <View style={styles.card}>
            <MetricRow label="Total Readings" value="1,248" color={Colors.primary} />
            <View style={styles.divider} />
            <MetricRow label="Avg Reading Streak" value="8 days" />
            <View style={styles.divider} />
            <MetricRow label="Active Reading Plans" value="145" />
            <View style={styles.divider} />
            <MetricRow label="Plan Completion Rate" value="42%" color={Colors.warning} />
          </View>
        </View>

        {/* Community */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Community</Text>
          <View style={styles.card}>
            <MetricRow label="New Prayer Requests" value={stats?.prayerRequestsWeek ?? 0} sub="this week" />
            <View style={styles.divider} />
            <MetricRow label="Prayers Answered" value="14" color={Colors.success} />
            <View style={styles.divider} />
            <MetricRow label="Group Attendance Rate" value="64%" />
            <View style={styles.divider} />
            <MetricRow label="Active Groups" value="12" />
          </View>
        </View>

        {/* Growth */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Growth</Text>
          <View style={styles.chartCard}>
            <View style={styles.chartHeader}>
              <Text style={styles.chartTitle}>New Members (7 days)</Text>
            </View>
            <View style={styles.chartWrap}>
              <LineChart values={newMembersData} color="#8B5CF6" width={300} height={60} />
            </View>
          </View>
          <View style={styles.card}>
            <MetricRow label="Onboarding Completion" value="82%" color={Colors.success} />
            <View style={styles.divider} />
            <MetricRow label="Profile Completion" value="67%" />
            <View style={styles.divider} />
            <MetricRow label="Feature Adoption (Devotional)" value="71%" color={Colors.primary} />
            <View style={styles.divider} />
            <MetricRow label="Feature Adoption (Groups)" value="38%" />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  centerContainer: { alignItems: 'center', justifyContent: 'center' },
  header: {
    backgroundColor: '#0F172A',
    paddingHorizontal: Spacing[5],
    paddingVertical: Spacing[4],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: FontSizes.lg, fontWeight: FontWeights.bold, color: Colors.white },
  rangeRow: {
    flexDirection: 'row',
    gap: Spacing[2],
    padding: Spacing[4],
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  rangeBtn: {
    flex: 1,
    paddingVertical: Spacing[2],
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.gray100,
    alignItems: 'center',
  },
  rangeBtnActive: { backgroundColor: Colors.primary },
  rangeBtnText: { fontSize: FontSizes.sm, fontWeight: FontWeights.semibold, color: Colors.textSecondary },
  rangeBtnTextActive: { color: Colors.white },
  section: { paddingHorizontal: Spacing[5], paddingTop: Spacing[5] },
  sectionTitle: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.bold,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: Spacing[3],
  },
  miniSectionTitle: {
    fontSize: FontSizes.xs,
    fontWeight: FontWeights.semibold,
    color: Colors.textSecondary,
    marginTop: Spacing[3],
    marginBottom: Spacing[2],
  },
  statsGrid: { flexDirection: 'row', gap: Spacing[3] },
  card: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing[4],
    borderWidth: 1,
    borderColor: Colors.border,
    ...(Shadows.sm as object),
  },
  chartCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing[4],
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing[3],
    ...(Shadows.sm as object),
  },
  chartHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  chartTitle: { fontSize: FontSizes.sm, fontWeight: FontWeights.semibold, color: Colors.textPrimary },
  chartValue: { fontSize: FontSizes.sm, color: Colors.textSecondary },
  chartWrap: { alignItems: 'center' },
  metricRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing[3],
  },
  metricLabel: { fontSize: FontSizes.base, color: Colors.textSecondary },
  metricRight: { alignItems: 'flex-end' },
  metricValue: { fontSize: FontSizes.base, fontWeight: FontWeights.bold },
  metricSub: { fontSize: FontSizes.xs, color: Colors.textSecondary },
  divider: { height: 1, backgroundColor: Colors.border },
});
