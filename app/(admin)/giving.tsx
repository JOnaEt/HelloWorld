import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Rect } from 'react-native-svg';
import { Colors } from '../../constants/colors';
import { FontSizes, FontWeights } from '../../constants/fonts';
import { Spacing, BorderRadius, Shadows } from '../../constants/layout';
import { Donation, DonationType } from '../../types';
import { getGivingReport } from '../../services/firebase/admin';
import { ErrorState } from '../../components/common/ErrorState';

type DateRange = 'week' | 'month' | 'year' | 'custom';

const RANGE_OPTS: Array<{ value: DateRange; label: string }> = [
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' },
  { value: 'year', label: 'This Year' },
];

const CATEGORY_LABELS: Record<DonationType, string> = {
  tithe: 'Tithe',
  offering: 'Offering',
  'building-fund': 'Building Fund',
  missions: 'Missions',
  special: 'Special Giving',
  benevolence: 'Benevolence',
};

const CATEGORY_COLORS: Record<DonationType, string> = {
  tithe: Colors.primary,
  offering: '#15803D',
  'building-fund': '#0EA5E9',
  missions: '#8B5CF6',
  special: '#F59E0B',
  benevolence: '#EF4444',
};

const STATUS_COLORS: Record<string, string> = {
  completed: Colors.success,
  pending: '#F59E0B',
  failed: Colors.error,
  refunded: Colors.gray400,
};

function getDateRange(range: DateRange): { start: Date; end: Date } {
  const now = new Date();
  const end = new Date(now);
  const start = new Date(now);

  if (range === 'week') {
    start.setDate(now.getDate() - 7);
  } else if (range === 'month') {
    start.setMonth(now.getMonth(), 1);
    start.setHours(0, 0, 0, 0);
  } else if (range === 'year') {
    start.setMonth(0, 1);
    start.setHours(0, 0, 0, 0);
  }

  return { start, end };
}

