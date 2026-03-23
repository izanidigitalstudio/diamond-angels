import React, { useState, useMemo } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, FlatList, Image,
  ActivityIndicator, Modal, TextInput, ScrollView, Alert, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../lib/theme';
import { SA_CITIES, RACE_OPTIONS, BODY_TYPES, CATEGORIES, EVENT_TYPES, HEIGHT_MIN, HEIGHT_MAX } from '../../lib/constants';
import { DEMO_TALENT } from '../../lib/demoTalent';

const { width } = Dimensions.get('window');
const COLS = width > 400 ? 3 : 2;
const CARD_GAP = 10;
const CARD_W = (width - 48 - (COLS - 1) * CARD_GAP) / COLS;

const SLIDE_W = width - 40;

const C = {
  bg: theme.colors.background,
  card: theme.colors.card,
  cardLight: theme.colors.cardLight,
  gold: theme.colors.primary,
  text: theme.colors.text,
  sub: theme.colors.textSecondary,
  muted: theme.colors.textMuted,
  border: theme.colors.border,
  green: theme.colors.success,
  black: theme.colors.black,
  red: '#EF4444',
  warn: '#F59E0B',
};

const IMG_BASE = 'https://api.a0.dev/assets/image';
function generatePhotosForProfile(p: any): string[] {
  const race = (p.race || '').toLowerCase();
  const city = (p.city || '').toLowerCase();
  const body = (p.bodyType || '').toLowerCase();
  const cat = (p.categories?.[0] || 'model').toLowerCase();
  // Use a simple hash of the _id for a stable seed
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
  const [idx, setIdx] = useState(0);
  const valid = photos.filter(Boolean);
  if (valid.length === 0) {
    return (
      <View style={{ width: SLIDE_W, height: SLIDE_W * 1.2, borderRadius: 14, backgroundColor: C.cardLight, alignItems: 'center', justifyContent: 'center' }}>
        <Ionicons name="person" size={48} color={C.muted} />
      </View>
    );
  }
  return (
    <View>
      <ScrollView
        horizontal pagingEnabled showsHorizontalScrollIndicator={false}
        onScroll={(e: any) => setIdx(Math.round(e.nativeEvent.contentOffset.x / SLIDE_W))}
        scrollEventThrottle={16}
      >
        {valid.map((url: string, i: number) => (
          <Image key={i} source={{ uri: url }} style={{ width: SLIDE_W, height: SLIDE_W * 1.2, borderRadius: 14 }} />
        ))}
      </ScrollView>
      {valid.length > 1 && (
        <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: 8 }}>
          {valid.map((_: string, i: number) => (
            <View key={i} style={{ width: idx === i ? 20 : 8, height: 8, borderRadius: 4, backgroundColor: idx === i ? C.gold : C.border }} />
          ))}
        </View>
      )}
      <Text style={{ color: C.muted, fontSize: 12, textAlign: 'center', marginTop: 4 }}>{idx + 1} / {valid.length}</Text>
    </View>
  );
}

