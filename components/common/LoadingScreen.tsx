import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../../constants/colors';
import { FontSizes, FontWeights } from '../../constants/fonts';

interface LoadingScreenProps {
  message?: string;
  fullScreen?: boolean;
}

export function LoadingScreen({
  message = 'Loading...',
  fullScreen = true,
}: LoadingScreenProps) {
  const opacity = useSharedValue(1);
  const scale = useSharedValue(1);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.5, { duration: 800 }),
        withTiming(1, { duration: 800 })
      ),
      -1,
      true
    );
    scale.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: 1000 }),
        withTiming(1, { duration: 1000 })
      ),
      -1,
      true
    );
  }, []);

  const animatedLogoStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  if (!fullScreen) {
    return (
      <View style={styles.inline}>
        <ActivityIndicator size="small" color={Colors.primary} />
        {message !== 'Loading...' && (
          <Text style={styles.inlineText}>{message}</Text>
        )}
      </View>
    );
  }

  return (
    <LinearGradient
      colors={['#F8FAFC', '#DCFCE7', '#F8FAFC']}
      style={styles.container}
    >
      <Animated.View style={[styles.logoContainer, animatedLogoStyle]}>
        <View style={styles.logoMark}>
          <Text style={styles.logoText}>T</Text>
        </View>
        <Text style={styles.appName}>TOPIC Digital</Text>
        <Text style={styles.tagline}>Temple of Priests International Church</Text>
      </Animated.View>

      <View style={styles.loadingSection}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>{message}</Text>
      </View>
    </LinearGradient>
  );
}

export function LoadingOverlay({ message }: { message?: string }) {
  return (
    <View style={styles.overlay}>
      <View style={styles.overlayCard}>
        <ActivityIndicator size="large" color={Colors.primary} />
        {message && <Text style={styles.overlayText}>{message}</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 48,
  },
  logoContainer: {
    alignItems: 'center',
    gap: 12,
  },
  logoMark: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 12,
  },
  logoText: {
    fontSize: 40,
    fontWeight: FontWeights.black,
    color: Colors.white,
  },
  appName: {
    fontSize: FontSizes['3xl'],
    fontWeight: FontWeights.black,
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  loadingSection: {
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
  },

  // Inline
  inline: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    gap: 8,
  },
  inlineText: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
  },

  // Overlay
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
  },
  overlayCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    gap: 16,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  overlayText: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});
