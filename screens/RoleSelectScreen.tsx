import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, TextInput, Alert, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMutation } from 'convex/react';
import { api } from '../convex/_generated/api';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../lib/theme';

export default function RoleSelectScreen() {
  const setRole = useMutation(api.users.setRole);
  const [loading, setLoading] = useState(false);
  const [showAdminInput, setShowAdminInput] = useState(false);
  const [adminCode, setAdminCode] = useState('');

  const handleSelect = async (role: string, code?: string) => {
    setLoading(true);
    try {
      await setRole({ role, adminCode: code });
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to set role');
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.content}>
          <Text style={styles.title}>Welcome to{'\n'}Diamond Angels</Text>
          <Text style={styles.subtitle}>How would you like to use the app?</Text>

          <TouchableOpacity
            style={styles.roleCard}
            onPress={() => handleSelect('client')}
            activeOpacity={0.8}
          >
            <View style={styles.roleIcon}>
              <Ionicons name="briefcase" size={28} color={theme.colors.primary} />
            </View>
            <View style={styles.roleInfo}>
              <Text style={styles.roleName}>I'm a Client</Text>
              <Text style={styles.roleDesc}>
                Find and book talent for your events, activations, and campaigns
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.roleCard}
            onPress={() => handleSelect('talent')}
            activeOpacity={0.8}
          >
            <View style={[styles.roleIcon, { backgroundColor: 'rgba(139,92,246,0.12)' }]}>
              <Ionicons name="star" size={28} color={theme.colors.secondary} />
            </View>
            <View style={styles.roleInfo}>
              <Text style={styles.roleName}>I'm Talent</Text>
              <Text style={styles.roleDesc}>
                Create your profile, get booked for gigs, and grow your career
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.colors.textMuted} />
          </TouchableOpacity>

          {!showAdminInput ? (
            <TouchableOpacity
              style={styles.adminLink}
              onPress={() => setShowAdminInput(true)}
            >
              <Text style={styles.adminLinkText}>Agency Admin Access</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.adminSection}>
              <TextInput
                style={styles.adminInput}
                placeholder="Enter admin code"
                placeholderTextColor={theme.colors.textMuted}
                value={adminCode}
                onChangeText={setAdminCode}
                secureTextEntry
                autoCapitalize="characters"
              />
              <TouchableOpacity
                style={styles.adminBtn}
                onPress={() => handleSelect('admin', adminCode)}
              >
                <Text style={styles.adminBtnText}>Verify</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  safe: { flex: 1 },
  content: { flex: 1, justifyContent: 'center', paddingHorizontal: 24 },
  title: {
    fontSize: 30, fontWeight: '800', color: theme.colors.primary,
    marginBottom: 8, letterSpacing: 1,
  },
  subtitle: {
    fontSize: 16, color: theme.colors.textSecondary, marginBottom: 40,
  },
  roleCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: theme.colors.card, borderRadius: 16,
    padding: 20, marginBottom: 16, borderWidth: 1, borderColor: theme.colors.border,
  },
  roleIcon: {
    width: 52, height: 52, borderRadius: 14,
    backgroundColor: 'rgba(201,168,76,0.12)',
    alignItems: 'center', justifyContent: 'center', marginRight: 16,
  },
  roleInfo: { flex: 1 },
  roleName: { fontSize: 17, fontWeight: '700', color: theme.colors.text, marginBottom: 4 },
  roleDesc: { fontSize: 13, color: theme.colors.textSecondary, lineHeight: 18 },
  adminLink: { alignSelf: 'center', marginTop: 24, padding: 12 },
  adminLinkText: { fontSize: 14, color: theme.colors.textMuted },
  adminSection: {
    flexDirection: 'row', marginTop: 20, gap: 12, alignItems: 'center',
  },
  adminInput: {
    flex: 1, backgroundColor: theme.colors.inputBg, borderRadius: 12,
    paddingHorizontal: 16, paddingVertical: 14, fontSize: 15,
    color: theme.colors.text, borderWidth: 1, borderColor: theme.colors.border,
  },
  adminBtn: {
    backgroundColor: theme.colors.primary, borderRadius: 12,
    paddingHorizontal: 20, paddingVertical: 14,
  },
  adminBtnText: { fontSize: 15, fontWeight: '600', color: theme.colors.black },
});
