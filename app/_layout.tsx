import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../services/firebase/config';
import { useAuthStore } from '../store/authStore';
import { subscribeToAuthState, getUserProfile } from '../services/firebase/auth';
import { LoadingScreen } from '../components/common/LoadingScreen';
import { analyticsSetUser } from '../services/analytics';
import { setupNotificationListeners } from '../services/notifications';

// Keep splash screen visible until initialization is complete
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { isInitialized, setUser, setInitialized, setLoading } = useAuthStore();

  const registerPushToken = async (uid: string) => {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') return;

      const tokenData = await Notifications.getExpoPushTokenAsync({
        projectId: 'topic-digital-church-app', // matches app.json extra.eas.projectId
      });

      // Store token in Firestore
      await setDoc(doc(db, 'pushTokens', uid), {
        token: tokenData.data,
        uid,
        platform: Platform.OS,
        updatedAt: new Date().toISOString(),
      });

      // Configure notification handler
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: false,
        }),
      });
    } catch (err) {
      // Non-critical — don't crash app if push token fails
      console.warn('Push token registration failed:', err);
    }
  };

  useEffect(() => {
    // Set up notification tap handler
    const cleanupNotifications = setupNotificationListeners();

    // Subscribe to Firebase auth state changes
    const unsubscribe = subscribeToAuthState(async (firebaseUser) => {
      setLoading(true);
      try {
        if (firebaseUser) {
          const profile = await getUserProfile(firebaseUser.uid);
          setUser(profile);
          if (profile) {
            analyticsSetUser(firebaseUser.uid);
            registerPushToken(firebaseUser.uid);
          }
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error('Auth state error:', err);
        setUser(null);
      } finally {
        setInitialized(true);
        setLoading(false);
        SplashScreen.hideAsync();
      }
    });

    return () => {
      unsubscribe();
      cleanupNotifications();
    };
  }, []);

  if (!isInitialized) {
    return <LoadingScreen message="Initializing..." />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style="auto" />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(auth)" options={{ animation: 'fade' }} />
          <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
          <Stack.Screen
            name="devotional/[id]"
            options={{
              animation: 'slide_from_right',
              presentation: 'card',
            }}
          />
          <Stack.Screen
            name="devotional/player"
            options={{
              animation: 'slide_from_bottom',
              presentation: 'fullScreenModal',
            }}
          />
          <Stack.Screen
            name="groups/index"
            options={{ animation: 'slide_from_right' }}
          />
          <Stack.Screen
            name="groups/[id]"
            options={{ animation: 'slide_from_right' }}
          />
          <Stack.Screen
            name="groups/manage"
            options={{ animation: 'slide_from_right' }}
          />
          <Stack.Screen
            name="prayer/index"
            options={{ animation: 'slide_from_right' }}
          />
          <Stack.Screen
            name="prayer/[id]"
            options={{ animation: 'slide_from_right' }}
          />
          <Stack.Screen
            name="giving/index"
            options={{ animation: 'slide_from_right' }}
          />
          <Stack.Screen
            name="announcements/index"
            options={{ animation: 'slide_from_right' }}
          />
          <Stack.Screen
            name="(admin)"
            options={{ headerShown: false, animation: 'slide_from_right' }}
          />
          <Stack.Screen name="+not-found" />
        </Stack>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
