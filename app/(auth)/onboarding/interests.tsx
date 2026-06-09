import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { Colors } from '../../../constants/colors';
import { FontSizes, FontWeights } from '../../../constants/fonts';
import { BorderRadius, Spacing, Shadows } from '../../../constants/layout';
import { Button } from '../../../components/ui/Button';
import { useAuth } from '../../../hooks/useAuth';

const INTEREST_OPTIONS = [
  { value: 'faith', label: 'Faith & Trust', emoji: '✝️', color: '#16A34A' },
  { value: 'prayer', label: 'Prayer Life', emoji: '🙏', color: '#8B5CF6' },
  { value: 'worship', label: 'Worship', emoji: '🎵', color: '#EC4899' },
  { value: 'leadership', label: 'Leadership', emoji: '👑', color: '#F59E0B' },
  { value: 'family', label: 'Family & Marriage', emoji: '👨‍👩‍👧', color: '#0EA5E9' },
  { value: 'evangelism', label: 'Evangelism', emoji: '🌍', color: '#14B8A6' },
  { value: 'healing', label: 'Healing & Health', emoji: '💚', color: '#22C55E' },
  { value: 'prophetic', label: 'Prophetic', emoji: '⚡', color: '#F97316' },
  { value: 'discipleship', label: 'Discipleship', emoji: '📖', color: '#6366F1' },
  { value: 'missions', label: 'Missions', emoji: '✈️', color: '#EF4444' },
  { value: 'youth', label: 'Youth Ministry', emoji: '🌱', color: '#84CC16' },
  { value: 'giving', label: 'Stewardship', emoji: '💝', color: '#FB923C' },
];

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

function InterestChip({
  item,
  isSelected,
  onToggle,
}: {
  item: typeof INTEREST_OPTIONS[0];
  isSelected: boolean;
  onToggle: () => void;
}) {
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    scale.value = withSpring(0.92, { damping: 20 }, () => {
      scale.value = withSpring(1, { damping: 15 });
    });
    onToggle();
  };

  return (
    <AnimatedTouchable
      style={[
        styles.chip,
        isSelected && styles.chipSelected,
        isSelected && { backgroundColor: item.color + '20', borderColor: item.color },
        animStyle,
      ]}
      onPress={handlePress}
      activeOpacity={0.85}
    >
      <Text style={styles.chipEmoji}>{item.emoji}</Text>
      <Text style={[styles.chipLabel, isSelected && { color: item.color }]}>
        {item.label}
      </Text>
      {isSelected && (
        <View style={[styles.checkmark, { backgroundColor: item.color }]}>
          <Ionicons name="checkmark" size={10} color={Colors.white} />
        </View>
      )}
    </AnimatedTouchable>
  );
}

export default function InterestsScreen() {
  const { saveInterests, isLoading } = useAuth();
  const [selected, setSelected] = useState<string[]>([]);

  const toggle = (value: string) => {
    setSelected((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  };

  const handleContinue = async () => {
    await saveInterests(selected);
    router.push('/(auth)/onboarding/notifications');
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Header */}
      <LinearGradient
        colors={['#166534', '#16A34A']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: '33%' }]} />
        </View>
        <Text style={styles.step}>Step 1 of 3</Text>
        <Text style={styles.title}>What's on your heart?</Text>
        <Text style={styles.subtitle}>
          Select topics that resonate with your spiritual journey. We'll personalize your experience.
        </Text>
      </LinearGradient>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.grid}>
          {INTEREST_OPTIONS.map((item) => (
            <InterestChip
              key={item.value}
              item={item}
              isSelected={selected.includes(item.value)}
              onToggle={() => toggle(item.value)}
            />
          ))}
        </View>

        {selected.length > 0 && (
          <View style={styles.selectedBanner}>
            <Ionicons name="checkmark-circle" size={16} color={Colors.primary} />
            <Text style={styles.selectedText}>
              {selected.length} topic{selected.length !== 1 ? 's' : ''} selected
            </Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title={selected.length === 0 ? 'Skip for now' : 'Continue'}
          onPress={handleContinue}
          isLoading={isLoading}
          fullWidth
          size="lg"
          variant={selected.length === 0 ? 'ghost' : 'primary'}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingTop: 60,
    paddingBottom: Spacing[6],
    paddingHorizontal: Spacing[6],
    gap: Spacing[2],
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: BorderRadius.full,
    marginBottom: Spacing[4],
  },
  progressFill: {
    height: 4,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.full,
  },
  step: {
    fontSize: FontSizes.xs,
    fontWeight: FontWeights.semibold,
    color: 'rgba(255,255,255,0.7)',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  title: {
    fontSize: FontSizes['3xl'],
    fontWeight: FontWeights.black,
    color: Colors.white,
    marginTop: Spacing[1],
  },
  subtitle: {
    fontSize: FontSizes.sm,
    color: 'rgba(255,255,255,0.8)',
    lineHeight: 20,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing[5],
    paddingBottom: Spacing[4],
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing[3],
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
    paddingVertical: Spacing[3],
    paddingHorizontal: Spacing[4],
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.full,
    borderWidth: 1.5,
    borderColor: Colors.border,
    ...(Shadows.sm as object),
    position: 'relative',
  },
  chipSelected: {
    borderWidth: 1.5,
  },
  chipEmoji: {
    fontSize: 18,
  },
  chipLabel: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.medium,
    color: Colors.textPrimary,
  },
  checkmark: {
    position: 'absolute',
    top: -5,
    right: -5,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
    marginTop: Spacing[4],
    backgroundColor: Colors.light,
    borderRadius: BorderRadius.full,
    paddingVertical: Spacing[2],
    paddingHorizontal: Spacing[4],
    alignSelf: 'center',
  },
  selectedText: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.medium,
    color: Colors.primary,
  },
  footer: {
    padding: Spacing[5],
    paddingBottom: Spacing[8],
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
});
