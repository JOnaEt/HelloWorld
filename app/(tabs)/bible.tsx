import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { FontSizes, FontWeights } from '../../constants/fonts';
import { Spacing, BorderRadius, Shadows } from '../../constants/layout';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { Badge } from '../../components/ui/Badge';
import { DailyStreakCard } from '../../components/home/DailyStreakCard';
import { useAuth } from '../../hooks/useAuth';

const READING_PLANS = [
  {
    id: '1',
    title: 'New Testament in 90 Days',
    description: 'Journey through the entire New Testament in three months',
    durationDays: 90,
    progress: 0.35,
    category: 'New Testament',
    enrolled: 1240,
    color: '#0EA5E9',
  },
  {
    id: '2',
    title: 'Psalms & Proverbs',
    description: 'Daily wisdom from the Psalms and Proverbs',
    durationDays: 60,
    progress: 0.0,
    category: 'Wisdom Literature',
    enrolled: 856,
    color: '#F59E0B',
  },
  {
    id: '3',
    title: 'Through the Bible in a Year',
    description: 'Complete Bible reading plan for the whole year',
    durationDays: 365,
    progress: 0.12,
    category: 'Complete Bible',
    enrolled: 2150,
    color: '#8B5CF6',
  },
];

const ACHIEVEMENTS = [
  { id: '1', emoji: '📖', title: '7-Day Streak', desc: 'Read 7 days in a row', unlocked: true },
  { id: '2', emoji: '🔥', title: '30-Day Faithful', desc: 'Read for 30 consecutive days', unlocked: false },
  { id: '3', emoji: '⭐', title: 'NT Complete', desc: 'Finished the New Testament', unlocked: false },
  { id: '4', emoji: '👑', title: 'Bible Champion', desc: 'Read the entire Bible', unlocked: false },
];

const TODAY_READING = {
  day: 32,
  title: "The Sermon on the Mount",
  passages: [
    { book: 'Matthew', chapter: 5, verses: '1-48', translation: 'NIV', text: '' },
    { book: 'Matthew', chapter: 6, verses: '1-34', translation: 'NIV', text: '' },
  ],
  estimatedMinutes: 12,
};

