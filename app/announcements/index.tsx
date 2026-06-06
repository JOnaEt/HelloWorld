import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Image,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../../constants/colors';
import { FontSizes, FontWeights } from '../../constants/fonts';
import { Spacing, BorderRadius, Shadows } from '../../constants/layout';
import { Announcement, AnnouncementType } from '../../types';
import {
  getAllAnnouncements,
  getAnnouncementsByType,
  markAnnouncementRead,
} from '../../services/firebase/announcements';
import { useAuthStore } from '../../store/authStore';

type FilterType = 'all' | AnnouncementType;

const FILTER_OPTIONS: Array<{ value: FilterType; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'event', label: 'Events' },
  { value: 'service', label: 'Services' },
  { value: 'news', label: 'News' },
  { value: 'alert', label: 'Alerts' },
  { value: 'giving', label: 'Programs' },
];

const TYPE_COLORS: Record<AnnouncementType, string> = {
  event: '#3B82F6',
  service: Colors.primary,
  news: '#8B5CF6',
  alert: '#EF4444',
  giving: '#F59E0B',
};

const TYPE_ICONS: Record<AnnouncementType, string> = {
  event: 'calendar-outline',
  service: 'church-outline',
  news: 'newspaper-outline',
  alert: 'alert-circle-outline',
  giving: 'heart-outline',
};

