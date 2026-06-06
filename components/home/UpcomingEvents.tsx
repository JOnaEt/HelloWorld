import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../../constants/colors';
import { FontSizes, FontWeights } from '../../constants/fonts';
import { BorderRadius, Shadows, Spacing } from '../../constants/layout';

interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  type: 'service' | 'prayer' | 'study' | 'outreach' | 'special';
}

interface UpcomingEventsProps {
  events?: Event[];
  onViewAll?: () => void;
}

const EVENT_COLORS: Record<Event['type'], { bg: string; icon: string; color: string }> = {
  service: { bg: Colors.light, icon: 'home', color: Colors.primary },
  prayer: { bg: '#EDE9FE', icon: 'hand-right', color: '#8B5CF6' },
  study: { bg: '#E0F2FE', icon: 'book', color: '#0EA5E9' },
  outreach: { bg: '#FEF3C7', icon: 'globe', color: '#F59E0B' },
  special: { bg: '#FCE7F3', icon: 'star', color: '#EC4899' },
};

// Sample events (would come from Firebase in production)
const SAMPLE_EVENTS: Event[] = [
  {
    id: '1',
    title: 'Sunday Service',
    date: 'Sun, Jun 8',
    time: '10:00 AM',
    location: 'Main Sanctuary',
    type: 'service',
  },
  {
    id: '2',
    title: 'Midweek Prayer',
    date: 'Wed, Jun 11',
    time: '6:00 PM',
    location: 'Prayer Room',
    type: 'prayer',
  },
  {
    id: '3',
    title: 'Bible Study',
    date: 'Thu, Jun 12',
    time: '7:00 PM',
    location: 'Fellowship Hall',
    type: 'study',
  },
];

export function UpcomingEvents({ events = SAMPLE_EVENTS, onViewAll }: UpcomingEventsProps) {
  return (
    <View style={styles.container}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Upcoming Events</Text>
        {onViewAll && (
          <TouchableOpacity onPress={onViewAll}>
            <Text style={styles.viewAll}>View All</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {events.map((event) => {
          const config = EVENT_COLORS[event.type];
          return (
            <TouchableOpacity key={event.id} style={styles.eventCard} activeOpacity={0.85}>
              <View style={[styles.eventIconBox, { backgroundColor: config.bg }]}>
                <Ionicons name={config.icon as any} size={22} color={config.color} />
              </View>
              <Text style={styles.eventTitle} numberOfLines={2}>{event.title}</Text>
              <View style={styles.eventMeta}>
                <Ionicons name="calendar-outline" size={11} color={Colors.textSecondary} />
                <Text style={styles.eventMetaText}>{event.date}</Text>
              </View>
              <View style={styles.eventMeta}>
                <Ionicons name="time-outline" size={11} color={Colors.textSecondary} />
                <Text style={styles.eventMetaText}>{event.time}</Text>
              </View>
              <View style={styles.eventMeta}>
                <Ionicons name="location-outline" size={11} color={Colors.textSecondary} />
                <Text style={styles.eventMetaText} numberOfLines={1}>{event.location}</Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
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
  scrollContent: {
    gap: Spacing[3],
    paddingRight: Spacing[4],
  },
  eventCard: {
    width: 150,
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.xl,
    padding: Spacing[4],
    gap: Spacing[2],
    ...(Shadows.base as object),
  },
  eventIconBox: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing[1],
  },
  eventTitle: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.semibold,
    color: Colors.textPrimary,
    lineHeight: 18,
  },
  eventMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  eventMetaText: {
    fontSize: 11,
    color: Colors.textSecondary,
    flex: 1,
  },
});
