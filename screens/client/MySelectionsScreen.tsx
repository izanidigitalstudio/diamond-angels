import React from 'react';
import {
  View, Text, StyleSheet, FlatList, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../lib/theme';

export default function MySelectionsScreen() {
  const bookings = useQuery(api.bookings.getMyBookingRequests);

  if (bookings === undefined) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return theme.colors.success;
      case 'declined': return theme.colors.error;
      case 'reviewed': return theme.colors.secondary;
      default: return theme.colors.warning;
    }
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <Text style={styles.title}>My Bookings</Text>
        <Text style={styles.subtitle}>Track your talent requests</Text>

        <FlatList
          data={bookings}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="document-text-outline" size={48} color={theme.colors.textMuted} />
              <Text style={styles.emptyText}>No booking requests yet</Text>
              <Text style={styles.emptySubtext}>Search and select talent to create a booking</Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.eventType}>{item.eventType}</Text>
                  <Text style={styles.eventDate}>{item.eventDate}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
                  <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                    {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                  </Text>
                </View>
              </View>
              <View style={styles.detailRow}>
                <View style={styles.detail}>
                  <Ionicons name="people" size={14} color={theme.colors.textMuted} />
                  <Text style={styles.detailText}>{item.talentCount} talent</Text>
                </View>
                <View style={styles.detail}>
                  <Ionicons name="location" size={14} color={theme.colors.textMuted} />
                  <Text style={styles.detailText}>{item.city}</Text>
                </View>
                <View style={styles.detail}>
                  <Ionicons name="business" size={14} color={theme.colors.textMuted} />
                  <Text style={styles.detailText}>{item.venue || 'TBC'}</Text>
                </View>
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
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 },
  eventType: { fontSize: 16, fontWeight: '700', color: theme.colors.text },
  eventDate: { fontSize: 13, color: theme.colors.primary, marginTop: 2 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 12, fontWeight: '600' },
  detailRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 14 },
  detail: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  detailText: { fontSize: 13, color: theme.colors.textMuted },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyText: { fontSize: 17, fontWeight: '600', color: theme.colors.textSecondary, marginTop: 12 },
  emptySubtext: { fontSize: 14, color: theme.colors.textMuted, marginTop: 4, textAlign: 'center' },
});
