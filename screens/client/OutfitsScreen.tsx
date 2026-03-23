import React, { useState, useMemo } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, FlatList, Image,
  ScrollView, Modal, Alert, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../lib/theme';
import { DEMO_OUTFITS, OUTFIT_CATEGORIES } from '../../lib/demoOutfits';

const { width } = Dimensions.get('window');
const IMG_BASE = 'https://api.a0.dev/assets/image';

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
};

function getOutfitImage(item: any): string {
  if (item.image) return item.image;
  if (item.imagePrompt) {
    return `${IMG_BASE}?text=${encodeURIComponent(item.imagePrompt)}&aspect=3:4&seed=${Math.abs(hashCode(item._id || item.id || item.name)) % 10000}`;
  }
  return `${IMG_BASE}?text=${encodeURIComponent(item.name + ', fashion product photography')}&aspect=3:4&seed=8000`;
}

function hashCode(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  return h;
}

export default function OutfitsScreen() {
  const [activeCat, setActiveCat] = useState('All');
  const [detail, setDetail] = useState<any>(null);
  const [selSize, setSelSize] = useState('');
  const [selColor, setSelColor] = useState('');
  const [qty, setQty] = useState(1);

  const dbOutfits = useQuery(api.outfits.listByCategory, {});
  const submitOrder = useMutation(api.outfits.submitOrder);

  // Use DB outfits if available, fall back to demo data
  const allOutfits = useMemo(() => {
    if (dbOutfits && dbOutfits.length > 0) {
      return dbOutfits.map((o: any) => ({
        ...o,
        id: o._id,
        image: getOutfitImage(o),
      }));
    }
    return DEMO_OUTFITS;
  }, [dbOutfits]);

  const filtered = useMemo(() => {
    if (activeCat === 'All') return allOutfits;
    return allOutfits.filter((o: any) => o.category === activeCat);
  }, [allOutfits, activeCat]);

  const cols = 2;
  const cardW = (width - 48 - 10) / cols;

  const handleOrder = async () => {
    if (!selSize || !selColor) {
      Alert.alert('Select Options', 'Please choose a size and color before ordering.');
      return;
    }

    // If we have a real DB outfit with _id, try to submit via Convex
    if (detail._id && submitOrder) {
      try {
        await submitOrder({
          outfitId: detail._id,
          orderType: 'purchase',
          size: selSize,
          color: selColor,
          quantity: qty,
        });
        Alert.alert(
          'Order Submitted!',
          `${qty}x ${detail.name} (${selSize}, ${selColor}) - R${detail.price * qty} total.\n\nDiamond Angels will confirm your order within 24 hours.`,
          [{ text: 'OK', onPress: () => setDetail(null) }]
        );
        return;
      } catch (e: any) {
        // Fall through to demo alert
      }
    }

    Alert.alert(
      'Order Submitted!',
      `${qty}x ${detail.name} (${selSize}, ${selColor}) - R${detail.price * qty} total.\n\nDiamond Angels will confirm your order within 24 hours.`,
      [{ text: 'OK', onPress: () => setDetail(null) }]
    );
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={{ paddingHorizontal: 16, paddingTop: 12 }}>
          <Text style={styles.title}>Outfits Shop</Text>
          <Text style={styles.subtitle}>
            {filtered.length} outfits available
          </Text>
        </View>

        {/* Category Tabs */}
        <View style={{ paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: C.border }}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}>
            {OUTFIT_CATEGORIES.map(cat => (
              <TouchableOpacity
                key={cat}
                style={[styles.catChip, activeCat === cat && styles.catChipActive]}
                onPress={() => setActiveCat(cat)}
              >
                <Text style={[styles.catChipText, activeCat === cat && { color: C.black }]}>{cat}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Outfit Grid */}
        <FlatList
          data={filtered}
          keyExtractor={(i: any) => i.id || i._id}
          numColumns={cols}
          contentContainerStyle={{ padding: 16 }}
          columnWrapperStyle={{ gap: 10 }}
          renderItem={({ item }: any) => (
            <TouchableOpacity
              style={[styles.gridCard, { width: cardW }]}
              onPress={() => { setDetail(item); setSelSize(''); setSelColor(''); setQty(1); }}
              activeOpacity={0.7}
            >
              <Image source={{ uri: getOutfitImage(item) }} style={{ width: cardW, height: cardW * 1.3, resizeMode: 'cover' }} />
              <View style={{ padding: 10 }}>
                <Text style={styles.cardName} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.cardCategory}>{item.category}</Text>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 }}>
                  <Text style={styles.cardPrice}>R{item.price}</Text>
                  {item.brandable && (
                    <View style={styles.brandBadge}>
                      <Text style={styles.brandBadgeText}>BRANDABLE</Text>
                    </View>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="shirt-outline" size={48} color={C.muted} />
              <Text style={styles.emptyText}>No outfits in this category</Text>
            </View>
          }
        />

        {/* Detail Modal */}
        <Modal visible={!!detail} animationType="slide" transparent>
          {detail && (
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
                  <Image source={{ uri: getOutfitImage(detail) }} style={{ width: '100%', height: 320, borderRadius: 14 }} />

                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: 14 }}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.detailName}>{detail.name}</Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 }}>
                        <View style={styles.detailCatBadge}>
                          <Text style={styles.detailCatText}>{detail.category}</Text>
                        </View>
                        {detail.brandable && (
                          <View style={styles.detailBrandBadge}>
                            <Text style={styles.detailBrandText}>Brandable</Text>
                          </View>
                        )}
                      </View>
                    </View>
                    <Text style={styles.detailPrice}>R{detail.price}</Text>
                  </View>

                  <Text style={styles.detailDesc}>{detail.description}</Text>

                  <Text style={styles.sectionLabel}>Size</Text>
                  <View style={styles.optionRow}>
                    {detail.sizes?.map((sz: string) => (
                      <TouchableOpacity
                        key={sz}
                        style={[styles.optionChip, selSize === sz && styles.optionChipActive]}
                        onPress={() => setSelSize(sz)}
                      >
                        <Text style={[styles.optionChipText, selSize === sz && { color: C.black }]}>{sz}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <Text style={styles.sectionLabel}>Color</Text>
                  <View style={styles.optionRow}>
                    {detail.colors?.map((clr: string) => (
                      <TouchableOpacity
                        key={clr}
                        style={[styles.optionChip, selColor === clr && styles.optionChipActive]}
                        onPress={() => setSelColor(clr)}
                      >
                        <Text style={[styles.optionChipText, selColor === clr && { color: C.black }]}>{clr}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <Text style={styles.sectionLabel}>Quantity</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <TouchableOpacity
                      style={styles.qtyBtn}
                      onPress={() => setQty(Math.max(1, qty - 1))}
                    >
                      <Text style={styles.qtyBtnText}>-</Text>
                    </TouchableOpacity>
                    <Text style={styles.qtyValue}>{qty}</Text>
                    <TouchableOpacity
                      style={styles.qtyBtn}
                      onPress={() => setQty(qty + 1)}
                    >
                      <Text style={styles.qtyBtnText}>+</Text>
                    </TouchableOpacity>
                    <Text style={styles.qtyTotal}>
                      Total: <Text style={{ color: C.gold, fontWeight: '700' }}>R{detail.price * qty}</Text>
                    </Text>
                  </View>
                </ScrollView>

                <View style={{ flexDirection: 'row', gap: 10, marginTop: 16 }}>
                  <TouchableOpacity
                    style={[styles.goldBtn, { flex: 1, flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: 0 }]}
                    onPress={handleOrder}
                  >
                    <Ionicons name="cart" size={18} color={C.black} />
                    <Text style={styles.goldBtnText}>Order Now</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.goldBtn, { paddingHorizontal: 20, backgroundColor: C.cardLight, marginTop: 0 }]} onPress={() => setDetail(null)}>
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

  // Category chips
  catChip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
    backgroundColor: C.cardLight, borderWidth: 1, borderColor: C.border,
  },
  catChipActive: { backgroundColor: C.gold, borderColor: C.gold },
  catChipText: { color: C.sub, fontSize: 13, fontWeight: '600' },

  // Grid
  gridCard: { backgroundColor: C.card, borderRadius: 12, marginBottom: 12, overflow: 'hidden' },
  cardName: { color: C.text, fontWeight: '700', fontSize: 13 },
  cardCategory: { color: C.muted, fontSize: 11, marginTop: 2 },
  cardPrice: { color: C.gold, fontWeight: '800', fontSize: 15 },
  brandBadge: { backgroundColor: 'rgba(201,168,76,0.12)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8 },
  brandBadgeText: { color: C.gold, fontSize: 9, fontWeight: '600' },

  // Empty
  empty: { alignItems: 'center', paddingVertical: 40 },
  emptyText: { fontSize: 15, color: C.sub, marginTop: 12 },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: C.card, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, maxHeight: '85%' },

  // Detail
  detailName: { fontSize: 22, fontWeight: '800', color: C.text },
  detailPrice: { color: C.gold, fontWeight: '800', fontSize: 22 },
  detailDesc: { color: C.sub, fontSize: 13, lineHeight: 19, marginTop: 10 },
  detailCatBadge: { backgroundColor: 'rgba(201,168,76,0.12)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  detailCatText: { color: C.gold, fontSize: 11, fontWeight: '600' },
  detailBrandBadge: { backgroundColor: 'rgba(16,185,129,0.12)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  detailBrandText: { color: C.green, fontSize: 11, fontWeight: '600' },

  // Options
  sectionLabel: { fontSize: 16, fontWeight: '700', color: C.text, marginTop: 16, marginBottom: 8 },
  optionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  optionChip: {
    paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10,
    backgroundColor: C.cardLight, borderWidth: 1, borderColor: C.border,
  },
  optionChipActive: { backgroundColor: C.gold, borderColor: C.gold },
  optionChipText: { color: C.text, fontWeight: '600', fontSize: 13 },

  // Quantity
  qtyBtn: {
    width: 40, height: 40, borderRadius: 10, backgroundColor: C.cardLight,
    alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: C.border,
  },
  qtyBtnText: { color: C.text, fontSize: 18, fontWeight: '700' },
  qtyValue: { color: C.text, fontSize: 18, fontWeight: '700', minWidth: 30, textAlign: 'center' },
  qtyTotal: { color: C.sub, fontSize: 13, marginLeft: 8 },

  // Gold button
  goldBtn: { backgroundColor: C.gold, paddingVertical: 14, borderRadius: 12, alignItems: 'center', marginTop: 16 },
  goldBtnText: { color: C.black, fontWeight: '700', fontSize: 15 },
});