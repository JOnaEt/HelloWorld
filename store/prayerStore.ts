import { create } from 'zustand';
import { PrayerRequest, PrayerCategory, PrayerStatus } from '../types';

type PrayerTab = 'all' | 'answered' | 'mine';

interface PrayerState {
  // Prayer wall
  prayers: PrayerRequest[];
  answeredPrayers: PrayerRequest[];
  myPrayers: PrayerRequest[];
  activeTab: PrayerTab;
  isLoading: boolean;

  // Current prayer
  currentPrayer: PrayerRequest | null;
  isDetailLoading: boolean;

  // Form state
  isSubmitting: boolean;
  submitError: string | null;

  // Search
  searchQuery: string;
  selectedCategory: PrayerCategory | 'all';

  // Prayed for (local tracking)
  prayedForIds: string[];

  // Error
  error: string | null;

  // Actions
  setPrayers: (prayers: PrayerRequest[]) => void;
  setAnsweredPrayers: (prayers: PrayerRequest[]) => void;
  setMyPrayers: (prayers: PrayerRequest[]) => void;
  setActiveTab: (tab: PrayerTab) => void;
  setLoading: (isLoading: boolean) => void;
  setCurrentPrayer: (prayer: PrayerRequest | null) => void;
  setDetailLoading: (isLoading: boolean) => void;
  setSubmitting: (isSubmitting: boolean) => void;
  setSubmitError: (error: string | null) => void;
  setSearchQuery: (query: string) => void;
  setSelectedCategory: (category: PrayerCategory | 'all') => void;
  addPrayedForId: (id: string) => void;
  updatePrayerInList: (prayer: PrayerRequest) => void;
  addPrayer: (prayer: PrayerRequest) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const usePrayerStore = create<PrayerState>((set) => ({
  prayers: [],
  answeredPrayers: [],
  myPrayers: [],
  activeTab: 'all',
  isLoading: false,
  currentPrayer: null,
  isDetailLoading: false,
  isSubmitting: false,
  submitError: null,
  searchQuery: '',
  selectedCategory: 'all',
  prayedForIds: [],
  error: null,

  setPrayers: (prayers) => set({ prayers }),
  setAnsweredPrayers: (answeredPrayers) => set({ answeredPrayers }),
  setMyPrayers: (myPrayers) => set({ myPrayers }),
  setActiveTab: (activeTab) => set({ activeTab }),
  setLoading: (isLoading) => set({ isLoading }),
  setCurrentPrayer: (currentPrayer) => set({ currentPrayer }),
  setDetailLoading: (isDetailLoading) => set({ isDetailLoading }),
  setSubmitting: (isSubmitting) => set({ isSubmitting }),
  setSubmitError: (submitError) => set({ submitError }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setSelectedCategory: (selectedCategory) => set({ selectedCategory }),

  addPrayedForId: (id) =>
    set((state) => ({
      prayedForIds: [...state.prayedForIds, id],
    })),

  updatePrayerInList: (prayer) =>
    set((state) => ({
      prayers: state.prayers.map((p) => (p.id === prayer.id ? prayer : p)),
      myPrayers: state.myPrayers.map((p) => (p.id === prayer.id ? prayer : p)),
    })),

  addPrayer: (prayer) =>
    set((state) => ({
      prayers: [prayer, ...state.prayers],
      myPrayers: [prayer, ...state.myPrayers],
    })),

  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),
}));
