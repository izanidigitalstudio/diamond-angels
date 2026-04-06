import React, { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { theme } from '../../lib/theme';

type Notice = {
  id: string;
  title: string;
  body: string;
  date: string;
  type: string;
  pinned?: boolean;
};

const TYPE_CONFIG: Record<string, { icon: string; color: string; label: string }> = {
  announcement: { icon: 'megaphone', color: theme.colors.primary, label: 'Announcement' },
  reminder: { icon: 'alarm', color: '#F59E0B', label: 'Reminder' },
  update: { icon: 'information-circle', color: '#3B82F6', label: 'Update' },
  event: { icon: 'calendar', color: '#8B5CF6', label: 'Event' },
  alert: { icon: 'warning', color: '#F43F5E', label: 'Alert' },
};

const DEMO_NOTICES: Notice[] = [
  {
    id: '1',
    title: 'Heineken Festival Promo - Urgent Talent Needed',
    body: 'We have an exciting opportunity for 8 brand ambassadors at the Heineken Summer Festival in Johannesburg this Saturday. R2,500 per day. Branded outfits will be provided. Please express interest on the Gigs tab ASAP - spots are filling fast!',
    date: '2 hours ago',
    type: 'announcement',
    pinned: true,
  },
  {
    id: '2',
    title: 'Updated Payment Schedule',
    body: 'Please note that all gig payments will now be processed within 5 business days of event completion. Ensure your banking details on your profile are up to date. Contact admin if you have any payment queries.',
    date: '1 day ago',
    type: 'update',
  },
  {
    id: '3',
    title: 'Annual Diamond Angels Photoshoot',
    body: 'Our annual portfolio photoshoot is scheduled for 15 February at the Sandton Convention Centre. All active talent members are expected to attend. Professional hair and makeup will be provided. Arrive by 8:00 AM sharp.',
    date: '3 days ago',
    type: 'event',
  },
  {
    id: '4',
    title: 'Profile Completion Reminder',
    body: 'Members with incomplete profiles will not be considered for upcoming gigs. Please ensure your photos, contact details, and categories are up to date. Profiles must be at least 80% complete to appear in client searches.',
    date: '5 days ago',
    type: 'reminder',
  },
  {
    id: '5',
    title: 'New Agency Code of Conduct',
    body: 'All Diamond Angels talent must adhere to our updated code of conduct effective immediately. This includes professional dress code at events, punctuality (arrive 30 min early), and maintaining a positive social media presence. Violations may result in suspension.',
    date: '1 week ago',
    type: 'alert',
  },
];

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(ts).toLocaleDateString();
}

export default function NoticeBoardScreen() {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const dbNotices = useQuery(api.notices.listNotices);

  // Use real notices from DB if available, otherwise show demo data
  const notices: Notice[] = (dbNotices && dbNotices.length > 0)
    ? dbNotices.map((n: any) => ({
        id: n._id,
        title: n.title,
        body: n.body,
        date: timeAgo(n._creationTime),
        type: n.type,
        pinned: n.pinned,
      }))
    : DEMO_NOTICES;

  const toggleExpand = (id: string) => {
    setExpandedId(prev => prev === id ? null : id);
  };

  const renderNotice = ({ item }: { item: Notice }) => {
    const config = TYPE_CONFIG[item.type] || TYPE_CONFIG.announcement;
    const isExpanded = expandedId === item.id;

    return (
      <TouchableOpacity
        style={[styles.card, item.pinned && styles.cardPinned]}
        onPress={() => toggleExpand(item.id)}
        activeOpacity={0.7}
      >
        {item.pinned && (
          <View style={styles.pinnedBadge}>
            <Ionicons name="pin" size={10} color={theme.colors.primary} />
            <Text style={styles.pinnedText}>Pinned</Text>
          </View>
        )}
        <View style={styles.cardHeader}>
          <View style={[styles.typeIcon, { backgroundColor: config.color + '20' }]}>
            <Ionicons name={config.icon as any} size={18} color={config.color} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <View style={styles.metaRow}>
              <View style={[styles.typeBadge, { backgroundColor: config.color + '15' }]}>
                <Text style={[styles.typeText, { color: config.color }]}>{config.label}</Text>
              </View>
              <Text style={styles.dateText}>{item.date}</Text>
            </View>
          </View>
          <Ionicons
            name={isExpanded ? 'chevron-up' : 'chevron-down'}
            size={18}
            color={theme.colors.textMuted}
          />
        </View>
        {isExpanded && (
          <Text style={styles.cardBody}>{item.body}</Text>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <Text style={styles.title}>Notice Board</Text>
        <Text style={styles.subtitle}>Important updates from Diamond Angels</Text>

        <FlatList
          data={notices}
          keyExtractor={(item) => item.id}
          renderItem={renderNotice}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', paddingTop: 60 }}>
              <Ionicons name="newspaper-outline" size={48} color={theme.colors.textMuted} />
              <Text style={{ fontSize: 17, fontWeight: '700', color: theme.colors.textSecondary, marginTop: 12 }}>
                No Notices Yet
              </Text>
              <Text style={{ fontSize: 13, color: theme.colors.textMuted, marginTop: 4 }}>
                Check back later for updates from admin
              </Text>
            </View>
          }
        />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  safe: { flex: 1 },
  title: {
    fontSize: 28, fontWeight: '800', color: theme.colors.primary,
    paddingHorizontal: 20, marginTop: 16,
  },
  subtitle: {
    fontSize: 14, color: theme.colors.textSecondary,
    paddingHorizontal: 20, marginBottom: 16,
  },
  list: { paddingHorizontal: 20, paddingBottom: 20 },
  card: {
    backgroundColor: theme.colors.card, borderRadius: 16,
    padding: 16, marginBottom: 12,
    borderWidth: 1, borderColor: theme.colors.border,
  },
  cardPinned: {
    borderColor: theme.colors.primary + '40',
    backgroundColor: theme.colors.primary + '08',
  },
  pinnedBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    alignSelf: 'flex-start', marginBottom: 8,
    backgroundColor: theme.colors.primary + '15',
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8,
  },
  pinnedText: { fontSize: 10, fontWeight: '700', color: theme.colors.primary },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  typeIcon: {
    width: 36, height: 36, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 15, fontWeight: '700', color: theme.colors.text,
    lineHeight: 20, marginBottom: 6,
  },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  typeBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  typeText: { fontSize: 11, fontWeight: '600' },
  dateText: { fontSize: 12, color: theme.colors.textMuted },
  cardBody: {
    fontSize: 14, color: theme.colors.textSecondary,
    lineHeight: 22, marginTop: 12, paddingLeft: 48,
  },
});