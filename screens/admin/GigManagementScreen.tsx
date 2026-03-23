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
import { SA_CITIES, CATEGORIES, EVENT_TYPES } from '../../lib/constants';

export default function GigManagementScreen() {
  const [showCreate, setShowCreate] = useState(false);
  const [showInterests, setShowInterests] = useState<any>(null);
  const [form, setForm] = useState({
    title: '', description: '', eventType: '', city: '',
    venue: '', eventDate: '', talentNeeded: '', categories: [] as string[],
    requirements: '', compensation: '',
  });

  const gigs = useQuery(api.gigs.listGigs, {});
  const createGig = useMutation(api.gigs.createGig);
  const updateGig = useMutation(api.gigs.updateGig);

  const handleCreate = async () => {
    if (!form.title || !form.eventType || !form.city || !form.eventDate || !form.talentNeeded) {
      Alert.alert('Missing Fields', 'Please fill in all required fields');
      return;
    }
    try {
      await createGig({
        ...form,
        talentNeeded: parseInt(form.talentNeeded),
      });
      Alert.alert('Success', 'Gig created');
      setShowCreate(false);
      setForm({ title: '', description: '', eventType: '', city: '', venue: '', eventDate: '', talentNeeded: '', categories: [], requirements: '', compensation: '' });
    } catch (e: any) {
      Alert.alert('Error', e.message);
    }
  };

  const handleCloseGig = async (gigId: string) => {
    try {
      await updateGig({ gigId: gigId as any, status: 'closed' });
    } catch (e: any) {
      Alert.alert('Error', e.message);
    }
  };

  const toggleCategory = (cat: string) => {
    setForm((prev) => ({
      ...prev,
      categories: prev.categories.includes(cat)
        ? prev.categories.filter((c) => c !== cat)
        : [...prev.categories, cat],
    }));
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
        <View style={styles.headerRow}>
          <Text style={styles.title}>Gigs</Text>
          <TouchableOpacity style={styles.addBtn} onPress={() => setShowCreate(true)}>
            <Ionicons name="add" size={22} color={theme.colors.black} />
          </TouchableOpacity>
        </View>

        <FlatList
          data={gigs}
          keyExtractor={(item: any) => item._id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="megaphone-outline" size={48} color={theme.colors.textMuted} />
              <Text style={styles.emptyText}>No gigs yet</Text>
              <Text style={styles.emptySubtext}>Create a gig to start receiving interest</Text>
            </View>
          }
          renderItem={({ item }: any) => (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitle}>{item.title}</Text>
                  <Text style={styles.cardType}>{item.eventType} · {item.city}</Text>
                </View>
                <View style={[styles.statusBadge, {
                  backgroundColor: item.status === 'open' ? 'rgba(16,185,129,0.15)' : 'rgba(107,114,128,0.15)'
                }]}>
                  <Text style={[styles.statusText, {
                    color: item.status === 'open' ? theme.colors.success : theme.colors.textMuted
                  }]}>
                    {item.status === 'open' ? 'Open' : 'Closed'}
                  </Text>
                </View>
              </View>
              <Text style={styles.cardDesc} numberOfLines={2}>{item.description}</Text>
              <View style={styles.cardStats}>
                <Text style={styles.statText}>{item.talentNeeded} needed</Text>
                <Text style={styles.statText}>·</Text>
                <Text style={styles.statHighlight}>{item.interestCount} interested</Text>
                <Text style={styles.statText}>·</Text>
                <Text style={styles.statText}>{item.eventDate}</Text>
              </View>
              <View style={styles.cardActions}>
                <TouchableOpacity
                  style={styles.viewInterestsBtn}
                  onPress={() => setShowInterests(item)}
                >
                  <Ionicons name="people" size={16} color={theme.colors.primary} />
                  <Text style={styles.viewInterestsText}>View Interests ({item.interestCount})</Text>
                </TouchableOpacity>
                {item.status === 'open' && (
                  <TouchableOpacity onPress={() => handleCloseGig(item._id)}>
                    <Text style={styles.closeGigText}>Close Gig</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}
        />

        {/* Create Gig Modal */}
        <Modal visible={showCreate} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Create Gig</Text>
                <TouchableOpacity onPress={() => setShowCreate(false)}>
                  <Ionicons name="close" size={24} color={theme.colors.text} />
                </TouchableOpacity>
              </View>
              <ScrollView showsVerticalScrollIndicator={false}>
                <TextInput style={styles.input} placeholder="Gig Title *" placeholderTextColor={theme.colors.textMuted}
                  value={form.title} onChangeText={(v) => setForm({ ...form, title: v })} />
                <TextInput style={[styles.input, { height: 80, textAlignVertical: 'top' }]} placeholder="Description" placeholderTextColor={theme.colors.textMuted}
                  value={form.description} onChangeText={(v) => setForm({ ...form, description: v })} multiline />

                <Text style={styles.label}>Event Type *</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={styles.chipRow}>
                    {EVENT_TYPES.map((e) => (
                      <TouchableOpacity key={e} style={[styles.chip, form.eventType === e && styles.chipActive]}
                        onPress={() => setForm({ ...form, eventType: e })}>
                        <Text style={[styles.chipText, form.eventType === e && styles.chipTextActive]}>{e}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>

                <Text style={styles.label}>City *</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={styles.chipRow}>
                    {SA_CITIES.slice(0, 15).map((c) => (
                      <TouchableOpacity key={c} style={[styles.chip, form.city === c && styles.chipActive]}
                        onPress={() => setForm({ ...form, city: c })}>
                        <Text style={[styles.chipText, form.city === c && styles.chipTextActive]}>{c}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>

                <TextInput style={styles.input} placeholder="Venue" placeholderTextColor={theme.colors.textMuted}
                  value={form.venue} onChangeText={(v) => setForm({ ...form, venue: v })} />
                <TextInput style={styles.input} placeholder="Event Date *" placeholderTextColor={theme.colors.textMuted}
                  value={form.eventDate} onChangeText={(v) => setForm({ ...form, eventDate: v })} />
                <TextInput style={styles.input} placeholder="Talent Needed *" placeholderTextColor={theme.colors.textMuted}
                  value={form.talentNeeded} onChangeText={(v) => setForm({ ...form, talentNeeded: v })} keyboardType="numeric" />

                <Text style={styles.label}>Categories</Text>
                <View style={styles.chipRow}>
                  {CATEGORIES.map((c) => (
                    <TouchableOpacity key={c} style={[styles.chip, form.categories.includes(c) && styles.chipActive]}
                      onPress={() => toggleCategory(c)}>
                      <Text style={[styles.chipText, form.categories.includes(c) && styles.chipTextActive]}>{c}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <TextInput style={[styles.input, { height: 60, textAlignVertical: 'top' }]} placeholder="Requirements" placeholderTextColor={theme.colors.textMuted}
                  value={form.requirements} onChangeText={(v) => setForm({ ...form, requirements: v })} multiline />
                <TextInput style={styles.input} placeholder="Compensation" placeholderTextColor={theme.colors.textMuted}
                  value={form.compensation} onChangeText={(v) => setForm({ ...form, compensation: v })} />

                <TouchableOpacity style={styles.createBtn} onPress={handleCreate}>
                  <Text style={styles.createBtnText}>Create Gig</Text>
                </TouchableOpacity>
                <View style={{ height: 20 }} />
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* Interests Modal */}
        <Modal visible={!!showInterests} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Interested Talent</Text>
                <TouchableOpacity onPress={() => setShowInterests(null)}>
                  <Ionicons name="close" size={24} color={theme.colors.text} />
                </TouchableOpacity>
              </View>
              {showInterests && <GigInterestsList gigId={showInterests._id} />}
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </View>
  );
}

function GigInterestsList({ gigId }: { gigId: any }) {
  const interests = useQuery(api.gigs.getGigInterests, { gigId });

  if (interests === undefined) {
    return <ActivityIndicator size="large" color={theme.colors.primary} style={{ marginTop: 40 }} />;
  }

  if (interests.length === 0) {
    return (
      <View style={styles.empty}>
        <Ionicons name="people-outline" size={40} color={theme.colors.textMuted} />
        <Text style={styles.emptyText}>No interest yet</Text>
      </View>
    );
  }

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <Text style={{ fontSize: 14, color: theme.colors.textSecondary, marginBottom: 16 }}>
        {interests.length} talent interested — profiles and contact details below
      </Text>
      {interests.map((t: any) => (
        <View key={t._id} style={styles.interestCard}>
          <View style={styles.interestRow}>
            {t.photoUrls?.[0] ? (
              <Image source={{ uri: t.photoUrls[0] }} style={styles.interestPhoto} />
            ) : (
              <View style={[styles.interestPhoto, { backgroundColor: theme.colors.cardLight, alignItems: 'center', justifyContent: 'center' }]}>
                <Ionicons name="person" size={20} color={theme.colors.textMuted} />
              </View>
            )}
            <View style={{ flex: 1 }}>
              <Text style={styles.interestName}>{t.firstName} {t.lastName}</Text>
              <Text style={styles.interestSub}>{t.city}, {t.area} · {t.heightCm}cm · {t.race} · {t.bodyType}</Text>
              <Text style={styles.interestSub}>{t.phone}{t.instagram ? ` · @${t.instagram}` : ''}</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 4 }}>
                {t.categories.map((c: string) => (
                  <View key={c} style={styles.miniTag}><Text style={styles.miniTagText}>{c}</Text></View>
                ))}
              </View>
            </View>
          </View>
          {t.photoUrls && t.photoUrls.length > 1 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 10 }}>
              {t.photoUrls.filter(Boolean).map((url: string, i: number) => (
                <Image key={i} source={{ uri: url }} style={styles.interestThumb} />
              ))}
            </ScrollView>
          )}
          {t.note && <Text style={styles.interestNote}>Note: {t.note}</Text>}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  safe: { flex: 1 },
  headerRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, marginTop: 16, marginBottom: 12,
  },
  title: { fontSize: 28, fontWeight: '800', color: theme.colors.primary },
  addBtn: {
    width: 44, height: 44, borderRadius: 12, backgroundColor: theme.colors.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  list: { paddingHorizontal: 20, paddingBottom: 20 },
  card: {
    backgroundColor: theme.colors.card, borderRadius: 14, padding: 16,
    marginBottom: 12, borderWidth: 1, borderColor: theme.colors.border,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 6 },
  cardTitle: { fontSize: 17, fontWeight: '700', color: theme.colors.text },
  cardType: { fontSize: 13, color: theme.colors.textMuted, marginTop: 2 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 12, fontWeight: '600' },
  cardDesc: { fontSize: 14, color: theme.colors.textSecondary, lineHeight: 20, marginBottom: 8 },
  cardStats: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 },
  statText: { fontSize: 13, color: theme.colors.textMuted },
  statHighlight: { fontSize: 13, color: theme.colors.primary, fontWeight: '600' },
  cardActions: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  viewInterestsBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  viewInterestsText: { fontSize: 14, color: theme.colors.primary, fontWeight: '600' },
  closeGigText: { fontSize: 13, color: theme.colors.error, fontWeight: '600' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalContent: {
    backgroundColor: theme.colors.background, borderTopLeftRadius: 24,
    borderTopRightRadius: 24, padding: 24, maxHeight: '90%',
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 20, fontWeight: '700', color: theme.colors.text },
  input: {
    backgroundColor: theme.colors.inputBg, borderRadius: 12,
    paddingHorizontal: 16, paddingVertical: 14, fontSize: 15,
    color: theme.colors.text, borderWidth: 1, borderColor: theme.colors.border, marginBottom: 12,
  },
  label: { fontSize: 14, fontWeight: '600', color: theme.colors.textSecondary, marginBottom: 8, marginTop: 8 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  chip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
    backgroundColor: theme.colors.inputBg, borderWidth: 1, borderColor: theme.colors.border,
  },
  chipActive: { backgroundColor: 'rgba(201,168,76,0.2)', borderColor: theme.colors.primary },
  chipText: { fontSize: 13, color: theme.colors.textSecondary },
  chipTextActive: { color: theme.colors.primary, fontWeight: '600' },
  createBtn: {
    backgroundColor: theme.colors.primary, borderRadius: 14,
    paddingVertical: 16, alignItems: 'center', marginTop: 8,
  },
  createBtnText: { fontSize: 16, fontWeight: '700', color: theme.colors.black },
  interestCard: {
    backgroundColor: theme.colors.card, borderRadius: 14, padding: 14,
    marginBottom: 12, borderWidth: 1, borderColor: theme.colors.border,
  },
  interestRow: { flexDirection: 'row', gap: 12 },
  interestPhoto: { width: 64, height: 80, borderRadius: 10 },
  interestName: { fontSize: 15, fontWeight: '700', color: theme.colors.text },
  interestSub: { fontSize: 12, color: theme.colors.textMuted, marginTop: 2 },
  interestThumb: { width: 60, height: 80, borderRadius: 8, marginRight: 8 },
  interestNote: { fontSize: 13, color: theme.colors.textSecondary, marginTop: 8, fontStyle: 'italic' },
  miniTag: { backgroundColor: 'rgba(201,168,76,0.15)', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  miniTagText: { fontSize: 10, color: theme.colors.primary, fontWeight: '600' },
  empty: { alignItems: 'center', paddingTop: 40 },
  emptyText: { fontSize: 17, fontWeight: '600', color: theme.colors.textSecondary, marginTop: 12 },
  emptySubtext: { fontSize: 14, color: theme.colors.textMuted, marginTop: 4 },
});
