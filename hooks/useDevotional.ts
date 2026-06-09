import { useCallback, useEffect } from 'react';
import { useDevotionalStore } from '../store/devotionalStore';
import { useAuthStore } from '../store/authStore';
import {
  getDailyDevotional,
  getAllDevotionals,
  getDevotionalsByCategory,
  getDevotionalById,
  getTrendingDevotionals,
  markListened,
  markRead,
  getRecentlyListened,
  searchDevotionals,
  incrementShareCount,
} from '../services/firebase/devotionals';
import { DevotionalCategory } from '../types';

export function useDevotional() {
  const store = useDevotionalStore();
  const { user } = useAuthStore();

  // ─── Daily Devotional ───────────────────────────────────────────────────────

  const fetchDailyDevotional = useCallback(async () => {
    store.setDailyLoading(true);
    try {
      const devotional = await getDailyDevotional();
      store.setDailyDevotional(devotional);
    } catch (err: unknown) {
      store.setError(err instanceof Error ? err.message : 'Failed to load devotional');
    } finally {
      store.setDailyLoading(false);
    }
  }, []);

  // ─── Library ────────────────────────────────────────────────────────────────

  const fetchLibrary = useCallback(
    async (category?: DevotionalCategory | 'all') => {
      store.setLibraryLoading(true);
      try {
        let devotionals;
        if (!category || category === 'all') {
          devotionals = await getAllDevotionals(30);
        } else {
          devotionals = await getDevotionalsByCategory(category);
        }
        store.setDevotionals(devotionals);
        store.setFilteredDevotionals(devotionals);
      } catch (err: unknown) {
        store.setError(err instanceof Error ? err.message : 'Failed to load library');
      } finally {
        store.setLibraryLoading(false);
      }
    },
    []
  );

  const filterByCategory = useCallback(
    async (category: DevotionalCategory | 'all') => {
      store.setSelectedCategory(category);
      await fetchLibrary(category);
    },
    [fetchLibrary]
  );

  const search = useCallback(async (query: string) => {
    store.setSearchQuery(query);
    if (!query.trim()) {
      store.setFilteredDevotionals(store.devotionals);
      return;
    }
    store.setLibraryLoading(true);
    try {
      const results = await searchDevotionals(query);
      store.setFilteredDevotionals(results);
    } catch {
      store.setFilteredDevotionals([]);
    } finally {
      store.setLibraryLoading(false);
    }
  }, [store.devotionals]);

  // ─── Single Devotional ──────────────────────────────────────────────────────

  const fetchDevotional = useCallback(async (id: string) => {
    store.setDetailLoading(true);
    try {
      const devotional = await getDevotionalById(id);
      store.setCurrentDevotional(devotional);
      if (devotional && user) {
        await markRead(devotional.id, user.uid);
      }
    } catch (err: unknown) {
      store.setError(err instanceof Error ? err.message : 'Failed to load devotional');
    } finally {
      store.setDetailLoading(false);
    }
  }, [user]);

  // ─── Trending ───────────────────────────────────────────────────────────────

  const fetchTrending = useCallback(async () => {
    try {
      const trending = await getTrendingDevotionals(6);
      store.setTrendingDevotionals(trending);
    } catch {
      // silently fail
    }
  }, []);

  // ─── Recently Listened ──────────────────────────────────────────────────────

  const fetchRecentlyListened = useCallback(async () => {
    if (!user) return;
    try {
      const records = await getRecentlyListened(user.uid, 10);
      store.setRecentlyListened(records);
    } catch {
      // silently fail
    }
  }, [user]);

  // ─── Player Actions ─────────────────────────────────────────────────────────

  const recordListened = useCallback(
    async (devotionalId: string, progress: number, completed: boolean) => {
      if (!user) return;
      await markListened(devotionalId, user.uid, progress, completed);
    },
    [user]
  );

  const shareDevotional = useCallback(async (devotionalId: string) => {
    await incrementShareCount(devotionalId);
  }, []);

  return {
    // State
    dailyDevotional: store.dailyDevotional,
    isDailyLoading: store.isDailyLoading,
    devotionals: store.devotionals,
    filteredDevotionals: store.filteredDevotionals,
    selectedCategory: store.selectedCategory,
    searchQuery: store.searchQuery,
    isLibraryLoading: store.isLibraryLoading,
    currentDevotional: store.currentDevotional,
    isDetailLoading: store.isDetailLoading,
    trendingDevotionals: store.trendingDevotionals,
    recentlyListened: store.recentlyListened,
    player: store.player,
    error: store.error,

    // Actions
    fetchDailyDevotional,
    fetchLibrary,
    filterByCategory,
    search,
    fetchDevotional,
    fetchTrending,
    fetchRecentlyListened,
    recordListened,
    shareDevotional,
    updatePlayer: store.updatePlayerState,
    clearError: store.clearError,
  };
}
