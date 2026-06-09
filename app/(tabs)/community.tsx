import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { FontSizes, FontWeights } from '../../constants/fonts';
import { Spacing, BorderRadius, Shadows } from '../../constants/layout';
import { GroupCard } from '../../components/groups/GroupCard';
import { PrayerCard } from '../../components/prayer/PrayerCard';
import { PrayerForm } from '../../components/prayer/PrayerForm';
import { EmptyState } from '../../components/common/EmptyState';
import { LoadingScreen } from '../../components/common/LoadingScreen';
import { useGroups } from '../../hooks/useGroups';
import { usePrayer } from '../../hooks/usePrayer';

type CommunityTab = 'groups' | 'prayer';

export default function CommunityScreen() {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<CommunityTab>('groups');
  const [showPrayerForm, setShowPrayerForm] = useState(false);

  const { groups, isGroupsLoading, fetchAllGroups, fetchMyGroups, join, isJoined } = useGroups();
  const { prayers, isLoading: isPrayerLoading, fetchPublicPrayers, submitPrayer, prayFor, hasPrayed, isSubmitting, submitError } = usePrayer();

  useEffect(() => {
    fetchAllGroups();
    fetchMyGroups();
    fetchPublicPrayers();
  }, []);

  const handleSubmitPrayer = async (
    title: string,
    content: string,
    category: any,
    isAnonymous: boolean,
    isPublic: boolean
  ) => {
    const id = await submitPrayer(title, content, category, isAnonymous, isPublic);
    if (id) {
      setShowPrayerForm(false);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Community</Text>
        <Text style={styles.headerSubtitle}>Connect, grow, and pray together</Text>

        {/* Tab Switcher */}
        <View style={styles.tabRow}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'groups' && styles.tabActive]}
            onPress={() => setActiveTab('groups')}
          >
            <Ionicons
              name="people-outline"
              size={16}
              color={activeTab === 'groups' ? Colors.white : Colors.textSecondary}
            />
            <Text style={[styles.tabText, activeTab === 'groups' && styles.tabTextActive]}>
              Groups
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'prayer' && styles.tabActive]}
            onPress={() => setActiveTab('prayer')}
          >
            <Ionicons
              name="hand-right-outline"
              size={16}
              color={activeTab === 'prayer' ? Colors.white : Colors.textSecondary}
            />
            <Text style={[styles.tabText, activeTab === 'prayer' && styles.tabTextActive]}>
              Prayer Wall
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {activeTab === 'groups' ? (
          <>
            {/* Featured Groups */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Featured Groups</Text>
                <TouchableOpacity onPress={() => router.push('/groups/')}>
                  <Text style={styles.viewAll}>View All</Text>
                </TouchableOpacity>
              </View>
              {isGroupsLoading ? (
                <LoadingScreen fullScreen={false} />
              ) : groups.length === 0 ? (
                <EmptyState
                  icon="people-outline"
                  title="No groups available"
                  description="Check back soon for new groups"
                />
              ) : (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalList}>
                  {groups.slice(0, 5).map((g) => (
                    <GroupCard
                      key={g.id}
                      group={g}
                      isJoined={isJoined(g.id)}
                      onJoin={() => join(g.id)}
                      style={{ width: 200 }}
                    />
                  ))}
                </ScrollView>
              )}
            </View>

            {/* All Groups List */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>All Groups</Text>
              {groups.map((g) => (
                <GroupCard
                  key={g.id}
                  group={g}
                  isJoined={isJoined(g.id)}
                  variant="compact"
                  onJoin={() => join(g.id)}
                />
              ))}
              {groups.length === 0 && !isGroupsLoading && (
                <EmptyState icon="people-outline" title="No groups yet" />
              )}
            </View>
          </>
        ) : (
          /* Prayer Wall */
          <>
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Prayer Wall</Text>
                <Text style={styles.prayerCount}>{prayers.length} requests</Text>
              </View>

              {isPrayerLoading ? (
                <LoadingScreen fullScreen={false} />
              ) : prayers.length === 0 ? (
                <EmptyState
                  icon="hand-right-outline"
                  title="No prayer requests yet"
                  description="Be the first to share a prayer request"
                  actionLabel="Submit Prayer"
                  onAction={() => setShowPrayerForm(true)}
                />
              ) : (
                prayers.map((prayer) => (
                  <PrayerCard
                    key={prayer.id}
                    prayer={prayer}
                    onPray={() => prayFor(prayer.id)}
                    hasPrayed={hasPrayed(prayer.id)}
                  />
                ))
              )}
            </View>
          </>
        )}
      </ScrollView>

      {/* FAB for prayer */}
      {activeTab === 'prayer' && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => setShowPrayerForm(true)}
          accessibilityLabel="Submit prayer request"
        >
          <Ionicons name="add" size={28} color={Colors.white} />
        </TouchableOpacity>
      )}

      {/* Prayer Form Modal */}
      <Modal
        visible={showPrayerForm}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Share Your Prayer</Text>
            <TouchableOpacity onPress={() => setShowPrayerForm(false)}>
              <Ionicons name="close" size={24} color={Colors.textPrimary} />
            </TouchableOpacity>
          </View>
          <PrayerForm
            onSubmit={handleSubmitPrayer}
            isLoading={isSubmitting}
            error={submitError}
            onCancel={() => setShowPrayerForm(false)}
          />
        </View>
      </Modal>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing[2],
    paddingVertical: Spacing[2],
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
    paddingBottom: Spacing['2xl'],
    gap: Spacing[2],
  },
  section: {
    paddingHorizontal: Spacing[5],
    gap: Spacing[3],
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.bold,
    color: Colors.textPrimary,
  },
  viewAll: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.semibold,
    color: Colors.primary,
  },
  prayerCount: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
  },
  horizontalList: {
    gap: Spacing[3],
  },
  fab: {
    position: 'absolute',
    bottom: Spacing[6],
    right: Spacing[5],
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...(Shadows.primary as object),
  },
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing[5],
    paddingVertical: Spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.white,
  },
  modalTitle: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.bold,
    color: Colors.textPrimary,
  },
});
