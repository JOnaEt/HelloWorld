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
import { Group } from '../../types';
import { getCategoryLabel } from '../../utils/format';

interface GroupCardProps {
  group: Group;
  isJoined?: boolean;
  variant?: 'default' | 'featured' | 'compact';
  style?: ViewStyle;
  onPress?: () => void;
  onJoin?: () => void;
}

export function GroupCard({
  group,
  isJoined = false,
  variant = 'default',
  style,
  onPress,
  onJoin,
}: GroupCardProps) {
  const handlePress = () => {
    if (onPress) onPress();
    else router.push(`/groups/${group.id}`);
  };

  if (variant === 'featured') {
    return <FeaturedGroupCard group={group} isJoined={isJoined} style={style} onPress={handlePress} onJoin={onJoin} />;
  }

  if (variant === 'compact') {
    return <CompactGroupCard group={group} isJoined={isJoined} style={style} onPress={handlePress} />;
  }

  return <DefaultGroupCard group={group} isJoined={isJoined} style={style} onPress={handlePress} onJoin={onJoin} />;
}

// ─── Default Card ─────────────────────────────────────────────────────────────

function DefaultGroupCard({
  group,
  isJoined,
  style,
  onPress,
  onJoin,
}: {
  group: Group;
  isJoined: boolean;
  style?: ViewStyle;
  onPress: () => void;
  onJoin?: () => void;
}) {
  return (
    <TouchableOpacity style={[styles.defaultCard, style]} onPress={onPress} activeOpacity={0.88}>
      <ImageBackground
        source={
          group.coverUrl
            ? { uri: group.coverUrl }
            : require('../../assets/placeholder.png')
        }
        style={styles.defaultCover}
        imageStyle={styles.defaultCoverImg}
      >
        <LinearGradient
          colors={['transparent', 'rgba(15,23,42,0.5)']}
          style={StyleSheet.absoluteFill}
        />
        {group.isPrivate && (
          <View style={styles.privateBadge}>
            <Ionicons name="lock-closed" size={10} color={Colors.white} />
          </View>
        )}
      </ImageBackground>

      <View style={styles.defaultInfo}>
        <Badge label={getCategoryLabel(group.category)} variant="primary" size="sm" />
        <Text style={styles.defaultName} numberOfLines={1}>{group.name}</Text>
        <Text style={styles.defaultDesc} numberOfLines={2}>{group.description}</Text>

        <View style={styles.defaultFooter}>
          <View style={styles.metaRow}>
            <Ionicons name="people-outline" size={13} color={Colors.textSecondary} />
            <Text style={styles.metaText}>{group.memberCount} members</Text>
          </View>
          <View style={styles.metaRow}>
            <Ionicons name="calendar-outline" size={13} color={Colors.textSecondary} />
            <Text style={styles.metaText}>{group.meetingSchedule.dayOfWeek ?? 'Flexible'}</Text>
          </View>
        </View>

        {!isJoined && onJoin && (
          <TouchableOpacity
            style={styles.joinBtn}
            onPress={(e) => {
              e.stopPropagation();
              onJoin();
            }}
          >
            <Text style={styles.joinBtnText}>Join Group</Text>
          </TouchableOpacity>
        )}
        {isJoined && (
          <View style={styles.joinedChip}>
            <Ionicons name="checkmark-circle" size={14} color={Colors.primary} />
            <Text style={styles.joinedText}>Joined</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

// ─── Featured Card ────────────────────────────────────────────────────────────

function FeaturedGroupCard({
  group,
  isJoined,
  style,
  onPress,
  onJoin,
}: {
  group: Group;
  isJoined: boolean;
  style?: ViewStyle;
  onPress: () => void;
  onJoin?: () => void;
}) {
  return (
    <TouchableOpacity style={[styles.featuredCard, style]} onPress={onPress} activeOpacity={0.9}>
      <ImageBackground
        source={
          group.coverUrl
            ? { uri: group.coverUrl }
            : require('../../assets/placeholder.png')
        }
        style={styles.featuredBg}
        imageStyle={styles.featuredBgImg}
      >
        <LinearGradient
          colors={Colors.gradientOverlay}
          style={styles.featuredGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
        >
          <View style={styles.featuredContent}>
            <View style={styles.featuredTop}>
              <Badge label={getCategoryLabel(group.category)} variant="primary" size="sm" />
              {group.isOnline && (
                <Badge label="Online" variant="info" size="sm" />
              )}
            </View>
            <View>
              <Text style={styles.featuredName}>{group.name}</Text>
              <Text style={styles.featuredDesc} numberOfLines={2}>{group.description}</Text>
              <View style={styles.featuredMeta}>
                <View style={styles.metaRowWhite}>
                  <Ionicons name="people-outline" size={13} color="rgba(255,255,255,0.8)" />
                  <Text style={styles.metaTextWhite}>{group.memberCount} members</Text>
                </View>
                <View style={styles.metaRowWhite}>
                  <Ionicons name="person-outline" size={13} color="rgba(255,255,255,0.8)" />
                  <Text style={styles.metaTextWhite}>{group.leader.name}</Text>
                </View>
              </View>
              {!isJoined && onJoin && (
                <TouchableOpacity
                  style={styles.featuredJoinBtn}
                  onPress={(e) => { e.stopPropagation(); onJoin(); }}
                >
                  <Text style={styles.featuredJoinText}>Join Group</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </LinearGradient>
      </ImageBackground>
    </TouchableOpacity>
  );
}

// ─── Compact Card ─���───────────────────────────────────────────────────────────

function CompactGroupCard({
  group,
  isJoined,
  style,
  onPress,
}: {
  group: Group;
  isJoined: boolean;
  style?: ViewStyle;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={[styles.compactCard, style]} onPress={onPress} activeOpacity={0.88}>
      <View
        style={[
          styles.compactIcon,
          { backgroundColor: Colors.light },
        ]}
      >
        <Ionicons name="people" size={22} color={Colors.primary} />
      </View>
      <View style={styles.compactInfo}>
        <Text style={styles.compactName} numberOfLines={1}>{group.name}</Text>
        <Text style={styles.compactMeta}>
          {group.memberCount} members · {getCategoryLabel(group.category)}
        </Text>
      </View>
      {isJoined && (
        <Ionicons name="checkmark-circle" size={20} color={Colors.primary} />
      )}
      {!isJoined && (
        <Ionicons name="chevron-forward" size={18} color={Colors.gray400} />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  // Default
  defaultCard: {
    width: 200,
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    ...(Shadows.base as object),
  },
  defaultCover: {
    height: 110,
    justifyContent: 'flex-end',
  },
  defaultCoverImg: {
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
  },
  privateBadge: {
    position: 'absolute',
    top: Spacing[2],
    right: Spacing[2],
    backgroundColor: Colors.overlay,
    padding: 4,
    borderRadius: BorderRadius.sm,
  },
  defaultInfo: {
    padding: Spacing[3],
    gap: Spacing[2],
  },
  defaultName: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.bold,
    color: Colors.textPrimary,
  },
  defaultDesc: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
    lineHeight: 16,
  },
  defaultFooter: {
    gap: 3,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
  },
  joinBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing[2],
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    marginTop: Spacing[1],
  },
  joinBtnText: {
    fontSize: FontSizes.xs,
    fontWeight: FontWeights.semibold,
    color: Colors.white,
  },
  joinedChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  joinedText: {
    fontSize: FontSizes.xs,
    color: Colors.primary,
    fontWeight: FontWeights.medium,
  },

  // Featured
  featuredCard: {
    borderRadius: BorderRadius['2xl'],
    overflow: 'hidden',
    ...(Shadows.lg as object),
  },
  featuredBg: {
    height: 240,
  },
  featuredBgImg: {
    borderRadius: BorderRadius['2xl'],
  },
  featuredGradient: {
    flex: 1,
    padding: Spacing[5],
    justifyContent: 'space-between',
  },
  featuredContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  featuredTop: {
    flexDirection: 'row',
    gap: Spacing[2],
  },
  featuredName: {
    fontSize: FontSizes.xl,
    fontWeight: FontWeights.bold,
    color: Colors.white,
    marginBottom: 4,
  },
  featuredDesc: {
    fontSize: FontSizes.sm,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: Spacing[3],
  },
  featuredMeta: {
    flexDirection: 'row',
    gap: Spacing[4],
    marginBottom: Spacing[4],
  },
  metaRowWhite: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaTextWhite: {
    fontSize: FontSizes.xs,
    color: 'rgba(255,255,255,0.8)',
  },
  featuredJoinBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing[3],
    paddingHorizontal: Spacing[5],
    borderRadius: BorderRadius.full,
    alignSelf: 'flex-start',
  },
  featuredJoinText: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.semibold,
    color: Colors.white,
  },

  // Compact
  compactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing[3],
    gap: Spacing[3],
    borderWidth: 1,
    borderColor: Colors.border,
  },
  compactIcon: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  compactInfo: {
    flex: 1,
  },
  compactName: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.semibold,
    color: Colors.textPrimary,
  },
  compactMeta: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
});