export default function SearchTalentScreen() {
  const [filterCity, setFilterCity] = useState('');
  const [filterRace, setFilterRace] = useState('');
  const [filterBodyType, setFilterBodyType] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterMinHeight, setFilterMinHeight] = useState(0);
  const [filterMaxHeight, setFilterMaxHeight] = useState(200);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [showDetail, setShowDetail] = useState<any>(null);
  const [bookingForm, setBookingForm] = useState({
    eventType: '', eventDate: '', city: '', venue: '', requirements: '',
  });

  const dbProfiles = useQuery(api.talent.listApprovedProfiles, filterCity ? { city: filterCity } : {});
  const createBooking = useMutation(api.bookings.createBookingRequest);

  // Use DB profiles if available, fall back to demo data
  const allProfiles = useMemo(() => {
    if (dbProfiles && dbProfiles.length > 0) {
      return dbProfiles.map((p: any) => {
        const existingPhotos = [...(p.photos || []), ...(p.photoUrls || [])].filter(Boolean);
        const photos = existingPhotos.length > 0 ? existingPhotos : generatePhotosForProfile(p);
        return { ...p, id: p._id, photos };
      });
    }
    return DEMO_TALENT;
  }, [dbProfiles]);

  const cities = useMemo(() => [...new Set(allProfiles.map((t: any) => t.city))].sort(), [allProfiles]);

  const filteredProfiles = useMemo(() => {
    return allProfiles.filter((p: any) => {
      if (filterCity && p.city !== filterCity) return false;
      if (filterRace && p.race !== filterRace) return false;
      if (filterBodyType && p.bodyType !== filterBodyType) return false;
      if (filterCategory && !p.categories.includes(filterCategory)) return false;
      if (p.heightCm < filterMinHeight) return false;
      if (filterMaxHeight < 200 && p.heightCm > filterMaxHeight) return false;
      return true;
    });
  }, [allProfiles, filterCity, filterRace, filterBodyType, filterCategory, filterMinHeight, filterMaxHeight]);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev: Set<string>) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSubmitBooking = async () => {
    if (!bookingForm.eventType || !bookingForm.eventDate || !bookingForm.city) {
      Alert.alert('Missing Fields', 'Please fill in event type, date, and city');
      return;
    }
    try {
      await createBooking({
        talentProfileIds: Array.from(selectedIds) as any,
        ...bookingForm,
      });
      Alert.alert('Success', 'Your booking request has been submitted! Our team will review it and get back to you.');
      setSelectedIds(new Set());
      setShowBookingForm(false);
      setBookingForm({ eventType: '', eventDate: '', city: '', venue: '', requirements: '' });
    } catch (e: any) {
      Alert.alert('Error', e.message);
    }
  };

  const clearFilters = () => {
    setFilterCity(''); setFilterRace(''); setFilterBodyType('');
    setFilterCategory(''); setFilterMinHeight(0); setFilterMaxHeight(200);
  };

  const activeFilterCount = [filterCity, filterRace, filterBodyType, filterCategory, filterMinHeight > 0 ? 'h' : '', filterMaxHeight < 200 ? 'h' : ''].filter(Boolean).length;

  if (dbProfiles === undefined) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={C.gold} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        {/* Header */}
        <View style={{ paddingHorizontal: 16, paddingTop: 12 }}>
          <Text style={styles.title}>Search Talent</Text>
          <Text style={styles.subtitle}>
            {filteredProfiles.length} of {allProfiles.length} talent available
          </Text>
        </View>

        {/* Filter Bar */}
        <View style={{ paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: C.border, marginTop: 8 }}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 8, alignItems: 'center' }}>
            <TouchableOpacity
              style={[styles.filterPill, activeFilterCount > 0 && styles.filterPillActive]}
              onPress={() => setShowFilters(true)}
            >
              <Ionicons name="options" size={16} color={activeFilterCount > 0 ? C.black : C.gold} />
              <Text style={[styles.filterPillText, activeFilterCount > 0 && { color: C.black }]}>
                Filters{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
              </Text>
            </TouchableOpacity>
            {cities.map((c: string) => (
              <TouchableOpacity
                key={c}
                style={[styles.cityChip, filterCity === c && styles.cityChipActive]}
                onPress={() => setFilterCity(filterCity === c ? '' : c)}
              >
                <Text style={[styles.cityChipText, filterCity === c && { color: C.black }]}>{c}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Active filter tags */}
          {activeFilterCount > 0 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 6, marginTop: 8 }}>
              {filterRace ? (
                <TouchableOpacity style={styles.activeTag} onPress={() => setFilterRace('')}>
                  <Text style={styles.activeTagText}>{filterRace}</Text>
                  <Ionicons name="close" size={12} color={C.gold} />
                </TouchableOpacity>
              ) : null}
              {filterBodyType ? (
                <TouchableOpacity style={styles.activeTag} onPress={() => setFilterBodyType('')}>
                  <Text style={styles.activeTagText}>{filterBodyType}</Text>
                  <Ionicons name="close" size={12} color={C.gold} />
                </TouchableOpacity>
              ) : null}
              {filterCategory ? (
                <TouchableOpacity style={styles.activeTag} onPress={() => setFilterCategory('')}>
                  <Text style={styles.activeTagText}>{filterCategory}</Text>
                  <Ionicons name="close" size={12} color={C.gold} />
                </TouchableOpacity>
              ) : null}
              {(filterMinHeight > 0 || filterMaxHeight < 200) ? (
                <TouchableOpacity style={styles.activeTag} onPress={() => { setFilterMinHeight(0); setFilterMaxHeight(200); }}>
                  <Text style={styles.activeTagText}>{filterMinHeight || 155}-{filterMaxHeight < 200 ? filterMaxHeight : '185+'}cm</Text>
                  <Ionicons name="close" size={12} color={C.gold} />
                </TouchableOpacity>
              ) : null}
              <TouchableOpacity onPress={clearFilters} style={{ justifyContent: 'center', paddingHorizontal: 8 }}>
                <Text style={{ color: C.red, fontSize: 12, fontWeight: '600' }}>Clear All</Text>
              </TouchableOpacity>
            </ScrollView>
          )}
        </View>

        {/* Talent Grid */}
        <FlatList
          data={filteredProfiles}
          keyExtractor={(item: any) => item.id || item._id}
          numColumns={COLS}
          contentContainerStyle={{ padding: 16, paddingBottom: selectedIds.size > 0 ? 80 : 16 }}
          columnWrapperStyle={{ gap: CARD_GAP }}
          renderItem={({ item }: any) => {
            const isSel = selectedIds.has(item.id || item._id);
            const photoUrl = item.photos?.[0] || item.photoUrls?.[0];
            return (
              <TouchableOpacity
                style={[styles.gridCard, { width: CARD_W, marginBottom: CARD_GAP }, isSel && styles.gridCardSelected]}
                onPress={() => setShowDetail(item)}
                onLongPress={() => toggleSelect(item.id || item._id)}
                activeOpacity={0.8}
              >
                <Image source={{ uri: photoUrl }} style={[styles.gridImg, { width: CARD_W - (isSel ? 4 : 0), height: CARD_W * 1.3 }]} />
                <TouchableOpacity
                  style={[styles.checkbox, isSel && styles.checkboxActive]}
                  onPress={() => toggleSelect(item.id || item._id)}
                >
                  {isSel && <Ionicons name="checkmark" size={14} color={C.black} />}
                </TouchableOpacity>
                <View style={{ padding: 8 }}>
                  <Text style={styles.cardName} numberOfLines={1}>{item.firstName} {item.lastName}</Text>
                  <Text style={styles.cardCity}>{item.city} · {item.heightCm}cm</Text>
                  <Text style={styles.cardCategory}>{item.categories[0]}</Text>
                </View>
              </TouchableOpacity>
            );
          }}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="search" size={48} color={C.muted} />
              <Text style={styles.emptyText}>No talent matches your filters</Text>
              <TouchableOpacity onPress={clearFilters} style={{ marginTop: 12 }}>
                <Text style={{ color: C.gold, fontWeight: '600' }}>Clear Filters</Text>
              </TouchableOpacity>
            </View>
          }
        />

        {/* Selection Bar */}
        {selectedIds.size > 0 && (
          <View style={styles.selectionBar}>
            <View style={{ flex: 1 }}>
              <Text style={{ color: C.text, fontWeight: '700', fontSize: 15 }}>{selectedIds.size} talent selected</Text>
              <TouchableOpacity onPress={() => setSelectedIds(new Set())}>
                <Text style={{ color: C.sub, fontSize: 12, marginTop: 2 }}>Clear selection</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.submitBtn} onPress={() => setShowBookingForm(true)}>
              <Ionicons name="send" size={16} color={C.black} />
              <Text style={{ color: C.black, fontWeight: '700', fontSize: 14 }}>Submit Selection</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Filter Modal */}
        <Modal visible={showFilters} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { maxHeight: '80%' }]}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <Text style={styles.modalTitle}>Filter Talent</Text>
                <TouchableOpacity onPress={clearFilters}>
                  <Text style={{ color: C.gold, fontSize: 14, fontWeight: '600' }}>Clear All</Text>
                </TouchableOpacity>
              </View>
              <ScrollView showsVerticalScrollIndicator={false}>
                <Text style={styles.filterLabel}>City</Text>
                <View style={styles.optionRow}>
                  <TouchableOpacity style={[styles.optionChip, !filterCity && styles.optionChipActive]} onPress={() => setFilterCity('')}>
                    <Text style={[styles.optionText, !filterCity && { color: C.black }]}>All</Text>
                  </TouchableOpacity>
                  {cities.map((c: string) => (
                    <TouchableOpacity key={c} style={[styles.optionChip, filterCity === c && styles.optionChipActive]} onPress={() => setFilterCity(filterCity === c ? '' : c)}>
                      <Text style={[styles.optionText, filterCity === c && { color: C.black }]}>{c}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <Text style={styles.filterLabel}>Race</Text>
                <View style={styles.optionRow}>
                  <TouchableOpacity style={[styles.optionChip, !filterRace && styles.optionChipActive]} onPress={() => setFilterRace('')}>
                    <Text style={[styles.optionText, !filterRace && { color: C.black }]}>All</Text>
                  </TouchableOpacity>
                  {RACE_OPTIONS.map((r) => (
                    <TouchableOpacity key={r} style={[styles.optionChip, filterRace === r && styles.optionChipActive]} onPress={() => setFilterRace(filterRace === r ? '' : r)}>
                      <Text style={[styles.optionText, filterRace === r && { color: C.black }]}>{r}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <Text style={styles.filterLabel}>Body Type</Text>
                <View style={styles.optionRow}>
                  <TouchableOpacity style={[styles.optionChip, !filterBodyType && styles.optionChipActive]} onPress={() => setFilterBodyType('')}>
                    <Text style={[styles.optionText, !filterBodyType && { color: C.black }]}>All</Text>
                  </TouchableOpacity>
                  {BODY_TYPES.map((b) => (
                    <TouchableOpacity key={b} style={[styles.optionChip, filterBodyType === b && styles.optionChipActive]} onPress={() => setFilterBodyType(filterBodyType === b ? '' : b)}>
                      <Text style={[styles.optionText, filterBodyType === b && { color: C.black }]}>{b}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <Text style={styles.filterLabel}>Category</Text>
                <View style={styles.optionRow}>
                  <TouchableOpacity style={[styles.optionChip, !filterCategory && styles.optionChipActive]} onPress={() => setFilterCategory('')}>
                    <Text style={[styles.optionText, !filterCategory && { color: C.black }]}>All</Text>
                  </TouchableOpacity>
                  {CATEGORIES.map((c) => (
                    <TouchableOpacity key={c} style={[styles.optionChip, filterCategory === c && styles.optionChipActive]} onPress={() => setFilterCategory(filterCategory === c ? '' : c)}>
                      <Text style={[styles.optionText, filterCategory === c && { color: C.black }]}>{c}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <Text style={styles.filterLabel}>Height Range (cm)</Text>
                <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center', marginBottom: 20 }}>
                  <View style={styles.heightInput}>
                    <Text style={{ color: C.sub, fontSize: 11 }}>Min</Text>
                    {[155, 160, 165, 170, 175].map(h => (
                      <TouchableOpacity key={h} style={[styles.hChip, filterMinHeight === h && styles.hChipActive]} onPress={() => setFilterMinHeight(filterMinHeight === h ? 0 : h)}>
                        <Text style={[styles.hChipText, filterMinHeight === h && { color: C.black }]}>{h}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  <Text style={{ color: C.muted }}>—</Text>
                  <View style={styles.heightInput}>
                    <Text style={{ color: C.sub, fontSize: 11 }}>Max</Text>
                    {[165, 170, 175, 180, 185].map(h => (
                      <TouchableOpacity key={h} style={[styles.hChip, filterMaxHeight === h && styles.hChipActive]} onPress={() => setFilterMaxHeight(filterMaxHeight === h ? 200 : h)}>
                        <Text style={[styles.hChipText, filterMaxHeight === h && { color: C.black }]}>{h}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </ScrollView>
              <TouchableOpacity style={styles.goldBtn} onPress={() => setShowFilters(false)}>
                <Text style={styles.goldBtnText}>Show {filteredProfiles.length} Results</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Booking Form Modal */}
        <Modal visible={showBookingForm} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { maxHeight: '75%' }]}>
              <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                <Text style={styles.modalTitle}>Submit Booking Request</Text>
                <Text style={styles.bookingInfo}>
                  {selectedIds.size} talent selected. Fill in your event details below.
                </Text>

                {/* Selected talent preview */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
                  {allProfiles.filter((t: any) => selectedIds.has(t.id || t._id)).map((t: any) => (
                    <View key={t.id || t._id} style={{ alignItems: 'center', marginRight: 12 }}>
                      <Image source={{ uri: t.photos?.[0] || t.photoUrls?.[0] }} style={{ width: 50, height: 65, borderRadius: 8, borderWidth: 2, borderColor: C.gold }} />
                      <Text style={{ color: C.text, fontSize: 10, marginTop: 4, maxWidth: 56, textAlign: 'center' }} numberOfLines={1}>{t.firstName}</Text>
                    </View>
                  ))}
                </ScrollView>

                <Text style={styles.filterLabel}>Event Type *</Text>
                <View style={styles.optionRow}>
                  {EVENT_TYPES.map((e) => (
                    <TouchableOpacity key={e} style={[styles.optionChip, bookingForm.eventType === e && styles.optionChipActive]}
                      onPress={() => setBookingForm({ ...bookingForm, eventType: e })}>
                      <Text style={[styles.optionText, bookingForm.eventType === e && { color: C.black }]}>{e}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <Text style={styles.filterLabel}>Event Date *</Text>
                <TextInput style={styles.input} placeholder="e.g. 15 March 2025" placeholderTextColor={C.muted}
                  value={bookingForm.eventDate} onChangeText={(v: string) => setBookingForm({ ...bookingForm, eventDate: v })} />
                <Text style={styles.filterLabel}>City *</Text>
                <TextInput style={styles.input} placeholder="Event city" placeholderTextColor={C.muted}
                  value={bookingForm.city} onChangeText={(v: string) => setBookingForm({ ...bookingForm, city: v })} />
                <Text style={styles.filterLabel}>Venue</Text>
                <TextInput style={styles.input} placeholder="Venue name" placeholderTextColor={C.muted}
                  value={bookingForm.venue} onChangeText={(v: string) => setBookingForm({ ...bookingForm, venue: v })} />
                <Text style={styles.filterLabel}>Requirements / Notes</Text>
                <TextInput style={[styles.input, { height: 80, textAlignVertical: 'top' }]} placeholder="Any specific requirements..."
                  placeholderTextColor={C.muted} multiline
                  value={bookingForm.requirements} onChangeText={(v: string) => setBookingForm({ ...bookingForm, requirements: v })} />

                <View style={{ backgroundColor: 'rgba(201,168,76,0.08)', borderRadius: 12, padding: 14, marginTop: 12 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Ionicons name="information-circle" size={18} color={C.gold} />
                    <Text style={{ color: C.gold, fontWeight: '600', fontSize: 13 }}>How it works</Text>
                  </View>
                  <Text style={{ color: C.sub, fontSize: 12, lineHeight: 18, marginTop: 6 }}>
                    Once submitted, our team will review your selection and reach out to the chosen talent on your behalf. We'll confirm availability within 24-48 hours.
                  </Text>
                </View>
              </ScrollView>
              <View style={{ flexDirection: 'row', gap: 10, marginTop: 16 }}>
                <TouchableOpacity style={[styles.goldBtn, { flex: 1, flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: 0 }]} onPress={handleSubmitBooking}>
                  <Ionicons name="send" size={16} color={C.black} />
                  <Text style={styles.goldBtnText}>Submit to Agency</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.goldBtn, { paddingHorizontal: 20, backgroundColor: C.cardLight, marginTop: 0 }]} onPress={() => setShowBookingForm(false)}>
                  <Text style={{ color: C.sub, fontWeight: '600' }}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Detail Modal */}
        <Modal visible={!!showDetail} animationType="slide" transparent>
          {showDetail && (
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                  <PhotoSlider photos={showDetail.photos || showDetail.photoUrls || []} />
                  <Text style={[styles.title, { marginTop: 16 }]}>{showDetail.firstName} {showDetail.lastName}</Text>
                  <Text style={{ color: C.sub, fontSize: 12, marginTop: 2 }}>
                    {showDetail.city}, {showDetail.area} · {showDetail.race} · {showDetail.bodyType} · {showDetail.heightCm}cm
                  </Text>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
                    {showDetail.categories?.map((c: string, i: number) => (
                      <View key={i} style={styles.chip}><Text style={styles.chipText}>{c}</Text></View>
                    ))}
                  </View>

                  {showDetail.background && (
                    <>
                      <Text style={styles.sectionTitle}>Background</Text>
                      <Text style={styles.sectionText}>{showDetail.background}</Text>
                    </>
                  )}
                  {(showDetail.bio || showDetail.qualifications) && (
                    <>
                      <Text style={styles.sectionTitle}>{showDetail.bio ? 'About' : 'Qualifications'}</Text>
                      <Text style={styles.sectionText}>{showDetail.bio || showDetail.qualifications}</Text>
                    </>
                  )}
                  {showDetail.skills && (
                    <>
                      <Text style={styles.sectionTitle}>Skills</Text>
                      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
                        {showDetail.skills.map((sk: string, i: number) => (
                          <View key={i} style={[styles.chip, { backgroundColor: 'rgba(139,92,246,0.12)' }]}>
                            <Text style={[styles.chipText, { color: '#A78BFA' }]}>{sk}</Text>
                          </View>
                        ))}
                      </View>
                    </>
                  )}
                  {showDetail.workExperience && (
                    <>
                      <Text style={styles.sectionTitle}>Work Experience</Text>
                      <Text style={styles.sectionText}>{showDetail.workExperience}</Text>
                    </>
                  )}
                  {showDetail.availability && (
                    <>
                      <Text style={styles.sectionTitle}>Availability</Text>
                      <Text style={styles.sectionText}>{showDetail.availability}</Text>
                    </>
                  )}
                </ScrollView>
                <View style={{ flexDirection: 'row', gap: 10, marginTop: 16 }}>
                  <TouchableOpacity
                    style={[styles.goldBtn, { flex: 1, flexDirection: 'row', justifyContent: 'center', gap: 6, backgroundColor: selectedIds.has(showDetail.id || showDetail._id) ? C.green : C.gold, marginTop: 0 }]}
                    onPress={() => toggleSelect(showDetail.id || showDetail._id)}
                  >
                    <Ionicons name={selectedIds.has(showDetail.id || showDetail._id) ? 'checkmark-circle' : 'add-circle'} size={18} color={C.black} />
                    <Text style={styles.goldBtnText}>{selectedIds.has(showDetail.id || showDetail._id) ? 'Selected' : 'Select Talent'}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.goldBtn, { paddingHorizontal: 20, backgroundColor: C.cardLight, marginTop: 0 }]} onPress={() => setShowDetail(null)}>
                    <Text style={{ color: C.sub, fontWeight: '600' }}>Close</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
        </Modal>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  safe: { flex: 1 },
  title: { fontSize: 24, fontWeight: '800', color: C.text },
  subtitle: { fontSize: 13, color: C.sub, marginTop: 2, marginBottom: 10 },

  // Filter bar
  filterPill: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 16, paddingVertical: 10, borderRadius: 22,
    backgroundColor: 'transparent', borderWidth: 1.5, borderColor: C.gold,
  },
  filterPillActive: { backgroundColor: C.gold },
  filterPillText: { color: C.gold, fontSize: 14, fontWeight: '700' },
  cityChip: {
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 18,
    backgroundColor: C.cardLight, borderWidth: 1, borderColor: C.border,
  },
  cityChipActive: { backgroundColor: C.gold, borderColor: C.gold },
  cityChipText: { color: C.sub, fontSize: 12, fontWeight: '600' },
  activeTag: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 10, paddingVertical: 6, borderRadius: 16,
    backgroundColor: 'rgba(201,168,76,0.15)',
  },
  activeTagText: { color: C.gold, fontSize: 12, fontWeight: '500' },

  // Grid cards
  gridCard: { backgroundColor: C.card, borderRadius: 10, overflow: 'hidden' },
  gridCardSelected: { borderWidth: 2, borderColor: C.gold },
  gridImg: { resizeMode: 'cover' as any },
  checkbox: {
    position: 'absolute', top: 8, right: 8,
    width: 24, height: 24, borderRadius: 12,
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.5)',
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center', justifyContent: 'center',
  },
  checkboxActive: { backgroundColor: C.gold, borderColor: C.gold },
  cardName: { color: C.text, fontWeight: '600', fontSize: 13 },
  cardCity: { color: C.sub, fontSize: 11 },
  cardCategory: { color: C.muted, fontSize: 10 },

  // Selection bar
  selectionBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: C.card, borderTopWidth: 1, borderTopColor: C.border,
    paddingHorizontal: 16, paddingVertical: 12, paddingBottom: 34,
  },
  submitBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: C.gold, paddingHorizontal: 18, paddingVertical: 12, borderRadius: 12,
  },

  // Modals
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'flex-end' },
  modalContent: {
    backgroundColor: C.card, borderTopLeftRadius: 20,
    borderTopRightRadius: 20, padding: 20, maxHeight: '85%',
  },
  modalTitle: { fontSize: 20, fontWeight: '800', color: C.text, marginBottom: 4 },

  // Filter modal
  filterLabel: { color: C.text, fontWeight: '700', fontSize: 15, marginBottom: 8, marginTop: 16 },
  optionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
  optionChip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
    borderWidth: 1, borderColor: C.border, backgroundColor: C.cardLight,
  },
  optionChipActive: { backgroundColor: C.gold, borderColor: C.gold },
  optionText: { color: C.text, fontSize: 13, fontWeight: '500' },
  heightInput: { flex: 1, flexDirection: 'row', flexWrap: 'wrap', gap: 6, alignItems: 'center' },
  hChip: {
    paddingHorizontal: 10, paddingVertical: 6, borderRadius: 16,
    borderWidth: 1, borderColor: C.border, backgroundColor: C.cardLight,
  },
  hChipActive: { backgroundColor: C.gold, borderColor: C.gold },
  hChipText: { color: C.text, fontSize: 12, fontWeight: '500' },

  // Gold button
  goldBtn: { backgroundColor: C.gold, paddingVertical: 14, borderRadius: 12, alignItems: 'center', marginTop: 16 },
  goldBtnText: { color: C.black, fontWeight: '700', fontSize: 15 },

  // Form
  input: {
    backgroundColor: C.cardLight, borderRadius: 12,
    paddingHorizontal: 16, paddingVertical: 14, fontSize: 15,
    color: C.text, borderWidth: 1, borderColor: C.border,
  },
  bookingInfo: { fontSize: 13, color: C.sub, marginBottom: 8 },

  // Detail modal
  chip: { backgroundColor: 'rgba(201,168,76,0.12)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12 },
  chipText: { color: C.gold, fontSize: 11, fontWeight: '500' },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: C.text, marginTop: 16, marginBottom: 8 },
  sectionText: { color: C.text, fontSize: 13, lineHeight: 19 },

  // Empty state
  empty: { alignItems: 'center', paddingVertical: 40 },
  emptyText: { fontSize: 15, color: C.sub, marginTop: 12 },
});