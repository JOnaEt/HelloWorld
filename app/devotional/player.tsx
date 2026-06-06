import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSpring,
  withSequence,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import { Colors } from '../../constants/colors';
import { FontSizes, FontWeights } from '../../constants/fonts';
import { BorderRadius, Shadows, Spacing } from '../../constants/layout';
import { AudioWaveform } from '../../components/devotional/AudioWaveform';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { useDevotionalStore } from '../../store/devotionalStore';
import { useAudio } from '../../hooks/useAudio';
import { formatDuration } from '../../utils/date';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const SPEED_OPTIONS = [0.75, 1.0, 1.25, 1.5, 2.0];
const SLEEP_OPTIONS = [15, 30, 45, 60];

export default function PlayerScreen() {
  const insets = useSafeAreaInsets();
  const { currentDevotional, player } = useDevotionalStore();
  const [showSpeedModal, setShowSpeedModal] = React.useState(false);
  const [showSleepModal, setShowSleepModal] = React.useState(false);

  const audioUrl = currentDevotional?.audioUrl;
  const audio = useAudio(audioUrl);

  // Artwork pulse animation
  const artworkScale = useSharedValue(1);
  const artworkOpacity = useSharedValue(0.9);

  useEffect(() => {
    if (audio.isPlaying) {
      artworkScale.value = withRepeat(
        withSequence(
          withTiming(1.03, { duration: 2000 }),
          withTiming(1, { duration: 2000 })
        ),
        -1,
        true
      );
      artworkOpacity.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 2500 }),
          withTiming(0.88, { duration: 2500 })
        ),
        -1,
        true
      );
    } else {
      artworkScale.value = withSpring(1, { damping: 10 });
      artworkOpacity.value = withTiming(0.9, { duration: 400 });
    }
  }, [audio.isPlaying]);

  const artworkAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: artworkScale.value }],
    opacity: artworkOpacity.value,
  }));

  const handlePlayPause = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await audio.togglePlayPause();
  };

  const handleSpeedChange = async (speed: number) => {
    await audio.setPlaybackSpeed(speed);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowSpeedModal(false);
  };

  const handleSleepTimer = async (minutes: number) => {
    audio.startSleepTimer(minutes);
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setShowSleepModal(false);
  };

  if (!currentDevotional) {
    return (
      <LinearGradient colors={['#0F172A', '#15803D', '#0F172A']} style={styles.emptyContainer}>
        <StatusBar style="light" />
        <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-down" size={28} color={Colors.white} />
        </TouchableOpacity>
        <View style={styles.emptyContent}>
          <Ionicons name="headset-outline" size={64} color="rgba(255,255,255,0.4)" />
          <Text style={styles.emptyText}>No devotional selected</Text>
          <TouchableOpacity
            style={styles.browseBtn}
            onPress={() => router.replace('/(tabs)/library')}
          >
            <Text style={styles.browseBtnText}>Browse Library</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    );
  }

  const progress = audio.duration > 0 ? audio.position / audio.duration : 0;

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Dynamic Background */}
      <LinearGradient
        colors={['#0F172A', '#15803D', '#0F172A']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.3, y: 0 }}
        end={{ x: 0.7, y: 1 }}
      />

      {/* Decorative circles */}
      <View style={styles.bgCircle1} />
      <View style={styles.bgCircle2} />

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + Spacing[2], paddingBottom: insets.bottom + Spacing[4] },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.headerBtn} onPress={() => router.back()}>
            <Ionicons name="chevron-down" size={26} color={Colors.white} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerLabel}>NOW PLAYING</Text>
          </View>
          <TouchableOpacity style={styles.headerBtn}>
            <Ionicons name="ellipsis-horizontal" size={24} color={Colors.white} />
          </TouchableOpacity>
        </View>

        {/* Artwork */}
        <View style={styles.artworkContainer}>
          <Animated.View style={[styles.artworkWrapper, artworkAnimStyle]}>
            <View style={styles.artwork}>
              <View style={styles.artworkInner}>
                <LinearGradient
                  colors={['#22C55E', '#15803D']}
                  style={styles.artworkGradient}
                >
                  <Text style={styles.artworkLetter}>T</Text>
                </LinearGradient>
              </View>
              <View style={styles.artworkGlow} />
            </View>
          </Animated.View>

          {/* Waveform overlay when playing */}
          <View style={styles.waveformContainer}>
            <AudioWaveform
              isPlaying={audio.isPlaying}
              barCount={20}
              color="rgba(255,255,255,0.2)"
              activeColor="rgba(255,255,255,0.6)"
              height={40}
            />
          </View>
        </View>

        {/* Track Info */}
        <View style={styles.trackInfo}>
          <Text style={styles.trackTitle} numberOfLines={2}>
            {currentDevotional.title}
          </Text>
          <Text style={styles.trackAuthor}>
            {currentDevotional.author.name}
            {currentDevotional.author.title ? ` · ${currentDevotional.author.title}` : ''}
          </Text>
          <Text style={styles.trackScripture}>
            {currentDevotional.scripture.book} {currentDevotional.scripture.chapter}:{currentDevotional.scripture.verses}
          </Text>
        </View>

        {/* Progress */}
        <View style={styles.progressSection}>
          <ProgressBar
            progress={progress}
            height={4}
            color={Colors.primary}
            trackColor="rgba(255,255,255,0.2)"
          />
          <View style={styles.timeRow}>
            <Text style={styles.timeText}>{formatDuration(audio.position)}</Text>
            <Text style={styles.timeText}>{formatDuration(audio.duration)}</Text>
          </View>
        </View>

        {/* Main Controls */}
        <View style={styles.controls}>
          <TouchableOpacity
            style={styles.controlBtn}
            onPress={() => audio.skipBackward(15)}
          >
            <Ionicons name="play-skip-back-outline" size={28} color={Colors.white} />
            <Text style={styles.skipLabel}>15</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.controlBtn}
            onPress={async () => {
              await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              audio.seekTo(Math.max(0, audio.position - 15));
            }}
          >
            <Ionicons
              name="refresh-outline"
              size={28}
              color={Colors.white}
              style={{ transform: [{ scaleX: -1 }] }}
            />
            <Text style={styles.skipLabel}>15</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.playButton}
            onPress={handlePlayPause}
            disabled={audio.isBuffering}
          >
            {audio.isBuffering ? (
              <ActivityIndicator size="small" color={Colors.primary} />
            ) : (
              <Ionicons
                name={audio.isPlaying ? 'pause' : 'play'}
                size={32}
                color={Colors.primary}
                style={!audio.isPlaying ? { marginLeft: 3 } : undefined}
              />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.controlBtn}
            onPress={async () => {
              await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              audio.seekTo(Math.min(audio.duration, audio.position + 15));
            }}
          >
            <Ionicons name="refresh-outline" size={28} color={Colors.white} />
            <Text style={styles.skipLabel}>15</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.controlBtn}
            onPress={() => audio.skipForward(15)}
          >
            <Ionicons name="play-skip-forward-outline" size={28} color={Colors.white} />
          </TouchableOpacity>
        </View>

        {/* Extra Controls */}
        <View style={styles.extraControls}>
          <TouchableOpacity
            style={styles.extraBtn}
            onPress={() => setShowSpeedModal(true)}
          >
            <Text style={styles.extraBtnText}>{audio.playbackSpeed}x</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.extraBtn, audio.sleepTimerActive && styles.extraBtnActive]}
            onPress={() =>
              audio.sleepTimerActive
                ? audio.cancelSleepTimer()
                : setShowSleepModal(true)
            }
          >
            <Ionicons
              name="moon-outline"
              size={16}
              color={audio.sleepTimerActive ? Colors.white : 'rgba(255,255,255,0.7)'}
            />
            {audio.sleepTimerActive && audio.sleepTimerMinutes && (
              <Text style={[styles.extraBtnText, { color: Colors.white }]}>
                {audio.sleepTimerMinutes}m
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.extraBtn}>
            <Ionicons name="share-outline" size={16} color="rgba(255,255,255,0.7)" />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Speed Modal */}
      <Modal visible={showSpeedModal} transparent animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowSpeedModal(false)}
        >
          <BlurView intensity={80} style={styles.modalSheet} tint="dark">
            <Text style={styles.modalTitle}>Playback Speed</Text>
            <View style={styles.speedGrid}>
              {SPEED_OPTIONS.map((s) => (
                <TouchableOpacity
                  key={s}
                  style={[styles.speedOption, audio.playbackSpeed === s && styles.speedOptionActive]}
                  onPress={() => handleSpeedChange(s)}
                >
                  <Text
                    style={[
                      styles.speedOptionText,
                      audio.playbackSpeed === s && styles.speedOptionTextActive,
                    ]}
                  >
                    {s}x
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </BlurView>
        </TouchableOpacity>
      </Modal>

      {/* Sleep Timer Modal */}
      <Modal visible={showSleepModal} transparent animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowSleepModal(false)}
        >
          <BlurView intensity={80} style={styles.modalSheet} tint="dark">
            <Text style={styles.modalTitle}>Sleep Timer</Text>
            <View style={styles.sleepGrid}>
              {SLEEP_OPTIONS.map((m) => (
                <TouchableOpacity
                  key={m}
                  style={styles.sleepOption}
                  onPress={() => handleSleepTimer(m)}
                >
                  <Ionicons name="moon-outline" size={18} color="rgba(255,255,255,0.7)" />
                  <Text style={styles.sleepOptionText}>{m} minutes</Text>
                </TouchableOpacity>
              ))}
            </View>
          </BlurView>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
  },
  emptyContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing[4],
  },
  emptyText: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.semibold,
    color: 'rgba(255,255,255,0.6)',
  },
  browseBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing[3],
    paddingHorizontal: Spacing[6],
    borderRadius: BorderRadius.full,
  },
  browseBtnText: {
    fontSize: FontSizes.base,
    fontWeight: FontWeights.semibold,
    color: Colors.white,
  },
  bgCircle1: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(22,163,74,0.12)',
    top: SCREEN_HEIGHT * 0.1,
    right: -80,
  },
  bgCircle2: {
    position: 'absolute',
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: 'rgba(22,163,74,0.08)',
    bottom: SCREEN_HEIGHT * 0.15,
    left: -60,
  },
  content: {
    paddingHorizontal: Spacing[5],
    gap: Spacing[6],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    alignItems: 'center',
  },
  headerLabel: {
    fontSize: FontSizes.xs,
    fontWeight: FontWeights.bold,
    color: 'rgba(255,255,255,0.6)',
    letterSpacing: 1.5,
  },
  closeBtn: {
    marginTop: 20,
    padding: Spacing[3],
  },
  artworkContainer: {
    alignItems: 'center',
    gap: Spacing[4],
  },
  artworkWrapper: {
    alignItems: 'center',
  },
  artwork: {
    position: 'relative',
    width: SCREEN_WIDTH * 0.72,
    height: SCREEN_WIDTH * 0.72,
    alignItems: 'center',
    justifyContent: 'center',
  },
  artworkInner: {
    width: '100%',
    height: '100%',
    borderRadius: BorderRadius['3xl'],
    overflow: 'hidden',
    ...(Shadows.xl as object) || {},
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.5,
    shadowRadius: 32,
    elevation: 20,
  },
  artworkGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  artworkLetter: {
    fontSize: 120,
    fontWeight: FontWeights.black,
    color: Colors.white,
    opacity: 0.9,
  },
  artworkGlow: {
    position: 'absolute',
    width: SCREEN_WIDTH * 0.85,
    height: SCREEN_WIDTH * 0.85,
    borderRadius: SCREEN_WIDTH * 0.425,
    backgroundColor: 'rgba(22,163,74,0.2)',
    zIndex: -1,
  },
  waveformContainer: {
    alignItems: 'center',
  },
  trackInfo: {
    alignItems: 'center',
    gap: Spacing[2],
  },
  trackTitle: {
    fontSize: FontSizes['2xl'],
    fontWeight: FontWeights.bold,
    color: Colors.white,
    textAlign: 'center',
    letterSpacing: -0.3,
    lineHeight: 32,
  },
  trackAuthor: {
    fontSize: FontSizes.sm,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
  },
  trackScripture: {
    fontSize: FontSizes.xs,
    color: Colors.primary,
    fontWeight: FontWeights.semibold,
    textAlign: 'center',
    marginTop: 2,
  },
  progressSection: {
    gap: Spacing[2],
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeText: {
    fontSize: FontSizes.xs,
    color: 'rgba(255,255,255,0.6)',
    fontWeight: FontWeights.medium,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing[5],
  },
  controlBtn: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipLabel: {
    fontSize: 9,
    color: 'rgba(255,255,255,0.5)',
    marginTop: -4,
  },
  playButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.white,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  extraControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing[4],
    marginBottom: Spacing[4],
  },
  extraBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[2],
    borderRadius: BorderRadius.full,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  extraBtnActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  extraBtnText: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.semibold,
    color: 'rgba(255,255,255,0.8)',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    borderTopLeftRadius: BorderRadius['3xl'],
    borderTopRightRadius: BorderRadius['3xl'],
    padding: Spacing[6],
    paddingBottom: Spacing[12] ?? 48,
    gap: Spacing[5],
    overflow: 'hidden',
  },
  modalTitle: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.bold,
    color: Colors.white,
    textAlign: 'center',
  },
  speedGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing[3],
    justifyContent: 'center',
  },
  speedOption: {
    paddingHorizontal: Spacing[5],
    paddingVertical: Spacing[3],
    borderRadius: BorderRadius.full,
    backgroundColor: 'rgba(255,255,255,0.1)',
    minWidth: 70,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  speedOptionActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  speedOptionText: {
    fontSize: FontSizes.base,
    fontWeight: FontWeights.semibold,
    color: 'rgba(255,255,255,0.8)',
  },
  speedOptionTextActive: {
    color: Colors.white,
  },
  sleepGrid: {
    gap: Spacing[2],
  },
  sleepOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
    paddingVertical: Spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  sleepOptionText: {
    fontSize: FontSizes.base,
    color: 'rgba(255,255,255,0.9)',
  },
});
