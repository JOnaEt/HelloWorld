import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Colors } from '../../constants/colors';
import { FontSizes, FontWeights } from '../../constants/fonts';
import { BorderRadius, Shadows, Spacing } from '../../constants/layout';
import { ProgressBar } from '../ui/ProgressBar';
import { AudioWaveform } from './AudioWaveform';

interface MiniPlayerProps {
  title: string;
  author: string;
  thumbnailUrl?: string;
  isPlaying: boolean;
  progress: number;
  devotionalId: string;
  onPlayPause: () => void;
  onClose: () => void;
}

export function MiniPlayer({
  title,
  author,
  thumbnailUrl,
  isPlaying,
  progress,
  devotionalId,
  onPlayPause,
  onClose,
}: MiniPlayerProps) {
  const scale = useSharedValue(1);

  const handlePlayPause = useCallback(() => {
    scale.value = withSpring(0.92, { damping: 20, stiffness: 400 }, () => {
      scale.value = withSpring(1, { damping: 20, stiffness: 400 });
    });
    onPlayPause();
  }, [onPlayPause, scale]);

  const playBtnStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handleExpand = () => {
    router.push(`/devotional/player`);
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handleExpand}
      activeOpacity={0.97}
    >
      <View style={styles.progressBar}>
        <ProgressBar progress={progress} height={2} color={Colors.primary} animated />
      </View>

      <View style={styles.content}>
        {/* Artwork */}
        <View style={styles.artworkContainer}>
          {thumbnailUrl ? (
            <Image source={{ uri: thumbnailUrl }} style={styles.artwork} />
          ) : (
            <View style={styles.artworkPlaceholder}>
              <Ionicons name="musical-notes" size={18} color={Colors.primary} />
            </View>
          )}
          {isPlaying && (
            <View style={styles.waveformOverlay}>
              <AudioWaveform
                isPlaying={isPlaying}
                barCount={5}
                color="rgba(255,255,255,0.6)"
                activeColor={Colors.white}
                height={20}
              />
            </View>
          )}
        </View>

        {/* Info */}
        <View style={styles.info}>
          <Text style={styles.title} numberOfLines={1}>{title}</Text>
          <Text style={styles.author} numberOfLines={1}>{author}</Text>
        </View>

        {/* Controls */}
        <View style={styles.controls}>
          <Animated.View style={playBtnStyle}>
            <TouchableOpacity
              style={styles.playBtn}
              onPress={handlePlayPause}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              accessibilityLabel={isPlaying ? 'Pause' : 'Play'}
            >
              <Ionicons
                name={isPlaying ? 'pause' : 'play'}
                size={20}
                color={Colors.white}
                style={!isPlaying ? { marginLeft: 2 } : undefined}
              />
            </TouchableOpacity>
          </Animated.View>

          <TouchableOpacity
            onPress={onClose}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={styles.closeBtn}
            accessibilityLabel="Close player"
          >
            <Ionicons name="close" size={20} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.white,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    ...(Shadows.lg as object),
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 12,
  },
  progressBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[3],
    gap: Spacing[3],
  },
  artworkContainer: {
    position: 'relative',
    width: 48,
    height: 48,
  },
  artwork: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
  },
  artworkPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.light,
    alignItems: 'center',
    justifyContent: 'center',
  },
  waveformOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(22, 163, 74, 0.7)',
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.semibold,
    color: Colors.textPrimary,
  },
  author: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
  },
  playBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  closeBtn: {
    padding: Spacing[1],
  },
});