function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(val: Date | string): string {
  if (!val) return '—';
  const d = typeof val === 'string' ? new Date(val) : val;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

interface CategoryBarProps {
  label: string;
  amount: number;
  total: number;
  color: string;
}

function CategoryBar({ label, amount, total, color }: CategoryBarProps) {
  const pct = total > 0 ? (amount / total) * 100 : 0;
  return (
    <View style={styles.categoryBarRow}>
      <Text style={styles.categoryBarLabel}>{label}</Text>
      <View style={styles.categoryBarTrack}>
        <View style={[styles.categoryBarFill, { width: `${pct}%` as `${number}%`, backgroundColor: color }]} />
      </View>
      <Text style={[styles.categoryBarAmount, { color }]}>{formatCurrency(amount)}</Text>
    </View>
  );
}

export default function GivingReportsScreen() {
  const insets = useSafeAreaInsets();
  const [dateRange, setDateRange] = useState<DateRange>('month');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<{
    total: number;
    byCategory: Record<string, number>;
    transactions: Donation[];
  } | null>(null);

  const fetchReport = useCallback(async (range: DateRange = dateRange) => {
    try {
      setError(null);
      const { start, end } = getDateRange(range);
      const data = await getGivingReport(start, end);
      setReport(data);
    } catch {
      setError('Failed to load giving report. Please try again.');
    }
  }, [dateRange]);

  useEffect(() => {
    setIsLoading(true);
    fetchReport().finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    fetchReport(dateRange);
  }, [dateRange]);

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centerContainer, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  const categories = Object.entries(report?.byCategory ?? {}) as Array<[DonationType, number]>;
  const totalFromReport = report?.total ?? 0;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Giving Reports</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Date range */}
      <View style={styles.rangeRow}>
        {RANGE_OPTS.map((opt) => (
          <TouchableOpacity
            key={opt.value}
            style={[styles.rangeBtn, dateRange === opt.value && styles.rangeBtnActive]}
            onPress={() => setDateRange(opt.value)}
          >
            <Text style={[styles.rangeBtnText, dateRange === opt.value && styles.rangeBtnTextActive]}>
              {opt.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {error ? (
        <ErrorState title="Failed to load" message={error} onRetry={() => fetchReport(dateRange)} />
      ) : (
        <FlatList
          data={report?.transactions ?? []}
          keyExtractor={(d) => d.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: insets.bottom + Spacing[8] }}
          ListHeaderComponent={
            <View>
              {/* Summary cards */}
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.summaryRow}>
                {[
                  { label: 'Total Received', amount: totalFromReport, color: Colors.primary },
                  { label: 'Tithe', amount: report?.byCategory['tithe'] ?? 0, color: Colors.primary },
                  { label: 'Offering', amount: report?.byCategory['offering'] ?? 0, color: '#15803D' },
                  { label: 'Building Fund', amount: report?.byCategory['building-fund'] ?? 0, color: '#0EA5E9' },
                  { label: 'Missions', amount: report?.byCategory['missions'] ?? 0, color: '#8B5CF6' },
                ].map((item) => (
                  <View key={item.label} style={[styles.summaryCard, { borderTopColor: item.color }]}>
                    <Text style={styles.summaryLabel}>{item.label}</Text>
                    <Text style={[styles.summaryAmount, { color: item.color }]}>
                      {formatCurrency(item.amount)}
                    </Text>
                  </View>
                ))}
              </ScrollView>

              {/* Category breakdown */}
              {categories.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>By Category</Text>
                  <View style={styles.card}>
                    {categories.map(([cat, amount]) => (
                      <CategoryBar
                        key={cat}
                        label={CATEGORY_LABELS[cat] ?? cat}
                        amount={amount}
                        total={totalFromReport}
                        color={CATEGORY_COLORS[cat] ?? Colors.gray400}
                      />
                    ))}
                  </View>
                </View>
              )}

              {/* Export */}
              <View style={styles.section}>
                <TouchableOpacity
                  style={styles.exportBtn}
                  onPress={() => Alert.alert('Export', 'CSV export will be available in the next update.')}
                >
                  <Ionicons name="download-outline" size={16} color={Colors.primary} />
                  <Text style={styles.exportBtnText}>Export CSV</Text>
                </TouchableOpacity>
              </View>

              {/* Transactions header */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Recent Transactions</Text>
              </View>
            </View>
          }
          renderItem={({ item }) => (
            <View style={styles.transactionRow}>
              <View style={[styles.transactionIconWrap, { backgroundColor: (CATEGORY_COLORS[item.type] ?? Colors.primary) + '18' }]}>
                <Ionicons name="cash-outline" size={16} color={CATEGORY_COLORS[item.type] ?? Colors.primary} />
              </View>
              <View style={styles.transactionInfo}>
                <Text style={styles.transactionType}>{CATEGORY_LABELS[item.type] ?? item.type}</Text>
                <Text style={styles.transactionDate}>{formatDate(item.createdAt)}</Text>
              </View>
              <View style={styles.transactionRight}>
                <Text style={styles.transactionAmount}>{formatCurrency(item.amount, item.currency)}</Text>
                <View style={[styles.transactionStatus, { backgroundColor: (STATUS_COLORS[item.status] ?? Colors.gray400) + '20' }]}>
                  <Text style={[styles.transactionStatusText, { color: STATUS_COLORS[item.status] ?? Colors.gray400 }]}>
                    {item.status}
                  </Text>
                </View>
              </View>
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.emptySection}>
              <Ionicons name="cash-outline" size={40} color={Colors.gray300} />
              <Text style={styles.emptyText}>No transactions in this period</Text>
            </View>
          }
        />
      )}
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
  summaryRow: { gap: Spacing[3], padding: Spacing[4], paddingRight: Spacing[5] },
  summaryCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing[4],
    borderTopWidth: 3,
    borderWidth: 1,
    borderColor: Colors.border,
    minWidth: 130,
    gap: Spacing[2],
    ...(Shadows.sm as object),
  },
  summaryLabel: { fontSize: FontSizes.xs, color: Colors.textSecondary, fontWeight: FontWeights.medium },
  summaryAmount: { fontSize: FontSizes.xl, fontWeight: FontWeights.bold },
  section: { paddingHorizontal: Spacing[5], paddingBottom: Spacing[3] },
  sectionTitle: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.bold,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: Spacing[3],
    marginTop: Spacing[2],
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing[4],
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing[4],
    ...(Shadows.sm as object),
  },
  categoryBarRow: { gap: Spacing[2] },
  categoryBarLabel: { fontSize: FontSizes.sm, color: Colors.textPrimary, fontWeight: FontWeights.medium },
  categoryBarTrack: {
    height: 8,
    backgroundColor: Colors.gray100,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
  },
  categoryBarFill: {
    height: 8,
    borderRadius: BorderRadius.full,
    minWidth: 4,
  },
  categoryBarAmount: { fontSize: FontSizes.sm, fontWeight: FontWeights.bold },
  exportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing[2],
    backgroundColor: Colors.white,
    paddingVertical: Spacing[3],
    borderRadius: BorderRadius.full,
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  exportBtnText: { fontSize: FontSizes.base, fontWeight: FontWeights.semibold, color: Colors.primary },
  transactionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
    paddingHorizontal: Spacing[5],
    paddingVertical: Spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.white,
  },
  transactionIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  transactionInfo: { flex: 1 },
  transactionType: { fontSize: FontSizes.base, fontWeight: FontWeights.semibold, color: Colors.textPrimary },
  transactionDate: { fontSize: FontSizes.xs, color: Colors.textSecondary },
  transactionRight: { alignItems: 'flex-end', gap: 4 },
  transactionAmount: { fontSize: FontSizes.base, fontWeight: FontWeights.bold, color: Colors.textPrimary },
  transactionStatus: { paddingHorizontal: Spacing[2], paddingVertical: 2, borderRadius: BorderRadius.full },
  transactionStatusText: { fontSize: FontSizes.xs, fontWeight: FontWeights.semibold, textTransform: 'capitalize' },
  emptySection: { alignItems: 'center', paddingVertical: Spacing[12], gap: Spacing[3] },
  emptyText: { fontSize: FontSizes.base, color: Colors.textSecondary },
});
