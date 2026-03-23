import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, TextInput, ScrollView,
  Alert, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation } from 'convex/react';
import { useAuthActions } from '@convex-dev/auth/react';
import { api } from '../../convex/_generated/api';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../lib/theme';

function InputField({
  label, value, onChangeText, placeholder, keyboardType, autoCapitalize, multiline,
}: {
  label: string; value: string; onChangeText: (t: string) => void;
  placeholder?: string; keyboardType?: any; autoCapitalize?: any; multiline?: boolean;
}) {
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={[styles.input, multiline && { height: 80, textAlignVertical: 'top' }]}
        placeholder={placeholder || label}
        placeholderTextColor={theme.colors.textMuted}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        multiline={multiline}
      />
    </View>
  );
}

export default function ClientProfileScreen() {
  const user = useQuery(api.users.getCurrentUser);
  const clientProfile = useQuery(api.clients.getMyClientProfile);
  const upsertProfile = useMutation(api.clients.upsertClientProfile);
  const { signOut } = useAuthActions();

  // Company
  const [companyName, setCompanyName] = useState('');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [vatNumber, setVatNumber] = useState('');
  const [industry, setIndustry] = useState('');
  const [website, setWebsite] = useState('');

  // Contact
  const [contactPerson, setContactPerson] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [phone, setPhone] = useState('');
  const [altPhone, setAltPhone] = useState('');
  const [email, setEmail] = useState('');

  // Address
  const [streetAddress, setStreetAddress] = useState('');
  const [city, setCity] = useState('');
  const [stateProvince, setStateProvince] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('');

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (clientProfile) {
      setCompanyName(clientProfile.companyName || '');
      setRegistrationNumber(clientProfile.registrationNumber || '');
      setVatNumber(clientProfile.vatNumber || '');
      setIndustry(clientProfile.industry || '');
      setWebsite(clientProfile.website || '');
      setContactPerson(clientProfile.contactPerson || '');
      setJobTitle(clientProfile.jobTitle || '');
      setPhone(clientProfile.phone || '');
      setAltPhone(clientProfile.altPhone || '');
      setEmail(clientProfile.email || '');
      setStreetAddress(clientProfile.streetAddress || '');
      setCity(clientProfile.city || '');
      setStateProvince(clientProfile.stateProvince || '');
      setPostalCode(clientProfile.postalCode || '');
      setCountry(clientProfile.country || '');
    }
  }, [clientProfile?._id]);

  const handleSave = async () => {
    if (!companyName.trim() || !contactPerson.trim() || !phone.trim() || !email.trim()) {
      Alert.alert('Required Fields', 'Company name, contact person, phone and email are required.');
      return;
    }
    setSaving(true);
    try {
      await upsertProfile({
        companyName: companyName.trim(),
        registrationNumber: registrationNumber.trim() || undefined,
        vatNumber: vatNumber.trim() || undefined,
        industry: industry.trim() || undefined,
        website: website.trim() || undefined,
        contactPerson: contactPerson.trim(),
        jobTitle: jobTitle.trim() || undefined,
        phone: phone.trim(),
        altPhone: altPhone.trim() || undefined,
        email: email.trim(),
        streetAddress: streetAddress.trim() || undefined,
        city: city.trim() || undefined,
        stateProvince: stateProvince.trim() || undefined,
        postalCode: postalCode.trim() || undefined,
        country: country.trim() || undefined,
      });
      Alert.alert('Saved', 'Your profile has been updated.');
    } catch (e: any) {
      Alert.alert('Error', e.message);
    }
    setSaving(false);
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            <Text style={styles.title}>Profile</Text>

            {/* Account Card */}
            <View style={styles.card}>
              <View style={styles.avatarRow}>
                <View style={styles.avatar}>
                  <Ionicons name="person" size={32} color={theme.colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.userName}>{user?.name || 'Client'}</Text>
                  <Text style={styles.userEmail}>{user?.email || ''}</Text>
                </View>
              </View>
            </View>

            {/* Company Details */}
            <View style={styles.card}>
              <View style={styles.sectionHeader}>
                <Ionicons name="business-outline" size={18} color={theme.colors.primary} />
                <Text style={styles.sectionTitle}>Company Details</Text>
              </View>
              <Text style={styles.sectionSubtitle}>
                {clientProfile ? 'Keep your company info up to date' : 'Set up your company profile to submit bookings'}
              </Text>

              <InputField label="Company / Brand Name *" value={companyName} onChangeText={setCompanyName} />
              <InputField label="Registration Number" value={registrationNumber} onChangeText={setRegistrationNumber} />
              <InputField label="VAT Number" value={vatNumber} onChangeText={setVatNumber} />
              <InputField label="Industry" value={industry} onChangeText={setIndustry} placeholder="e.g. Fashion, Events, Advertising" />
              <InputField label="Website" value={website} onChangeText={setWebsite} keyboardType="url" autoCapitalize="none" placeholder="https://..." />
            </View>

            {/* Contact Details */}
            <View style={styles.card}>
              <View style={styles.sectionHeader}>
                <Ionicons name="call-outline" size={18} color={theme.colors.primary} />
                <Text style={styles.sectionTitle}>Contact Details</Text>
              </View>
              <Text style={styles.sectionSubtitle}>Primary contact for bookings and communication</Text>

              <InputField label="Contact Person *" value={contactPerson} onChangeText={setContactPerson} />
              <InputField label="Job Title / Position" value={jobTitle} onChangeText={setJobTitle} placeholder="e.g. Marketing Manager" />
              <InputField label="Phone Number *" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
              <InputField label="Alternative Phone" value={altPhone} onChangeText={setAltPhone} keyboardType="phone-pad" />
              <InputField label="Email Address *" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
            </View>

            {/* Address */}
            <View style={styles.card}>
              <View style={styles.sectionHeader}>
                <Ionicons name="location-outline" size={18} color={theme.colors.primary} />
                <Text style={styles.sectionTitle}>Address</Text>
              </View>
              <Text style={styles.sectionSubtitle}>Physical or postal address</Text>

              <InputField label="Street Address" value={streetAddress} onChangeText={setStreetAddress} />
              <View style={styles.row}>
                <View style={{ flex: 1 }}>
                  <InputField label="City" value={city} onChangeText={setCity} />
                </View>
                <View style={{ flex: 1 }}>
                  <InputField label="State / Province" value={stateProvince} onChangeText={setStateProvince} />
                </View>
              </View>
              <View style={styles.row}>
                <View style={{ flex: 1 }}>
                  <InputField label="Postal Code" value={postalCode} onChangeText={setPostalCode} keyboardType="default" />
                </View>
                <View style={{ flex: 1 }}>
                  <InputField label="Country" value={country} onChangeText={setCountry} />
                </View>
              </View>
            </View>

            {/* Save Button */}
            <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving} activeOpacity={0.7}>
              {saving ? (
                <ActivityIndicator color={theme.colors.black} />
              ) : (
                <Text style={styles.saveBtnText}>{clientProfile ? 'Update Profile' : 'Save Profile'}</Text>
              )}
            </TouchableOpacity>

            {/* Sign Out */}
            <TouchableOpacity style={styles.signOutBtn} onPress={() => signOut()}>
              <Ionicons name="log-out-outline" size={20} color={theme.colors.error} />
              <Text style={styles.signOutText}>Sign Out</Text>
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
  safe: { flex: 1 },
  scroll: { flex: 1, paddingHorizontal: 20 },
  title: { fontSize: 28, fontWeight: '800', color: theme.colors.primary, marginTop: 16, marginBottom: 20 },
  card: {
    backgroundColor: theme.colors.card, borderRadius: 16, padding: 18,
    marginBottom: 16, borderWidth: 1, borderColor: theme.colors.border,
  },
  avatarRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  avatar: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: 'rgba(201,168,76,0.12)', alignItems: 'center', justifyContent: 'center',
  },
  userName: { fontSize: 18, fontWeight: '700', color: theme.colors.text },
  userEmail: { fontSize: 14, color: theme.colors.textSecondary, marginTop: 2 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: theme.colors.text },
  sectionSubtitle: { fontSize: 13, color: theme.colors.textSecondary, marginBottom: 16 },
  fieldWrap: { marginBottom: 12 },
  fieldLabel: { fontSize: 12, fontWeight: '600', color: theme.colors.textSecondary, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 },
  input: {
    backgroundColor: theme.colors.inputBg, borderRadius: 12,
    paddingHorizontal: 16, paddingVertical: 14, fontSize: 15,
    color: theme.colors.text, borderWidth: 1, borderColor: theme.colors.border,
  },
  row: { flexDirection: 'row', gap: 12 },
  saveBtn: {
    backgroundColor: theme.colors.primary, borderRadius: 12,
    paddingVertical: 16, alignItems: 'center', marginBottom: 12,
  },
  saveBtnText: { fontSize: 16, fontWeight: '700', color: theme.colors.black },
  signOutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    paddingVertical: 16, borderRadius: 14,
    backgroundColor: 'rgba(239,68,68,0.1)', borderWidth: 1, borderColor: 'rgba(239,68,68,0.2)',
  },
  signOutText: { fontSize: 16, fontWeight: '600', color: theme.colors.error },
});