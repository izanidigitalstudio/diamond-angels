import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from 'convex/react';
import { useAuthActions } from '@convex-dev/auth/react';
import { api } from '../../convex/_generated/api';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../lib/theme';
import { DEMO_TALENT } from '../../lib/demoTalent';

export default function AdminDashboardScreen() {
  const pendingTalent = useQuery(api.talent.listPendingProfiles);
  const allBookings = useQuery(api.bookings.listBookingRequests, {});
  const openGigs = useQuery(api.gigs.listGigs, { status: 'open' });
  const approvedTalent = useQuery(api.talent.listAllProfiles, { status: 'approved' });
  const { signOut } = useAuthActions();

  const pendingBookings = allBookings?.filter((b: any) => b.status === 'pending') || [];

  // Fallback to demo counts when DB is empty
  const approvedCount = (approvedTalent && approvedTalent.length > 0) ? approvedTalent.length : DEMO_TALENT.length;
  const pendingCount = pendingTalent?.length ?? 0;
  const gigsCount = openGigs?.length ?? 0;

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.title}>Dashboard</Text>
              <Text style={styles.subtitle}>Diamond Angels Admin</Text>
            </View>
            <TouchableOpacity onPress={() => signOut()} style={styles.signOutBtn}>
              <Ionicons name="log-out-outline" size={22} color={theme.colors.error} />
            </TouchableOpacity>
          </View>

          <View style={styles.statsRow}>
            <View style={[styles.statCard, { backgroundColor: 'rgba(245,158,11,0.1)' }]}>
              <Text style={[styles.statNumber, { color: theme.colors.warning }]}>
                {pendingCount}
              </Text>
              <Text style={styles.statLabel}>Pending Talent</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: 'rgba(16,185,129,0.1)' }]}>
              <Text style={[styles.statNumber, { color: theme.colors.success }]}>
                {approvedCount}
              </Text>
              <Text style={styles.statLabel}>Approved Talent</Text>
            </View>
          </View>
          <View style={styles.statsRow}>
            <View style={[styles.statCard, { backgroundColor: 'rgba(139,92,246,0.1)' }]}>
              <Text style={[styles.statNumber, { color: theme.colors.secondary }]}>
                {pendingBookings.length}
              </Text>
              <Text style={styles.statLabel}>Pending Bookings</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: 'rgba(201,168,76,0.1)' }]}>
              <Text style={[styles.statNumber, { color: theme.colors.primary }]}>
                {gigsCount}
              </Text>
              <Text style={styles.statLabel}>Open Gigs</Text>
            </View>
          </View>

          {pendingTalent && pendingTalent.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                <Ionicons name="alert-circle" size={16} color={theme.colors.warning} /> Recent Pending Talent
              </Text>
              {pendingTalent.slice(0, 5).map((p: any) => (
                <View key={p._id} style={styles.listItem}>
                  <View style={styles.listDot} />
                  <Text style={styles.listText}>{p.firstName} {p.lastName}</Text>
                  <Text style={styles.listSub}>{p.city}</Text>
                </View>
              ))}
              <Text style={styles.moreText}>See all in Talent tab →</Text>
            </View>
          )}

          {pendingBookings.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                <Ionicons name="document-text" size={16} color={theme.colors.secondary} /> Recent Booking Requests
              </Text>
              {pendingBookings.slice(0, 5).map((b: any) => (
                <View key={b._id} style={styles.listItem}>
                  <View style={[styles.listDot, { backgroundColor: theme.colors.secondary }]} />
                  <Text style={styles.listText}>{b.clientCompany}</Text>
                  <Text style={styles.listSub}>{b.eventType} · {b.talentCount} talent</Text>
                </View>
              ))}
              <Text style={styles.moreText}>See all in Bookings tab →</Text>
            </View>
          )}

          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  safe: { flex: 1 },
  scroll: { flex: 1, paddingHorizontal: 20 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: 16 },
  title: { fontSize: 28, fontWeight: '800', color: theme.colors.primary },
  subtitle: { fontSize: 14, color: theme.colors.textSecondary, marginBottom: 20 },
  signOutBtn: {
    width: 44, height: 44, borderRadius: 12, backgroundColor: 'rgba(239,68,68,0.1)',
    alignItems: 'center', justifyContent: 'center',
  },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  statCard: {
    flex: 1, borderRadius: 16, padding: 18,
    borderWidth: 1, borderColor: theme.colors.border,
  },
  statNumber: { fontSize: 28, fontWeight: '800' },
  statLabel: { fontSize: 13, color: theme.colors.textSecondary, marginTop: 4 },
  section: {
    backgroundColor: theme.colors.card, borderRadius: 16, padding: 18,
    marginTop: 12, borderWidth: 1, borderColor: theme.colors.border,
  },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: theme.colors.text, marginBottom: 14 },
  listItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, gap: 10 },
  listDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: theme.colors.warning },
  listText: { flex: 1, fontSize: 15, fontWeight: '600', color: theme.colors.text },
  listSub: { fontSize: 13, color: theme.colors.textMuted },
  moreText: { fontSize: 13, color: theme.colors.primary, marginTop: 8, fontWeight: '600' },
});