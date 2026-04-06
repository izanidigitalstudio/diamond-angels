import React, { useState, useMemo, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView, FlatList,
  Image, ActivityIndicator, Modal, Pressable, TextInput, Linking, Alert,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation } from 'convex/react';
import { useAuthActions } from '@convex-dev/auth/react';
import { api } from '../../convex/_generated/api';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../lib/theme';
import { DEMO_TALENT } from '../../lib/demoTalent';
import { DEMO_MEMBERS } from '../../lib/demoMembers';
import ProfileReviewModal from '../../components/ProfileReviewModal';
import { AdminViewSwitcherPill } from '../AuthenticatedApp';
import QRCodeStyled from 'react-native-qrcode-styled';
import ViewShot, { captureRef } from 'react-native-view-shot';
import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';
import * as MailComposer from 'expo-mail-composer';
import * as FileSystem from 'expo-file-system';
import * as Clipboard from 'expo-clipboard';

const TALENT_REGISTRATION_URL = 'https://usable-zebra-858.convex.site/onboarding';

type MemberCategory = 'talent' | 'bookings' | 'gigs' | 'corporate' | 'golf_days' | 'restaurants' | 'agencies' | 'notices';

const TABS: Array<{ key: MemberCategory; label: string; icon: string; color: string }> = [
  { key: 'talent', label: 'Talent', icon: 'people', color: theme.colors.primary },
  { key: 'bookings', label: 'Bookings', icon: 'calendar', color: '#3B82F6' },
  { key: 'gigs', label: 'Gigs', icon: 'briefcase', color: '#8B5CF6' },
  { key: 'corporate', label: 'Corporate', icon: 'business', color: theme.colors.secondary },
  { key: 'golf_days', label: 'Golf Days', icon: 'golf', color: theme.colors.warning },
  { key: 'restaurants', label: 'Restaurants', icon: 'restaurant', color: theme.colors.success },
  { key: 'agencies', label: 'Agencies', icon: 'briefcase', color: '#E879A0' },
  { key: 'notices', label: 'Notices', icon: 'megaphone', color: '#F59E0B' },
];

const NOTICE_TYPE_CONFIG: Record<string, { icon: string; color: string; label: string }> = {
  announcement: { icon: 'megaphone', color: theme.colors.primary, label: 'Announcement' },
  reminder: { icon: 'alarm', color: '#F59E0B', label: 'Reminder' },
  update: { icon: 'information-circle', color: '#3B82F6', label: 'Update' },
  event: { icon: 'calendar', color: '#8B5CF6', label: 'Event' },
  alert: { icon: 'warning', color: '#F43F5E', label: 'Alert' },
};

const BOOKING_STATUS_CONFIG: Record<string, { color: string; label: string; icon: string }> = {
  pending: { color: '#F59E0B', label: 'Pending', icon: 'time' },
  confirmed: { color: '#10B981', label: 'Confirmed', icon: 'checkmark-circle' },
  declined: { color: '#EF4444', label: 'Declined', icon: 'close-circle' },
  completed: { color: '#3B82F6', label: 'Completed', icon: 'trophy' },
  cancelled: { color: '#6B7280', label: 'Cancelled', icon: 'ban' },
};

const GIG_STATUS_CONFIG: Record<string, { color: string; label: string; icon: string }> = {
  open: { color: '#10B981', label: 'Open', icon: 'checkmark-circle' },
  closed: { color: '#6B7280', label: 'Closed', icon: 'lock-closed' },
  filled: { color: '#3B82F6', label: 'Filled', icon: 'people' },
};

const IMG_BASE = 'https://api.a0.dev/assets/image';
function generatePhoto(p: any): string {
  const race = (p.race || '').toLowerCase();
  const city = (p.city || '').toLowerCase();
  const body = (p.bodyType || '').toLowerCase();
  const cat = (p.categories?.[0] || 'model').toLowerCase();
  let seed = 0;
  const id = String(p._id || p.id || '');
  for (let i = 0; i < id.length; i++) seed = ((seed << 5) - seed + id.charCodeAt(i)) | 0;
  seed = Math.abs(seed) % 10000;
  return `${IMG_BASE}?text=${encodeURIComponent(`professional ${race} female ${cat} ${body} ${city} portrait`)}&aspect=3:4&seed=${seed}`;
}

