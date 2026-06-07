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
  Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { uploadAnnouncementImage } from '../../../services/firebase/storage';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../constants/colors';
import { FontSizes, FontWeights } from '../../../constants/fonts';
import { Spacing, BorderRadius, Shadows } from '../../../constants/layout';
import { useAuthStore } from '../../../store/authStore';
import { createAnnouncement } from '../../../services/firebase/admin';
import { AnnouncementType, AnnouncementPriority } from '../../../types';

const TYPES: AnnouncementType[] = ['event', 'service', 'news', 'alert', 'giving'];
const PRIORITIES: AnnouncementPriority[] = ['low', 'medium', 'high', 'urgent'];

interface PickerModalProps<T extends string> {
  visible: boolean;
  title: string;
  options: T[];
  selected: T;
  onSelect: (val: T) => void;
  onClose: () => void;
}

function PickerModal<T extends string>({ visible, title, options, selected, onSelect, onClose }: PickerModalProps<T>) {
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
                  {item.charAt(0).toUpperCase() + item.slice(1)}
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

export default function CreateAnnouncementScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [type, setType] = useState<AnnouncementType>('news');
  const [priority, setPriority] = useState<AnnouncementPriority>('medium');
  const [imageUrl, setImageUrl] = useState('');
  const [imageUploadProgress, setImageUploadProgress] = useState(0);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [actionLabel, setActionLabel] = useState('');
  const [actionUrl, setActionUrl] = useState('');
  const [isPinned, setIsPinned] = useState(false);
  const [scheduleDate, setScheduleDate] = useState('');
  const [expiresAt, setExpiresAt] = useState('');

  const [showTypePicker, setShowTypePicker] = useState(false);
  const [showPriorityPicker, setShowPriorityPicker] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      aspect: [16, 9],
      allowsEditing: true,
    });
    if (result.canceled || !result.assets[0]) return;

    setIsUploadingImage(true);
    try {
      const tempId = Date.now().toString();
      const url = await uploadAnnouncementImage(result.assets[0].uri, tempId, (p) => {
        setImageUploadProgress(p);
      });
      setImageUrl(url);
    } catch {
      Alert.alert('Upload Failed', 'Could not upload image. Try again.');
    } finally {
      setIsUploadingImage(false);
      setImageUploadProgress(0);
    }
  };

  const handlePublish = useCallback(async (sendPush = false) => {
    if (!title.trim()) {
      Alert.alert('Missing Field', 'Please enter a title.');
      return;
    }
    if (!content.trim()) {
      Alert.alert('Missing Field', 'Please enter content.');
      return;
    }

    setIsSubmitting(true);
    try {
      const now = new Date().toISOString();
      await createAnnouncement({
        title: title.trim(),
        content: content.trim(),
        type,
        priority,
        imageUrl: imageUrl.trim() || undefined,
        publishedAt: scheduleDate ? new Date(scheduleDate).toISOString() : now,
        expiresAt: expiresAt ? new Date(expiresAt).toISOString() : undefined,
        author: {
          id: user?.uid ?? '',
          name: user?.displayName ?? 'Admin',
          title: user?.role === 'pastor' ? 'Pastor' : 'Admin',
          photoURL: user?.photoURL ?? undefined,
        },
        actionUrl: actionUrl.trim() || undefined,
        actionLabel: actionLabel.trim() || undefined,
        targetGroups: [],
        isPinned,
        tags: [type],
      });

      const message = sendPush
        ? 'Announcement published and push notification queued!'
        : 'Announcement published successfully!';
      Alert.alert('Success', message, [{ text: 'OK', onPress: () => router.back() }]);
    } catch (err) {
      console.error('Create announcement error:', err);
      Alert.alert('Error', 'Failed to publish announcement. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }, [title, content, type, priority, imageUrl, scheduleDate, expiresAt, actionLabel, actionUrl, isPinned, user]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="close" size={24} color={Colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Announcement</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{ paddingBottom: insets.bottom + Spacing[12] }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <SectionHeader title="Content" />
        <View style={styles.formSection}>
          <FormField label="Title" required>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="Announcement title..."
              placeholderTextColor={Colors.gray400}
            />
          </FormField>

          <FormField label="Content" required>
            <TextInput
              style={[styles.input, styles.multilineInput]}
              value={content}
              onChangeText={setContent}
              placeholder="Write your announcement here..."
              placeholderTextColor={Colors.gray400}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
            />
          </FormField>

          <FormField label="Type">
            <TouchableOpacity style={styles.pickerBtn} onPress={() => setShowTypePicker(true)}>
              <Text style={styles.pickerBtnText}>{type.charAt(0).toUpperCase() + type.slice(1)}</Text>
              <Ionicons name="chevron-down" size={18} color={Colors.gray400} />
            </TouchableOpacity>
          </FormField>

          <FormField label="Priority">
            <TouchableOpacity style={styles.pickerBtn} onPress={() => setShowPriorityPicker(true)}>
              <Text style={styles.pickerBtnText}>{priority.charAt(0).toUpperCase() + priority.slice(1)}</Text>
              <Ionicons name="chevron-down" size={18} color={Colors.gray400} />
            </TouchableOpacity>
          </FormField>

          <View style={styles.formField}>
            <Text style={styles.fieldLabel}>Announcement Image</Text>
            {imageUrl ? (
              <View>
                <Image source={{ uri: imageUrl }} style={styles.imagePreview} resizeMode="cover" />
                <View style={styles.uploadedRow}>
                  <Ionicons name="image-outline" size={16} color={Colors.success} />
                  <Text style={styles.uploadedText}>Image uploaded ✓</Text>
                  <TouchableOpacity onPress={pickImage}>
                    <Text style={styles.replaceBtnText}>Replace</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setImageUrl('')}>
                    <Ionicons name="close-circle-outline" size={18} color={Colors.error} />
                  </TouchableOpacity>
                </View>
              </View>
            ) : isUploadingImage ? (
              <View style={styles.uploadProgress}>
                <ActivityIndicator size="small" color={Colors.primary} />
                <Text style={styles.uploadProgressText}>Uploading… {Math.round(imageUploadProgress * 100)}%</Text>
              </View>
            ) : (
              <TouchableOpacity style={styles.uploadBtn} onPress={pickImage}>
                <Ionicons name="image-outline" size={20} color={Colors.primary} />
                <Text style={styles.uploadBtnText}>Upload Image</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <SectionHeader title="Action (Optional)" />
        <View style={styles.formSection}>
          <FormField label="Button Label">
            <TextInput
              style={styles.input}
              value={actionLabel}
              onChangeText={setActionLabel}
              placeholder="e.g. Learn More"
              placeholderTextColor={Colors.gray400}
            />
          </FormField>
          <FormField label="Button URL">
            <TextInput
              style={styles.input}
              value={actionUrl}
              onChangeText={setActionUrl}
              placeholder="https://..."
              placeholderTextColor={Colors.gray400}
              autoCapitalize="none"
              keyboardType="url"
            />
          </FormField>
        </View>

        <SectionHeader title="Publishing" />
        <View style={styles.formSection}>
          <View style={styles.toggleRow}>
            <View style={styles.toggleInfo}>
              <Text style={styles.toggleLabel}>Pin to Top</Text>
              <Text style={styles.toggleSubtitle}>Always show at the top of announcements</Text>
            </View>
            <Switch
              value={isPinned}
              onValueChange={setIsPinned}
              trackColor={{ false: Colors.gray300, true: Colors.primaryLight }}
              thumbColor={isPinned ? Colors.primary : Colors.white}
            />
          </View>

          <FormField label="Schedule Publish Date (Optional)">
            <TextInput
              style={styles.input}
              value={scheduleDate}
              onChangeText={setScheduleDate}
              placeholder="YYYY-MM-DD (leave blank for now)"
              placeholderTextColor={Colors.gray400}
            />
          </FormField>

          <FormField label="Expires At (Optional)">
            <TextInput
              style={styles.input}
              value={expiresAt}
              onChangeText={setExpiresAt}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={Colors.gray400}
            />
          </FormField>
        </View>

        <View style={styles.submitSection}>
          <TouchableOpacity
            style={[styles.primaryBtn, isSubmitting && styles.disabledBtn]}
            onPress={() => handlePublish(false)}
            disabled={isSubmitting}
            activeOpacity={0.8}
          >
            {isSubmitting ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <>
                <Ionicons name="checkmark-circle-outline" size={18} color={Colors.white} />
                <Text style={styles.primaryBtnText}>Publish</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.pushBtn, isSubmitting && styles.disabledBtn]}
            onPress={() => handlePublish(true)}
            disabled={isSubmitting}
            activeOpacity={0.8}
          >
            <Ionicons name="notifications-outline" size={18} color={Colors.white} />
            <Text style={styles.primaryBtnText}>Publish + Send Push</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <PickerModal
        visible={showTypePicker}
        title="Select Type"
        options={TYPES}
        selected={type}
        onSelect={(val) => setType(val)}
        onClose={() => setShowTypePicker(false)}
      />

      <PickerModal
        visible={showPriorityPicker}
        title="Select Priority"
        options={PRIORITIES}
        selected={priority}
        onSelect={(val) => setPriority(val)}
        onClose={() => setShowPriorityPicker(false)}
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
  fieldLabel: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.semibold,
    color: Colors.textPrimary,
  },
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
  multilineInput: {
    minHeight: 140,
    paddingTop: Spacing[3],
    textAlignVertical: 'top',
  },
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
  submitSection: {
    paddingHorizontal: Spacing[5],
    paddingTop: Spacing[6],
    gap: Spacing[3],
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing[2],
    backgroundColor: Colors.primary,
    paddingVertical: Spacing[4],
    borderRadius: BorderRadius.full,
  },
  pushBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing[2],
    backgroundColor: '#8B5CF6',
    paddingVertical: Spacing[4],
    borderRadius: BorderRadius.full,
  },
  primaryBtnText: { fontSize: FontSizes.base, fontWeight: FontWeights.bold, color: Colors.white },
  disabledBtn: { opacity: 0.5 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  pickerSheet: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: BorderRadius['2xl'],
    borderTopRightRadius: BorderRadius['2xl'],
    paddingHorizontal: Spacing[5],
    paddingTop: Spacing[3],
    paddingBottom: Spacing[10],
    maxHeight: '60%',
  },
  pickerHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.gray300,
    alignSelf: 'center',
    marginBottom: Spacing[4],
  },
  pickerTitle: {
    fontSize: FontSizes.xl,
    fontWeight: FontWeights.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing[3],
  },
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
  uploadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
    backgroundColor: Colors.light,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing[4],
    paddingHorizontal: Spacing[4],
    borderWidth: 1,
    borderColor: Colors.primary + '40',
    borderStyle: 'dashed',
  },
  uploadBtnText: {
    fontSize: FontSizes.base,
    fontWeight: FontWeights.medium,
    color: Colors.primary,
  },
  uploadedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
    backgroundColor: Colors.success + '10',
    borderRadius: BorderRadius.md,
    padding: Spacing[3],
  },
  uploadedText: {
    flex: 1,
    fontSize: FontSizes.sm,
    color: Colors.success,
    fontWeight: FontWeights.medium,
  },
  uploadProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
    padding: Spacing[3],
  },
  uploadProgressText: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
  },
  imagePreview: {
    width: '100%',
    height: 160,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing[2],
    backgroundColor: Colors.gray100,
  },
  replaceBtnText: {
    fontSize: FontSizes.sm,
    color: Colors.primary,
    fontWeight: FontWeights.semibold,
  },
});
