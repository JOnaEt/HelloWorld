import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { FontSizes, FontWeights } from '../../constants/fonts';
import { BorderRadius, Spacing, Shadows } from '../../constants/layout';
import { Avatar } from '../ui/Avatar';
import { Button } from '../ui/Button';
import { GroupMember } from '../../types';

interface AttendanceTrackerProps {
  members: GroupMember[];
  date: string;
  onSave: (presentIds: string[], absentIds: string[]) => void;
  isLoading?: boolean;
}

export function AttendanceTracker({
  members,
  date,
  onSave,
  isLoading = false,
}: AttendanceTrackerProps) {
  const [attendance, setAttendance] = useState<Record<string, boolean>>(() => {
    return Object.fromEntries(members.map((m) => [m.userId, true]));
  });

  const toggle = (userId: string) => {
    setAttendance((prev) => ({ ...prev, [userId]: !prev[userId] }));
  };

  const handleSave = () => {
    const presentIds = Object.entries(attendance)
      .filter(([, present]) => present)
      .map(([id]) => id);
    const absentIds = Object.entries(attendance)
      .filter(([, present]) => !present)
      .map(([id]) => id);
    onSave(presentIds, absentIds);
  };

  const presentCount = Object.values(attendance).filter(Boolean).length;
  const totalCount = members.length;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Attendance</Text>
        <Text style={styles.subtitle}>{date}</Text>
        <View style={styles.statsRow}>
          <View style={styles.statChip}>
            <Ionicons name="checkmark-circle" size={14} color={Colors.success} />
            <Text style={styles.statText}>{presentCount} present</Text>
          </View>
          <View style={styles.statChip}>
            <Ionicons name="close-circle" size={14} color={Colors.error} />
            <Text style={styles.statText}>{totalCount - presentCount} absent</Text>
          </View>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.list}>
        {members.map((member) => {
          const isPresent = attendance[member.userId];
          return (
            <TouchableOpacity
              key={member.userId}
              style={[styles.memberRow, isPresent && styles.memberRowPresent]}
              onPress={() => toggle(member.userId)}
            >
              <Avatar
                uri={member.profile?.photoURL}
                name={member.profile?.displayName ?? '?'}
                size="sm"
              />
              <Text style={styles.memberName} numberOfLines={1}>
                {member.profile?.displayName ?? 'Unknown'}
              </Text>
              <View style={[styles.toggle, isPresent && styles.togglePresent]}>
                <Ionicons
                  name={isPresent ? 'checkmark' : 'close'}
                  size={14}
                  color={isPresent ? Colors.white : Colors.textSecondary}
                />
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <Button
        title={`Save Attendance (${presentCount}/${totalCount})`}
        onPress={handleSave}
        isLoading={isLoading}
        style={styles.saveBtn}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    ...(Shadows.md as object),
  },
  header: {
    padding: Spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: Spacing[2],
  },
  title: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.bold,
    color: Colors.textPrimary,
  },
  subtitle: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing[3],
  },
  statChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.gray100,
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[1],
    borderRadius: BorderRadius.full,
  },
  statText: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
    fontWeight: FontWeights.medium,
  },
  list: {
    maxHeight: 300,
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing[3],
    paddingHorizontal: Spacing[4],
    gap: Spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  memberRowPresent: {
    backgroundColor: '#F0FDF4',
  },
  memberName: {
    flex: 1,
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.medium,
    color: Colors.textPrimary,
  },
  toggle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.gray200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  togglePresent: {
    backgroundColor: Colors.success,
  },
  saveBtn: {
    margin: Spacing[4],
  },
});