function getInitials(name: string): string {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

function formatPhoneForWhatsApp(phone: string): string {
  let cleaned = phone.replace(/\D/g, '');
  if (cleaned.startsWith('0')) cleaned = '27' + cleaned.slice(1);
  return cleaned;
}

function openContact(action: 'call' | 'sms' | 'whatsapp' | 'email', phone?: string, email?: string) {
  switch (action) {
    case 'call':
      if (phone) Linking.openURL(`tel:${phone}`);
      else Alert.alert('No Phone', 'No phone number available');
      break;
    case 'sms':
      if (phone) Linking.openURL(`sms:${phone}`);
      else Alert.alert('No Phone', 'No phone number available');
      break;
    case 'whatsapp':
      if (phone) Linking.openURL(`https://wa.me/${formatPhoneForWhatsApp(phone)}`);
      else Alert.alert('No Phone', 'No phone number available for WhatsApp');
      break;
    case 'email':
      if (email) Linking.openURL(`mailto:${email}`);
      else Alert.alert('No Email', 'No email address available');
      break;
  }
}

/* ---------- Contact Row ---------- */
function ContactRow({ phone, email }: { phone?: string; email?: string }) {
  const actions = [
    { key: 'call' as const, icon: 'call', label: 'Call', color: '#10B981', has: !!phone },
    { key: 'sms' as const, icon: 'chatbubble', label: 'SMS', color: '#3B82F6', has: !!phone },
    { key: 'whatsapp' as const, icon: 'logo-whatsapp', label: 'WhatsApp', color: '#25D366', has: !!phone },
    { key: 'email' as const, icon: 'mail', label: 'Email', color: '#8B5CF6', has: !!email },
  ];
  return (
    <View style={st.contactRow}>
      {actions.map(a => (
        <TouchableOpacity
          key={a.key}
          style={[st.contactBtn, !a.has && { opacity: 0.3 }]}
          onPress={() => openContact(a.key, phone, email)}
          disabled={!a.has}
          activeOpacity={0.7}
        >
          <View style={[st.contactIcon, { backgroundColor: a.color + '20' }]}>
            <Ionicons name={a.icon as any} size={15} color={a.color} />
          </View>
          <Text style={[st.contactLabel, { color: a.color }]}>{a.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

/* ---------- Member Card (non-talent) ---------- */
function MemberCard({ member, categoryColor, onPress }: { member: any; categoryColor: string; onPress?: () => void }) {
  return (
    <View style={st.card}>
      <TouchableOpacity style={st.cardHeader} onPress={onPress} activeOpacity={0.7}>
        <View style={[st.avatar, { backgroundColor: categoryColor + '20' }]}>
          <Text style={[st.avatarText, { color: categoryColor }]}>{getInitials(member.name)}</Text>
        </View>
        <View style={st.cardInfo}>
          <Text style={st.cardName} numberOfLines={1}>{member.name}</Text>
          {member.company ? (
            <Text style={st.cardCompany} numberOfLines={1}>{member.company}</Text>
          ) : null}
          <View style={st.cardMeta}>
            {member.role ? <Text style={st.cardRole}>{member.role}</Text> : null}
            {member.city ? (
              <View style={st.cityRow}>
                <Ionicons name="location" size={11} color={theme.colors.textMuted} />
                <Text style={st.cardCity}>{member.city}</Text>
              </View>
            ) : null}
          </View>
        </View>
        <Ionicons name="chevron-forward" size={16} color={theme.colors.textMuted} />
      </TouchableOpacity>
      <ContactRow phone={member.phone} email={member.email} />
    </View>
  );
}

/* ---------- Talent Card ---------- */
function TalentCard({ talent, onPress }: { talent: any; onPress: () => void }) {
  const photo = talent.photoUrls?.[0] || talent.photos?.[0];
  return (
    <View style={st.card}>
      <TouchableOpacity style={st.cardHeader} onPress={onPress} activeOpacity={0.7}>
        {photo ? (
          <Image source={{ uri: photo }} style={st.talentPhoto} />
        ) : (
          <View style={[st.avatar, { backgroundColor: theme.colors.primary + '20' }]}>
            <Ionicons name="person" size={22} color={theme.colors.primary} />
          </View>
        )}
        <View style={st.cardInfo}>
          <Text style={st.cardName} numberOfLines={1}>
            {talent.firstName} {talent.lastName}
          </Text>
          {talent.city ? (
            <View style={st.cityRow}>
              <Ionicons name="location" size={11} color={theme.colors.textMuted} />
              <Text style={st.cardCity}>{talent.city}{talent.area ? `, ${talent.area}` : ''}</Text>
            </View>
          ) : null}
          {talent.categories?.length > 0 && (
            <View style={st.tagRow}>
              {talent.categories.slice(0, 3).map((c: string) => (
                <View key={c} style={st.tag}><Text style={st.tagText}>{c}</Text></View>
              ))}
            </View>
          )}
        </View>
        <Ionicons name="chevron-forward" size={16} color={theme.colors.textMuted} />
      </TouchableOpacity>
      <ContactRow
        phone={talent.phone}
        email={talent.email || `${(talent.firstName || '').toLowerCase()}.${(talent.lastName || '').toLowerCase()}@email.co.za`}
      />
    </View>
  );
}

/* ---------- Add Member Modal ---------- */
function AddMemberModal({ visible, category, onClose, onSave }: {
  visible: boolean; category: string; onClose: () => void;
  onSave: (data: any) => Promise<void>;
}) {
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [city, setCity] = useState('');
  const [saving, setSaving] = useState(false);

  const tabLabel = TABS.find(t => t.key === category)?.label || category;

  const handleSave = async () => {
    if (!name.trim()) { Alert.alert('Required', 'Name is required'); return; }
    setSaving(true);
    try {
      await onSave({
        name: name.trim(),
        company: company.trim() || undefined,
        role: role.trim() || undefined,
        phone: phone.trim() || undefined,
        email: email.trim() || undefined,
        city: city.trim() || undefined,
      });
      setName(''); setCompany(''); setRole(''); setPhone(''); setEmail(''); setCity('');
    } catch (e) { Alert.alert('Error', 'Failed to save member'); }
    setSaving(false);
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <Pressable style={st.overlay} onPress={onClose}>
          <Pressable style={st.sheet} onPress={e => e.stopPropagation()}>
            <Text style={st.sheetTitle}>Add {tabLabel} Member</Text>
            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 400 }}>
              {[
                { placeholder: 'Full Name *', value: name, set: setName, kb: 'default' as const },
                { placeholder: 'Company', value: company, set: setCompany, kb: 'default' as const },
                { placeholder: 'Role / Title', value: role, set: setRole, kb: 'default' as const },
                { placeholder: 'Phone', value: phone, set: setPhone, kb: 'phone-pad' as const },
                { placeholder: 'Email', value: email, set: setEmail, kb: 'email-address' as const },
                { placeholder: 'City', value: city, set: setCity, kb: 'default' as const },
              ].map((f, i) => (
                <TextInput
                  key={i}
                  style={st.input}
                  placeholder={f.placeholder}
                  placeholderTextColor={theme.colors.textMuted}
                  value={f.value}
                  onChangeText={f.set}
                  keyboardType={f.kb}
                  autoCapitalize={f.kb === 'email-address' ? 'none' : 'words'}
                />
              ))}
            </ScrollView>
            <View style={st.btnRow}>
              <TouchableOpacity style={st.cancelBtn} onPress={onClose}>
                <Text style={st.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={st.saveBtn} onPress={handleSave} disabled={saving}>
                {saving ? <ActivityIndicator size="small" color="#fff" /> : (
                  <>
                    <Ionicons name="checkmark" size={18} color="#fff" />
                    <Text style={st.saveText}>Save</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
}

/* ---------- Edit Member Modal ---------- */
function EditMemberModal({ visible, member, onClose, onSave, onDelete }: {
  visible: boolean; member: any; onClose: () => void;
  onSave: (data: any) => Promise<void>;
  onDelete?: () => void;
}) {
  const [name, setName] = useState(member?.name || '');
  const [company, setCompany] = useState(member?.company || '');
  const [role, setRole] = useState(member?.role || '');
  const [phone, setPhone] = useState(member?.phone || '');
  const [email, setEmail] = useState(member?.email || '');
  const [city, setCity] = useState(member?.city || '');
  const [notes, setNotes] = useState(member?.notes || '');
  const [saving, setSaving] = useState(false);

  React.useEffect(() => {
    if (member) {
      setName(member.name || '');
      setCompany(member.company || '');
      setRole(member.role || '');
      setPhone(member.phone || '');
      setEmail(member.email || '');
      setCity(member.city || '');
      setNotes(member.notes || '');
    }
  }, [member]);

  const handleSave = async () => {
    if (!name.trim()) { Alert.alert('Required', 'Name is required'); return; }
    setSaving(true);
    try {
      await onSave({
        name: name.trim(),
        company: company.trim() || undefined,
        role: role.trim() || undefined,
        phone: phone.trim() || undefined,
        email: email.trim() || undefined,
        city: city.trim() || undefined,
        notes: notes.trim() || undefined,
      });
    } catch (e) { Alert.alert('Error', 'Failed to update member'); }
    setSaving(false);
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <Pressable style={st.overlay} onPress={onClose}>
          <Pressable style={st.sheet} onPress={e => e.stopPropagation()}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <Text style={st.sheetTitle}>Edit Member</Text>
              {onDelete && (
                <TouchableOpacity onPress={onDelete} style={{ padding: 6 }}>
                  <Ionicons name="trash-outline" size={20} color={theme.colors.error} />
                </TouchableOpacity>
              )}
            </View>
            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 400 }}>
              {[
                { placeholder: 'Full Name *', value: name, set: setName, kb: 'default' as const },
                { placeholder: 'Company', value: company, set: setCompany, kb: 'default' as const },
                { placeholder: 'Role / Title', value: role, set: setRole, kb: 'default' as const },
                { placeholder: 'Phone', value: phone, set: setPhone, kb: 'phone-pad' as const },
                { placeholder: 'Email', value: email, set: setEmail, kb: 'email-address' as const },
                { placeholder: 'City', value: city, set: setCity, kb: 'default' as const },
                { placeholder: 'Notes', value: notes, set: setNotes, kb: 'default' as const },
              ].map((f, i) => (
                <TextInput
                  key={i}
                  style={[st.input, f.placeholder === 'Notes' && { minHeight: 60, textAlignVertical: 'top' }]}
                  placeholder={f.placeholder}
                  placeholderTextColor={theme.colors.textMuted}
                  value={f.value}
                  onChangeText={f.set}
                  keyboardType={f.kb}
                  autoCapitalize={f.kb === 'email-address' ? 'none' : 'words'}
                  multiline={f.placeholder === 'Notes'}
                />
              ))}
            </ScrollView>
            <View style={st.btnRow}>
              <TouchableOpacity style={st.cancelBtn} onPress={onClose}>
                <Text style={st.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={st.saveBtn} onPress={handleSave} disabled={saving}>
                {saving ? <ActivityIndicator size="small" color="#fff" /> : (
                  <>
                    <Ionicons name="checkmark" size={18} color="#fff" />
                    <Text style={st.saveText}>Save</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
}

/* ---------- Import Modal ---------- */
function ImportModal({ visible, category, onClose, onImport }: {
  visible: boolean; category: string; onClose: () => void;
  onImport: (members: any[]) => Promise<void>;
}) {
  const [text, setText] = useState('');
  const [importing, setImporting] = useState(false);

  const parseData = (raw: string) => {
    return raw.split('\n').filter(l => l.trim()).map(line => {
      const parts = line.split(/[\t,]/).map(p => p.trim());
      return {
        name: parts[0] || '',
        company: parts[1] || undefined,
        role: parts[2] || undefined,
        phone: parts[3] || undefined,
        email: parts[4] || undefined,
        city: parts[5] || undefined,
      };
    }).filter(m => m.name);
  };

  const count = text.trim() ? parseData(text).length : 0;

  const handleImport = async () => {
    const parsed = parseData(text);
    if (parsed.length === 0) { Alert.alert('No Data', 'Could not parse any valid entries'); return; }
    setImporting(true);
    try {
      await onImport(parsed);
      setText('');
    } catch (e) { Alert.alert('Error', 'Failed to import members'); }
    setImporting(false);
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <Pressable style={st.overlay} onPress={onClose}>
          <Pressable style={st.importSheet} onPress={e => e.stopPropagation()}>
            <Text style={st.sheetTitle}>Import Members</Text>
            <Text style={st.importHelp}>
              Paste data from Excel or CSV. Each row:
            </Text>
            <View style={st.formatBox}>
              <Text style={st.formatText}>Name, Company, Role, Phone, Email, City</Text>
            </View>
            <TextInput
              style={st.importInput}
              multiline
              placeholder={'Sipho Ndlovu, ABC Corp, Director, +27821234567, sipho@abc.co.za, Johannesburg\nThandi Mkhize, XYZ Ltd, Manager, +27839876543, thandi@xyz.co.za, Cape Town'}
              placeholderTextColor={theme.colors.textMuted + '60'}
              value={text}
              onChangeText={setText}
              textAlignVertical="top"
            />
            {count > 0 && (
              <View style={st.previewBadge}>
                <Ionicons name="checkmark-circle" size={14} color={theme.colors.success} />
                <Text style={st.previewText}>{count} {count === 1 ? 'entry' : 'entries'} detected</Text>
              </View>
            )}
            <View style={st.btnRow}>
              <TouchableOpacity style={st.cancelBtn} onPress={onClose}>
                <Text style={st.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={st.saveBtn} onPress={handleImport} disabled={importing || count === 0}>
                {importing ? <ActivityIndicator size="small" color="#fff" /> : (
                  <>
                    <Ionicons name="cloud-upload" size={18} color="#fff" />
                    <Text style={st.saveText}>Import {count > 0 ? `(${count})` : ''}</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
}

/* ---------- QR Code Modal ---------- */
function QRCodeModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const viewShotRef = useRef<any>(null);
  const [saving, setSaving] = useState(false);

  const captureQR = async (): Promise<string | null> => {
    try {
      const uri = await captureRef(viewShotRef, {
        format: 'png',
        quality: 1,
        result: 'tmpfile',
      });
      return uri;
    } catch (e) {
      Alert.alert('Error', 'Failed to capture QR code');
      return null;
    }
  };

  const handleSaveToGallery = async () => {
    setSaving(true);
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please allow access to your photo library to save the QR code.');
        setSaving(false);
        return;
      }
      const uri = await captureQR();
      if (uri) {
        await MediaLibrary.saveToLibraryAsync(uri);
        Alert.alert('Saved', 'QR code saved to your photo gallery.');
      }
    } catch (e) {
      Alert.alert('Error', 'Failed to save QR code to gallery.');
    }
    setSaving(false);
  };

  const handleShare = async () => {
    setSaving(true);
    try {
      const uri = await captureQR();
      if (uri) {
        await Sharing.shareAsync(uri, {
          mimeType: 'image/png',
          dialogTitle: 'Share Talent Registration QR Code',
        });
      }
    } catch (e) {
      Alert.alert('Error', 'Failed to share QR code.');
    }
    setSaving(false);
  };

  const handleEmail = async () => {
    setSaving(true);
    try {
      const isAvailable = await MailComposer.isAvailableAsync();
      if (!isAvailable) {
        Alert.alert('Not Available', 'Email is not configured on this device. Use the Share option instead.');
        setSaving(false);
        return;
      }
      const uri = await captureQR();
      if (uri) {
        // Copy to a stable path for attachment
        const destPath = FileSystem.cacheDirectory + 'diamond-angels-qr.png';
        await FileSystem.copyAsync({ from: uri, to: destPath });
        await MailComposer.composeAsync({
          subject: 'Diamond Angels - Talent Registration QR Code',
          body: 'Scan this QR code to register as talent with Diamond Angels.\n\nOr use this link: ' + TALENT_REGISTRATION_URL,
          attachments: [destPath],
        });
      }
    } catch (e) {
      Alert.alert('Error', 'Failed to compose email.');
    }
    setSaving(false);
  };

  const handleCopyLink = async () => {
    try {
      await Clipboard.setStringAsync(TALENT_REGISTRATION_URL);
      Alert.alert('Copied', 'Registration link copied to clipboard.');
    } catch {
      Alert.alert('Link', TALENT_REGISTRATION_URL);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <Pressable style={st.overlay} onPress={onClose}>
        <Pressable style={st.qrSheet} onPress={e => e.stopPropagation()}>
          <View style={st.qrSheetHeader}>
            <Text style={st.sheetTitle}>Talent Registration QR Code</Text>
            <TouchableOpacity onPress={onClose} style={st.qrCloseBtn}>
              <Ionicons name="close" size={22} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <Text style={st.qrDescription}>
            Share this QR code with potential talent to let them register directly.
          </Text>

          <View style={st.qrContainer}>
            <ViewShot ref={viewShotRef} options={{ format: 'png', quality: 1 }}>
              <View style={st.qrInner}>
                <View style={st.qrBrandTop}>
                  <Text style={st.qrBrandText}>DIAMOND ANGELS</Text>
                </View>
                <QRCodeStyled
                  data={TALENT_REGISTRATION_URL}
                  padding={16}
                  pieceSize={6}
                  pieceBorderRadius={2}
                  color={theme.colors.primaryDark}
                  outerEyesOptions={{
                    borderRadius: 6,
                    color: theme.colors.primary,
                  }}
                  innerEyesOptions={{
                    borderRadius: 3,
                    color: theme.colors.primaryDark,
                  }}
                  style={{ backgroundColor: '#FFFFFF' }}
                />
                <View style={st.qrBrandBottom}>
                  <Text style={st.qrScanText}>Scan to Register as Talent</Text>
                </View>
              </View>
            </ViewShot>
          </View>

          <View style={st.qrLinkRow}>
            <Text style={st.qrLinkText} numberOfLines={1}>{TALENT_REGISTRATION_URL}</Text>
            <TouchableOpacity onPress={handleCopyLink} style={st.qrCopyBtn}>
              <Ionicons name="copy-outline" size={16} color={theme.colors.primary} />
            </TouchableOpacity>
          </View>

          <View style={st.qrActions}>
            <TouchableOpacity style={st.qrActionBtn} onPress={handleSaveToGallery} disabled={saving} activeOpacity={0.7}>
              <View style={[st.qrActionIcon, { backgroundColor: '#10B98120' }]}>
                <Ionicons name="download-outline" size={22} color="#10B981" />
              </View>
              <Text style={st.qrActionLabel}>Save to Gallery</Text>
            </TouchableOpacity>

            <TouchableOpacity style={st.qrActionBtn} onPress={handleShare} disabled={saving} activeOpacity={0.7}>
              <View style={[st.qrActionIcon, { backgroundColor: '#3B82F620' }]}>
                <Ionicons name="share-outline" size={22} color="#3B82F6" />
              </View>
              <Text style={st.qrActionLabel}>Share</Text>
            </TouchableOpacity>

            <TouchableOpacity style={st.qrActionBtn} onPress={handleEmail} disabled={saving} activeOpacity={0.7}>
              <View style={[st.qrActionIcon, { backgroundColor: '#8B5CF620' }]}>
                <Ionicons name="mail-outline" size={22} color="#8B5CF6" />
              </View>
              <Text style={st.qrActionLabel}>Email</Text>
            </TouchableOpacity>
          </View>

          {saving && (
            <View style={st.qrSavingOverlay}>
              <ActivityIndicator size="small" color={theme.colors.primary} />
            </View>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

/* ---------- Admin Notice Card ---------- */
function AdminNoticeCard({ notice, onTogglePin, onDelete }: {
  notice: any; onTogglePin: () => void; onDelete: () => void;
}) {
  const config = NOTICE_TYPE_CONFIG[notice.type] || NOTICE_TYPE_CONFIG.announcement;
  return (
    <View style={[st.card, notice.pinned && { borderColor: config.color + '40', backgroundColor: config.color + '08' }]}>
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 8 }}>
        <View style={[st.noticeTypeIcon, { backgroundColor: config.color + '20' }]}>
          <Ionicons name={config.icon as any} size={18} color={config.color} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={st.cardName} numberOfLines={2}>{notice.title}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 }}>
            <View style={[st.tag, { backgroundColor: config.color + '15' }]}>
              <Text style={[st.tagText, { color: config.color }]}>{config.label}</Text>
            </View>
            {notice.pinned && (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: theme.colors.primary + '15', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 }}>
                <Ionicons name="pin" size={10} color={theme.colors.primary} />
                <Text style={{ fontSize: 10, fontWeight: '700', color: theme.colors.primary }}>Pinned</Text>
              </View>
            )}
          </View>
        </View>
      </View>
      <Text style={{ fontSize: 13, color: theme.colors.textSecondary, lineHeight: 20, marginBottom: 10, paddingLeft: 48 }} numberOfLines={3}>
        {notice.body}
      </Text>
      <View style={[st.contactRow, { gap: 10 }]}>
        <TouchableOpacity
          style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 8, borderRadius: 10, backgroundColor: theme.colors.primary + '10' }}
          onPress={onTogglePin}
          activeOpacity={0.7}
        >
          <Ionicons name={notice.pinned ? 'pin' : 'pin-outline'} size={15} color={theme.colors.primary} />
          <Text style={{ fontSize: 12, fontWeight: '600', color: theme.colors.primary }}>{notice.pinned ? 'Unpin' : 'Pin'}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 8, borderRadius: 10, backgroundColor: theme.colors.error + '10' }}
          onPress={onDelete}
          activeOpacity={0.7}
        >
          <Ionicons name="trash-outline" size={15} color={theme.colors.error} />
          <Text style={{ fontSize: 12, fontWeight: '600', color: theme.colors.error }}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

/* ---------- Create Notice Modal ---------- */
function CreateNoticeModal({ visible, onClose, onSave }: {
  visible: boolean; onClose: () => void; onSave: (data: any) => Promise<void>;
}) {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [type, setType] = useState('announcement');
  const [pinned, setPinned] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!title.trim()) { Alert.alert('Required', 'Title is required'); return; }
    if (!body.trim()) { Alert.alert('Required', 'Body is required'); return; }
    setSaving(true);
    try {
      await onSave({ title: title.trim(), body: body.trim(), type, pinned });
      setTitle(''); setBody(''); setType('announcement'); setPinned(false);
    } catch (e) { Alert.alert('Error', 'Failed to create notice'); }
    setSaving(false);
  };

  const types = ['announcement', 'reminder', 'update', 'event', 'alert'];

  return (
    <Modal visible={visible} transparent animationType="slide">
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <Pressable style={st.overlay} onPress={onClose}>
          <Pressable style={st.sheet} onPress={e => e.stopPropagation()}>
            <Text style={st.sheetTitle}>Post Notice</Text>
            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 450 }}>
              <TextInput
                style={st.input}
                placeholder="Notice Title *"
                placeholderTextColor={theme.colors.textMuted}
                value={title}
                onChangeText={setTitle}
              />
              <TextInput
                style={[st.input, { minHeight: 100, textAlignVertical: 'top' }]}
                placeholder="Notice body *"
                placeholderTextColor={theme.colors.textMuted}
                value={body}
                onChangeText={setBody}
                multiline
              />
              <Text style={{ fontSize: 13, fontWeight: '600', color: theme.colors.textSecondary, marginBottom: 8 }}>Type</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
                {types.map(t => {
                  const config = NOTICE_TYPE_CONFIG[t];
                  const active = type === t;
                  return (
                    <TouchableOpacity
                      key={t}
                      onPress={() => setType(t)}
                      style={{
                        flexDirection: 'row', alignItems: 'center', gap: 6,
                        paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10,
                        backgroundColor: active ? config.color + '20' : theme.colors.inputBg,
                        borderWidth: 1.5, borderColor: active ? config.color : theme.colors.border,
                      }}
                    >
                      <Ionicons name={config.icon as any} size={14} color={active ? config.color : theme.colors.textMuted} />
                      <Text style={{ fontSize: 12, fontWeight: '600', color: active ? config.color : theme.colors.textMuted }}>{config.label}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
              <TouchableOpacity
                onPress={() => setPinned(!pinned)}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}
              >
                <Ionicons name={pinned ? 'checkbox' : 'square-outline'} size={22} color={theme.colors.primary} />
                <Text style={{ fontSize: 14, color: theme.colors.text }}>Pin to top of notice board</Text>
              </TouchableOpacity>
            </ScrollView>
            <View style={st.btnRow}>
              <TouchableOpacity style={st.cancelBtn} onPress={onClose}>
                <Text style={st.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={st.saveBtn} onPress={handleSave} disabled={saving}>
                {saving ? <ActivityIndicator size="small" color="#fff" /> : (
                  <>
                    <Ionicons name="send" size={18} color="#fff" />
                    <Text style={st.saveText}>Post</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
}

/* ---------- Booking Card ---------- */
function BookingCard({ booking, onUpdateStatus }: { booking: any; onUpdateStatus: (status: string) => void }) {
  const config = BOOKING_STATUS_CONFIG[booking.status] || BOOKING_STATUS_CONFIG.pending;
  return (
    <View style={[st.card, { borderLeftWidth: 3, borderLeftColor: config.color }]}>
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 }}>
        <View style={{ flex: 1 }}>
          <Text style={st.cardName}>{booking.eventType}</Text>
          <View style={st.cityRow}>
            <Ionicons name="location" size={12} color={theme.colors.textMuted} />
            <Text style={st.cardCity}>{booking.venue}, {booking.city}</Text>
          </View>
        </View>
        <View style={[st.statusBadge, { backgroundColor: config.color + '20' }]}>
          <Ionicons name={config.icon as any} size={11} color={config.color} />
          <Text style={[st.statusText, { color: config.color }]}>{config.label}</Text>
        </View>
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 8 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <Ionicons name="calendar" size={13} color={theme.colors.textMuted} />
          <Text style={{ fontSize: 12, color: theme.colors.textSecondary }}>{booking.eventDate}</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <Ionicons name="people" size={13} color={theme.colors.textMuted} />
          <Text style={{ fontSize: 12, color: theme.colors.textSecondary }}>{booking.talentCount} talent</Text>
        </View>
        {booking.clientName && booking.clientName !== 'Unknown' && (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Ionicons name="person" size={13} color={theme.colors.textMuted} />
            <Text style={{ fontSize: 12, color: theme.colors.textSecondary }}>{booking.clientName}</Text>
          </View>
        )}
        {booking.clientCompany && booking.clientCompany !== 'Unknown' && (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Ionicons name="business" size={13} color={theme.colors.textMuted} />
            <Text style={{ fontSize: 12, color: theme.colors.textSecondary }}>{booking.clientCompany}</Text>
          </View>
        )}
      </View>
      <Text style={{ fontSize: 13, color: theme.colors.textSecondary, lineHeight: 18, marginBottom: 10 }} numberOfLines={2}>
        {booking.requirements}
      </Text>
      {booking.adminNotes && (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10, backgroundColor: theme.colors.inputBg, padding: 8, borderRadius: 8 }}>
          <Ionicons name="chatbubble-ellipses" size={12} color={theme.colors.textMuted} />
          <Text style={{ fontSize: 11, color: theme.colors.textMuted, flex: 1 }} numberOfLines={1}>{booking.adminNotes}</Text>
        </View>
      )}
      {booking.status === 'pending' && (
        <View style={[st.contactRow, { gap: 10 }]}>
          <TouchableOpacity
            style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 8, borderRadius: 10, backgroundColor: '#10B981' + '10' }}
            onPress={() => onUpdateStatus('confirmed')}
            activeOpacity={0.7}
          >
            <Ionicons name="checkmark-circle" size={15} color="#10B981" />
            <Text style={{ fontSize: 12, fontWeight: '600', color: '#10B981' }}>Confirm</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 8, borderRadius: 10, backgroundColor: '#EF4444' + '10' }}
            onPress={() => onUpdateStatus('declined')}
            activeOpacity={0.7}
          >
            <Ionicons name="close-circle" size={15} color="#EF4444" />
            <Text style={{ fontSize: 12, fontWeight: '600', color: '#EF4444' }}>Decline</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

/* ---------- Gig Card ---------- */
function GigCard({ gig, onUpdateStatus, onEdit }: { gig: any; onUpdateStatus: (status: string) => void; onEdit: () => void }) {
  const config = GIG_STATUS_CONFIG[gig.status] || GIG_STATUS_CONFIG.open;
  return (
    <View style={[st.card, { borderLeftWidth: 3, borderLeftColor: config.color }]}>
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 6 }}>
        <View style={{ flex: 1, marginRight: 8 }}>
          <Text style={st.cardName} numberOfLines={2}>{gig.title}</Text>
          <Text style={{ fontSize: 12, color: theme.colors.textMuted, marginTop: 2 }}>{gig.eventType}</Text>
        </View>
        <View style={[st.statusBadge, { backgroundColor: config.color + '20' }]}>
          <Ionicons name={config.icon as any} size={11} color={config.color} />
          <Text style={[st.statusText, { color: config.color }]}>{config.label}</Text>
        </View>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 6 }}>
        <Ionicons name="location" size={13} color={theme.colors.textMuted} />
        <Text style={{ fontSize: 12, color: theme.colors.textSecondary }}>{gig.venue}, {gig.city}</Text>
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 8 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <Ionicons name="calendar" size={13} color={theme.colors.textMuted} />
          <Text style={{ fontSize: 12, color: theme.colors.textSecondary }}>{gig.eventDate}</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <Ionicons name="people" size={13} color={theme.colors.textMuted} />
          <Text style={{ fontSize: 12, color: theme.colors.textSecondary }}>{gig.talentNeeded} needed</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <Ionicons name="hand-left" size={13} color={theme.colors.primary} />
          <Text style={{ fontSize: 12, color: theme.colors.primary, fontWeight: '600' }}>{gig.interestCount} interested</Text>
        </View>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 }}>
        <Ionicons name="cash" size={14} color="#10B981" />
        <Text style={{ fontSize: 13, fontWeight: '700', color: '#10B981' }}>{gig.compensation}</Text>
      </View>
      {gig.categories?.length > 0 && (
        <View style={[st.tagRow, { marginBottom: 10 }]}>
          {gig.categories.map((c: string) => (
            <View key={c} style={st.tag}><Text style={st.tagText}>{c}</Text></View>
          ))}
        </View>
      )}
      <Text style={{ fontSize: 13, color: theme.colors.textSecondary, lineHeight: 18, marginBottom: 10 }} numberOfLines={2}>
        {gig.description}
      </Text>
      <View style={[st.contactRow, { gap: 10 }]}>
        <TouchableOpacity
          style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 8, borderRadius: 10, backgroundColor: theme.colors.primary + '10' }}
          onPress={onEdit}
          activeOpacity={0.7}
        >
          <Ionicons name="create-outline" size={15} color={theme.colors.primary} />
          <Text style={{ fontSize: 12, fontWeight: '600', color: theme.colors.primary }}>Edit</Text>
        </TouchableOpacity>
        {gig.status === 'open' ? (
          <TouchableOpacity
            style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 8, borderRadius: 10, backgroundColor: '#EF4444' + '10' }}
            onPress={() => onUpdateStatus('closed')}
            activeOpacity={0.7}
          >
            <Ionicons name="lock-closed" size={15} color="#EF4444" />
            <Text style={{ fontSize: 12, fontWeight: '600', color: '#EF4444' }}>Close Gig</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 8, borderRadius: 10, backgroundColor: '#10B981' + '10' }}
            onPress={() => onUpdateStatus('open')}
            activeOpacity={0.7}
          >
            <Ionicons name="lock-open" size={15} color="#10B981" />
            <Text style={{ fontSize: 12, fontWeight: '600', color: '#10B981' }}>Reopen Gig</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

