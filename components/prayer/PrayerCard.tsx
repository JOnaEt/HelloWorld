import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Colors } from '../../constants/colors';
import { FontSizes, FontWeights } from '../../constants/fonts';
import { BorderRadius, Shadows, Spacing } from '../../constants/layout';
import { Avatar } from '../ui/Avatar';
import { Badge } from '../ui/Badge';
import { PrayerRequest } from '../../types';
import { formatRelativeTime } from '../../utils/date';
import { getCategoryLabel, truncate } from '../../utils/format';

interface PrayerCardProps {
  prayer: PrayerRequest;
  onPray?: () => void;
  hasPrayed?: boolean;
  style?: ViewStyle;
  onPress?: () => void;
  compact?: boolean;
}

export function PrayerCard({
  prayer,
  onPray,
  hasPrayed = false,
  style,
  onPress,
  compact = false,
}: PrayerCardProps) {
  const handlePress = () => {
    if (onPress) onPress();
    else router.push(`/prayer/${prayer.id}`);
  };

  const displayName = prayer.isAnonymous
    ? 'Anonymous'
    : (prayer.userProfile?.displayName ?? 'Church Member');

  const isAnswered = prayer.status === 'answered';

  if (compact) {
    return (
      <TouchableOpacity style={[styles.compactCard, style]} onPress={handlePress} activeOpacity={0.88}>
        <View style={styles.compactLeft}>
          <Avatar
            uri={prayer.isAnonymous ? undefined : prayer.userProfile?.photoURL}
            name={displayName}
            size="sm"
          />
          <View style={styles.compactInfo}>
            <Text style={styles.compactTitle} numberOfLines={1}>{prayer.title}</Text>
            <Text style={styles.compactMeta}>{displayName} · {formatRelativeTime(prayer.createdAt as string)}</Text>
          </View>
        </View>
        <View style={styles.compactRight}>
          <Ionicons name="hand-right-outline" size={14} color={Colors.primary} />
          <Text style={styles.compactPrayCount}>{prayer.prayerCount}</Text>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity style={[styles.card, style]} onPress={handlePress} activeOpacity={0.88}>
      {/* Header */}
      <View style={styles.header}>
        <Avatar
          uri={prayer.isAnonymous ? undefined : prayer.userProfile?.photoURL}
          name={displayName}
          size="md"
        />
        <View style={styles.headerInfo}>
          <Text style={styles.name}>{displayName}</Text>
          <Text style={styles.time}>{formatRelativeTime(prayer.createdAt as string)}</Text>
        </View>
        <Badge
          label={isAnswered ? 'Answered' : getCategoryLabel(prayer.category)}
          variant={isAnswered ? 'success' : 'primary'}
          size="sm"
        />
      </View>

      {/* Title */}
      <Text style={styles.title}>{prayer.title}</Text>

      {/* Content */}
      <Text style={styles.content} numberOfLines={3}>
        {prayer.content}
      </Text>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.prayCount}>
          <Ionicons name="hand-right-outline" size={14} color={Colors.textSecondary} />
          <Text style={styles.prayCountText}>
            {prayer.prayerCount} {prayer.prayerCount === 1 ? 'person' : 'people'} praying
          </Text>
        </View>

        {!isAnswered && onPray && (
          <TouchableOpacity
            style={[styles.prayBtn, hasPrayed && styles.prayBtnActive]}
            onPress={(e) => {
              e.stopPropagation();
              if (!hasPrayed) onPray();
            }}
            disabled={hasPrayed}
          >
            <Ionicons
              name="hand-right"
              size={14}
              color={hasPrayed ? Colors.white : Colors.primary}
            />
            <Text style={[styles.prayBtnText, hasPrayed && styles.prayBtnTextActive]}>
              {hasPrayed ? 'Praying' : 'Pray'}
            </Text>
          </TouchableOpacity>
        )}

        {isAnswered && (
          <View style={styles.answeredBadge}>
            <Ionicons name="checkmark-circle" size={14} color={Colors.success} />
            <Text style={styles.answeredText}>Prayer Answered!</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.xl,
    padding: Spacing[4],
    gap: Spacing[3],
    ...(Shadows.base as object),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
  },
  headerInfo: {
    flex: 1,
  },
  name: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.semibold,
    color: Colors.textPrimary,
  },
  time: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  title: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.semibold,
    color: Colors.textPrimary,
    lineHeight: 22,
  },
  content: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Spacing[2],
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  prayCount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  prayCountText: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
  },
  prayBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: Spacing[2],
    paddingHorizontal: Spacing[3],
    borderRadius: BorderRadius.full,
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  prayBtnActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  prayBtnText: {
    fontSize: FontSizes.xs,
    fontWeight: FontWeights.semibold,
    color: Colors.primary,
  },
  prayBtnTextActive: {
    color: Colors.white,
  },
  answeredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  answeredText: {
    fontSize: FontSizes.xs,
    color: Colors.success,
    fontWeight: FontWeights.medium,
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
    flex: 1,
  },
  compactInfo: {
    flex: 1,
  },
  compactTitle: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.semibold,
    color: Colors.textPrimary,
  },
  compactMeta: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  compactRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginLeft: Spacing[3],
  },
  compactPrayCount: {
    fontSize: FontSizes.xs,
    fontWeight: FontWeights.semibold,
    color: Colors.primary,
  },
});
