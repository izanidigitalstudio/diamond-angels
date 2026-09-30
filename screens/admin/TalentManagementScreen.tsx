import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, FlatList, Image,
  ActivityIndicator, ScrollView, Alert, Modal, TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute } from '@react-navigation/native';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../lib/theme';
import { DEMO_TALENT } from '../../lib/demoTalent';
import ProfileReviewModal from '../../components/ProfileReviewModal';

const IMG_BASE = 'https://api.a0.dev/assets/image';
function generatePhotosForProfile(p: any): string[] {
  const race = (p.race || '').toLowerCase();
  const city = (p.city || '').toLowerCase();
  const body = (p.bodyType || '').toLowerCase();
  const cat = (p.categories?.[0] || 'model').toLowerCase();
  let seed = 0;
  const id = String(p._id || p.id || '');
  for (let i = 0; i < id.length; i++) seed = ((seed << 5) - seed + id.charCodeAt(i)) | 0;
  seed = Math.abs(seed) % 10000;
  const base = `professional ${race} female ${cat} ${body} ${city}`;
  return [
    `${IMG_BASE}?text=${encodeURIComponent(base + ' portrait elegant studio')}&aspect=3:4&seed=${seed}`,
    `${IMG_BASE}?text=${encodeURIComponent(base + ' full body')}&aspect=3:4&seed=${seed + 1}`,
    `${IMG_BASE}?text=${encodeURIComponent(base + ' lifestyle')}&aspect=3:4&seed=${seed + 2}`,
  ];
}

function getProfileCompleteness(p: any): { score: number; missing: string[] } {
  const missing: string[] = [];
  if (!p.firstName || !p.lastName) missing.push('Name');
  if (!p.phone) missing.push('Phone');
  if (!p.city) missing.push('City');
  if (!p.race) missing.push('Race');
  if (!p.bodyType) missing.push('Body Type');
  if (!p.heightCm) missing.push('Height');
  if (!p.bio) missing.push('Bio');
  if (!p.categories?.length) missing.push('Categories');
  const photoCount = (p.photoUrls || []).filter(Boolean).length;
  if (photoCount === 0) missing.push('Photos');
  if (!p.email) missing.push('Email');
  if (!p.instagram) missing.push('Instagram');
  if (!p.nokFullName) missing.push('Next of Kin');
  const total = 13;
  const filled = total - missing.length;
  return { score: Math.round((filled / total) * 100), missing };
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { bg: string; color: string; icon: string }> = {
    pending: { bg: 'rgba(245,158,11,0.15)', color: theme.colors.warning, icon: 'time-outline' },
    approved: { bg: 'rgba(16,185,129,0.15)', color: theme.colors.success, icon: 'checkmark-circle-outline' },
    declined: { bg: 'rgba(239,68,68,0.15)', color: theme.colors.error, icon: 'close-circle-outline' },
    archived: { bg: 'rgba(107,114,128,0.15)', color: '#6B7280', icon: 'archive-outline' },
  };
  const c = config[status] || config.pending;
  return (
    <View style={[sbSt.badge, { backgroundColor: c.bg }]}>
      <Ionicons name={c.icon as any} size={12} color={c.color} />
      <Text style={[sbSt.text, { color: c.color }]}>{status.charAt(0).toUpperCase() + status.slice(1)}</Text>
    </View>
  );
}
const sbSt = StyleSheet.create({
  badge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  text: { fontSize: 11, fontWeight: '700' },
});

