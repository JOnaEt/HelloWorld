import { create } from 'zustand';
import { Devotional, DevotionalCategory, ListenedRecord } from '../types';

interface PlayerState {
  isPlaying: boolean;
  currentPosition: number; // seconds
  duration: number; // seconds
  playbackSpeed: number;
  sleepTimerMinutes: number | null;
  sleepTimerActive: boolean;
}

interface DevotionalState {
  // Daily devotional
  dailyDevotional: Devotional | null;
  isDailyLoading: boolean;

  // Library
  devotionals: Devotional[];
  filteredDevotionals: Devotional[];
  selectedCategory: DevotionalCategory | 'all';
  searchQuery: string;
  isLibraryLoading: boolean;

  // Current devotional
  currentDevotional: Devotional | null;
  isDetailLoading: boolean;

  // Trending
  trendingDevotionals: Devotional[];

  // Recently listened
  recentlyListened: ListenedRecord[];

  // Player state
  player: PlayerState;

  // Errors
  error: string | null;

  // Actions
  setDailyDevotional: (devotional: Devotional | null) => void;
  setDailyLoading: (isLoading: boolean) => void;
  setDevotionals: (devotionals: Devotional[]) => void;
  setFilteredDevotionals: (devotionals: Devotional[]) => void;
  setSelectedCategory: (category: DevotionalCategory | 'all') => void;
  setSearchQuery: (query: string) => void;
  setLibraryLoading: (isLoading: boolean) => void;
  setCurrentDevotional: (devotional: Devotional | null) => void;
  setDetailLoading: (isLoading: boolean) => void;
  setTrendingDevotionals: (devotionals: Devotional[]) => void;
  setRecentlyListened: (records: ListenedRecord[]) => void;
  updatePlayerState: (update: Partial<PlayerState>) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

const defaultPlayerState: PlayerState = {
  isPlaying: false,
  currentPosition: 0,
  duration: 0,
  playbackSpeed: 1.0,
  sleepTimerMinutes: null,
  sleepTimerActive: false,
};

export const useDevotionalStore = create<DevotionalState>((set) => ({
  dailyDevotional: null,
  isDailyLoading: false,
  devotionals: [],
  filteredDevotionals: [],
  selectedCategory: 'all',
  searchQuery: '',
  isLibraryLoading: false,
  currentDevotional: null,
  isDetailLoading: false,
  trendingDevotionals: [],
  recentlyListened: [],
  player: defaultPlayerState,
  error: null,

  setDailyDevotional: (dailyDevotional) => set({ dailyDevotional }),
  setDailyLoading: (isDailyLoading) => set({ isDailyLoading }),
  setDevotionals: (devotionals) => set({ devotionals }),
  setFilteredDevotionals: (filteredDevotionals) => set({ filteredDevotionals }),
  setSelectedCategory: (selectedCategory) => set({ selectedCategory }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setLibraryLoading: (isLibraryLoading) => set({ isLibraryLoading }),
  setCurrentDevotional: (currentDevotional) => set({ currentDevotional }),
  setDetailLoading: (isDetailLoading) => set({ isDetailLoading }),
  setTrendingDevotionals: (trendingDevotionals) => set({ trendingDevotionals }),
  setRecentlyListened: (recentlyListened) => set({ recentlyListened }),

  updatePlayerState: (update) =>
    set((state) => ({
      player: { ...state.player, ...update },
    })),

  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),
}));
