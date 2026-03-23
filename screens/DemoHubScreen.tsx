import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useDemo } from '../lib/DemoContext';
import { theme } from '../lib/theme';

const ROLES = [
  {
    key: 'admin',
    label: 'Agency Admin',
    desc: 'Manage talent, review bookings, create gigs, and oversee operations',
    icon: 'shield-checkmark' as const,
    color: theme.colors.primary,
    bg: 'rgba(201,168,76,0.12)',
  },
  {
    key: 'client',
    label: 'Client',
    desc: 'Search and filter talent, submit booking requests, browse the gig board',
    icon: 'briefcase' as const,
    color: theme.colors.secondary,
    bg: 'rgba(139,92,246,0.12)',
  },
  {
    key: 'talent',
    label: 'Talent',
    desc: 'Build your profile, browse available gigs, and express interest',
    icon: 'star' as const,
    color: theme.colors.success,
    bg: 'rgba(16,185,129,0.12)',
  },
];

export default function DemoHubScreen() {
  const { setDemoRole, exitDemo } = useDemo();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.safe}>
        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.demoBadge}>
              <Ionicons name="eye" size={14} color={theme.colors.primary} />
              <Text style={styles.demoBadgeText}>DEMO MODE</Text>
            </View>
            <View style={styles.logoRow}>
              <Ionicons name="diamond" size={32} color={theme.colors.primary} />
              <Text style={styles.title}>Diamond Angels</Text>
            </View>
            <Text style={styles.subtitle}>
              Explore the app from each perspective. Tap a role to begin.
            </Text>
          </View>

          <View style={styles.roles}>
            {ROLES.map((role) => (
              <TouchableOpacity
                key={role.key}
                style={styles.roleCard}
                onPress={() => setDemoRole(role.key)}
                activeOpacity={0.8}
              >
                <View style={[styles.roleIcon, { backgroundColor: role.bg }]}>
                  <Ionicons name={role.icon} size={26} color={role.color} />
                </View>
                <View style={styles.roleInfo}>
                  <Text style={styles.roleName}>{role.label}</Text>
                  <Text style={styles.roleDesc}>{role.desc}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={theme.colors.textMuted} />
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={styles.backBtn} onPress={exitDemo}>
            <Ionicons name="arrow-back" size={18} color={theme.colors.textSecondary} />
            <Text style={styles.backBtnText}>Back to Login</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  safe: { flex: 1 },
  content: { flex: 1, justifyContent: 'center', paddingHorizontal: 24 },
  header: { marginBottom: 32 },
  demoBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(201,168,76,0.12)',
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20,
    marginBottom: 16,
  },
  demoBadgeText: {
    fontSize: 12, fontWeight: '700', color: theme.colors.primary, letterSpacing: 1,
  },
  logoRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8,
  },
  title: {
    fontSize: 28, fontWeight: '800', color: theme.colors.primary, letterSpacing: 1,
  },
  subtitle: {
    fontSize: 15, color: theme.colors.textSecondary, lineHeight: 22,
  },
  roles: { gap: 12 },
  roleCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: theme.colors.card, borderRadius: 16,
    padding: 18, borderWidth: 1, borderColor: theme.colors.border,
  },
  roleIcon: {
    width: 50, height: 50, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center', marginRight: 14,
  },
  roleInfo: { flex: 1 },
  roleName: { fontSize: 16, fontWeight: '700', color: theme.colors.text, marginBottom: 4 },
  roleDesc: { fontSize: 13, color: theme.colors.textSecondary, lineHeight: 18 },
  backBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    marginTop: 32, padding: 14,
  },
  backBtnText: { fontSize: 15, color: theme.colors.textSecondary, fontWeight: '500' },
});
