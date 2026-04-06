import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, FlatList, Alert, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../lib/theme';

const DEMO_GIGS = [
  {
    _id: 'demo-1', title: 'Heineken Summer Festival Promo', eventType: 'Brand Activation',
    description: 'Brand ambassadors needed for the Heineken Summer Festival at Montecasino. Engage attendees, distribute samples, and represent the brand with energy and professionalism.',
    city: 'Johannesburg', eventDate: '15 Feb 2025', venue: 'Montecasino, Fourways',
    talentNeeded: 8, categories: ['Brand Ambassador', 'Promoter'], compensation: 'R2,500/day',
  },
  {
    _id: 'demo-2', title: 'BMW X5 Launch Event', eventType: 'Product Launch',
    description: 'Elegant hostesses required for the BMW X5 launch event. Duties include guest registration, ushering VIPs, and assisting with event coordination.',
    city: 'Cape Town', eventDate: '22 Feb 2025', venue: 'V&A Waterfront',
    talentNeeded: 5, categories: ['Hostess', 'Brand Ambassador'], compensation: 'R3,000/day',
  },
  {
    _id: 'demo-3', title: 'Vodacom Red Carpet Gala', eventType: 'Corporate Event',
    description: 'Looking for poised and well-groomed talent for an exclusive red carpet gala. Meet and greet guests, assist with media coordination, and ensure VIP experience.',
    city: 'Durban', eventDate: '1 Mar 2025', venue: 'Durban ICC',
    talentNeeded: 6, categories: ['Hostess', 'Bottle Girl'], compensation: 'R2,800/day',
  },
  {
    _id: 'demo-4', title: 'Castle Lager Sports Day', eventType: 'Sporting Event',
    description: 'Energetic promoters needed for a major sports activation. Hand out merchandise, engage fans, and create an exciting atmosphere at the venue.',
    city: 'Pretoria', eventDate: '8 Mar 2025', venue: 'Loftus Versfeld',
    talentNeeded: 10, categories: ['Promoter', 'Brand Ambassador'], compensation: 'R2,000/day',
  },
  {
    _id: 'demo-5', title: 'Absolut Vodka Club Activation', eventType: 'Nightlife Activation',
    description: 'Bottle girls and promoters for a premium nightlife activation. Must be confident, well-presented, and comfortable in a nightclub environment.',
    city: 'Johannesburg', eventDate: '14 Mar 2025', venue: 'Taboo Nightclub, Sandton',
    talentNeeded: 4, categories: ['Bottle Girl', 'Promoter'], compensation: 'R1,800/night + tips',
  },
  {
    _id: 'demo-6', title: 'Nike Run Club Ambassador', eventType: 'Fitness Event',
    description: 'Fitness-oriented brand ambassadors for Nike Run Club events across Joburg. Lead warm-ups, motivate runners, and represent the Nike brand at weekly events.',
    city: 'Johannesburg', eventDate: '20 Mar 2025', venue: 'Various Locations',
    talentNeeded: 3, categories: ['Brand Ambassador'], compensation: 'R4,000/month (4 events)',
  },
  {
    _id: 'demo-7', title: 'Samsung Galaxy S25 Launch', eventType: 'Product Launch',
    description: 'Tech-savvy demonstrators needed for Samsung Galaxy launch. Guide customers through product features, manage demo stations, and drive excitement.',
    city: 'Cape Town', eventDate: '25 Mar 2025', venue: 'Canal Walk Shopping Centre',
    talentNeeded: 6, categories: ['Promoter', 'Brand Ambassador'], compensation: 'R2,200/day',
  },
  {
    _id: 'demo-8', title: 'Standard Bank Golf Day', eventType: 'Corporate Golf Day',
    description: 'Well-groomed hostesses for a corporate golf day. Duties include player registration, refreshment service on the course, and prize-giving ceremony assistance.',
    city: 'Durban', eventDate: '2 Apr 2025', venue: 'Mount Edgecombe Country Club',
    talentNeeded: 4, categories: ['Hostess'], compensation: 'R2,500/day',
  },
  {
    _id: 'demo-9', title: "L'Oréal Beauty Expo Activation", eventType: 'Exhibition',
    description: "Beauty ambassadors for L'Oréal at the SA Beauty Expo. Perform product demonstrations, distribute samples, and share product knowledge with attendees.",
    city: 'Johannesburg', eventDate: '10 Apr 2025', venue: 'Sandton Convention Centre',
    talentNeeded: 8, categories: ['Brand Ambassador', 'Promoter'], compensation: 'R2,300/day',
  },
  {
    _id: 'demo-10', title: 'Red Bull Music Festival', eventType: 'Music Festival',
    description: 'High-energy promoters for the Red Bull Music Festival. Distribute product, engage festival-goers, and create memorable brand experiences across multiple stages.',
    city: 'Soweto', eventDate: '18 Apr 2025', venue: 'Orlando Stadium',
    talentNeeded: 12, categories: ['Promoter', 'Brand Ambassador'], compensation: 'R2,000/day',
  },
];

