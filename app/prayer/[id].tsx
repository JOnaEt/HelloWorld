import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { FontSizes, FontWeights } from '../../constants/fonts';
import { Spacing, BorderRadius, Shadows } from '../../constants/layout';
import { Avatar } from '../../components/ui/Avatar';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { LoadingScreen } from '../../components/common/LoadingScreen';
import { usePrayer } from '../../hooks/usePrayer';
import { useAuth } from '../../hooks/useAuth';
import { formatRelativeTime, formatDate } from '../../utils/date';
import { getCategoryLabel } from '../../utils/format';

export default function PrayerDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const {
    currentPrayer: prayer,
    isDetailLoading,
    fetchPrayerDetail,
    prayFor,
    hasPrayed,
    markAnswered,
  } = usePrayer();

  useEffect(() => {
    if (id) fetchPrayerDetail(id);
  }, [id]);

  const handleMarkAnswered = () => {
    if (!prayer) return;
    Alert.alert(
      'Mark as Answered',
      'Praise God! Mark this prayer as answered?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Yes, Answered!', onPress: () => markAnswered(prayer.id) },
      ]
    );
  };

  if (isDetailLoading) {
    return <LoadingScreen message="Loading prayer..." />;
  }

  if (!prayer) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.center}>
          <Text style={styles.notFoundText}>Prayer not found</Text>
        </View>
      </View>
    );
  }

  const isOwner = prayer.userId === user?.uid;
  const displayName = prayer.isAnonymous ? 'Anonymous' : (prayer.userProfile?.displayName ?? 'Member');
  const isPrayed = hasPrayed(prayer.id);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Prayer Request</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Status Banner */}
        {prayer.status === 'answered' && (
          <View style={styles.answeredBanner}>
            <Ionicons name="checkmark-circle" size={24} color={Colors.success} />
            <View>
              <Text style={styles.answeredTitle}>Prayer Answered!</Text>
              {prayer.answeredNote && (
                <Text style={styles.answeredNote}>{prayer.answeredNote}</Text>
              )}
              <Text style={styles.answeredDate}>
                {prayer.answeredAt ? formatDate(prayer.answeredAt as string) : ''}
              </Text>
            </View>
          </View>
        )}

        {/* Request Card */}
        <View style={styles.card}>
          {/* User info */}
          <View style={styles.userRow}>
            <Avatar
              uri={prayer.isAnonymous ? undefined : prayer.userProfile?.photoURL}
              name={displayName}
              size="lg"
            />
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{displayName}</Text>
              <Text style={styles.userTime}>
                {formatRelativeTime(prayer.createdAt as string)}
              </Text>
              <Badge
                label={getCategoryLabel(prayer.category)}
                variant="primary"
                size="sm"
                style={{ marginTop: 4 }}
              />
            </View>
          </View>

          {/* Title */}
          <Text style={styles.title}>{prayer.title}</Text>

          {/* Content */}
          <Text style={styles.content}>{prayer.content}</Text>

          {/* Stats */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Ionicons name="hand-right-outline" size={16} color={Colors.primary} />
              <Text style={styles.statValue}>{prayer.prayerCount}</Text>
              <Text style={styles.statLabel}>Praying</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.statItem}>
              <Ionicons name="calendar-outline" size={16} color={Colors.textSecondary} />
              <Text style={styles.statValue}>
                {Math.ceil((Date.now() - new Date(prayer.createdAt as string).getTime()) / (1000 * 60 * 60 * 24))}
              </Text>
              <Text style={styles.statLabel}>Days ago</Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          {prayer.status !== 'answered' && (
            <Button
              title={isPrayed ? 'Praying for You' : 'Pray for This'}
              onPress={() => !isPrayed && prayFor(prayer.id)}
              variant={isPrayed ? 'secondary' : 'primary'}
              fullWidth
              icon={<Ionicons name="hand-right" size={18} color={isPrayed ? Colors.primary : Colors.white} />}
            />
          )}

          {isOwner && prayer.status !== 'answered' && (
            <Button
              title="Mark as Answered"
              onPress={handleMarkAnswered}
              variant="outline"
              fullWidth
              icon={<Ionicons name="checkmark-circle-outline" size={18} color={Colors.primary} />}
            />
          )}
        </View>

        {/* Encouragement */}
        <View style={styles.encouragement}>
          <Ionicons name="heart-outline" size={20} color={Colors.primary} />
          <Text style={styles.encouragementText}>
            {prayer.prayerCount > 0
              ? `${prayer.prayerCount} ${prayer.prayerCount === 1 ? 'person has' : 'people have'} prayed for this request.`
              : 'Be the first to pray for this request.'}
          </Text>
        </View>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing[5],
    paddingVertical: Spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.white,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.bold,
    color: Colors.textPrimary,
  },
  scrollContent: {
    padding: Spacing[5],
    paddingBottom: Spacing['3xl'],
    gap: Spacing[4],
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notFoundText: {
    fontSize: FontSizes.base,
    color: Colors.textSecondary,
  },
  answeredBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing[3],
    backgroundColor: '#DCFCE7',
    borderRadius: BorderRadius.xl,
    padding: Spacing[4],
    borderWidth: 1,
    borderColor: '#86EFAC',
  },
  answeredTitle: {
    fontSize: FontSizes.base,
    fontWeight: FontWeights.bold,
    color: '#15803D',
  },
  answeredNote: {
    fontSize: FontSizes.sm,
    color: '#166534',
    marginTop: 2,
  },
  answeredDate: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius['2xl'],
    padding: Spacing[5],
    gap: Spacing[4],
    ...(Shadows.base as object),
  },
  userRow: {
    flexDirection: 'row',
    gap: Spacing[4],
    alignItems: 'flex-start',
  },
  userInfo: {
    flex: 1,
    gap: 2,
  },
  userName: {
    fontSize: FontSizes.base,
    fontWeight: FontWeights.bold,
    color: Colors.textPrimary,
  },
  userTime: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
  },
  title: {
    fontSize: FontSizes.xl,
    fontWeight: FontWeights.bold,
    color: Colors.textPrimary,
    lineHeight: 28,
  },
  content: {
    fontSize: FontSizes.base,
    color: Colors.textPrimary,
    lineHeight: 26,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingTop: Spacing[3],
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  statItem: {
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  statValue: {
    fontSize: FontSizes.xl,
    fontWeight: FontWeights.bold,
    color: Colors.textPrimary,
  },
  statLabel: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
  },
  divider: {
    width: 1,
    height: 40,
    backgroundColor: Colors.border,
  },
  actions: {
    gap: Spacing[3],
  },
  encouragement: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
    backgroundColor: Colors.light,
    borderRadius: BorderRadius.xl,
    padding: Spacing[4],
  },
  encouragementText: {
    flex: 1,
    fontSize: FontSizes.sm,
    color: Colors.textPrimary,
    lineHeight: 20,
  },
});
