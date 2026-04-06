import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, FlatList, Image,
  ActivityIndicator, Modal, ScrollView, Alert, TextInput, Linking,
  KeyboardAvoidingView, Platform, Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation, useAction } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../lib/theme';
import { SA_CITIES, CATEGORIES, EVENT_TYPES } from '../../lib/constants';

export default function GigManagementScreen() {
  const [showCreate, setShowCreate] = useState(false);
  const [showInterests, setShowInterests] = useState<any>(null);
  const [editGig, setEditGig] = useState<any>(null);
  const [seedingGigs, setSeedingGigs] = useState(false);
  const [smsGig, setSmsGig] = useState<any>(null);
  const [form, setForm] = useState({
    title: '', description: '', eventType: '', city: '',
    venue: '', eventDate: '', talentNeeded: '', categories: [] as string[],
    requirements: '', compensation: '',
  });

  const gigs = useQuery(api.gigs.listGigs, {});
  const createGig = useMutation(api.gigs.createGig);
  const updateGig = useMutation(api.gigs.updateGig);
  const seedGigsMut = useMutation(api.gigs.seedDemoGigsFromDashboard);
  const logSmsMut = useMutation(api.smsLog.logSms);

  const resetForm = () => {
    setForm({ title: '', description: '', eventType: '', city: '', venue: '', eventDate: '', talentNeeded: '', categories: [], requirements: '', compensation: '' });
  };

  const openEdit = (gig: any) => {
    setEditGig(gig);
    setForm({
      title: gig.title || '',
      description: gig.description || '',
      eventType: gig.eventType || '',
      city: gig.city || '',
      venue: gig.venue || '',
      eventDate: gig.eventDate || '',
      talentNeeded: String(gig.talentNeeded || ''),
      categories: gig.categories || [],
      requirements: gig.requirements || '',
      compensation: gig.compensation || '',
    });
    setShowCreate(true);
  };

  const handleCreate = async () => {
    if (!form.title || !form.eventType || !form.city || !form.eventDate || !form.talentNeeded) {
      Alert.alert('Missing Fields', 'Please fill in all required fields');
      return;
    }
    try {
      if (editGig) {
        await updateGig({
          gigId: editGig._id,
          title: form.title,
          description: form.description,
          eventType: form.eventType,
          city: form.city,
          venue: form.venue,
          eventDate: form.eventDate,
          talentNeeded: parseInt(form.talentNeeded),
          categories: form.categories,
          requirements: form.requirements,
          compensation: form.compensation,
        });
        Alert.alert('Success', 'Gig updated');
      } else {
        await createGig({
          ...form,
          talentNeeded: parseInt(form.talentNeeded),
        });
        Alert.alert('Success', 'Gig created');
      }
      setShowCreate(false);
      setEditGig(null);
      resetForm();
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to save gig');
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
              <Text style={styles.emptySubtext}>Create a gig or load demo gigs to get started</Text>
              <TouchableOpacity
                style={styles.seedBtn}
                onPress={async () => {
                  setSeedingGigs(true);
                  try {
                    const count = await seedGigsMut();
                    if (count > 0) Alert.alert('Done', `${count} demo gigs created.`);
                    else Alert.alert('Info', 'Demo gigs already exist.');
                  } catch (e: any) {
                    Alert.alert('Error', e.message || 'Failed to load demo gigs');
                  }
                  setSeedingGigs(false);
                }}
                disabled={seedingGigs}
                activeOpacity={0.7}
              >
                {seedingGigs ? (
                  <ActivityIndicator size="small" color={theme.colors.primary} />
                ) : (
                  <>
                    <Ionicons name="flash" size={18} color={theme.colors.primary} />
                    <Text style={styles.seedBtnText}>Load 10 Demo Gigs</Text>
                  </>
                )}
              </TouchableOpacity>
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
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <TouchableOpacity onPress={() => setSmsGig(item)}>
                    <Text style={styles.smsGigText}>SMS</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => openEdit(item)}>
                    <Text style={styles.editGigText}>Edit</Text>
                  </TouchableOpacity>
                  {item.status === 'open' && (
                    <TouchableOpacity onPress={() => handleCloseGig(item._id)}>
                      <Text style={styles.closeGigText}>Close Gig</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </View>
          )}
        />

        {/* Create/Edit Gig Modal */}
        <Modal visible={showCreate} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{editGig ? 'Edit Gig' : 'Create Gig'}</Text>
                <TouchableOpacity onPress={() => { setShowCreate(false); setEditGig(null); resetForm(); }}>
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
                  <Text style={styles.createBtnText}>{editGig ? 'Save Changes' : 'Create Gig'}</Text>
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

        {/* SMS Compose Modal */}
        <SmsComposeModal
          visible={!!smsGig}
          gig={smsGig}
          onClose={() => setSmsGig(null)}
          onLog={async (data) => {
            try {
              await logSmsMut(data);
            } catch (e) {
              // silently fail logging
            }
          }}
        />
      </SafeAreaView>
    </View>
  );
}

