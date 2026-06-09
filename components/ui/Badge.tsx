import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Colors } from '../../constants/colors';
import { FontSizes, FontWeights } from '../../constants/fonts';
import { BorderRadius, Spacing } from '../../constants/layout';

type BadgeVariant = 'primary' | 'success' | 'warning' | 'error' | 'info' | 'gray' | 'outline';
type BadgeSize = 'sm' | 'md';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  size?: BadgeSize;
  style?: ViewStyle;
  dot?: boolean;
}

export function Badge({
  label,
  variant = 'primary',
  size = 'md',
  style,
  dot = false,
}: BadgeProps) {
  return (
    <View style={[styles.base, styles[variant], styles[size], style]}>
      {dot && <View style={[styles.dot, styles[`${variant}Dot`]]} />}
      <Text style={[styles.text, styles[`${variant}Text`], styles[`${size}Text`]]}>
        {label}
      </Text>
    </View>
  );
}

// Notification badge (number dot)
interface NotificationBadgeProps {
  count: number;
  style?: ViewStyle;
}

export function NotificationBadge({ count, style }: NotificationBadgeProps) {
  if (count === 0) return null;
  return (
    <View style={[styles.notifBase, style]}>
      <Text style={styles.notifText}>{count > 99 ? '99+' : count}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: BorderRadius.full,
    gap: 4,
  },

  // Sizes
  sm: {
    paddingVertical: 2,
    paddingHorizontal: Spacing[2],
  },
  md: {
    paddingVertical: 4,
    paddingHorizontal: Spacing[3],
  },

  // Variants
  primary: { backgroundColor: Colors.light },
  success: { backgroundColor: '#DCFCE7' },
  warning: { backgroundColor: '#FEF3C7' },
  error: { backgroundColor: '#FEE2E2' },
  info: { backgroundColor: '#DBEAFE' },
  gray: { backgroundColor: Colors.gray100 },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.border,
  },

  // Text
  text: {
    fontWeight: FontWeights.semibold,
  },
  smText: { fontSize: FontSizes.xs },
  mdText: { fontSize: FontSizes.sm },
  primaryText: { color: Colors.deep },
  successText: { color: '#15803D' },
  warningText: { color: '#92400E' },
  errorText: { color: '#991B1B' },
  infoText: { color: '#1E40AF' },
  grayText: { color: Colors.textSecondary },
  outlineText: { color: Colors.textSecondary },

  // Dots
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  primaryDot: { backgroundColor: Colors.primary },
  successDot: { backgroundColor: Colors.success },
  warningDot: { backgroundColor: Colors.warning },
  errorDot: { backgroundColor: Colors.error },
  infoDot: { backgroundColor: Colors.info },
  grayDot: { backgroundColor: Colors.gray400 },
  outlineDot: { backgroundColor: Colors.gray400 },

  // Notification badge
  notifBase: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: Colors.error,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  notifText: {
    color: Colors.white,
    fontSize: 10,
    fontWeight: FontWeights.bold,
  },
});
