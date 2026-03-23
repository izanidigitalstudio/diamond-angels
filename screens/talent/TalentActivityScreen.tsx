import React from 'react';
import {
  View, Text, StyleSheet, FlatList, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../lib/theme';

export default function TalentActivityScreen() {
  const interests = useQuery(api.gigs.getMyInterests);

  if (interests === undefined) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <Text style={styles.title}>My Activity</Text>
        <Text style={styles.subtitle}>Your gig applications and interests</Text>

        <FlatList
          data={interests}
          keyExtractor={(item, i) => item.gigId + i}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="pulse-outline" size={48} color={theme.colors.textMuted} />
              <Text style={styles.emptyText}>No activity yet</Text>
              <Text style={styles.emptySubtext}>Express interest in gigs to see your activity here</Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.gigTitle}>{item.gigTitle}</Text>
                  <View style={styles.infoRow}>
                    <Ionicons name="location" size={14} color={theme.colors.textMuted} />
                    <Text style={styles.infoText}>{item.gigCity}</Text>
                    <Ionicons name="calendar" size={14} color={theme.colors.textMuted} />
                    <Text style={styles.infoText}>{item.gigDate}</Text>
                  </View>
                </View>
                <View style={[styles.statusBadge, {
                  backgroundColor: item.interestStatus === 'selected' ? 'rgba(16,185,129,0.15)' :
                    item.interestStatus === 'declined' ? 'rgba(239,68,68,0.15)' : 'rgba(245,158,11,0.15)'
                }]}>
                  <Text style={[styles.statusText, {
                    color: item.interestStatus === 'selected' ? theme.colors.success :
                      item.interestStatus === 'declined' ? theme.colors.error : theme.colors.warning
                  }]}>
                    {item.interestStatus === 'selected' ? 'Selected' :
                      item.interestStatus === 'declined' ? 'Declined' : 'Pending'}
                  </Text>
                </View>
              </View>
              <View style={[styles.gigStatusRow]}>
                <Ionicons
                  name={item.gigStatus === 'open' ? 'radio-button-on' : 'radio-button-off'}
                  size={12}
                  color={item.gigStatus === 'open' ? theme.colors.success : theme.colors.textMuted}
                />
                <Text style={styles.gigStatusText}>
                  Gig {item.gigStatus === 'open' ? 'Open' : 'Closed'}
                </Text>
              </View>
            </View>
          )}
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
    backgroundColor: theme.colors.card, borderRadius: 14,
    padding: 16, marginBottom: 12, borderWidth: 1, borderColor: theme.colors.border,
  },
  cardRow: { flexDirection: 'row', alignItems: 'flex-start' },
  gigTitle: { fontSize: 16, fontWeight: '700', color: theme.colors.text, marginBottom: 6 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  infoText: { fontSize: 13, color: theme.colors.textMuted, marginRight: 8 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 12, fontWeight: '600' },
  gigStatusRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10 },
  gigStatusText: { fontSize: 12, color: theme.colors.textMuted },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyText: { fontSize: 17, fontWeight: '600', color: theme.colors.textSecondary, marginTop: 12 },
  emptySubtext: { fontSize: 14, color: theme.colors.textMuted, marginTop: 4, textAlign: 'center' },
});