/* ---------- SMS Compose Modal ---------- */
function SmsComposeModal({ visible, gig, onClose, onLog }: {
  visible: boolean; gig: any; onClose: () => void;
  onLog: (data: any) => Promise<void>;
}) {
  const interests = useQuery(
    api.gigs.getGigInterests,
    gig ? { gigId: gig._id } : "skip"
  );
  const approvedTalent = useQuery(api.talent.listApprovedProfiles, {});
  const sendGigBriefSms = useAction(api.sms.sendGigBriefSms);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [message, setMessage] = useState('');
  const [showAllTalent, setShowAllTalent] = useState(false);
  const [sending, setSending] = useState(false);

  // Reset when gig changes
  React.useEffect(() => {
    if (gig) {
      setSelected(new Set());
      setShowAllTalent(false);
      setMessage(
        `Hi {name}! You've been selected for: ${gig.title}\n\n` +
        `Date: ${gig.eventDate}\n` +
        `Venue: ${gig.venue}, ${gig.city}\n` +
        `Rate: ${gig.compensation}\n\n` +
        `Brief: ${gig.requirements || gig.description}\n\n` +
        `Please confirm your availability. Thank you!\n- Diamond Angels`
      );
    }
  }, [gig?._id]);

  const talentList = showAllTalent ? (approvedTalent || []) : (interests || []);

  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    if (selected.size === talentList.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(talentList.map((t: any) => t._id)));
    }
  };

  const getSelectedTalent = () => talentList.filter((t: any) => selected.has(t._id));

  const formatPhoneForWhatsApp = (phone: string) => {
    let cleaned = phone.replace(/\D/g, '');
    if (cleaned.startsWith('0')) cleaned = '27' + cleaned.slice(1);
    return cleaned;
  };

  const handleSendSms = async () => {
    const selectedTalent = getSelectedTalent();
    if (selectedTalent.length === 0) {
      Alert.alert('No Selection', 'Please select at least one talent');
      return;
    }
    if (!message.trim()) {
      Alert.alert('No Message', 'Please enter a message');
      return;
    }

    const recipients = selectedTalent
      .filter((t: any) => t.phone)
      .map((t: any) => ({
        phone: t.phone,
        name: `${t.firstName} ${t.lastName}`,
        profileId: t._id,
      }));

    if (recipients.length === 0) {
      Alert.alert('No Phone Numbers', 'Selected talent have no phone numbers');
      return;
    }

    Alert.alert(
      'Send SMS via Clickatell',
      `Send SMS to ${recipients.length} recipient${recipients.length > 1 ? 's' : ''}?\n\nThis will use your Clickatell SMS credits.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send',
          onPress: async () => {
            setSending(true);
            try {
              const result = await sendGigBriefSms({
                recipients,
                message: message.trim(),
                gigTitle: gig?.title,
                channel: 'sms',
              });

              // Also log locally
              await onLog({
                gigId: gig._id,
                recipientIds: selectedTalent.map((t: any) => t._id),
                recipientCount: selectedTalent.length,
                message: message.trim(),
                channel: 'clickatell_sms',
              });

              if (result.failed === 0) {
                Alert.alert(
                  'SMS Sent',
                  `Successfully sent to ${result.sent} recipient${result.sent > 1 ? 's' : ''} via Clickatell.`,
                  [{ text: 'OK', onPress: onClose }]
                );
              } else {
                Alert.alert(
                  'Partial Send',
                  `Sent: ${result.sent}\nFailed: ${result.failed}\n\n${result.errors.slice(0, 3).join('\n')}`,
                );
              }
            } catch (e: any) {
              Alert.alert('SMS Failed', e.message || 'Failed to send SMS via Clickatell');
            }
            setSending(false);
          },
        },
      ]
    );
  };

  const handleSendWhatsApp = async () => {
    const selectedTalent = getSelectedTalent();
    if (selectedTalent.length === 0) {
      Alert.alert('No Selection', 'Please select at least one talent');
      return;
    }
    if (!message.trim()) {
      Alert.alert('No Message', 'Please enter a message');
      return;
    }

    setSending(true);
    try {
      await onLog({
        gigId: gig._id,
        recipientIds: selectedTalent.map((t: any) => t._id),
        recipientCount: selectedTalent.length,
        message: message.trim(),
        channel: 'whatsapp',
      });

      if (selectedTalent.length === 1) {
        // Single recipient - open direct WhatsApp chat
        const phone = formatPhoneForWhatsApp(selectedTalent[0].phone);
        const encoded = encodeURIComponent(message.trim());
        await Linking.openURL(`https://wa.me/${phone}?text=${encoded}`);
      } else {
        // Multiple recipients - copy message and show instructions
        Alert.alert(
          'Bulk WhatsApp',
          `Message will open for each of the ${selectedTalent.length} selected talent. Send one at a time.`,
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Start Sending',
              onPress: async () => {
                for (const talent of selectedTalent) {
                  if (talent.phone) {
                    const phone = formatPhoneForWhatsApp(talent.phone);
                    const encoded = encodeURIComponent(message.trim());
                    await Linking.openURL(`https://wa.me/${phone}?text=${encoded}`);
                    // Small delay between opens
                    await new Promise(r => setTimeout(r, 1000));
                  }
                }
              },
            },
          ]
        );
      }
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to open WhatsApp');
    }
    setSending(false);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <Pressable style={styles.modalOverlay} onPress={onClose}>
          <Pressable style={[styles.modalContent, { maxHeight: '95%' }]} onPress={e => e.stopPropagation()}>
            <View style={styles.modalHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.modalTitle}>Send SMS / WhatsApp</Text>
                {gig && <Text style={{ fontSize: 13, color: theme.colors.textMuted, marginTop: 2 }}>{gig.title}</Text>}
              </View>
              <TouchableOpacity onPress={onClose}>
                <Ionicons name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              {/* Toggle between interested and all approved talent */}
              <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
                <TouchableOpacity
                  style={[styles.chip, !showAllTalent && styles.chipActive]}
                  onPress={() => { setShowAllTalent(false); setSelected(new Set()); }}
                >
                  <Text style={[styles.chipText, !showAllTalent && styles.chipTextActive]}>
                    Interested ({interests?.length || 0})
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.chip, showAllTalent && styles.chipActive]}
                  onPress={() => { setShowAllTalent(true); setSelected(new Set()); }}
                >
                  <Text style={[styles.chipText, showAllTalent && styles.chipTextActive]}>
                    All Approved ({approvedTalent?.length || 0})
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Select All */}
              <TouchableOpacity
                style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 }}
                onPress={selectAll}
              >
                <Ionicons
                  name={selected.size === talentList.length && talentList.length > 0 ? 'checkbox' : 'square-outline'}
                  size={22}
                  color={theme.colors.primary}
                />
                <Text style={{ fontSize: 14, fontWeight: '600', color: theme.colors.text }}>
                  Select All ({talentList.length})
                </Text>
                {selected.size > 0 && (
                  <View style={{ backgroundColor: theme.colors.primary + '20', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 }}>
                    <Text style={{ fontSize: 12, fontWeight: '700', color: theme.colors.primary }}>
                      {selected.size} selected
                    </Text>
                  </View>
                )}
              </TouchableOpacity>

              {/* Talent List */}
              {talentList.length === 0 ? (
                <View style={{ alignItems: 'center', paddingVertical: 20 }}>
                  <Ionicons name="people-outline" size={32} color={theme.colors.textMuted} />
                  <Text style={{ fontSize: 13, color: theme.colors.textMuted, marginTop: 6 }}>
                    {showAllTalent ? 'No approved talent yet' : 'No interested talent yet'}
                  </Text>
                </View>
              ) : (
                <View style={{ maxHeight: 200, marginBottom: 12 }}>
                  <ScrollView nestedScrollEnabled showsVerticalScrollIndicator={false}>
                    {talentList.map((t: any) => (
                      <TouchableOpacity
                        key={t._id}
                        style={{
                          flexDirection: 'row', alignItems: 'center', gap: 10,
                          paddingVertical: 8, paddingHorizontal: 8, borderRadius: 10,
                          backgroundColor: selected.has(t._id) ? theme.colors.primary + '10' : 'transparent',
                          marginBottom: 2,
                        }}
                        onPress={() => toggleSelect(t._id)}
                        activeOpacity={0.7}
                      >
                        <Ionicons
                          name={selected.has(t._id) ? 'checkbox' : 'square-outline'}
                          size={20}
                          color={selected.has(t._id) ? theme.colors.primary : theme.colors.textMuted}
                        />
                        {t.photoUrls?.[0] ? (
                          <Image source={{ uri: t.photoUrls[0] }} style={{ width: 36, height: 44, borderRadius: 8 }} />
                        ) : (
                          <View style={{ width: 36, height: 44, borderRadius: 8, backgroundColor: theme.colors.cardLight, alignItems: 'center', justifyContent: 'center' }}>
                            <Ionicons name="person" size={16} color={theme.colors.textMuted} />
                          </View>
                        )}
                        <View style={{ flex: 1 }}>
                          <Text style={{ fontSize: 14, fontWeight: '600', color: theme.colors.text }} numberOfLines={1}>
                            {t.firstName} {t.lastName}
                          </Text>
                          <Text style={{ fontSize: 11, color: theme.colors.textMuted }} numberOfLines={1}>
                            {t.phone || 'No phone'} · {t.city}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}

              {/* Message Compose */}
              <Text style={styles.label}>Message</Text>
              <TextInput
                style={[styles.input, { minHeight: 140, textAlignVertical: 'top' }]}
                multiline
                placeholder="Type your message..."
                placeholderTextColor={theme.colors.textMuted}
                value={message}
                onChangeText={setMessage}
              />

              {/* Quick Templates */}
              <Text style={{ fontSize: 12, fontWeight: '600', color: theme.colors.textMuted, marginBottom: 8 }}>Quick Templates</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  {[
                    { label: 'Gig Brief', msg: `Hi! You've been selected for: ${gig?.title || ''}\n\nDate: ${gig?.eventDate || ''}\nVenue: ${gig?.venue || ''}, ${gig?.city || ''}\nRate: ${gig?.compensation || ''}\n\nBrief: ${gig?.requirements || gig?.description || ''}\n\nPlease confirm your availability. Thank you!` },
                    { label: 'Reminder', msg: `Reminder: ${gig?.title || ''} is on ${gig?.eventDate || ''}. Please be at ${gig?.venue || ''} by [TIME]. Dress code: [DRESS CODE]. Contact us if you have any questions.` },
                    { label: 'Confirmation', msg: `You are confirmed for ${gig?.title || ''} on ${gig?.eventDate || ''} at ${gig?.venue || ''}, ${gig?.city || ''}. Rate: ${gig?.compensation || ''}. Please arrive 30 min early. See you there!` },
                    { label: 'Update', msg: `Update regarding ${gig?.title || ''}: [YOUR UPDATE HERE]. Please acknowledge receipt of this message.` },
                  ].map((tmpl) => (
                    <TouchableOpacity
                      key={tmpl.label}
                      style={{ paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: theme.colors.inputBg, borderWidth: 1, borderColor: theme.colors.border }}
                      onPress={() => setMessage(tmpl.msg)}
                    >
                      <Text style={{ fontSize: 12, color: theme.colors.textSecondary, fontWeight: '600' }}>{tmpl.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>

              {/* Send Buttons */}
              <View style={{ flexDirection: 'row', gap: 12, marginBottom: 20 }}>
                <TouchableOpacity
                  style={{
                    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
                    paddingVertical: 14, borderRadius: 14, backgroundColor: '#3B82F6',
                    opacity: selected.size === 0 ? 0.4 : 1,
                  }}
                  onPress={handleSendSms}
                  disabled={selected.size === 0 || sending}
                  activeOpacity={0.7}
                >
                  {sending ? <ActivityIndicator size="small" color="#fff" /> : (
                    <>
                      <Ionicons name="chatbubble" size={18} color="#fff" />
                      <Text style={{ fontSize: 15, fontWeight: '700', color: '#fff' }}>
                        SMS ({selected.size})
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  style={{
                    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
                    paddingVertical: 14, borderRadius: 14, backgroundColor: '#25D366',
                    opacity: selected.size === 0 ? 0.4 : 1,
                  }}
                  onPress={handleSendWhatsApp}
                  disabled={selected.size === 0 || sending}
                  activeOpacity={0.7}
                >
                  {sending ? <ActivityIndicator size="small" color="#fff" /> : (
                    <>
                      <Ionicons name="logo-whatsapp" size={18} color="#fff" />
                      <Text style={{ fontSize: 15, fontWeight: '700', color: '#fff' }}>
                        WhatsApp ({selected.size})
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
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
  editGigText: { fontSize: 13, color: theme.colors.primary, fontWeight: '600' },
  smsGigText: { fontSize: 13, color: '#3B82F6', fontWeight: '600' },
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
  seedBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    marginTop: 16, paddingHorizontal: 20, paddingVertical: 12,
    borderRadius: 12, backgroundColor: theme.colors.card,
    borderWidth: 1, borderColor: theme.colors.border,
  },
  seedBtnText: { fontSize: 14, color: theme.colors.primary, fontWeight: '600' },
});