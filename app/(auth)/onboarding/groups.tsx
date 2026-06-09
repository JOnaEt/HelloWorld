import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../constants/colors';
import { FontSizes, FontWeights } from '../../../constants/fonts';
import { BorderRadius, Spacing, Shadows } from '../../../constants/layout';
import { Button } from '../../../components/ui/Button';
import { useAuth } from '../../../hooks/useAuth';
import { useGroups } from '../../../hooks/useGroups';
import { getCategoryLabel } from '../../../utils/format';

export default function GroupsOnboardingScreen() {
  const { finishOnboarding, isLoading } = useAuth();
  const { groups, isGroupsLoading, fetchAllGroups, join } = useGroups();
  const [joining, setJoining] = useState<string | null>(null);
  const [joinedIds, setJoinedIds] = useState<string[]>([]);

  useEffect(() => {
    fetchAllGroups();
  }, []);

  const handleJoin = async (groupId: string) => {
    setJoining(groupId);
    try {
      await join(groupId);
      setJoinedIds((prev) => [...prev, groupId]);
    } catch {
      // Error handled in hook
    } finally {
      setJoining(null);
    }
  };

  const featuredGroups = groups.slice(0, 6);

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <LinearGradient
        colors={['#166534', '#16A34A']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: '100%' }]} />
        </View>
        <Text style={styles.step}>Step 3 of 3</Text>
        <Text style={styles.title}>Find Your Community</Text>
        <Text style={styles.subtitle}>
          Join a group to grow together. You can always join more later.
        </Text>
      </LinearGradient>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {isGroupsLoading ? (
          <View style={styles.loader}>
            <ActivityIndicator color={Colors.primary} />
          </View>
        ) : (
          featuredGroups.map((group) => {
            const isJoined = joinedIds.includes(group.id);
            const isJoining = joining === group.id;
            return (
              <View key={group.id} style={styles.groupCard}>
                <View style={[styles.groupIconBox, { backgroundColor: Colors.light }]}>
                  <Ionicons name="people" size={24} color={Colors.primary} />
                </View>
                <View style={styles.groupInfo}>
                  <Text style={styles.groupName}>{group.name}</Text>
                  <Text style={styles.groupCategory}>
                    {getCategoryLabel(group.category)} · {group.memberCount} members
                  </Text>
                  <Text style={styles.groupDesc} numberOfLines={2}>{group.description}</Text>
                </View>
                <TouchableOpacity
                  style={[styles.joinBtn, isJoined && styles.joinBtnJoined]}
                  onPress={() => !isJoined && handleJoin(group.id)}
                  disabled={isJoined || isJoining}
                >
                  {isJoining ? (
                    <ActivityIndicator size="small" color={Colors.white} />
                  ) : isJoined ? (
                    <Ionicons name="checkmark" size={18} color={Colors.primary} />
                  ) : (
                    <Text style={styles.joinBtnText}>Join</Text>
                  )}
                </TouchableOpacity>
              </View>
            );
          })
        )}

        {!isGroupsLoading && joinedIds.length > 0 && (
          <View style={styles.joinedSummary}>
            <Ionicons name="checkmark-circle" size={18} color={Colors.primary} />
            <Text style={styles.joinedSummaryText}>
              You joined {joinedIds.length} group{joinedIds.length !== 1 ? 's' : ''}
            </Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title={joinedIds.length === 0 ? 'Skip for now' : "Let's Go!"}
          onPress={finishOnboarding}
          isLoading={isLoading}
          fullWidth
          size="lg"
          variant={joinedIds.length === 0 ? 'ghost' : 'primary'}
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
    gap: Spacing[3],
  },
  loader: {
    padding: Spacing[10],
    alignItems: 'center',
  },
  groupCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.xl,
    padding: Spacing[4],
    ...(Shadows.sm as object),
  },
  groupIconBox: {
    width: 52,
    height: 52,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  groupInfo: {
    flex: 1,
    gap: 2,
  },
  groupName: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.bold,
    color: Colors.textPrimary,
  },
  groupCategory: {
    fontSize: FontSizes.xs,
    color: Colors.primary,
    fontWeight: FontWeights.medium,
  },
  groupDesc: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
    lineHeight: 16,
  },
  joinBtn: {
    paddingVertical: Spacing[2],
    paddingHorizontal: Spacing[4],
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.full,
    minWidth: 56,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  joinBtnJoined: {
    backgroundColor: Colors.light,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  joinBtnText: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.semibold,
    color: Colors.white,
  },
  joinedSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
    justifyContent: 'center',
    padding: Spacing[3],
  },
  joinedSummaryText: {
    fontSize: FontSizes.sm,
    color: Colors.primary,
    fontWeight: FontWeights.medium,
  },
  footer: {
    padding: Spacing[5],
    paddingBottom: Spacing[8],
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
});
