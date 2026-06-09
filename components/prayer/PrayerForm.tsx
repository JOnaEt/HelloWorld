import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { FontSizes, FontWeights } from '../../constants/fonts';
import { BorderRadius, Spacing } from '../../constants/layout';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Badge } from '../ui/Badge';
import { PrayerCategory } from '../../types';

const CATEGORIES: Array<{ value: PrayerCategory; label: string; icon: string }> = [
  { value: 'healing', label: 'Healing', icon: '🙏' },
  { value: 'provision', label: 'Provision', icon: '🌾' },
  { value: 'guidance', label: 'Guidance', icon: '✨' },
  { value: 'family', label: 'Family', icon: '👨‍👩‍👧' },
  { value: 'salvation', label: 'Salvation', icon: '✝️' },
  { value: 'protection', label: 'Protection', icon: '🛡️' },
  { value: 'thanksgiving', label: 'Thanks', icon: '🙌' },
  { value: 'intercession', label: 'Intercession', icon: '💫' },
  { value: 'breakthrough', label: 'Breakthrough', icon: '⚡' },
  { value: 'other', label: 'Other', icon: '💭' },
];

interface PrayerFormProps {
  onSubmit: (
    title: string,
    content: string,
    category: PrayerCategory,
    isAnonymous: boolean,
    isPublic: boolean
  ) => void;
  isLoading?: boolean;
  error?: string | null;
  onCancel?: () => void;
}

export function PrayerForm({
  onSubmit,
  isLoading = false,
  error,
  onCancel,
}: PrayerFormProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<PrayerCategory>('other');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isPublic, setIsPublic] = useState(true);

  const [titleError, setTitleError] = useState('');
  const [contentError, setContentError] = useState('');

  const validate = (): boolean => {
    let valid = true;
    if (!title.trim()) {
      setTitleError('Please enter a prayer title');
      valid = false;
    } else {
      setTitleError('');
    }
    if (!content.trim()) {
      setContentError('Please share your prayer request');
      valid = false;
    } else if (content.trim().length < 20) {
      setContentError('Prayer request is too short (min 20 characters)');
      valid = false;
    } else {
      setContentError('');
    }
    return valid;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    onSubmit(title.trim(), content.trim(), category, isAnonymous, isPublic);
  };

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <Input
        label="Prayer Title"
        placeholder="What is this prayer about?"
        value={title}
        onChangeText={setTitle}
        error={titleError}
        leftIcon="bookmark-outline"
        maxLength={100}
      />

      <Input
        label="Prayer Request"
        placeholder="Share your heart... God hears every prayer."
        value={content}
        onChangeText={setContent}
        error={contentError}
        multiline
        numberOfLines={5}
        maxLength={500}
        containerStyle={styles.contentInput}
      />

      <View style={styles.charCount}>
        <Text style={styles.charCountText}>{content.length}/500</Text>
      </View>

      {/* Category */}
      <Text style={styles.sectionLabel}>Category</Text>
      <View style={styles.categoryGrid}>
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat.value}
            style={[
              styles.categoryChip,
              category === cat.value && styles.categoryChipActive,
            ]}
            onPress={() => setCategory(cat.value)}
          >
            <Text style={styles.categoryEmoji}>{cat.icon}</Text>
            <Text
              style={[
                styles.categoryLabel,
                category === cat.value && styles.categoryLabelActive,
              ]}
            >
              {cat.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Options */}
      <View style={styles.optionsSection}>
        <View style={styles.optionRow}>
          <View style={styles.optionLeft}>
            <Ionicons name="eye-off-outline" size={20} color={Colors.textSecondary} />
            <View>
              <Text style={styles.optionTitle}>Post Anonymously</Text>
              <Text style={styles.optionDesc}>Your name won't be shown</Text>
            </View>
          </View>
          <Switch
            value={isAnonymous}
            onValueChange={setIsAnonymous}
            trackColor={{ false: Colors.gray200, true: Colors.primaryLight }}
            thumbColor={isAnonymous ? Colors.primary : Colors.white}
          />
        </View>

        <View style={styles.optionRow}>
          <View style={styles.optionLeft}>
            <Ionicons name="globe-outline" size={20} color={Colors.textSecondary} />
            <View>
              <Text style={styles.optionTitle}>Share with Community</Text>
              <Text style={styles.optionDesc}>Let others pray with you</Text>
            </View>
          </View>
          <Switch
            value={isPublic}
            onValueChange={setIsPublic}
            trackColor={{ false: Colors.gray200, true: Colors.primaryLight }}
            thumbColor={isPublic ? Colors.primary : Colors.white}
          />
        </View>
      </View>

      {error && (
        <View style={styles.errorBox}>
          <Ionicons name="alert-circle-outline" size={16} color={Colors.error} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <View style={styles.actions}>
        {onCancel && (
          <Button
            title="Cancel"
            onPress={onCancel}
            variant="ghost"
            style={{ flex: 1 }}
          />
        )}
        <Button
          title="Submit Prayer"
          onPress={handleSubmit}
          isLoading={isLoading}
          style={{ flex: 2 }}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing[4],
  },
  contentInput: {
    marginBottom: 0,
  },
  charCount: {
    alignItems: 'flex-end',
    marginBottom: Spacing[4],
    marginTop: 4,
  },
  charCountText: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
  },
  sectionLabel: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.medium,
    color: Colors.textSecondary,
    marginBottom: Spacing[3],
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing[2],
    marginBottom: Spacing[5],
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: Spacing[2],
    paddingHorizontal: Spacing[3],
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.gray100,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  categoryChipActive: {
    backgroundColor: Colors.light,
    borderColor: Colors.primary,
  },
  categoryEmoji: {
    fontSize: 14,
  },
  categoryLabel: {
    fontSize: FontSizes.xs,
    fontWeight: FontWeights.medium,
    color: Colors.textSecondary,
  },
  categoryLabelActive: {
    color: Colors.deep,
  },
  optionsSection: {
    gap: Spacing[1],
    marginBottom: Spacing[5],
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing[4],
    paddingHorizontal: Spacing[4],
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
    marginTop: 1,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
    backgroundColor: '#FEE2E2',
    borderRadius: BorderRadius.lg,
    padding: Spacing[4],
    marginBottom: Spacing[4],
  },
  errorText: {
    fontSize: FontSizes.sm,
    color: Colors.error,
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing[3],
    paddingBottom: Spacing[8],
  },
});
