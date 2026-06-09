import React, { useCallback } from 'react';
import {
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  View,
  Text,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { Colors } from '../../src/design-system/colors';
import { Typography } from '../../src/design-system/typography';
import { Spacing } from '../../src/design-system/spacing';
import { Radius } from '../../src/design-system/radius';
import { Shadows } from '../../src/design-system/shadows';
import { SpringPresets } from '../../src/design-system/animations';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  disabled?: boolean;
  leadingIcon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
  accessibilityLabel?: string;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  leadingIcon,
  trailingIcon,
  style,
  textStyle,
  fullWidth = false,
  accessibilityLabel,
}: ButtonProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = useCallback(() => {
    scale.value = withSpring(0.97, SpringPresets.snappy);
  }, [scale]);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, SpringPresets.bouncy);
  }, [scale]);

  const containerStyle: ViewStyle[] = [
    styles.base,
    styles[`variant_${variant}`],
    styles[`size_${size}`],
    fullWidth ? styles.fullWidth : {},
    (disabled || isLoading) ? styles.disabled : {},
    variant === 'primary' ? (Shadows.brand as ViewStyle) : {},
    style ?? {},
  ];

  const titleStyle: TextStyle[] = [
    styles.text,
    styles[`text_${variant}`],
    styles[`textSize_${size}`],
    textStyle ?? {},
  ];

  return (
    <AnimatedTouchable
      style={[containerStyle, animatedStyle]}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || isLoading}
      activeOpacity={0.9}
      accessibilityLabel={accessibilityLabel ?? title}
      accessibilityRole="button"
    >
      {isLoading ? (
        <ActivityIndicator
          color={variant === 'primary' || variant === 'danger' ? Colors.text.inverse : Colors.brand.primary}
          size="small"
        />
      ) : (
        <>
          {leadingIcon && <View style={styles.iconWrapper}>{leadingIcon}</View>}
          <Text style={titleStyle}>{title}</Text>
          {trailingIcon && <View style={styles.iconWrapper}>{trailingIcon}</View>}
        </>
      )}
    </AnimatedTouchable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.button,
    gap: Spacing.iconGap,
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.5,
  },
  iconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Variants
  variant_primary: {
    backgroundColor: Colors.brand.primary,
  },
  variant_secondary: {
    backgroundColor: Colors.brand.light,
  },
  variant_ghost: {
    backgroundColor: 'transparent',
  },
  variant_danger: {
    backgroundColor: Colors.status.error,
  },
  variant_outline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: Colors.brand.primary,
  },

  // Sizes
  size_sm: {
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.sm,
  },
  size_md: {
    paddingVertical: 14,
    paddingHorizontal: Spacing.lg,
  },
  size_lg: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
  },

  // Text
  text: {
    ...Typography.button,
  },
  text_primary: {
    color: Colors.text.inverse,
  },
  text_secondary: {
    color: Colors.brand.primary,
  },
  text_ghost: {
    color: Colors.brand.primary,
  },
  text_danger: {
    color: Colors.text.inverse,
  },
  text_outline: {
    color: Colors.brand.primary,
  },
  textSize_sm: {
    ...Typography.buttonSm,
  },
  textSize_md: {
    ...Typography.button,
  },
  textSize_lg: {
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
});
