import React, { useEffect } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
} from 'react-native-reanimated';
import { Colors } from '../../constants/colors';
import { BorderRadius } from '../../constants/layout';

interface ProgressBarProps {
  progress: number; // 0 to 1
  color?: string;
  trackColor?: string;
  height?: number;
  animated?: boolean;
  style?: ViewStyle;
  rounded?: boolean;
}

export function ProgressBar({
  progress,
  color = Colors.primary,
  trackColor = Colors.light,
  height = 8,
  animated = true,
  style,
  rounded = true,
}: ProgressBarProps) {
  const width = useSharedValue(0);

  useEffect(() => {
    const clampedProgress = Math.max(0, Math.min(1, progress));
    if (animated) {
      width.value = withTiming(clampedProgress, { duration: 600 });
    } else {
      width.value = clampedProgress;
    }
  }, [progress]);

  const animatedFillStyle = useAnimatedStyle(() => ({
    width: `${width.value * 100}%`,
  }));

  const borderRadius = rounded ? BorderRadius.full : 0;

  return (
    <View
      style={[
        styles.track,
        {
          height,
          backgroundColor: trackColor,
          borderRadius,
        },
        style,
      ]}
    >
      <Animated.View
        style={[
          styles.fill,
          {
            height,
            backgroundColor: color,
            borderRadius,
          },
          animatedFillStyle,
        ]}
      />
    </View>
  );
}

// Circular progress indicator
interface CircularProgressProps {
  progress: number; // 0 to 1
  size?: number;
  strokeWidth?: number;
  color?: string;
  trackColor?: string;
  children?: React.ReactNode;
  style?: ViewStyle;
}

export function CircularProgress({
  progress,
  size = 80,
  strokeWidth = 6,
  color = Colors.primary,
  trackColor = Colors.light,
  children,
  style,
}: CircularProgressProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clampedProgress = Math.max(0, Math.min(1, progress));
  const strokeDashoffset = circumference * (1 - clampedProgress);

  return (
    <View style={[{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }, style]}>
      <View style={styles.circularTrack}>
        {/* Track circle (background) */}
        <View
          style={{
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: strokeWidth,
            borderColor: trackColor,
            position: 'absolute',
          }}
        />
        {/* Fill arc — simplified with a solid indicator */}
        <View
          style={{
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: strokeWidth,
            borderColor: 'transparent',
            borderTopColor: color,
            position: 'absolute',
            transform: [{ rotate: `${clampedProgress * 360 - 90}deg` }],
          }}
        />
      </View>
      {children && (
        <View style={styles.circularContent}>{children}</View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    overflow: 'hidden',
    width: '100%',
  },
  fill: {
    position: 'absolute',
    left: 0,
    top: 0,
  },
  circularTrack: {
    position: 'absolute',
  },
  circularContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
