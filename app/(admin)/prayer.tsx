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
  Modal,
  TextInput,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { FontSizes, FontWeights } from '../../constants/fonts';
import { Spacing, BorderRadius, Shadows } from '../../constants/layout';
import { useAdminStore } from '../../store/adminStore';
import { PrayerRequest, PrayerStatus } from '../../types';
import {
  getAllPrayersAdmin,
  moderatePrayer,
  markPrayerAnsweredAdmin,
} from '../../services/firebase/admin';
import { ErrorState } from '../../components/common/ErrorState';

type FilterTab = 'all' | PrayerStatus | 'anonymous';

const FILTER_TABS: Array<{ value: FilterTab; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'answered', label: 'Answered' },
  { value: 'archived', label: 'Archived' },
  { value: 'anonymous', label: 'Anonymous' },
];

const STATUS_COLORS: Record<PrayerStatus, string> = {
  active: Colors.primary,
  answered: Colors.success,
  archived: Colors.gray400,
};

const CATEGORY_COLORS: Record<string, string> = {
  healing: '#EF4444',
  provision: '#F59E0B',
  guidance: '#3B82F6',
  family: '#8B5CF6',
  salvation: Colors.primary,
  protection: '#0EA5E9',
  thanksgiving: '#10B981',
  intercession: '#F97316',
  breakthrough: '#EC4899',
  other: Colors.gray400,
};