export default function TalentManagementScreen() {
  const route = useRoute<any>();
  const [statusFilter, setStatusFilter] = useState('pending');
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
  const [sortMode, setSortMode] = useState(false);
  const [reordering, setReordering] = useState(false);
  const [positionModal, setPositionModal] = useState<{ index: number; name: string } | null>(null);
  const [positionInput, setPositionInput] = useState('');

  const profiles = useQuery(api.talent.listAllProfiles, statusFilter ? { status: statusFilter } : {});
  const pendingProfiles = useQuery(api.talent.listAllProfiles, { status: 'pending' });
  const approvedProfiles = useQuery(api.talent.listAllProfiles, { status: 'approved' });
  const declinedProfiles = useQuery(api.talent.listAllProfiles, { status: 'declined' });
  const archivedProfiles = useQuery(api.talent.listAllProfiles, { status: 'archived' });

  const adminUpdate = useMutation(api.talent.adminUpdateProfile);

  React.useEffect(() => {
    const params = route.params as any;
    if (params?.filterStatus) {
      setStatusFilter(params.filterStatus);
    }
  }, [route.params]);

  const counts = {
    pending: pendingProfiles?.length ?? 0,
    approved: approvedProfiles?.length ?? 0,
    declined: declinedProfiles?.length ?? 0,
    archived: archivedProfiles?.length ?? 0,
  };

  const displayProfiles = React.useMemo(() => {
    if (profiles !== undefined && profiles.length > 0) {
      return profiles.map((p: any) => {
        const existingPhotos = [...(p.photoUrls || [])].filter(Boolean);
        const photos = existingPhotos.length > 0 ? existingPhotos : generatePhotosForProfile(p);
        return { ...p, photoUrls: photos };
      });
    }
    if (profiles === undefined && statusFilter === 'approved') {
      return DEMO_TALENT.map((t: any) => ({
        ...t,
        _id: t.id,
        photoUrls: t.photos || [],
        bio: t.background || '',
        phone: '07X XXX XXXX',
      }));
    }
    return [];
  }, [profiles, statusFilter]);

  const selectedProfile = React.useMemo(() => {
    if (!selectedProfileId) return null;
    return displayProfiles.find((p: any) => p._id === selectedProfileId) || null;
  }, [selectedProfileId, displayProfiles]);

  const handleMoveToPosition = async (fromIndex: number, toPosition: number) => {
    if (toPosition < 1 || toPosition > displayProfiles.length) {
      Alert.alert('Invalid', `Enter a number between 1 and ${displayProfiles.length}`);
      return;
    }
    setReordering(true);
    try {
      const reordered = [...displayProfiles];
      const [moved] = reordered.splice(fromIndex, 1);
      reordered.splice(toPosition - 1, 0, moved);
      for (let i = 0; i < reordered.length; i++) {
        await adminUpdate({ profileId: reordered[i]._id, displayOrder: (i + 1) * 10 });
      }
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to reorder');
    } finally {
      setReordering(false);
    }
  };

  const handleAutoAssign = async () => {
    setReordering(true);
    try {
      for (let i = 0; i < displayProfiles.length; i++) {
        await adminUpdate({ profileId: displayProfiles[i]._id, displayOrder: (i + 1) * 10 });
      }
      Alert.alert('Done', `Assigned display order to ${displayProfiles.length} profiles`);
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to auto-assign order');
    } finally {
      setReordering(false);
    }
  };

  if (profiles === undefined) return (
    <View style={[st.container, { justifyContent: 'center', alignItems: 'center' }]}>
      <ActivityIndicator size="large" color={theme.colors.primary} />
    </View>
  );

  return (
    <View style={st.container}>
      <SafeAreaView style={st.safe} edges={['top']}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, marginTop: 16, marginBottom: 12 }}>
          <Text style={[st.title, { marginTop: 0, marginBottom: 0, paddingHorizontal: 0 }]}>Talent</Text>
          {statusFilter === 'approved' && (
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {sortMode && (
                <TouchableOpacity
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(201,168,76,0.15)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 }}
                  onPress={handleAutoAssign}
                >
                  <Ionicons name="refresh" size={14} color={theme.colors.primary} />
                  <Text style={{ color: theme.colors.primary, fontSize: 11, fontWeight: '600' }}>Auto-Number</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={{
                  flexDirection: 'row', alignItems: 'center', gap: 4,
                  backgroundColor: sortMode ? theme.colors.primary : theme.colors.card,
                  paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8,
                  borderWidth: 1, borderColor: theme.colors.primary,
                }}
                onPress={() => {
                  if (!sortMode) {
                    const hasNoOrder = displayProfiles.some((p: any) => p.displayOrder === undefined || p.displayOrder === null);
                    if (hasNoOrder) {
                      handleAutoAssign();
                    }
                  }
                  setSortMode(!sortMode);
                }}
              >
                <Ionicons name={sortMode ? "checkmark" : "swap-vertical"} size={14} color={sortMode ? theme.colors.black : theme.colors.primary} />
                <Text style={{ color: sortMode ? theme.colors.black : theme.colors.primary, fontSize: 12, fontWeight: '700' }}>
                  {sortMode ? 'Done' : 'Sort'}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexShrink: 0 }} contentContainerStyle={st.filterRow}>
          {([
            { key: 'pending', label: 'Pending', count: counts.pending, color: theme.colors.warning },
            { key: 'approved', label: 'Approved', count: counts.approved, color: theme.colors.success },
            { key: 'declined', label: 'Declined', count: counts.declined, color: theme.colors.error },
            { key: 'archived', label: 'Archived', count: counts.archived, color: '#6B7280' },
          ] as const).map((s) => (
            <TouchableOpacity
              key={s.key}
              style={[st.filterChip, statusFilter === s.key && st.filterChipActive]}
              onPress={() => { setStatusFilter(s.key); setSortMode(false); }}
            >
              <View style={[st.filterDot, { backgroundColor: statusFilter === s.key ? s.color : theme.colors.textMuted }]} />
              <Text style={[st.filterText, statusFilter === s.key && st.filterTextActive]}>
                {s.label}
              </Text>
              <View style={[st.filterCount, { backgroundColor: statusFilter === s.key ? s.color + '30' : theme.colors.cardLight }]}>
                <Text style={[st.filterCountText, { color: statusFilter === s.key ? s.color : theme.colors.textMuted }]}>
                  {s.count}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {sortMode && statusFilter === 'approved' && (
          <View style={{ paddingHorizontal: 20, paddingBottom: 8 }}>
            <Text style={{ color: theme.colors.textSecondary, fontSize: 12, fontStyle: 'italic' }}>
              Tap a talent card to change their position.
            </Text>
            {reordering && (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 }}>
                <ActivityIndicator size="small" color={theme.colors.primary} />
                <Text style={{ color: theme.colors.primary, fontSize: 12 }}>Updating order...</Text>
              </View>
            )}
          </View>
        )}

        <FlatList
          data={displayProfiles}
          keyExtractor={(item: any) => item._id || item.id}
          contentContainerStyle={st.list}
          ListEmptyComponent={
            <View style={st.empty}>
              <Ionicons name="people-outline" size={48} color={theme.colors.textMuted} />
              <Text style={st.emptyText}>No {statusFilter} profiles</Text>
              <Text style={st.emptySubtext}>
                {statusFilter === 'pending' ? 'New applications will appear here' :
                 statusFilter === 'approved' ? 'Approved talent will appear here' :
                 statusFilter === 'archived' ? 'Archived talent will appear here' :
                 'Declined applications will appear here'}
              </Text>
            </View>
          }
          renderItem={({ item, index }: any) => {
            const completeness = getProfileCompleteness(item);
            const isApprovedSort = sortMode && statusFilter === 'approved';

            return (
              <TouchableOpacity
                style={[st.card, isApprovedSort && { borderColor: theme.colors.primary + '40' }]}
                onPress={() => {
                  if (isApprovedSort) {
                    setPositionModal({ index, name: `${item.firstName} ${item.lastName}` });
                    setPositionInput(String(index + 1));
                  } else {
                    setSelectedProfileId(item._id);
                  }
                }}
                activeOpacity={0.7}
                disabled={reordering}
              >
                {isApprovedSort && (
                  <View style={st.orderBadge}>
                    <Text style={st.orderBadgeText}>{index + 1}</Text>
                  </View>
                )}
                {item.photoUrls?.[0] ? (
                  <Image source={{ uri: item.photoUrls[0] }} style={st.cardPhoto} />
                ) : (
                  <View style={[st.cardPhoto, { backgroundColor: theme.colors.cardLight, alignItems: 'center', justifyContent: 'center' }]}>
                    <Ionicons name="person" size={24} color={theme.colors.textMuted} />
                  </View>
                )}
                <View style={st.cardInfo}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                    <Text style={st.cardName} numberOfLines={1}>{item.firstName} {item.lastName}</Text>
                    <StatusBadge status={item.status || statusFilter} />
                  </View>
                  <Text style={st.cardSub}>{item.city} � {item.heightCm}cm � {item.race}</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 }}>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4, flex: 1 }}>
                      {item.categories?.slice(0, 2).map((c: string) => (
                        <View key={c} style={st.tag}><Text style={st.tagText}>{c}</Text></View>
                      ))}
                    </View>
                    {completeness.score < 100 && !isApprovedSort && (
                      <View style={st.completenessChip}>
                        <Ionicons name="alert-circle" size={10} color={theme.colors.warning} />
                        <Text style={st.completenessText}>{completeness.score}%</Text>
                      </View>
                    )}
                  </View>
                </View>
                {isApprovedSort ? (
                  <Ionicons name="create-outline" size={18} color={theme.colors.primary} />
                ) : (
                  <Ionicons name="chevron-forward" size={18} color={theme.colors.textMuted} />
                )}
              </TouchableOpacity>
            );
          }}
        />

        {/* Position Input Modal */}
        <Modal visible={!!positionModal} transparent animationType="fade">
          <View style={st.modalOverlay}>
            <View style={st.modalCard}>
              <Text style={st.modalTitle}>Set Position</Text>
              <Text style={st.modalSub}>
                Move "{positionModal?.name}" to position:
              </Text>
              <TextInput
                style={st.modalInput}
                value={positionInput}
                onChangeText={setPositionInput}
                keyboardType="number-pad"
                autoFocus
                selectTextOnFocus
                placeholder={`1-${displayProfiles.length}`}
                placeholderTextColor={theme.colors.textMuted}
              />
              <View style={st.modalButtons}>
                <TouchableOpacity
                  style={st.modalBtnCancel}
                  onPress={() => setPositionModal(null)}
                >
                  <Text style={st.modalBtnCancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={st.modalBtnConfirm}
                  onPress={async () => {
                    const pos = parseInt(positionInput, 10);
                    if (positionModal) {
                      setPositionModal(null);
                      await handleMoveToPosition(positionModal.index, pos);
                    }
                  }}
                >
                  <Text style={st.modalBtnConfirmText}>Move</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        <ProfileReviewModal
          visible={!!selectedProfile}
          profile={selectedProfile}
          onClose={() => setSelectedProfileId(null)}
          onActionComplete={() => setSelectedProfileId(null)}
        />
      </SafeAreaView>
    </View>
  );
}

