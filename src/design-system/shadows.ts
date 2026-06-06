import { Platform, ViewStyle } from 'react-native';

const shadow = (
  y: number,
  blur: number,
  opacity: number,
  elevation: number
): ViewStyle =>
  Platform.select({
    ios: {
      shadowColor: '#0F172A',
      shadowOffset: { width: 0, height: y },
      shadowOpacity: opacity,
      shadowRadius: blur,
    },
    android: { elevation },
  }) ?? {};

export const Shadows = {
  none: {} as ViewStyle,
  xs: shadow(1, 2, 0.04, 1),
  sm: shadow(2, 6, 0.06, 2),
  md: shadow(4, 12, 0.08, 4),
  lg: shadow(8, 24, 0.1, 8),
  xl: shadow(16, 40, 0.12, 16),
  xxl: shadow(24, 60, 0.15, 24),
  // Colored
  brand: Platform.select({
    ios: {
      shadowColor: '#16A34A',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.25,
      shadowRadius: 20,
    },
    android: { elevation: 10 },
  }) ?? ({} as ViewStyle),
  card: Platform.select({
    ios: {
      shadowColor: '#0F172A',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.06,
      shadowRadius: 16,
    },
    android: { elevation: 3 },
  }) ?? ({} as ViewStyle),
};
