import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  ViewStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Colors } from '../../constants/colors';
import { FontSizes, FontWeights } from '../../constants/fonts';
import { BorderRadius, Shadows, Spacing } from '../../constants/layout';
import { Badge } from '../ui/Badge';
import { Devotional } from '../../types';
import { formatDurationLong } from '../../utils/date';
import { getCategoryLabel } from '../../utils/format';

interface DevotionalCardProps {
  devotional: Devotional;
  variant?: 'default' | 'featured' | 'horizontal' | 'compact';
  style?: ViewStyle;
  onPress?: () => void;
}

export function DevotionalCard({
  devotional,
  variant = 'default',
  style,
  onPress,
}: DevotionalCardProps) {
  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      router.push(`/devotional/${devotional.id}`);
    }
  };

  if (variant === 'featured') {
    return <FeaturedCard devotional={devotional} style={style} onPress={handlePress} />;
  }

  if (variant === 'horizontal') {
    return <HorizontalCard devotional={devotional} style={style} onPress={handlePress} />;
  }

  if (variant === 'compact') {
    return <CompactCard devotional={devotional} style={style} onPress={handlePress} />;
  }

  return <DefaultCard devotional={devotional} style={style} onPress={handlePress} />;
}

// ─── Featured Card ────────────────────────────────────────────────────────────

