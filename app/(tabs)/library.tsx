import React, { useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { FontSizes, FontWeights } from '../../constants/fonts';
import { Spacing, BorderRadius, Shadows } from '../../constants/layout';
import { DevotionalCard } from '../../components/devotional/DevotionalCard';
import { EmptyState } from '../../components/common/EmptyState';
import { LoadingScreen } from '../../components/common/LoadingScreen';
import { useDevotional } from '../../hooks/useDevotional';
import { DevotionalCategory } from '../../types';
import { getCategoryLabel } from '../../utils/format';

const CATEGORIES: Array<{ value: DevotionalCategory | 'all'; label: string; emoji: string }> = [
  { value: 'all', label: 'All', emoji: '✨' },
  { value: 'faith', label: 'Faith', emoji: '✝️' },
  { value: 'prayer', label: 'Prayer', emoji: '🙏' },
  { value: 'worship', label: 'Worship', emoji: '🎵' },
  { value: 'leadership', label: 'Leadership', emoji: '👑' },
  { value: 'family', label: 'Family', emoji: '👨‍👩‍👧' },
  { value: 'evangelism', label: 'Evangelism', emoji: '🌍' },
  { value: 'healing', label: 'Healing', emoji: '💚' },
  { value: 'prophetic', label: 'Prophetic', emoji: '⚡' },
  { value: 'discipleship', label: 'Discipleship', emoji: '📖' },
  { value: 'missions', label: 'Missions', emoji: '✈️' },
];

export default function LibraryScreen() {
  const insets = useSafeAreaInsets();
  const {
    filteredDevotionals,
    trendingDevotionals,
    selectedCategory,
    searchQuery,
    isLibraryLoading,
    fetchLibrary,
    fetchTrending,
    filterByCategory,
    search,
  } = useDevotional();

  const [localSearch, setLocalSearch] = React.useState('');

  useEffect(() => {
    fetchLibrary();
    fetchTrending();
  }, []);

  const handleSearch = useCallback(
    (text: string) => {
      setLocalSearch(text);
      const timer = setTimeout(() => search(text), 300);
      return () => clearTimeout(timer);
    },
    [search]
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Library</Text>
        <Text style={styles.headerSubtitle}>Explore devotionals & teachings</Text>
        {/* Search bar */}
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={18} color={Colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search devotionals..."
            placeholderTextColor={Colors.gray400}
            value={localSearch}
            onChangeText={handleSearch}
            returnKeyType="search"
            accessibilityLabel="Search devotionals"
          />
          {localSearch.length > 0 && (
            <TouchableOpacity
              onPress={() => {
                setLocalSearch('');
                search('');
              }}
            >
              <Ionicons name="close-circle" size={16} color={Colors.gray400} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Category filters */}
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
                <Text style={[styles.categoryLabel, isActive && styles.categoryLabelActive]}>
                  {cat.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Trending */}
        {!localSearch && trendingDevotionals.length > 0 && selectedCategory === 'all' && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Trending</Text>
              <View style={styles.trendingBadge}>
                <Ionicons name="flame-outline" size={12} color={Colors.warning} />
                <Text style={styles.trendingBadgeText}>Popular</Text>
              </View>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalList}>
              {trendingDevotionals.map((d) => (
                <DevotionalCard key={d.id} devotional={d} variant="default" style={{ width: 180 }} />
              ))}
            </ScrollView>
          </View>
        )}

        {/* All / Filtered devotionals */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {localSearch ? `Results for "${localSearch}"` : selectedCategory === 'all' ? 'All Devotionals' : getCategoryLabel(selectedCategory)}
            </Text>
            {!isLibraryLoading && (
              <Text style={styles.countText}>{filteredDevotionals.length} items</Text>
            )}
          </View>

          {isLibraryLoading ? (
            <LoadingScreen fullScreen={false} message="Loading..." />
          ) : filteredDevotionals.length === 0 ? (
            <EmptyState
              icon="search-outline"
              title="No devotionals found"
              description={localSearch ? `No results for "${localSearch}"` : 'Try a different category'}
              actionLabel="Clear filter"
              onAction={() => {
                setLocalSearch('');
                filterByCategory('all');
              }}
            />
          ) : (
            <View style={styles.gridContainer}>
              {filteredDevotionals.map((d) => (
                <DevotionalCard
                  key={d.id}
                  devotional={d}
                  variant="horizontal"
                  style={styles.listItem}
                />
              ))}
            </View>
          )}
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
    paddingHorizontal: Spacing[5],
    paddingBottom: Spacing[3],
    paddingTop: Spacing[2],
    gap: Spacing[1],
    backgroundColor: Colors.background,
  },
  headerTitle: {
    fontSize: FontSizes['2xl'],
    fontWeight: FontWeights.black,
    color: Colors.textPrimary,
  },
  headerSubtitle: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.xl,
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[3],
    marginTop: Spacing[3],
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
    gap: Spacing[2],
    paddingHorizontal: Spacing[5],
    paddingVertical: Spacing[3],
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
  categoryEmoji: {
    fontSize: 14,
  },
  categoryLabel: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.medium,
    color: Colors.textSecondary,
  },
  categoryLabelActive: {
    color: Colors.primary,
    fontWeight: FontWeights.semibold,
  },
  section: {
    paddingHorizontal: Spacing[5],
    marginBottom: Spacing[5],
    gap: Spacing[3],
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.bold,
    color: Colors.textPrimary,
  },
  trendingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: Spacing[2],
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  trendingBadgeText: {
    fontSize: 10,
    fontWeight: FontWeights.semibold,
    color: '#92400E',
  },
  countText: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
  },
  horizontalList: {
    gap: Spacing[3],
  },
  gridContainer: {
    gap: Spacing[3],
  },
  listItem: {
    width: '100%',
  },
});
