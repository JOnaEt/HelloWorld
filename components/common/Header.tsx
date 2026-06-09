import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { FontSizes, FontWeights } from '../../constants/fonts';
import { Spacing, Shadows } from '../../constants/layout';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  showLogo?: boolean;
  rightElement?: React.ReactNode;
  leftElement?: React.ReactNode;
  transparent?: boolean;
  light?: boolean; // light text on dark background
  onBack?: () => void;
}

export function Header({
  title,
  subtitle,
  showBack = false,
  showLogo = false,
  rightElement,
  leftElement,
  transparent = false,
  light = false,
  onBack,
}: HeaderProps) {
  const insets = useSafeAreaInsets();
  const textColor = light ? Colors.white : Colors.textPrimary;

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  return (
    <View
      style={[
        styles.container,
        !transparent && styles.solidBg,
        { paddingTop: insets.top + (Platform.OS === 'android' ? 4 : 0) },
      ]}
    >
      <View style={styles.inner}>
        {/* Left */}
        <View style={styles.leftSection}>
          {showBack && (
            <TouchableOpacity
              onPress={handleBack}
              style={styles.iconBtn}
              accessibilityLabel="Go back"
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="arrow-back" size={24} color={textColor} />
            </TouchableOpacity>
          )}
          {leftElement}
          {showLogo && !showBack && (
            <View style={styles.logoRow}>
              <View style={styles.logoMark}>
                <Text style={styles.logoMarkText}>T</Text>
              </View>
              <View>
                <Text style={[styles.logoTitle, { color: textColor }]}>TOPIC</Text>
                <Text style={styles.logoSubtitle}>Digital</Text>
              </View>
            </View>
          )}
        </View>

        {/* Center */}
        {title && (
          <View style={styles.centerSection}>
            <Text style={[styles.title, { color: textColor }]} numberOfLines={1}>
              {title}
            </Text>
            {subtitle && (
              <Text style={styles.subtitle} numberOfLines={1}>
                {subtitle}
              </Text>
            )}
          </View>
        )}

        {/* Right */}
        <View style={styles.rightSection}>{rightElement}</View>
      </View>
    </View>
  );
}

// Notification button
interface NotificationBtnProps {
  count?: number;
  onPress: () => void;
  light?: boolean;
}

export function NotificationBtn({ count = 0, onPress, light = false }: NotificationBtnProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={styles.notifBtn}
      accessibilityLabel={`Notifications${count > 0 ? `, ${count} unread` : ''}`}
    >
      <Ionicons
        name="notifications-outline"
        size={24}
        color={light ? Colors.white : Colors.textPrimary}
      />
      {count > 0 && (
        <View style={styles.notifBadge}>
          <Text style={styles.notifBadgeText}>{count > 9 ? '9+' : count}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    zIndex: 100,
  },
  solidBg: {
    backgroundColor: Colors.background,
    ...(Shadows.sm as object),
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing[5],
    paddingBottom: Spacing[3],
    paddingTop: Spacing[2],
    minHeight: 56,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: Spacing[2],
  },
  centerSection: {
    alignItems: 'center',
    flex: 2,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    flex: 1,
    gap: Spacing[2],
  },
  iconBtn: {
    padding: Spacing[1],
  },
  title: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.semibold,
    color: Colors.textPrimary,
  },
  subtitle: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
  },
  logoMark: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoMarkText: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.black,
    color: Colors.white,
  },
  logoTitle: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.black,
    color: Colors.textPrimary,
    letterSpacing: 1,
  },
  logoSubtitle: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
    letterSpacing: 0.5,
    marginTop: -2,
  },
  notifBtn: {
    padding: Spacing[1],
    position: 'relative',
  },
  notifBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.error,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  notifBadgeText: {
    fontSize: 9,
    color: Colors.white,
    fontWeight: FontWeights.bold,
  },
});
