import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

import { Colors } from '../../constants/colors';
import { FontSizes, FontWeights } from '../../constants/fonts';
import { BorderRadius, Shadows, Spacing } from '../../constants/layout';
import { GroupCard } from '../../components/groups/GroupCard';
import { EmptyState } from '../../components/common/EmptyState';
import { GroupCardSkeleton } from '../../components/ui/SkeletonLoader';
import { useGroups } from '../../hooks/useGroups';
import { GroupCategory } from '../../types';
import { getCategoryLabel } from '../../utils/format';

const CATEGORIES: Array<{ value: GroupCategory | 'all'; label: string; emoji: string }> = [
  { value: 'all', label: 'All Groups', emoji: '✨' },
  { value: 'bible-study', label: 'Bible Study', emoji: '📖' },
  { value: 'prayer', label: 'Prayer', emoji: '🙏' },
  { value: 'youth', label: 'Youth', emoji: '🌱' },
  { value: 'women', label: 'Women', emoji: '👑' },
  { value: 'men', label: 'Men', emoji: '⚔️' },
  { value: 'couples', label: 'Couples', emoji: '💑' },
  { value: 'worship', label: 'Worship', emoji: '🎵' },
  { value: 'outreach', label: 'Outreach', emoji: '🌍' },
];

export default function GroupsIndexScreen() {
  const insets = useSafeAreaInsets();
  const [localSearch, setLocalSearch] = useState('');

  const {
    groups,
    filteredGroups,
    featuredGroups,
    isGroupsLoading,
    selectedCategory,
    joinedGroupIds,
    fetchAllGroups,
    fetchFeaturedGroups,
    filterByCategory,
    searchGroups,
    join,
    isJoined,
  } = useGroups();

  useEffect(() => {
    fetchAllGroups();
    fetchFeaturedGroups();
  }, []);

  const handleSearch = useCallback(
    (text: string) => {
      setLocalSearch(text);
      const timer = setTimeout(() => searchGroups(text), 300);
      return () => clearTimeout(timer);
    },
    [searchGroups]
  );

  const displayGroups = localSearch ? filteredGroups : filteredGroups;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar style="dark" />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <Animated.View entering={FadeInDown.duration(400)} style={styles.header}>
          <View style={styles.headerTop}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
            </TouchableOpacity>
            <View>
              <Text style={styles.headerTitle}>Small Groups</Text>
              <Text style={styles.headerSubtitle}>Find your community</Text>
            </View>
          </View>

          {/* Search */}
          <View style={styles.searchBar}>
            <Ionicons name="search-outline" size={18} color={Colors.textSecondary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search groups..."
              placeholderTextColor={Colors.gray400}
              value={localSearch}
              onChangeText={handleSearch}
            />
            {localSearch.length > 0 && (
              <TouchableOpacity
                onPress={() => {
                  setLocalSearch('');
                  searchGroups('');
                }}
              >
                <Ionicons name="close-circle" size={16} color={Colors.gray400} />
              </TouchableOpacity>
            )}
          </View>
        </Animated.View>

        {/* Categories */}
        <Animated.View entering={FadeInDown.delay(100).duration(400)}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesRow}
          >
            {CATEGORIES.map((cat) => {
              const isActive = selectedCategory === cat.value;
              return (
                <TouchableOpacity
                  key={cat.value}
                  style={[styles.categoryChip, isActive && styles.categoryChipActive]}
                  onPress={() => filterByCategory(cat.value)}
                >
                  <Text style={styles.categoryEmoji}>{cat.emoji}</Text>
                  <Text
                    style={[styles.categoryLabel, isActive && styles.categoryLabelActive]}
                  >
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </Animated.View>

        {/* Featured Groups Carousel */}
        {!localSearch && selectedCategory === 'all' && featuredGroups.length > 0 && (
          <Animated.View entering={FadeInDown.delay(150).duration(400)}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Featured</Text>
            </View>
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={featuredGroups}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.featuredList}
              renderItem={({ item }) => (
                <GroupCard
                  group={item}
                  variant="featured"
                  isJoined={isJoined(item.id)}
                  style={styles.featuredCard}
                  onJoin={() => join(item.id)}
                />
              )}
            />
          </Animated.View>
        )}

        {/* All Groups */}
        <Animated.View entering={FadeInDown.delay(200).duration(400)} style={styles.allGroups}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {localSearch ? `Results for "${localSearch}"` : 'All Groups'}
            </Text>
            {!isGroupsLoading && (
              <Text style={styles.countText}>{displayGroups.length} groups</Text>
            )}
          </View>

          {isGroupsLoading ? (
            <View style={styles.skeletonGrid}>
              {[0, 1, 2, 3].map((i) => (
                <GroupCardSkeleton key={i} style={styles.groupCardItem} />
              ))}
            </View>
          ) : displayGroups.length === 0 ? (
            <EmptyState
              icon="people-outline"
              title="No groups found"
              description="Try a different search term or category"
              actionLabel="Clear filter"
              onAction={() => {
                setLocalSearch('');
                filterByCategory('all');
              }}
            />
          ) : (
            <View style={styles.groupsGrid}>
              {displayGroups.map((group) => (
                <GroupCard
                  key={group.id}
                  group={group}
                  variant="default"
                  isJoined={isJoined(group.id)}
                  style={styles.groupCardItem}
                  onJoin={() => join(group.id)}
                />
              ))}
            </View>
          )}
        </Animated.View>

        <View style={{ height: 80 }} />
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
    paddingTop: Spacing[2],
    paddingBottom: Spacing[4],
    gap: Spacing[4],
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    ...(Shadows.sm as object),
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: FontWeights.extraBold,
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
    marginTop: 2,
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
    ...(Shadows.sm as object),
  },
  searchInput: {
    flex: 1,
    fontSize: FontSizes.base,
    color: Colors.textPrimary,
  },
  categoriesRow: {
    paddingHorizontal: Spacing[5],
    paddingVertical: Spacing[3],
    gap: Spacing[2],
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: Spacing[2],
    paddingHorizontal: Spacing[3],
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.card,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  categoryChipActive: {
    backgroundColor: Colors.light,
    borderColor: Colors.primary,
  },
  categoryEmoji: { fontSize: 14 },
  categoryLabel: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.medium,
    color: Colors.textSecondary,
  },
  categoryLabelActive: {
    color: Colors.primary,
    fontWeight: FontWeights.semibold,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing[5],
    marginBottom: Spacing[3],
  },
  sectionTitle: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.bold,
    color: Colors.textPrimary,
  },
  countText: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
  },
  featuredList: {
    paddingHorizontal: Spacing[5],
    paddingBottom: Spacing[2],
    gap: Spacing[3],
  },
  featuredCard: {
    width: 300,
  },
  allGroups: {
    marginTop: Spacing[4],
  },
  groupsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing[5],
    gap: Spacing[3],
    justifyContent: 'space-between',
  },
  skeletonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing[5],
    gap: Spacing[3],
  },
  groupCardItem: {
    width: '48%',
  },
});
