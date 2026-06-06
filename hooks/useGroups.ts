import { useCallback } from 'react';
import { useGroupStore } from '../store/groupStore';
import { useAuthStore } from '../store/authStore';
import {
  getAllGroups,
  getGroupsByCategory,
  getGroupById,
  getGroupMembers,
  joinGroup,
  leaveGroup,
  createGroup,
  getFeaturedGroups,
  getUserGroups,
} from '../services/firebase/groups';
import { Group, GroupCategory } from '../types';

export function useGroups() {
  const store = useGroupStore();
  const { user } = useAuthStore();

  // ─── Fetch Groups ───────────────────────────────────────────────────────────

  const fetchAllGroups = useCallback(async () => {
    store.setGroupsLoading(true);
    try {
      const groups = await getAllGroups();
      store.setGroups(groups);
      store.setFilteredGroups(groups);
    } catch (err: unknown) {
      store.setError(err instanceof Error ? err.message : 'Failed to load groups');
    } finally {
      store.setGroupsLoading(false);
    }
  }, []);

  const fetchMyGroups = useCallback(async () => {
    if (!user) return;
    store.setMyGroupsLoading(true);
    try {
      const groups = await getUserGroups(user.uid);
      store.setMyGroups(groups);
      store.setJoinedGroupIds(groups.map((g) => g.id));
    } catch (err: unknown) {
      store.setError(err instanceof Error ? err.message : 'Failed to load your groups');
    } finally {
      store.setMyGroupsLoading(false);
    }
  }, [user]);

  const fetchFeaturedGroups = useCallback(async () => {
    try {
      const groups = await getFeaturedGroups(5);
      store.setFeaturedGroups(groups);
    } catch {
      // silently fail
    }
  }, []);

  const filterByCategory = useCallback(
    async (category: GroupCategory | 'all') => {
      store.setSelectedCategory(category);
      store.setGroupsLoading(true);
      try {
        let groups: Group[];
        if (category === 'all') {
          groups = await getAllGroups();
        } else {
          groups = await getGroupsByCategory(category);
        }
        store.setFilteredGroups(groups);
      } catch {
        store.setFilteredGroups([]);
      } finally {
        store.setGroupsLoading(false);
      }
    },
    []
  );

  const searchGroups = useCallback(
    (query: string) => {
      store.setSearchQuery(query);
      if (!query.trim()) {
        store.setFilteredGroups(store.groups);
        return;
      }
      const lower = query.toLowerCase();
      const filtered = store.groups.filter(
        (g) =>
          g.name.toLowerCase().includes(lower) ||
          g.description.toLowerCase().includes(lower) ||
          g.category.toLowerCase().includes(lower) ||
          g.tags.some((t) => t.toLowerCase().includes(lower))
      );
      store.setFilteredGroups(filtered);
    },
    [store.groups]
  );

  // ─── Group Detail ───────────────────────────────────────────────────────────

  const fetchGroupDetail = useCallback(async (groupId: string) => {
    store.setDetailLoading(true);
    try {
      const [group, members] = await Promise.all([
        getGroupById(groupId),
        getGroupMembers(groupId),
      ]);
      store.setCurrentGroup(group);
      store.setCurrentGroupMembers(members);
    } catch (err: unknown) {
      store.setError(err instanceof Error ? err.message : 'Failed to load group');
    } finally {
      store.setDetailLoading(false);
    }
  }, []);

  // ─── Join / Leave ───────────────────────────────────────────────────────────

  const join = useCallback(
    async (groupId: string) => {
      if (!user) return;
      try {
        await joinGroup(groupId, user.uid, {
          id: user.uid,
          displayName: user.displayName,
          photoURL: user.photoURL,
        });
        store.addJoinedGroupId(groupId);
        // Update member count in store
        if (store.currentGroup?.id === groupId) {
          store.setCurrentGroup({
            ...store.currentGroup,
            memberCount: store.currentGroup.memberCount + 1,
          });
        }
      } catch (err: unknown) {
        store.setError(err instanceof Error ? err.message : 'Failed to join group');
        throw err;
      }
    },
    [user, store]
  );

  const leave = useCallback(
    async (groupId: string) => {
      if (!user) return;
      try {
        await leaveGroup(groupId, user.uid);
        store.removeJoinedGroupId(groupId);
        if (store.currentGroup?.id === groupId) {
          store.setCurrentGroup({
            ...store.currentGroup,
            memberCount: Math.max(0, store.currentGroup.memberCount - 1),
          });
        }
      } catch (err: unknown) {
        store.setError(err instanceof Error ? err.message : 'Failed to leave group');
        throw err;
      }
    },
    [user, store]
  );

  const createNewGroup = useCallback(
    async (groupData: Omit<Group, 'id'>) => {
      if (!user) return null;
      try {
        const id = await createGroup(groupData);
        await fetchAllGroups();
        return id;
      } catch (err: unknown) {
        store.setError(err instanceof Error ? err.message : 'Failed to create group');
        return null;
      }
    },
    [user, fetchAllGroups]
  );

  const isJoined = useCallback(
    (groupId: string) => store.joinedGroupIds.includes(groupId),
    [store.joinedGroupIds]
  );

  return {
    // State
    groups: store.groups,
    filteredGroups: store.filteredGroups,
    selectedCategory: store.selectedCategory,
    searchQuery: store.searchQuery,
    isGroupsLoading: store.isGroupsLoading,
    myGroups: store.myGroups,
    isMyGroupsLoading: store.isMyGroupsLoading,
    currentGroup: store.currentGroup,
    currentGroupMembers: store.currentGroupMembers,
    isDetailLoading: store.isDetailLoading,
    featuredGroups: store.featuredGroups,
    error: store.error,

    // Actions
    fetchAllGroups,
    fetchMyGroups,
    fetchFeaturedGroups,
    filterByCategory,
    searchGroups,
    fetchGroupDetail,
    join,
    leave,
    createNewGroup,
    isJoined,
    clearError: store.clearError,
  };
}
