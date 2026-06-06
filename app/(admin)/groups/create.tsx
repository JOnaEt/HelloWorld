import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Switch,
  Alert,
  ActivityIndicator,
  Modal,
  FlatList,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../constants/colors';
import { FontSizes, FontWeights } from '../../../constants/fonts';
import { Spacing, BorderRadius, Shadows } from '../../../constants/layout';
import { useAuthStore } from '../../../store/authStore';
import { createGroup } from '../../../services/firebase/admin';
import { GroupCategory } from '../../../types';

const GROUP_CATEGORIES: GroupCategory[] = [
  'bible-study', 'prayer', 'youth', 'women', 'men',
  'couples', 'singles', 'worship', 'outreach', 'leadership',
];

const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

interface PickerModalProps {
  visible: boolean;
  title: string;
  options: string[];
  selected: string;
  onSelect: (val: string) => void;
  onClose: () => void;
}

function PickerModal({ visible, title, options, selected, onSelect, onClose }: PickerModalProps) {
  return (
    <Modal transparent animationType="slide" visible={visible} onRequestClose={onClose}>
      <TouchableOpacity style={styles.modalOverlay} onPress={onClose} activeOpacity={1}>
        <View style={styles.pickerSheet}>
          <View style={styles.pickerHandle} />
          <Text style={styles.pickerTitle}>{title}</Text>
          <FlatList
            data={options}
            keyExtractor={(o) => o}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.pickerOption, item === selected && styles.pickerOptionSelected]}
                onPress={() => { onSelect(item); onClose(); }}
              >
                <Text style={[styles.pickerOptionText, item === selected && { color: Colors.primary, fontWeight: FontWeights.bold }]}>
                  {item.replace('-', ' ').charAt(0).toUpperCase() + item.replace('-', ' ').slice(1)}
                </Text>
                {item === selected && <Ionicons name="checkmark" size={18} color={Colors.primary} />}
              </TouchableOpacity>
            )}
          />
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

function SectionHeader({ title }: { title: string }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionHeaderText}>{title}</Text>
    </View>
  );
}

function FormField({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <View style={styles.formField}>
      <Text style={styles.fieldLabel}>
        {label}{required ? <Text style={{ color: Colors.error }}> *</Text> : null}
      </Text>
      {children}
    </View>
  );
}

