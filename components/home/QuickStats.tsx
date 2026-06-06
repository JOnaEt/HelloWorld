import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { FontSizes, FontWeights } from '../../constants/fonts';
import { BorderRadius, Shadows, Spacing } from '../../constants/layout';
import { UserStats } from '../../types';
import { formatNumber } from '../../utils/format';

interface QuickStatsProps {
  stats: UserStats;
  style?: ViewStyle;
}

interface StatItem {
  icon: keyof typeof Ionicons.glyphMap;
  value: number;
  label: string;
  color: string;
  bg: string;
}

export function QuickStats({ stats, style }: QuickStatsProps) {
  const items: StatItem[] = [
    {
      icon: 'book-outline',
      value: stats.totalDevotionalsRead,
      label: 'Readings',
      color: Colors.primary,
      bg: Colors.light,
    },
    {
      icon: 'headset-outline',
      value: stats.totalDevotionalsListened,
      label: 'Listened',
      color: '#0EA5E9',
      bg: '#E0F2FE',
    },
    {
      icon: 'hand-right-outline',
      value: stats.totalPrayersSubmitted,
      label: 'Prayers',
      color: '#8B5CF6',
      bg: '#EDE9FE',
    },
    {
      icon: 'people-outline',
      value: stats.totalGroupsJoined,
      label: 'Groups',
      color: '#F59E0B',
      bg: '#FEF3C7',
    },
  ];

  return (
    <View style={[styles.container, style]}>
      {items.map((item, i) => (
        <View key={i} style={styles.statCard}>
          <View style={[styles.iconBox, { backgroundColor: item.bg }]}>
            <Ionicons name={item.icon} size={20} color={item.color} />
          </View>
          <Text style={styles.statValue}>{formatNumber(item.value)}</Text>
          <Text style={styles.statLabel}>{item.label}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: Spacing[3],
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.xl,
    paddingVertical: Spacing[4],
    paddingHorizontal: Spacing[2],
    gap: Spacing[2],
    ...(Shadows.sm as object),
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: {
    fontSize: FontSizes.xl,
    fontWeight: FontWeights.bold,
    color: Colors.textPrimary,
  },
  statLabel: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});
