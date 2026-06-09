import { useCallback } from 'react';
import { usePrayerStore } from '../store/prayerStore';
import { useAuthStore } from '../store/authStore';
import {
  getPublicPrayers,
  getPrayerById,
  getUserPrayers,
  getAnsweredPrayers,
  submitPrayerRequest,
  markPrayerAnswered,
  prayForRequest,
} from '../services/firebase/prayer';
import { PrayerCategory, PrayerRequest, PrayerStatus } from '../types';

export function usePrayer() {
  const store = usePrayerStore();
  const { user } = useAuthStore();

  // ─── Fetch Prayers ──────────────────────────────────────────────────────────

  const fetchPublicPrayers = useCallback(async () => {
    store.setLoading(true);
    try {
      const prayers = await getPublicPrayers(30);
      store.setPrayers(prayers);
    } catch (err: unknown) {
      store.setError(err instanceof Error ? err.message : 'Failed to load prayers');
    } finally {
      store.setLoading(false);
    }
  }, []);

  const fetchAnsweredPrayers = useCallback(async () => {
    store.setLoading(true);
    try {
      const prayers = await getAnsweredPrayers(30);
      store.setAnsweredPrayers(prayers);
    } catch (err: unknown) {
      store.setError(err instanceof Error ? err.message : 'Failed to load answered prayers');
    } finally {
      store.setLoading(false);
    }
  }, []);

  const fetchMyPrayers = useCallback(async () => {
    if (!user) return;
    store.setLoading(true);
    try {
      const prayers = await getUserPrayers(user.uid);
      store.setMyPrayers(prayers);
    } catch (err: unknown) {
      store.setError(err instanceof Error ? err.message : 'Failed to load your prayers');
    } finally {
      store.setLoading(false);
    }
  }, [user]);

  const fetchPrayerDetail = useCallback(async (id: string) => {
    store.setDetailLoading(true);
    try {
      const prayer = await getPrayerById(id);
      store.setCurrentPrayer(prayer);
    } catch (err: unknown) {
      store.setError(err instanceof Error ? err.message : 'Failed to load prayer');
    } finally {
      store.setDetailLoading(false);
    }
  }, []);

  // ─── Submit Prayer ──────────────────────────────────────────────────────────

  const submitPrayer = useCallback(
    async (
      title: string,
      content: string,
      category: PrayerCategory,
      isAnonymous = false,
      isPublic = true
    ) => {
      if (!user) return null;
      store.setSubmitting(true);
      store.setSubmitError(null);
      try {
        const id = await submitPrayerRequest({
          userId: user.uid,
          userProfile: {
            displayName: isAnonymous ? 'Anonymous' : user.displayName,
            photoURL: isAnonymous ? undefined : user.photoURL,
          },
          title,
          content,
          category,
          status: 'active' as PrayerStatus,
          isAnonymous,
          isPublic,
        });

        // Add to local store
        const newPrayer: PrayerRequest = {
          id,
          userId: user.uid,
          userProfile: {
            displayName: isAnonymous ? 'Anonymous' : user.displayName,
            photoURL: isAnonymous ? undefined : user.photoURL,
          },
          title,
          content,
          category,
          status: 'active',
          isAnonymous,
          isPublic,
          prayerCount: 0,
          reactedUserIds: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        store.addPrayer(newPrayer);
        return id;
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to submit prayer';
        store.setSubmitError(message);
        return null;
      } finally {
        store.setSubmitting(false);
      }
    },
    [user]
  );

  // ─── Pray For ───────────────────────────────────────────────────────────────

  const prayFor = useCallback(
    async (prayerId: string) => {
      if (!user || store.prayedForIds.includes(prayerId)) return;
      try {
        await prayForRequest(prayerId, user.uid, 'praying');
        store.addPrayedForId(prayerId);

        // Update local state
        const prayer = store.prayers.find((p) => p.id === prayerId);
        if (prayer) {
          store.updatePrayerInList({
            ...prayer,
            prayerCount: prayer.prayerCount + 1,
            reactedUserIds: [...prayer.reactedUserIds, user.uid],
          });
        }
      } catch {
        // silently fail
      }
    },
    [user, store]
  );

  const markAnswered = useCallback(
    async (prayerId: string, note?: string) => {
      if (!user) return;
      try {
        await markPrayerAnswered(prayerId, user.uid, note);
        const prayer = store.myPrayers.find((p) => p.id === prayerId);
        if (prayer) {
          store.updatePrayerInList({ ...prayer, status: 'answered' });
        }
      } catch (err: unknown) {
        store.setError(err instanceof Error ? err.message : 'Failed to mark as answered');
      }
    },
    [user, store]
  );

  const hasPrayed = useCallback(
    (prayerId: string) => store.prayedForIds.includes(prayerId),
    [store.prayedForIds]
  );

  // ─── Filter ─────────────────────────────────────────────────────────────────

  const getFilteredPrayers = useCallback(() => {
    const source =
      store.activeTab === 'answered'
        ? store.answeredPrayers
        : store.activeTab === 'mine'
        ? store.myPrayers
        : store.prayers;

    if (!store.searchQuery && store.selectedCategory === 'all') return source;

    return source.filter((p) => {
      const matchesSearch =
        !store.searchQuery ||
        p.title.toLowerCase().includes(store.searchQuery.toLowerCase()) ||
        p.content.toLowerCase().includes(store.searchQuery.toLowerCase());

      const matchesCategory =
        store.selectedCategory === 'all' ||
        p.category === store.selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [store.prayers, store.answeredPrayers, store.myPrayers, store.activeTab, store.searchQuery, store.selectedCategory]);

  return {
    // State
    prayers: store.prayers,
    answeredPrayers: store.answeredPrayers,
    myPrayers: store.myPrayers,
    currentPrayer: store.currentPrayer,
    activeTab: store.activeTab,
    isLoading: store.isLoading,
    isDetailLoading: store.isDetailLoading,
    isSubmitting: store.isSubmitting,
    submitError: store.submitError,
    searchQuery: store.searchQuery,
    selectedCategory: store.selectedCategory,
    filteredPrayers: getFilteredPrayers(),
    error: store.error,

    // Actions
    fetchPublicPrayers,
    fetchAnsweredPrayers,
    fetchMyPrayers,
    fetchPrayerDetail,
    submitPrayer,
    prayFor,
    markAnswered,
    hasPrayed,
    setActiveTab: store.setActiveTab,
    setSearchQuery: store.setSearchQuery,
    setSelectedCategory: store.setSelectedCategory,
    clearError: store.clearError,
  };
}