function FeaturedCard({
  devotional,
  style,
  onPress,
}: {
  devotional: Devotional;
  style?: ViewStyle;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[styles.featuredCard, style]}
      onPress={onPress}
      activeOpacity={0.92}
    >
      <ImageBackground
        source={
          devotional.coverUrl
            ? { uri: devotional.coverUrl }
            : require('../../assets/placeholder.png')
        }
        style={styles.featuredBg}
        imageStyle={{ borderRadius: BorderRadius['2xl'] }}
      >
        <LinearGradient
          colors={Colors.gradientOverlay}
          style={styles.featuredGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
        >
          <View style={styles.featuredContent}>
            <View style={styles.featuredTop}>
              {devotional.isDaily && (
                <Badge label="Today's Devotional" variant="primary" />
              )}
              <Badge label={getCategoryLabel(devotional.category)} variant="gray" />
            </View>
            <View style={styles.featuredBottom}>
              <Text style={styles.featuredScripture}>
                {devotional.scripture.book} {devotional.scripture.chapter}:{devotional.scripture.verses}
              </Text>
              <Text style={styles.featuredTitle} numberOfLines={2}>
                {devotional.title}
              </Text>
              <View style={styles.featuredMeta}>
                <View style={styles.authorRow}>
                  <Ionicons name="person-circle-outline" size={14} color="rgba(255,255,255,0.8)" />
                  <Text style={styles.featuredAuthor}>{devotional.author.name}</Text>
                </View>
                {devotional.audioDuration && (
                  <View style={styles.durationRow}>
                    <Ionicons name="headset-outline" size={14} color="rgba(255,255,255,0.8)" />
                    <Text style={styles.featuredDuration}>
                      {formatDurationLong(devotional.audioDuration)}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        </LinearGradient>
      </ImageBackground>
    </TouchableOpacity>
  );
}

// ─── Default Card ─────────────────────────────────────────────────────────────

function DefaultCard({
  devotional,
  style,
  onPress,
}: {
  devotional: Devotional;
  style?: ViewStyle;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[styles.defaultCard, style]}
      onPress={onPress}
      activeOpacity={0.88}
    >
      <ImageBackground
        source={
          devotional.thumbnailUrl
            ? { uri: devotional.thumbnailUrl }
            : require('../../assets/placeholder.png')
        }
        style={styles.defaultThumbnail}
        imageStyle={styles.defaultThumbnailImg}
      >
        <LinearGradient
          colors={['transparent', 'rgba(15, 23, 42, 0.6)']}
          style={StyleSheet.absoluteFill}
        />
        <Badge
          label={getCategoryLabel(devotional.category)}
          variant="primary"
          style={styles.categoryBadge}
        />
      </ImageBackground>
      <View style={styles.defaultInfo}>
        <Text style={styles.defaultScripture} numberOfLines={1}>
          {devotional.scripture.book} {devotional.scripture.chapter}:{devotional.scripture.verses}
        </Text>
        <Text style={styles.defaultTitle} numberOfLines={2}>
          {devotional.title}
        </Text>
        <View style={styles.defaultFooter}>
          <Text style={styles.defaultAuthor} numberOfLines={1}>
            {devotional.author.name}
          </Text>
          {devotional.audioDuration && (
            <View style={styles.durationChip}>
              <Ionicons name="play-circle-outline" size={12} color={Colors.primary} />
              <Text style={styles.durationText}>
                {formatDurationLong(devotional.audioDuration)}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

// ─── Horizontal Card ──────────────────────────────────────────────────────────

function HorizontalCard({
  devotional,
  style,
  onPress,
}: {
  devotional: Devotional;
  style?: ViewStyle;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[styles.horizontalCard, style]}
      onPress={onPress}
      activeOpacity={0.88}
    >
      <ImageBackground
        source={
          devotional.thumbnailUrl
            ? { uri: devotional.thumbnailUrl }
            : require('../../assets/placeholder.png')
        }
        style={styles.horizontalThumb}
        imageStyle={{ borderRadius: BorderRadius.lg }}
      >
        {devotional.audioUrl && (
          <View style={styles.playOverlay}>
            <Ionicons name="play" size={16} color={Colors.white} />
          </View>
        )}
      </ImageBackground>
      <View style={styles.horizontalInfo}>
        <Badge
          label={getCategoryLabel(devotional.category)}
          variant="primary"
          size="sm"
          style={{ marginBottom: 4 }}
        />
        <Text style={styles.horizontalTitle} numberOfLines={2}>
          {devotional.title}
        </Text>
        <Text style={styles.horizontalMeta}>
          {devotional.author.name}
          {devotional.audioDuration ? ` · ${formatDurationLong(devotional.audioDuration)}` : ''}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

// ─── Compact Card ─────────────────────────────────────────────────────────────

function CompactCard({
  devotional,
  style,
  onPress,
}: {
  devotional: Devotional;
  style?: ViewStyle;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[styles.compactCard, style]}
      onPress={onPress}
      activeOpacity={0.88}
    >
      <View style={styles.compactLeft}>
        <Text style={styles.compactCategory}>
          {getCategoryLabel(devotional.category).toUpperCase()}
        </Text>
        <Text style={styles.compactTitle} numberOfLines={1}>
          {devotional.title}
        </Text>
        <Text style={styles.compactAuthor}>{devotional.author.name}</Text>
      </View>
      <View style={styles.compactRight}>
        {devotional.audioUrl && (
          <View style={styles.compactPlayBtn}>
            <Ionicons name="play" size={14} color={Colors.white} />
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  // Featured
  featuredCard: {
    borderRadius: BorderRadius['2xl'],
    overflow: 'hidden',
    ...(Shadows.lg as object),
  },
  featuredBg: {
    height: 280,
    justifyContent: 'flex-end',
  },
  featuredGradient: {
    flex: 1,
    justifyContent: 'space-between',
    padding: Spacing[5],
  },
  featuredContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  featuredTop: {
    flexDirection: 'row',
    gap: Spacing[2],
    flexWrap: 'wrap',
  },
  featuredBottom: {
    gap: Spacing[2],
  },
  featuredScripture: {
    fontSize: FontSizes.sm,
    color: 'rgba(255,255,255,0.75)',
    fontWeight: FontWeights.medium,
  },
  featuredTitle: {
    fontSize: FontSizes['2xl'],
    fontWeight: FontWeights.bold,
    color: Colors.white,
    lineHeight: 32,
  },
  featuredMeta: {
    flexDirection: 'row',
    gap: Spacing[4],
    alignItems: 'center',
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  durationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  featuredAuthor: {
    fontSize: FontSizes.sm,
    color: 'rgba(255,255,255,0.8)',
  },
  featuredDuration: {
    fontSize: FontSizes.sm,
    color: 'rgba(255,255,255,0.8)',
  },

  // Default
  defaultCard: {
    width: 180,
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    ...(Shadows.base as object),
  },
  defaultThumbnail: {
    height: 120,
    justifyContent: 'flex-end',
  },
  defaultThumbnailImg: {
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
  },
  categoryBadge: {
    position: 'absolute',
    top: Spacing[2],
    left: Spacing[2],
  },
  defaultInfo: {
    padding: Spacing[3],
    gap: 3,
  },
  defaultScripture: {
    fontSize: FontSizes.xs,
    color: Colors.primary,
    fontWeight: FontWeights.semibold,
  },
  defaultTitle: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.semibold,
    color: Colors.textPrimary,
    lineHeight: 18,
  },
  defaultFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 2,
  },
  defaultAuthor: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
    flex: 1,
  },
  durationChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  durationText: {
    fontSize: FontSizes.xs,
    color: Colors.primary,
  },

  // Horizontal
  horizontalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.xl,
    padding: Spacing[3],
    gap: Spacing[3],
    ...(Shadows.sm as object),
  },
  horizontalThumb: {
    width: 70,
    height: 70,
  },
  playOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.overlay,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  horizontalInfo: {
    flex: 1,
    gap: 2,
  },
  horizontalTitle: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.semibold,
    color: Colors.textPrimary,
    lineHeight: 20,
  },
  horizontalMeta: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
  },

  // Compact
  compactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing[3],
    paddingHorizontal: Spacing[4],
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  compactLeft: {
    flex: 1,
    gap: 2,
  },
  compactCategory: {
    fontSize: 10,
    fontWeight: FontWeights.semibold,
    color: Colors.primary,
    letterSpacing: 0.8,
  },
  compactTitle: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.semibold,
    color: Colors.textPrimary,
  },
  compactAuthor: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
  },
  compactRight: {
    marginLeft: Spacing[3],
  },
  compactPlayBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
