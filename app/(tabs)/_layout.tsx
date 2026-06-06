import React from 'react';
import { Tabs, Redirect } from 'expo-router';
import { useAuthStore } from '../../store/authStore';
import { CustomTabBar } from '../../components/common/TabBar';

export default function TabsLayout() {
  const { user, isInitialized } = useAuthStore();

  if (!isInitialized) return null;

  if (!user) {
    return <Redirect href="/(auth)/welcome" />;
  }

  if (!user.isOnboarded) {
    return <Redirect href="/(auth)/onboarding/interests" />;
  }

  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <CustomTabBar {...props} />}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
        }}
      />
      <Tabs.Screen
        name="library"
        options={{
          title: 'Library',
        }}
      />
      <Tabs.Screen
        name="bible"
        options={{
          title: 'Bible',
        }}
      />
      <Tabs.Screen
        name="community"
        options={{
          title: 'Community',
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
        }}
      />
    </Tabs>
  );
}
