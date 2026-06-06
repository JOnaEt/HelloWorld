import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../../constants/colors';
import { FontSizes, FontWeights } from '../../constants/fonts';
import { BorderRadius, Shadows, Spacing } from '../../constants/layout';
import { generateWeeklyView, getStreakEmoji, getMilestoneProgress, formatStreakMessage } from '../../utils/streak';
import { ProgressBar } from '../ui/ProgressBar';

interface DailyStreakCardProps {
  currentStreak: number;
  longestStreak: number;
  lastReadDate: string | null;
}

export function DailyStreakCard({
  currentStreak,
  longestStreak,
  lastReadDate,
}: DailyStreakCardProps) {
  const weeklyView = generateWeeklyView(lastReadDate, currentStreak);
  const { next, progress } = getMilestoneProgress(currentStreak);
  const emoji = getStreakEmoji(currentStreak);

  const DAY_NAMES = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const today = new Date();

  return (
    <LinearGradient
      colors={Colors.gradientPrimary}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.label}>Daily Streak</Text>
          <View style={styles.streakRow}>
            <Text style={styles.streakEmoji}>{emoji}</Text>
            <Text style={styles.streakCount}>{currentStreak}</Text>
            <Text style={styles.streakUnit}>day{currentStreak !== 1 ? 's' : ''}</Text>
          </View>
          <Text style={styles.message}>{formatStreakMessage(currentStreak)}</Text>
        </View>
        <View style={styles.bestStreak}>
          <Text style={styles.bestLabel}>Best</Text>
          <Text style={styles.bestValue}>{longestStreak}</Text>
          <Text style={styles.bestUnit}>days</Text>
        </View>
      </View>

      {/* Weekly dots */}
      <View style={styles.weekRow}>
        {weeklyView.map((day, i) => {
          const d = new Date(today);
          d.setDate(today.getDate() - (6 - i));
          const dayName = DAY_NAMES[d.getDay()];
          return (
            <View key={i} style={styles.dayCol}>
              <Text style={styles.dayName}>{dayName}</Text>
              <View
                style={[
                  styles.dayDot,
                  day.completed && styles.dayDotCompleted,
                  day.isToday && styles.dayDotToday,
                ]}
              />
            </View>
          );
        })}
      </View>

      {/* Milestone progress */}
      {next && (
        <View style={styles.milestoneSection}>
          <View style={styles.milestoneHeader}>
            <Text style={styles.milestoneText}>
              Next milestone: {next} days
            </Text>
            <Text style={styles.milestoneProgress}>
              {currentStreak}/{next}
            </Text>
          </View>
          <ProgressBar
            progress={progress}
            color="rgba(255,255,255,0.9)"
            trackColor="rgba(255,255,255,0.25)"
            height={4}
          />
        </View>
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius['2xl'],
    padding: Spacing[5],
    gap: Spacing[4],
    ...(Shadows.primary as object),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  label: {
    fontSize: FontSizes.xs,
    fontWeight: FontWeights.semibold,
    color: 'rgba(255,255,255,0.75)',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  streakRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  streakEmoji: {
    fontSize: FontSizes['2xl'],
  },
  streakCount: {
    fontSize: FontSizes['4xl'],
    fontWeight: FontWeights.black,
    color: Colors.white,
    lineHeight: FontSizes['4xl'] * 1.1,
  },
  streakUnit: {
    fontSize: FontSizes.lg,
    color: 'rgba(255,255,255,0.85)',
    fontWeight: FontWeights.medium,
  },
  message: {
    fontSize: FontSizes.sm,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  bestStreak: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: BorderRadius.xl,
    padding: Spacing[3],
    minWidth: 64,
  },
  bestLabel: {
    fontSize: FontSizes.xs,
    color: 'rgba(255,255,255,0.7)',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  bestValue: {
    fontSize: FontSizes['2xl'],
    fontWeight: FontWeights.bold,
    color: Colors.white,
  },
  bestUnit: {
    fontSize: FontSizes.xs,
    color: 'rgba(255,255,255,0.7)',
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing[2],
  },
  dayCol: {
    alignItems: 'center',
    gap: 4,
  },
  dayName: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: FontWeights.medium,
  },
  dayDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  dayDotCompleted: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderColor: 'transparent',
  },
  dayDotToday: {
    borderColor: Colors.white,
    borderWidth: 2.5,
  },
  milestoneSection: {
    gap: Spacing[2],
  },
  milestoneHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  milestoneText: {
    fontSize: FontSizes.xs,
    color: 'rgba(255,255,255,0.8)',
  },
  milestoneProgress: {
    fontSize: FontSizes.xs,
    fontWeight: FontWeights.semibold,
    color: Colors.white,
  },
});
