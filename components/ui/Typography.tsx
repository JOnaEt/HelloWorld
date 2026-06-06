import React from 'react';
import { Text, TextStyle, StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';
import { FontSizes, FontWeights, LineHeights } from '../../constants/fonts';

interface TypographyProps {
  children: React.ReactNode;
  style?: TextStyle | TextStyle[];
  color?: string;
  align?: 'left' | 'center' | 'right';
  numberOfLines?: number;
  onPress?: () => void;
  accessibilityLabel?: string;
}

function makeTypography(defaultStyle: TextStyle) {
  return function TypographyComponent({
    children,
    style,
    color,
    align,
    numberOfLines,
    onPress,
    accessibilityLabel,
  }: TypographyProps) {
    return (
      <Text
        style={[defaultStyle, color ? { color } : undefined, align ? { textAlign: align } : undefined, style]}
        numberOfLines={numberOfLines}
        onPress={onPress}
        accessibilityLabel={accessibilityLabel}
      >
        {children}
      </Text>
    );
  };
}

export const H1 = makeTypography({
  fontSize: FontSizes['4xl'],
  fontWeight: FontWeights.bold,
  color: Colors.textPrimary,
  lineHeight: FontSizes['4xl'] * 1.2,
  letterSpacing: -0.8,
});

export const H2 = makeTypography({
  fontSize: FontSizes['3xl'],
  fontWeight: FontWeights.bold,
  color: Colors.textPrimary,
  lineHeight: FontSizes['3xl'] * 1.2,
  letterSpacing: -0.4,
});

export const H3 = makeTypography({
  fontSize: FontSizes['2xl'],
  fontWeight: FontWeights.semibold,
  color: Colors.textPrimary,
  lineHeight: FontSizes['2xl'] * 1.375,
});

export const H4 = makeTypography({
  fontSize: FontSizes.xl,
  fontWeight: FontWeights.semibold,
  color: Colors.textPrimary,
  lineHeight: FontSizes.xl * 1.375,
});

export const H5 = makeTypography({
  fontSize: FontSizes.lg,
  fontWeight: FontWeights.semibold,
  color: Colors.textPrimary,
  lineHeight: FontSizes.lg * 1.375,
});

export const Body = makeTypography({
  fontSize: FontSizes.base,
  fontWeight: FontWeights.normal,
  color: Colors.textPrimary,
  lineHeight: FontSizes.base * 1.6,
});

export const BodySmall = makeTypography({
  fontSize: FontSizes.sm,
  fontWeight: FontWeights.normal,
  color: Colors.textSecondary,
  lineHeight: FontSizes.sm * 1.5,
});

export const Caption = makeTypography({
  fontSize: FontSizes.xs,
  fontWeight: FontWeights.normal,
  color: Colors.textSecondary,
  lineHeight: FontSizes.xs * 1.5,
  letterSpacing: 0.4,
});

export const Label = makeTypography({
  fontSize: FontSizes.sm,
  fontWeight: FontWeights.medium,
  color: Colors.textSecondary,
  lineHeight: FontSizes.sm * 1.5,
  letterSpacing: 0.4,
});

export const Overline = makeTypography({
  fontSize: FontSizes.xs,
  fontWeight: FontWeights.semibold,
  color: Colors.textSecondary,
  letterSpacing: 1.2,
  textTransform: 'uppercase',
});
