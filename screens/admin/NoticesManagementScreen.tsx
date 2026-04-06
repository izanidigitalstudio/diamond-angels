import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, FlatList, Modal,
  TextInput, Alert, KeyboardAvoidingView, Platform, Pressable,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { theme } from '../../lib/theme';

const NOTICE_TYPES = [
  { key: 'announcement', label: 'Announcement', icon: 'megaphone', color: theme.colors.primary },
  { key: 'reminder', label: 'Reminder', icon: 'alarm', color: '#F59E0B' },
  { key: 'update', label: 'Update', icon: 'information-circle', color: '#3B82F6' },
  { key: 'event', label: 'Event', icon: 'calendar', color: '#8B5CF6' },
  { key: 'alert', label: 'Alert', icon: 'warning', color: '#F43F5E' },
];

function getTypeConfig(type: string) {
  return NOTICE_TYPES.find(t => t.key === type) || NOTICE_TYPES[0];
}

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(ts).toLocaleDateString();
}

export default function NoticesManagementScreen() {
  const notices = useQuery(api.notices.listNotices);
  const createNotice = useMutation(api.notices.createNotice);
  const deleteNotice = useMutation(api.notices.deleteNotice);
  const togglePin = useMutation(api.notices.togglePin);

  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [type, setType] = useState('announcement');
  const [pinned, setPinned] = useState(false);
  const [creating, setCreating] = useState(false);

  const resetForm = () => {
    setTitle('');
    setBody('');
    setType('announcement');
    setPinned(false);
  };

  const handleCreate = async () => {
    if (!title.trim() || !body.trim()) {
      Alert.alert('Required', 'Title and body are required');
      return;
    }
    setCreating(true);
    try {
      await createNotice({ title: title.trim(), body: body.trim(), type, pinned });
      resetForm();
      setShowCreate(false);
      Alert.alert('Posted', 'Notice posted successfully. Talent will see it immediately.');
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to create notice');
    }
    setCreating(false);
  };

  const handleDelete = (id: any, noticeTitle: string) => {
    Alert.alert('Delete Notice', `Delete "${noticeTitle}"?`, [
      { text: 'Cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          try { await deleteNotice({ id }); } catch (e: any) {
            Alert.alert('Error', e.message || 'Failed to delete');
          }
        }
      },
    ]);
  };

  const handleTogglePin = async (id: any) => {
    try { await togglePin({ id }); } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to toggle pin');
    }
  };

  if (notices === undefined) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Notices</Text>
            <Text style={styles.subtitle}>{notices.length} notice{notices.length !== 1 ? 's' : ''} posted</Text>
          </View>
          <TouchableOpacity
            style={styles.createBtn}
            onPress={() => setShowCreate(true)}
            activeOpacity={0.7}
          >
            <Ionicons name="add" size={20} color={theme.colors.background} />
            <Text style={styles.createBtnText}>New Notice</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={notices}
          keyExtractor={(item: any) => item._id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }: any) => {
            const config = getTypeConfig(item.type);
            return (
              <View style={[styles.card, item.pinned && styles.cardPinned]}>
                {item.pinned && (
                  <View style={styles.pinnedBadge}>
                    <Ionicons name="pin" size={10} color={theme.colors.primary} />
                    <Text style={styles.pinnedText}>Pinned</Text>
                  </View>
                )}
                <View style={styles.cardRow}>
                  <View style={[styles.typeIcon, { backgroundColor: config.color + '20' }]}>
                    <Ionicons name={config.icon as any} size={18} color={config.color} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cardTitle}>{item.title}</Text>
                    <View style={styles.metaRow}>
                      <View style={[styles.typeBadge, { backgroundColor: config.color + '15' }]}>
                        <Text style={[styles.typeText, { color: config.color }]}>{config.label}</Text>
                      </View>
                      <Text style={styles.dateText}>{timeAgo(item._creationTime)}</Text>
                    </View>
                  </View>
                </View>
                <Text style={styles.cardBody} numberOfLines={3}>{item.body}</Text>
                <View style={styles.cardActions}>
                  <TouchableOpacity
                    style={styles.cardAction}
                    onPress={() => handleTogglePin(item._id)}
                  >
                    <Ionicons
                      name={item.pinned ? 'pin' : 'pin-outline'}
                      size={16}
                      color={item.pinned ? theme.colors.primary : theme.colors.textMuted}
                    />
                    <Text style={[styles.cardActionText, item.pinned && { color: theme.colors.primary }]}>
                      {item.pinned ? 'Unpin' : 'Pin'}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.cardAction}
                    onPress={() => handleDelete(item._id, item.title)}
                  >
                    <Ionicons name="trash-outline" size={16} color={theme.colors.error} />
                    <Text style={[styles.cardActionText, { color: theme.colors.error }]}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          }}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="newspaper-outline" size={48} color={theme.colors.textMuted} />
              <Text style={styles.emptyTitle}>No Notices Yet</Text>
              <Text style={styles.emptyText}>Post a notice for your talent to see</Text>
              <TouchableOpacity
                style={[styles.createBtn, { marginTop: 16 }]}
                onPress={() => setShowCreate(true)}
              >
                <Ionicons name="add" size={18} color={theme.colors.background} />
                <Text style={styles.createBtnText}>Post First Notice</Text>
              </TouchableOpacity>
            </View>
          }
        />

        {/* Create Notice Modal */}
        <Modal visible={showCreate} transparent animationType="slide">
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
            <Pressable style={styles.overlay} onPress={() => setShowCreate(false)}>
              <Pressable style={styles.sheet} onPress={e => e.stopPropagation()}>
                <Text style={styles.sheetTitle}>Post New Notice</Text>
                <Text style={styles.sheetSubtitle}>
                  This will appear on the talent notice board immediately.
                </Text>

                <Text style={styles.fieldLabel}>Notice Type</Text>
                <View style={styles.typeRow}>
                  {NOTICE_TYPES.map(t => (
                    <TouchableOpacity
                      key={t.key}
                      style={[
                        styles.typeChip,
                        type === t.key && { backgroundColor: t.color + '20', borderColor: t.color },
                      ]}
                      onPress={() => setType(t.key)}
                    >
                      <Ionicons name={t.icon as any} size={14} color={type === t.key ? t.color : theme.colors.textMuted} />
                      <Text style={[styles.typeChipText, type === t.key && { color: t.color }]}>
                        {t.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={styles.fieldLabel}>Title</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Notice title..."
                  placeholderTextColor={theme.colors.textMuted}
                  value={title}
                  onChangeText={setTitle}
                />

                <Text style={styles.fieldLabel}>Body</Text>
                <TextInput
                  style={[styles.input, { minHeight: 100, textAlignVertical: 'top' }]}
                  placeholder="Write your notice content here..."
                  placeholderTextColor={theme.colors.textMuted}
                  value={body}
                  onChangeText={setBody}
                  multiline
                />

                <TouchableOpacity
                  style={styles.pinToggle}
                  onPress={() => setPinned(!pinned)}
                >
                  <Ionicons
                    name={pinned ? 'checkbox' : 'square-outline'}
                    size={20}
                    color={pinned ? theme.colors.primary : theme.colors.textMuted}
                  />
                  <Text style={[styles.pinToggleText, pinned && { color: theme.colors.primary }]}>
                    Pin this notice to the top
                  </Text>
                </TouchableOpacity>

                <View style={styles.btnRow}>
                  <TouchableOpacity
                    style={styles.cancelBtn}
                    onPress={() => { setShowCreate(false); resetForm(); }}
                  >
                    <Text style={styles.cancelText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.postBtn}
                    onPress={handleCreate}
                    disabled={creating}
                  >
                    {creating ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <>
                        <Ionicons name="send" size={16} color="#fff" />
                        <Text style={styles.postText}>Post Notice</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              </Pressable>
            </Pressable>
          </KeyboardAvoidingView>
        </Modal>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  safe: { flex: 1 },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, marginTop: 16, marginBottom: 16,
  },
  title: { fontSize: 28, fontWeight: '800', color: theme.colors.primary },
  subtitle: { fontSize: 13, color: theme.colors.textSecondary, marginTop: 2 },
  createBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: theme.colors.primary, paddingHorizontal: 16,
    paddingVertical: 10, borderRadius: 12,
  },
  createBtnText: { fontSize: 14, fontWeight: '700', color: theme.colors.background },
  list: { paddingHorizontal: 20, paddingBottom: 30 },
  card: {
    backgroundColor: theme.colors.card, borderRadius: 16, padding: 16,
    marginBottom: 12, borderWidth: 1, borderColor: theme.colors.border,
  },
  cardPinned: {
    borderColor: theme.colors.primary + '40',
    backgroundColor: theme.colors.primary + '08',
  },
  pinnedBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    alignSelf: 'flex-start', marginBottom: 8,
    backgroundColor: theme.colors.primary + '15',
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8,
  },
  pinnedText: { fontSize: 10, fontWeight: '700', color: theme.colors.primary },
  cardRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  typeIcon: {
    width: 36, height: 36, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 15, fontWeight: '700', color: theme.colors.text,
    lineHeight: 20, marginBottom: 6,
  },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  typeBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  typeText: { fontSize: 11, fontWeight: '600' },
  dateText: { fontSize: 12, color: theme.colors.textMuted },
  cardBody: {
    fontSize: 13, color: theme.colors.textSecondary,
    lineHeight: 19, marginTop: 10, paddingLeft: 48,
  },
  cardActions: {
    flexDirection: 'row', gap: 16, marginTop: 12, paddingLeft: 48,
    borderTopWidth: 1, borderTopColor: theme.colors.border, paddingTop: 10,
  },
  cardAction: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  cardActionText: { fontSize: 12, fontWeight: '600', color: theme.colors.textMuted },
  empty: { alignItems: 'center', paddingTop: 60, gap: 8 },
  emptyTitle: { fontSize: 17, fontWeight: '700', color: theme.colors.textSecondary },
  emptyText: { fontSize: 13, color: theme.colors.textMuted },

  // Modal
  overlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: theme.colors.card, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 24, borderWidth: 1, borderColor: theme.colors.border,
    maxHeight: '90%',
  },
  sheetTitle: { fontSize: 20, fontWeight: '800', color: theme.colors.text, marginBottom: 4 },
  sheetSubtitle: { fontSize: 13, color: theme.colors.textSecondary, marginBottom: 20 },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: theme.colors.textSecondary, marginBottom: 8, marginTop: 12 },
  typeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  typeChip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10,
    backgroundColor: theme.colors.cardLight, borderWidth: 1, borderColor: theme.colors.border,
  },
  typeChipText: { fontSize: 12, fontWeight: '600', color: theme.colors.textSecondary },
  input: {
    backgroundColor: theme.colors.inputBg, borderRadius: 12, paddingHorizontal: 16,
    paddingVertical: 14, fontSize: 15, color: theme.colors.text,
    borderWidth: 1, borderColor: theme.colors.border,
  },
  pinToggle: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    marginTop: 16, paddingVertical: 8,
  },
  pinToggleText: { fontSize: 14, fontWeight: '600', color: theme.colors.textSecondary },
  btnRow: { flexDirection: 'row', gap: 12, marginTop: 20 },
  cancelBtn: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    paddingVertical: 14, borderRadius: 12, backgroundColor: theme.colors.cardLight,
  },
  cancelText: { fontSize: 15, fontWeight: '600', color: theme.colors.textSecondary },
  postBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    paddingVertical: 14, borderRadius: 12, backgroundColor: theme.colors.primary,
  },
  postText: { fontSize: 15, fontWeight: '700', color: '#fff' },
});