const st = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  safe: { flex: 1 },
  title: { fontSize: 28, fontWeight: '800', color: theme.colors.primary, paddingHorizontal: 20, marginTop: 16, marginBottom: 12 },
  filterRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 20, marginBottom: 14, flexGrow: 0 },
  filterChip: {
  flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
  height: 36, paddingHorizontal: 12, borderRadius: 12, backgroundColor: theme.colors.card,
  borderWidth: 1, borderColor: theme.colors.border,
  },
  filterChipActive: { backgroundColor: 'rgba(201,168,76,0.1)', borderColor: theme.colors.primary },
  filterDot: { width: 6, height: 6, borderRadius: 3 },
  filterText: { fontSize: 12, color: theme.colors.textSecondary, fontWeight: '600' },
  filterTextActive: { color: theme.colors.primary },
  filterCount: { paddingHorizontal: 6, paddingVertical: 1, borderRadius: 8, minWidth: 22, alignItems: 'center' as const },
  filterCountText: { fontSize: 11, fontWeight: '700' },
  list: { paddingHorizontal: 20, paddingBottom: 20 },
  card: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.card,
    borderRadius: 14, padding: 12, marginBottom: 10, borderWidth: 1, borderColor: theme.colors.border,
  },
  cardPhoto: { width: 64, height: 80, borderRadius: 10, marginRight: 12 },
  cardInfo: { flex: 1 },
  cardName: { fontSize: 15, fontWeight: '700', color: theme.colors.text, flexShrink: 1 },
  cardSub: { fontSize: 12, color: theme.colors.textMuted, marginTop: 2 },
  tag: { backgroundColor: 'rgba(201,168,76,0.15)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  tagText: { fontSize: 10, color: theme.colors.primary, fontWeight: '600' },
  completenessChip: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6,
    backgroundColor: 'rgba(245,158,11,0.1)',
  },
  completenessText: { fontSize: 10, fontWeight: '700', color: theme.colors.warning },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyText: { fontSize: 17, fontWeight: '600', color: theme.colors.textSecondary, marginTop: 12 },
  emptySubtext: { fontSize: 13, color: theme.colors.textMuted, marginTop: 4 },
  orderBadge: {
    width: 24, height: 24, borderRadius: 12, backgroundColor: theme.colors.primary,
    alignItems: 'center', justifyContent: 'center', marginRight: 8,
  },
  orderBadgeText: { fontSize: 11, fontWeight: '800', color: theme.colors.black },
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center', alignItems: 'center', padding: 40,
  },
  modalCard: {
    backgroundColor: theme.colors.card, borderRadius: 16, padding: 24,
    width: '100%', borderWidth: 1, borderColor: theme.colors.border,
  },
  modalTitle: { fontSize: 18, fontWeight: '700', color: theme.colors.text, marginBottom: 8 },
  modalSub: { fontSize: 14, color: theme.colors.textSecondary, marginBottom: 16 },
  modalInput: {
    backgroundColor: theme.colors.cardLight, borderRadius: 10, padding: 14,
    fontSize: 20, fontWeight: '700', color: theme.colors.text, textAlign: 'center',
    borderWidth: 1, borderColor: theme.colors.border, marginBottom: 16,
  },
  modalButtons: { flexDirection: 'row', gap: 12 },
  modalBtnCancel: {
    flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: 'center',
    backgroundColor: theme.colors.cardLight,
  },
  modalBtnCancelText: { fontSize: 15, fontWeight: '600', color: theme.colors.textSecondary },
  modalBtnConfirm: {
    flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: 'center',
    backgroundColor: theme.colors.primary,
  },
  modalBtnConfirmText: { fontSize: 15, fontWeight: '700', color: theme.colors.black },
});
