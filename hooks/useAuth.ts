import { useCallback } from 'react';
import { router } from 'expo-router';
import { useAuthStore } from '../store/authStore';
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
