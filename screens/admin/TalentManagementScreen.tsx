import React, { useState, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, FlatList, Image,
  ActivityIndicator, Modal, ScrollView, Alert, TextInput,
  Dimensions, NativeScrollEvent, NativeSyntheticEvent,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { theme } from '../../lib/theme';
import { SA_CITIES, RACE_OPTIONS, BODY_TYPES, CATEGORIES } from '../../lib/constants';
import { DEMO_TALENT } from '../../lib/demoTalent';

const { width: SCREEN_W } = Dimensions.get('window');
const SLIDE_W = SCREEN_W - 48;

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
    `${IMG_BASE}?text=${encodeURIComponent(base + ' evening look')}&aspect=3:4&seed=${seed + 3}`,
    `${IMG_BASE}?text=${encodeURIComponent(base + ' candid smile')}&aspect=3:4&seed=${seed + 4}`,
  ];
}

function PhotoSlider({ photos }: { photos: string[] }) {
  const [activeIdx, setActiveIdx] = useState(0);
  const validPhotos = photos.filter(Boolean);
  if (validPhotos.length === 0) return (
    <View style={[ps.slide, { backgroundColor: theme.colors.cardLight, alignItems: 'center', justifyContent: 'center' }]}>
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
          <Image key={i} source={{ uri: url }} style={ps.slide} />
        ))}
      </ScrollView>
      {validPhotos.length > 1 && (
        <View style={ps.dots}>
          {validPhotos.map((_, i) => (
            <View key={i} style={[ps.dot, activeIdx === i && ps.dotActive]} />
          ))}
        </View>
      )}
      <Text style={ps.counter}>{activeIdx + 1} / {validPhotos.length}</Text>
    </View>
  );
}

const ps = StyleSheet.create({
  slide: { width: SLIDE_W, height: SLIDE_W * 1.25, borderRadius: 14 },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: 4 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: theme.colors.border },
  dotActive: { backgroundColor: theme.colors.primary, width: 20 },
  counter: { color: theme.colors.textMuted, fontSize: 12, textAlign: 'center', marginTop: 4 },
});

