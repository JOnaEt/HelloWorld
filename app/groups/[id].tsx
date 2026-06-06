import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
  Alert,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { FontSizes, FontWeights } from '../../constants/fonts';
import { Spacing, BorderRadius, Shadows } from '../../constants/layout';
import { Badge } from '../../components/ui/Badge';
import { Avatar, AvatarGroup } from '../../components/ui/Avatar';
import { Button } from '../../components/ui/Button';
import { MemberItem } from '../../components/groups/MemberItem';
import { LoadingScreen } from '../../components/common/LoadingScreen';
import { useGroups } from '../../hooks/useGroups';
import { useAuth } from '../../hooks/useAuth';
import { getCategoryLabel } from '../../utils/format';

export default function GroupDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const {
    currentGroup: group,
    currentGroupMembers: members,
    isDetailLoading,
    fetchGroupDetail,
    join,
    leave,
    isJoined,
  } = useGroups();
  const [activeTab, setActiveTab] = useState<'about' | 'members' | 'prayer'>('about');
  const [isJoining, setIsJoining] = useState(false);

  useEffect(() => {
    if (id) fetchGroupDetail(id);
  }, [id]);

  const handleJoin = async () => {
    if (!group) return;
    setIsJoining(true);
    try {
      await join(group.id);
    } catch {
      Alert.alert('Error', 'Failed to join group. Please try again.');
    } finally {
      setIsJoining(false);
    }
  };

  const handleLeave = () => {
    if (!group) return;
    Alert.alert(
      'Leave Group',
      `Are you sure you want to leave "${group.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Leave', style: 'destructive', onPress: () => leave(group.id) },
      ]
    );
  };

  if (isDetailLoading) {
    return <LoadingScreen message="Loading group..." />;
  }

  if (!group) {
    return (
      <View style={styles.container}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtnAbsolute}>
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.center}>
          <Text>Group not found</Text>
        </View>
      </View>
    );
  }

  const joined = isJoined(group.id);
  const isLeader = group.leaderId === user?.uid;
  const memberAvatars = members.slice(0, 5).map((m) => ({
    uri: m.profile?.photoURL,
    name: m.profile?.displayName ?? '?',
  }));

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <ImageBackground
          source={group.coverUrl ? { uri: group.coverUrl } : require('../../assets/placeholder.png')}
          style={styles.headerBg}
        >
          <LinearGradient
            colors={['rgba(0,0,0,0.3)', 'rgba(15,23,42,0.9)']}
            style={styles.headerGradient}
          >
            <View style={[styles.headerTop, { paddingTop: insets.top + 8 }]}>
              <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
                <Ionicons name="arrow-back" size={22} color={Colors.white} />
              </TouchableOpacity>
              {isLeader && (
                <TouchableOpacity
                  onPress={() => router.push('/groups/manage')}
                  style={styles.headerBtn}
                >
                  <Ionicons name="settings-outline" size={22} color={Colors.white} />
                </TouchableOpacity>
              )}
            </View>
            <View style={styles.headerContent}>
              <View style={styles.badgeRow}>
                <Badge label={getCategoryLabel(group.category)} variant="primary" />
                {group.isOnline && <Badge label="Online" variant="info" size="sm" />}
                {group.isPrivate && <Badge label="Private" variant="gray" size="sm" />}
              </View>
              <Text style={styles.groupName}>{group.name}</Text>
              <View style={styles.memberRow}>
                <AvatarGroup avatars={memberAvatars} size="xs" />
                <Text style={styles.memberCount}>
                  {group.memberCount} members
                  {group.maxMembers ? ` · ${group.maxMembers - group.memberCount} spots left` : ''}
                </Text>
              </View>
            </View>
          </LinearGradient>
        </ImageBackground>

        {/* Leader */}
        <View style={styles.leaderSection}>
          <View style={styles.leaderInfo}>
            <Avatar name={group.leader.name} size="md" />
            <View>
              <Text style={styles.leaderLabel}>Group Leader</Text>
              <Text style={styles.leaderName}>{group.leader.name}</Text>
              {group.leader.title && (
                <Text style={styles.leaderTitle}>{group.leader.title}</Text>
              )}
            </View>
          </View>

          {/* Join/Leave Button */}
          {!isLeader && (
            joined ? (
              <Button
                title="Leave Group"
                onPress={handleLeave}
                variant="outline"
                size="sm"
              />
            ) : (
              <Button
                title="Join Group"
                onPress={handleJoin}
                isLoading={isJoining}
                size="sm"
              />
            )
          )}
          {isLeader && (
            <Badge label="You're the Leader" variant="primary" />
          )}
        </View>

        {/* Meeting Info */}
        <View style={styles.meetingCard}>
          <View style={styles.meetingRow}>
            <View style={styles.meetingItem}>
              <Ionicons name="calendar-outline" size={18} color={Colors.primary} />
              <View>
                <Text style={styles.meetingLabel}>Schedule</Text>
                <Text style={styles.meetingValue}>
                  {group.meetingSchedule.dayOfWeek ?? 'Flexible'} · {group.meetingSchedule.time}
                </Text>
              </View>
            </View>
            <View style={styles.meetingItem}>
              <Ionicons name={group.isOnline ? 'videocam-outline' : 'location-outline'} size={18} color={Colors.primary} />
              <View>
                <Text style={styles.meetingLabel}>Location</Text>
                <Text style={styles.meetingValue} numberOfLines={1}>
                  {group.isOnline ? 'Online Meeting' : (group.location ?? 'TBD')}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabs}>
          {(['about', 'members', 'prayer'] as const).map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.tabActive]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Tab Content */}
        {activeTab === 'about' && (
          <View style={styles.tabContent}>
            <Text style={styles.descTitle}>About this Group</Text>
            <Text style={styles.descText}>{group.description}</Text>
            {group.tags.length > 0 && (
              <View style={styles.tagsRow}>
                {group.tags.map((tag, i) => (
                  <View key={i} style={styles.tagChip}>
                    <Text style={styles.tagText}>#{tag}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {activeTab === 'members' && (
          <View style={styles.tabContent}>
            <Text style={styles.membersCount}>{members.length} Members</Text>
            {members.map((m) => (
              <MemberItem
                key={m.id}
                member={m}
                isCurrentUser={m.userId === user?.uid}
              />
            ))}
          </View>
        )}

        {activeTab === 'prayer' && (
          <View style={styles.tabContent}>
            <Text style={styles.emptyTabText}>Group prayer requests coming soon</Text>
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
  scrollContent: {
    paddingBottom: Spacing['3xl'],
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backBtnAbsolute: {
    position: 'absolute',
    top: 50,
    left: Spacing[5],
    zIndex: 10,
  },
  headerBg: {
    height: 260,
  },
  headerGradient: {
    flex: 1,
    justifyContent: 'space-between',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing[5],
  },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerContent: {
    padding: Spacing[5],
    gap: Spacing[2],
  },
  badgeRow: {
    flexDirection: 'row',
    gap: Spacing[2],
  },
  groupName: {
    fontSize: FontSizes['2xl'],
    fontWeight: FontWeights.black,
    color: Colors.white,
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
  },
  memberCount: {
    fontSize: FontSizes.sm,
    color: 'rgba(255,255,255,0.8)',
  },
  leaderSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing[5],
    paddingVertical: Spacing[4],
    backgroundColor: Colors.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  leaderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
  },
  leaderLabel: {
    fontSize: FontSizes.xs,
    color: Colors.primary,
    fontWeight: FontWeights.semibold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  leaderName: {
    fontSize: FontSizes.base,
    fontWeight: FontWeights.bold,
    color: Colors.textPrimary,
  },
  leaderTitle: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
  },
  meetingCard: {
    marginHorizontal: Spacing[5],
    marginTop: Spacing[4],
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.xl,
    padding: Spacing[4],
    ...(Shadows.sm as object),
  },
  meetingRow: {
    flexDirection: 'row',
    gap: Spacing[4],
  },
  meetingItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
  },
  meetingLabel: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
  },
  meetingValue: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.semibold,
    color: Colors.textPrimary,
  },
  tabs: {
    flexDirection: 'row',
    marginHorizontal: Spacing[5],
    marginTop: Spacing[4],
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
  tabContent: {
    padding: Spacing[5],
    gap: Spacing[3],
  },
  descTitle: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.bold,
    color: Colors.textPrimary,
  },
  descText: {
    fontSize: FontSizes.base,
    color: Colors.textSecondary,
    lineHeight: 24,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing[2],
  },
  tagChip: {
    backgroundColor: Colors.gray100,
    borderRadius: BorderRadius.full,
    paddingVertical: 4,
    paddingHorizontal: Spacing[3],
  },
  tagText: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
  },
  membersCount: {
    fontSize: FontSizes.base,
    fontWeight: FontWeights.semibold,
    color: Colors.textSecondary,
  },
  emptyTabText: {
    fontSize: FontSizes.base,
    color: Colors.textSecondary,
    textAlign: 'center',
    paddingVertical: Spacing[8],
  },
});
