import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Colors } from '../../constants/colors';
import { FontSizes, FontWeights } from '../../constants/fonts';
import { BorderRadius, Spacing, Shadows } from '../../constants/layout';
import { Badge } from '../ui/Badge';
import { Devotional } from '../../types';
import { formatDurationLong } from '../../utils/date';

interface DevotionalHeroProps {
  devotional: Devotional;
  onPlay?: () => void;
}

export function DevotionalHero({ devotional, onPlay }: DevotionalHeroProps) {
  const handlePress = () => router.push(`/devotional/${devotional.id}`);
  const handlePlay = (e: any) => {
    e.stopPropagation();
    if (onPlay) {
      onPlay();
    } else {
      router.push(`/devotional/player`);
    }
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handlePress}
      activeOpacity={0.92}
    >
      <ImageBackground
        source={
          devotional.coverUrl
            ? { uri: devotional.coverUrl }
            : require('../../assets/placeholder.png')
        }
        style={styles.bg}
        imageStyle={styles.bgImage}
      >
        <LinearGradient
          colors={['rgba(21,128,61,0.3)', 'rgba(15,23,42,0.92)']}
          style={styles.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
        >
          <View style={styles.content}>
            {/* Top badge row */}
            <View style={styles.topRow}>
              <Badge label="Today's Word" variant="primary" />
              <View style={styles.listenCount}>
                <Ionicons name="headset-outline" size={12} color="rgba(255,255,255,0.7)" />
                <Text style={styles.listenCountText}>
                  {devotional.listenCount.toLocaleString()} listeners
                </Text>
              </View>
            </View>

            {/* Scripture */}
            <View style={styles.scriptureBox}>
              <Text style={styles.scriptureRef}>
                {devotional.scripture.book} {devotional.scripture.chapter}:{devotional.scripture.verses} ({devotional.scripture.translation})
              </Text>
              <Text style={styles.scriptureText} numberOfLines={3}>
                "{devotional.scripture.text}"
              </Text>
            </View>

            {/* Title */}
            <Text style={styles.title} numberOfLines={2}>
              {devotional.title}
            </Text>

            {/* Author & controls */}
            <View style={styles.footer}>
              <View style={styles.authorInfo}>
                <View style={styles.authorDot} />
                <View>
                  <Text style={styles.authorName}>{devotional.author.name}</Text>
                  {devotional.author.title && (
                    <Text style={styles.authorTitle}>{devotional.author.title}</Text>
                  )}
                </View>
              </View>

              {devotional.audioUrl && (
                <TouchableOpacity style={styles.playButton} onPress={handlePlay}>
                  <LinearGradient
                    colors={Colors.gradientPrimary}
                    style={styles.playGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <Ionicons name="play" size={22} color={Colors.white} style={{ marginLeft: 2 }} />
                  </LinearGradient>
                  {devotional.audioDuration && (
                    <Text style={styles.playDuration}>
                      {formatDurationLong(devotional.audioDuration)}
                    </Text>
                  )}
                </TouchableOpacity>
              )}
            </View>
          </View>
        </LinearGradient>
      </ImageBackground>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius['3xl'],
    overflow: 'hidden',
    ...(Shadows.lg as object),
  },
  bg: {
    minHeight: 300,
  },
  bgImage: {
    borderRadius: BorderRadius['3xl'],
  },
  gradient: {
    minHeight: 300,
    justifyContent: 'flex-end',
    padding: Spacing[5],
  },
  content: {
    gap: Spacing[4],
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  listenCount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  listenCountText: {
    fontSize: FontSizes.xs,
    color: 'rgba(255,255,255,0.7)',
  },
  scriptureBox: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: BorderRadius.lg,
    padding: Spacing[4],
    borderLeftWidth: 3,
    borderLeftColor: Colors.primary,
    gap: 4,
  },
  scriptureRef: {
    fontSize: FontSizes.xs,
    fontWeight: FontWeights.semibold,
    color: Colors.primaryLight,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  scriptureText: {
    fontSize: FontSizes.sm,
    color: 'rgba(255,255,255,0.9)',
    lineHeight: 20,
    fontStyle: 'italic',
  },
  title: {
    fontSize: FontSizes['2xl'],
    fontWeight: FontWeights.bold,
    color: Colors.white,
    lineHeight: 32,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
  },
  authorDot: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  authorName: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.semibold,
    color: Colors.white,
  },
  authorTitle: {
    fontSize: FontSizes.xs,
    color: 'rgba(255,255,255,0.7)',
  },
  playButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
  },
  playGradient: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    ...(Shadows.primary as object),
  },
  playDuration: {
    fontSize: FontSizes.sm,
    color: 'rgba(255,255,255,0.8)',
  },
});
