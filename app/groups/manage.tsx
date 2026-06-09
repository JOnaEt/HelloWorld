import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { FontSizes, FontWeights } from '../../constants/fonts';
import { Spacing, BorderRadius } from '../../constants/layout';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useGroups } from '../../hooks/useGroups';
import { useAuth } from '../../hooks/useAuth';
import { Group, GroupCategory, MeetingSchedule } from '../../types';

const CATEGORIES: Array<{ value: GroupCategory; label: string }> = [
  { value: 'bible-study', label: 'Bible Study' },
  { value: 'prayer', label: 'Prayer' },
  { value: 'youth', label: 'Youth' },
  { value: 'women', label: 'Women' },
  { value: 'men', label: 'Men' },
  { value: 'couples', label: 'Couples' },
  { value: 'singles', label: 'Singles' },
  { value: 'worship', label: 'Worship' },
  { value: 'outreach', label: 'Outreach' },
  { value: 'leadership', label: 'Leadership' },
];

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function ManageGroupScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { createNewGroup } = useGroups();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<GroupCategory>('bible-study');
  const [dayOfWeek, setDayOfWeek] = useState('Sunday');
  const [time, setTime] = useState('18:00');
  const [location, setLocation] = useState('');
  const [isOnline, setIsOnline] = useState(false);
  const [isPrivate, setIsPrivate] = useState(false);
  const [maxMembers, setMaxMembers] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = 'Group name is required';
    if (!description.trim()) e.description = 'Description is required';
    if (description.trim().length < 20) e.description = 'Description must be at least 20 characters';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleCreate = async () => {
    if (!user || !validate()) return;
    setIsLoading(true);

    try {
      const schedule: MeetingSchedule = {
        frequency: 'weekly',
        dayOfWeek,
        time,
        timezone: 'America/New_York',
      };

      const groupData: Omit<Group, 'id'> = {
        name: name.trim(),
        description: description.trim(),
        category,
        leaderId: user.uid,
        leader: {
          id: user.uid,
          name: user.displayName,
          photoURL: user.photoURL,
        },
        coLeaderIds: [],
        memberCount: 1,
        maxMembers: maxMembers ? parseInt(maxMembers) : undefined,
        isPrivate,
        meetingSchedule: schedule,
        location: location.trim() || undefined,
        isOnline,
        meetingUrl: isOnline ? '' : undefined,
        createdAt: new Date().toISOString(),
        tags: [category],
        announcementsEnabled: true,
        prayerEnabled: true,
        isActive: true,
      };

      const id = await createNewGroup(groupData);
      if (id) {
        router.replace(`/groups/${id}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="close" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create New Group</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <Input
          label="Group Name"
          placeholder="e.g. Wednesday Bible Study"
          value={name}
          onChangeText={setName}
          error={errors.name}
          maxLength={60}
          leftIcon="people-outline"
        />

        <Input
          label="Description"
          placeholder="Tell people what this group is about..."
          value={description}
          onChangeText={setDescription}
          error={errors.description}
          multiline
          numberOfLines={4}
          maxLength={300}
          textAlignVertical="top"
        />

        {/* Category */}
        <Text style={styles.sectionLabel}>Category</Text>
        <View style={styles.categoryGrid}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat.value}
              style={[styles.catChip, category === cat.value && styles.catChipActive]}
              onPress={() => setCategory(cat.value)}
            >
              <Text style={[styles.catLabel, category === cat.value && styles.catLabelActive]}>
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Meeting Day */}
        <Text style={styles.sectionLabel}>Meeting Day</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.daysRow}>
          {DAYS.map((day) => (
            <TouchableOpacity
              key={day}
              style={[styles.dayChip, dayOfWeek === day && styles.dayChipActive]}
              onPress={() => setDayOfWeek(day)}
            >
              <Text style={[styles.dayLabel, dayOfWeek === day && styles.dayLabelActive]}>
                {day.slice(0, 3)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Input
          label="Meeting Time"
          placeholder="e.g. 18:00"
          value={time}
          onChangeText={setTime}
          leftIcon="time-outline"
        />

        {/* Options */}
        <View style={styles.optionsCard}>
          <View style={styles.optionRow}>
            <View style={styles.optionLeft}>
              <Ionicons name="videocam-outline" size={20} color={Colors.textSecondary} />
              <View>
                <Text style={styles.optionTitle}>Online Meeting</Text>
                <Text style={styles.optionDesc}>Group meets virtually</Text>
              </View>
            </View>
            <Switch
              value={isOnline}
              onValueChange={setIsOnline}
              trackColor={{ false: Colors.gray200, true: Colors.primaryLight }}
              thumbColor={isOnline ? Colors.primary : Colors.white}
            />
          </View>
          <View style={[styles.optionRow, { borderBottomWidth: 0 }]}>
            <View style={styles.optionLeft}>
              <Ionicons name="lock-closed-outline" size={20} color={Colors.textSecondary} />
              <View>
                <Text style={styles.optionTitle}>Private Group</Text>
                <Text style={styles.optionDesc}>Invite only</Text>
              </View>
            </View>
            <Switch
              value={isPrivate}
              onValueChange={setIsPrivate}
              trackColor={{ false: Colors.gray200, true: Colors.primaryLight }}
              thumbColor={isPrivate ? Colors.primary : Colors.white}
            />
          </View>
        </View>

        {!isOnline && (
          <Input
            label="Location (Optional)"
            placeholder="Meeting location address"
            value={location}
            onChangeText={setLocation}
            leftIcon="location-outline"
          />
        )}

        <Input
          label="Max Members (Optional)"
          placeholder="Leave empty for unlimited"
          value={maxMembers}
          onChangeText={setMaxMembers}
          keyboardType="number-pad"
          leftIcon="person-add-outline"
        />

        <Button
          title="Create Group"
          onPress={handleCreate}
          isLoading={isLoading}
          fullWidth
          size="lg"
          style={styles.createBtn}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing[5],
    paddingVertical: Spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.white,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.bold,
    color: Colors.textPrimary,
  },
  scrollContent: {
    padding: Spacing[5],
    paddingBottom: Spacing['3xl'],
    gap: Spacing[1],
  },
  sectionLabel: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.medium,
    color: Colors.textSecondary,
    marginBottom: Spacing[2],
    marginTop: Spacing[2],
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing[2],
    marginBottom: Spacing[4],
  },
  catChip: {
    paddingVertical: Spacing[2],
    paddingHorizontal: Spacing[3],
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.gray100,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  catChipActive: {
    backgroundColor: Colors.light,
    borderColor: Colors.primary,
  },
  catLabel: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    fontWeight: FontWeights.medium,
  },
  catLabelActive: {
    color: Colors.primary,
    fontWeight: FontWeights.semibold,
  },
  daysRow: {
    gap: Spacing[2],
    marginBottom: Spacing[4],
  },
  dayChip: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.gray100,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  dayChipActive: {
    backgroundColor: Colors.light,
    borderColor: Colors.primary,
  },
  dayLabel: {
    fontSize: FontSizes.xs,
    fontWeight: FontWeights.semibold,
    color: Colors.textSecondary,
  },
  dayLabelActive: {
    color: Colors.primary,
  },
  optionsCard: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
    marginBottom: Spacing[4],
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
    flex: 1,
  },
  optionTitle: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.semibold,
    color: Colors.textPrimary,
  },
  optionDesc: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
  },
  createBtn: {
    marginTop: Spacing[4],
  },
});