export default function TalentManagementScreen() {
  const [statusFilter, setStatusFilter] = useState('approved');
  const [showDetail, setShowDetail] = useState<any>(null);
  const [declineReason, setDeclineReason] = useState('');
  const [showDeclineModal, setShowDeclineModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editData, setEditData] = useState<any>({});
  const [uploading, setUploading] = useState(false);

  const profiles = useQuery(api.talent.listAllProfiles, statusFilter ? { status: statusFilter } : {});
  const approveProfile = useMutation(api.talent.approveProfile);
  const declineProfile = useMutation(api.talent.declineProfile);
  const adminUpdate = useMutation(api.talent.adminUpdateProfile);
  const adminDelete = useMutation(api.talent.adminDeleteProfile);
  const adminAddPhoto = useMutation(api.talent.adminAddPhoto);
  const adminRemovePhoto = useMutation(api.talent.adminRemovePhoto);
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);

  // Use demo data when DB is empty
  const isUsingDemo = profiles !== undefined && profiles.length === 0;
  const displayProfiles = React.useMemo(() => {
    if (profiles && profiles.length > 0) {
      return profiles.map((p: any) => {
        const existingPhotos = [...(p.photoUrls || [])].filter(Boolean);
        const photos = existingPhotos.length > 0 ? existingPhotos : generatePhotosForProfile(p);
        return { ...p, photoUrls: photos };
      });
    }
    // Fall back to demo data - filter by status if needed
    const demoProfiles = DEMO_TALENT.filter((t: any) => {
      if (statusFilter === 'pending') return false; // no pending in demo
      if (statusFilter === 'declined') return false; // no declined in demo
      return true; // approved
    });
    return demoProfiles.map((t: any) => ({
      ...t,
      _id: t.id,
      photoUrls: t.photos || [],
      bio: t.background || '',
      phone: '07X XXX XXXX',
    }));
  }, [profiles, statusFilter]);

  const handleApprove = async (profileId: any) => {
    try {
      await approveProfile({ profileId });
      Alert.alert('Approved', 'Talent profile has been approved');
      setShowDetail(null);
    } catch (e: any) { Alert.alert('Error', e.message); }
  };

  const handleDecline = async () => {
    if (!showDetail || !declineReason) {
      Alert.alert('Required', 'Please provide a reason for declining');
      return;
    }
    try {
      await declineProfile({ profileId: showDetail._id, reason: declineReason });
      Alert.alert('Declined', 'Talent profile has been declined');
      setShowDetail(null);
      setShowDeclineModal(false);
      setDeclineReason('');
    } catch (e: any) { Alert.alert('Error', e.message); }
  };

  const handleDelete = (profileId: any, name: string) => {
    Alert.alert('Delete Profile', `Are you sure you want to permanently delete ${name}'s profile? This cannot be undone.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          try {
            await adminDelete({ profileId });
            Alert.alert('Deleted', 'Profile has been permanently deleted');
            setShowDetail(null);
          } catch (e: any) { Alert.alert('Error', e.message); }
        }
      },
    ]);
  };

  const openEdit = (profile: any) => {
    setEditData({
      profileId: profile._id,
      firstName: profile.firstName,
      lastName: profile.lastName,
      phone: profile.phone,
      city: profile.city,
      area: profile.area,
      race: profile.race,
      bodyType: profile.bodyType,
      heightCm: String(profile.heightCm || ''),
      bio: profile.bio,
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
      setShowDetail(null);
    } catch (e: any) { Alert.alert('Error', e.message); }
  };

  const handleAddPhoto = async (profileId: any) => {
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
      await adminAddPhoto({ profileId, storageId });
      Alert.alert('Added', 'Photo added successfully');
    } catch (e: any) { Alert.alert('Error', e.message); }
    finally { setUploading(false); }
  };

  const handleRemovePhoto = (profileId: any, index: number) => {
    Alert.alert('Remove Photo', 'Are you sure you want to remove this photo?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: async () => {
        try {
          await adminRemovePhoto({ profileId, photoIndex: index });
        } catch (e: any) { Alert.alert('Error', e.message); }
      }},
    ]);
  };

  const toggleCategory = (cat: string) => {
    setEditData((prev: any) => ({
      ...prev,
      categories: prev.categories.includes(cat)
        ? prev.categories.filter((c: string) => c !== cat)
        : [...prev.categories, cat],
    }));
  };

  if (profiles === undefined) return (
    <View style={[st.container, { justifyContent: 'center', alignItems: 'center' }]}>
      <ActivityIndicator size="large" color={theme.colors.primary} />
    </View>
  );

  return (
    <View style={st.container}>
      <SafeAreaView style={st.safe} edges={['top']}>
        <Text style={st.title}>Talent</Text>
        <View style={st.filterRow}>
          {['pending', 'approved', 'declined'].map((s) => (
            <TouchableOpacity
              key={s}
              style={[st.filterChip, statusFilter === s && st.filterChipActive]}
              onPress={() => setStatusFilter(s)}
            >
              <Text style={[st.filterText, statusFilter === s && st.filterTextActive]}>
                {s.charAt(0).toUpperCase() + s.slice(1)} ({statusFilter === s ? displayProfiles.length : '–'})
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <FlatList
          data={displayProfiles}
          keyExtractor={(item: any) => item._id || item.id}
          contentContainerStyle={st.list}
          ListEmptyComponent={
            <View style={st.empty}>
              <Ionicons name="people-outline" size={48} color={theme.colors.textMuted} />
              <Text style={st.emptyText}>No {statusFilter} profiles</Text>
            </View>
          }
          renderItem={({ item }: any) => (
            <TouchableOpacity style={st.card} onPress={() => setShowDetail(item)} activeOpacity={0.8}>
              {item.photoUrls?.[0] ? (
                <Image source={{ uri: item.photoUrls[0] }} style={st.cardPhoto} />
              ) : (
                <View style={[st.cardPhoto, { backgroundColor: theme.colors.cardLight, alignItems: 'center', justifyContent: 'center' }]}>
                  <Ionicons name="person" size={24} color={theme.colors.textMuted} />
                </View>
              )}
              <View style={st.cardInfo}>
                <Text style={st.cardName}>{item.firstName} {item.lastName}</Text>
                <Text style={st.cardSub}>{item.city} · {item.heightCm}cm · {item.race}</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 4 }}>
                  {item.categories.slice(0, 3).map((c: string) => (
                    <View key={c} style={st.tag}><Text style={st.tagText}>{c}</Text></View>
                  ))}
                </View>
              </View>
              <Ionicons name="chevron-forward" size={18} color={theme.colors.textMuted} />
            </TouchableOpacity>
          )}
        />

        {/* ===== DETAIL MODAL ===== */}
        <Modal visible={!!showDetail} animationType="slide" transparent>
          <View style={st.modalOverlay}>
            <View style={st.modalContent}>
              <View style={st.modalHeader}>
                <Text style={st.modalTitle}>{showDetail?.firstName} {showDetail?.lastName}</Text>
                <TouchableOpacity onPress={() => setShowDetail(null)}>
                  <Ionicons name="close" size={24} color={theme.colors.text} />
                </TouchableOpacity>
              </View>
              <ScrollView showsVerticalScrollIndicator={false}>
                {/* Photo Slideshow */}
                {showDetail?.photoUrls && <PhotoSlider photos={showDetail.photoUrls.filter(Boolean)} />}

                {/* Photo Management - only for DB profiles */}
                {!isUsingDemo && showDetail?.photoUrls && (
                  <View style={st.photoMgmt}>
                    <Text style={st.sectionLabel}>Photos ({showDetail?.photoUrls?.filter(Boolean).length || 0}/5)</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 8 }}>
                      {showDetail?.photoUrls?.map((url: string, i: number) => url && (
                        <View key={i} style={st.photoThumbWrap}>
                          <Image source={{ uri: url }} style={st.photoThumb} />
                          <TouchableOpacity style={st.photoRemoveBtn} onPress={() => handleRemovePhoto(showDetail._id, i)}>
                            <Ionicons name="close-circle" size={22} color={theme.colors.error} />
                          </TouchableOpacity>
                        </View>
                      ))}
                      {(showDetail?.photoUrls?.filter(Boolean).length || 0) < 5 && (
                        <TouchableOpacity style={st.photoAddBtn} onPress={() => handleAddPhoto(showDetail._id)}>
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

                {/* Info Grid */}
                <View style={st.detailGrid}>
                  <View style={st.detailItem}><Text style={st.detailLabel}>City</Text><Text style={st.detailValue}>{showDetail?.city}</Text></View>
                  <View style={st.detailItem}><Text style={st.detailLabel}>Area</Text><Text style={st.detailValue}>{showDetail?.area}</Text></View>
                  <View style={st.detailItem}><Text style={st.detailLabel}>Height</Text><Text style={st.detailValue}>{showDetail?.heightCm}cm</Text></View>
                  <View style={st.detailItem}><Text style={st.detailLabel}>Race</Text><Text style={st.detailValue}>{showDetail?.race}</Text></View>
                  <View style={st.detailItem}><Text style={st.detailLabel}>Body Type</Text><Text style={st.detailValue}>{showDetail?.bodyType}</Text></View>
                  <View style={st.detailItem}><Text style={st.detailLabel}>Phone</Text><Text style={st.detailValue}>{showDetail?.phone}</Text></View>
                  {showDetail?.instagram && <View style={st.detailItem}><Text style={st.detailLabel}>Instagram</Text><Text style={[st.detailValue, { color: theme.colors.primary }]}>@{showDetail.instagram}</Text></View>}
                </View>

                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
                  {showDetail?.categories?.map((c: string) => (
                    <View key={c} style={st.tag}><Text style={st.tagText}>{c}</Text></View>
                  ))}
                </View>

                <Text style={st.sectionLabel}>Bio</Text>
                <Text style={st.bioText}>{showDetail?.bio || showDetail?.background}</Text>

                {/* Contact Details */}
                {(showDetail?.email || showDetail?.altPhone) && (
                  <>
                    <Text style={st.sectionLabel}>Contact Details</Text>
                    <View style={st.detailGrid}>
                      {showDetail?.email && <View style={st.detailItem}><Text style={st.detailLabel}>Email</Text><Text style={st.detailValue}>{showDetail.email}</Text></View>}
                      {showDetail?.altPhone && <View style={st.detailItem}><Text style={st.detailLabel}>Alt Phone</Text><Text style={st.detailValue}>{showDetail.altPhone}</Text></View>}
                    </View>
                  </>
                )}

                {/* Social Media */}
                {(showDetail?.tiktok || showDetail?.twitter || showDetail?.facebook) && (
                  <>
                    <Text style={st.sectionLabel}>Social Media</Text>
                    <View style={st.detailGrid}>
                      {showDetail?.tiktok && <View style={st.detailItem}><Text style={st.detailLabel}>TikTok</Text><Text style={[st.detailValue, { color: '#00F2EA' }]}>@{showDetail.tiktok}</Text></View>}
                      {showDetail?.twitter && <View style={st.detailItem}><Text style={st.detailLabel}>Twitter/X</Text><Text style={[st.detailValue, { color: '#1DA1F2' }]}>@{showDetail.twitter}</Text></View>}
                      {showDetail?.facebook && <View style={st.detailItem}><Text style={st.detailLabel}>Facebook</Text><Text style={st.detailValue}>{showDetail.facebook}</Text></View>}
                    </View>
                  </>
                )}

                {/* Workplace */}
                {(showDetail?.workplace || showDetail?.jobTitle) && (
                  <>
                    <Text style={st.sectionLabel}>Workplace</Text>
                    <View style={st.detailGrid}>
                      {showDetail?.workplace && <View style={st.detailItem}><Text style={st.detailLabel}>Company</Text><Text style={st.detailValue}>{showDetail.workplace}</Text></View>}
                      {showDetail?.jobTitle && <View style={st.detailItem}><Text style={st.detailLabel}>Title</Text><Text style={st.detailValue}>{showDetail.jobTitle}</Text></View>}
                    </View>
                  </>
                )}

                {/* Address */}
                {(showDetail?.addressStreet || showDetail?.addressCity) && (
                  <>
                    <Text style={st.sectionLabel}>Residential Address</Text>
                    <Text style={st.bioText}>
                      {[showDetail?.addressStreet, showDetail?.addressCity, showDetail?.addressState, showDetail?.addressPostalCode, showDetail?.addressCountry].filter(Boolean).join(', ')}
                    </Text>
                  </>
                )}

                {/* Next of Kin */}
                {(showDetail?.nokFullName || showDetail?.nokPhone) && (
                  <>
                    <Text style={st.sectionLabel}>Next of Kin</Text>
                    <View style={st.detailGrid}>
                      {showDetail?.nokFullName && <View style={st.detailItem}><Text style={st.detailLabel}>Name</Text><Text style={st.detailValue}>{showDetail.nokFullName}</Text></View>}
                      {showDetail?.nokRelationship && <View style={st.detailItem}><Text style={st.detailLabel}>Relation</Text><Text style={st.detailValue}>{showDetail.nokRelationship}</Text></View>}
                      {showDetail?.nokPhone && <View style={st.detailItem}><Text style={st.detailLabel}>Phone</Text><Text style={st.detailValue}>{showDetail.nokPhone}</Text></View>}
                      {showDetail?.nokEmail && <View style={st.detailItem}><Text style={st.detailLabel}>Email</Text><Text style={st.detailValue}>{showDetail.nokEmail}</Text></View>}
                      {showDetail?.nokAddress && <View style={st.detailItem}><Text style={st.detailLabel}>Address</Text><Text style={st.detailValue}>{showDetail.nokAddress}</Text></View>}
                    </View>
                  </>
                )}

                {showDetail?.qualifications && (
                  <>
                    <Text style={st.sectionLabel}>Qualifications</Text>
                    <Text style={st.bioText}>{showDetail.qualifications}</Text>
                  </>
                )}

                {showDetail?.skills && showDetail.skills.length > 0 && (
                  <>
                    <Text style={st.sectionLabel}>Skills</Text>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
                      {showDetail.skills.map((sk: string, i: number) => (
                        <View key={i} style={[st.tag, { backgroundColor: 'rgba(139,92,246,0.15)' }]}>
                          <Text style={[st.tagText, { color: '#A78BFA' }]}>{sk}</Text>
                        </View>
                      ))}
                    </View>
                  </>
                )}

                {showDetail?.workExperience && (
                  <>
                    <Text style={st.sectionLabel}>Work Experience</Text>
                    <Text style={st.bioText}>{showDetail.workExperience}</Text>
                  </>
                )}

                {showDetail?.availability && (
                  <>
                    <Text style={st.sectionLabel}>Availability</Text>
                    <Text style={st.bioText}>{showDetail.availability}</Text>
                  </>
                )}

                {/* Admin Actions - only for DB profiles */}
                {!isUsingDemo && (
                  <View style={st.actionRow}>
                    <TouchableOpacity style={[st.actionBtn, { backgroundColor: theme.colors.primary }]} onPress={() => openEdit(showDetail)}>
                      <Ionicons name="create-outline" size={18} color={theme.colors.black} />
                      <Text style={[st.actionBtnText, { color: theme.colors.black }]}>Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[st.actionBtn, { backgroundColor: theme.colors.error }]}
                      onPress={() => handleDelete(showDetail._id, `${showDetail.firstName} ${showDetail.lastName}`)}>
                      <Ionicons name="trash-outline" size={18} color="#FFF" />
                      <Text style={st.actionBtnText}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {!isUsingDemo && showDetail?.status === 'pending' && (
                  <View style={st.actionRow}>
                    <TouchableOpacity style={[st.actionBtn, { backgroundColor: theme.colors.success }]} onPress={() => handleApprove(showDetail._id)}>
                      <Ionicons name="checkmark" size={20} color="#FFF" />
                      <Text style={st.actionBtnText}>Approve</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[st.actionBtn, { backgroundColor: theme.colors.error }]} onPress={() => setShowDeclineModal(true)}>
                      <Ionicons name="close" size={20} color="#FFF" />
                      <Text style={st.actionBtnText}>Decline</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {showDetail?.status === 'declined' && showDetail?.declineReason && (
                  <View style={st.declineBox}>
                    <Text style={st.declineLabel}>Decline Reason:</Text>
                    <Text style={st.declineText}>{showDetail.declineReason}</Text>
                  </View>
                )}
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
                <TouchableOpacity onPress={() => setShowEditModal(false)}>
                  <Ionicons name="close" size={24} color={theme.colors.text} />
                </TouchableOpacity>
              </View>
              <ScrollView showsVerticalScrollIndicator={false}>
                <Text style={st.fieldLabel}>First Name</Text>
                <TextInput style={st.input} value={editData.firstName} onChangeText={v => setEditData({...editData, firstName: v})} placeholderTextColor={theme.colors.textMuted} />
                <Text style={st.fieldLabel}>Last Name</Text>
                <TextInput style={st.input} value={editData.lastName} onChangeText={v => setEditData({...editData, lastName: v})} placeholderTextColor={theme.colors.textMuted} />
                <Text style={st.fieldLabel}>Phone</Text>
                <TextInput style={st.input} value={editData.phone} onChangeText={v => setEditData({...editData, phone: v})} placeholderTextColor={theme.colors.textMuted} />
                <Text style={st.fieldLabel}>City</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 10 }}>
                  {SA_CITIES.map(c => (
                    <TouchableOpacity key={c} style={[st.chip, editData.city === c && st.chipActive]} onPress={() => setEditData({...editData, city: c})}>
                      <Text style={[st.chipText, editData.city === c && st.chipTextActive]}>{c}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
                <Text style={st.fieldLabel}>Area / Suburb</Text>
                <TextInput style={st.input} value={editData.area} onChangeText={v => setEditData({...editData, area: v})} placeholderTextColor={theme.colors.textMuted} />
                <Text style={st.fieldLabel}>Race</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
                  {RACE_OPTIONS.map(r => (
                    <TouchableOpacity key={r} style={[st.chip, editData.race === r && st.chipActive]} onPress={() => setEditData({...editData, race: r})}>
                      <Text style={[st.chipText, editData.race === r && st.chipTextActive]}>{r}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <Text style={st.fieldLabel}>Body Type</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
                  {BODY_TYPES.map(b => (
                    <TouchableOpacity key={b} style={[st.chip, editData.bodyType === b && st.chipActive]} onPress={() => setEditData({...editData, bodyType: b})}>
                      <Text style={[st.chipText, editData.bodyType === b && st.chipTextActive]}>{b}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <Text style={st.fieldLabel}>Height (cm)</Text>
                <TextInput style={st.input} value={editData.heightCm} onChangeText={v => setEditData({...editData, heightCm: v})} keyboardType="numeric" placeholderTextColor={theme.colors.textMuted} />
                <Text style={st.fieldLabel}>Categories</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
                  {CATEGORIES.map(c => (
                    <TouchableOpacity key={c} style={[st.chip, editData.categories?.includes(c) && st.chipActive]} onPress={() => toggleCategory(c)}>
                      <Text style={[st.chipText, editData.categories?.includes(c) && st.chipTextActive]}>{c}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <Text style={st.fieldLabel}>Instagram Handle</Text>
                <TextInput style={st.input} value={editData.instagram} onChangeText={v => setEditData({...editData, instagram: v})} placeholderTextColor={theme.colors.textMuted} />
                <Text style={st.fieldLabel}>Bio</Text>
                <TextInput style={[st.input, { height: 80, textAlignVertical: 'top' }]} value={editData.bio} onChangeText={v => setEditData({...editData, bio: v})} multiline placeholderTextColor={theme.colors.textMuted} />

                {/* Contact Details */}
                <Text style={[st.sectionLabel, { marginTop: 16 }]}>Contact Details</Text>
                <Text style={st.fieldLabel}>Email</Text>
                <TextInput style={st.input} value={editData.email} onChangeText={v => setEditData({...editData, email: v})} keyboardType="email-address" autoCapitalize="none" placeholderTextColor={theme.colors.textMuted} placeholder="Email Address" />
                <Text style={st.fieldLabel}>Alternate Phone</Text>
                <TextInput style={st.input} value={editData.altPhone} onChangeText={v => setEditData({...editData, altPhone: v})} keyboardType="phone-pad" placeholderTextColor={theme.colors.textMuted} placeholder="Alternate Phone" />

                {/* Social Media */}
                <Text style={[st.sectionLabel, { marginTop: 16 }]}>Social Media</Text>
                <Text style={st.fieldLabel}>TikTok</Text>
                <TextInput style={st.input} value={editData.tiktok} onChangeText={v => setEditData({...editData, tiktok: v})} autoCapitalize="none" placeholderTextColor={theme.colors.textMuted} placeholder="@handle" />
                <Text style={st.fieldLabel}>Twitter / X</Text>
                <TextInput style={st.input} value={editData.twitter} onChangeText={v => setEditData({...editData, twitter: v})} autoCapitalize="none" placeholderTextColor={theme.colors.textMuted} placeholder="@handle" />
                <Text style={st.fieldLabel}>Facebook</Text>
                <TextInput style={st.input} value={editData.facebook} onChangeText={v => setEditData({...editData, facebook: v})} autoCapitalize="none" placeholderTextColor={theme.colors.textMuted} placeholder="Profile URL" />

                {/* Workplace */}
                <Text style={[st.sectionLabel, { marginTop: 16 }]}>Workplace</Text>
                <Text style={st.fieldLabel}>Company</Text>
                <TextInput style={st.input} value={editData.workplace} onChangeText={v => setEditData({...editData, workplace: v})} placeholderTextColor={theme.colors.textMuted} placeholder="Current Employer" />
                <Text style={st.fieldLabel}>Job Title</Text>
                <TextInput style={st.input} value={editData.jobTitle} onChangeText={v => setEditData({...editData, jobTitle: v})} placeholderTextColor={theme.colors.textMuted} placeholder="Position" />

                {/* Address */}
                <Text style={[st.sectionLabel, { marginTop: 16 }]}>Residential Address</Text>
                <Text style={st.fieldLabel}>Street</Text>
                <TextInput style={st.input} value={editData.addressStreet} onChangeText={v => setEditData({...editData, addressStreet: v})} placeholderTextColor={theme.colors.textMuted} placeholder="Street Address" />
                <Text style={st.fieldLabel}>City</Text>
                <TextInput style={st.input} value={editData.addressCity} onChangeText={v => setEditData({...editData, addressCity: v})} placeholderTextColor={theme.colors.textMuted} placeholder="City" />
                <Text style={st.fieldLabel}>Province / State</Text>
                <TextInput style={st.input} value={editData.addressState} onChangeText={v => setEditData({...editData, addressState: v})} placeholderTextColor={theme.colors.textMuted} placeholder="Province" />
                <Text style={st.fieldLabel}>Postal Code</Text>
                <TextInput style={st.input} value={editData.addressPostalCode} onChangeText={v => setEditData({...editData, addressPostalCode: v})} placeholderTextColor={theme.colors.textMuted} placeholder="Postal Code" />
                <Text style={st.fieldLabel}>Country</Text>
                <TextInput style={st.input} value={editData.addressCountry} onChangeText={v => setEditData({...editData, addressCountry: v})} placeholderTextColor={theme.colors.textMuted} placeholder="Country" />

                {/* Next of Kin */}
                <Text style={[st.sectionLabel, { marginTop: 16 }]}>Next of Kin</Text>
                <Text style={st.fieldLabel}>Full Name</Text>
                <TextInput style={st.input} value={editData.nokFullName} onChangeText={v => setEditData({...editData, nokFullName: v})} placeholderTextColor={theme.colors.textMuted} placeholder="Full Name" />
                <Text style={st.fieldLabel}>Relationship</Text>
                <TextInput style={st.input} value={editData.nokRelationship} onChangeText={v => setEditData({...editData, nokRelationship: v})} placeholderTextColor={theme.colors.textMuted} placeholder="e.g. Parent, Spouse" />
                <Text style={st.fieldLabel}>Phone</Text>
                <TextInput style={st.input} value={editData.nokPhone} onChangeText={v => setEditData({...editData, nokPhone: v})} keyboardType="phone-pad" placeholderTextColor={theme.colors.textMuted} placeholder="Phone Number" />
                <Text style={st.fieldLabel}>Email</Text>
                <TextInput style={st.input} value={editData.nokEmail} onChangeText={v => setEditData({...editData, nokEmail: v})} keyboardType="email-address" autoCapitalize="none" placeholderTextColor={theme.colors.textMuted} placeholder="Email" />
                <Text style={st.fieldLabel}>Address</Text>
                <TextInput style={st.input} value={editData.nokAddress} onChangeText={v => setEditData({...editData, nokAddress: v})} placeholderTextColor={theme.colors.textMuted} placeholder="Physical Address" />

                <TouchableOpacity style={st.saveBtn} onPress={handleSaveEdit}>
                  <Text style={st.saveBtnText}>Save Changes</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* ===== DECLINE MODAL ===== */}
        <Modal visible={showDeclineModal} animationType="fade" transparent>
          <View style={[st.modalOverlay, { justifyContent: 'center' }]}>
            <View style={[st.modalContent, { borderRadius: 20, marginHorizontal: 20 }]}>
              <Text style={st.modalTitle}>Decline Reason</Text>
              <TextInput
                style={[st.input, { height: 80, textAlignVertical: 'top', marginTop: 12 }]}
                placeholder="Why is this profile being declined?"
                placeholderTextColor={theme.colors.textMuted}
                value={declineReason}
                onChangeText={setDeclineReason}
                multiline
              />
              <View style={st.actionRow}>
                <TouchableOpacity style={[st.actionBtn, { backgroundColor: theme.colors.cardLight }]}
                  onPress={() => { setShowDeclineModal(false); setDeclineReason(''); }}>
                  <Text style={[st.actionBtnText, { color: theme.colors.text }]}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[st.actionBtn, { backgroundColor: theme.colors.error }]} onPress={handleDecline}>
                  <Text style={st.actionBtnText}>Decline</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </View>
  );
}

const st = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  safe: { flex: 1 },
  title: { fontSize: 28, fontWeight: '800', color: theme.colors.primary, paddingHorizontal: 20, marginTop: 16, marginBottom: 12 },
  filterRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 20, marginBottom: 14 },
  filterChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: theme.colors.card, borderWidth: 1, borderColor: theme.colors.border },
  filterChipActive: { backgroundColor: 'rgba(201,168,76,0.2)', borderColor: theme.colors.primary },
  filterText: { fontSize: 13, color: theme.colors.textSecondary },
  filterTextActive: { color: theme.colors.primary, fontWeight: '600' },
  list: { paddingHorizontal: 20, paddingBottom: 20 },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.card, borderRadius: 14, padding: 12, marginBottom: 10, borderWidth: 1, borderColor: theme.colors.border },
  cardPhoto: { width: 64, height: 80, borderRadius: 10, marginRight: 12 },
  cardInfo: { flex: 1 },
  cardName: { fontSize: 16, fontWeight: '700', color: theme.colors.text },
  cardSub: { fontSize: 13, color: theme.colors.textMuted, marginTop: 2 },
  tag: { backgroundColor: 'rgba(201,168,76,0.15)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  tagText: { fontSize: 10, color: theme.colors.primary, fontWeight: '600' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: theme.colors.background, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '92%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 20, fontWeight: '700', color: theme.colors.text },
  sectionLabel: { fontSize: 14, fontWeight: '700', color: theme.colors.text, marginBottom: 6, marginTop: 12 },
  bioText: { fontSize: 14, color: theme.colors.textSecondary, lineHeight: 20, marginBottom: 16 },
  detailGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginVertical: 12 },
  detailItem: { backgroundColor: theme.colors.card, borderRadius: 10, padding: 10, minWidth: '30%', borderWidth: 1, borderColor: theme.colors.border },
  detailLabel: { fontSize: 10, color: theme.colors.textMuted },
  detailValue: { fontSize: 13, fontWeight: '600', color: theme.colors.text, marginTop: 2 },
  actionRow: { flexDirection: 'row', gap: 12, marginTop: 12, marginBottom: 16 },
  actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 14, borderRadius: 12 },
  actionBtnText: { fontSize: 15, fontWeight: '700', color: '#FFF' },
  photoMgmt: { marginTop: 12, marginBottom: 8 },
  photoThumbWrap: { position: 'relative', marginRight: 10 },
  photoThumb: { width: 64, height: 80, borderRadius: 8 },
  photoRemoveBtn: { position: 'absolute', top: -6, right: -6, backgroundColor: theme.colors.background, borderRadius: 12 },
  photoAddBtn: { width: 64, height: 80, borderRadius: 8, borderWidth: 1.5, borderColor: theme.colors.primary, borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center' },
  declineBox: { backgroundColor: 'rgba(239,68,68,0.1)', borderRadius: 12, padding: 14, marginTop: 8, marginBottom: 16 },
  declineLabel: { fontSize: 12, color: theme.colors.error, fontWeight: '600', marginBottom: 4 },
  declineText: { fontSize: 14, color: theme.colors.textSecondary },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: theme.colors.textSecondary, marginBottom: 6, marginTop: 10 },
  input: { backgroundColor: theme.colors.inputBg, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 15, color: theme.colors.text, borderWidth: 1, borderColor: theme.colors.border, marginBottom: 4 },
  chip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, backgroundColor: theme.colors.card, borderWidth: 1, borderColor: theme.colors.border, marginRight: 6 },
  chipActive: { backgroundColor: 'rgba(201,168,76,0.2)', borderColor: theme.colors.primary },
  chipText: { fontSize: 13, color: theme.colors.textSecondary },
  chipTextActive: { color: theme.colors.primary, fontWeight: '600' },
  saveBtn: { backgroundColor: theme.colors.primary, paddingVertical: 16, borderRadius: 14, alignItems: 'center', marginTop: 16, marginBottom: 24 },
  saveBtnText: { fontSize: 16, fontWeight: '700', color: theme.colors.black },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyText: { fontSize: 17, fontWeight: '600', color: theme.colors.textSecondary, marginTop: 12 },
});