function formatDate(val: Date | string): string {
  if (!val) return '—';
  const d = typeof val === 'string' ? new Date(val) : val;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

interface PrayerCardProps {
  item: PrayerRequest;
  onApprove: () => void;
  onFeature: () => void;
  onMarkAnswered: () => void;
  onRemove: () => void;
}

function PrayerCard({ item, onApprove, onFeature, onMarkAnswered, onRemove }: PrayerCardProps) {
  const statusColor = STATUS_COLORS[item.status] ?? Colors.gray400;
  const categoryColor = CATEGORY_COLORS[item.category] ?? Colors.gray400;
  const displayName = item.isAnonymous ? 'Anonymous' : (item.userProfile?.displayName ?? 'Member');

  return (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <View style={[styles.userAvatar, { backgroundColor: item.isAnonymous ? Colors.gray200 : Colors.primary }]}>
          {item.isAnonymous ? (
            <Ionicons name="person-outline" size={20} color={Colors.gray400} />
          ) : (
            <Text style={styles.userAvatarText}>{displayName.charAt(0).toUpperCase()}</Text>
          )}
        </View>
        <View style={styles.cardInfo}>
          <View style={styles.badgeRow}>
            <View style={[styles.categoryBadge, { backgroundColor: categoryColor + '20' }]}>
              <Text style={[styles.categoryBadgeText, { color: categoryColor }]}>{item.category}</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
              <Text style={[styles.statusBadgeText, { color: statusColor }]}>{item.status}</Text>
            </View>
            {item.isAnonymous && (
              <View style={styles.anonBadge}>
                <Ionicons name="eye-off-outline" size={10} color={Colors.gray500} />
                <Text style={styles.anonText}>Anonymous</Text>
              </View>
            )}
          </View>
          <Text style={styles.userName}>{displayName}</Text>
          <Text style={styles.cardDate}>{formatDate(item.createdAt)}</Text>
        </View>
        <View style={styles.prayerCount}>
          <Ionicons name="heart" size={12} color={Colors.error} />
          <Text style={styles.prayerCountText}>{item.prayerCount}</Text>
        </View>
      </View>

      <Text style={styles.cardTitle}>{item.title}</Text>
      <Text style={styles.cardContent}>{item.content}</Text>

      <View style={styles.actionsRow}>
        {item.status === 'active' && (
          <TouchableOpacity style={styles.actionBtn} onPress={onApprove}>
            <Ionicons name="checkmark-outline" size={14} color={Colors.primary} />
            <Text style={[styles.actionText, { color: Colors.primary }]}>Approve</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.actionBtn} onPress={onFeature}>
          <Ionicons name="star-outline" size={14} color="#F59E0B" />
          <Text style={[styles.actionText, { color: '#F59E0B' }]}>Feature</Text>
        </TouchableOpacity>
        {item.status !== 'answered' && (
          <TouchableOpacity style={styles.actionBtn} onPress={onMarkAnswered}>
            <Ionicons name="checkmark-circle-outline" size={14} color={Colors.success} />
            <Text style={[styles.actionText, { color: Colors.success }]}>Answered</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.actionBtn} onPress={onRemove}>
          <Ionicons name="trash-outline" size={14} color={Colors.error} />
          <Text style={[styles.actionText, { color: Colors.error }]}>Remove</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

interface AnswerModalProps {
  visible: boolean;
  onConfirm: (note: string) => void;
  onClose: () => void;
}

function AnswerModal({ visible, onConfirm, onClose }: AnswerModalProps) {
  const [note, setNote] = useState('');
  return (
    <Modal transparent animationType="slide" visible={visible} onRequestClose={onClose}>
      <TouchableOpacity style={styles.modalOverlay} onPress={onClose} activeOpacity={1}>
        <View style={styles.answerSheet}>
          <View style={styles.sheetHandle} />
          <Text style={styles.sheetTitle}>Mark as Answered</Text>
          <Text style={styles.sheetSubtitle}>Add an optional testimony note</Text>
          <TextInput
            style={styles.noteInput}
            value={note}
            onChangeText={setNote}
            placeholder="How was this prayer answered? (optional)"
            placeholderTextColor={Colors.gray400}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
          <TouchableOpacity
            style={styles.confirmBtn}
            onPress={() => { onConfirm(note); setNote(''); }}
          >
            <Ionicons name="checkmark-circle-outline" size={18} color={Colors.white} />
            <Text style={styles.confirmBtnText}>Mark Answered</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

export default function PrayerModerationScreen() {
  const insets = useSafeAreaInsets();
  const { prayers, setPrayers } = useAdminStore();
  const [filter, setFilter] = useState<FilterTab>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPrayer, setSelectedPrayer] = useState<PrayerRequest | null>(null);
  const [showAnswerModal, setShowAnswerModal] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setError(null);
      const data = await getAllPrayersAdmin();
      setPrayers(data);
    } catch {
      setError('Failed to load prayers. Please try again.');
    }
  }, [setPrayers]);

  useEffect(() => {
    setIsLoading(true);
    fetchData().finally(() => setIsLoading(false));
  }, [fetchData]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await fetchData();
    setIsRefreshing(false);
  }, [fetchData]);

  const handleAction = useCallback(async (prayer: PrayerRequest, action: 'approve' | 'remove' | 'feature') => {
    try {
      await moderatePrayer(prayer.id, action);
      if (action === 'approve') {
        useAdminStore.getState().updatePrayer(prayer.id, { isPublic: true });
      } else if (action === 'remove') {
        useAdminStore.getState().updatePrayer(prayer.id, { isPublic: false, status: 'archived' });
      }
    } catch {
      Alert.alert('Error', 'Failed to perform action. Please try again.');
    }
  }, []);

  const handleMarkAnswered = useCallback(async (note: string) => {
    if (!selectedPrayer) return;
    setShowAnswerModal(false);
    try {
      await markPrayerAnsweredAdmin(selectedPrayer.id, note);
      useAdminStore.getState().updatePrayer(selectedPrayer.id, { status: 'answered' });
    } catch {
      Alert.alert('Error', 'Failed to mark prayer as answered.');
    }
  }, [selectedPrayer]);

  const filteredPrayers = prayers.filter((p) => {
    if (filter === 'all') return true;
    if (filter === 'anonymous') return p.isAnonymous;
    return p.status === filter;
  });

  const answeredCount = prayers.filter((p) => p.status === 'answered').length;
  const thisWeek = prayers.filter((p) => {
    const d = new Date(p.createdAt as string);
    return Date.now() - d.getTime() < 7 * 24 * 60 * 60 * 1000;
  }).length;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Prayer Wall Moderation</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Stats bar */}
      <View style={styles.statsBar}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{prayers.length}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{answeredCount}</Text>
          <Text style={styles.statLabel}>Answered</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{thisWeek}</Text>
          <Text style={styles.statLabel}>This Week</Text>
        </View>
      </View>

      {/* Filter tabs */}
      <FlatList
        horizontal
        data={FILTER_TABS}
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
        <ErrorState title="Failed to load prayers" message={error} onRetry={fetchData} />
      ) : (
        <FlatList
          data={filteredPrayers}
          keyExtractor={(p) => p.id}
          renderItem={({ item }) => (
            <PrayerCard
              item={item}
              onApprove={() => handleAction(item, 'approve')}
              onFeature={() => handleAction(item, 'feature')}
              onMarkAnswered={() => { setSelectedPrayer(item); setShowAnswerModal(true); }}
              onRemove={() => {
                Alert.alert('Remove Prayer', 'Remove this prayer from the public wall?', [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Remove', style: 'destructive', onPress: () => handleAction(item, 'remove') },
                ]);
              }}
            />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} tintColor={Colors.primary} />
          }
          ListEmptyComponent={
            <ErrorState icon="heart-outline" title="No prayers" message="No prayer requests match this filter." />
          }
        />
      )}

      <AnswerModal
        visible={showAnswerModal}
        onConfirm={handleMarkAnswered}
        onClose={() => setShowAnswerModal(false)}
      />
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
  headerTitle: { fontSize: FontSizes.md, fontWeight: FontWeights.bold, color: Colors.white },
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
  filterRow: { gap: Spacing[2], paddingHorizontal: Spacing[5], paddingVertical: Spacing[3] },
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
  listContent: { paddingHorizontal: Spacing[5], paddingBottom: Spacing['2xl'], gap: Spacing[3] },
  card: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing[4],
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing[3],
    ...(Shadows.sm as object),
  },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing[3] },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userAvatarText: { fontSize: FontSizes.base, fontWeight: FontWeights.bold, color: Colors.white },
  cardInfo: { flex: 1, gap: 3 },
  badgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing[1] },
  categoryBadge: { paddingHorizontal: Spacing[2], paddingVertical: 2, borderRadius: BorderRadius.full },
  categoryBadgeText: { fontSize: FontSizes.xs, fontWeight: FontWeights.bold, textTransform: 'capitalize' },
  statusBadge: { paddingHorizontal: Spacing[2], paddingVertical: 2, borderRadius: BorderRadius.full },
  statusBadgeText: { fontSize: FontSizes.xs, fontWeight: FontWeights.bold, textTransform: 'capitalize' },
  anonBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: Colors.gray100,
    paddingHorizontal: Spacing[2],
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  anonText: { fontSize: FontSizes.xs, color: Colors.gray500 },
  userName: { fontSize: FontSizes.sm, fontWeight: FontWeights.semibold, color: Colors.textPrimary },
  cardDate: { fontSize: FontSizes.xs, color: Colors.textSecondary },
  prayerCount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#FFF1F2',
    paddingHorizontal: Spacing[2],
    paddingVertical: Spacing[1],
    borderRadius: BorderRadius.full,
  },
  prayerCountText: { fontSize: FontSizes.xs, color: Colors.error, fontWeight: FontWeights.bold },
  cardTitle: { fontSize: FontSizes.base, fontWeight: FontWeights.semibold, color: Colors.textPrimary },
  cardContent: { fontSize: FontSizes.sm, color: Colors.textSecondary, lineHeight: FontSizes.sm * 1.6 },
  actionsRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: Spacing[3],
    gap: Spacing[2],
    flexWrap: 'wrap',
  },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  actionText: { fontSize: FontSizes.xs, fontWeight: FontWeights.semibold },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  answerSheet: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: BorderRadius['2xl'],
    borderTopRightRadius: BorderRadius['2xl'],
    padding: Spacing[5],
    paddingBottom: Spacing[10],
    gap: Spacing[4],
  },
  sheetHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.gray300,
    alignSelf: 'center',
    marginBottom: Spacing[2],
  },
  sheetTitle: { fontSize: FontSizes.xl, fontWeight: FontWeights.bold, color: Colors.textPrimary },
  sheetSubtitle: { fontSize: FontSizes.sm, color: Colors.textSecondary },
  noteInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    padding: Spacing[3],
    fontSize: FontSizes.base,
    color: Colors.textPrimary,
    backgroundColor: Colors.gray50,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  confirmBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing[2],
    backgroundColor: Colors.success,
    paddingVertical: Spacing[4],
    borderRadius: BorderRadius.full,
  },
  confirmBtnText: { fontSize: FontSizes.base, fontWeight: FontWeights.bold, color: Colors.white },
});
