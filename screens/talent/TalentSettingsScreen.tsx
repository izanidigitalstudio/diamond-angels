import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from 'convex/react';
import { useAuthActions } from '@convex-dev/auth/react';
import { api } from '../../convex/_generated/api';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../lib/theme';

export default function TalentSettingsScreen() {
  const user = useQuery(api.users.getCurrentUser);
  const profile = useQuery(api.talent.getMyProfile);
  const { signOut } = useAuthActions();

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
          <Text style={styles.title}>Settings</Text>

          <View style={styles.card}>
            <View style={styles.avatarRow}>
              <View style={styles.avatar}>
                <Ionicons name="person" size={32} color={theme.colors.primary} />
              </View>
              <View>
                <Text style={styles.userName}>
                  {profile ? `${profile.firstName} ${profile.lastName}` : user?.name || 'Talent'}
                </Text>
                <Text style={styles.userEmail}>{user?.email || ''}</Text>
                {profile && (
                  <View style={[styles.statusBadge, {
                    backgroundColor: profile.status === 'approved' ? 'rgba(16,185,129,0.15)' :
                      profile.status === 'pending' ? 'rgba(245,158,11,0.15)' : 'rgba(239,68,68,0.15)'
                  }]}>
                    <Text style={[styles.statusText, {
                      color: profile.status === 'approved' ? theme.colors.success :
                        profile.status === 'pending' ? theme.colors.warning : theme.colors.error
                    }]}>
                      {profile.status.charAt(0).toUpperCase() + profile.status.slice(1)}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Account</Text>
            <View style={styles.menuItem}>
              <Ionicons name="star-outline" size={20} color={theme.colors.textSecondary} />
              <Text style={styles.menuText}>Role</Text>
              <Text style={styles.menuValue}>Talent</Text>
            </View>
            {profile && (
              <>
                <View style={styles.menuItem}>
                  <Ionicons name="location-outline" size={20} color={theme.colors.textSecondary} />
                  <Text style={styles.menuText}>City</Text>
                  <Text style={styles.menuValue}>{profile.city}</Text>
                </View>
                <View style={styles.menuItem}>
                  <Ionicons name="call-outline" size={20} color={theme.colors.textSecondary} />
                  <Text style={styles.menuText}>Phone</Text>
                  <Text style={styles.menuValue}>{profile.phone}</Text>
                </View>
              </>
            )}
          </View>

          <TouchableOpacity style={styles.signOutBtn} onPress={() => signOut()}>
            <Ionicons name="log-out-outline" size={20} color={theme.colors.error} />
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>
        </ScrollView>
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
  statusBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 6, alignSelf: 'flex-start', marginTop: 6 },
  statusText: { fontSize: 12, fontWeight: '600' },
  sectionTitle: { fontSize: 14, fontWeight: '600', color: theme.colors.textMuted, marginBottom: 8 },
  menuItem: {
    flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: theme.colors.border,
  },
  menuText: { flex: 1, fontSize: 15, color: theme.colors.text },
  menuValue: { fontSize: 14, color: theme.colors.textSecondary },
  signOutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    paddingVertical: 16, borderRadius: 14,
    backgroundColor: 'rgba(239,68,68,0.1)', borderWidth: 1, borderColor: 'rgba(239,68,68,0.2)',
    marginTop: 8,
  },
  signOutText: { fontSize: 16, fontWeight: '600', color: theme.colors.error },
});
