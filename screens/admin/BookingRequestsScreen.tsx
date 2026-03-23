import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, FlatList, Image,
  ActivityIndicator, Modal, ScrollView, Alert, TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../lib/theme';

export default function BookingRequestsScreen() {
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [adminNotes, setAdminNotes] = useState('');

  const bookings = useQuery(api.bookings.listBookingRequests,
    statusFilter ? { status: statusFilter } : {}
  );
  const updateStatus = useMutation(api.bookings.updateBookingStatus);

  const handleUpdateStatus = async (bookingId: string, status: string) => {
    try {
      await updateStatus({ bookingId: bookingId as any, status, adminNotes: adminNotes || undefined });
      Alert.alert('Updated', `Booking marked as ${status}`);
      setSelectedBooking(null);
      setAdminNotes('');
    } catch (e: any) {
      Alert.alert('Error', e.message);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return theme.colors.success;
      case 'declined': return theme.colors.error;
      case 'reviewed': return theme.colors.secondary;
      default: return theme.colors.warning;
    }
  };

  if (bookings === undefined) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <Text style={styles.title}>Bookings</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
          <View style={styles.filterRow}>
            {[{ key: '', label: 'All' }, { key: 'pending', label: 'Pending' }, { key: 'reviewed', label: 'Reviewed' }, { key: 'confirmed', label: 'Confirmed' }, { key: 'declined', label: 'Declined' }].map((f) => (
              <TouchableOpacity
                key={f.key}
                style={[styles.filterChip, statusFilter === f.key && styles.filterChipActive]}
                onPress={() => setStatusFilter(f.key)}
              >
                <Text style={[styles.filterChipText, statusFilter === f.key && styles.filterChipTextActive]}>{f.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        <FlatList
          data={bookings}
          keyExtractor={(item: any) => item._id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="document-text-outline" size={48} color={theme.colors.textMuted} />
              <Text style={styles.emptyText}>No booking requests</Text>
            </View>
          }
          renderItem={({ item }: any) => (
            <TouchableOpacity style={styles.card} onPress={() => setSelectedBooking(item)} activeOpacity={0.8}>
              <View style={styles.cardHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardCompany}>{item.clientCompany}</Text>
                  <Text style={styles.cardContact}>{item.clientName}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
                  <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                    {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                  </Text>
                </View>
              </View>
              <Text style={styles.cardEvent}>{item.eventType} · {item.eventDate}</Text>
              <View style={styles.cardDetails}>
                <View style={styles.detailChip}>
                  <Ionicons name="people" size={12} color={theme.colors.primary} />
                  <Text style={styles.detailText}>{item.talentCount} talent</Text>
                </View>
                <View style={styles.detailChip}>
                  <Ionicons name="location" size={12} color={theme.colors.primary} />
                  <Text style={styles.detailText}>{item.city}</Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
        />

        <Modal visible={!!selectedBooking} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Booking Details</Text>
                <TouchableOpacity onPress={() => { setSelectedBooking(null); setAdminNotes(''); }}>
                  <Ionicons name="close" size={24} color={theme.colors.text} />
                </TouchableOpacity>
              </View>
              <ScrollView showsVerticalScrollIndicator={false}>
                {selectedBooking && (
                  <>
                    <View style={styles.infoSection}>
                      <Text style={styles.infoTitle}>Client</Text>
                      <Text style={styles.infoValue}>{selectedBooking.clientCompany}</Text>
                      <Text style={styles.infoSub}>{selectedBooking.clientName} · {selectedBooking.clientPhone}</Text>
                      <Text style={styles.infoSub}>{selectedBooking.clientEmail}</Text>
                    </View>

                    <View style={styles.infoSection}>
                      <Text style={styles.infoTitle}>Event</Text>
                      <Text style={styles.infoValue}>{selectedBooking.eventType}</Text>
                      <Text style={styles.infoSub}>{selectedBooking.eventDate} · {selectedBooking.city} · {selectedBooking.venue || 'TBC'}</Text>
                    </View>

                    <View style={styles.infoSection}>
                      <Text style={styles.infoTitle}>Talent Requested</Text>
                      <Text style={styles.infoValue}>{selectedBooking.talentCount} talent selected</Text>
                    </View>

                    {selectedBooking.requirements && (
                      <View style={styles.infoSection}>
                        <Text style={styles.infoTitle}>Requirements</Text>
                        <Text style={styles.infoSub}>{selectedBooking.requirements}</Text>
                      </View>
                    )}

                    <BookingTalentList bookingId={selectedBooking._id} />

                    {selectedBooking.status === 'pending' && (
                      <>
                        <TextInput
                          style={[styles.input, { marginTop: 16 }]}
                          placeholder="Admin notes (optional)"
                          placeholderTextColor={theme.colors.textMuted}
                          value={adminNotes}
                          onChangeText={setAdminNotes}
                        />
                        <View style={styles.actionRow}>
                          <TouchableOpacity
                            style={[styles.actionBtn, { backgroundColor: theme.colors.secondary }]}
                            onPress={() => handleUpdateStatus(selectedBooking._id, 'reviewed')}
                          >
                            <Text style={styles.actionBtnText}>Mark Reviewed</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={[styles.actionBtn, { backgroundColor: theme.colors.success }]}
                            onPress={() => handleUpdateStatus(selectedBooking._id, 'confirmed')}
                          >
                            <Text style={styles.actionBtnText}>Confirm</Text>
                          </TouchableOpacity>
                        </View>
                        <TouchableOpacity
                          style={[styles.actionBtn, { backgroundColor: theme.colors.error, marginBottom: 16 }]}
                          onPress={() => handleUpdateStatus(selectedBooking._id, 'declined')}
                        >
                          <Text style={styles.actionBtnText}>Decline</Text>
                        </TouchableOpacity>
                      </>
                    )}
                  </>
                )}
              </ScrollView>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </View>
  );
}

function BookingTalentList({ bookingId }: { bookingId: any }) {
  const talent = useQuery(api.bookings.getBookingTalent, { bookingId });

  if (!talent || talent.length === 0) return null;

  return (
    <View style={styles.talentSection}>
      <Text style={styles.infoTitle}>Selected Talent</Text>
      {talent.map((t: any) => (
        <View key={t._id} style={styles.talentRow}>
          {t.photoUrl ? (
            <Image source={{ uri: t.photoUrl }} style={styles.talentPhoto} />
          ) : (
            <View style={[styles.talentPhoto, { backgroundColor: theme.colors.cardLight, alignItems: 'center', justifyContent: 'center' }]}>
              <Ionicons name="person" size={16} color={theme.colors.textMuted} />
            </View>
          )}
          <View style={{ flex: 1 }}>
            <Text style={styles.talentName}>{t.firstName} {t.lastName}</Text>
            <Text style={styles.talentSub}>{t.city} · {t.heightCm}cm · {t.race}</Text>
            <Text style={styles.talentSub}>{t.phone}{t.instagram ? ` · @${t.instagram}` : ''}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  safe: { flex: 1 },
  title: { fontSize: 28, fontWeight: '800', color: theme.colors.primary, paddingHorizontal: 20, marginTop: 16, marginBottom: 12 },
  filterScroll: { marginBottom: 14 },
  filterRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 20 },
  filterChip: {
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
    backgroundColor: theme.colors.card, borderWidth: 1, borderColor: theme.colors.border,
  },
  filterChipActive: { backgroundColor: 'rgba(201,168,76,0.2)', borderColor: theme.colors.primary },
  filterChipText: { fontSize: 14, color: theme.colors.textSecondary },
  filterChipTextActive: { color: theme.colors.primary, fontWeight: '600' },
  list: { paddingHorizontal: 20, paddingBottom: 20 },
  card: {
    backgroundColor: theme.colors.card, borderRadius: 14, padding: 16,
    marginBottom: 12, borderWidth: 1, borderColor: theme.colors.border,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 6 },
  cardCompany: { fontSize: 16, fontWeight: '700', color: theme.colors.text },
  cardContact: { fontSize: 13, color: theme.colors.textMuted, marginTop: 1 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 12, fontWeight: '600' },
  cardEvent: { fontSize: 14, color: theme.colors.primary, marginBottom: 8 },
  cardDetails: { flexDirection: 'row', gap: 12 },
  detailChip: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  detailText: { fontSize: 13, color: theme.colors.textMuted },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalContent: {
    backgroundColor: theme.colors.background, borderTopLeftRadius: 24,
    borderTopRightRadius: 24, padding: 24, maxHeight: '90%',
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 20, fontWeight: '700', color: theme.colors.text },
  infoSection: { marginBottom: 16 },
  infoTitle: { fontSize: 12, fontWeight: '600', color: theme.colors.textMuted, marginBottom: 4, textTransform: 'uppercase' },
  infoValue: { fontSize: 16, fontWeight: '700', color: theme.colors.text },
  infoSub: { fontSize: 14, color: theme.colors.textSecondary, marginTop: 2 },
  input: {
    backgroundColor: theme.colors.inputBg, borderRadius: 12,
    paddingHorizontal: 16, paddingVertical: 14, fontSize: 15,
    color: theme.colors.text, borderWidth: 1, borderColor: theme.colors.border,
  },
  actionRow: { flexDirection: 'row', gap: 12, marginTop: 12, marginBottom: 12 },
  actionBtn: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    paddingVertical: 14, borderRadius: 12,
  },
  actionBtnText: { fontSize: 15, fontWeight: '700', color: '#FFF' },
  talentSection: { marginTop: 8 },
  talentRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: theme.colors.border,
  },
  talentPhoto: { width: 48, height: 60, borderRadius: 8 },
  talentName: { fontSize: 14, fontWeight: '600', color: theme.colors.text },
  talentSub: { fontSize: 12, color: theme.colors.textMuted, marginTop: 1 },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyText: { fontSize: 17, fontWeight: '600', color: theme.colors.textSecondary, marginTop: 12 },
});
