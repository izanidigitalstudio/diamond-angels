import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Image, Modal, ScrollView,
  Alert, TextInput, ActivityIndicator, Dimensions, NativeSyntheticEvent, NativeScrollEvent,
} from 'react-native';
import { useMutation } from 'convex/react';
import { api } from '../convex/_generated/api';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { theme } from '../lib/theme';
import { SA_CITIES, RACE_OPTIONS, BODY_TYPES, CATEGORIES } from '../lib/constants';

const { width: SCREEN_W } = Dimensions.get('window');
const SLIDE_W = SCREEN_W - 48;

const DECLINE_REASONS = [
  'Photos do not meet quality standards',
  'Incomplete profile information',
  'Does not meet minimum requirements',
  'Duplicate profile detected',
  'Inappropriate content in profile',
  'Unable to verify identity',
];

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
    <View style={[sbStyles.badge, { backgroundColor: c.bg }]}>
      <Ionicons name={c.icon as any} size={12} color={c.color} />
      <Text style={[sbStyles.text, { color: c.color }]}>{status.charAt(0).toUpperCase() + status.slice(1)}</Text>
    </View>
  );
}
const sbStyles = StyleSheet.create({
  badge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  text: { fontSize: 11, fontWeight: '700' },
});

function PhotoSlider({ photos }: { photos: string[] }) {
  const [activeIdx, setActiveIdx] = useState(0);
  const validPhotos = photos.filter(Boolean);
  if (validPhotos.length === 0) return (
    <View style={[psStyles.slide, { backgroundColor: theme.colors.cardLight, alignItems: 'center', justifyContent: 'center' }]}>
      <Ionicons name="person" size={48} color={theme.colors.textMuted} />
    </View>
  );
  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const idx = Math.round(e.nativeEvent.contentOffset.x / SLIDE_W);
    setActiveIdx(idx);
  };
  return (
    <View>
      <ScrollView
        horizontal pagingEnabled showsHorizontalScrollIndicator={false}
        onScroll={onScroll} scrollEventThrottle={16}
        style={{ marginBottom: 8 }}
      >
        {validPhotos.map((url, i) => (
          <Image key={i} source={{ uri: url }} style={psStyles.slide} />
        ))}
      </ScrollView>
      {validPhotos.length > 1 && (
        <View style={psStyles.dots}>
          {validPhotos.map((_, i) => (
            <View key={i} style={[psStyles.dot, activeIdx === i && psStyles.dotActive]} />
          ))}
        </View>
      )}
      <Text style={psStyles.counter}>{activeIdx + 1} / {validPhotos.length}</Text>
    </View>
  );
}
const psStyles = StyleSheet.create({
  slide: { width: SLIDE_W, height: SLIDE_W * 1.25, borderRadius: 14 },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: 4 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: theme.colors.border },
  dotActive: { backgroundColor: theme.colors.primary, width: 20 },
  counter: { color: theme.colors.textMuted, fontSize: 12, textAlign: 'center', marginTop: 4 },
});

interface ProfileReviewModalProps {
  visible: boolean;
  profile: any;
  onClose: () => void;
  onActionComplete?: () => void;
}

