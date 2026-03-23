import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, FlatList, Alert, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../lib/theme';

export default function TalentGigsScreen() {
  const gigs = useQuery(api.gigs.listGigs, { status: 'open' });
  const myInterests = useQuery(api.gigs.getMyInterests);
  const expressInterest = useMutation(api.gigs.expressInterest);
  const withdrawInterest = useMutation(api.gigs.withdrawInterest);

  const interestedGigIds = new Set(myInterests?.map((i) => i.gigId) || []);

  const handleInterest = async (gigId: any) => {
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
        <Text style={styles.subtitle}>Express interest in gigs that match your profile</Text>

        <FlatList
          data={gigs}
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
                    {isInterested ? 'Interest Submitted' : 'I\'m Interested'}
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