export default function TalentGigsScreen() {
  const gigs = useQuery(api.gigs.listGigs, { status: 'open' });
  const myInterests = useQuery(api.gigs.getMyInterests);
  const expressInterest = useMutation(api.gigs.expressInterest);
  const withdrawInterest = useMutation(api.gigs.withdrawInterest);

  const interestedGigIds = new Set(myInterests?.map((i) => i.gigId) || []);

  // Use real gigs if available, fall back to demo data
  const displayGigs = (gigs && gigs.length > 0) ? gigs : DEMO_GIGS;
  const isDemo = !gigs || gigs.length === 0;

  const handleInterest = async (gigId: any) => {
    if (isDemo) {
      Alert.alert('Demo Mode', 'This is a demo gig. Real gig interactions will be available when gigs are posted by admin.');
      return;
    }
    try {
      if (interestedGigIds.has(gigId)) {
        await withdrawInterest({ gigId });
      } else {
        await expressInterest({ gigId });
      }
    } catch (e: any) {
      Alert.alert('Error', e.message);
    }
  };

  if (gigs === undefined) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <Text style={styles.title}>Available Gigs</Text>
        <Text style={styles.subtitle}>
          {isDemo ? '10 upcoming opportunities' : `${displayGigs.length} gigs available`}
        </Text>

        <FlatList
          data={displayGigs}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="briefcase-outline" size={48} color={theme.colors.textMuted} />
              <Text style={styles.emptyText}>No open gigs right now</Text>
              <Text style={styles.emptySubtext}>Check back soon for new opportunities</Text>
            </View>
          }
          renderItem={({ item }) => {
            const isInterested = interestedGigIds.has(item._id);
            return (
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cardTitle}>{item.title}</Text>
                    <Text style={styles.cardType}>{item.eventType}</Text>
                  </View>
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{item.talentNeeded} needed</Text>
                  </View>
                </View>

                <Text style={styles.cardDesc} numberOfLines={3}>{item.description}</Text>

                <View style={styles.detailRow}>
                  <View style={styles.detailItem}>
                    <Ionicons name="location" size={14} color={theme.colors.textMuted} />
                    <Text style={styles.detailText}>{item.city}</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Ionicons name="calendar" size={14} color={theme.colors.textMuted} />
                    <Text style={styles.detailText}>{item.eventDate}</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Ionicons name="location-outline" size={14} color={theme.colors.textMuted} />
                    <Text style={styles.detailText}>{item.venue}</Text>
                  </View>
                </View>

                {item.categories.length > 0 && (
                  <View style={styles.tagRow}>
                    {item.categories.map((c) => (
                      <View key={c} style={styles.tag}>
                        <Text style={styles.tagText}>{c}</Text>
                      </View>
                    ))}
                  </View>
                )}

                {item.compensation ? (
                  <Text style={styles.compensation}>Compensation: {item.compensation}</Text>
                ) : null}

                <TouchableOpacity
                  style={[styles.interestBtn, isInterested && styles.interestBtnActive]}
                  onPress={() => handleInterest(item._id)}
                >
                  <Ionicons
                    name={isInterested ? 'checkmark-circle' : 'hand-right'}
                    size={18}
                    color={isInterested ? theme.colors.success : theme.colors.primary}
                  />
                  <Text style={[styles.interestBtnText, isInterested && { color: theme.colors.success }]}>
                    {isInterested ? 'Interest Submitted' : "I'm Interested"}
                  </Text>
                </TouchableOpacity>
              </View>
            );
          }}
        />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  safe: { flex: 1 },
  title: { fontSize: 28, fontWeight: '800', color: theme.colors.primary, paddingHorizontal: 20, marginTop: 16 },
  subtitle: { fontSize: 14, color: theme.colors.textSecondary, paddingHorizontal: 20, marginBottom: 16 },
  list: { paddingHorizontal: 20, paddingBottom: 20 },
  card: {
    backgroundColor: theme.colors.card, borderRadius: 16,
    padding: 18, marginBottom: 14, borderWidth: 1, borderColor: theme.colors.border,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10 },
  cardTitle: { fontSize: 17, fontWeight: '700', color: theme.colors.text },
  cardType: { fontSize: 13, color: theme.colors.primary, marginTop: 2 },
  badge: {
    backgroundColor: 'rgba(201,168,76,0.15)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8,
  },
  badgeText: { fontSize: 12, color: theme.colors.primary, fontWeight: '600' },
  cardDesc: { fontSize: 14, color: theme.colors.textSecondary, lineHeight: 20, marginBottom: 12 },
  detailRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 14, marginBottom: 10 },
  detailItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  detailText: { fontSize: 13, color: theme.colors.textMuted },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 },
  tag: {
    backgroundColor: 'rgba(139,92,246,0.15)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8,
  },
  tagText: { fontSize: 11, color: theme.colors.secondary, fontWeight: '600' },
  compensation: { fontSize: 13, color: theme.colors.success, fontWeight: '600', marginBottom: 12 },
  interestBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    paddingVertical: 12, borderRadius: 12,
    borderWidth: 1, borderColor: theme.colors.primary,
  },
  interestBtnActive: { borderColor: theme.colors.success, backgroundColor: 'rgba(16,185,129,0.1)' },
  interestBtnText: { fontSize: 15, fontWeight: '600', color: theme.colors.primary },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyText: { fontSize: 17, fontWeight: '600', color: theme.colors.textSecondary, marginTop: 12 },
  emptySubtext: { fontSize: 14, color: theme.colors.textMuted, marginTop: 4 },
});