import { create } from 'zustand';
import { Group, GroupMember, GroupCategory } from '../types';

interface GroupState {
  // All groups
  groups: Group[];
  filteredGroups: Group[];
  selectedCategory: GroupCategory | 'all';
  searchQuery: string;
  isGroupsLoading: boolean;

  // User's groups
  myGroups: Group[];
  isMyGroupsLoading: boolean;

  // Current group
  currentGroup: Group | null;
  currentGroupMembers: GroupMember[];
  isDetailLoading: boolean;

  // Featured
  featuredGroups: Group[];

  // Joined state
  joinedGroupIds: string[];

  // Error
  error: string | null;

  // Actions
  setGroups: (groups: Group[]) => void;
  setFilteredGroups: (groups: Group[]) => void;
  setSelectedCategory: (category: GroupCategory | 'all') => void;
  setSearchQuery: (query: string) => void;
  setGroupsLoading: (isLoading: boolean) => void;
  setMyGroups: (groups: Group[]) => void;
  setMyGroupsLoading: (isLoading: boolean) => void;
  setCurrentGroup: (group: Group | null) => void;
  setCurrentGroupMembers: (members: GroupMember[]) => void;
  setDetailLoading: (isLoading: boolean) => void;
  setFeaturedGroups: (groups: Group[]) => void;
  addJoinedGroupId: (groupId: string) => void;
  removeJoinedGroupId: (groupId: string) => void;
  setJoinedGroupIds: (ids: string[]) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const useGroupStore = create<GroupState>((set) => ({
  groups: [],
  filteredGroups: [],
  selectedCategory: 'all',
  searchQuery: '',
  isGroupsLoading: false,
  myGroups: [],
  isMyGroupsLoading: false,
  currentGroup: null,
  currentGroupMembers: [],
  isDetailLoading: false,
  featuredGroups: [],
  joinedGroupIds: [],
  error: null,

  setGroups: (groups) => set({ groups }),
  setFilteredGroups: (filteredGroups) => set({ filteredGroups }),
  setSelectedCategory: (selectedCategory) => set({ selectedCategory }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setGroupsLoading: (isGroupsLoading) => set({ isGroupsLoading }),
  setMyGroups: (myGroups) => set({ myGroups }),
  setMyGroupsLoading: (isMyGroupsLoading) => set({ isMyGroupsLoading }),
  setCurrentGroup: (currentGroup) => set({ currentGroup }),
  setCurrentGroupMembers: (currentGroupMembers) => set({ currentGroupMembers }),
  setDetailLoading: (isDetailLoading) => set({ isDetailLoading }),
  setFeaturedGroups: (featuredGroups) => set({ featuredGroups }),

  addJoinedGroupId: (groupId) =>
    set((state) => ({
      joinedGroupIds: [...state.joinedGroupIds, groupId],
    })),

  removeJoinedGroupId: (groupId) =>
    set((state) => ({
      joinedGroupIds: state.joinedGroupIds.filter((id) => id !== groupId),
    })),

  setJoinedGroupIds: (joinedGroupIds) => set({ joinedGroupIds }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),
}));
