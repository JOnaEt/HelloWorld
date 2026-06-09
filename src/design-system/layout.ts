import { Dimensions, Platform, StatusBar } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export const Layout = {
  screen: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  window: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  isSmallDevice: SCREEN_WIDTH < 380,
  isTablet: SCREEN_WIDTH >= 768,
  // Component heights
  tabBar: 84,
  header: 56,
  miniPlayer: 72,
  statusBar: Platform.OS === 'ios' ? 44 : (StatusBar.currentHeight ?? 24),
  // Breakpoints
  breakpoints: {
    sm: 380,
    md: 414,
    lg: 768,
  },
};