function formatDate(dateVal: Date | string): string {
  const d = typeof dateVal === 'string' ? new Date(dateVal) : dateVal;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function CategoryBadge({ type }: { type: AnnouncementType }) {
  return (
    <View style={[styles.badge, { backgroundColor: TYPE_COLORS[type] + '22' }]}>
      <Ionicons
        name={TYPE_ICONS[type] as React.ComponentProps<typeof Ionicons>['name']}
        size={11}
        color={TYPE_COLORS[type]}
      />
      <Text style={[styles.badgeText, { color: TYPE_COLORS[type] }]}>
        {type.charAt(0).toUpperCase() + type.slice(1)}
      </Text>
    </View>
  );
}

function FeaturedCard({ item }: { item: Announcement }) {
  return (
    <LinearGradient
      colors={['#15803D', '#166534', '#0F172A']}
      style={styles.featuredCard}
    >
      {item.imageUrl ? (
        <Image
          source={{ uri: item.imageUrl }}
          style={styles.featuredImage}
          resizeMode="cover"
        />
      ) : null}
      <View style={styles.featuredOverlay}>
        <View style={styles.featuredTop}>
          <CategoryBadge type={item.type} />
          <View style={styles.pinnedBadge}>
            <Ionicons name="pin" size={12} color={Colors.white} />
            <Text style={styles.pinnedText}>Pinned</Text>
          </View>
        </View>
        <Text style={styles.featuredTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.featuredExcerpt} numberOfLines={3}>
          {item.content}
        </Text>
        <View style={styles.featuredFooter}>
          <Text style={styles.featuredAuthor}>
            {item.author.name}
            {item.author.title ? ` · ${item.author.title}` : ''}
          </Text>
          <Text style={styles.featuredDate}>{formatDate(item.publishedAt)}</Text>
        </View>
      </View>
    </LinearGradient>
  );
}

interface AnnouncementCardProps {
  item: Announcement;
  isRead: boolean;
}

function AnnouncementCard({ item, isRead }: AnnouncementCardProps) {
  return (
    <View style={[styles.card, !isRead && styles.cardUnread]}>
      {!isRead && <View style={styles.unreadDot} />}
      <View style={styles.cardHeader}>
        <CategoryBadge type={item.type} />
        <Text style={styles.cardDate}>{formatDate(item.publishedAt)}</Text>
      </View>
      <Text style={[styles.cardTitle, !isRead && styles.cardTitleUnread]} numberOfLines={2}>
        {item.title}
      </Text>
      <Text style={styles.cardExcerpt} numberOfLines={3}>
        {item.content}
      </Text>
      <View style={styles.cardFooter}>
        <View style={styles.authorRow}>
          <View style={styles.avatarSmall}>
            <Text style={styles.avatarInitial}>
              {item.author.name.charAt(0).toUpperCase()}
            </Text>
          </View>
          <Text style={styles.cardAuthor}>{item.author.name}</Text>
        </View>
        {item.actionLabel && (
          <View style={styles.actionChip}>
            <Text style={styles.actionChipText}>{item.actionLabel}</Text>
            <Ionicons name="arrow-forward" size={11} color={Colors.primary} />
          </View>
        )}
      </View>
    </View>
  );
}

export default function AnnouncementsScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);

  const fetchAnnouncements = useCallback(async (filter: FilterType = activeFilter) => {
    try {
      setError(null);
      let data: Announcement[];
      if (filter === 'all') {
        data = await getAllAnnouncements(30);
      } else {
        data = await getAnnouncementsByType(filter);
      }
      setAnnouncements(data);
    } catch (err) {
      setError('Failed to load announcements. Please try again.');
    }
  }, [activeFilter]);

  useEffect(() => {
    setIsLoading(true);
    fetchAnnouncements().finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    if (!isLoading) {
      fetchAnnouncements(activeFilter);
    }
  }, [activeFilter]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await fetchAnnouncements(activeFilter);
    setIsRefreshing(false);
  }, [activeFilter, fetchAnnouncements]);

  const handleOpenAnnouncement = useCallback(async (item: Announcement) => {
    if (user && !readIds.has(item.id)) {
      setReadIds((prev) => new Set([...prev, item.id]));
      try {
        await markAnnouncementRead(item.id, user.uid);
      } catch {
        // non-critical
      }
    }
  }, [user, readIds]);

  const pinned = announcements.find((a) => a.isPinned);
  const listItems = announcements.filter((a) => !a.isPinned || a !== pinned);

  const renderItem = ({ item }: { item: Announcement }) => {
    const isRead =
      readIds.has(item.id) ||
      (user ? item.readByUserIds.includes(user.uid) : true);
    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => handleOpenAnnouncement(item)}
      >
        <AnnouncementCard item={item} isRead={isRead} />
      </TouchableOpacity>
    );
  };

  const renderHeader = () => (
    <View>
      {pinned && (
        <View style={styles.featuredSection}>
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => handleOpenAnnouncement(pinned)}
          >
            <FeaturedCard item={pinned} />
          </TouchableOpacity>
        </View>
      )}
      <FlatList
        data={FILTER_OPTIONS}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.value}
        contentContainerStyle={styles.filtersRow}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.filterChip,
              activeFilter === item.value && styles.filterChipActive,
            ]}
            onPress={() => setActiveFilter(item.value)}
          >
            <Text
              style={[
                styles.filterChipText,
                activeFilter === item.value && styles.filterChipTextActive,
              ]}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        )}
      />
      <Text style={styles.sectionLabel}>
        {listItems.length > 0
          ? `${listItems.length} Announcement${listItems.length !== 1 ? 's' : ''}`
          : ''}
      </Text>
    </View>
  );

  const renderEmpty = () => {
    if (isLoading) return null;
    if (error) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons name="cloud-offline-outline" size={48} color={Colors.gray400} />
          <Text style={styles.emptyTitle}>Could not load announcements</Text>
          <Text style={styles.emptyMessage}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => fetchAnnouncements()}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="megaphone-outline" size={48} color={Colors.gray300} />
        <Text style={styles.emptyTitle}>No announcements</Text>
        <Text style={styles.emptyMessage}>
          Check back soon for church news and updates.
        </Text>
      </View>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Announcements</Text>
        <View style={{ width: 40 }} />
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <FlatList
          data={listItems}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={renderEmpty}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor={Colors.primary}
            />
          }
        />
      )}
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
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
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
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    paddingBottom: Spacing['2xl'],
  },
  featuredSection: {
    paddingHorizontal: Spacing[5],
    paddingTop: Spacing[5],
    paddingBottom: Spacing[2],
  },
  featuredCard: {
    borderRadius: BorderRadius['2xl'],
    overflow: 'hidden',
    minHeight: 220,
    justifyContent: 'flex-end',
    ...(Shadows.lg as object),
  },
  featuredImage: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.35,
  },
  featuredOverlay: {
    padding: Spacing[5],
    gap: Spacing[2],
  },
  featuredTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  featuredTitle: {
    fontSize: FontSizes['2xl'],
    fontWeight: FontWeights.bold,
    color: Colors.white,
    lineHeight: FontSizes['2xl'] * 1.25,
  },
  featuredExcerpt: {
    fontSize: FontSizes.sm,
    color: 'rgba(255,255,255,0.8)',
    lineHeight: FontSizes.sm * 1.6,
  },
  featuredFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing[1],
  },
  featuredAuthor: {
    fontSize: FontSizes.xs,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: FontWeights.medium,
  },
  featuredDate: {
    fontSize: FontSizes.xs,
    color: 'rgba(255,255,255,0.6)',
  },
  pinnedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing[2],
    paddingVertical: 3,
  },
  pinnedText: {
    fontSize: FontSizes.xs,
    color: Colors.white,
    fontWeight: FontWeights.semibold,
  },
  filtersRow: {
    gap: Spacing[2],
    paddingHorizontal: Spacing[5],
    paddingVertical: Spacing[4],
  },
  filterChip: {
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[2],
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.card,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  filterChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterChipText: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.semibold,
    color: Colors.textSecondary,
  },
  filterChipTextActive: {
    color: Colors.white,
  },
  sectionLabel: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.semibold,
    color: Colors.textSecondary,
    paddingHorizontal: Spacing[5],
    paddingBottom: Spacing[2],
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  card: {
    backgroundColor: Colors.card,
    marginHorizontal: Spacing[5],
    marginBottom: Spacing[3],
    borderRadius: BorderRadius.xl,
    padding: Spacing[4],
    borderWidth: 1,
    borderColor: Colors.border,
    position: 'relative',
    ...(Shadows.sm as object),
  },
  cardUnread: {
    borderColor: Colors.primaryLight,
    borderLeftWidth: 3,
    borderLeftColor: Colors.primary,
  },
  unreadDot: {
    position: 'absolute',
    top: Spacing[4],
    right: Spacing[4],
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing[2],
  },
  cardDate: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
  },
  cardTitle: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.semibold,
    color: Colors.textPrimary,
    marginBottom: Spacing[2],
    lineHeight: FontSizes.md * 1.4,
  },
  cardTitleUnread: {
    fontWeight: FontWeights.bold,
  },
  cardExcerpt: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    lineHeight: FontSizes.sm * 1.6,
    marginBottom: Spacing[3],
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
  },
  avatarSmall: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    fontSize: 10,
    fontWeight: FontWeights.bold,
    color: Colors.white,
  },
  cardAuthor: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
    fontWeight: FontWeights.medium,
  },
  actionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: Colors.light,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing[2],
    paddingVertical: 3,
  },
  actionChipText: {
    fontSize: FontSizes.xs,
    color: Colors.primary,
    fontWeight: FontWeights.semibold,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing[2],
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  badgeText: {
    fontSize: FontSizes.xs,
    fontWeight: FontWeights.semibold,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: Spacing[16],
    paddingHorizontal: Spacing[8],
    gap: Spacing[3],
  },
  emptyTitle: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.bold,
    color: Colors.textPrimary,
  },
  emptyMessage: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: FontSizes.sm * 1.6,
  },
  retryButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing[6],
    paddingVertical: Spacing[3],
    borderRadius: BorderRadius.full,
    marginTop: Spacing[2],
  },
  retryButtonText: {
    color: Colors.white,
    fontWeight: FontWeights.semibold,
    fontSize: FontSizes.base,
  },
});
