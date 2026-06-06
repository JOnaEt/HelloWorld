import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
  Share,
  ActivityIndicator,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import { Colors } from '../../constants/colors';
import { FontSizes, FontWeights } from '../../constants/fonts';
import { BorderRadius, Shadows, Spacing } from '../../constants/layout';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { useDevotional } from '../../hooks/useDevotional';
import { getCategoryLabel } from '../../utils/format';
import { formatDurationLong } from '../../utils/date';

export default function DevotionalDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const {
    currentDevotional: devotional,
    isDetailLoading,
    fetchDevotional,
    shareDevotional,
  } = useDevotional();

  useEffect(() => {
    if (id) {
      fetchDevotional(id);
    }
  }, [id]);

  const handleShare = async () => {
    if (!devotional) return;
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await shareDevotional(devotional.id);
    await Share.share({
      message: `"${devotional.scripture.text}" — ${devotional.scripture.book} ${devotional.scripture.chapter}:${devotional.scripture.verses}\n\n${devotional.title}\n\nRead on TOPIC Digital`,
      title: devotional.title,
    });
  };

  const handleListen = () => {
    router.push('/devotional/player');
  };

  if (isDetailLoading || !devotional) {
    return (
      <View style={[styles.container, styles.loadingCenter]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero Image */}
        <ImageBackground
          source={
            devotional.coverUrl
              ? { uri: devotional.coverUrl }
              : require('../../assets/placeholder.png')
          }
          style={[styles.hero, { paddingTop: insets.top }]}
        >
          <LinearGradient
            colors={['rgba(15,23,42,0.4)', 'rgba(15,23,42,0.85)']}
            style={StyleSheet.absoluteFill}
          />

          {/* Header controls */}
          <View style={styles.heroControls}>
            <TouchableOpacity
              style={styles.heroBtn}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={22} color={Colors.white} />
            </TouchableOpacity>
            <View style={styles.heroRight}>
              <TouchableOpacity style={styles.heroBtn} onPress={handleShare}>
                <Ionicons name="share-outline" size={22} color={Colors.white} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Hero content */}
          <Animated.View entering={FadeInUp.delay(200).duration(500)} style={styles.heroContent}>
            <View style={styles.heroBadges}>
              {devotional.isDaily && (
                <Badge label="Today's Devotional" variant="primary" />
              )}
              <Badge label={getCategoryLabel(devotional.category)} variant="gray" />
            </View>

            <Text style={styles.scripture}>
              {devotional.scripture.book} {devotional.scripture.chapter}:{devotional.scripture.verses}
            </Text>
            <Text style={styles.heroTitle}>{devotional.title}</Text>

            <View style={styles.authorRow}>
              <Ionicons name="person-circle-outline" size={16} color="rgba(255,255,255,0.8)" />
              <Text style={styles.authorText}>
                {devotional.author.name}
                {devotional.author.title ? ` · ${devotional.author.title}` : ''}
              </Text>
            </View>

            {devotional.audioUrl && (
              <TouchableOpacity style={styles.listenBtn} onPress={handleListen}>
                <View style={styles.listenBtnIcon}>
                  <Ionicons name="play" size={18} color={Colors.primary} />
                </View>
                <View>
                  <Text style={styles.listenBtnTitle}>Listen Now</Text>
                  {devotional.audioDuration && (
                    <Text style={styles.listenBtnDuration}>
                      {formatDurationLong(devotional.audioDuration)}
                    </Text>
                  )}
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={16}
                  color="rgba(255,255,255,0.7)"
                  style={{ marginLeft: 'auto' }}
                />
              </TouchableOpacity>
            )}
          </Animated.View>
        </ImageBackground>

        {/* Scripture Quote */}
        <Animated.View entering={FadeInDown.delay(100).duration(500)} style={styles.scriptureCard}>
          <View style={styles.quoteIcon}>
            <Text style={styles.quoteChar}>"</Text>
          </View>
          <Text style={styles.scriptureText}>{devotional.scripture.text}</Text>
          <Text style={styles.scriptureRef}>
            — {devotional.scripture.book} {devotional.scripture.chapter}:{devotional.scripture.verses} ({devotional.scripture.translation})
          </Text>
        </Animated.View>

        {/* Content */}
        <Animated.View entering={FadeInDown.delay(200).duration(500)} style={styles.contentSection}>
          <Text style={styles.contentText}>{devotional.content}</Text>
        </Animated.View>

        {/* Reflection Prompts */}
        {devotional.reflectionPrompts.length > 0 && (
          <Animated.View entering={FadeInDown.delay(300).duration(500)} style={styles.reflectionSection}>
            <Text style={styles.reflectionTitle}>Reflection Questions</Text>
            {devotional.reflectionPrompts.map((prompt, i) => (
              <View key={i} style={styles.reflectionItem}>
                <View style={styles.reflectionNum}>
                  <Text style={styles.reflectionNumText}>{i + 1}</Text>
                </View>
                <Text style={styles.reflectionText}>{prompt}</Text>
              </View>
            ))}
          </Animated.View>
        )}

        {/* Prayer */}
        {devotional.prayer && (
          <Animated.View entering={FadeInDown.delay(400).duration(500)} style={styles.prayerSection}>
            <View style={styles.prayerHeader}>
              <Ionicons name="hand-right-outline" size={20} color={Colors.primary} />
              <Text style={styles.prayerTitle}>Prayer</Text>
            </View>
            <Text style={styles.prayerText}>{devotional.prayer}</Text>
          </Animated.View>
        )}

        {/* Tags */}
        {devotional.tags.length > 0 && (
          <View style={styles.tagsSection}>
            {devotional.tags.map((tag, i) => (
              <View key={i} style={styles.tag}>
                <Text style={styles.tagText}>#{tag}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Ionicons name="book-outline" size={16} color={Colors.textSecondary} />
            <Text style={styles.statText}>{devotional.readCount} reads</Text>
          </View>
          <View style={styles.stat}>
            <Ionicons name="headset-outline" size={16} color={Colors.textSecondary} />
            <Text style={styles.statText}>{devotional.listenCount} listens</Text>
          </View>
          <View style={styles.stat}>
            <Ionicons name="share-outline" size={16} color={Colors.textSecondary} />
            <Text style={styles.statText}>{devotional.shareCount} shares</Text>
          </View>
        </View>

        <View style={{ height: insets.bottom + 80 }} />
      </ScrollView>

      {/* Bottom Actions */}
      {devotional.audioUrl && (
        <Animated.View
          entering={FadeInDown.delay(500).duration(400)}
          style={[styles.bottomBar, { paddingBottom: insets.bottom + Spacing[3] }]}
        >
          <Button
            title="Listen to Devotional"
            onPress={handleListen}
            fullWidth
            icon={<Ionicons name="headset-outline" size={20} color={Colors.white} />}
          />
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingCenter: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  hero: {
    minHeight: 360,
    justifyContent: 'space-between',
    paddingBottom: Spacing[6],
  },
  heroControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing[4],
    paddingTop: Spacing[2],
    paddingBottom: Spacing[4],
  },
  heroBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(15,23,42,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroRight: {
    flexDirection: 'row',
    gap: Spacing[2],
  },
  heroContent: {
    paddingHorizontal: Spacing[5],
    gap: Spacing[3],
  },
  heroBadges: {
    flexDirection: 'row',
    gap: Spacing[2],
    flexWrap: 'wrap',
  },
  scripture: {
    fontSize: FontSizes.sm,
    color: Colors.primary,
    fontWeight: FontWeights.semibold,
  },
  heroTitle: {
    fontSize: FontSizes['2xl'],
    fontWeight: FontWeights.bold,
    color: Colors.white,
    lineHeight: 32,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  authorText: {
    fontSize: FontSizes.sm,
    color: 'rgba(255,255,255,0.8)',
  },
  listenBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: BorderRadius.xl,
    padding: Spacing[3],
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    marginTop: Spacing[2],
  },
  listenBtnIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listenBtnTitle: {
    fontSize: FontSizes.base,
    fontWeight: FontWeights.bold,
    color: Colors.white,
  },
  listenBtnDuration: {
    fontSize: FontSizes.xs,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
  },
  scriptureCard: {
    margin: Spacing[5],
    backgroundColor: Colors.light,
    borderRadius: BorderRadius['2xl'],
    padding: Spacing[5],
    gap: Spacing[3],
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },
  quoteIcon: {
    alignSelf: 'flex-start',
  },
  quoteChar: {
    fontSize: 48,
    color: Colors.primary,
    lineHeight: 36,
    fontWeight: FontWeights.black,
  },
  scriptureText: {
    fontSize: FontSizes.md,
    fontStyle: 'italic',
    color: Colors.textPrimary,
    lineHeight: 26,
  },
  scriptureRef: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.semibold,
    color: Colors.primary,
  },
  contentSection: {
    paddingHorizontal: Spacing[5],
    marginBottom: Spacing[5],
  },
  contentText: {
    fontSize: FontSizes.base,
    color: Colors.textPrimary,
    lineHeight: 28,
  },
  reflectionSection: {
    marginHorizontal: Spacing[5],
    backgroundColor: Colors.card,
    borderRadius: BorderRadius['2xl'],
    padding: Spacing[5],
    marginBottom: Spacing[5],
    gap: Spacing[4],
    ...(Shadows.sm as object),
  },
  reflectionTitle: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.bold,
    color: Colors.textPrimary,
  },
  reflectionItem: {
    flexDirection: 'row',
    gap: Spacing[3],
    alignItems: 'flex-start',
  },
  reflectionNum: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.light,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginTop: 1,
  },
  reflectionNumText: {
    fontSize: FontSizes.xs,
    fontWeight: FontWeights.bold,
    color: Colors.primary,
  },
  reflectionText: {
    flex: 1,
    fontSize: FontSizes.base,
    color: Colors.textPrimary,
    lineHeight: 24,
  },
  prayerSection: {
    marginHorizontal: Spacing[5],
    backgroundColor: '#F0FDF4',
    borderRadius: BorderRadius['2xl'],
    padding: Spacing[5],
    marginBottom: Spacing[5],
    gap: Spacing[3],
    borderWidth: 1,
    borderColor: Colors.light,
  },
  prayerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
  },
  prayerTitle: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.bold,
    color: Colors.primary,
  },
  prayerText: {
    fontSize: FontSizes.base,
    color: Colors.textPrimary,
    lineHeight: 26,
    fontStyle: 'italic',
  },
  tagsSection: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing[2],
    paddingHorizontal: Spacing[5],
    marginBottom: Spacing[5],
  },
  tag: {
    paddingVertical: 4,
    paddingHorizontal: Spacing[3],
    backgroundColor: Colors.gray100,
    borderRadius: BorderRadius.full,
  },
  tagText: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
    fontWeight: FontWeights.medium,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing[6],
    paddingHorizontal: Spacing[5],
    marginBottom: Spacing[5],
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing[5],
    paddingTop: Spacing[3],
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    ...(Shadows.lg as object),
  },
});
