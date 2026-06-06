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
import { Group } from '../../types';
import { getAllGroupsAdmin, deleteGroup } from '../../services/firebase/admin';
import { ErrorState } from '../../components/common/ErrorState';
import { StatCard } from '../../components/admin/StatCard';

function formatDate(val: Date | string): string {
  if (!val) return '—';
  const d = typeof val === 'string' ? new Date(val) : val;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

interface GroupCardProps {
  item: Group;
  onEdit: () => void;
  onDelete: () => void;
  onViewAttendance: () => void;
}

function GroupCard({ item, onEdit, onDelete, onViewAttendance }: GroupCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <View style={styles.groupIconWrap}>
          <Ionicons name="people-circle-outline" size={28} color={Colors.primary} />
        </View>
        <View style={styles.cardInfo}>
          <View style={styles.cardBadgeRow}>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryBadgeText}>{item.category.replace('-', ' ')}</Text>
            </View>
            {!item.isActive && (
              <View style={styles.inactiveBadge}>
                <Text style={styles.inactiveBadgeText}>Inactive</Text>
              </View>
            )}
          </View>
          <Text style={styles.cardTitle} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.cardLeader} numberOfLines={1}>
            Leader: {item.leader?.name ?? '—'}
          </Text>
        </View>
      </View>

      <View style={styles.metaRow}>
        <View style={styles.metaItem}>
          <Ionicons name="people-outline" size={13} color={Colors.gray400} />
          <Text style={styles.metaText}>
            {item.memberCount}{item.maxMembers ? `/${item.maxMembers}` : ''} members
          </Text>
        </View>
        <View style={styles.metaItem}>
          <Ionicons name="calendar-outline" size={13} color={Colors.gray400} />
          <Text style={styles.metaText}>
            {item.meetingSchedule?.dayOfWeek ?? '—'} {item.meetingSchedule?.time ?? ''}
          </Text>
        </View>
        {item.isOnline && (
          <View style={styles.metaItem}>
            <Ionicons name="globe-outline" size={13} color="#3B82F6" />
            <Text style={[styles.metaText, { color: '#3B82F6' }]}>Online</Text>
          </View>
        )}
      </View>

      <View style={styles.actionsRow}>
        <TouchableOpacity style={styles.actionBtn} onPress={onEdit}>
          <Ionicons name="pencil-outline" size={14} color={Colors.primary} />
          <Text style={[styles.actionText, { color: Colors.primary }]}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={onViewAttendance}>
          <Ionicons name="clipboard-outline" size={14} color="#3B82F6" />
          <Text style={[styles.actionText, { color: '#3B82F6' }]}>Attendance</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={onDelete}>
          <Ionicons name="trash-outline" size={14} color={Colors.error} />
          <Text style={[styles.actionText, { color: Colors.error }]}>Disable</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function GroupsAdminScreen() {
  const insets = useSafeAreaInsets();
  const { groups, setGroups } = useAdminStore();
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setError(null);
      const data = await getAllGroupsAdmin();
      setGroups(data);
    } catch {
      setError('Failed to load groups. Please try again.');
    }
  }, [setGroups]);

  useEffect(() => {
    setIsLoading(true);
    fetchData().finally(() => setIsLoading(false));
  }, [fetchData]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await fetchData();
    setIsRefreshing(false);
  }, [fetchData]);

  const handleDelete = useCallback((item: Group) => {
    Alert.alert(
      'Disable Group',
      `Disable "${item.name}"? Members will no longer see it.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Disable',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteGroup(item.id);
              useAdminStore.getState().updateGroup(item.id, { isActive: false });
            } catch {
              Alert.alert('Error', 'Failed to disable group.');
            }
          },
        },
      ]
    );
  }, []);

  const totalMembers = groups.reduce((s, g) => s + (g.memberCount ?? 0), 0);
  const activeGroups = groups.filter((g) => g.isActive).length;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Communities</Text>
        <TouchableOpacity
          style={styles.createBtn}
          onPress={() => router.push('/(admin)/groups/create')}
        >
          <Ionicons name="add" size={20} color={Colors.white} />
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={styles.statsSection}>
        <View style={styles.statsRow}>
          <StatCard
            title="Total Groups"
            value={groups.length}
            icon="people-circle-outline"
            color="#3B82F6"
          />
          <StatCard
            title="Active"
            value={activeGroups}
            icon="checkmark-circle-outline"
            color={Colors.primary}
          />
          <StatCard
            title="Total Members"
            value={totalMembers}
            icon="person-outline"
            color="#8B5CF6"
          />
        </View>
      </View>

      {isLoading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : error ? (
        <ErrorState title="Failed to load" message={error} onRetry={fetchData} />
      ) : (
        <FlatList
          data={groups}
          keyExtractor={(g) => g.id}
          renderItem={({ item }) => (
            <GroupCard
              item={item}
              onEdit={() => router.push(`/(admin)/groups/create?id=${item.id}` as Parameters<typeof router.push>[0])}
              onDelete={() => handleDelete(item)}
              onViewAttendance={() => Alert.alert('Attendance', 'View attendance for ' + item.name)}
            />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} tintColor={Colors.primary} />
          }
          ListEmptyComponent={
            <ErrorState icon="people-circle-outline" title="No groups" message="Create your first community group." />
          }
        />
      )}

      {/* FAB */}
      <TouchableOpacity
        style={[styles.fab, { bottom: insets.bottom + Spacing[5] }]}
        onPress={() => router.push('/(admin)/groups/create')}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={24} color={Colors.white} />
        <Text style={styles.fabText}>Create Group</Text>
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
  statsSection: {
    padding: Spacing[4],
    paddingBottom: Spacing[2],
  },
  statsRow: { flexDirection: 'row', gap: Spacing[3] },
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
  groupIconWrap: {
    width: 52,
    height: 52,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.light,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardInfo: { flex: 1, gap: 4 },
  cardBadgeRow: { flexDirection: 'row', gap: Spacing[2] },
  categoryBadge: {
    backgroundColor: Colors.primary + '18',
    paddingHorizontal: Spacing[2],
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  categoryBadgeText: { fontSize: FontSizes.xs, color: Colors.primary, fontWeight: FontWeights.semibold, textTransform: 'capitalize' },
  inactiveBadge: {
    backgroundColor: Colors.error + '18',
    paddingHorizontal: Spacing[2],
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  inactiveBadgeText: { fontSize: FontSizes.xs, color: Colors.error, fontWeight: FontWeights.semibold },
  cardTitle: { fontSize: FontSizes.base, fontWeight: FontWeights.bold, color: Colors.textPrimary },
  cardLeader: { fontSize: FontSizes.sm, color: Colors.textSecondary },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing[4] },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: FontSizes.xs, color: Colors.textSecondary },
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
