import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { FontSizes, FontWeights } from '../../constants/fonts';
import { Spacing, BorderRadius, Shadows } from '../../constants/layout';
import { useAdminStore } from '../../store/adminStore';
import { UserProfile, UserRole } from '../../types';
import {
  getAllUsers,
  updateUserRole,
  disableUser,
  deleteUser,
} from '../../services/firebase/admin';
import { ErrorState } from '../../components/common/ErrorState';

type FilterTab = 'all' | UserRole;

const FILTER_TABS: Array<{ value: FilterTab; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'member', label: 'Members' },
  { value: 'leader', label: 'Leaders' },
  { value: 'pastor', label: 'Pastors' },
  { value: 'admin', label: 'Admins' },
];

const ROLE_COLORS: Record<UserRole, string> = {
  member: Colors.gray500,
  leader: '#3B82F6',
  pastor: Colors.primary,
  admin: '#8B5CF6',
};

const ROLES: UserRole[] = ['member', 'leader', 'pastor', 'admin'];

function formatDate(val: Date | string): string {
  if (!val) return '—';
  const d = typeof val === 'string' ? new Date(val) : val;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function getInitial(user: UserProfile): string {
  return (user.displayName ?? user.email ?? 'U').charAt(0).toUpperCase();
}

interface KebabMenuProps {
  user: UserProfile;
  onChangeRole: () => void;
  onDisable: () => void;
  onDelete: () => void;
  onClose: () => void;
}

function KebabMenu({ user, onChangeRole, onDisable, onDelete, onClose }: KebabMenuProps) {
  return (
    <Modal transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={styles.modalOverlay} onPress={onClose} activeOpacity={1}>
        <View style={styles.kebabMenu}>
          <Text style={styles.kebabUserName}>{user.displayName}</Text>
          <TouchableOpacity style={styles.kebabItem} onPress={onChangeRole}>
            <Ionicons name="swap-vertical-outline" size={18} color={Colors.textPrimary} />
            <Text style={styles.kebabItemText}>Change Role</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.kebabItem} onPress={onDisable}>
            <Ionicons name="ban-outline" size={18} color={Colors.warning} />
            <Text style={[styles.kebabItemText, { color: Colors.warning }]}>Disable Account</Text>
          </TouchableOpacity>
          <View style={styles.kebabDivider} />
          <TouchableOpacity style={styles.kebabItem} onPress={onDelete}>
            <Ionicons name="trash-outline" size={18} color={Colors.error} />
            <Text style={[styles.kebabItemText, { color: Colors.error }]}>Delete User</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

interface RoleSheetProps {
  user: UserProfile;
  onSelect: (role: UserRole) => void;
  onClose: () => void;
}

function RoleSheet({ user, onSelect, onClose }: RoleSheetProps) {
  return (
    <Modal transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity style={styles.modalOverlay} onPress={onClose} activeOpacity={1}>
        <View style={styles.roleSheet}>
          <View style={styles.roleSheetHandle} />
          <Text style={styles.roleSheetTitle}>Change Role</Text>
          <Text style={styles.roleSheetSubtitle}>
            Current: <Text style={{ color: ROLE_COLORS[user.role], fontWeight: FontWeights.semibold }}>{user.role}</Text>
          </Text>
          {ROLES.map((role) => (
            <TouchableOpacity
              key={role}
              style={[styles.roleOption, user.role === role && styles.roleOptionActive]}
              onPress={() => onSelect(role)}
            >
              <View style={[styles.roleOptionDot, { backgroundColor: ROLE_COLORS[role] }]} />
              <Text style={[styles.roleOptionText, user.role === role && { color: Colors.primary, fontWeight: FontWeights.bold }]}>
                {role.charAt(0).toUpperCase() + role.slice(1)}
              </Text>
              {user.role === role && <Ionicons name="checkmark" size={18} color={Colors.primary} />}
            </TouchableOpacity>
          ))}
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

interface UserCardProps {
  user: UserProfile;
  onKebab: () => void;
}

function UserCard({ user, onKebab }: UserCardProps) {
  return (
    <View style={styles.userCard}>
      <View style={styles.userAvatar}>
        <Text style={styles.userAvatarText}>{getInitial(user)}</Text>
      </View>
      <View style={styles.userInfo}>
        <View style={styles.userNameRow}>
          <Text style={styles.userName} numberOfLines={1}>{user.displayName ?? 'No name'}</Text>
          <View style={[styles.roleBadge, { backgroundColor: ROLE_COLORS[user.role] + '20' }]}>
            <Text style={[styles.roleBadgeText, { color: ROLE_COLORS[user.role] }]}>
              {user.role}
            </Text>
          </View>
        </View>
        <Text style={styles.userEmail} numberOfLines={1}>{user.email}</Text>
        <View style={styles.userMeta}>
          <Text style={styles.userMetaText}>
            Last active: {formatDate(user.lastActiveAt)}
          </Text>
          <Text style={styles.userMetaText}>
            XP: {user.spiritualGrowthScore ?? 0}
          </Text>
        </View>
      </View>
      <TouchableOpacity onPress={onKebab} style={styles.kebabBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
        <Ionicons name="ellipsis-vertical" size={18} color={Colors.gray400} />
      </TouchableOpacity>
    </View>
  );
}

export default function UsersScreen() {
  const insets = useSafeAreaInsets();
  const { users, setUsers } = useAdminStore();
  const [filter, setFilter] = useState<FilterTab>('all');
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [showKebab, setShowKebab] = useState(false);
  const [showRoleSheet, setShowRoleSheet] = useState(false);

  const fetchUsers = useCallback(async (roleFilter?: FilterTab) => {
    try {
      setError(null);
      const role = roleFilter && roleFilter !== 'all' ? roleFilter : undefined;
      const data = await getAllUsers(role);
      setUsers(data);
    } catch (err) {
      setError('Failed to load users. Please try again.');
    }
  }, [setUsers]);

  useEffect(() => {
    setIsLoading(true);
    fetchUsers().finally(() => setIsLoading(false));
  }, [fetchUsers]);

  useEffect(() => {
    if (!isLoading) fetchUsers(filter);
  }, [filter]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await fetchUsers(filter);
    setIsRefreshing(false);
  }, [filter, fetchUsers]);

  const handleChangeRole = useCallback(async (role: UserRole) => {
    if (!selectedUser) return;
    setShowRoleSheet(false);
    try {
      await updateUserRole(selectedUser.id, role);
      useAdminStore.getState().updateUserRole(selectedUser.id, role);
    } catch {
      Alert.alert('Error', 'Failed to update role. Please try again.');
    }
  }, [selectedUser]);

  const handleDisable = useCallback(async () => {
    if (!selectedUser) return;
    setShowKebab(false);
    Alert.alert(
      'Disable Account',
      `Disable ${selectedUser.displayName}'s account?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Disable',
          style: 'destructive',
          onPress: async () => {
            try {
              await disableUser(selectedUser.id);
              Alert.alert('Done', 'Account disabled.');
            } catch {
              Alert.alert('Error', 'Failed to disable account.');
            }
          },
        },
      ]
    );
  }, [selectedUser]);

  const handleDelete = useCallback(async () => {
    if (!selectedUser) return;
    setShowKebab(false);
    Alert.alert(
      'Delete User',
      `Permanently delete ${selectedUser.displayName}? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteUser(selectedUser.id);
              useAdminStore.getState().removeUser(selectedUser.id);
            } catch {
              Alert.alert('Error', 'Failed to delete user.');
            }
          },
        },
      ]
    );
  }, [selectedUser]);

  const filteredUsers = users.filter((u) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      (u.displayName ?? '').toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q)
    );
  });

  const newLast7 = users.filter((u) => {
    const d = new Date(u.joinedAt as string);
    return Date.now() - d.getTime() < 7 * 24 * 60 * 60 * 1000;
  }).length;

  const activeLast30 = users.filter((u) => {
    const d = new Date(u.lastActiveAt as string);
    return Date.now() - d.getTime() < 30 * 24 * 60 * 60 * 1000;
  }).length;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>User Management</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Stats bar */}
      <View style={styles.statsBar}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{users.length}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{activeLast30}</Text>
          <Text style={styles.statLabel}>Active (30d)</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{newLast7}</Text>
          <Text style={styles.statLabel}>New (7d)</Text>
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchWrap}>
        <Ionicons name="search-outline" size={18} color={Colors.gray400} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name or email..."
          placeholderTextColor={Colors.gray400}
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={18} color={Colors.gray400} />
          </TouchableOpacity>
        )}
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
        <ErrorState title="Failed to load users" message={error} onRetry={() => fetchUsers(filter)} />
      ) : (
        <FlatList
          data={filteredUsers}
          keyExtractor={(u) => u.id}
          renderItem={({ item }) => (
            <UserCard
              user={item}
              onKebab={() => { setSelectedUser(item); setShowKebab(true); }}
            />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} tintColor={Colors.primary} />
          }
          ListEmptyComponent={
            <ErrorState
              icon="people-outline"
              title="No users found"
              message={search ? 'Try a different search term.' : 'No users match this filter.'}
            />
          }
        />
      )}

      {selectedUser && showKebab && (
        <KebabMenu
          user={selectedUser}
          onChangeRole={() => { setShowKebab(false); setShowRoleSheet(true); }}
          onDisable={handleDisable}
          onDelete={handleDelete}
          onClose={() => setShowKebab(false)}
        />
      )}

      {selectedUser && showRoleSheet && (
        <RoleSheet
          user={selectedUser}
          onSelect={handleChangeRole}
          onClose={() => setShowRoleSheet(false)}
        />
      )}
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
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.bold,
    color: Colors.white,
  },
  statsBar: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    paddingVertical: Spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: FontSizes.xl,
    fontWeight: FontWeights.bold,
    color: Colors.textPrimary,
  },
  statLabel: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
  },
  statDivider: {
    width: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing[1],
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    marginHorizontal: Spacing[5],
    marginTop: Spacing[4],
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[2],
  },
  searchIcon: {
    marginRight: Spacing[2],
  },
  searchInput: {
    flex: 1,
    fontSize: FontSizes.base,
    color: Colors.textPrimary,
    paddingVertical: Spacing[1],
  },
  filterRow: {
    gap: Spacing[2],
    paddingHorizontal: Spacing[5],
    paddingVertical: Spacing[4],
  },
  filterTab: {
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[2],
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.white,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  filterTabActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterTabText: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.semibold,
    color: Colors.textSecondary,
  },
  filterTabTextActive: {
    color: Colors.white,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    paddingHorizontal: Spacing[5],
    paddingBottom: Spacing['2xl'],
    gap: Spacing[3],
  },
  userCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing[4],
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
    borderWidth: 1,
    borderColor: Colors.border,
    ...(Shadows.sm as object),
  },
  userAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userAvatarText: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.bold,
    color: Colors.white,
  },
  userInfo: {
    flex: 1,
    gap: 3,
  },
  userNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
  },
  userName: {
    fontSize: FontSizes.base,
    fontWeight: FontWeights.semibold,
    color: Colors.textPrimary,
    flex: 1,
  },
  roleBadge: {
    paddingHorizontal: Spacing[2],
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  roleBadgeText: {
    fontSize: FontSizes.xs,
    fontWeight: FontWeights.bold,
    textTransform: 'capitalize',
  },
  userEmail: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
  },
  userMeta: {
    flexDirection: 'row',
    gap: Spacing[4],
  },
  userMetaText: {
    fontSize: FontSizes.xs,
    color: Colors.gray400,
  },
  kebabBtn: {
    padding: Spacing[1],
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  kebabMenu: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: BorderRadius['2xl'],
    borderTopRightRadius: BorderRadius['2xl'],
    padding: Spacing[4],
    paddingBottom: Spacing[8],
  },
  kebabUserName: {
    fontSize: FontSizes.base,
    fontWeight: FontWeights.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing[3],
    paddingHorizontal: Spacing[2],
  },
  kebabItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
    paddingVertical: Spacing[4],
    paddingHorizontal: Spacing[2],
    borderRadius: BorderRadius.lg,
  },
  kebabItemText: {
    fontSize: FontSizes.base,
    color: Colors.textPrimary,
    fontWeight: FontWeights.medium,
  },
  kebabDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing[1],
  },
  roleSheet: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: BorderRadius['2xl'],
    borderTopRightRadius: BorderRadius['2xl'],
    padding: Spacing[5],
    paddingBottom: Spacing[10],
    gap: Spacing[1],
  },
  roleSheetHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.gray300,
    alignSelf: 'center',
    marginBottom: Spacing[3],
  },
  roleSheetTitle: {
    fontSize: FontSizes.xl,
    fontWeight: FontWeights.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing[1],
  },
  roleSheetSubtitle: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing[4],
  },
  roleOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
    paddingVertical: Spacing[4],
    paddingHorizontal: Spacing[3],
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  roleOptionActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.light,
  },
  roleOptionDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  roleOptionText: {
    flex: 1,
    fontSize: FontSizes.base,
    color: Colors.textPrimary,
    fontWeight: FontWeights.medium,
  },
});
