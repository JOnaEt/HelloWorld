import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { FontSizes, FontWeights } from '../../constants/fonts';
import { Spacing, BorderRadius, Shadows } from '../../constants/layout';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  color: string;
  trend?: string;
}

export function StatCard({ title, value, subtitle, icon, color, trend }: StatCardProps) {
  const trendPositive = trend && !trend.startsWith('-');

  return (
    <View style={styles.card}>
      <View style={[styles.iconWrap, { backgroundColor: color + '18' }]}>
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={[styles.value, { color }]}>{typeof value === 'number' ? value.toLocaleString() : value}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      {trend ? (
        <View style={styles.trendRow}>
          <Ionicons
            name={trendPositive ? 'trending-up' : 'trending-down'}
            size={12}
            color={trendPositive ? Colors.success : Colors.error}
          />
          <Text style={[styles.trend, { color: trendPositive ? Colors.success : Colors.error }]}>
            {trend}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing[4],
    flex: 1,
    minWidth: 140,
    borderWidth: 1,
    borderColor: Colors.border,
    ...(Shadows.sm as object),
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing[3],
  },
  title: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
    fontWeight: FontWeights.medium,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Spacing[1],
  },
  value: {
    fontSize: FontSizes['2xl'],
    fontWeight: FontWeights.bold,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
  },
  trendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: Spacing[1],
  },
  trend: {
    fontSize: FontSizes.xs,
    fontWeight: FontWeights.semibold,
  },
});
