import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { FontSizes, FontWeights } from '../../constants/fonts';
import { Spacing, BorderRadius, Shadows } from '../../constants/layout';
import { useAdminStore } from '../../store/adminStore';
import { Devotional } from '../../types';
import {
  getAllDevotionalsAdmin,
  deleteDevotional,
  featureDevotional,
} from '../../services/firebase/admin';
import { ErrorState } from '../../components/common/ErrorState';

type StatusFilter = 'all' | 'featured' | 'daily';

const STATUS_FILTERS: Array<{ value: StatusFilter; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'featured', label: 'Featured' },
  { value: 'daily', label: 'Daily' },
];

function getStatusLabel(d: Devotional): string {
  if (d.isFeatured) return 'Featured';
  if (d.isDaily) return 'Daily';
  return 'Published';
}

function getStatusColor(d: Devotional): string {
  if (d.isFeatured) return '#F59E0B';
  if (d.isDaily) return Colors.primary;
  return Colors.gray500;
}

function formatDate(val: Date | string): string {
  if (!val) return '—';
  const d = typeof val === 'string' ? new Date(val) : val;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

interface DevotionalCardProps {
  item: Devotional;
  onEdit: () => void;
  onFeature: () => void;
  onDelete: () => void;
}

function DevotionalCard({ item, onEdit, onFeature, onDelete }: DevotionalCardProps) {
  const statusColor = getStatusColor(item);
  const statusLabel = getStatusLabel(item);

  return (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <View style={styles.thumbnailPlaceholder}>
          <Ionicons name="book-outline" size={24} color={Colors.gray400} />
        </View>
        <View style={styles.cardInfo}>
          <View style={styles.cardBadgeRow}>
            <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
              <Text style={[styles.statusBadgeText, { color: statusColor }]}>{statusLabel}</Text>
            </View>
            <Text style={styles.categoryText}>{item.category}</Text>
          </View>
          <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
          <Text style={styles.cardAuthor}>{item.author.name}</Text>
        </View>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Ionicons name="headset-outline" size={13} color={Colors.gray400} />
          <Text style={styles.statText}>{(item.listenCount ?? 0).toLocaleString()}</Text>
        </View>
        <View style={styles.statItem}>
          <Ionicons name="book-outline" size={13} color={Colors.gray400} />
          <Text style={styles.statText}>{(item.readCount ?? 0).toLocaleString()}</Text>
        </View>
        <View style={styles.statItem}>
          <Ionicons name="share-outline" size={13} color={Colors.gray400} />
          <Text style={styles.statText}>{(item.shareCount ?? 0).toLocaleString()}</Text>
        </View>
        <Text style={styles.cardDate}>{formatDate(item.publishedAt)}</Text>
      </View>

      <View style={styles.actionsRow}>
        <TouchableOpacity style={styles.actionBtn} onPress={onEdit}>
          <Ionicons name="pencil-outline" size={15} color={Colors.primary} />
          <Text style={[styles.actionBtnText, { color: Colors.primary }]}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={onFeature}>
          <Ionicons name={item.isFeatured ? 'star' : 'star-outline'} size={15} color="#F59E0B" />
          <Text style={[styles.actionBtnText, { color: '#F59E0B' }]}>
            {item.isFeatured ? 'Unfeature' : 'Feature'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={onDelete}>
          <Ionicons name="trash-outline" size={15} color={Colors.error} />
          <Text style={[styles.actionBtnText, { color: Colors.error }]}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function DevotionalsAdminScreen() {
  const insets = useSafeAreaInsets();
  const { devotionals, setDevotionals } = useAdminStore();
  const [filter, setFilter] = useState<StatusFilter>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async (statusFilter: StatusFilter = filter) => {
    try {
      setError(null);
      const data = await getAllDevotionalsAdmin(statusFilter !== 'all' ? statusFilter : undefined);
      setDevotionals(data);
    } catch {
      setError('Failed to load devotionals. Please try again.');
    }
  }, [filter, setDevotionals]);

  useEffect(() => {
    setIsLoading(true);
    fetchData().finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    if (!isLoading) fetchData(filter);
  }, [filter]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await fetchData(filter);
    setIsRefreshing(false);
  }, [filter, fetchData]);

  const handleFeature = useCallback(async (item: Devotional) => {
    try {
      const newFeatured = !item.isFeatured;
      await featureDevotional(item.id, newFeatured);
      useAdminStore.getState().updateDevotional(item.id, { isFeatured: newFeatured });
    } catch {
      Alert.alert('Error', 'Failed to update devotional.');
    }
  }, []);

  const handleDelete = useCallback((item: Devotional) => {
    Alert.alert(
      'Delete Devotional',
      `Delete "${item.title}"? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDevotional(item.id);
              useAdminStore.getState().removeDevotional(item.id);
            } catch {
              Alert.alert('Error', 'Failed to delete devotional.');
            }
          },
        },
      ]
    );
  }, []);

  // Summary stats
  const total = devotionals.length;
  const featured = devotionals.filter((d) => d.isFeatured).length;
  const daily = devotionals.filter((d) => d.isDaily).length;
  const avgPlays = total > 0
    ? Math.round(devotionals.reduce((s, d) => s + (d.listenCount ?? 0), 0) / total)
    : 0;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Devotionals</Text>
        <TouchableOpacity
          style={styles.createBtn}
          onPress={() => router.push('/(admin)/devotionals/create')}
        >
          <Ionicons name="add" size={20} color={Colors.white} />
        </TouchableOpacity>
      </View>

      {/* Stats row */}
      <View style={styles.statsBar}>
        {[
          { label: 'Total', value: total },
          { label: 'Featured', value: featured },
          { label: 'Daily', value: daily },
          { label: 'Avg Plays', value: avgPlays },
        ].map((s, i) => (
          <React.Fragment key={s.label}>
            {i > 0 && <View style={styles.statDivider} />}
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          </React.Fragment>
        ))}
      </View>

      {/* Filter tabs */}
      <FlatList
        horizontal
        data={STATUS_FILTERS}
        keyExtractor={(t) => t.value}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.filterTab, filter === item.value && styles.filterTabActive]}
            onPress={() => setFilter(item.value)}
          >
            <Text style={[styles.filterTabText, filter === item.value && styles.filterTabTextActive]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        )}
      />

      {isLoading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : error ? (
        <ErrorState title="Failed to load" message={error} onRetry={() => fetchData(filter)} />
      ) : (
        <FlatList
          data={devotionals}
          keyExtractor={(d) => d.id}
          renderItem={({ item }) => (
            <DevotionalCard
              item={item}
              onEdit={() => router.push(`/(admin)/devotionals/create?id=${item.id}` as Parameters<typeof router.push>[0])}
              onFeature={() => handleFeature(item)}
              onDelete={() => handleDelete(item)}
            />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} tintColor={Colors.primary} />
          }
          ListEmptyComponent={
            <ErrorState icon="book-outline" title="No devotionals" message="Create your first devotional to get started." />
          }
        />
      )}

      {/* FAB */}
      <TouchableOpacity
        style={[styles.fab, { bottom: insets.bottom + Spacing[5] }]}
        onPress={() => router.push('/(admin)/devotionals/create')}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={24} color={Colors.white} />
        <Text style={styles.fabText}>Create Devotional</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
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
  createBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsBar: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    paddingVertical: Spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: FontSizes.xl, fontWeight: FontWeights.bold, color: Colors.textPrimary },
  statLabel: { fontSize: FontSizes.xs, color: Colors.textSecondary },
  statDivider: { width: 1, backgroundColor: Colors.border, marginVertical: Spacing[1] },
  filterRow: { gap: Spacing[2], paddingHorizontal: Spacing[5], paddingVertical: Spacing[4] },
  filterTab: {
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[2],
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.white,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  filterTabActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  filterTabText: { fontSize: FontSizes.sm, fontWeight: FontWeights.semibold, color: Colors.textSecondary },
  filterTabTextActive: { color: Colors.white },
  centerContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  listContent: { paddingHorizontal: Spacing[5], paddingBottom: 100, gap: Spacing[3] },
  card: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing[4],
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing[3],
    ...(Shadows.sm as object),
  },
  cardTop: { flexDirection: 'row', gap: Spacing[3] },
  thumbnailPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.gray100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardInfo: { flex: 1, gap: Spacing[1] },
  cardBadgeRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing[2] },
  statusBadge: { paddingHorizontal: Spacing[2], paddingVertical: 2, borderRadius: BorderRadius.full },
  statusBadgeText: { fontSize: FontSizes.xs, fontWeight: FontWeights.bold },
  categoryText: { fontSize: FontSizes.xs, color: Colors.textSecondary, textTransform: 'capitalize' },
  cardTitle: { fontSize: FontSizes.base, fontWeight: FontWeights.semibold, color: Colors.textPrimary, lineHeight: FontSizes.base * 1.4 },
  cardAuthor: { fontSize: FontSizes.xs, color: Colors.textSecondary },
  statsRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing[4] },
  statMetaItem: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  statText: { fontSize: FontSizes.xs, color: Colors.textSecondary },
  cardDate: { fontSize: FontSizes.xs, color: Colors.textSecondary, marginLeft: 'auto' },
  actionsRow: { flexDirection: 'row', gap: Spacing[3], borderTopWidth: 1, borderTopColor: Colors.border, paddingTop: Spacing[3] },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, flex: 1, justifyContent: 'center' },
  actionBtnText: { fontSize: FontSizes.sm, fontWeight: FontWeights.semibold },
  fab: {
    position: 'absolute',
    right: Spacing[5],
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing[5],
    paddingVertical: Spacing[3],
    borderRadius: BorderRadius.full,
    ...(Shadows.md as object),
  },
  fabText: { fontSize: FontSizes.base, fontWeight: FontWeights.semibold, color: Colors.white },
});
