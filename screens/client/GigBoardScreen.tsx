import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, FlatList, ActivityIndicator,
  TouchableOpacity, Modal, ScrollView, TextInput, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../lib/theme';
import { SA_CITIES, CATEGORIES, EVENT_TYPES } from '../../lib/constants';
import { DEMO_GIGS } from '../../lib/demoGigs';

export default function GigBoardScreen() {
  const gigs = useQuery(api.gigs.listGigs, { status: 'open' });
  const createGig = useMutation(api.gigs.createGig);
  const [showPost, setShowPost] = useState(false);
  const [form, setForm] = useState({
    title: '', description: '', eventType: '', city: '',
    venue: '', eventDate: '', talentNeeded: '', categories: [] as string[],
    requirements: '', compensation: '',
  });

  const isUsingDemo = gigs !== undefined && gigs.length === 0;
  const displayGigs = useMemo(() => {
    if (gigs === undefined) return [];
    if (gigs.length > 0) return gigs;
    return DEMO_GIGS;
  }, [gigs]);

  const toggleCategory = (cat: string) => {
    setForm((prev) => ({
      ...prev,
      categories: prev.categories.includes(cat)
        ? prev.categories.filter((c) => c !== cat)
        : [...prev.categories, cat],
    }));
  };

  const resetForm = () => {
    setForm({ title: '', description: '', eventType: '', city: '', venue: '', eventDate: '', talentNeeded: '', categories: [], requirements: '', compensation: '' });
  };

  const handlePostGig = async () => {
    if (!form.title || !form.eventType || !form.city || !form.eventDate || !form.talentNeeded) {
      Alert.alert('Missing Fields', 'Please fill in all required fields (title, event type, city, date, talent needed)');
      return;
    }
    try {
      await createGig({
        ...form,
        talentNeeded: parseInt(form.talentNeeded) || 1,
      });
      Alert.alert('Gig Posted!', 'Your gig request has been posted. Talent will be able to express interest.');
      setShowPost(false);
      resetForm();
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to post gig');
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
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.title}>Gig Board</Text>
            <Text style={styles.subtitle}>
              {displayGigs.length} open opportunities{isUsingDemo ? ' (demo)' : ''}
            </Text>
          </View>
          <TouchableOpacity style={styles.postBtn} onPress={() => setShowPost(true)}>
            <Ionicons name="add" size={20} color={theme.colors.black} />
            <Text style={styles.postBtnText}>Post Gig</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={displayGigs}
          keyExtractor={(item: any) => item._id ?? item.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="megaphone-outline" size={48} color={theme.colors.textMuted} />
              <Text style={styles.emptyText}>No open gigs</Text>
              <Text style={styles.emptySubtext}>Post a gig request to find talent</Text>
            </View>
          }
          renderItem={({ item }: { item: any }) => (
            <View style={styles.card}>
              <Text style={styles.gigTitle}>{item.title}</Text>
              <Text style={styles.gigType}>{item.eventType}</Text>
              <Text style={styles.gigDesc} numberOfLines={3}>{item.description}</Text>
              <View style={styles.infoRow}>
                <View style={styles.infoItem}>
                  <Ionicons name="location" size={14} color={theme.colors.textMuted} />
                  <Text style={styles.infoText}>{item.city}</Text>
                </View>
                <View style={styles.infoItem}>
                  <Ionicons name="calendar" size={14} color={theme.colors.textMuted} />
                  <Text style={styles.infoText}>{item.eventDate}</Text>
                </View>
                <View style={styles.infoItem}>
                  <Ionicons name="people" size={14} color={theme.colors.textMuted} />
                  <Text style={styles.infoText}>{item.talentNeeded} needed</Text>
                </View>
              </View>
              {item.compensation ? (
                <View style={styles.infoItem}>
                  <Ionicons name="cash" size={14} color={theme.colors.primary} />
                  <Text style={[styles.infoText, { color: theme.colors.primary, fontWeight: '600' }]}>{item.compensation}</Text>
                </View>
              ) : null}
              <View style={styles.tagRow}>
                {item.categories.map((c: string) => (
                  <View key={c} style={styles.tag}><Text style={styles.tagText}>{c}</Text></View>
                ))}
              </View>
              <View style={styles.interestRow}>
                <Ionicons name="hand-right" size={14} color={theme.colors.primary} />
                <Text style={styles.interestText}>{item.interestCount} interested</Text>
              </View>
            </View>
          )}
        />

        {/* Post Gig Modal */}
        <Modal visible={showPost} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Post a Gig Request</Text>
                <TouchableOpacity onPress={() => setShowPost(false)}>
                  <Ionicons name="close" size={24} color={theme.colors.text} />
                </TouchableOpacity>
              </View>
              <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                <Text style={styles.modalSubtitle}>Tell us what talent you need</Text>

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

                <Text style={styles.label}>Talent Categories</Text>
                <View style={styles.chipRow}>
                  {CATEGORIES.map((c) => (
                    <TouchableOpacity key={c} style={[styles.chip, form.categories.includes(c) && styles.chipActive]}
                      onPress={() => toggleCategory(c)}>
                      <Text style={[styles.chipText, form.categories.includes(c) && styles.chipTextActive]}>{c}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

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
                <TextInput style={styles.input} placeholder="Event Date * (e.g. 15 Feb 2025)" placeholderTextColor={theme.colors.textMuted}
                  value={form.eventDate} onChangeText={(v) => setForm({ ...form, eventDate: v })} />
                <TextInput style={styles.input} placeholder="Number of Talent Needed *" placeholderTextColor={theme.colors.textMuted}
                  value={form.talentNeeded} onChangeText={(v) => setForm({ ...form, talentNeeded: v })} keyboardType="numeric" />
                <TextInput style={[styles.input, { height: 60, textAlignVertical: 'top' }]} placeholder="Requirements" placeholderTextColor={theme.colors.textMuted}
                  value={form.requirements} onChangeText={(v) => setForm({ ...form, requirements: v })} multiline />
                <TextInput style={styles.input} placeholder="Compensation / Budget" placeholderTextColor={theme.colors.textMuted}
                  value={form.compensation} onChangeText={(v) => setForm({ ...form, compensation: v })} />

                <View style={{ backgroundColor: 'rgba(201,168,76,0.08)', borderRadius: 12, padding: 14, marginTop: 8 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Ionicons name="information-circle" size={18} color={theme.colors.primary} />
                    <Text style={{ color: theme.colors.primary, fontWeight: '600', fontSize: 13 }}>What happens next?</Text>
                  </View>
                  <Text style={{ color: theme.colors.textSecondary, fontSize: 12, lineHeight: 18, marginTop: 6 }}>
                    Your gig will be posted on the talent board. Qualified talent will express interest, and you'll be able to review their profiles.
                  </Text>
                </View>

                <TouchableOpacity style={styles.submitBtn} onPress={handlePostGig}>
                  <Ionicons name="megaphone" size={18} color={theme.colors.black} />
                  <Text style={styles.submitBtnText}>Post Gig</Text>
                </TouchableOpacity>
                <View style={{ height: 30 }} />
              </ScrollView>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  safe: { flex: 1 },
  headerRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
    paddingHorizontal: 20, marginTop: 16, marginBottom: 12,
  },
  title: { fontSize: 28, fontWeight: '800', color: theme.colors.primary },
  subtitle: { fontSize: 14, color: theme.colors.textSecondary, marginTop: 2 },
  postBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: theme.colors.primary, borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 10,
  },
  postBtnText: { fontSize: 14, fontWeight: '700', color: theme.colors.black },
  list: { paddingHorizontal: 20, paddingBottom: 20 },
  card: {
    backgroundColor: theme.colors.card, borderRadius: 14,
    padding: 16, marginBottom: 12, borderWidth: 1, borderColor: theme.colors.border,
  },
  gigTitle: { fontSize: 17, fontWeight: '700', color: theme.colors.text, marginBottom: 2 },
  gigType: { fontSize: 13, color: theme.colors.primary, marginBottom: 8 },
  gigDesc: { fontSize: 14, color: theme.colors.textSecondary, lineHeight: 20, marginBottom: 12 },
  infoRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 14, marginBottom: 10 },
  infoItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  infoText: { fontSize: 13, color: theme.colors.textMuted },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 10 },
  tag: {
    backgroundColor: 'rgba(139,92,246,0.15)', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 6,
  },
  tagText: { fontSize: 11, color: theme.colors.secondary, fontWeight: '600' },
  interestRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  interestText: { fontSize: 13, color: theme.colors.primary, fontWeight: '600' },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyText: { fontSize: 17, fontWeight: '600', color: theme.colors.textSecondary, marginTop: 12 },
  emptySubtext: { fontSize: 14, color: theme.colors.textMuted, marginTop: 4 },
  // Modal styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalContent: {
    backgroundColor: theme.colors.background, borderTopLeftRadius: 24,
    borderTopRightRadius: 24, padding: 24, maxHeight: '90%',
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  modalTitle: { fontSize: 20, fontWeight: '700', color: theme.colors.text },
  modalSubtitle: { fontSize: 14, color: theme.colors.textSecondary, marginBottom: 16 },
  input: {
    backgroundColor: theme.colors.inputBg, borderRadius: 12,
    paddingHorizontal: 16, paddingVertical: 14, fontSize: 15,
    color: theme.colors.text, borderWidth: 1, borderColor: theme.colors.border, marginBottom: 12,
  },
  label: { fontSize: 14, fontWeight: '600', color: theme.colors.textSecondary, marginBottom: 8, marginTop: 4 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  chip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
    backgroundColor: theme.colors.inputBg, borderWidth: 1, borderColor: theme.colors.border,
  },
  chipActive: { backgroundColor: 'rgba(201,168,76,0.2)', borderColor: theme.colors.primary },
  chipText: { fontSize: 13, color: theme.colors.textSecondary },
  chipTextActive: { color: theme.colors.primary, fontWeight: '600' },
  submitBtn: {
    backgroundColor: theme.colors.primary, borderRadius: 14,
    paddingVertical: 16, alignItems: 'center', marginTop: 16,
    flexDirection: 'row', justifyContent: 'center', gap: 8,
  },
  submitBtnText: { fontSize: 16, fontWeight: '700', color: theme.colors.black },
});