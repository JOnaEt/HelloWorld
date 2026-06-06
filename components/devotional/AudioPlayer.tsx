import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { FontSizes, FontWeights } from '../../constants/fonts';
import { BorderRadius, Shadows, Spacing } from '../../constants/layout';
import { ProgressBar } from '../ui/ProgressBar';
import { formatDuration } from '../../utils/date';

const SPEED_OPTIONS = [0.5, 0.75, 1.0, 1.25, 1.5, 1.75, 2.0];
const SLEEP_OPTIONS = [5, 10, 15, 20, 30, 45, 60];

interface AudioPlayerProps {
  isPlaying: boolean;
  isLoading?: boolean;
  position: number;
  duration: number;
  playbackSpeed: number;
  sleepTimerActive?: boolean;
  sleepTimerMinutes?: number | null;
  onPlayPause: () => void;
  onSeek: (seconds: number) => void;
  onSkipForward?: () => void;
  onSkipBackward?: () => void;
  onSpeedChange: (speed: number) => void;
  onSleepTimer?: (minutes: number) => void;
  onCancelSleepTimer?: () => void;
  compact?: boolean;
}

export function AudioPlayer({
  isPlaying,
  isLoading = false,
  position,
  duration,
  playbackSpeed,
  sleepTimerActive = false,
  sleepTimerMinutes,
  onPlayPause,
  onSeek,
  onSkipForward,
  onSkipBackward,
  onSpeedChange,
  onSleepTimer,
  onCancelSleepTimer,
  compact = false,
}: AudioPlayerProps) {
  const [showSpeedModal, setShowSpeedModal] = useState(false);
  const [showSleepModal, setShowSleepModal] = useState(false);
  const progress = duration > 0 ? position / duration : 0;

  if (compact) {
    return (
      <View style={styles.compactContainer}>
        <ProgressBar progress={progress} height={3} color={Colors.primary} />
        <View style={styles.compactControls}>
          <Text style={styles.timeText}>{formatDuration(position)}</Text>
          <View style={styles.compactButtons}>
            <TouchableOpacity onPress={onSkipBackward} style={styles.iconBtn}>
              <Ionicons name="play-back-outline" size={20} color={Colors.textPrimary} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onPlayPause}
              style={[styles.playBtn, styles.playBtnSmall]}
              disabled={isLoading}
            >
              {isLoading ? (
                <Ionicons name="sync-outline" size={18} color={Colors.white} />
              ) : (
                <Ionicons
                  name={isPlaying ? 'pause' : 'play'}
                  size={18}
                  color={Colors.white}
                />
              )}
            </TouchableOpacity>
            <TouchableOpacity onPress={onSkipForward} style={styles.iconBtn}>
              <Ionicons name="play-forward-outline" size={20} color={Colors.textPrimary} />
            </TouchableOpacity>
          </View>
          <Text style={styles.timeText}>{formatDuration(duration)}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Progress slider */}
      <View style={styles.sliderRow}>
        <Text style={styles.timeText}>{formatDuration(position)}</Text>
        <View style={styles.sliderContainer}>
          <ProgressBar progress={progress} height={4} color={Colors.primary} />
          <TouchableOpacity
            style={[styles.sliderHandle, { left: `${Math.min(progress * 100, 97)}%` as any }]}
            // Invisible hit area for seeking
          />
        </View>
        <Text style={styles.timeText}>{formatDuration(duration)}</Text>
      </View>

      {/* Main controls */}
      <View style={styles.controls}>
        <TouchableOpacity onPress={onSkipBackward} style={styles.iconBtn}>
          <Ionicons name="play-skip-back-outline" size={26} color={Colors.textPrimary} />
          <Text style={styles.skipLabel}>15</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => onSeek(Math.max(0, position - 15))} style={styles.iconBtn}>
          <Ionicons name="refresh-outline" size={26} color={Colors.textPrimary} style={{ transform: [{ scaleX: -1 }] }} />
          <Text style={styles.skipLabel}>15</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onPlayPause}
          style={styles.playBtn}
          disabled={isLoading}
          accessibilityLabel={isPlaying ? 'Pause' : 'Play'}
        >
          {isLoading ? (
            <Ionicons name="sync-outline" size={28} color={Colors.white} />
          ) : (
            <Ionicons
              name={isPlaying ? 'pause' : 'play'}
              size={28}
              color={Colors.white}
              style={!isPlaying ? { marginLeft: 3 } : undefined}
            />
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => onSeek(Math.min(duration, position + 15))} style={styles.iconBtn}>
          <Ionicons name="refresh-outline" size={26} color={Colors.textPrimary} />
          <Text style={styles.skipLabel}>15</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={onSkipForward} style={styles.iconBtn}>
          <Ionicons name="play-skip-forward-outline" size={26} color={Colors.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* Speed & Sleep */}
      <View style={styles.extras}>
        <TouchableOpacity
          style={styles.extraBtn}
          onPress={() => setShowSpeedModal(true)}
        >
          <Text style={styles.extraBtnText}>{playbackSpeed}x</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.extraBtn, sleepTimerActive && styles.extraBtnActive]}
          onPress={() => (sleepTimerActive ? onCancelSleepTimer?.() : setShowSleepModal(true))}
        >
          <Ionicons
            name="moon-outline"
            size={16}
            color={sleepTimerActive ? Colors.white : Colors.textSecondary}
          />
          {sleepTimerActive && sleepTimerMinutes && (
            <Text style={[styles.extraBtnText, { color: Colors.white }]}>{sleepTimerMinutes}m</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Speed Modal */}
      <Modal visible={showSpeedModal} transparent animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          onPress={() => setShowSpeedModal(false)}
        >
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>Playback Speed</Text>
            <View style={styles.speedGrid}>
              {SPEED_OPTIONS.map((s) => (
                <TouchableOpacity
                  key={s}
                  style={[styles.speedOption, playbackSpeed === s && styles.speedOptionActive]}
                  onPress={() => {
                    onSpeedChange(s);
                    setShowSpeedModal(false);
                  }}
                >
                  <Text
                    style={[
                      styles.speedOptionText,
                      playbackSpeed === s && styles.speedOptionTextActive,
                    ]}
                  >
                    {s}x
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Sleep Timer Modal */}
      <Modal visible={showSleepModal} transparent animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          onPress={() => setShowSleepModal(false)}
        >
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>Sleep Timer</Text>
            <ScrollView>
              {SLEEP_OPTIONS.map((m) => (
                <TouchableOpacity
                  key={m}
                  style={styles.sleepOption}
                  onPress={() => {
                    onSleepTimer?.(m);
                    setShowSleepModal(false);
                  }}
                >
                  <Ionicons name="moon-outline" size={18} color={Colors.textSecondary} />
                  <Text style={styles.sleepOptionText}>{m} minutes</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing[5],
    paddingHorizontal: Spacing[4],
  },
  sliderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
  },
  sliderContainer: {
    flex: 1,
    position: 'relative',
    justifyContent: 'center',
  },
  sliderHandle: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.primary,
    marginLeft: -8,
    ...(Shadows.primary as object),
  },
  timeText: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
    fontWeight: FontWeights.medium,
    minWidth: 36,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing[5],
  },
  iconBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 44,
    height: 44,
  },
  skipLabel: {
    fontSize: 9,
    color: Colors.textSecondary,
    marginTop: -2,
  },
  playBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...(Shadows.primary as object),
  },
  playBtnSmall: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  extras: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing[4],
  },
  extraBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[2],
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.gray100,
  },
  extraBtnActive: {
    backgroundColor: Colors.primary,
  },
  extraBtnText: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.semibold,
    color: Colors.textSecondary,
  },

  // Compact
  compactContainer: {
    gap: Spacing[2],
  },
  compactControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  compactButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
  },

  // Modals
  modalOverlay: {
    flex: 1,
    backgroundColor: Colors.overlay,
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: BorderRadius['3xl'],
    borderTopRightRadius: BorderRadius['3xl'],
    padding: Spacing[6],
    paddingBottom: Spacing[10],
  },
  modalTitle: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.bold,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: Spacing[5],
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
    backgroundColor: Colors.gray100,
    minWidth: 70,
    alignItems: 'center',
  },
  speedOptionActive: {
    backgroundColor: Colors.primary,
  },
  speedOptionText: {
    fontSize: FontSizes.base,
    fontWeight: FontWeights.semibold,
    color: Colors.textPrimary,
  },
  speedOptionTextActive: {
    color: Colors.white,
  },
  sleepOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
    paddingVertical: Spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  sleepOptionText: {
    fontSize: FontSizes.base,
    color: Colors.textPrimary,
  },
});
