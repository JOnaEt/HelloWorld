import { useCallback } from 'react';
import { router } from 'expo-router';
import { useAuthStore } from '../store/authStore';
import { useDevotionalStore } from '../store/devotionalStore';
import { useGroupStore } from '../store/groupStore';
import { usePrayerStore } from '../store/prayerStore';
import { useAdminStore } from '../store/adminStore';
import {
  signIn,
  signUp,
  signOut,
  resetPassword,
  updateUserProfile,
  updateInterests,
  completeOnboarding,
} from '../services/firebase/auth';
import { UserProfile } from '../types';
import { Analytics } from '../services/analytics';

export function useAuth() {
  const { user, isLoading, error, setLoading, setError, setUser, clearError, updateUser } =
    useAuthStore();

  const login = useCallback(
    async (email: string, password: string) => {
      setLoading(true);
      setError(null);
      try {
        const profile = await signIn(email, password);
        setUser(profile);
        Analytics.login();
        if (profile.isOnboarded) {
          router.replace('/(tabs)/');
        } else {
          router.replace('/(auth)/onboarding/interests');
        }
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : 'Failed to sign in. Please try again.';
        setError(message);
      } finally {
        setLoading(false);
      }
    },
    [setLoading, setError, setUser]
  );

  const register = useCallback(
    async (
      email: string,
      password: string,
      displayName: string,
      phoneNumber?: string
    ) => {
      setLoading(true);
      setError(null);
      try {
        const profile = await signUp(email, password, displayName, phoneNumber);
        setUser(profile);
        Analytics.signUp();
        router.replace('/(auth)/onboarding/interests');
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : 'Failed to create account. Please try again.';
        setError(message);
      } finally {
        setLoading(false);
      }
    },
    [setLoading, setError, setUser]
  );

  const logout = useCallback(async () => {
    setLoading(true);
    try {
      await signOut();
      setUser(null);
      // Clear all per-user store data so the next user starts fresh
      useDevotionalStore.setState({
        currentDevotional: null, dailyDevotional: null,
        devotionals: [], filteredDevotionals: [], recentlyListened: [],
      });
      useGroupStore.setState({
        groups: [], filteredGroups: [], myGroups: [], currentGroup: null,
        currentGroupMembers: [], joinedGroupIds: [], featuredGroups: [],
      });
      usePrayerStore.setState({
        prayers: [], answeredPrayers: [], myPrayers: [], currentPrayer: null,
      });
      useAdminStore.setState({
        users: [], devotionals: [], announcements: [], groups: [],
        prayers: [], donations: [], stats: null,
      });
      router.replace('/(auth)/welcome');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to sign out.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError, setUser]);

  const forgotPassword = useCallback(
    async (email: string) => {
      setLoading(true);
      setError(null);
      try {
        await resetPassword(email);
        return true;
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : 'Failed to send reset email.';
        setError(message);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [setLoading, setError]
  );

  const updateProfile = useCallback(
    async (updates: Partial<UserProfile>) => {
      if (!user) return;
      setLoading(true);
      try {
        await updateUserProfile(user.uid, updates);
        updateUser(updates);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to update profile.';
        setError(message);
      } finally {
        setLoading(false);
      }
    },
    [user, setLoading, setError, updateUser]
  );

  const saveInterests = useCallback(
    async (interests: string[]) => {
      if (!user) return;
      setLoading(true);
      try {
        await updateInterests(user.uid, interests);
        updateUser({ interests });
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to save interests.';
        setError(message);
      } finally {
        setLoading(false);
      }
    },
    [user, setLoading, setError, updateUser]
  );

  const finishOnboarding = useCallback(async () => {
    if (!user) return;
    try {
      await completeOnboarding(user.uid);
      updateUser({ isOnboarded: true });
      router.replace('/(tabs)/');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to complete onboarding.';
      setError(message);
    }
  }, [user, setError, updateUser]);

  return {
    user,
    isLoading,
    error,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    forgotPassword,
    updateProfile,
    saveInterests,
    finishOnboarding,
    clearError,
  };
}
