import React, { useState, useCallback, useRef, useEffect } from 'react';
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
import * as DocumentPicker from 'expo-document-picker';
import { Audio } from 'expo-av';
import { uploadDevotionalCover, uploadDevotionalAudio } from '../../../services/firebase/storage';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../constants/colors';
import { FontSizes, FontWeights } from '../../../constants/fonts';
import { Spacing, BorderRadius, Shadows } from '../../../constants/layout';
import { useAuthStore } from '../../../store/authStore';
import { createDevotional } from '../../../services/firebase/admin';
import { DevotionalCategory } from '../../../types';

const CATEGORIES: DevotionalCategory[] = [
  'faith', 'prayer', 'worship', 'leadership', 'family',
  'evangelism', 'healing', 'prophetic', 'discipleship', 'missions',
];

const TRANSLATIONS = ['NIV', 'KJV', 'ESV', 'NLT', 'NKJV'];

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

export default function CreateDevotionalScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();

  // Basic Info
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<DevotionalCategory>('faith');
  const [scriptureBook, setScriptureBook] = useState('');
  const [scriptureChapter, setScriptureChapter] = useState('');
  const [scriptureVerses, setScriptureVerses] = useState('');
  const [scriptureText, setScriptureText] = useState('');
  const [translation, setTranslation] = useState('NIV');

  // Content
  const [content, setContent] = useState('');
  const [prayer, setPrayer] = useState('');
  const [reflectionPrompts, setReflectionPrompts] = useState<string[]>(['']);

  // Media
  const [audioUrl, setAudioUrl] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [coverUploadProgress, setCoverUploadProgress] = useState(0);
  const [audioUploadProgress, setAudioUploadProgress] = useState(0);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [isUploadingAudio, setIsUploadingAudio] = useState(false);

  // Publishing
  const [authorName, setAuthorName] = useState(user?.displayName ?? '');
  const [authorTitle, setAuthorTitle] = useState(user?.role === 'pastor' ? 'Pastor' : '');
  const [isFeatured, setIsFeatured] = useState(false);
  const [isDaily, setIsDaily] = useState(false);
  const [dailyDate, setDailyDate] = useState('');

  // Audio preview
  const audioSoundRef = useRef<Audio.Sound | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // UI state
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [showTranslationPicker, setShowTranslationPicker] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    return () => {
      audioSoundRef.current?.unloadAsync();
    };
  }, []);

  const playPreviewAudio = async () => {
    if (isPlayingAudio) {
      await audioSoundRef.current?.stopAsync();
      setIsPlayingAudio(false);
      return;
    }
    try {
      if (audioSoundRef.current) {
        await audioSoundRef.current.unloadAsync();
      }
      const { sound } = await Audio.Sound.createAsync({ uri: audioUrl });
      audioSoundRef.current = sound;
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          setIsPlayingAudio(false);
        }
      });
      setIsPlayingAudio(true);
      await sound.playAsync();
    } catch {
      Alert.alert('Playback Error', 'Could not play audio preview.');
    }
  };

  const clearAudio = () => {
    audioSoundRef.current?.stopAsync();
    audioSoundRef.current?.unloadAsync();
    audioSoundRef.current = null;
    setIsPlayingAudio(false);
    setAudioUrl('');
  };

  const addPrompt = useCallback(() => {
    setReflectionPrompts((prev) => [...prev, '']);
  }, []);

  const removePrompt = useCallback((idx: number) => {
    setReflectionPrompts((prev) => prev.filter((_, i) => i !== idx));
  }, []);

  const updatePrompt = useCallback((idx: number, text: string) => {
    setReflectionPrompts((prev) => prev.map((p, i) => (i === idx ? text : p)));
  }, []);

  const handleSubmit = useCallback(async (draft: boolean) => {
    if (!title.trim()) {
      Alert.alert('Missing Field', 'Please enter a title.');
      return;
    }
    if (!content.trim()) {
      Alert.alert('Missing Field', 'Please enter devotional content.');
      return;
    }

    setIsSubmitting(true);
    try {
      const now = new Date().toISOString();
      await createDevotional({
        title: title.trim(),
        category,
        scripture: {
          book: scriptureBook.trim(),
          chapter: parseInt(scriptureChapter, 10) || 1,
          verses: scriptureVerses.trim(),
          text: scriptureText.trim(),
          translation,
        },
        content: content.trim(),
        prayer: prayer.trim(),
        reflectionPrompts: reflectionPrompts.filter((p) => p.trim().length > 0),
        audioUrl: audioUrl.trim() || undefined,
        thumbnailUrl: thumbnailUrl.trim() || undefined,
        coverUrl: thumbnailUrl.trim() || undefined,
        author: {
          id: user?.uid ?? '',
          name: authorName.trim(),
          title: authorTitle.trim() || undefined,
          photoURL: user?.photoURL ?? undefined,
        },
        publishedAt: now,
        isFeatured,
        isDaily,
        dailyDate: isDaily ? dailyDate : undefined,
        tags: [category],
      });

      Alert.alert(
        'Success',
        draft ? 'Devotional saved as draft.' : 'Devotional published successfully!',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (err) {
      console.error('Create devotional error:', err);
      Alert.alert('Error', 'Failed to save devotional. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }, [
    title, category, scriptureBook, scriptureChapter, scriptureVerses,
    scriptureText, translation, content, prayer, reflectionPrompts,
    audioUrl, thumbnailUrl, authorName, authorTitle, isFeatured, isDaily, dailyDate, user,
  ]);

  const pickCoverImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      aspect: [16, 9],
      allowsEditing: true,
    });
    if (result.canceled || !result.assets[0]) return;

    setIsUploadingCover(true);
    try {
      const tempId = Date.now().toString();
      const url = await uploadDevotionalCover(result.assets[0].uri, tempId, (p) => {
        setCoverUploadProgress(p);
      });
      setThumbnailUrl(url);
    } catch {
      Alert.alert('Upload Failed', 'Could not upload cover image. Try again.');
    } finally {
      setIsUploadingCover(false);
      setCoverUploadProgress(0);
    }
  };

  const pickAudioFile = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: 'audio/*',
      copyToCacheDirectory: true,
    });
    if (result.canceled || !result.assets[0]) return;

    setIsUploadingAudio(true);
    try {
      const tempId = Date.now().toString();
      const url = await uploadDevotionalAudio(result.assets[0].uri, tempId, (p) => {
        setAudioUploadProgress(p);
      });
      setAudioUrl(url);
    } catch {
      Alert.alert('Upload Failed', 'Could not upload audio file. Try again.');
    } finally {
      setIsUploadingAudio(false);
      setAudioUploadProgress(0);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="close" size={24} color={Colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Devotional</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{ paddingBottom: insets.bottom + Spacing[12] }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Basic Info */}
        <SectionHeader title="Basic Information" />

        <View style={styles.formSection}>
          <FormField label="Title" required>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="Enter devotional title..."
              placeholderTextColor={Colors.gray400}
            />
          </FormField>

          <FormField label="Category" required>
            <TouchableOpacity style={styles.pickerBtn} onPress={() => setShowCategoryPicker(true)}>
              <Text style={styles.pickerBtnText}>{category.charAt(0).toUpperCase() + category.slice(1)}</Text>
              <Ionicons name="chevron-down" size={18} color={Colors.gray400} />
            </TouchableOpacity>
          </FormField>

          <View style={styles.rowFields}>
            <FormField label="Book">
              <TextInput
                style={[styles.input, { flex: 1 }]}
                value={scriptureBook}
                onChangeText={setScriptureBook}
                placeholder="e.g. John"
                placeholderTextColor={Colors.gray400}
              />
            </FormField>
            <FormField label="Chapter">
              <TextInput
                style={[styles.input, { width: 70 }]}
                value={scriptureChapter}
                onChangeText={setScriptureChapter}
                placeholder="1"
                placeholderTextColor={Colors.gray400}
                keyboardType="number-pad"
              />
            </FormField>
            <FormField label="Verses">
              <TextInput
                style={[styles.input, { width: 80 }]}
                value={scriptureVerses}
                onChangeText={setScriptureVerses}
                placeholder="1-5"
                placeholderTextColor={Colors.gray400}
              />
            </FormField>
          </View>

          <FormField label="Scripture Text">
            <TextInput
              style={[styles.input, styles.multilineInput]}
              value={scriptureText}
              onChangeText={setScriptureText}
              placeholder="Paste scripture passage here..."
              placeholderTextColor={Colors.gray400}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </FormField>

          <FormField label="Translation">
            <TouchableOpacity style={styles.pickerBtn} onPress={() => setShowTranslationPicker(true)}>
              <Text style={styles.pickerBtnText}>{translation}</Text>
              <Ionicons name="chevron-down" size={18} color={Colors.gray400} />
            </TouchableOpacity>
          </FormField>
        </View>

        {/* Content */}
        <SectionHeader title="Content" />

        <View style={styles.formSection}>
          <FormField label="Written Devotion" required>
            <TextInput
              style={[styles.input, styles.largeMultilineInput]}
              value={content}
              onChangeText={setContent}
              placeholder="Write the devotional message here..."
              placeholderTextColor={Colors.gray400}
              multiline
              textAlignVertical="top"
            />
          </FormField>

          <FormField label="Prayer">
            <TextInput
              style={[styles.input, styles.multilineInput]}
              value={prayer}
              onChangeText={setPrayer}
              placeholder="Write a closing prayer..."
              placeholderTextColor={Colors.gray400}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </FormField>

          <FormField label="Reflection Prompts">
            {reflectionPrompts.map((prompt, idx) => (
              <View key={idx} style={styles.promptRow}>
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  value={prompt}
                  onChangeText={(text) => updatePrompt(idx, text)}
                  placeholder={`Prompt ${idx + 1}...`}
                  placeholderTextColor={Colors.gray400}
                />
                {reflectionPrompts.length > 1 && (
                  <TouchableOpacity onPress={() => removePrompt(idx)} style={styles.removePromptBtn}>
                    <Ionicons name="close-circle" size={20} color={Colors.error} />
                  </TouchableOpacity>
                )}
              </View>
            ))}
            <TouchableOpacity style={styles.addPromptBtn} onPress={addPrompt}>
              <Ionicons name="add" size={16} color={Colors.primary} />
              <Text style={styles.addPromptText}>Add Prompt</Text>
            </TouchableOpacity>
          </FormField>
        </View>

        {/* Media */}
        <SectionHeader title="Media" />

        <View style={styles.formSection}>
          {/* Audio Upload */}
          <Text style={styles.fieldLabel}>Audio File</Text>
          {audioUrl ? (
            <View>
              <View style={styles.mediaPreviewRow}>
                <Ionicons name="musical-notes-outline" size={20} color={Colors.success} />
                <Text style={styles.mediaPreviewText}>Audio uploaded ✓</Text>
                <TouchableOpacity onPress={playPreviewAudio} style={styles.previewActionBtn}>
                  <Ionicons
                    name={isPlayingAudio ? 'stop-circle-outline' : 'play-circle-outline'}
                    size={26}
                    color={Colors.primary}
                  />
                </TouchableOpacity>
                <TouchableOpacity onPress={pickAudioFile} style={styles.previewActionBtn}>
                  <Text style={styles.replaceBtnText}>Replace</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={clearAudio}>
                  <Ionicons name="close-circle-outline" size={20} color={Colors.error} />
                </TouchableOpacity>
              </View>
            </View>
          ) : isUploadingAudio ? (
            <View style={styles.uploadProgress}>
              <ActivityIndicator size="small" color={Colors.primary} />
              <Text style={styles.uploadProgressText}>Uploading… {Math.round(audioUploadProgress * 100)}%</Text>
            </View>
          ) : (
            <TouchableOpacity style={styles.uploadBtn} onPress={pickAudioFile}>
              <Ionicons name="cloud-upload-outline" size={20} color={Colors.primary} />
              <Text style={styles.uploadBtnText}>Upload Audio File</Text>
            </TouchableOpacity>
          )}

          {/* Cover Image Upload */}
          <Text style={[styles.fieldLabel, { marginTop: Spacing[4] }]}>Cover Image</Text>
          {thumbnailUrl ? (
            <View>
              <Image source={{ uri: thumbnailUrl }} style={styles.coverPreview} resizeMode="cover" />
              <View style={styles.mediaPreviewRow}>
                <Ionicons name="image-outline" size={16} color={Colors.success} />
                <Text style={styles.mediaPreviewText}>Cover image uploaded ✓</Text>
                <TouchableOpacity onPress={pickCoverImage} style={styles.previewActionBtn}>
                  <Text style={styles.replaceBtnText}>Replace</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setThumbnailUrl('')}>
                  <Ionicons name="close-circle-outline" size={18} color={Colors.error} />
                </TouchableOpacity>
              </View>
            </View>
          ) : isUploadingCover ? (
            <View style={styles.uploadProgress}>
              <ActivityIndicator size="small" color={Colors.primary} />
              <Text style={styles.uploadProgressText}>Uploading… {Math.round(coverUploadProgress * 100)}%</Text>
            </View>
          ) : (
            <TouchableOpacity style={styles.uploadBtn} onPress={pickCoverImage}>
              <Ionicons name="image-outline" size={20} color={Colors.primary} />
              <Text style={styles.uploadBtnText}>Upload Cover Image</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Publishing */}
        <SectionHeader title="Publishing" />

        <View style={styles.formSection}>
          <FormField label="Author Name" required>
            <TextInput
              style={styles.input}
              value={authorName}
              onChangeText={setAuthorName}
              placeholder="Author name..."
              placeholderTextColor={Colors.gray400}
            />
          </FormField>

          <FormField label="Author Title">
            <TextInput
              style={styles.input}
              value={authorTitle}
              onChangeText={setAuthorTitle}
              placeholder="e.g. Senior Pastor"
              placeholderTextColor={Colors.gray400}
            />
          </FormField>

          <View style={styles.toggleRow}>
            <View style={styles.toggleInfo}>
              <Text style={styles.toggleLabel}>Featured</Text>
              <Text style={styles.toggleSubtitle}>Show in featured section</Text>
            </View>
            <Switch
              value={isFeatured}
              onValueChange={setIsFeatured}
              trackColor={{ false: Colors.gray300, true: Colors.primaryLight }}
              thumbColor={isFeatured ? Colors.primary : Colors.white}
            />
          </View>

          <View style={styles.toggleRow}>
            <View style={styles.toggleInfo}>
              <Text style={styles.toggleLabel}>Daily Devotional</Text>
              <Text style={styles.toggleSubtitle}>Schedule as today's devotional</Text>
            </View>
            <Switch
              value={isDaily}
              onValueChange={setIsDaily}
              trackColor={{ false: Colors.gray300, true: Colors.primaryLight }}
              thumbColor={isDaily ? Colors.primary : Colors.white}
            />
          </View>

          {isDaily && (
            <FormField label="Daily Date (YYYY-MM-DD)">
              <TextInput
                style={styles.input}
                value={dailyDate}
                onChangeText={setDailyDate}
                placeholder="2026-06-06"
                placeholderTextColor={Colors.gray400}
              />
            </FormField>
          )}
        </View>

        {/* Buttons */}
        <View style={styles.submitSection}>
          <TouchableOpacity
            style={[styles.primaryBtn, isSubmitting && styles.disabledBtn]}
            onPress={() => handleSubmit(false)}
            disabled={isSubmitting}
            activeOpacity={0.8}
          >
            {isSubmitting ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <>
                <Ionicons name="checkmark-circle-outline" size={18} color={Colors.white} />
                <Text style={styles.primaryBtnText}>Publish Devotional</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.secondaryBtn, isSubmitting && styles.disabledBtn]}
            onPress={() => handleSubmit(true)}
            disabled={isSubmitting}
            activeOpacity={0.8}
          >
            <Ionicons name="save-outline" size={18} color={Colors.primary} />
            <Text style={styles.secondaryBtnText}>Save as Draft</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <PickerModal
        visible={showCategoryPicker}
        title="Select Category"
        options={CATEGORIES}
        selected={category}
        onSelect={(val) => setCategory(val as DevotionalCategory)}
        onClose={() => setShowCategoryPicker(false)}
      />

      <PickerModal
        visible={showTranslationPicker}
        title="Select Translation"
        options={TRANSLATIONS}
        selected={translation}
        onSelect={setTranslation}
        onClose={() => setShowTranslationPicker(false)}
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
  fieldHint: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
    marginTop: -Spacing[2],
    marginHorizontal: Spacing[5],
    fontStyle: 'italic',
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
    minHeight: 100,
    paddingTop: Spacing[3],
    textAlignVertical: 'top',
  },
  largeMultilineInput: {
    minHeight: 180,
    paddingTop: Spacing[3],
    textAlignVertical: 'top',
  },
  rowFields: {
    flexDirection: 'row',
    gap: Spacing[3],
    alignItems: 'flex-end',
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
  pickerBtnText: {
    fontSize: FontSizes.base,
    color: Colors.textPrimary,
    textTransform: 'capitalize',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing[2],
  },
  toggleInfo: { flex: 1, marginRight: Spacing[4] },
  toggleLabel: { fontSize: FontSizes.base, fontWeight: FontWeights.medium, color: Colors.textPrimary },
  toggleSubtitle: { fontSize: FontSizes.xs, color: Colors.textSecondary },
  promptRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing[2] },
  removePromptBtn: { padding: Spacing[1] },
  addPromptBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
    padding: Spacing[3],
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    borderStyle: 'dashed',
    justifyContent: 'center',
  },
  addPromptText: { fontSize: FontSizes.sm, fontWeight: FontWeights.semibold, color: Colors.primary },
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
    ...(Shadows.primary as object),
  },
  primaryBtnText: { fontSize: FontSizes.base, fontWeight: FontWeights.bold, color: Colors.white },
  secondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing[2],
    backgroundColor: Colors.white,
    paddingVertical: Spacing[4],
    borderRadius: BorderRadius.full,
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  secondaryBtnText: { fontSize: FontSizes.base, fontWeight: FontWeights.bold, color: Colors.primary },
  disabledBtn: { opacity: 0.5 },
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
  coverPreview: {
    width: '100%',
    height: 160,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing[2],
    backgroundColor: Colors.gray100,
  },
  mediaPreviewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
    backgroundColor: Colors.success + '10',
    borderRadius: BorderRadius.md,
    padding: Spacing[3],
  },
  mediaPreviewText: {
    flex: 1,
    fontSize: FontSizes.sm,
    color: Colors.success,
    fontWeight: FontWeights.medium,
  },
  previewActionBtn: {
    padding: 2,
  },
  replaceBtnText: {
    fontSize: FontSizes.sm,
    color: Colors.primary,
    fontWeight: FontWeights.semibold,
  },
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
  pickerOptionText: {
    fontSize: FontSizes.base,
    color: Colors.textPrimary,
    textTransform: 'capitalize',
  },
});
