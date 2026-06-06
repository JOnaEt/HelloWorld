import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withDelay,
  cancelAnimation,
} from 'react-native-reanimated';
import { Colors } from '../../constants/colors';

interface AudioWaveformProps {
  isPlaying: boolean;
  barCount?: number;
  color?: string;
  activeColor?: string;
  height?: number;
  style?: ViewStyle;
}

const BAR_HEIGHTS = [0.4, 0.7, 0.5, 0.9, 0.6, 0.8, 0.45, 0.75, 0.55, 0.65, 0.85, 0.5, 0.7, 0.4, 0.8];

export function AudioWaveform({
  isPlaying,
  barCount = 15,
  color = Colors.border,
  activeColor = Colors.primary,
  height = 40,
  style,
}: AudioWaveformProps) {
  const bars = Array.from({ length: barCount }, (_, i) => ({
    index: i,
    baseHeight: BAR_HEIGHTS[i % BAR_HEIGHTS.length],
  }));

  return (
    <View style={[styles.container, { height }, style]}>
      {bars.map(({ index, baseHeight }) => (
        <WaveBar
          key={index}
          isPlaying={isPlaying}
          baseHeight={baseHeight}
          maxHeight={height}
          color={isPlaying ? activeColor : color}
          delay={index * 60}
        />
      ))}
    </View>
  );
}

interface WaveBarProps {
  isPlaying: boolean;
  baseHeight: number;
  maxHeight: number;
  color: string;
  delay: number;
}

function WaveBar({ isPlaying, baseHeight, maxHeight, color, delay }: WaveBarProps) {
  const scaleY = useSharedValue(baseHeight);

  useEffect(() => {
    if (isPlaying) {
      scaleY.value = withDelay(
        delay % 300,
        withRepeat(
          withTiming(
            baseHeight * 0.3 + Math.random() * 0.7,
            { duration: 400 + Math.random() * 300 }
          ),
          -1,
          true
        )
      );
    } else {
      cancelAnimation(scaleY);
      scaleY.value = withTiming(baseHeight, { duration: 200 });
    }
  }, [isPlaying]);

  const animStyle = useAnimatedStyle(() => ({
    height: scaleY.value * maxHeight,
    backgroundColor: color,
  }));

  return (
    <Animated.View
      style={[
        styles.bar,
        animStyle,
        { alignSelf: 'center' },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  bar: {
    width: 3,
    borderRadius: 2,
    minHeight: 4,
  },
});
