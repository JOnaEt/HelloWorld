import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import { FontSizes, FontWeights } from '../constants/fonts';
import { Spacing } from '../constants/layout';
import { H3, Body } from '../components/ui/Typography';
import { Button } from '../components/ui/Button';

export default function NotFoundScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.iconBox}>
        <Ionicons name="compass-outline" size={60} color={Colors.primary} />
      </View>
      <H3 align="center">Page Not Found</H3>
      <Body color={Colors.textSecondary} align="center">
        The page you're looking for doesn't exist or has been moved.
      </Body>
      <Link href="/(tabs)/" asChild>
        <Button title="Go to Home" onPress={() => {}} style={{ marginTop: Spacing[4] }} />
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
    backgroundColor: Colors.background,
    gap: Spacing[4],
  },
  iconBox: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.light,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing[2],
  },
});
