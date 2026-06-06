import {
  withSpring,
  withTiming,
  withDelay,
  withSequence,
  Easing,
  WithSpringConfig,
} from 'react-native-reanimated';

export const SpringPresets: Record<string, WithSpringConfig> = {
  gentle: { damping: 20, stiffness: 150 },
  snappy: { damping: 15, stiffness: 300 },
  bouncy: { damping: 10, stiffness: 200, mass: 0.8 },
  stiff: { damping: 25, stiffness: 400 },
  wobbly: { damping: 8, stiffness: 180 },
};

export const TimingPresets = {
  fast: { duration: 180, easing: Easing.out(Easing.cubic) },
  normal: { duration: 280, easing: Easing.out(Easing.cubic) },
  slow: { duration: 420, easing: Easing.out(Easing.cubic) },
  enter: { duration: 350, easing: Easing.out(Easing.back(1.2)) },
};

export const Durations = {
  instant: 100,
  fast: 180,
  normal: 280,
  slow: 420,
  deliberate: 600,
  stagger: 60,
};

// Shared animation builders
export const Animations = {
  fadeInUp: (delay = 0) => ({
    opacity: withDelay(delay, withTiming(1, TimingPresets.normal)),
    translateY: withDelay(delay, withSpring(0, SpringPresets.gentle)),
  }),
  fadeIn: (delay = 0) => ({
    opacity: withDelay(delay, withTiming(1, TimingPresets.normal)),
  }),
  scaleIn: (delay = 0) => ({
    opacity: withDelay(delay, withTiming(1, TimingPresets.fast)),
    scale: withDelay(delay, withSpring(1, SpringPresets.snappy)),
  }),
  pressIn: {
    scale: withSpring(0.96, SpringPresets.snappy),
  },
  pressOut: {
    scale: withSpring(1, SpringPresets.bouncy),
  },
  achievement: () => ({
    scale: withSequence(
      withSpring(1.15, SpringPresets.bouncy),
      withSpring(1, SpringPresets.gentle)
    ),
    opacity: withTiming(1, { duration: 200 }),
  }),
};
