import React from 'react';
import { Stack, router } from 'expo-router';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';
import { Colors } from '../../constants/colors';
import { FontSizes, FontWeights } from '../../constants/fonts';
import { Spacing, BorderRadius } from '../../constants/layout';

const ADMIN_ROLES = ['admin', 'pastor', 'leader'];

export default function AdminLayout() {
  const user = useAuthStore((s) => s.user);

  if (!user || !ADMIN_ROLES.includes(user.role)) {
    return (
      <SafeAreaView style={styles.denied}>
        <View style={styles.deniedIconWrap}>
          <Ionicons name="shield-outline" size={64} color={Colors.error} />
        </View>
        <Text style={styles.deniedTitle}>Access Restricted</Text>
        <Text style={styles.deniedSub}>
          This area requires admin, pastor, or leader privileges.
        </Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="users" />
      <Stack.Screen name="devotionals" />
      <Stack.Screen name="devotionals/create" options={{ presentation: 'modal' }} />
      <Stack.Screen name="announcements" />
      <Stack.Screen name="announcements/create" options={{ presentation: 'modal' }} />
      <Stack.Screen name="groups" />
      <Stack.Screen name="groups/create" options={{ presentation: 'modal' }} />
      <Stack.Screen name="prayer" />
      <Stack.Screen name="giving" />
      <Stack.Screen name="analytics" />
      <Stack.Screen name="settings" />
    </Stack>
  );
}

const styles = StyleSheet.create({
  denied: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing[8],
    gap: Spacing[4],
  },
  deniedIconWrap: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing[2],
  },
  deniedTitle: {
    fontSize: FontSizes['2xl'],
    fontWeight: FontWeights.bold,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  deniedSub: {
    fontSize: FontSizes.base,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: FontSizes.base * 1.6,
  },
  backBtn: {
    marginTop: Spacing[4],
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing[8],
    paddingVertical: Spacing[4],
    borderRadius: BorderRadius.full,
  },
  backBtnText: {
    fontSize: FontSizes.base,
    fontWeight: FontWeights.semibold,
    color: Colors.white,
  },
});
