import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';
import { FontSizes, FontWeights } from '../../constants/fonts';
import { Spacing, BorderRadius } from '../../constants/layout';

interface AdminHeaderProps {
  title: string;
  subtitle?: string;
  rightAction?: React.ReactNode;
}

export function AdminHeader({ title, subtitle, rightAction }: AdminHeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top + Spacing[3] }]}>
      <View style={styles.content}>
        <View style={styles.left}>
          <View style={styles.adminBadge}>
            <Text style={styles.adminBadgeText}>ADMIN</Text>
          </View>
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
        {rightAction ? <View style={styles.right}>{rightAction}</View> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0F172A',
    paddingHorizontal: Spacing[5],
    paddingBottom: Spacing[4],
  },
  content: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  left: {
    flex: 1,
    gap: Spacing[1],
  },
  right: {
    marginLeft: Spacing[3],
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  adminBadge: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.primary + '33',
    borderRadius: BorderRadius.base,
    paddingHorizontal: Spacing[2],
    paddingVertical: 3,
    marginBottom: 4,
  },
  adminBadgeText: {
    fontSize: FontSizes.xs,
    color: Colors.primaryLight,
    fontWeight: FontWeights.bold,
    letterSpacing: 1,
  },
  title: {
    fontSize: FontSizes['2xl'],
    fontWeight: FontWeights.bold,
    color: Colors.white,
  },
  subtitle: {
    fontSize: FontSizes.sm,
    color: Colors.gray400,
    fontWeight: FontWeights.normal,
  },
});
