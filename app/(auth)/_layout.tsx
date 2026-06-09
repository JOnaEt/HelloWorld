import React from 'react';
import { Stack, Redirect } from 'expo-router';
import { useAuthStore } from '../../store/authStore';

export default function AuthLayout() {
  const { user, isInitialized } = useAuthStore();

  if (!isInitialized) return null;

  // Redirect authenticated users to main app
  if (user) {
    if (user.isOnboarded) {
      return <Redirect href="/(tabs)/" />;
    } else {
      return <Redirect href="/(auth)/onboarding/interests" />;
    }
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="welcome" options={{ animation: 'fade' }} />
      <Stack.Screen name="login" options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="register" options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="onboarding/interests" options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="onboarding/notifications" options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="onboarding/groups" options={{ animation: 'slide_from_right' }} />
    </Stack>
  );
}
