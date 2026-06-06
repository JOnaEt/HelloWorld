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
import { PrayerCard } from '../../components/prayer/PrayerCard';
import { PrayerForm } from '../../components/prayer/PrayerForm';
import { EmptyState } from '../../components/common/EmptyState';
import { LoadingScreen } from '../../components/common/LoadingScreen';
import { usePrayer } from '../../hooks/usePrayer';

type TabType = 'all' | 'answered' | 'mine';

export default function PrayerWallScreen() {
  const insets = useSafeAreaInsets();
  const [showForm, setShowForm] = useState(false);
  const [localSearch, setLocalSearch] = useState('');

  const {
    prayers,
    answeredPrayers,
    myPrayers,
    activeTab,
    isLoading,
    isSubmitting,
    submitError,
    filteredPrayers,
    fetchPublicPrayers,
    fetchAnsweredPrayers,
    fetchMyPrayers,
    submitPrayer,
    prayFor,
    hasPrayed,
    setActiveTab,
    setSearchQuery,
  } = usePrayer();

  useEffect(() => {
    fetchPublicPrayers();
    fetchAnsweredPrayers();
    fetchMyPrayers();
  }, []);

  const handleSearch = (text: string) => {
    setLocalSearch(text);
    setSearchQuery(text);
  };

  const handleSubmit = async (title: string, content: string, category: any, isAnon: boolean, isPublic: boolean) => {
    const id = await submitPrayer(title, content, category, isAnon, isPublic);
    if (id) setShowForm(false);
  };

  const tabs: Array<{ value: TabType; label: string; count: number }> = [
    { value: 'all', label: 'All Prayers', count: prayers.length },
    { value: 'answered', label: 'Answered', count: answeredPrayers.length },
    { value: 'mine', label: 'My Prayers', count: myPrayers.length },
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Prayer Wall</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Search */}
      <View style={styles.searchRow}>
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={18} color={Colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search prayers..."
            placeholderTextColor={Colors.gray400}
            value={localSearch}
            onChangeText={handleSearch}
          />
          {localSearch.length > 0 && (
            <TouchableOpacity onPress={() => { setLocalSearch(''); setSearchQuery(''); }}>
              <Ionicons name="close-circle" size={16} color={Colors.gray400} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsRow}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.value}
            style={[styles.tab, activeTab === tab.value && styles.tabActive]}
            onPress={() => setActiveTab(tab.value)}
          >
            <Text style={[styles.tabText, activeTab === tab.value && styles.tabTextActive]}>
              {tab.label}
            </Text>
            {tab.count > 0 && (
              <View style={[styles.tabBadge, activeTab === tab.value && styles.tabBadgeActive]}>
                <Text style={[styles.tabBadgeText, activeTab === tab.value && styles.tabBadgeTextActive]}>
                  {tab.count}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Prayer List */}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {isLoading ? (
          <LoadingScreen fullScreen={false} />
        ) : filteredPrayers.length === 0 ? (
          <EmptyState
            icon="hand-right-outline"
            title={
              activeTab === 'all' ? 'No prayer requests yet'
              : activeTab === 'answered' ? 'No answered prayers yet'
              : 'You haven\'t submitted any prayers yet'
            }
            description={
              activeTab === 'mine'
                ? 'Share your heart with the community'
                : 'Be the first to submit a prayer request'
            }
            actionLabel="Submit a Prayer"
            onAction={() => setShowForm(true)}
          />
        ) : (
          filteredPrayers.map((prayer) => (
            <PrayerCard
              key={prayer.id}
              prayer={prayer}
              onPray={() => prayFor(prayer.id)}
              hasPrayed={hasPrayed(prayer.id)}
            />
          ))
        )}
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setShowForm(true)}
        accessibilityLabel="Submit prayer request"
      >
        <Ionicons name="add" size={28} color={Colors.white} />
      </TouchableOpacity>

      {/* Prayer Form Modal */}
      <Modal visible={showForm} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Share Your Prayer</Text>
            <TouchableOpacity onPress={() => setShowForm(false)}>
              <Ionicons name="close" size={24} color={Colors.textPrimary} />
            </TouchableOpacity>
          </View>
          <PrayerForm
            onSubmit={handleSubmit}
            isLoading={isSubmitting}
            error={submitError}
            onCancel={() => setShowForm(false)}
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing[5],
    paddingVertical: Spacing[3],
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: FontSizes.xl,
    fontWeight: FontWeights.bold,
    color: Colors.textPrimary,
  },
  searchRow: {
    paddingHorizontal: Spacing[5],
    paddingBottom: Spacing[2],
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.xl,
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[3],
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchInput: {
    flex: 1,
    fontSize: FontSizes.base,
    color: Colors.textPrimary,
  },
  tabsRow: {
    gap: Spacing[2],
    paddingHorizontal: Spacing[5],
    paddingBottom: Spacing[3],
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
    paddingVertical: Spacing[2],
    paddingHorizontal: Spacing[4],
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.card,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  tabActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  tabText: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.semibold,
    color: Colors.textSecondary,
  },
  tabTextActive: {
    color: Colors.white,
  },
  tabBadge: {
    backgroundColor: Colors.gray200,
    borderRadius: BorderRadius.full,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  tabBadgeActive: {
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  tabBadgeText: {
    fontSize: 10,
    fontWeight: FontWeights.bold,
    color: Colors.textSecondary,
  },
  tabBadgeTextActive: {
    color: Colors.white,
  },
  scrollContent: {
    padding: Spacing[5],
    paddingBottom: Spacing['2xl'],
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