export default function CreateGroupScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<GroupCategory>('bible-study');
  const [coverUrl, setCoverUrl] = useState('');
  const [maxMembers, setMaxMembers] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [meetingDay, setMeetingDay] = useState('Sunday');
  const [meetingTime, setMeetingTime] = useState('18:00');
  const [location, setLocation] = useState('');
  const [isOnline, setIsOnline] = useState(false);
  const [meetingUrl, setMeetingUrl] = useState('');
  const [leaderSearch, setLeaderSearch] = useState('');

  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [showDayPicker, setShowDayPicker] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreate = useCallback(async () => {
    if (!name.trim()) {
      Alert.alert('Missing Field', 'Please enter a group name.');
      return;
    }

    setIsSubmitting(true);
    try {
      await createGroup({
        name: name.trim(),
        description: description.trim(),
        category,
        coverUrl: coverUrl.trim() || undefined,
        leaderId: user?.uid ?? '',
        leader: {
          id: user?.uid ?? '',
          name: leaderSearch.trim() || user?.displayName ?? 'Admin',
          photoURL: user?.photoURL ?? undefined,
        },
        coLeaderIds: [],
        maxMembers: maxMembers ? parseInt(maxMembers, 10) : undefined,
        isPrivate,
        meetingSchedule: {
          frequency: 'weekly',
          dayOfWeek: meetingDay,
          time: meetingTime,
          timezone: 'UTC',
        },
        location: location.trim() || undefined,
        isOnline,
        meetingUrl: isOnline ? meetingUrl.trim() : undefined,
        createdAt: new Date().toISOString(),
        tags: [category],
        announcementsEnabled: true,
        prayerEnabled: true,
        isActive: true,
      });

      Alert.alert('Success', 'Group created successfully!', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (err) {
      console.error('Create group error:', err);
      Alert.alert('Error', 'Failed to create group. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }, [
    name, description, category, coverUrl, maxMembers, isPrivate,
    meetingDay, meetingTime, location, isOnline, meetingUrl, leaderSearch, user,
  ]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="close" size={24} color={Colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Group</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{ paddingBottom: insets.bottom + Spacing[12] }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <SectionHeader title="Group Details" />
        <View style={styles.formSection}>
          <FormField label="Group Name" required>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Group name..."
              placeholderTextColor={Colors.gray400}
            />
          </FormField>

          <FormField label="Description">
            <TextInput
              style={[styles.input, styles.multilineInput]}
              value={description}
              onChangeText={setDescription}
              placeholder="What is this group about?"
              placeholderTextColor={Colors.gray400}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </FormField>

          <FormField label="Category" required>
            <TouchableOpacity style={styles.pickerBtn} onPress={() => setShowCategoryPicker(true)}>
              <Text style={styles.pickerBtnText}>{category.replace('-', ' ')}</Text>
              <Ionicons name="chevron-down" size={18} color={Colors.gray400} />
            </TouchableOpacity>
          </FormField>

          <FormField label="Cover Image URL">
            <TextInput
              style={styles.input}
              value={coverUrl}
              onChangeText={setCoverUrl}
              placeholder="https://..."
              placeholderTextColor={Colors.gray400}
              autoCapitalize="none"
              keyboardType="url"
            />
          </FormField>

          <FormField label="Max Members (leave blank for unlimited)">
            <TextInput
              style={styles.input}
              value={maxMembers}
              onChangeText={setMaxMembers}
              placeholder="e.g. 30"
              placeholderTextColor={Colors.gray400}
              keyboardType="number-pad"
            />
          </FormField>

          <View style={styles.toggleRow}>
            <View style={styles.toggleInfo}>
              <Text style={styles.toggleLabel}>Private Group</Text>
              <Text style={styles.toggleSubtitle}>Members need approval to join</Text>
            </View>
            <Switch
              value={isPrivate}
              onValueChange={setIsPrivate}
              trackColor={{ false: Colors.gray300, true: Colors.primaryLight }}
              thumbColor={isPrivate ? Colors.primary : Colors.white}
            />
          </View>
        </View>

        <SectionHeader title="Meeting Schedule" />
        <View style={styles.formSection}>
          <FormField label="Day of Week">
            <TouchableOpacity style={styles.pickerBtn} onPress={() => setShowDayPicker(true)}>
              <Text style={styles.pickerBtnText}>{meetingDay}</Text>
              <Ionicons name="chevron-down" size={18} color={Colors.gray400} />
            </TouchableOpacity>
          </FormField>

          <FormField label="Meeting Time (HH:MM)">
            <TextInput
              style={styles.input}
              value={meetingTime}
              onChangeText={setMeetingTime}
              placeholder="18:00"
              placeholderTextColor={Colors.gray400}
            />
          </FormField>

          <FormField label="Location">
            <TextInput
              style={styles.input}
              value={location}
              onChangeText={setLocation}
              placeholder="Meeting location..."
              placeholderTextColor={Colors.gray400}
            />
          </FormField>

          <View style={styles.toggleRow}>
            <View style={styles.toggleInfo}>
              <Text style={styles.toggleLabel}>Online Meeting</Text>
              <Text style={styles.toggleSubtitle}>Group meets via video call</Text>
            </View>
            <Switch
              value={isOnline}
              onValueChange={setIsOnline}
              trackColor={{ false: Colors.gray300, true: Colors.primaryLight }}
              thumbColor={isOnline ? Colors.primary : Colors.white}
            />
          </View>

          {isOnline && (
            <FormField label="Meeting URL">
              <TextInput
                style={styles.input}
                value={meetingUrl}
                onChangeText={setMeetingUrl}
                placeholder="https://zoom.us/..."
                placeholderTextColor={Colors.gray400}
                autoCapitalize="none"
                keyboardType="url"
              />
            </FormField>
          )}
        </View>

        <SectionHeader title="Leader" />
        <View style={styles.formSection}>
          <FormField label="Search Leader by Name">
            <TextInput
              style={styles.input}
              value={leaderSearch}
              onChangeText={setLeaderSearch}
              placeholder="Type leader name... (leave blank to assign yourself)"
              placeholderTextColor={Colors.gray400}
            />
          </FormField>
          <Text style={styles.fieldHint}>
            Leader assignment uses the current admin account if left blank.
          </Text>
        </View>

        <View style={styles.submitSection}>
          <TouchableOpacity
            style={[styles.primaryBtn, isSubmitting && styles.disabledBtn]}
            onPress={handleCreate}
            disabled={isSubmitting}
            activeOpacity={0.8}
          >
            {isSubmitting ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <>
                <Ionicons name="people-outline" size={18} color={Colors.white} />
                <Text style={styles.primaryBtnText}>Create Group</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      <PickerModal
        visible={showCategoryPicker}
        title="Select Category"
        options={GROUP_CATEGORIES}
        selected={category}
        onSelect={(val) => setCategory(val as GroupCategory)}
        onClose={() => setShowCategoryPicker(false)}
      />

      <PickerModal
        visible={showDayPicker}
        title="Select Day"
        options={DAYS_OF_WEEK}
        selected={meetingDay}
        onSelect={setMeetingDay}
        onClose={() => setShowDayPicker(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    backgroundColor: '#0F172A',
    paddingHorizontal: Spacing[5],
    paddingVertical: Spacing[4],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: FontSizes.lg, fontWeight: FontWeights.bold, color: Colors.white },
  scrollView: { flex: 1 },
  sectionHeader: {
    paddingHorizontal: Spacing[5],
    paddingTop: Spacing[6],
    paddingBottom: Spacing[2],
  },
  sectionHeaderText: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.bold,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  formSection: {
    backgroundColor: Colors.white,
    marginHorizontal: Spacing[5],
    borderRadius: BorderRadius.xl,
    padding: Spacing[4],
    gap: Spacing[4],
    borderWidth: 1,
    borderColor: Colors.border,
    ...(Shadows.sm as object),
  },
  formField: { gap: Spacing[2] },
  fieldLabel: { fontSize: FontSizes.sm, fontWeight: FontWeights.semibold, color: Colors.textPrimary },
  fieldHint: { fontSize: FontSizes.xs, color: Colors.textSecondary, fontStyle: 'italic' },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[3],
    fontSize: FontSizes.base,
    color: Colors.textPrimary,
    backgroundColor: Colors.gray50,
  },
  multilineInput: { minHeight: 100, paddingTop: Spacing[3], textAlignVertical: 'top' },
  pickerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[3],
    backgroundColor: Colors.gray50,
  },
  pickerBtnText: { fontSize: FontSizes.base, color: Colors.textPrimary, textTransform: 'capitalize' },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing[2],
  },
  toggleInfo: { flex: 1, marginRight: Spacing[4] },
  toggleLabel: { fontSize: FontSizes.base, fontWeight: FontWeights.medium, color: Colors.textPrimary },
  toggleSubtitle: { fontSize: FontSizes.xs, color: Colors.textSecondary },
  submitSection: { paddingHorizontal: Spacing[5], paddingTop: Spacing[6] },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing[2],
    backgroundColor: Colors.primary,
    paddingVertical: Spacing[4],
    borderRadius: BorderRadius.full,
    ...(Shadows.primary as object),
  },
  primaryBtnText: { fontSize: FontSizes.base, fontWeight: FontWeights.bold, color: Colors.white },
  disabledBtn: { opacity: 0.5 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  pickerSheet: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: BorderRadius['2xl'],
    borderTopRightRadius: BorderRadius['2xl'],
    paddingHorizontal: Spacing[5],
    paddingTop: Spacing[3],
    paddingBottom: Spacing[10],
    maxHeight: '70%',
  },
  pickerHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.gray300,
    alignSelf: 'center',
    marginBottom: Spacing[4],
  },
  pickerTitle: { fontSize: FontSizes.xl, fontWeight: FontWeights.bold, color: Colors.textPrimary, marginBottom: Spacing[3] },
  pickerOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  pickerOptionSelected: { backgroundColor: Colors.light, borderRadius: BorderRadius.md, paddingHorizontal: Spacing[2] },
  pickerOptionText: { fontSize: FontSizes.base, color: Colors.textPrimary, textTransform: 'capitalize' },
});
