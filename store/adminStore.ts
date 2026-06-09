import { create } from 'zustand';
import { UserProfile, Devotional, Announcement, Group, PrayerRequest, Donation } from '../types';

export interface AdminStats {
  totalUsers: number;
  activeToday: number;
  newThisWeek: number;
  totalDonationsMonth: number;
  devotionalPlaysWeek: number;
  prayerRequestsWeek: number;
}

interface AdminState {
  // Data
  users: UserProfile[];
  devotionals: Devotional[];
  announcements: Announcement[];
  groups: Group[];
  prayers: PrayerRequest[];
  donations: Donation[];
  stats: AdminStats | null;

  // Loading
  isLoading: boolean;
  error: string | null;

  // Setters
  setUsers: (users: UserProfile[]) => void;
  setDevotionals: (devotionals: Devotional[]) => void;
  setAnnouncements: (announcements: Announcement[]) => void;
  setGroups: (groups: Group[]) => void;
  setPrayers: (prayers: PrayerRequest[]) => void;
  setDonations: (donations: Donation[]) => void;
  setStats: (stats: AdminStats) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // Optimistic updates
  updateUserRole: (userId: string, role: string) => void;
  removeUser: (userId: string) => void;
  removeDevotional: (id: string) => void;
  updateDevotional: (id: string, data: Partial<Devotional>) => void;
  addDevotional: (devotional: Devotional) => void;
  removeAnnouncement: (id: string) => void;
  updateAnnouncement: (id: string, data: Partial<Announcement>) => void;
  addAnnouncement: (announcement: Announcement) => void;
  removeGroup: (id: string) => void;
  updateGroup: (id: string, data: Partial<Group>) => void;
  addGroup: (group: Group) => void;
  removePrayer: (id: string) => void;
  updatePrayer: (id: string, data: Partial<PrayerRequest>) => void;
}

export const useAdminStore = create<AdminState>((set) => ({
  // Initial state
  users: [],
  devotionals: [],
  announcements: [],
  groups: [],
  prayers: [],
  donations: [],
  stats: null,
  isLoading: false,
  error: null,

  // Setters
  setUsers: (users) => set({ users }),
  setDevotionals: (devotionals) => set({ devotionals }),
  setAnnouncements: (announcements) => set({ announcements }),
  setGroups: (groups) => set({ groups }),
  setPrayers: (prayers) => set({ prayers }),
  setDonations: (donations) => set({ donations }),
  setStats: (stats) => set({ stats }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),

  // Optimistic updates — Users
  updateUserRole: (userId, role) =>
    set((state) => ({
      users: state.users.map((u) =>
        u.id === userId ? { ...u, role: role as UserProfile['role'] } : u
      ),
    })),

  removeUser: (userId) =>
    set((state) => ({
      users: state.users.filter((u) => u.id !== userId),
    })),

  // Optimistic updates — Devotionals
  removeDevotional: (id) =>
    set((state) => ({
      devotionals: state.devotionals.filter((d) => d.id !== id),
    })),

  updateDevotional: (id, data) =>
    set((state) => ({
      devotionals: state.devotionals.map((d) => (d.id === id ? { ...d, ...data } : d)),
    })),

  addDevotional: (devotional) =>
    set((state) => ({
      devotionals: [devotional, ...state.devotionals],
    })),

  // Optimistic updates — Announcements
  removeAnnouncement: (id) =>
    set((state) => ({
      announcements: state.announcements.filter((a) => a.id !== id),
    })),

  updateAnnouncement: (id, data) =>
    set((state) => ({
      announcements: state.announcements.map((a) => (a.id === id ? { ...a, ...data } : a)),
    })),

  addAnnouncement: (announcement) =>
    set((state) => ({
      announcements: [announcement, ...state.announcements],
    })),

  // Optimistic updates — Groups
  removeGroup: (id) =>
    set((state) => ({
      groups: state.groups.filter((g) => g.id !== id),
    })),

  updateGroup: (id, data) =>
    set((state) => ({
      groups: state.groups.map((g) => (g.id === id ? { ...g, ...data } : g)),
    })),

  addGroup: (group) =>
    set((state) => ({
      groups: [group, ...state.groups],
    })),

  // Optimistic updates — Prayers
  removePrayer: (id) =>
    set((state) => ({
      prayers: state.prayers.filter((p) => p.id !== id),
    })),

  updatePrayer: (id, data) =>
    set((state) => ({
      prayers: state.prayers.map((p) => (p.id === id ? { ...p, ...data } : p)),
    })),
}));