/* ---------- Edit Gig Modal ---------- */
function EditGigModal({ visible, gig, onClose, onSave }: {
  visible: boolean; gig: any; onClose: () => void;
  onSave: (data: any) => Promise<void>;
}) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [eventType, setEventType] = useState('');
  const [city, setCity] = useState('');
  const [venue, setVenue] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [talentNeeded, setTalentNeeded] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  const [requirements, setRequirements] = useState('');
  const [compensation, setCompensation] = useState('');
  const [saving, setSaving] = useState(false);

  const EVENT_TYPES = [
    'Brand Launch', 'Activation', 'Brand Activation', 'In-store Promotion', 'Golf Day',
    'Photoshoot', 'Music Video', 'Movie', 'Advertising Campaign',
    'Fashion Show', 'Conference', 'Award Ceremony', 'Music Festival',
    'Festival', 'Sports Event', 'Corporate Event', 'Horse Racing', 'Exhibition', 'Other',
  ];
  const SA_CITIES = [
    'Johannesburg', 'Cape Town', 'Durban', 'Pretoria', 'Port Elizabeth',
    'Bloemfontein', 'East London', 'Polokwane', 'Nelspruit', 'Kimberley',
    'Pietermaritzburg', 'Rustenburg', 'Stellenbosch', 'Sandton', 'Soweto',
  ];
  const CATS = ['Model', 'Hostess', 'Bottle Girl', 'Promoter', 'Brand Ambassador'];

  React.useEffect(() => {
    if (gig) {
      setTitle(gig.title || '');
      setDescription(gig.description || '');
      setEventType(gig.eventType || '');
      setCity(gig.city || '');
      setVenue(gig.venue || '');
      setEventDate(gig.eventDate || '');
      setTalentNeeded(String(gig.talentNeeded || ''));
      setCategories(gig.categories || []);
      setRequirements(gig.requirements || '');
      setCompensation(gig.compensation || '');
    }
  }, [gig]);

  const toggleCategory = (cat: string) => {
    setCategories(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const handleSave = async () => {
    if (!title || !eventType || !city || !eventDate || !talentNeeded) {
      Alert.alert('Missing Fields', 'Please fill in all required fields');
      return;
    }
    setSaving(true);
    try {
      await onSave({
        gigId: gig._id,
        title,
        description,
        eventType,
        city,
        venue,
        eventDate,
        talentNeeded: parseInt(talentNeeded),
        categories,
        requirements,
        compensation,
      });
    } catch (e: any) {
      Alert.alert('Error', e.message);
    }
    setSaving(false);
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <Pressable style={st.overlay} onPress={onClose}>
          <Pressable style={[st.sheet, { maxHeight: '90%' }]} onPress={e => e.stopPropagation()}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <Text style={st.sheetTitle}>Edit Gig</Text>
              <TouchableOpacity onPress={onClose} style={{ padding: 4 }}>
                <Ionicons name="close" size={22} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              <TextInput style={st.input} placeholder="Gig Title *" placeholderTextColor={theme.colors.textMuted}
                value={title} onChangeText={setTitle} />
              <TextInput style={[st.input, { minHeight: 80, textAlignVertical: 'top' }]} placeholder="Description" placeholderTextColor={theme.colors.textMuted}
                value={description} onChangeText={setDescription} multiline />

              <Text style={{ fontSize: 13, fontWeight: '600', color: theme.colors.textSecondary, marginBottom: 8 }}>Event Type *</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  {EVENT_TYPES.map(e => (
                    <TouchableOpacity key={e}
                      style={{ paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: eventType === e ? 'rgba(201,168,76,0.2)' : theme.colors.inputBg, borderWidth: 1, borderColor: eventType === e ? theme.colors.primary : theme.colors.border }}
                      onPress={() => setEventType(e)}>
                      <Text style={{ fontSize: 13, color: eventType === e ? theme.colors.primary : theme.colors.textSecondary, fontWeight: eventType === e ? '600' : '400' }}>{e}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>

              <Text style={{ fontSize: 13, fontWeight: '600', color: theme.colors.textSecondary, marginBottom: 8 }}>City *</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  {SA_CITIES.map(c => (
                    <TouchableOpacity key={c}
                      style={{ paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: city === c ? 'rgba(201,168,76,0.2)' : theme.colors.inputBg, borderWidth: 1, borderColor: city === c ? theme.colors.primary : theme.colors.border }}
                      onPress={() => setCity(c)}>
                      <Text style={{ fontSize: 13, color: city === c ? theme.colors.primary : theme.colors.textSecondary, fontWeight: city === c ? '600' : '400' }}>{c}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>

              <TextInput style={st.input} placeholder="Venue" placeholderTextColor={theme.colors.textMuted}
                value={venue} onChangeText={setVenue} />
              <TextInput style={st.input} placeholder="Event Date *" placeholderTextColor={theme.colors.textMuted}
                value={eventDate} onChangeText={setEventDate} />
              <TextInput style={st.input} placeholder="Talent Needed *" placeholderTextColor={theme.colors.textMuted}
                value={talentNeeded} onChangeText={setTalentNeeded} keyboardType="numeric" />

              <Text style={{ fontSize: 13, fontWeight: '600', color: theme.colors.textSecondary, marginBottom: 8 }}>Categories</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
                {CATS.map(c => (
                  <TouchableOpacity key={c}
                    style={{ paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: categories.includes(c) ? 'rgba(201,168,76,0.2)' : theme.colors.inputBg, borderWidth: 1, borderColor: categories.includes(c) ? theme.colors.primary : theme.colors.border }}
                    onPress={() => toggleCategory(c)}>
                    <Text style={{ fontSize: 13, color: categories.includes(c) ? theme.colors.primary : theme.colors.textSecondary, fontWeight: categories.includes(c) ? '600' : '400' }}>{c}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TextInput style={[st.input, { minHeight: 60, textAlignVertical: 'top' }]} placeholder="Requirements" placeholderTextColor={theme.colors.textMuted}
                value={requirements} onChangeText={setRequirements} multiline />
              <TextInput style={st.input} placeholder="Compensation" placeholderTextColor={theme.colors.textMuted}
                value={compensation} onChangeText={setCompensation} />
              <View style={{ height: 20 }} />
            </ScrollView>
            <View style={st.btnRow}>
              <TouchableOpacity style={st.cancelBtn} onPress={onClose}>
                <Text style={st.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={st.saveBtn} onPress={handleSave} disabled={saving}>
                {saving ? <ActivityIndicator size="small" color="#fff" /> : (
                  <>
                    <Ionicons name="checkmark" size={18} color="#fff" />
                    <Text style={st.saveText}>Save Changes</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
}

/* ========== MAIN SCREEN ========== */
export default function AdminDashboardScreen() {
  const [activeTab, setActiveTab] = useState<MemberCategory>('talent');
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [editMember, setEditMember] = useState<any>(null);
  const [showQRModal, setShowQRModal] = useState(false);
  const [showCreateNotice, setShowCreateNotice] = useState(false);
  const [seedingNotices, setSeedingNotices] = useState(false);
  const [seedingBookings, setSeedingBookings] = useState(false);
  const [seedingGigs, setSeedingGigs] = useState(false);
  const [editGigData, setEditGigData] = useState<any>(null);
  const { signOut } = useAuthActions();

  // Queries
  const approvedTalent = useQuery(api.talent.listAllProfiles, { status: 'approved' });
  const allMembers = useQuery(api.members.listAllMembers);
  const dbNotices = useQuery(api.notices.listNotices);
  const dbBookings = useQuery(api.bookings.listBookingRequests, {});
  const dbGigs = useQuery(api.gigs.listGigs, {});
  const addMemberMut = useMutation(api.members.addMember);
  const bulkImportMut = useMutation(api.members.bulkImportMembers);
  const updateMemberMut = useMutation(api.members.updateMember);
  const deleteMemberMut = useMutation(api.members.deleteMember);
  const createNoticeMut = useMutation(api.notices.createNotice);
  const deleteNoticeMut = useMutation(api.notices.deleteNotice);
  const togglePinMut = useMutation(api.notices.togglePin);
  const seedNoticesMut = useMutation(api.notices.seedDemoNotices);
  const seedBookingsMut = useMutation(api.bookings.seedDemoBookings);
  const seedGigsMut = useMutation(api.gigs.seedDemoGigsFromDashboard);
  const updateBookingStatusMut = useMutation(api.bookings.updateBookingStatus);
  const updateGigMut = useMutation(api.gigs.updateGig);

  // Build display data per category
  const membersByCategory = useMemo(() => {
    const db = allMembers || [];
    return {
      corporate: db.filter(m => m.category === 'corporate'),
      golf_days: db.filter(m => m.category === 'golf_days'),
      restaurants: db.filter(m => m.category === 'restaurants'),
      agencies: db.filter(m => m.category === 'agencies'),
    };
  }, [allMembers]);

  const talentDisplay = useMemo(() => {
    if (approvedTalent && approvedTalent.length > 0) {
      return approvedTalent.map((p: any) => {
        const existing = [...(p.photoUrls || [])].filter(Boolean);
        return { ...p, photoUrls: existing.length > 0 ? existing : [generatePhoto(p)] };
      });
    }
    return DEMO_TALENT.map((t: any) => ({
      ...t,
      _id: t.id,
      photoUrls: t.photos || [],
      phone: '+27XX XXX XXXX',
      email: `${t.firstName.toLowerCase()}.${t.lastName.toLowerCase()}@email.co.za`,
    }));
  }, [approvedTalent]);

  const displayData = useMemo(() => {
    if (activeTab === 'talent') return talentDisplay;
    if (activeTab === 'notices') return dbNotices || [];
    if (activeTab === 'bookings') return dbBookings || [];
    if (activeTab === 'gigs') return dbGigs || [];
    const dbList = membersByCategory[activeTab as keyof typeof membersByCategory] || [];
    const demoList = (DEMO_MEMBERS[activeTab] || []).map((d: any) => ({ ...d, isDemo: true }));
    return [...dbList, ...demoList];
  }, [activeTab, talentDisplay, membersByCategory, dbNotices, dbBookings, dbGigs]);

  const selectedProfile = useMemo(() => {
    if (!selectedProfileId) return null;
    return displayData.find((p: any) => (p._id || p.id) === selectedProfileId) || null;
  }, [selectedProfileId, displayData]);

  const counts = useMemo(() => ({
    talent: talentDisplay.length,
    bookings: dbBookings?.length || 0,
    gigs: dbGigs?.length || 0,
    corporate: (membersByCategory.corporate?.length || 0) + (DEMO_MEMBERS.corporate?.length || 0),
    golf_days: (membersByCategory.golf_days?.length || 0) + (DEMO_MEMBERS.golf_days?.length || 0),
    restaurants: (membersByCategory.restaurants?.length || 0) + (DEMO_MEMBERS.restaurants?.length || 0),
    agencies: (membersByCategory.agencies?.length || 0) + (DEMO_MEMBERS.agencies?.length || 0),
    notices: dbNotices?.length || 0,
  }), [talentDisplay, membersByCategory, dbNotices, dbBookings, dbGigs]);

  const activeTabConfig = TABS.find(t => t.key === activeTab)!;

  if (approvedTalent === undefined || allMembers === undefined) {
    return (
      <View style={[st.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={st.container}>
      <SafeAreaView style={st.safe} edges={['top']}>
        {/* Header */}
        <View style={st.header}>
          <View style={{ flex: 1 }}>
            <Text style={st.title}>Members</Text>
            <Text style={st.subtitle}>Diamond Angels Admin</Text>
          </View>
          <TouchableOpacity onPress={() => signOut()} style={st.signOutBtn}>
            <Ionicons name="log-out-outline" size={20} color={theme.colors.error} />
          </TouchableOpacity>
        </View>

        {/* Admin View Switcher - own row */}
        <View style={{ paddingHorizontal: 20, marginBottom: 10 }}>
          <AdminViewSwitcherPill />
        </View>

        {/* Category Tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={st.tabScroll}
          contentContainerStyle={st.tabContent}
        >
          {TABS.map(tab => {
            const active = activeTab === tab.key;
            return (
              <TouchableOpacity
                key={tab.key}
                style={[st.tab, active && { borderColor: tab.color, backgroundColor: tab.color + '15' }]}
                onPress={() => setActiveTab(tab.key)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={tab.icon as any}
                  size={15}
                  color={active ? tab.color : theme.colors.textMuted}
                />
                <Text style={[st.tabLabel, active && { color: tab.color }]}>{tab.label}</Text>
                <View style={[st.tabBadge, { backgroundColor: active ? tab.color + '30' : theme.colors.cardLight }]}>
                  <Text style={[st.tabBadgeText, { color: active ? tab.color : theme.colors.textMuted }]}>
                    {counts[tab.key]}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Action Buttons */}
        {activeTab === 'talent' ? (
          <View style={st.actionRow}>
            <TouchableOpacity style={st.actionBtn} onPress={() => setShowQRModal(true)} activeOpacity={0.7}>
              <Ionicons name="qr-code" size={17} color={theme.colors.primary} />
              <Text style={st.actionText}>Registration QR Code</Text>
            </TouchableOpacity>
          </View>
        ) : activeTab === 'bookings' ? (
          <View style={st.actionRow}>
            {(!dbBookings || dbBookings.length === 0) && (
              <TouchableOpacity
                style={st.actionBtn}
                onPress={async () => {
                  setSeedingBookings(true);
                  try {
                    const count = await seedBookingsMut();
                    if (count > 0) Alert.alert('Done', `${count} demo bookings created.`);
                    else Alert.alert('Info', 'Demo bookings already exist.');
                  } catch (e: any) { Alert.alert('Error', e.message || 'Failed'); }
                  setSeedingBookings(false);
                }}
                disabled={seedingBookings}
                activeOpacity={0.7}
              >
                {seedingBookings ? (
                  <ActivityIndicator size="small" color="#3B82F6" />
                ) : (
                  <>
                    <Ionicons name="flash" size={17} color="#3B82F6" />
                    <Text style={[st.actionText, { color: '#3B82F6' }]}>Load 10 Demo Bookings</Text>
                  </>
                )}
              </TouchableOpacity>
            )}
          </View>
        ) : activeTab === 'gigs' ? (
          <View style={st.actionRow}>
            {(!dbGigs || dbGigs.length === 0) && (
              <TouchableOpacity
                style={st.actionBtn}
                onPress={async () => {
                  setSeedingGigs(true);
                  try {
                    const count = await seedGigsMut();
                    if (count > 0) Alert.alert('Done', `${count} demo gigs created.`);
                    else Alert.alert('Info', 'Demo gigs already exist.');
                  } catch (e: any) { Alert.alert('Error', e.message || 'Failed'); }
                  setSeedingGigs(false);
                }}
                disabled={seedingGigs}
                activeOpacity={0.7}
              >
                {seedingGigs ? (
                  <ActivityIndicator size="small" color="#8B5CF6" />
                ) : (
                  <>
                    <Ionicons name="flash" size={17} color="#8B5CF6" />
                    <Text style={[st.actionText, { color: '#8B5CF6' }]}>Load 10 Demo Gigs</Text>
                  </>
                )}
              </TouchableOpacity>
            )}
          </View>
        ) : activeTab === 'notices' ? (
          <View style={st.actionRow}>
            <TouchableOpacity style={st.actionBtn} onPress={() => setShowCreateNotice(true)} activeOpacity={0.7}>
              <Ionicons name="add-circle" size={17} color="#F59E0B" />
              <Text style={[st.actionText, { color: '#F59E0B' }]}>Post Notice</Text>
            </TouchableOpacity>
            {(!dbNotices || dbNotices.length === 0) && (
              <TouchableOpacity
                style={st.actionBtn}
                onPress={async () => {
                  setSeedingNotices(true);
                  try {
                    await seedNoticesMut();
                    Alert.alert('Done', '5 demo notices have been posted to the talent notice board.');
                  } catch (e: any) {
                    Alert.alert('Error', e.message || 'Failed to seed notices');
                  }
                  setSeedingNotices(false);
                }}
                disabled={seedingNotices}
                activeOpacity={0.7}
              >
                {seedingNotices ? (
                  <ActivityIndicator size="small" color={theme.colors.secondary} />
                ) : (
                  <>
                    <Ionicons name="flash" size={17} color={theme.colors.secondary} />
                    <Text style={[st.actionText, { color: theme.colors.secondary }]}>Load 5 Demo Notices</Text>
                  </>
                )}
              </TouchableOpacity>
            )}
          </View>
        ) : activeTab === 'corporate' ? (
          <View style={st.actionRow}>
            <TouchableOpacity style={st.actionBtn} onPress={() => setShowAddModal(true)} activeOpacity={0.7}>
              <Ionicons name="add-circle" size={17} color={theme.colors.primary} />
              <Text style={st.actionText}>Add Member</Text>
            </TouchableOpacity>
            <TouchableOpacity style={st.actionBtn} onPress={() => setShowImportModal(true)} activeOpacity={0.7}>
              <Ionicons name="cloud-upload" size={17} color={theme.colors.secondary} />
              <Text style={[st.actionText, { color: theme.colors.secondary }]}>Import from Excel</Text>
            </TouchableOpacity>
          </View>
        ) : activeTab === 'golf_days' ? (
          <View style={st.actionRow}>
            <TouchableOpacity style={st.actionBtn} onPress={() => setShowAddModal(true)} activeOpacity={0.7}>
              <Ionicons name="add-circle" size={17} color={theme.colors.primary} />
              <Text style={st.actionText}>Add Member</Text>
            </TouchableOpacity>
            <TouchableOpacity style={st.actionBtn} onPress={() => setShowImportModal(true)} activeOpacity={0.7}>
              <Ionicons name="cloud-upload" size={17} color={theme.colors.secondary} />
              <Text style={[st.actionText, { color: theme.colors.secondary }]}>Import from Excel</Text>
            </TouchableOpacity>
          </View>
        ) : activeTab === 'restaurants' ? (
          <View style={st.actionRow}>
            <TouchableOpacity style={st.actionBtn} onPress={() => setShowAddModal(true)} activeOpacity={0.7}>
              <Ionicons name="add-circle" size={17} color={theme.colors.primary} />
              <Text style={st.actionText}>Add Member</Text>
            </TouchableOpacity>
            <TouchableOpacity style={st.actionBtn} onPress={() => setShowImportModal(true)} activeOpacity={0.7}>
              <Ionicons name="cloud-upload" size={17} color={theme.colors.secondary} />
              <Text style={[st.actionText, { color: theme.colors.secondary }]}>Import from Excel</Text>
            </TouchableOpacity>
          </View>
        ) : activeTab === 'agencies' ? (
          <View style={st.actionRow}>
            <TouchableOpacity style={st.actionBtn} onPress={() => setShowAddModal(true)} activeOpacity={0.7}>
              <Ionicons name="add-circle" size={17} color={theme.colors.primary} />
              <Text style={st.actionText}>Add Member</Text>
            </TouchableOpacity>
            <TouchableOpacity style={st.actionBtn} onPress={() => setShowImportModal(true)} activeOpacity={0.7}>
              <Ionicons name="cloud-upload" size={17} color={theme.colors.secondary} />
              <Text style={[st.actionText, { color: theme.colors.secondary }]}>Import from Excel</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {/* List */}
        <FlatList
          data={displayData}
          keyExtractor={(item: any) => item._id || item.id || Math.random().toString()}
          contentContainerStyle={st.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }: any) => {
            if (activeTab === 'talent') {
              return (
                <TalentCard
                  talent={item}
                  onPress={() => setSelectedProfileId(item._id || item.id)}
                />
              );
            }
            if (activeTab === 'bookings') {
              return (
                <BookingCard
                  booking={item}
                  onUpdateStatus={(status) => {
                    Alert.alert(
                      `${status.charAt(0).toUpperCase() + status.slice(1)} Booking`,
                      `Mark this ${item.eventType} booking as ${status}?`,
                      [
                        { text: 'Cancel' },
                        {
                          text: status.charAt(0).toUpperCase() + status.slice(1),
                          onPress: () => updateBookingStatusMut({ bookingId: item._id, status }),
                        },
                      ]
                    );
                  }}
                />
              );
            }
            if (activeTab === 'gigs') {
              return (
                <GigCard
                  gig={item}
                  onEdit={() => setEditGigData(item)}
                  onUpdateStatus={(status) => {
                    Alert.alert(
                      status === 'open' ? 'Reopen Gig' : 'Close Gig',
                      `${status === 'open' ? 'Reopen' : 'Close'} "${item.title}"?`,
                      [
                        { text: 'Cancel' },
                        {
                          text: status === 'open' ? 'Reopen' : 'Close',
                          onPress: () => updateGigMut({ gigId: item._id, status }),
                        },
                      ]
                    );
                  }}
                />
              );
            }
            if (activeTab === 'notices') {
              return (
                <AdminNoticeCard
                  notice={item}
                  onTogglePin={() => togglePinMut({ id: item._id })}
                  onDelete={() => {
                    Alert.alert('Delete Notice', `Delete "${item.title}"?`, [
                      { text: 'Cancel' },
                      {
                        text: 'Delete', style: 'destructive',
                        onPress: () => deleteNoticeMut({ id: item._id }),
                      },
                    ]);
                  }}
                />
              );
            }
            return (
              <MemberCard
                member={item}
                categoryColor={activeTabConfig.color}
                onPress={() => setEditMember(item)}
              />
            );
          }}
          ListEmptyComponent={
            <View style={st.empty}>
              <Ionicons name={activeTabConfig.icon as any} size={48} color={theme.colors.textMuted} />
              <Text style={st.emptyTitle}>
                {activeTab === 'notices' ? 'No Notices Yet'
                  : activeTab === 'bookings' ? 'No Bookings Yet'
                  : activeTab === 'gigs' ? 'No Gigs Yet'
                  : `No ${activeTabConfig.label} yet`}
              </Text>
              <Text style={st.emptyText}>
                {activeTab === 'notices'
                  ? 'Post a notice or load demo notices above'
                  : activeTab === 'bookings'
                  ? 'Load demo bookings to get started'
                  : activeTab === 'gigs'
                  ? 'Load demo gigs to get started'
                  : 'Add members or import from Excel'}
              </Text>
            </View>
          }
        />

        {/* Talent Profile Review Modal */}
        <ProfileReviewModal
          visible={!!selectedProfile}
          profile={selectedProfile}
          onClose={() => setSelectedProfileId(null)}
          onActionComplete={() => setSelectedProfileId(null)}
        />

        {/* Edit Member Modal */}
        <EditMemberModal
          visible={!!editMember}
          member={editMember}
          onClose={() => setEditMember(null)}
          onSave={async (data) => {
            if (editMember?.isDemo) {
              Alert.alert('Demo Data', 'Demo members cannot be edited. Add real members to edit them.');
              setEditMember(null);
              return;
            }
            await updateMemberMut({ id: editMember._id, ...data });
            setEditMember(null);
          }}
          onDelete={editMember?.isDemo ? undefined : () => {
            Alert.alert('Delete Member', `Delete ${editMember?.name}?`, [
              { text: 'Cancel' },
              {
                text: 'Delete', style: 'destructive', onPress: async () => {
                  try {
                    await deleteMemberMut({ id: editMember._id });
                    setEditMember(null);
                  } catch (e) { Alert.alert('Error', 'Failed to delete member'); }
                }
              },
            ]);
          }}
        />

        {/* Add Member Modal */}
        <AddMemberModal
          visible={showAddModal}
          category={activeTab}
          onClose={() => setShowAddModal(false)}
          onSave={async (data) => {
            await addMemberMut({ ...data, category: activeTab });
            setShowAddModal(false);
          }}
        />

        {/* Import Modal */}
        <ImportModal
          visible={showImportModal}
          category={activeTab}
          onClose={() => setShowImportModal(false)}
          onImport={async (members) => {
            await bulkImportMut({ members: members.map((m: any) => ({ ...m, category: activeTab })) });
            setShowImportModal(false);
          }}
        />

        {/* QR Code Modal */}
        <QRCodeModal
          visible={showQRModal}
          onClose={() => setShowQRModal(false)}
        />

        {/* Create Notice Modal */}
        <CreateNoticeModal
          visible={showCreateNotice}
          onClose={() => setShowCreateNotice(false)}
          onSave={async (data) => {
            await createNoticeMut(data);
            setShowCreateNotice(false);
          }}
        />

        {/* Edit Gig Modal */}
        <EditGigModal
          visible={!!editGigData}
          gig={editGigData}
          onClose={() => setEditGigData(null)}
          onSave={async (data) => {
            try {
              await updateGigMut(data);
              setEditGigData(null);
              Alert.alert('Success', 'Gig updated successfully');
            } catch (e: any) {
              Alert.alert('Error', e.message || 'Failed to update gig');
            }
          }}
        />
      </SafeAreaView>
    </View>
  );
}

/* ========== STYLES ========== */
const st = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  safe: { flex: 1 },

  // Header
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
    paddingHorizontal: 20, marginTop: 16,
  },
  title: { fontSize: 28, fontWeight: '800', color: theme.colors.primary },
  subtitle: { fontSize: 13, color: theme.colors.textSecondary, marginBottom: 14 },
  signOutBtn: {
    width: 40, height: 40, borderRadius: 10, backgroundColor: 'rgba(239,68,68,0.1)',
    alignItems: 'center', justifyContent: 'center',
  },

  // Tabs
  tabScroll: { marginBottom: 10, flexShrink: 0 },
  tabContent: { paddingHorizontal: 20, paddingVertical: 6, gap: 8 },
  tab: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12,
    backgroundColor: theme.colors.card, borderWidth: 1.5, borderColor: theme.colors.border,
  },
  tabLabel: { fontSize: 12, fontWeight: '700', color: theme.colors.textSecondary },
  tabBadge: {
    paddingHorizontal: 7, paddingVertical: 1, borderRadius: 8, minWidth: 22, alignItems: 'center' as const,
  },
  tabBadgeText: { fontSize: 11, fontWeight: '700' },

  // Action Buttons
  actionRow: {
    flexDirection: 'row', gap: 10, paddingHorizontal: 20, marginBottom: 10,
  },
  actionBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10,
    backgroundColor: theme.colors.card, borderWidth: 1, borderColor: theme.colors.border,
  },
  actionText: { fontSize: 12, fontWeight: '600', color: theme.colors.primary },

  // List
  list: { paddingHorizontal: 20, paddingBottom: 30 },

  // Card
  card: {
    backgroundColor: theme.colors.card, borderRadius: 16, padding: 14,
    marginBottom: 10, borderWidth: 1, borderColor: theme.colors.border,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  avatar: {
    width: 52, height: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: { fontSize: 18, fontWeight: '800' },
  talentPhoto: { width: 52, height: 66, borderRadius: 10, marginRight: 12 },
  cardInfo: { flex: 1 },
  cardName: { fontSize: 16, fontWeight: '700', color: theme.colors.text, marginBottom: 2 },
  cardCompany: { fontSize: 13, fontWeight: '600', color: theme.colors.textSecondary },
  cardMeta: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 2 },
  cardRole: { fontSize: 12, color: theme.colors.textMuted },
  cityRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  cardCity: { fontSize: 12, color: theme.colors.textMuted },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 6 },
  tag: { backgroundColor: 'rgba(201,168,76,0.15)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  tagText: { fontSize: 10, color: theme.colors.primary, fontWeight: '600' },

  // Contact Row
  contactRow: {
    flexDirection: 'row', gap: 8, borderTopWidth: 1, borderTopColor: theme.colors.border,
    paddingTop: 10,
  },
  contactBtn: { flex: 1, alignItems: 'center', gap: 4 },
  contactIcon: {
    width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center',
  },
  contactLabel: { fontSize: 10, fontWeight: '600' },

  // Empty
  empty: { alignItems: 'center', paddingTop: 60, gap: 8 },
  emptyTitle: { fontSize: 17, fontWeight: '700', color: theme.colors.textSecondary },
  emptyText: { fontSize: 13, color: theme.colors.textMuted },

  // Modals - shared
  overlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: theme.colors.card, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 24, borderWidth: 1, borderColor: theme.colors.border,
    maxHeight: '85%',
  },
  sheetTitle: { fontSize: 20, fontWeight: '800', color: theme.colors.text, marginBottom: 16 },
  input: {
    backgroundColor: theme.colors.inputBg, borderRadius: 12, paddingHorizontal: 16,
    paddingVertical: 14, fontSize: 15, color: theme.colors.text, marginBottom: 10,
    borderWidth: 1, borderColor: theme.colors.border,
  },
  btnRow: { flexDirection: 'row', gap: 12, marginTop: 16 },
  cancelBtn: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    paddingVertical: 14, borderRadius: 12, backgroundColor: theme.colors.cardLight,
  },
  cancelText: { fontSize: 15, fontWeight: '600', color: theme.colors.textSecondary },
  saveBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    paddingVertical: 14, borderRadius: 12, backgroundColor: theme.colors.primary,
  },
  saveText: { fontSize: 15, fontWeight: '700', color: '#fff' },

  // Import modal
  importSheet: {
    backgroundColor: theme.colors.card, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 24, borderWidth: 1, borderColor: theme.colors.border,
    maxHeight: '90%',
  },
  importHelp: { fontSize: 13, color: theme.colors.textSecondary, marginBottom: 8 },
  formatBox: {
    backgroundColor: theme.colors.inputBg, borderRadius: 8, padding: 10, marginBottom: 12,
    borderWidth: 1, borderColor: theme.colors.border,
  },
  formatText: { fontSize: 12, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', color: theme.colors.primary },
  importInput: {
    backgroundColor: theme.colors.inputBg, borderRadius: 12, paddingHorizontal: 16,
    paddingVertical: 14, fontSize: 14, color: theme.colors.text, minHeight: 140,
    borderWidth: 1, borderColor: theme.colors.border,
    textAlignVertical: 'top',
  },
  previewBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10,
  },
  previewText: { fontSize: 13, fontWeight: '600', color: theme.colors.success },

  // QR Code Modal
  qrSheet: {
    backgroundColor: theme.colors.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: theme.colors.border,
    maxHeight: '90%',
  },
  qrSheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  qrCloseBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.cardLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrDescription: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginBottom: 20,
    lineHeight: 18,
  },
  qrContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  qrInner: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  qrBrandTop: {
    marginBottom: 8,
  },
  qrBrandText: {
    fontSize: 14,
    fontWeight: '800',
    color: theme.colors.primaryDark,
    letterSpacing: 2,
  },
  qrBrandBottom: {
    marginTop: 8,
  },
  qrScanText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6B7280',
  },
  qrLinkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.inputBg,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  qrLinkText: {
    flex: 1,
    fontSize: 12,
    color: theme.colors.textMuted,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  qrCopyBtn: {
    padding: 6,
    marginLeft: 8,
  },
  qrActions: {
    flexDirection: 'row',
    gap: 12,
  },
  qrActionBtn: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: theme.colors.cardLight,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  qrActionIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrActionLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  qrSavingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Notice type icon
  noticeTypeIcon: {
    width: 36, height: 36, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
  },

  // Status badge
  statusBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8,
  },
  statusText: {
    fontSize: 11, fontWeight: '700',
  },
});