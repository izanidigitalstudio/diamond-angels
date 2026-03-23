import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, TextInput, ScrollView,
  Alert, ActivityIndicator, Image, KeyboardAvoidingView, Platform,
  Dimensions, Animated, Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../../lib/theme';
import { SA_CITIES, RACE_OPTIONS, BODY_TYPES, CATEGORIES } from '../../lib/constants';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const HERO_HEIGHT = SCREEN_HEIGHT * 0.55;
const PHOTO_THUMB_SIZE = 64;
const MAX_PHOTOS = 5;

// --- Accent colors for visual variety ---
const ACCENT = {
  gold: theme.colors.primary,
  purple: '#8B5CF6',
  teal: '#14B8A6',
  rose: '#F43F5E',
  blue: '#3B82F6',
  amber: '#F59E0B',
};

function ChipSelect({ options, selected, onToggle, multi = false, accentColor }: any) {
  const accent = accentColor || ACCENT.gold;
  return (
    <View style={cs.chipRow}>
      {options.map((opt: string) => {
        const active = multi ? selected.includes(opt) : selected === opt;
        return (
          <TouchableOpacity
            key={opt}
            style={[cs.chip, active && { backgroundColor: accent + '25', borderColor: accent }]}
            onPress={() => onToggle(opt)}
          >
            <Text style={[cs.chipText, active && { color: accent, fontWeight: '700' }]}>{opt}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const cs = StyleSheet.create({
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  chip: {
    paddingHorizontal: 16, paddingVertical: 10, borderRadius: 24,
    backgroundColor: theme.colors.inputBg, borderWidth: 1.5, borderColor: theme.colors.border,
  },
  chipText: { fontSize: 13, color: theme.colors.textSecondary },
});

// ========== HERO PHOTO SLIDER ==========
function HeroPhotoSlider({ photos, onEditPress }: { photos: string[]; onEditPress?: () => void }) {
  const [activeIdx, setActiveIdx] = useState(0);
  const validPhotos = photos.filter(Boolean);

  if (validPhotos.length === 0) return (
    <View style={[hero.container, { backgroundColor: theme.colors.card, alignItems: 'center', justifyContent: 'center' }]}>
      <LinearGradient colors={['transparent', theme.colors.background]} style={hero.gradient} />
      <Ionicons name="camera-outline" size={64} color={theme.colors.textMuted} />
      <Text style={{ color: theme.colors.textMuted, fontSize: 16, marginTop: 12 }}>No Photos Yet</Text>
      {onEditPress && (
        <TouchableOpacity style={hero.addPhotoBtn} onPress={onEditPress}>
          <Ionicons name="add-circle" size={20} color={ACCENT.gold} />
          <Text style={{ color: ACCENT.gold, fontWeight: '700', marginLeft: 6 }}>Add Photos</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View style={hero.container}>
      <ScrollView
        horizontal pagingEnabled showsHorizontalScrollIndicator={false}
        onScroll={(e) => {
          const idx = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
          setActiveIdx(idx);
        }}
        scrollEventThrottle={16}
      >
        {validPhotos.map((url, i) => (
          <Image key={i} source={{ uri: url }} style={hero.image} />
        ))}
      </ScrollView>
      <LinearGradient
        colors={['transparent', 'rgba(10,10,15,0.4)', theme.colors.background]}
        style={hero.gradient}
      />
      {validPhotos.length > 1 && (
        <View style={hero.dotRow}>
          {validPhotos.map((_, i) => (
            <View key={i} style={[hero.dot, activeIdx === i && hero.dotActive]} />
          ))}
        </View>
      )}
      <View style={hero.counter}>
        <Ionicons name="images" size={12} color="#fff" />
        <Text style={hero.counterText}>{activeIdx + 1}/{validPhotos.length}</Text>
      </View>
    </View>
  );
}

const hero = StyleSheet.create({
  container: { width: SCREEN_WIDTH, height: HERO_HEIGHT, position: 'relative' },
  image: { width: SCREEN_WIDTH, height: HERO_HEIGHT, resizeMode: 'cover' },
  gradient: { position: 'absolute', bottom: 0, left: 0, right: 0, height: HERO_HEIGHT * 0.45 },
  dotRow: {
    flexDirection: 'row', justifyContent: 'center', gap: 6,
    position: 'absolute', bottom: 20, left: 0, right: 0,
  },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.35)' },
  dotActive: { backgroundColor: ACCENT.gold, width: 24, borderRadius: 4 },
  counter: {
    position: 'absolute', top: 16, right: 16, backgroundColor: 'rgba(0,0,0,0.55)',
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 14,
    flexDirection: 'row', alignItems: 'center', gap: 4,
  },
  counterText: { fontSize: 12, fontWeight: '700', color: '#fff' },
  addPhotoBtn: {
    flexDirection: 'row', alignItems: 'center', marginTop: 20,
    backgroundColor: ACCENT.gold + '20', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 24,
  },
});

// ========== STAT CARD ==========
function StatCard({ icon, label, value, color }: { icon: string; label: string; value: string; color: string }) {
  if (!value) return null;
  return (
    <View style={[stat.card, { borderLeftColor: color }]}>
      <Ionicons name={icon as any} size={16} color={color} />
      <Text style={stat.label}>{label}</Text>
      <Text style={stat.value}>{value}</Text>
    </View>
  );
}

const stat = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.card, borderRadius: 12, padding: 12,
    minWidth: '30%', flex: 1, borderLeftWidth: 3,
    borderWidth: 1, borderColor: theme.colors.border,
  },
  label: { fontSize: 10, color: theme.colors.textMuted, marginTop: 4, textTransform: 'uppercase', letterSpacing: 0.5 },
  value: { fontSize: 14, fontWeight: '700', color: theme.colors.text, marginTop: 2 },
});

// ========== SECTION HEADER ==========
function SectionHeader({ icon, title, color, onEdit }: { icon: string; title: string; color: string; onEdit?: () => void }) {
  return (
    <View style={sec.row}>
      <View style={[sec.iconBg, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon as any} size={16} color={color} />
      </View>
      <Text style={sec.title}>{title}</Text>
      {onEdit && (
        <TouchableOpacity onPress={onEdit} style={sec.editBtn}>
          <Ionicons name="pencil" size={14} color={ACCENT.gold} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const sec = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', marginTop: 28, marginBottom: 14, gap: 10 },
  iconBg: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 17, fontWeight: '800', color: theme.colors.text, flex: 1 },
  editBtn: {
    width: 28, height: 28, borderRadius: 14, backgroundColor: ACCENT.gold + '15',
    alignItems: 'center', justifyContent: 'center',
  },
});

// ========== INFO ROW ==========
function InfoRow({ icon, label, value, color }: { icon: string; label: string; value?: string; color?: string }) {
  if (!value) return null;
  return (
    <View style={ir.row}>
      <Ionicons name={icon as any} size={16} color={color || theme.colors.textMuted} />
      <Text style={ir.label}>{label}</Text>
      <Text style={[ir.value, color ? { color } : null]}>{value}</Text>
    </View>
  );
}

const ir = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, gap: 10, borderBottomWidth: 1, borderBottomColor: theme.colors.border + '40' },
  label: { fontSize: 13, color: theme.colors.textMuted, width: 90 },
  value: { fontSize: 14, color: theme.colors.text, fontWeight: '500', flex: 1 },
});

// ========== MAIN COMPONENT ==========
export default function TalentProfileScreen() {
  const profile = useQuery(api.talent.getMyProfile);
  const createProfile = useMutation(api.talent.createProfile);
  const updateProfile = useMutation(api.talent.updateProfile);
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);

  const [mode, setMode] = useState<'view' | 'edit'>('view');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [area, setArea] = useState('');
  const [race, setRace] = useState('');
  const [bodyType, setBodyType] = useState('');
  const [heightCm, setHeightCm] = useState('');
  const [bio, setBio] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  const [instagram, setInstagram] = useState('');
  const [email, setEmail] = useState('');
  const [altPhone, setAltPhone] = useState('');
  const [workplace, setWorkplace] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [tiktok, setTiktok] = useState('');
  const [twitter, setTwitter] = useState('');
  const [facebook, setFacebook] = useState('');
  const [addressStreet, setAddressStreet] = useState('');
  const [addressCity, setAddressCity] = useState('');
  const [addressState, setAddressState] = useState('');
  const [addressPostalCode, setAddressPostalCode] = useState('');
  const [addressCountry, setAddressCountry] = useState('');
  const [nokFullName, setNokFullName] = useState('');
  const [nokRelationship, setNokRelationship] = useState('');
  const [nokPhone, setNokPhone] = useState('');
  const [nokEmail, setNokEmail] = useState('');
  const [nokAddress, setNokAddress] = useState('');
  const [photos, setPhotos] = useState<any[]>([]);
  const [photoStorageIds, setPhotoStorageIds] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showCityPicker, setShowCityPicker] = useState(false);
  const [editSection, setEditSection] = useState<string | null>(null);

  const hasProfile = profile && profile !== null;

  useEffect(() => {
    if (profile) {
      loadProfileData();
    }
  }, [profile?._id]);

  const loadProfileData = () => {
    if (!profile) return;
    setFirstName(profile.firstName || '');
    setLastName(profile.lastName || '');
    setPhone(profile.phone || '');
    setCity(profile.city || '');
    setArea(profile.area || '');
    setRace(profile.race || '');
    setBodyType(profile.bodyType || '');
    setHeightCm(profile.heightCm?.toString() || '');
    setBio(profile.bio || '');
    setCategories(profile.categories || []);
    setInstagram(profile.instagram || '');
    setEmail(profile.email || '');
    setAltPhone(profile.altPhone || '');
    setWorkplace(profile.workplace || '');
    setJobTitle(profile.jobTitle || '');
    setTiktok(profile.tiktok || '');
    setTwitter(profile.twitter || '');
    setFacebook(profile.facebook || '');
    setAddressStreet(profile.addressStreet || '');
    setAddressCity(profile.addressCity || '');
    setAddressState(profile.addressState || '');
    setAddressPostalCode(profile.addressPostalCode || '');
    setAddressCountry(profile.addressCountry || '');
    setNokFullName(profile.nokFullName || '');
    setNokRelationship(profile.nokRelationship || '');
    setNokPhone(profile.nokPhone || '');
    setNokEmail(profile.nokEmail || '');
    setNokAddress(profile.nokAddress || '');
    if (profile.photoUrls) {
      setPhotos(profile.photoUrls.filter(Boolean).map((url: any) => ({ uri: url })));
    }
  };

  const pickPhotos = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
      allowsMultipleSelection: true,
      selectionLimit: MAX_PHOTOS - photos.length,
      allowsEditing: false,
    });
    if (result.canceled) return;

    setUploading(true);
    const newIds: any[] = [];
    const newPhotos: any[] = [];

    for (const asset of result.assets) {
      try {
        const uploadUrl = await generateUploadUrl();
        const response = await fetch(asset.uri);
        const blob = await response.blob();
        const uploadResult = await fetch(uploadUrl, {
          method: 'POST',
          headers: { 'Content-Type': asset.mimeType || 'image/jpeg' },
          body: blob,
        });
        const { storageId } = await uploadResult.json();
        newIds.push(storageId);
        newPhotos.push({ uri: asset.uri });
      } catch (e) {
        console.error('Upload failed:', e);
      }
    }

    setPhotoStorageIds((prev) => [...prev, ...newIds]);
    setPhotos((prev) => [...prev, ...newPhotos]);
    setUploading(false);
  };

  const removePhoto = (index: number) => {
    Alert.alert('Remove Photo', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => {
        setPhotos((prev) => prev.filter((_, i) => i !== index));
        setPhotoStorageIds((prev) => prev.filter((_, i) => i !== index));
      }},
    ]);
  };

  const toggleCategory = (cat: string) => {
    setCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const handleSave = async () => {
    if (!firstName.trim()) {
      Alert.alert('Name Required', 'Please enter at least your first name');
      return;
    }

    const extraFields = {
      email: email || undefined,
      altPhone: altPhone || undefined,
      workplace: workplace || undefined,
      jobTitle: jobTitle || undefined,
      tiktok: tiktok || undefined,
      twitter: twitter || undefined,
      facebook: facebook || undefined,
      addressStreet: addressStreet || undefined,
      addressCity: addressCity || undefined,
      addressState: addressState || undefined,
      addressPostalCode: addressPostalCode || undefined,
      addressCountry: addressCountry || undefined,
      nokFullName: nokFullName || undefined,
      nokRelationship: nokRelationship || undefined,
      nokPhone: nokPhone || undefined,
      nokEmail: nokEmail || undefined,
      nokAddress: nokAddress || undefined,
    };

    setSaving(true);
    try {
      if (hasProfile) {
        const updates: any = {
          firstName, lastName, phone, city, area, race, bodyType,
          heightCm: heightCm ? parseInt(heightCm) : undefined, bio, categories, instagram,
          ...extraFields,
        };
        if (photoStorageIds.length > 0) updates.photos = photoStorageIds;
        await updateProfile(updates);
        Alert.alert('Success', 'Profile updated');
        setMode('view');
      } else {
        await createProfile({
          firstName: firstName || undefined,
          lastName: lastName || undefined,
          phone: phone || undefined,
          city: city || undefined,
          area: area || undefined,
          race: race || undefined,
          bodyType: bodyType || undefined,
          heightCm: heightCm ? parseInt(heightCm) : undefined,
          bio: bio || undefined,
          categories: categories.length > 0 ? categories : undefined,
          photos: photoStorageIds.length > 0 ? photoStorageIds : undefined,
          instagram: instagram || undefined,
          ...extraFields,
        });
        Alert.alert('Success', 'Profile submitted for review!');
        setMode('view');
      }
    } catch (e: any) {
      Alert.alert('Error', e.message);
    }
    setSaving(false);
  };

  // Loading
  if (profile === undefined) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  // No profile yet -> go straight to edit
  if (!hasProfile && mode === 'view') {
    setMode('edit');
  }

  const photoUrls = hasProfile
    ? (profile.photoUrls || []).filter(Boolean)
    : photos.map((p: any) => p.uri).filter(Boolean);

  const statusColor = profile?.status === 'approved' ? ACCENT.teal :
    profile?.status === 'pending' ? ACCENT.amber : ACCENT.rose;
  const statusIcon = profile?.status === 'approved' ? 'checkmark-circle' :
    profile?.status === 'pending' ? 'time' : 'close-circle';
  const statusLabel = profile?.status === 'approved' ? 'Approved' :
    profile?.status === 'pending' ? 'Under Review' : 'Declined';

  // ========== VIEW MODE ==========
  if (mode === 'view' && hasProfile) {
    return (
      <View style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
          {/* Hero Photo Slider */}
          <HeroPhotoSlider photos={photoUrls} onEditPress={() => setMode('edit')} />

          {/* Floating back-to-top status + name overlay */}
          <View style={styles.heroOverlay}>
            {/* Status Badge */}
            <View style={[styles.statusPill, { backgroundColor: statusColor + '20', borderColor: statusColor }]}>
              <Ionicons name={statusIcon} size={14} color={statusColor} />
              <Text style={[styles.statusPillText, { color: statusColor }]}>{statusLabel}</Text>
            </View>

            <Text style={styles.heroName}>{profile.firstName} {profile.lastName}</Text>
            {(profile.city || profile.area) && (
              <View style={styles.heroLocationRow}>
                <Ionicons name="location" size={14} color={ACCENT.gold} />
                <Text style={styles.heroLocation}>
                  {[profile.area, profile.city].filter(Boolean).join(', ')}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.content}>
            {/* Quick Stats */}
            <View style={styles.statsRow}>
              <StatCard icon="resize" label="Height" value={profile.heightCm ? `${profile.heightCm}cm` : ''} color={ACCENT.purple} />
              <StatCard icon="body" label="Build" value={profile.bodyType || ''} color={ACCENT.teal} />
              <StatCard icon="people" label="Race" value={profile.race || ''} color={ACCENT.blue} />
            </View>

            {/* Categories Tags */}
            {profile.categories && profile.categories.length > 0 && (
              <View style={styles.tagsRow}>
                {profile.categories.map((cat: string) => (
                  <View key={cat} style={styles.categoryTag}>
                    <Text style={styles.categoryTagText}>{cat}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Photo Thumbnails Strip */}
            {photoUrls.length > 1 && (
              <>
                <SectionHeader icon="images" title="Gallery" color={ACCENT.gold} onEdit={() => setMode('edit')} />
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 8 }}>
                  {photoUrls.map((url: string, i: number) => (
                    <Image key={i} source={{ uri: url }} style={styles.galleryThumb} />
                  ))}
                </ScrollView>
              </>
            )}

            {/* Bio */}
            {profile.bio ? (
              <>
                <SectionHeader icon="document-text" title="About Me" color={ACCENT.purple} onEdit={() => { setMode('edit'); setEditSection('bio'); }} />
                <Text style={styles.bioText}>{profile.bio}</Text>
              </>
            ) : null}

            {/* Contact Details */}
            <SectionHeader icon="call" title="Contact Details" color={ACCENT.teal} onEdit={() => { setMode('edit'); setEditSection('contact'); }} />
            <View style={styles.infoCard}>
              <InfoRow icon="call" label="Phone" value={profile.phone} color={ACCENT.teal} />
              <InfoRow icon="mail" label="Email" value={profile.email} color={ACCENT.blue} />
              <InfoRow icon="call-outline" label="Alt Phone" value={profile.altPhone} />
            </View>

            {/* Social Media */}
            {(profile.instagram || profile.tiktok || profile.twitter || profile.facebook) && (
              <>
                <SectionHeader icon="share-social" title="Social Media" color={ACCENT.rose} onEdit={() => { setMode('edit'); setEditSection('social'); }} />
                <View style={styles.infoCard}>
                  <InfoRow icon="logo-instagram" label="Instagram" value={profile.instagram ? `@${profile.instagram}` : undefined} color="#E4405F" />
                  <InfoRow icon="logo-tiktok" label="TikTok" value={profile.tiktok ? `@${profile.tiktok}` : undefined} color="#00F2EA" />
                  <InfoRow icon="logo-twitter" label="Twitter/X" value={profile.twitter ? `@${profile.twitter}` : undefined} color="#1DA1F2" />
                  <InfoRow icon="logo-facebook" label="Facebook" value={profile.facebook} color="#1877F2" />
                </View>
              </>
            )}

            {/* Workplace */}
            {(profile.workplace || profile.jobTitle) && (
              <>
                <SectionHeader icon="briefcase" title="Workplace" color={ACCENT.amber} onEdit={() => { setMode('edit'); setEditSection('work'); }} />
                <View style={styles.infoCard}>
                  <InfoRow icon="business" label="Company" value={profile.workplace} color={ACCENT.amber} />
                  <InfoRow icon="ribbon" label="Title" value={profile.jobTitle} />
                </View>
              </>
            )}

            {/* Address */}
            {(profile.addressStreet || profile.addressCity) && (
              <>
                <SectionHeader icon="home" title="Address" color={ACCENT.blue} onEdit={() => { setMode('edit'); setEditSection('address'); }} />
                <View style={styles.infoCard}>
                  <InfoRow icon="location" label="Street" value={profile.addressStreet} />
                  <InfoRow icon="map" label="City" value={[profile.addressCity, profile.addressState].filter(Boolean).join(', ')} />
                  <InfoRow icon="navigate" label="Postal" value={profile.addressPostalCode} />
                  <InfoRow icon="globe" label="Country" value={profile.addressCountry} />
                </View>
              </>
            )}

            {/* Next of Kin */}
            {(profile.nokFullName || profile.nokPhone) && (
              <>
                <SectionHeader icon="people" title="Next of Kin" color={ACCENT.rose} onEdit={() => { setMode('edit'); setEditSection('nok'); }} />
                <View style={styles.infoCard}>
                  <InfoRow icon="person" label="Name" value={profile.nokFullName} color={ACCENT.rose} />
                  <InfoRow icon="heart" label="Relation" value={profile.nokRelationship} />
                  <InfoRow icon="call" label="Phone" value={profile.nokPhone} />
                  <InfoRow icon="mail" label="Email" value={profile.nokEmail} />
                  <InfoRow icon="location" label="Address" value={profile.nokAddress} />
                </View>
              </>
            )}

            {/* Declined reason */}
            {profile.status === 'declined' && profile.declineReason && (
              <View style={styles.declineBox}>
                <Ionicons name="alert-circle" size={18} color={ACCENT.rose} />
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={styles.declineTitle}>Profile Declined</Text>
                  <Text style={styles.declineReason}>{profile.declineReason}</Text>
                </View>
              </View>
            )}

            {/* Completion Prompt */}
            {(!profile.bio || !profile.phone || !profile.heightCm || photoUrls.length === 0) && (
              <TouchableOpacity style={styles.completeCard} onPress={() => setMode('edit')}>
                <LinearGradient
                  colors={[ACCENT.gold + '15', ACCENT.purple + '10']}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                  style={styles.completeCardGradient}
                >
                  <Ionicons name="sparkles" size={24} color={ACCENT.gold} />
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.completeTitle}>Complete Your Profile</Text>
                    <Text style={styles.completeSub}>Add more details to attract more bookings</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={ACCENT.gold} />
                </LinearGradient>
              </TouchableOpacity>
            )}

            <View style={{ height: 40 }} />
          </View>
        </ScrollView>

        {/* Floating Edit FAB */}
        <TouchableOpacity style={styles.fab} onPress={() => setMode('edit')} activeOpacity={0.8}>
          <LinearGradient
            colors={[ACCENT.gold, ACCENT.amber]}
            style={styles.fabGradient}
          >
            <Ionicons name="create" size={22} color={theme.colors.black} />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    );
  }

  // ========== EDIT MODE ==========
  return (
    <View style={styles.container}>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
          {/* Edit Header */}
          <View style={styles.editHeader}>
            {hasProfile ? (
              <TouchableOpacity onPress={() => { loadProfileData(); setMode('view'); }} style={styles.backBtn}>
                <Ionicons name="arrow-back" size={22} color={theme.colors.text} />
              </TouchableOpacity>
            ) : <View style={{ width: 40 }} />}
            <Text style={styles.editTitle}>{hasProfile ? 'Edit Profile' : 'Create Profile'}</Text>
            <TouchableOpacity onPress={handleSave} disabled={saving} style={styles.saveHeaderBtn}>
              {saving ? (
                <ActivityIndicator size="small" color={ACCENT.gold} />
              ) : (
                <Text style={styles.saveHeaderText}>Save</Text>
              )}
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.editScroll} showsVerticalScrollIndicator={false}>
            {/* ---- Photos Section ---- */}
            <SectionHeader icon="images" title={`Photos (${photos.length}/${MAX_PHOTOS})`} color={ACCENT.gold} />

            {photos.length > 0 && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
                {photos.map((photo: any, i: number) => (
                  <View key={i} style={styles.editPhotoItem}>
                    <Image source={{ uri: photo.uri }} style={styles.editPhotoImg} />
                    <TouchableOpacity style={styles.editPhotoRemove} onPress={() => removePhoto(i)}>
                      <View style={styles.editPhotoRemoveBg}>
                        <Ionicons name="close" size={14} color="#fff" />
                      </View>
                    </TouchableOpacity>
                    {i === 0 && (
                      <View style={styles.editPhotoPrimary}>
                        <Text style={styles.editPhotoPrimaryText}>Main</Text>
                      </View>
                    )}
                  </View>
                ))}
                {photos.length < MAX_PHOTOS && (
                  <TouchableOpacity style={styles.editPhotoAdd} onPress={pickPhotos} disabled={uploading}>
                    {uploading ? (
                      <ActivityIndicator size="small" color={ACCENT.gold} />
                    ) : (
                      <>
                        <Ionicons name="add-circle" size={28} color={ACCENT.gold} />
                        <Text style={styles.editPhotoAddText}>Add</Text>
                      </>
                    )}
                  </TouchableOpacity>
                )}
              </ScrollView>
            )}

            {photos.length === 0 && (
              <TouchableOpacity style={styles.emptyPhotoBox} onPress={pickPhotos} disabled={uploading}>
                {uploading ? (
                  <ActivityIndicator size="large" color={ACCENT.gold} />
                ) : (
                  <>
                    <View style={styles.emptyPhotoIcon}>
                      <Ionicons name="camera" size={32} color={ACCENT.gold} />
                    </View>
                    <Text style={styles.emptyPhotoTitle}>Add Your Best Photos</Text>
                    <Text style={styles.emptyPhotoSub}>Upload up to {MAX_PHOTOS} images (3:4 ratio recommended)</Text>
                  </>
                )}
              </TouchableOpacity>
            )}

            {/* ---- Personal Info ---- */}
            <SectionHeader icon="person" title="Personal Info" color={ACCENT.purple} />
            <View style={styles.fieldRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.fieldLabel}>First Name</Text>
                <TextInput style={styles.input} placeholder="First Name" placeholderTextColor={theme.colors.textMuted} value={firstName} onChangeText={setFirstName} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.fieldLabel}>Last Name</Text>
                <TextInput style={styles.input} placeholder="Last Name" placeholderTextColor={theme.colors.textMuted} value={lastName} onChangeText={setLastName} />
              </View>
            </View>

            {/* ---- Contact ---- */}
            <SectionHeader icon="call" title="Contact Details" color={ACCENT.teal} />
            <Text style={styles.fieldLabel}>Phone Number</Text>
            <TextInput style={styles.input} placeholder="Phone Number" placeholderTextColor={theme.colors.textMuted} value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
            <Text style={styles.fieldLabel}>Email</Text>
            <TextInput style={styles.input} placeholder="Email Address" placeholderTextColor={theme.colors.textMuted} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
            <Text style={styles.fieldLabel}>Alternate Phone</Text>
            <TextInput style={styles.input} placeholder="Alternate Phone" placeholderTextColor={theme.colors.textMuted} value={altPhone} onChangeText={setAltPhone} keyboardType="phone-pad" />

            {/* ---- Location ---- */}
            <SectionHeader icon="location" title="Working Location" color={ACCENT.blue} />
            <Text style={styles.fieldLabel}>City</Text>
            <TouchableOpacity style={styles.input} onPress={() => setShowCityPicker(!showCityPicker)}>
              <Text style={{ color: city ? theme.colors.text : theme.colors.textMuted, fontSize: 15 }}>
                {city || 'Select City'}
              </Text>
            </TouchableOpacity>
            {showCityPicker && (
              <View style={styles.pickerList}>
                <ScrollView style={{ maxHeight: 200 }} nestedScrollEnabled>
                  {SA_CITIES.map((c) => (
                    <TouchableOpacity key={c} style={styles.pickerItem} onPress={() => { setCity(c); setShowCityPicker(false); }}>
                      <Text style={[styles.pickerItemText, city === c && { color: ACCENT.gold, fontWeight: '700' }]}>{c}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
            <Text style={styles.fieldLabel}>Area / Suburb</Text>
            <TextInput style={styles.input} placeholder="Area / Suburb" placeholderTextColor={theme.colors.textMuted} value={area} onChangeText={setArea} />

            {/* ---- Physical Attributes ---- */}
            <SectionHeader icon="body" title="Physical Attributes" color={ACCENT.purple} />
            <Text style={styles.fieldLabel}>Race</Text>
            <ChipSelect options={RACE_OPTIONS} selected={race} onToggle={setRace} accentColor={ACCENT.purple} />
            <Text style={styles.fieldLabel}>Body Type</Text>
            <ChipSelect options={BODY_TYPES} selected={bodyType} onToggle={setBodyType} accentColor={ACCENT.teal} />
            <Text style={styles.fieldLabel}>Height (cm)</Text>
            <TextInput style={styles.input} placeholder="Height in cm" placeholderTextColor={theme.colors.textMuted} value={heightCm} onChangeText={setHeightCm} keyboardType="numeric" />

            {/* ---- Categories ---- */}
            <SectionHeader icon="pricetags" title="Categories" color={ACCENT.amber} />
            <ChipSelect options={CATEGORIES} selected={categories} onToggle={toggleCategory} multi accentColor={ACCENT.amber} />

            {/* ---- Bio ---- */}
            <SectionHeader icon="document-text" title="About Me" color={ACCENT.rose} />
            <TextInput
              style={[styles.input, { height: 120, textAlignVertical: 'top', paddingTop: 14 }]}
              placeholder="Tell us about yourself, your experience, and what makes you stand out..."
              placeholderTextColor={theme.colors.textMuted}
              value={bio} onChangeText={setBio}
              multiline numberOfLines={5}
            />

            {/* ---- Social Media ---- */}
            <SectionHeader icon="share-social" title="Social Media" color={ACCENT.rose} />
            <Text style={styles.fieldLabel}>Instagram</Text>
            <TextInput style={styles.input} placeholder="@handle" placeholderTextColor={theme.colors.textMuted} value={instagram} onChangeText={setInstagram} autoCapitalize="none" />
            <Text style={styles.fieldLabel}>TikTok</Text>
            <TextInput style={styles.input} placeholder="@handle" placeholderTextColor={theme.colors.textMuted} value={tiktok} onChangeText={setTiktok} autoCapitalize="none" />
            <Text style={styles.fieldLabel}>Twitter / X</Text>
            <TextInput style={styles.input} placeholder="@handle" placeholderTextColor={theme.colors.textMuted} value={twitter} onChangeText={setTwitter} autoCapitalize="none" />
            <Text style={styles.fieldLabel}>Facebook</Text>
            <TextInput style={styles.input} placeholder="Profile URL" placeholderTextColor={theme.colors.textMuted} value={facebook} onChangeText={setFacebook} autoCapitalize="none" />

            {/* ---- Workplace ---- */}
            <SectionHeader icon="briefcase" title="Workplace" color={ACCENT.amber} />
            <Text style={styles.fieldLabel}>Company</Text>
            <TextInput style={styles.input} placeholder="Current Employer" placeholderTextColor={theme.colors.textMuted} value={workplace} onChangeText={setWorkplace} />
            <Text style={styles.fieldLabel}>Job Title</Text>
            <TextInput style={styles.input} placeholder="Position" placeholderTextColor={theme.colors.textMuted} value={jobTitle} onChangeText={setJobTitle} />

            {/* ---- Address ---- */}
            <SectionHeader icon="home" title="Residential Address" color={ACCENT.blue} />
            <TextInput style={styles.input} placeholder="Street Address" placeholderTextColor={theme.colors.textMuted} value={addressStreet} onChangeText={setAddressStreet} />
            <View style={styles.fieldRow}>
              <View style={{ flex: 1 }}>
                <TextInput style={styles.input} placeholder="City" placeholderTextColor={theme.colors.textMuted} value={addressCity} onChangeText={setAddressCity} />
              </View>
              <View style={{ flex: 1 }}>
                <TextInput style={styles.input} placeholder="Province" placeholderTextColor={theme.colors.textMuted} value={addressState} onChangeText={setAddressState} />
              </View>
            </View>
            <View style={styles.fieldRow}>
              <View style={{ flex: 1 }}>
                <TextInput style={styles.input} placeholder="Postal Code" placeholderTextColor={theme.colors.textMuted} value={addressPostalCode} onChangeText={setAddressPostalCode} />
              </View>
              <View style={{ flex: 1 }}>
                <TextInput style={styles.input} placeholder="Country" placeholderTextColor={theme.colors.textMuted} value={addressCountry} onChangeText={setAddressCountry} />
              </View>
            </View>

            {/* ---- Next of Kin ---- */}
            <SectionHeader icon="people" title="Next of Kin" color={ACCENT.rose} />
            <Text style={[styles.fieldLabel, { marginBottom: 8 }]}>Emergency contact information</Text>
            <TextInput style={styles.input} placeholder="Full Name" placeholderTextColor={theme.colors.textMuted} value={nokFullName} onChangeText={setNokFullName} />
            <TextInput style={styles.input} placeholder="Relationship (e.g. Parent, Spouse)" placeholderTextColor={theme.colors.textMuted} value={nokRelationship} onChangeText={setNokRelationship} />
            <TextInput style={styles.input} placeholder="Phone Number" placeholderTextColor={theme.colors.textMuted} value={nokPhone} onChangeText={setNokPhone} keyboardType="phone-pad" />
            <TextInput style={styles.input} placeholder="Email" placeholderTextColor={theme.colors.textMuted} value={nokEmail} onChangeText={setNokEmail} keyboardType="email-address" autoCapitalize="none" />
            <TextInput style={styles.input} placeholder="Physical Address" placeholderTextColor={theme.colors.textMuted} value={nokAddress} onChangeText={setNokAddress} />

            {/* Save Button */}
            <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving} activeOpacity={0.8}>
              <LinearGradient
                colors={[ACCENT.gold, ACCENT.amber]}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                style={styles.saveBtnGradient}
              >
                {saving ? (
                  <ActivityIndicator color={theme.colors.black} />
                ) : (
                  <>
                    <Ionicons name="checkmark-circle" size={20} color={theme.colors.black} />
                    <Text style={styles.saveBtnText}>{hasProfile ? 'Update Profile' : 'Submit Profile'}</Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>

            <View style={{ height: 40 }} />
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  // View Mode
  heroOverlay: { paddingHorizontal: 20, marginTop: -60 },
  statusPill: {
    flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start',
    gap: 6, paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20,
    borderWidth: 1, marginBottom: 10,
  },
  statusPillText: { fontSize: 12, fontWeight: '700' },
  heroName: { fontSize: 30, fontWeight: '900', color: theme.colors.text, letterSpacing: -0.5 },
  heroLocationRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 },
  heroLocation: { fontSize: 14, color: theme.colors.textSecondary },
  content: { paddingHorizontal: 20 },
  statsRow: { flexDirection: 'row', gap: 10, marginTop: 20 },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 16 },
  categoryTag: {
    backgroundColor: ACCENT.gold + '18', paddingHorizontal: 14, paddingVertical: 7,
    borderRadius: 20, borderWidth: 1, borderColor: ACCENT.gold + '40',
  },
  categoryTagText: { fontSize: 13, fontWeight: '700', color: ACCENT.gold },
  galleryThumb: {
    width: 80, height: 100, borderRadius: 12, marginRight: 10,
    borderWidth: 2, borderColor: theme.colors.border,
  },
  bioText: { fontSize: 15, color: theme.colors.textSecondary, lineHeight: 24 },
  infoCard: {
    backgroundColor: theme.colors.card, borderRadius: 14, paddingHorizontal: 16, paddingVertical: 4,
    borderWidth: 1, borderColor: theme.colors.border,
  },
  declineBox: {
    flexDirection: 'row', backgroundColor: ACCENT.rose + '12', borderRadius: 14,
    padding: 16, marginTop: 24, borderWidth: 1, borderColor: ACCENT.rose + '30',
  },
  declineTitle: { fontSize: 14, fontWeight: '700', color: ACCENT.rose },
  declineReason: { fontSize: 13, color: theme.colors.textSecondary, marginTop: 4, lineHeight: 20 },
  completeCard: { marginTop: 24, borderRadius: 16, overflow: 'hidden' },
  completeCardGradient: {
    flexDirection: 'row', alignItems: 'center', padding: 18, borderRadius: 16,
    borderWidth: 1, borderColor: ACCENT.gold + '25',
  },
  completeTitle: { fontSize: 15, fontWeight: '800', color: theme.colors.text },
  completeSub: { fontSize: 12, color: theme.colors.textSecondary, marginTop: 2 },
  fab: { position: 'absolute', bottom: 24, right: 20, borderRadius: 28, elevation: 8 },
  fabGradient: {
    width: 56, height: 56, borderRadius: 28,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: ACCENT.gold, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4, shadowRadius: 8,
  },
  // Edit Mode
  editHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: theme.colors.card,
    alignItems: 'center', justifyContent: 'center',
  },
  editTitle: { fontSize: 18, fontWeight: '800', color: theme.colors.text },
  saveHeaderBtn: { paddingHorizontal: 16, paddingVertical: 8 },
  saveHeaderText: { fontSize: 16, fontWeight: '700', color: ACCENT.gold },
  editScroll: { flex: 1, paddingHorizontal: 20 },
  fieldRow: { flexDirection: 'row', gap: 12 },
  fieldLabel: { fontSize: 12, fontWeight: '600', color: theme.colors.textMuted, marginBottom: 4, marginTop: 4, textTransform: 'uppercase', letterSpacing: 0.5 },
  input: {
    backgroundColor: theme.colors.inputBg, borderRadius: 12,
    paddingHorizontal: 16, paddingVertical: 14, fontSize: 15,
    color: theme.colors.text, borderWidth: 1, borderColor: theme.colors.border,
    marginBottom: 12,
  },
  pickerList: {
    backgroundColor: theme.colors.card, borderRadius: 12, marginBottom: 12,
    borderWidth: 1, borderColor: theme.colors.border, overflow: 'hidden',
  },
  pickerItem: { paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: theme.colors.border },
  pickerItemText: { fontSize: 15, color: theme.colors.text },
  editPhotoItem: {
    width: 100, height: 130, borderRadius: 14, marginRight: 10,
    overflow: 'hidden', borderWidth: 2, borderColor: theme.colors.border,
  },
  editPhotoImg: { width: '100%', height: '100%' },
  editPhotoRemove: { position: 'absolute', top: 6, right: 6 },
  editPhotoRemoveBg: {
    backgroundColor: ACCENT.rose, width: 24, height: 24, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
  },
  editPhotoPrimary: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: ACCENT.gold, paddingVertical: 3,
    alignItems: 'center',
  },
  editPhotoPrimaryText: { fontSize: 10, fontWeight: '800', color: theme.colors.black },
  editPhotoAdd: {
    width: 100, height: 130, borderRadius: 14, borderWidth: 2,
    borderColor: ACCENT.gold + '60', borderStyle: 'dashed',
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: ACCENT.gold + '08',
  },
  editPhotoAddText: { fontSize: 11, fontWeight: '700', color: ACCENT.gold, marginTop: 4 },
  emptyPhotoBox: {
    height: 180, borderRadius: 16, borderWidth: 2,
    borderColor: ACCENT.gold + '40', borderStyle: 'dashed',
    alignItems: 'center', justifyContent: 'center', marginBottom: 8,
    backgroundColor: ACCENT.gold + '08',
  },
  emptyPhotoIcon: {
    width: 64, height: 64, borderRadius: 32, backgroundColor: ACCENT.gold + '15',
    alignItems: 'center', justifyContent: 'center', marginBottom: 12,
  },
  emptyPhotoTitle: { fontSize: 16, fontWeight: '800', color: theme.colors.text },
  emptyPhotoSub: { fontSize: 13, color: theme.colors.textMuted, marginTop: 4 },
  saveBtn: { marginTop: 24, borderRadius: 16, overflow: 'hidden' },
  saveBtnGradient: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 18, gap: 8,
  },
  saveBtnText: { fontSize: 17, fontWeight: '800', color: theme.colors.black },
});