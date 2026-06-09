import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { FontSizes, FontWeights } from '../../constants/fonts';
import { BorderRadius, Spacing } from '../../constants/layout';
import { Avatar } from '../ui/Avatar';
import { Badge } from '../ui/Badge';
import { GroupMember } from '../../types';
import { formatRelativeTime } from '../../utils/date';

interface MemberItemProps {
  member: GroupMember;
  isCurrentUser?: boolean;
  onPress?: () => void;
}

export function MemberItem({ member, isCurrentUser = false, onPress }: MemberItemProps) {
  const badgeVariant = member.role === 'leader' ? 'primary' : member.role === 'co-leader' ? 'info' : 'gray';
  const badgeLabel = member.role === 'leader' ? 'Leader' : member.role === 'co-leader' ? 'Co-Leader' : 'Member';

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={onPress ? 0.85 : 1}
    >
      <Avatar
        uri={member.profile?.photoURL}
        name={member.profile?.displayName ?? '?'}
        size="md"
      />
      <View style={styles.info}>
        <View style={styles.nameRow}>
          <Text style={styles.name} numberOfLines={1}>
            {member.profile?.displayName ?? 'Unknown'}
          </Text>
          {isCurrentUser && (
            <Text style={styles.youLabel}>(You)</Text>
          )}
        </View>
        <View style={styles.metaRow}>
          <Badge label={badgeLabel} variant={badgeVariant as any} size="sm" />
          <Text style={styles.joinedText}>
            Joined {formatRelativeTime(member.joinedAt as string)}
          </Text>
        </View>
      </View>
      {member.attendanceRate !== undefined && (
        <View style={styles.attendance}>
          <Text style={styles.attendanceValue}>
            {Math.round(member.attendanceRate * 100)}%
          </Text>
          <Text style={styles.attendanceLabel}>Attendance</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing[3],
    paddingHorizontal: Spacing[4],
    gap: Spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  info: {
    flex: 1,
    gap: 4,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
  },
  name: {
    fontSize: FontSizes.base,
    fontWeight: FontWeights.semibold,
    color: Colors.textPrimary,
  },
  youLabel: {
    fontSize: FontSizes.xs,
    color: Colors.primary,
    fontWeight: FontWeights.medium,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
  },
  joinedText: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
  },
  attendance: {
    alignItems: 'center',
  },
  attendanceValue: {
    fontSize: FontSizes.base,
    fontWeight: FontWeights.bold,
    color: Colors.primary,
  },
  attendanceLabel: {
    fontSize: 9,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
