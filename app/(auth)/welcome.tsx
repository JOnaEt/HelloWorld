import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSpring,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { FontSizes, FontWeights } from '../../constants/fonts';
import { BorderRadius, Spacing, Shadows } from '../../constants/layout';

const { width, height } = Dimensions.get('window');

export default function WelcomeScreen() {
  const logoOpacity = useSharedValue(0);
  const logoScale = useSharedValue(0.8);
  const titleOpacity = useSharedValue(0);
  const titleY = useSharedValue(30);
  const taglineOpacity = useSharedValue(0);
  const buttonsOpacity = useSharedValue(0);
  const buttonsY = useSharedValue(40);

  useEffect(() => {
    // Staggered entrance animation
    logoOpacity.value = withDelay(200, withTiming(1, { duration: 600 }));
    logoScale.value = withDelay(200, withSpring(1, { damping: 12 }));
    titleOpacity.value = withDelay(600, withTiming(1, { duration: 600 }));
    titleY.value = withDelay(600, withSpring(0, { damping: 14 }));
    taglineOpacity.value = withDelay(900, withTiming(1, { duration: 500 }));
    buttonsOpacity.value = withDelay(1100, withTiming(1, { duration: 500 }));
    buttonsY.value = withDelay(1100, withSpring(0, { damping: 14 }));
  }, []);

  const logoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value }],
  }));

  const titleStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ translateY: titleY.value }],
  }));

  const taglineStyle = useAnimatedStyle(() => ({
    opacity: taglineOpacity.value,
  }));

  const buttonsStyle = useAnimatedStyle(() => ({
    opacity: buttonsOpacity.value,
    transform: [{ translateY: buttonsY.value }],
  }));

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <LinearGradient
        colors={['#166534', '#15803D', '#16A34A', '#1B4332']}
        style={styles.gradient}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
      />

      {/* Decorative circles */}
      <View style={[styles.circle, styles.circle1]} />
      <View style={[styles.circle, styles.circle2]} />
      <View style={[styles.circle, styles.circle3]} />

      <View style={styles.content}>
        {/* Logo */}
        <Animated.View style={[styles.logoSection, logoStyle]}>
          <View style={styles.logoMark}>
            <Text style={styles.logoMarkText}>T</Text>
          </View>
          <View style={styles.crossAccent}>
            <Ionicons name="add" size={16} color="rgba(255,255,255,0.5)" />
          </View>
        </Animated.View>

        {/* Title */}
        <Animated.View style={[styles.titleSection, titleStyle]}>
          <Text style={styles.appName}>TOPIC Digital</Text>
          <Animated.View style={taglineStyle}>
            <Text style={styles.churchName}>Temple of Priests International Church</Text>
            <Text style={styles.tagline}>
              Grow deeper in faith, connect with community, and experience God's presence daily.
            </Text>
          </Animated.View>
        </Animated.View>

        {/* Feature bullets */}
        <Animated.View style={[styles.features, taglineStyle]}>
          {[
            { icon: 'book-outline', text: 'Daily devotionals & Bible reading' },
            { icon: 'people-outline', text: 'Connect with your church family' },
            { icon: 'hand-right-outline', text: 'Pray together as one body' },
          ].map((item, i) => (
            <View key={i} style={styles.featureItem}>
              <View style={styles.featureIcon}>
                <Ionicons name={item.icon as any} size={16} color={Colors.primary} />
              </View>
              <Text style={styles.featureText}>{item.text}</Text>
            </View>
          ))}
        </Animated.View>

        {/* Action buttons */}
        <Animated.View style={[styles.buttons, buttonsStyle]}>
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => router.push('/(auth)/register')}
            activeOpacity={0.9}
          >
            <Text style={styles.primaryBtnText}>Create Account</Text>
            <Ionicons name="arrow-forward" size={18} color={Colors.primary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={() => router.push('/(auth)/login')}
            activeOpacity={0.8}
          >
            <Text style={styles.secondaryBtnText}>Sign In</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Footer */}
        <Animated.Text style={[styles.footer, taglineStyle]}>
          By continuing, you agree to our{' '}
          <Text style={styles.footerLink}>Terms of Service</Text>
          {' & '}
          <Text style={styles.footerLink}>Privacy Policy</Text>
        </Animated.Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.deep,
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  circle: {
    position: 'absolute',
    borderRadius: 9999,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  circle1: {
    width: 400,
    height: 400,
    top: -120,
    right: -100,
  },
  circle2: {
    width: 300,
    height: 300,
    bottom: 100,
    left: -80,
  },
  circle3: {
    width: 200,
    height: 200,
    top: height * 0.35,
    right: -60,
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  content: {
    flex: 1,
    padding: Spacing[6],
    paddingTop: Spacing[16],
    paddingBottom: Spacing[10],
    justifyContent: 'space-between',
  },
  logoSection: {
    alignItems: 'flex-start',
    position: 'relative',
  },
  logoMark: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...(Shadows.lg as object),
  },
  logoMarkText: {
    fontSize: 38,
    fontWeight: FontWeights.black,
    color: Colors.primary,
  },
  crossAccent: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleSection: {
    gap: Spacing[4],
  },
  appName: {
    fontSize: FontSizes['5xl'],
    fontWeight: FontWeights.black,
    color: Colors.white,
    letterSpacing: -1,
    lineHeight: FontSizes['5xl'] * 1.1,
  },
  churchName: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.semibold,
    color: Colors.primaryLight,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: Spacing[3],
  },
  tagline: {
    fontSize: FontSizes.base,
    color: 'rgba(255,255,255,0.75)',
    lineHeight: 24,
  },
  features: {
    gap: Spacing[3],
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
  },
  featureIcon: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.sm,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureText: {
    fontSize: FontSizes.sm,
    color: 'rgba(255,255,255,0.85)',
    flex: 1,
  },
  buttons: {
    gap: Spacing[3],
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing[2],
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    paddingVertical: Spacing[4],
    ...(Shadows.lg as object),
  },
  primaryBtnText: {
    fontSize: FontSizes.base,
    fontWeight: FontWeights.bold,
    color: Colors.primary,
  },
  secondaryBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing[4],
    borderRadius: BorderRadius.xl,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  secondaryBtnText: {
    fontSize: FontSizes.base,
    fontWeight: FontWeights.semibold,
    color: Colors.white,
  },
  footer: {
    fontSize: FontSizes.xs,
    color: 'rgba(255,255,255,0.5)',
    textAlign: 'center',
  },
  footerLink: {
    color: 'rgba(255,255,255,0.8)',
    textDecorationLine: 'underline',
  },
});
