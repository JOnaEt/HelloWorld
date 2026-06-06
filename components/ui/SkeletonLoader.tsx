import React, { useEffect } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { Colors } from '../../constants/colors';
import { BorderRadius, Spacing } from '../../constants/layout';

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export function Skeleton({ width = '100%', height = 16, borderRadius = 8, style }: SkeletonProps) {
  const shimmer = useSharedValue(0);

  useEffect(() => {
    shimmer.value = withRepeat(withTiming(1, { duration: 1200 }), -1, false);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(shimmer.value, [0, 0.5, 1], [0.4, 0.85, 0.4], Extrapolation.CLAMP),
  }));

  return (
    <Animated.View
      style={[
        {
          width: width as number,
          height,
          borderRadius,
          backgroundColor: Colors.gray200,
        },
        animatedStyle,
        style,
      ]}
    />
  );
}

// ─── Pre-built skeleton layouts ───────────────────────────────────────────────

export function DevotionalCardSkeleton({ style }: { style?: ViewStyle }) {
  return (
    <View style={[styles.devotionalCard, style]}>
      <Skeleton height={120} borderRadius={12} />
      <View style={styles.devotionalCardBody}>
        <Skeleton width={80} height={12} borderRadius={6} />
        <Skeleton width="90%" height={16} borderRadius={6} style={{ marginTop: 6 }} />
        <Skeleton width="70%" height={16} borderRadius={6} style={{ marginTop: 4 }} />
        <View style={styles.row}>
          <Skeleton width={60} height={12} borderRadius={6} />
          <Skeleton width={40} height={12} borderRadius={6} />
        </View>
      </View>
    </View>
  );
}

export function GroupCardSkeleton({ style }: { style?: ViewStyle }) {
  return (
    <View style={[styles.groupCard, style]}>
      <Skeleton height={110} borderRadius={12} />
      <View style={styles.groupCardBody}>
        <Skeleton width={60} height={12} borderRadius={6} />
        <Skeleton width="85%" height={16} borderRadius={6} style={{ marginTop: 6 }} />
        <Skeleton width="100%" height={12} borderRadius={6} style={{ marginTop: 4 }} />
        <Skeleton width="80%" height={12} borderRadius={6} style={{ marginTop: 4 }} />
      </View>
    </View>
  );
}

export function PrayerCardSkeleton({ style }: { style?: ViewStyle }) {
  return (
    <View style={[styles.prayerCard, style]}>
      <View style={styles.row}>
        <Skeleton width={44} height={44} borderRadius={22} />
        <View style={{ flex: 1, gap: 6 }}>
          <Skeleton width="50%" height={14} borderRadius={6} />
          <Skeleton width="35%" height={12} borderRadius={6} />
        </View>
        <Skeleton width={60} height={22} borderRadius={11} />
      </View>
      <Skeleton width="80%" height={16} borderRadius={6} style={{ marginTop: 8 }} />
      <Skeleton width="100%" height={12} borderRadius={6} style={{ marginTop: 8 }} />
      <Skeleton width="95%" height={12} borderRadius={6} style={{ marginTop: 4 }} />
      <Skeleton width="70%" height={12} borderRadius={6} style={{ marginTop: 4 }} />
    </View>
  );
}

export function HeroCardSkeleton({ style }: { style?: ViewStyle }) {
  return <Skeleton height={280} borderRadius={24} style={style} />;
}

export function ProfileSkeleton({ style }: { style?: ViewStyle }) {
  return (
    <View style={[styles.profile, style]}>
      <Skeleton width={80} height={80} borderRadius={40} style={{ alignSelf: 'center' }} />
      <Skeleton width={140} height={20} borderRadius={8} style={styles.centered} />
      <Skeleton width={100} height={14} borderRadius={6} style={styles.centered} />
      <View style={styles.statsRow}>
        {[0, 1, 2].map((i) => (
          <View key={i} style={styles.statItem}>
            <Skeleton width={40} height={22} borderRadius={8} style={styles.centered} />
            <Skeleton width={60} height={12} borderRadius={6} style={[styles.centered, { marginTop: 4 }]} />
          </View>
        ))}
      </View>
    </View>
  );
}

export function ListItemSkeleton({ count = 3, style }: { count?: number; style?: ViewStyle }) {
  return (
    <View style={[styles.listContainer, style]}>
      {Array.from({ length: count }).map((_, i) => (
        <View key={i} style={styles.listItem}>
          <Skeleton width={48} height={48} borderRadius={12} />
          <View style={{ flex: 1, gap: 6 }}>
            <Skeleton width="75%" height={14} borderRadius={6} />
            <Skeleton width="50%" height={12} borderRadius={6} />
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  devotionalCard: {
    width: 180,
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
  },
  devotionalCardBody: {
    padding: Spacing[3],
    gap: 4,
  },
  groupCard: {
    width: 200,
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
  },
  groupCardBody: {
    padding: Spacing[3],
  },
  prayerCard: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.xl,
    padding: Spacing[4],
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
  },
  profile: {
    gap: Spacing[3],
    padding: Spacing[5],
  },
  centered: {
    alignSelf: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: Spacing[4],
  },
  statItem: {
    alignItems: 'center',
  },
  listContainer: {
    gap: Spacing[3],
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
    padding: Spacing[3],
  },
});
