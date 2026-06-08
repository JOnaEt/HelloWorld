import { Redirect } from 'expo-router';
import { useAuthStore } from '../store/authStore';

export default function Index() {
  const { user, isInitialized } = useAuthStore();

  if (!isInitialized) return null;

  if (!user) return <Redirect href="/(auth)/welcome" />;
  if (!user.isOnboarded) return <Redirect href="/(auth)/onboarding/interests" />;
  return <Redirect href="/(tabs)/" />;
}
