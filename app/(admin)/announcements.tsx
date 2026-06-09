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
import { Announcement, AnnouncementType, AnnouncementPriority } from '../../types';
import {
  getAllAnnouncementsAdmin,
  deleteAnnouncement,
  pinAnnouncement,
} from '../../services/firebase/admin';
import { ErrorState } from '../../components/common/ErrorState';

const TYPE_COLORS: Record<AnnouncementType, string> = {
  event: '#3B82F6',
  service: Colors.primary,
  news: '#8B5CF6',
  alert: '#EF4444',
  giving: '#F59E0B',
};

const TYPE_ICONS: Record<AnnouncementType, React.ComponentProps<typeof Ionicons>['name']> = {
  event: 'calendar-outline',
  service: 'mic-outline',
  news: 'newspaper-outline',
  alert: 'alert-circle-outline',
  giving: 'heart-outline',
};

const PRIORITY_COLORS: Record<AnnouncementPriority, string> = {
  low: Colors.gray400,
  medium: '#F59E0B',
  high: '#EF4444',
  urgent: '#DC2626',
};

function formatDate(val: Date | string): string {
  if (!val) return '—';
  const d = typeof val === 'string' ? new Date(val) : val;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

interface AnnouncementCardProps {
  item: Announcement;
  onEdit: () => void;
  onPin: () => void;
  onDelete: () => void;
  onSendPush: () => void;
}

function AnnouncementCard({ item, onEdit, onPin, onDelete, onSendPush }: AnnouncementCardProps) {
  const typeColor = TYPE_COLORS[item.type];
  const typeIcon = TYPE_ICONS[item.type];
  const priorityColor = PRIORITY_COLORS[item.priority];

  return (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <View style={[styles.typeIconWrap, { backgroundColor: typeColor + '18' }]}>
          <Ionicons name={typeIcon} size={20} color={typeColor} />
        </View>
        <View style={styles.cardInfo}>
          <View style={styles.badgeRow}>
            <View style={[styles.typeBadge, { backgroundColor: typeColor + '20' }]}>
              <Text style={[styles.typeBadgeText, { color: typeColor }]}>{item.type}</Text>
            </View>
            <View style={[styles.priorityBadge, { backgroundColor: priorityColor + '20' }]}>
              <Text style={[styles.priorityBadgeText, { color: priorityColor }]}>{item.priority}</Text>
            </View>
            {item.isPinned && (
              <View style={styles.pinnedBadge}>
                <Ionicons name="pin" size={10} color={Colors.primary} />
                <Text style={styles.pinnedText}>Pinned</Text>
              </View>
            )}
          </View>
          <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
          <Text style={styles.cardExcerpt} numberOfLines={2}>{item.content}</Text>
          <View style={styles.cardMeta}>
            <Text style={styles.cardMetaText}>{item.author.name}</Text>
            <Text style={styles.cardMetaText}>{formatDate(item.publishedAt)}</Text>
          </View>
        </View>
      </View>

      <View style={styles.actionsRow}>
        <TouchableOpacity style={styles.actionBtn} onPress={onEdit}>
          <Ionicons name="pencil-outline" size={14} color={Colors.primary} />
          <Text style={[styles.actionText, { color: Colors.primary }]}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={onPin}>
          <Ionicons name={item.isPinned ? 'pin' : 'pin-outline'} size={14} color="#3B82F6" />
          <Text style={[styles.actionText, { color: '#3B82F6' }]}>{item.isPinned ? 'Unpin' : 'Pin'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={onSendPush}>
          <Ionicons name="notifications-outline" size={14} color="#8B5CF6" />
          <Text style={[styles.actionText, { color: '#8B5CF6' }]}>Push</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={onDelete}>
          <Ionicons name="trash-outline" size={14} color={Colors.error} />
          <Text style={[styles.actionText, { color: Colors.error }]}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function AnnouncementsAdminScreen() {
  const insets = useSafeAreaInsets();
  const { announcements, setAnnouncements } = useAdminStore();
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setError(null);
      const data = await getAllAnnouncementsAdmin();
      setAnnouncements(data);
    } catch {
      setError('Failed to load announcements. Please try again.');
    }
  }, [setAnnouncements]);

  useEffect(() => {
    setIsLoading(true);
    fetchData().finally(() => setIsLoading(false));
  }, [fetchData]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await fetchData();
    setIsRefreshing(false);
  }, [fetchData]);

  const handlePin = useCallback(async (item: Announcement) => {
    try {
      const newPinned = !item.isPinned;
      await pinAnnouncement(item.id, newPinned);
      useAdminStore.getState().updateAnnouncement(item.id, { isPinned: newPinned });
    } catch {
      Alert.alert('Error', 'Failed to update announcement.');
    }
  }, []);

  const handleDelete = useCallback((item: Announcement) => {
    Alert.alert(
      'Delete Announcement',
      `Delete "${item.title}"? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteAnnouncement(item.id);
              useAdminStore.getState().removeAnnouncement(item.id);
            } catch {
              Alert.alert('Error', 'Failed to delete announcement.');
            }
          },
        },
      ]
    );
  }, []);

  const handleSendPush = useCallback((item: Announcement) => {
    Alert.alert(
      'Send Push Notification',
      `Send push notification for "${item.title}" to all members?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send',
          onPress: () => Alert.alert('Sent', 'Push notification queued successfully.'),
        },
      ]
    );
  }, []);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Announcements</Text>
        <TouchableOpacity
          style={styles.createBtn}
          onPress={() => router.push('/(admin)/announcements/create')}
        >
          <Ionicons name="add" size={20} color={Colors.white} />
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : error ? (
        <ErrorState title="Failed to load" message={error} onRetry={fetchData} />
      ) : (
        <FlatList
          data={announcements}
          keyExtractor={(a) => a.id}
          renderItem={({ item }) => (
            <AnnouncementCard
              item={item}
              onEdit={() => router.push(`/(admin)/announcements/create?id=${item.id}` as Parameters<typeof router.push>[0])}
              onPin={() => handlePin(item)}
              onDelete={() => handleDelete(item)}
              onSendPush={() => handleSendPush(item)}
            />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} tintColor={Colors.primary} />
          }
          ListEmptyComponent={
            <ErrorState
              icon="megaphone-outline"
              title="No announcements"
              message="Create your first announcement to keep members informed."
            />
          }
        />
      )}

      {/* FAB */}
      <TouchableOpacity
        style={[styles.fab, { bottom: insets.bottom + Spacing[5] }]}
        onPress={() => router.push('/(admin)/announcements/create')}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={24} color={Colors.white} />
        <Text style={styles.fabText}>Create Announcement</Text>
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
  centerContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  listContent: { paddingHorizontal: Spacing[5], paddingTop: Spacing[4], paddingBottom: 100, gap: Spacing[3] },
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
  typeIconWrap: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardInfo: { flex: 1, gap: Spacing[1] },
  badgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing[1], marginBottom: 2 },
  typeBadge: { paddingHorizontal: Spacing[2], paddingVertical: 2, borderRadius: BorderRadius.full },
  typeBadgeText: { fontSize: FontSizes.xs, fontWeight: FontWeights.bold, textTransform: 'capitalize' },
  priorityBadge: { paddingHorizontal: Spacing[2], paddingVertical: 2, borderRadius: BorderRadius.full },
  priorityBadgeText: { fontSize: FontSizes.xs, fontWeight: FontWeights.bold, textTransform: 'capitalize' },
  pinnedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: Colors.light,
    paddingHorizontal: Spacing[2],
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  pinnedText: { fontSize: FontSizes.xs, color: Colors.primary, fontWeight: FontWeights.semibold },
  cardTitle: { fontSize: FontSizes.base, fontWeight: FontWeights.semibold, color: Colors.textPrimary, lineHeight: FontSizes.base * 1.3 },
  cardExcerpt: { fontSize: FontSizes.sm, color: Colors.textSecondary, lineHeight: FontSizes.sm * 1.5 },
  cardMeta: { flexDirection: 'row', gap: Spacing[4] },
  cardMetaText: { fontSize: FontSizes.xs, color: Colors.gray400 },
  actionsRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: Spacing[3],
    gap: Spacing[2],
  },
  actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4 },
  actionText: { fontSize: FontSizes.xs, fontWeight: FontWeights.semibold },
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