export default function BibleScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'plans' | 'reading'>('reading');

  if (!user) return null;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Bible Reading</Text>
        <Text style={styles.headerSubtitle}>Your daily Scripture journey</Text>

        {/* Tabs */}
        <View style={styles.tabRow}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'reading' && styles.tabActive]}
            onPress={() => setActiveTab('reading')}
          >
            <Text style={[styles.tabText, activeTab === 'reading' && styles.tabTextActive]}>
              My Reading
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'plans' && styles.tabActive]}
            onPress={() => setActiveTab('plans')}
          >
            <Text style={[styles.tabText, activeTab === 'plans' && styles.tabTextActive]}>
              Reading Plans
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {activeTab === 'reading' ? (
          <>
            {/* Today's Reading */}
            <LinearGradient
              colors={['#1E40AF', '#3B82F6', '#60A5FA']}
              style={styles.todayCard}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.todayTop}>
                <View>
                  <Text style={styles.todayLabel}>TODAY'S READING</Text>
                  <Text style={styles.todayDay}>Day {TODAY_READING.day}</Text>
                </View>
                <View style={styles.todayTime}>
                  <Ionicons name="time-outline" size={14} color="rgba(255,255,255,0.8)" />
                  <Text style={styles.todayTimeText}>{TODAY_READING.estimatedMinutes} min</Text>
                </View>
              </View>

              <Text style={styles.todayTitle}>{TODAY_READING.title}</Text>

              <View style={styles.passagesList}>
                {TODAY_READING.passages.map((p, i) => (
                  <View key={i} style={styles.passageChip}>
                    <Text style={styles.passageChipText}>
                      {p.book} {p.chapter}:{p.verses}
                    </Text>
                  </View>
                ))}
              </View>

              <TouchableOpacity style={styles.startReadingBtn}>
                <Text style={styles.startReadingText}>Start Reading</Text>
                <Ionicons name="arrow-forward" size={16} color={Colors.primary} />
              </TouchableOpacity>
            </LinearGradient>

            {/* Streak */}
            <DailyStreakCard
              currentStreak={user.stats.currentStreak}
              longestStreak={user.stats.longestStreak}
              lastReadDate={null}
            />

            {/* Monthly Challenge */}
            <View style={styles.challengeCard}>
              <View style={styles.challengeHeader}>
                <Ionicons name="trophy-outline" size={22} color={Colors.warning} />
                <Text style={styles.challengeTitle}>June Challenge</Text>
                <Badge label="Active" variant="success" size="sm" />
              </View>
              <Text style={styles.challengeDesc}>
                Read every day this month and earn the June Faithful badge!
              </Text>
              <View style={styles.challengeProgress}>
                <View style={styles.challengeStats}>
                  <Text style={styles.challengeStatValue}>18</Text>
                  <Text style={styles.challengeStatLabel}>Days Done</Text>
                </View>
                <ProgressBar progress={18 / 30} style={{ flex: 1 }} />
                <View style={styles.challengeStats}>
                  <Text style={styles.challengeStatValue}>30</Text>
                  <Text style={styles.challengeStatLabel}>Total</Text>
                </View>
              </View>
            </View>

            {/* Achievements */}
            <View style={styles.achievementsSection}>
              <Text style={styles.sectionTitle}>Achievements</Text>
              <View style={styles.achievementsGrid}>
                {ACHIEVEMENTS.map((a) => (
                  <View
                    key={a.id}
                    style={[styles.achievement, !a.unlocked && styles.achievementLocked]}
                  >
                    <Text style={styles.achievementEmoji}>{a.emoji}</Text>
                    <Text style={[styles.achievementTitle, !a.unlocked && styles.achievementTitleLocked]}>
                      {a.title}
                    </Text>
                    <Text style={styles.achievementDesc}>{a.desc}</Text>
                  </View>
                ))}
              </View>
            </View>
          </>
        ) : (
          /* Reading Plans */
          <View style={styles.plansSection}>
            <Text style={styles.sectionTitle}>Bible Reading Plans</Text>
            <Text style={styles.sectionSubtitle}>Choose a plan that fits your life</Text>
            {READING_PLANS.map((plan) => (
              <TouchableOpacity key={plan.id} style={styles.planCard} activeOpacity={0.88}>
                <View style={[styles.planColorBar, { backgroundColor: plan.color }]} />
                <View style={styles.planContent}>
                  <View style={styles.planHeader}>
                    <Badge label={plan.category} variant="primary" size="sm" />
                    <View style={styles.enrolledChip}>
                      <Ionicons name="people-outline" size={11} color={Colors.textSecondary} />
                      <Text style={styles.enrolledText}>{plan.enrolled.toLocaleString()} enrolled</Text>
                    </View>
                  </View>
                  <Text style={styles.planTitle}>{plan.title}</Text>
                  <Text style={styles.planDesc} numberOfLines={2}>{plan.description}</Text>
                  {plan.progress > 0 && (
                    <View style={styles.planProgress}>
                      <Text style={styles.planProgressText}>
                        {Math.round(plan.progress * 100)}% complete
                      </Text>
                      <ProgressBar progress={plan.progress} height={6} style={{ flex: 1 }} />
                    </View>
                  )}
                  <View style={styles.planFooter}>
                    <Text style={styles.planDuration}>
                      {plan.durationDays} days
                    </Text>
                    <TouchableOpacity
                      style={[styles.planBtn, plan.progress > 0 && styles.planBtnContinue]}
                    >
                      <Text style={[styles.planBtnText, plan.progress > 0 && styles.planBtnTextContinue]}>
                        {plan.progress > 0 ? 'Continue' : 'Start Plan'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: Spacing[5],
    paddingBottom: Spacing[2],
    paddingTop: Spacing[2],
  },
  headerTitle: {
    fontSize: FontSizes['2xl'],
    fontWeight: FontWeights.black,
    color: Colors.textPrimary,
  },
  headerSubtitle: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing[3],
  },
  tabRow: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.xl,
    padding: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tab: {
    flex: 1,
    paddingVertical: Spacing[2],
    alignItems: 'center',
    borderRadius: BorderRadius.lg,
  },
  tabActive: {
    backgroundColor: Colors.primary,
  },
  tabText: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.semibold,
    color: Colors.textSecondary,
  },
  tabTextActive: {
    color: Colors.white,
  },
  scrollContent: {
    padding: Spacing[5],
    paddingBottom: Spacing[8],
    gap: Spacing[4],
  },
  todayCard: {
    borderRadius: BorderRadius['2xl'],
    padding: Spacing[5],
    gap: Spacing[3],
  },
  todayTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  todayLabel: {
    fontSize: 10,
    fontWeight: FontWeights.semibold,
    color: 'rgba(255,255,255,0.7)',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  todayDay: {
    fontSize: FontSizes.xl,
    fontWeight: FontWeights.bold,
    color: Colors.white,
  },
  todayTime: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: Spacing[3],
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  todayTimeText: {
    fontSize: FontSizes.xs,
    color: 'rgba(255,255,255,0.85)',
    fontWeight: FontWeights.medium,
  },
  todayTitle: {
    fontSize: FontSizes['2xl'],
    fontWeight: FontWeights.bold,
    color: Colors.white,
  },
  passagesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing[2],
  },
  passageChip: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: BorderRadius.full,
    paddingVertical: 4,
    paddingHorizontal: Spacing[3],
  },
  passageChipText: {
    fontSize: FontSizes.xs,
    color: Colors.white,
    fontWeight: FontWeights.medium,
  },
  startReadingBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing[2],
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    paddingVertical: Spacing[3],
    marginTop: Spacing[2],
  },
  startReadingText: {
    fontSize: FontSizes.base,
    fontWeight: FontWeights.bold,
    color: '#1E40AF',
  },
  challengeCard: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.xl,
    padding: Spacing[4],
    gap: Spacing[3],
    ...(Shadows.base as object),
  },
  challengeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
  },
  challengeTitle: {
    flex: 1,
    fontSize: FontSizes.md,
    fontWeight: FontWeights.bold,
    color: Colors.textPrimary,
  },
  challengeDesc: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  challengeProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
  },
  challengeStats: {
    alignItems: 'center',
  },
  challengeStatValue: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.bold,
    color: Colors.textPrimary,
  },
  challengeStatLabel: {
    fontSize: 9,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
  },
  achievementsSection: {
    gap: Spacing[3],
  },
  sectionTitle: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.bold,
    color: Colors.textPrimary,
  },
  sectionSubtitle: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    marginTop: -Spacing[2],
  },
  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing[3],
  },
  achievement: {
    width: '46%',
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.xl,
    padding: Spacing[4],
    alignItems: 'center',
    gap: Spacing[2],
    ...(Shadows.sm as object),
  },
  achievementLocked: {
    opacity: 0.5,
  },
  achievementEmoji: {
    fontSize: 32,
  },
  achievementTitle: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.bold,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  achievementTitleLocked: {
    color: Colors.textSecondary,
  },
  achievementDesc: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  plansSection: {
    gap: Spacing[3],
  },
  planCard: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    ...(Shadows.base as object),
  },
  planColorBar: {
    width: 5,
    flexShrink: 0,
  },
  planContent: {
    flex: 1,
    padding: Spacing[4],
    gap: Spacing[2],
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  enrolledChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  enrolledText: {
    fontSize: 10,
    color: Colors.textSecondary,
  },
  planTitle: {
    fontSize: FontSizes.base,
    fontWeight: FontWeights.bold,
    color: Colors.textPrimary,
  },
  planDesc: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  planProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
  },
  planProgressText: {
    fontSize: FontSizes.xs,
    color: Colors.primary,
    fontWeight: FontWeights.medium,
    minWidth: 70,
  },
  planFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing[1],
  },
  planDuration: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
  },
  planBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing[2],
    paddingHorizontal: Spacing[4],
    borderRadius: BorderRadius.full,
  },
  planBtnContinue: {
    backgroundColor: Colors.light,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  planBtnText: {
    fontSize: FontSizes.xs,
    fontWeight: FontWeights.semibold,
    color: Colors.white,
  },
  planBtnTextContinue: {
    color: Colors.primary,
  },
});