export default function ProfileReviewModal({ visible, profile, onClose, onActionComplete }: ProfileReviewModalProps) {
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showDeclineModal, setShowDeclineModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [approveFeedback, setApproveFeedback] = useState('');
  const [declineReason, setDeclineReason] = useState('');
  const [customDeclineReason, setCustomDeclineReason] = useState('');
  const [editData, setEditData] = useState<any>({});
  const [uploading, setUploading] = useState(false);

  const approveProfile = useMutation(api.talent.approveProfile);
  const declineProfile = useMutation(api.talent.declineProfile);
  const reapproveProfile = useMutation(api.talent.reapproveProfile);
  const archiveProfileMut = useMutation(api.talent.archiveProfile);
  const unarchiveProfileMut = useMutation(api.talent.unarchiveProfile);
  const adminUpdate = useMutation(api.talent.adminUpdateProfile);
  const adminDelete = useMutation(api.talent.adminDeleteProfile);
  const adminAddPhoto = useMutation(api.talent.adminAddPhoto);
  const adminRemovePhoto = useMutation(api.talent.adminRemovePhoto);
  const adminReorderPhotos = useMutation(api.talent.adminReorderPhotos);
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);

  if (!profile) return null;

  const completeness = getProfileCompleteness(profile);
  const status = profile.status || 'pending';

  const handleApprove = async () => {
    try {
      if (status === 'declined') {
        await reapproveProfile({ profileId: profile._id, feedback: approveFeedback || undefined });
      } else {
        await approveProfile({ profileId: profile._id, feedback: approveFeedback || undefined });
      }
      Alert.alert('Approved', `${profile.firstName} ${profile.lastName} has been approved.`);
      setShowApproveModal(false);
      setApproveFeedback('');
      onClose();
      onActionComplete?.();
    } catch (e: any) { Alert.alert('Error', e.message); }
  };

  const handleDecline = async () => {
    const reason = declineReason === '__custom__' ? customDeclineReason : declineReason;
    if (!reason) {
      Alert.alert('Required', 'Please select or provide a reason for declining');
      return;
    }
    try {
      await declineProfile({ profileId: profile._id, reason });
      Alert.alert('Declined', `${profile.firstName} ${profile.lastName} has been declined.`);
      setShowDeclineModal(false);
      setDeclineReason('');
      setCustomDeclineReason('');
      onClose();
      onActionComplete?.();
    } catch (e: any) { Alert.alert('Error', e.message); }
  };

  const handleDelete = () => {
    Alert.alert('Delete Profile', `Permanently delete ${profile.firstName} ${profile.lastName}'s profile? This cannot be undone.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          try {
            await adminDelete({ profileId: profile._id });
            Alert.alert('Deleted', 'Profile has been permanently deleted');
            onClose();
            onActionComplete?.();
          } catch (e: any) { Alert.alert('Error', e.message); }
        }
      },
    ]);
  };

  const handleArchive = () => {
    Alert.alert(
      'Archive Profile',
      `Remove ${profile.firstName} ${profile.lastName} from the active listing? They can be redeployed later.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Archive',
          onPress: async () => {
            try {
              await archiveProfileMut({ profileId: profile._id });
              Alert.alert('Archived', `${profile.firstName} ${profile.lastName} has been archived.`);
              onClose();
              onActionComplete?.();
            } catch (e: any) { Alert.alert('Error', e.message); }
          },
        },
      ]
    );
  };

  const handleUnarchive = async () => {
    try {
      await unarchiveProfileMut({ profileId: profile._id });
      Alert.alert('Redeployed', `${profile.firstName} ${profile.lastName} is now listed again.`);
      onClose();
      onActionComplete?.();
    } catch (e: any) { Alert.alert('Error', e.message); }
  };

  const openEdit = () => {
    setEditData({
      profileId: profile._id,
      firstName: profile.firstName || '',
      lastName: profile.lastName || '',
      phone: profile.phone || '',
      city: profile.city || '',
      area: profile.area || '',
      race: profile.race || '',
      bodyType: profile.bodyType || '',
      heightCm: String(profile.heightCm || ''),
      bio: profile.bio || '',
      categories: [...(profile.categories || [])],
      instagram: profile.instagram || '',
      email: profile.email || '',
      altPhone: profile.altPhone || '',
      workplace: profile.workplace || '',
      jobTitle: profile.jobTitle || '',
      tiktok: profile.tiktok || '',
      twitter: profile.twitter || '',
      facebook: profile.facebook || '',
      addressStreet: profile.addressStreet || '',
      addressCity: profile.addressCity || '',
      addressState: profile.addressState || '',
      addressPostalCode: profile.addressPostalCode || '',
      addressCountry: profile.addressCountry || '',
      nokFullName: profile.nokFullName || '',
      nokRelationship: profile.nokRelationship || '',
      nokPhone: profile.nokPhone || '',
      nokEmail: profile.nokEmail || '',
      nokAddress: profile.nokAddress || '',
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    try {
      await adminUpdate({
        profileId: editData.profileId,
        firstName: editData.firstName,
        lastName: editData.lastName,
        phone: editData.phone,
        city: editData.city,
        area: editData.area,
        race: editData.race,
        bodyType: editData.bodyType,
        heightCm: parseInt(editData.heightCm) || 170,
        bio: editData.bio,
        categories: editData.categories,
        instagram: editData.instagram || undefined,
        email: editData.email || undefined,
        altPhone: editData.altPhone || undefined,
        workplace: editData.workplace || undefined,
        jobTitle: editData.jobTitle || undefined,
        tiktok: editData.tiktok || undefined,
        twitter: editData.twitter || undefined,
        facebook: editData.facebook || undefined,
        addressStreet: editData.addressStreet || undefined,
        addressCity: editData.addressCity || undefined,
        addressState: editData.addressState || undefined,
        addressPostalCode: editData.addressPostalCode || undefined,
        addressCountry: editData.addressCountry || undefined,
        nokFullName: editData.nokFullName || undefined,
        nokRelationship: editData.nokRelationship || undefined,
        nokPhone: editData.nokPhone || undefined,
        nokEmail: editData.nokEmail || undefined,
        nokAddress: editData.nokAddress || undefined,
      });
      Alert.alert('Saved', 'Profile updated successfully');
      setShowEditModal(false);
      onClose();
      onActionComplete?.();
    } catch (e: any) { Alert.alert('Error', e.message); }
  };

  const handleAddPhoto = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [3, 4],
        quality: 0.8,
      });
      if (result.canceled) return;
      setUploading(true);
      const uploadUrl = await generateUploadUrl();
      const response = await fetch(result.assets[0].uri);
      const blob = await response.blob();
      const uploadResult = await fetch(uploadUrl, { method: 'POST', body: blob, headers: { 'Content-Type': blob.type || 'image/jpeg' } });
      const { storageId } = await uploadResult.json();
      await adminAddPhoto({ profileId: profile._id, storageId });
      Alert.alert('Added', 'Photo added successfully');
    } catch (e: any) { Alert.alert('Error', e.message); }
    finally { setUploading(false); }
  };

  const handleRemovePhoto = (index: number) => {
    Alert.alert('Remove Photo', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove', style: 'destructive', onPress: async () => {
          try {
            await adminRemovePhoto({ profileId: profile._id, photoIndex: index });
          } catch (e: any) { Alert.alert('Error', e.message); }
        }
      },
    ]);
  };

  const handleMovePhoto = async (fromIndex: number, toIndex: number) => {
    try {
      await adminReorderPhotos({ profileId: profile._id, fromIndex, toIndex });
    } catch (e: any) { Alert.alert('Error', e.message); }
  };

  const toggleCategory = (cat: string) => {
    setEditData((prev: any) => ({
      ...prev,
      categories: prev.categories?.includes(cat)
        ? prev.categories.filter((c: string) => c !== cat)
        : [...(prev.categories || []), cat],
    }));
  };

  const photos = (profile.photoUrls || []).filter(Boolean);

  return (
    <>
      {/* ===== DETAIL MODAL ===== */}
      <Modal visible={visible && !showEditModal && !showApproveModal && !showDeclineModal} animationType="slide" transparent>
        <View style={st.modalOverlay}>
          <View style={st.modalContent}>
            <View style={st.modalHeader}>
              <View style={{ flex: 1 }}>
                <Text style={st.modalTitle}>{profile.firstName} {profile.lastName}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 }}>
                  <StatusBadge status={status} />
                  <Text style={{ fontSize: 12, color: completeness.score === 100 ? theme.colors.success : theme.colors.warning }}>
                    {completeness.score}% complete
                  </Text>
                </View>
              </View>
              <TouchableOpacity onPress={onClose} style={st.closeBtn}>
                <Ionicons name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              {photos.length > 0 && <PhotoSlider photos={photos} />}

              {/* Photo Management */}
              {profile.photoUrls && (
                <View style={st.photoMgmt}>
                  <Text style={st.sectionLabel}>Photos ({photos.length}/5)</Text>
                  <Text style={{ fontSize: 11, color: theme.colors.textMuted, marginBottom: 4 }}>
                    Tap arrows to reorder. First photo is the cover.
                  </Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 8 }}>
                    {profile.photoUrls.map((url: string, i: number) => url && (
                      <View key={i} style={st.photoThumbWrap}>
                        <Image source={{ uri: url }} style={st.photoThumb} />
                        {i === 0 && (
                          <View style={st.coverBadge}>
                            <Text style={st.coverBadgeText}>Cover</Text>
                          </View>
                        )}
                        <TouchableOpacity style={st.photoRemoveBtn} onPress={() => handleRemovePhoto(i)}>
                          <Ionicons name="close-circle" size={22} color={theme.colors.error} />
                        </TouchableOpacity>
                        <View style={st.photoArrows}>
                          {i > 0 && (
                            <TouchableOpacity style={st.arrowBtn} onPress={() => handleMovePhoto(i, i - 1)}>
                              <Ionicons name="chevron-back" size={14} color={theme.colors.primary} />
                            </TouchableOpacity>
                          )}
                          {i < photos.length - 1 && (
                            <TouchableOpacity style={st.arrowBtn} onPress={() => handleMovePhoto(i, i + 1)}>
                              <Ionicons name="chevron-forward" size={14} color={theme.colors.primary} />
                            </TouchableOpacity>
                          )}
                        </View>
                      </View>
                    ))}
                    {photos.length < 5 && (
                      <TouchableOpacity style={st.photoAddBtn} onPress={handleAddPhoto}>
                        {uploading ? <ActivityIndicator color={theme.colors.primary} /> : (
                          <>
                            <Ionicons name="add" size={24} color={theme.colors.primary} />
                            <Text style={{ color: theme.colors.primary, fontSize: 10, marginTop: 2 }}>Add</Text>
                          </>
                        )}
                      </TouchableOpacity>
                    )}
                  </ScrollView>
                </View>
              )}

              {/* Missing Info Warning */}
              {completeness.missing.length > 0 && (
                <View style={st.warningBox}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                    <Ionicons name="alert-circle" size={16} color={theme.colors.warning} />
                    <Text style={st.warningTitle}>Missing Information ({completeness.missing.length})</Text>
                  </View>
                  <Text style={st.warningText}>{completeness.missing.join(', ')}</Text>
                </View>
              )}

              {/* Admin Notes */}
              {profile.adminNotes && (
                <View style={st.notesBox}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                    <Ionicons name="chatbubble-ellipses" size={14} color={theme.colors.primary} />
                    <Text style={st.notesLabel}>Admin Notes</Text>
                  </View>
                  <Text style={st.notesText}>{profile.adminNotes}</Text>
                </View>
              )}

              {/* Decline Reason */}
              {status === 'declined' && profile.declineReason && (
                <View style={st.declineBox}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                    <Ionicons name="close-circle" size={14} color={theme.colors.error} />
                    <Text style={st.declineLabel}>Decline Reason</Text>
                  </View>
                  <Text style={st.declineText}>{profile.declineReason}</Text>
                </View>
              )}

              {/* Info Grid */}
              <View style={st.detailGrid}>
                <View style={st.detailItem}><Text style={st.detailLabel}>City</Text><Text style={st.detailValue}>{profile.city || '—'}</Text></View>
                <View style={st.detailItem}><Text style={st.detailLabel}>Area</Text><Text style={st.detailValue}>{profile.area || '—'}</Text></View>
                <View style={st.detailItem}><Text style={st.detailLabel}>Height</Text><Text style={st.detailValue}>{profile.heightCm ? `${profile.heightCm}cm` : '—'}</Text></View>
                <View style={st.detailItem}><Text style={st.detailLabel}>Race</Text><Text style={st.detailValue}>{profile.race || '—'}</Text></View>
                <View style={st.detailItem}><Text style={st.detailLabel}>Body Type</Text><Text style={st.detailValue}>{profile.bodyType || '—'}</Text></View>
                <View style={st.detailItem}><Text style={st.detailLabel}>Phone</Text><Text style={st.detailValue}>{profile.phone || '—'}</Text></View>
                {profile.instagram && <View style={st.detailItem}><Text style={st.detailLabel}>Instagram</Text><Text style={[st.detailValue, { color: theme.colors.primary }]}>@{profile.instagram}</Text></View>}
              </View>

              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
                {profile.categories?.map((c: string) => (
                  <View key={c} style={st.tag}><Text style={st.tagText}>{c}</Text></View>
                ))}
              </View>

              <Text style={st.sectionLabel}>Bio</Text>
              <Text style={st.bioText}>{profile.bio || profile.background || '—'}</Text>

              {/* Contact Details */}
              {(profile.email || profile.altPhone) && (
                <>
                  <Text style={st.sectionLabel}>Contact Details</Text>
                  <View style={st.detailGrid}>
                    {profile.email && <View style={st.detailItem}><Text style={st.detailLabel}>Email</Text><Text style={st.detailValue}>{profile.email}</Text></View>}
                    {profile.altPhone && <View style={st.detailItem}><Text style={st.detailLabel}>Alt Phone</Text><Text style={st.detailValue}>{profile.altPhone}</Text></View>}
                  </View>
                </>
              )}

              {/* Social Media */}
              {(profile.tiktok || profile.twitter || profile.facebook) && (
                <>
                  <Text style={st.sectionLabel}>Social Media</Text>
                  <View style={st.detailGrid}>
                    {profile.tiktok && <View style={st.detailItem}><Text style={st.detailLabel}>TikTok</Text><Text style={[st.detailValue, { color: '#00F2EA' }]}>@{profile.tiktok}</Text></View>}
                    {profile.twitter && <View style={st.detailItem}><Text style={st.detailLabel}>Twitter/X</Text><Text style={[st.detailValue, { color: '#1DA1F2' }]}>@{profile.twitter}</Text></View>}
                    {profile.facebook && <View style={st.detailItem}><Text style={st.detailLabel}>Facebook</Text><Text style={st.detailValue}>{profile.facebook}</Text></View>}
                  </View>
                </>
              )}

              {/* Workplace */}
              {(profile.workplace || profile.jobTitle) && (
                <>
                  <Text style={st.sectionLabel}>Workplace</Text>
                  <View style={st.detailGrid}>
                    {profile.workplace && <View style={st.detailItem}><Text style={st.detailLabel}>Company</Text><Text style={st.detailValue}>{profile.workplace}</Text></View>}
                    {profile.jobTitle && <View style={st.detailItem}><Text style={st.detailLabel}>Title</Text><Text style={st.detailValue}>{profile.jobTitle}</Text></View>}
                  </View>
                </>
              )}

              {/* Address */}
              {(profile.addressStreet || profile.addressCity) && (
                <>
                  <Text style={st.sectionLabel}>Residential Address</Text>
                  <Text style={st.bioText}>
                    {[profile.addressStreet, profile.addressCity, profile.addressState, profile.addressPostalCode, profile.addressCountry].filter(Boolean).join(', ')}
                  </Text>
                </>
              )}

              {/* Next of Kin */}
              {(profile.nokFullName || profile.nokPhone) && (
                <>
                  <Text style={st.sectionLabel}>Next of Kin</Text>
                  <View style={st.detailGrid}>
                    {profile.nokFullName && <View style={st.detailItem}><Text style={st.detailLabel}>Name</Text><Text style={st.detailValue}>{profile.nokFullName}</Text></View>}
                    {profile.nokRelationship && <View style={st.detailItem}><Text style={st.detailLabel}>Relation</Text><Text style={st.detailValue}>{profile.nokRelationship}</Text></View>}
                    {profile.nokPhone && <View style={st.detailItem}><Text style={st.detailLabel}>Phone</Text><Text style={st.detailValue}>{profile.nokPhone}</Text></View>}
                    {profile.nokEmail && <View style={st.detailItem}><Text style={st.detailLabel}>Email</Text><Text style={st.detailValue}>{profile.nokEmail}</Text></View>}
                  </View>
                </>
              )}

              {/* ===== ACTION BUTTONS ===== */}
              <View style={st.actionSection}>
                <Text style={st.actionSectionTitle}>Actions</Text>

                {/* Pending: Approve / Decline / Edit */}
                {status === 'pending' && (
                  <>
                    <View style={st.actionRow}>
                      <TouchableOpacity
                        style={[st.actionBtn, { backgroundColor: theme.colors.success }]}
                        onPress={() => setShowApproveModal(true)}
                      >
                        <Ionicons name="checkmark-circle" size={18} color="#FFF" />
                        <Text style={st.actionBtnText}>Approve</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[st.actionBtn, { backgroundColor: theme.colors.error }]}
                        onPress={() => setShowDeclineModal(true)}
                      >
                        <Ionicons name="close-circle" size={18} color="#FFF" />
                        <Text style={st.actionBtnText}>Decline</Text>
                      </TouchableOpacity>
                    </View>
                    <TouchableOpacity style={st.secondaryBtn} onPress={openEdit}>
                      <Ionicons name="create-outline" size={18} color={theme.colors.primary} />
                      <Text style={st.secondaryBtnText}>Edit Before Deciding</Text>
                    </TouchableOpacity>
                  </>
                )}

                {/* Approved: Edit / Photo / Archive / Delete */}
                {status === 'approved' && (
                  <>
                    <TouchableOpacity
                      style={[st.actionBtn, { backgroundColor: theme.colors.primary }]}
                      onPress={openEdit}
                    >
                      <Ionicons name="create-outline" size={18} color={theme.colors.black} />
                      <Text style={[st.actionBtnText, { color: theme.colors.black }]}>Edit / Update Profile</Text>
                    </TouchableOpacity>
                    <View style={st.actionRow}>
                      <TouchableOpacity style={[st.secondaryBtn, { flex: 1 }]} onPress={handleAddPhoto}>
                        <Ionicons name="camera-outline" size={16} color={theme.colors.primary} />
                        <Text style={st.secondaryBtnText}>Add Photo</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[st.secondaryBtn, { flex: 1, borderColor: '#6B7280' }]}
                        onPress={handleArchive}
                      >
                        <Ionicons name="archive-outline" size={16} color="#6B7280" />
                        <Text style={[st.secondaryBtnText, { color: '#6B7280' }]}>Archive</Text>
                      </TouchableOpacity>
                    </View>
                    <TouchableOpacity
                      style={[st.secondaryBtn, { borderColor: theme.colors.error }]}
                      onPress={handleDelete}
                    >
                      <Ionicons name="trash-outline" size={16} color={theme.colors.error} />
                      <Text style={[st.secondaryBtnText, { color: theme.colors.error }]}>Delete Permanently</Text>
                    </TouchableOpacity>
                  </>
                )}

                {/* Archived: Redeploy / Edit / Delete */}
                {status === 'archived' && (
                  <>
                    <TouchableOpacity
                      style={[st.actionBtn, { backgroundColor: theme.colors.success }]}
                      onPress={handleUnarchive}
                    >
                      <Ionicons name="arrow-undo-circle" size={18} color="#FFF" />
                      <Text style={st.actionBtnText}>Redeploy to Listing</Text>
                    </TouchableOpacity>
                    <View style={st.actionRow}>
                      <TouchableOpacity style={[st.secondaryBtn, { flex: 1 }]} onPress={openEdit}>
                        <Ionicons name="create-outline" size={16} color={theme.colors.primary} />
                        <Text style={st.secondaryBtnText}>Edit Profile</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[st.secondaryBtn, { flex: 1, borderColor: theme.colors.error }]}
                        onPress={handleDelete}
                      >
                        <Ionicons name="trash-outline" size={16} color={theme.colors.error} />
                        <Text style={[st.secondaryBtnText, { color: theme.colors.error }]}>Delete</Text>
                      </TouchableOpacity>
                    </View>
                  </>
                )}

                {/* Declined: Re-approve / Edit / Delete */}
                {status === 'declined' && (
                  <>
                    <TouchableOpacity
                      style={[st.actionBtn, { backgroundColor: theme.colors.success }]}
                      onPress={() => setShowApproveModal(true)}
                    >
                      <Ionicons name="checkmark-circle" size={18} color="#FFF" />
                      <Text style={st.actionBtnText}>Re-Approve Profile</Text>
                    </TouchableOpacity>
                    <View style={st.actionRow}>
                      <TouchableOpacity style={[st.secondaryBtn, { flex: 1 }]} onPress={openEdit}>
                        <Ionicons name="create-outline" size={16} color={theme.colors.primary} />
                        <Text style={st.secondaryBtnText}>Edit Profile</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[st.secondaryBtn, { flex: 1, borderColor: theme.colors.error }]}
                        onPress={handleDelete}
                      >
                        <Ionicons name="trash-outline" size={16} color={theme.colors.error} />
                        <Text style={[st.secondaryBtnText, { color: theme.colors.error }]}>Delete</Text>
                      </TouchableOpacity>
                    </View>
                  </>
                )}
              </View>

              <View style={{ height: 24 }} />
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ===== APPROVE CONFIRMATION ===== */}
      <Modal visible={showApproveModal} animationType="fade" transparent>
        <View style={[st.modalOverlay, { justifyContent: 'center' }]}>
          <View style={[st.modalContent, { borderRadius: 20, marginHorizontal: 20 }]}>
            <View style={{ alignItems: 'center', marginBottom: 16 }}>
              <View style={st.approveIcon}>
                <Ionicons name="checkmark-circle" size={40} color={theme.colors.success} />
              </View>
              <Text style={[st.modalTitle, { textAlign: 'center', marginTop: 8 }]}>
                {status === 'declined' ? 'Re-Approve' : 'Approve'} {profile.firstName}?
              </Text>
              <Text style={{ fontSize: 13, color: theme.colors.textSecondary, textAlign: 'center', marginTop: 4 }}>
                This profile will be visible to clients
              </Text>
            </View>
            <Text style={st.fieldLabel}>Feedback / Notes (optional)</Text>
            <TextInput
              style={[st.input, { height: 80, textAlignVertical: 'top' }]}
              placeholder="Add any notes for internal reference..."
              placeholderTextColor={theme.colors.textMuted}
              value={approveFeedback}
              onChangeText={setApproveFeedback}
              multiline
            />
            <View style={[st.actionRow, { marginTop: 16 }]}>
              <TouchableOpacity
                style={[st.actionBtn, { backgroundColor: theme.colors.cardLight }]}
                onPress={() => { setShowApproveModal(false); setApproveFeedback(''); }}
              >
                <Text style={[st.actionBtnText, { color: theme.colors.text }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[st.actionBtn, { backgroundColor: theme.colors.success }]}
                onPress={handleApprove}
              >
                <Ionicons name="checkmark" size={18} color="#FFF" />
                <Text style={st.actionBtnText}>
                  {status === 'declined' ? 'Re-Approve' : 'Approve'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ===== DECLINE CONFIRMATION ===== */}
      <Modal visible={showDeclineModal} animationType="fade" transparent>
        <View style={[st.modalOverlay, { justifyContent: 'center' }]}>
          <View style={[st.modalContent, { borderRadius: 20, marginHorizontal: 20, maxHeight: '80%' }]}>
            <View style={{ alignItems: 'center', marginBottom: 16 }}>
              <View style={st.declineIcon}>
                <Ionicons name="close-circle" size={40} color={theme.colors.error} />
              </View>
              <Text style={[st.modalTitle, { textAlign: 'center', marginTop: 8 }]}>
                Decline {profile.firstName}?
              </Text>
              <Text style={{ fontSize: 13, color: theme.colors.textSecondary, textAlign: 'center', marginTop: 4 }}>
                Select a reason or provide a custom one
              </Text>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={st.fieldLabel}>Reason for Decline</Text>
              <View style={{ gap: 6, marginBottom: 12 }}>
                {DECLINE_REASONS.map((reason) => (
                  <TouchableOpacity
                    key={reason}
                    style={[st.reasonChip, declineReason === reason && st.reasonChipActive]}
                    onPress={() => { setDeclineReason(reason); setCustomDeclineReason(''); }}
                  >
                    <Ionicons
                      name={declineReason === reason ? 'radio-button-on' : 'radio-button-off'}
                      size={18}
                      color={declineReason === reason ? theme.colors.error : theme.colors.textMuted}
                    />
                    <Text style={[st.reasonText, declineReason === reason && st.reasonTextActive]}>
                      {reason}
                    </Text>
                  </TouchableOpacity>
                ))}
                <TouchableOpacity
                  style={[st.reasonChip, declineReason === '__custom__' && st.reasonChipActive]}
                  onPress={() => setDeclineReason('__custom__')}
                >
                  <Ionicons
                    name={declineReason === '__custom__' ? 'radio-button-on' : 'radio-button-off'}
                    size={18}
                    color={declineReason === '__custom__' ? theme.colors.error : theme.colors.textMuted}
                  />
                  <Text style={[st.reasonText, declineReason === '__custom__' && st.reasonTextActive]}>
                    Other (custom reason)
                  </Text>
                </TouchableOpacity>
              </View>

              {declineReason === '__custom__' && (
                <TextInput
                  style={[st.input, { height: 70, textAlignVertical: 'top' }]}
                  placeholder="Describe the reason for declining..."
                  placeholderTextColor={theme.colors.textMuted}
                  value={customDeclineReason}
                  onChangeText={setCustomDeclineReason}
                  multiline
                />
              )}

              <View style={[st.actionRow, { marginTop: 12 }]}>
                <TouchableOpacity
                  style={[st.actionBtn, { backgroundColor: theme.colors.cardLight }]}
                  onPress={() => { setShowDeclineModal(false); setDeclineReason(''); setCustomDeclineReason(''); }}
                >
                  <Text style={[st.actionBtnText, { color: theme.colors.text }]}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[st.actionBtn, { backgroundColor: theme.colors.error, opacity: !declineReason || (declineReason === '__custom__' && !customDeclineReason) ? 0.5 : 1 }]}
                  onPress={handleDecline}
                  disabled={!declineReason || (declineReason === '__custom__' && !customDeclineReason)}
                >
                  <Ionicons name="close" size={18} color="#FFF" />
                  <Text style={st.actionBtnText}>Decline</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ===== EDIT MODAL ===== */}
      <Modal visible={showEditModal} animationType="slide" transparent>
        <View style={st.modalOverlay}>
          <View style={st.modalContent}>
            <View style={st.modalHeader}>
              <Text style={st.modalTitle}>Edit Profile</Text>
              <TouchableOpacity onPress={() => setShowEditModal(false)} style={st.closeBtn}>
                <Ionicons name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={st.fieldLabel}>First Name</Text>
              <TextInput style={st.input} value={editData.firstName} onChangeText={(v: string) => setEditData({ ...editData, firstName: v })} placeholderTextColor={theme.colors.textMuted} />
              <Text style={st.fieldLabel}>Last Name</Text>
              <TextInput style={st.input} value={editData.lastName} onChangeText={(v: string) => setEditData({ ...editData, lastName: v })} placeholderTextColor={theme.colors.textMuted} />
              <Text style={st.fieldLabel}>Phone</Text>
              <TextInput style={st.input} value={editData.phone} onChangeText={(v: string) => setEditData({ ...editData, phone: v })} placeholderTextColor={theme.colors.textMuted} />
              <Text style={st.fieldLabel}>City</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 10 }}>
                {SA_CITIES.map((c: string) => (
                  <TouchableOpacity key={c} style={[st.chip, editData.city === c && st.chipActive]} onPress={() => setEditData({ ...editData, city: c })}>
                    <Text style={[st.chipText, editData.city === c && st.chipTextActive]}>{c}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <Text style={st.fieldLabel}>Area / Suburb</Text>
              <TextInput style={st.input} value={editData.area} onChangeText={(v: string) => setEditData({ ...editData, area: v })} placeholderTextColor={theme.colors.textMuted} />
              <Text style={st.fieldLabel}>Race</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
                {RACE_OPTIONS.map((r: string) => (
                  <TouchableOpacity key={r} style={[st.chip, editData.race === r && st.chipActive]} onPress={() => setEditData({ ...editData, race: r })}>
                    <Text style={[st.chipText, editData.race === r && st.chipTextActive]}>{r}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={st.fieldLabel}>Body Type</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
                {BODY_TYPES.map((b: string) => (
                  <TouchableOpacity key={b} style={[st.chip, editData.bodyType === b && st.chipActive]} onPress={() => setEditData({ ...editData, bodyType: b })}>
                    <Text style={[st.chipText, editData.bodyType === b && st.chipTextActive]}>{b}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={st.fieldLabel}>Height (cm)</Text>
              <TextInput style={st.input} value={editData.heightCm} onChangeText={(v: string) => setEditData({ ...editData, heightCm: v })} keyboardType="numeric" placeholderTextColor={theme.colors.textMuted} />
              <Text style={st.fieldLabel}>Categories</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
                {CATEGORIES.map((c: string) => (
                  <TouchableOpacity key={c} style={[st.chip, editData.categories?.includes(c) && st.chipActive]} onPress={() => toggleCategory(c)}>
                    <Text style={[st.chipText, editData.categories?.includes(c) && st.chipTextActive]}>{c}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={st.fieldLabel}>Instagram Handle</Text>
              <TextInput style={st.input} value={editData.instagram} onChangeText={(v: string) => setEditData({ ...editData, instagram: v })} placeholderTextColor={theme.colors.textMuted} />
              <Text style={st.fieldLabel}>Bio</Text>
              <TextInput style={[st.input, { height: 80, textAlignVertical: 'top' }]} value={editData.bio} onChangeText={(v: string) => setEditData({ ...editData, bio: v })} multiline placeholderTextColor={theme.colors.textMuted} />

              <Text style={[st.sectionLabel, { marginTop: 16 }]}>Contact Details</Text>
              <Text style={st.fieldLabel}>Email</Text>
              <TextInput style={st.input} value={editData.email} onChangeText={(v: string) => setEditData({ ...editData, email: v })} keyboardType="email-address" autoCapitalize="none" placeholderTextColor={theme.colors.textMuted} placeholder="Email Address" />
              <Text style={st.fieldLabel}>Alternate Phone</Text>
              <TextInput style={st.input} value={editData.altPhone} onChangeText={(v: string) => setEditData({ ...editData, altPhone: v })} keyboardType="phone-pad" placeholderTextColor={theme.colors.textMuted} placeholder="Alternate Phone" />

              <Text style={[st.sectionLabel, { marginTop: 16 }]}>Social Media</Text>
              <Text style={st.fieldLabel}>TikTok</Text>
              <TextInput style={st.input} value={editData.tiktok} onChangeText={(v: string) => setEditData({ ...editData, tiktok: v })} autoCapitalize="none" placeholderTextColor={theme.colors.textMuted} placeholder="@handle" />
              <Text style={st.fieldLabel}>Twitter / X</Text>
              <TextInput style={st.input} value={editData.twitter} onChangeText={(v: string) => setEditData({ ...editData, twitter: v })} autoCapitalize="none" placeholderTextColor={theme.colors.textMuted} placeholder="@handle" />
              <Text style={st.fieldLabel}>Facebook</Text>
              <TextInput style={st.input} value={editData.facebook} onChangeText={(v: string) => setEditData({ ...editData, facebook: v })} autoCapitalize="none" placeholderTextColor={theme.colors.textMuted} placeholder="Profile URL" />

              <Text style={[st.sectionLabel, { marginTop: 16 }]}>Workplace</Text>
              <Text style={st.fieldLabel}>Company</Text>
              <TextInput style={st.input} value={editData.workplace} onChangeText={(v: string) => setEditData({ ...editData, workplace: v })} placeholderTextColor={theme.colors.textMuted} placeholder="Current Employer" />
              <Text style={st.fieldLabel}>Job Title</Text>
              <TextInput style={st.input} value={editData.jobTitle} onChangeText={(v: string) => setEditData({ ...editData, jobTitle: v })} placeholderTextColor={theme.colors.textMuted} placeholder="Position" />

              <Text style={[st.sectionLabel, { marginTop: 16 }]}>Residential Address</Text>
              <Text style={st.fieldLabel}>Street</Text>
              <TextInput style={st.input} value={editData.addressStreet} onChangeText={(v: string) => setEditData({ ...editData, addressStreet: v })} placeholderTextColor={theme.colors.textMuted} placeholder="Street Address" />
              <Text style={st.fieldLabel}>City</Text>
              <TextInput style={st.input} value={editData.addressCity} onChangeText={(v: string) => setEditData({ ...editData, addressCity: v })} placeholderTextColor={theme.colors.textMuted} placeholder="City" />
              <Text style={st.fieldLabel}>Province / State</Text>
              <TextInput style={st.input} value={editData.addressState} onChangeText={(v: string) => setEditData({ ...editData, addressState: v })} placeholderTextColor={theme.colors.textMuted} placeholder="Province" />
              <Text style={st.fieldLabel}>Postal Code</Text>
              <TextInput style={st.input} value={editData.addressPostalCode} onChangeText={(v: string) => setEditData({ ...editData, addressPostalCode: v })} placeholderTextColor={theme.colors.textMuted} placeholder="Postal Code" />
              <Text style={st.fieldLabel}>Country</Text>
              <TextInput style={st.input} value={editData.addressCountry} onChangeText={(v: string) => setEditData({ ...editData, addressCountry: v })} placeholderTextColor={theme.colors.textMuted} placeholder="Country" />

              <Text style={[st.sectionLabel, { marginTop: 16 }]}>Next of Kin</Text>
              <Text style={st.fieldLabel}>Full Name</Text>
              <TextInput style={st.input} value={editData.nokFullName} onChangeText={(v: string) => setEditData({ ...editData, nokFullName: v })} placeholderTextColor={theme.colors.textMuted} placeholder="Full Name" />
              <Text style={st.fieldLabel}>Relationship</Text>
              <TextInput style={st.input} value={editData.nokRelationship} onChangeText={(v: string) => setEditData({ ...editData, nokRelationship: v })} placeholderTextColor={theme.colors.textMuted} placeholder="e.g. Parent, Spouse" />
              <Text style={st.fieldLabel}>Phone</Text>
              <TextInput style={st.input} value={editData.nokPhone} onChangeText={(v: string) => setEditData({ ...editData, nokPhone: v })} keyboardType="phone-pad" placeholderTextColor={theme.colors.textMuted} placeholder="Phone Number" />
              <Text style={st.fieldLabel}>Email</Text>
              <TextInput style={st.input} value={editData.nokEmail} onChangeText={(v: string) => setEditData({ ...editData, nokEmail: v })} keyboardType="email-address" autoCapitalize="none" placeholderTextColor={theme.colors.textMuted} placeholder="Email" />
              <Text style={st.fieldLabel}>Address</Text>
              <TextInput style={st.input} value={editData.nokAddress} onChangeText={(v: string) => setEditData({ ...editData, nokAddress: v })} placeholderTextColor={theme.colors.textMuted} placeholder="Physical Address" />

              <TouchableOpacity style={st.saveBtn} onPress={handleSaveEdit}>
                <Text style={st.saveBtnText}>Save Changes</Text>
              </TouchableOpacity>
              <View style={{ height: 30 }} />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
}

const st = StyleSheet.create({
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: theme.colors.background, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '92%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  modalTitle: { fontSize: 20, fontWeight: '700', color: theme.colors.text },
  closeBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: theme.colors.cardLight, alignItems: 'center', justifyContent: 'center' },
  sectionLabel: { fontSize: 14, fontWeight: '700', color: theme.colors.text, marginBottom: 6, marginTop: 12 },
  bioText: { fontSize: 14, color: theme.colors.textSecondary, lineHeight: 20, marginBottom: 16 },
  detailGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginVertical: 12 },
  detailItem: { backgroundColor: theme.colors.card, borderRadius: 10, padding: 10, minWidth: '30%', borderWidth: 1, borderColor: theme.colors.border },
  detailLabel: { fontSize: 10, color: theme.colors.textMuted },
  detailValue: { fontSize: 13, fontWeight: '600', color: theme.colors.text, marginTop: 2 },
  tag: { backgroundColor: 'rgba(201,168,76,0.15)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  tagText: { fontSize: 10, color: theme.colors.primary, fontWeight: '600' },
  actionSection: { marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: theme.colors.border },
  actionSectionTitle: { fontSize: 14, fontWeight: '700', color: theme.colors.textMuted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 },
  actionRow: { flexDirection: 'row', gap: 12, marginBottom: 10 },
  actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 14, borderRadius: 12 },
  actionBtnText: { fontSize: 15, fontWeight: '700', color: '#FFF' },
  secondaryBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 12, borderRadius: 12, borderWidth: 1.5, borderColor: theme.colors.primary, backgroundColor: 'transparent', marginBottom: 10 },
  secondaryBtnText: { fontSize: 14, fontWeight: '600', color: theme.colors.primary },
  warningBox: { backgroundColor: 'rgba(245,158,11,0.08)', borderRadius: 12, padding: 14, marginTop: 12, borderWidth: 1, borderColor: 'rgba(245,158,11,0.2)' },
  warningTitle: { fontSize: 13, fontWeight: '700', color: theme.colors.warning },
  warningText: { fontSize: 13, color: theme.colors.textSecondary, lineHeight: 18 },
  notesBox: { backgroundColor: 'rgba(201,168,76,0.08)', borderRadius: 12, padding: 14, marginTop: 12, borderWidth: 1, borderColor: 'rgba(201,168,76,0.2)' },
  notesLabel: { fontSize: 12, color: theme.colors.primary, fontWeight: '700' },
  notesText: { fontSize: 14, color: theme.colors.textSecondary, lineHeight: 20 },
  declineBox: { backgroundColor: 'rgba(239,68,68,0.08)', borderRadius: 12, padding: 14, marginTop: 12, borderWidth: 1, borderColor: 'rgba(239,68,68,0.2)' },
  declineLabel: { fontSize: 12, color: theme.colors.error, fontWeight: '700' },
  declineText: { fontSize: 14, color: theme.colors.textSecondary, lineHeight: 20 },
  approveIcon: { width: 64, height: 64, borderRadius: 32, backgroundColor: 'rgba(16,185,129,0.1)', alignItems: 'center', justifyContent: 'center' },
  declineIcon: { width: 64, height: 64, borderRadius: 32, backgroundColor: 'rgba(239,68,68,0.1)', alignItems: 'center', justifyContent: 'center' },
  reasonChip: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, paddingHorizontal: 12, borderRadius: 10, backgroundColor: theme.colors.card, borderWidth: 1, borderColor: theme.colors.border },
  reasonChipActive: { borderColor: theme.colors.error, backgroundColor: 'rgba(239,68,68,0.05)' },
  reasonText: { fontSize: 13, color: theme.colors.textSecondary, flex: 1 },
  reasonTextActive: { color: theme.colors.text, fontWeight: '600' },
  photoMgmt: { marginTop: 12, marginBottom: 8 },
  photoThumbWrap: { position: 'relative', marginRight: 10, marginBottom: 14 },
  photoThumb: { width: 64, height: 80, borderRadius: 8 },
  photoRemoveBtn: { position: 'absolute', top: -6, right: -6, backgroundColor: theme.colors.background, borderRadius: 12 },
  photoAddBtn: { width: 64, height: 80, borderRadius: 8, borderWidth: 1.5, borderColor: theme.colors.primary, borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center' },
  coverBadge: { position: 'absolute', top: 2, left: 2, backgroundColor: theme.colors.primary, borderRadius: 4, paddingHorizontal: 4, paddingVertical: 1 },
  coverBadgeText: { fontSize: 8, fontWeight: '700', color: theme.colors.black },
  photoArrows: { flexDirection: 'row', justifyContent: 'center', gap: 4, marginTop: 4, position: 'absolute', bottom: -2, left: 0, right: 0 },
  arrowBtn: { width: 22, height: 22, borderRadius: 11, backgroundColor: theme.colors.card, borderWidth: 1, borderColor: theme.colors.primary, alignItems: 'center', justifyContent: 'center' },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: theme.colors.textSecondary, marginBottom: 6, marginTop: 10 },
  input: { backgroundColor: theme.colors.inputBg, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 15, color: theme.colors.text, borderWidth: 1, borderColor: theme.colors.border, marginBottom: 4 },
  chip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, backgroundColor: theme.colors.card, borderWidth: 1, borderColor: theme.colors.border, marginRight: 6 },
  chipActive: { backgroundColor: 'rgba(201,168,76,0.2)', borderColor: theme.colors.primary },
  chipText: { fontSize: 13, color: theme.colors.textSecondary },
  chipTextActive: { color: theme.colors.primary, fontWeight: '600' },
  saveBtn: { backgroundColor: theme.colors.primary, paddingVertical: 16, borderRadius: 14, alignItems: 'center', marginTop: 16, marginBottom: 24 },
  saveBtnText: { fontSize: 16, fontWeight: '700', color: theme.colors.black },
});