import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ActivityIndicator,
  Modal, Pressable,
} from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from 'convex/react';
import { api } from '../convex/_generated/api';
import { theme } from '../lib/theme';

import RoleSelectScreen from './RoleSelectScreen';
import AdminDashboardScreen from './admin/AdminDashboardScreen';
import TalentManagementScreen from './admin/TalentManagementScreen';
import BookingRequestsScreen from './admin/BookingRequestsScreen';
import GigManagementScreen from './admin/GigManagementScreen';
import SearchTalentScreen from './client/SearchTalentScreen';
import MySelectionsScreen from './client/MySelectionsScreen';
import GigBoardScreen from './client/GigBoardScreen';
import ClientProfileScreen from './client/ClientProfileScreen';
import OutfitsScreen from './client/OutfitsScreen';
import TalentProfileScreen from './talent/TalentProfileScreen';
import TalentGigsScreen from './talent/TalentGigsScreen';
import TalentActivityScreen from './talent/TalentActivityScreen';
import TalentSettingsScreen from './talent/TalentSettingsScreen';

const AdminTab = createBottomTabNavigator();
const ClientTab = createBottomTabNavigator();
const TalentTab = createBottomTabNavigator();

const TAB_OPTS = {
  headerShown: false,
  tabBarStyle: { backgroundColor: theme.colors.card, borderTopColor: theme.colors.border },
  tabBarActiveTintColor: theme.colors.primary,
  tabBarInactiveTintColor: theme.colors.textMuted,
};

function AdminNavigator() {
  return (
    <AdminTab.Navigator screenOptions={TAB_OPTS}>
      <AdminTab.Screen name="Dashboard" component={AdminDashboardScreen} options={{ tabBarIcon: ({ color, size }: any) => <Ionicons name="grid" size={size} color={color} /> }} />
      <AdminTab.Screen name="Talent" component={TalentManagementScreen} options={{ tabBarIcon: ({ color, size }: any) => <Ionicons name="people" size={size} color={color} /> }} />
      <AdminTab.Screen name="Bookings" component={BookingRequestsScreen} options={{ tabBarIcon: ({ color, size }: any) => <Ionicons name="calendar" size={size} color={color} /> }} />
      <AdminTab.Screen name="Gigs" component={GigManagementScreen} options={{ tabBarIcon: ({ color, size }: any) => <Ionicons name="megaphone" size={size} color={color} /> }} />
    </AdminTab.Navigator>
  );
}

function ClientNavigator() {
  return (
    <ClientTab.Navigator screenOptions={TAB_OPTS}>
      <ClientTab.Screen name="Search" component={SearchTalentScreen} options={{ tabBarIcon: ({ color, size }: any) => <Ionicons name="search" size={size} color={color} /> }} />
      <ClientTab.Screen name="Selections" component={MySelectionsScreen} options={{ tabBarIcon: ({ color, size }: any) => <Ionicons name="heart" size={size} color={color} /> }} />
      <ClientTab.Screen name="GigBoard" component={GigBoardScreen} options={{ tabBarLabel: 'Gig Board', tabBarIcon: ({ color, size }: any) => <Ionicons name="briefcase" size={size} color={color} /> }} />
      <ClientTab.Screen name="ClientOutfits" component={OutfitsScreen} options={{ tabBarLabel: 'Outfits', tabBarIcon: ({ color, size }: any) => <Ionicons name="shirt-outline" size={size} color={color} /> }} />
      <ClientTab.Screen name="Profile" component={ClientProfileScreen} options={{ tabBarIcon: ({ color, size }: any) => <Ionicons name="person" size={size} color={color} /> }} />
    </ClientTab.Navigator>
  );
}

function TalentNavigator() {
  return (
    <TalentTab.Navigator screenOptions={TAB_OPTS}>
      <TalentTab.Screen name="MyProfile" component={TalentProfileScreen} options={{ tabBarLabel: 'Profile', tabBarIcon: ({ color, size }: any) => <Ionicons name="person" size={size} color={color} /> }} />
      <TalentTab.Screen name="TalentGigs" component={TalentGigsScreen} options={{ tabBarLabel: 'Gigs', tabBarIcon: ({ color, size }: any) => <Ionicons name="briefcase" size={size} color={color} /> }} />
      <TalentTab.Screen name="Activity" component={TalentActivityScreen} options={{ tabBarIcon: ({ color, size }: any) => <Ionicons name="pulse" size={size} color={color} /> }} />
      <TalentTab.Screen name="TalentOutfits" component={OutfitsScreen} options={{ tabBarLabel: 'Outfits', tabBarIcon: ({ color, size }: any) => <Ionicons name="shirt-outline" size={size} color={color} /> }} />
      <TalentTab.Screen name="Settings" component={TalentSettingsScreen} options={{ tabBarIcon: ({ color, size }: any) => <Ionicons name="settings" size={size} color={color} /> }} />
    </TalentTab.Navigator>
  );
}

const SWITCH_ROLES = [
  { key: 'admin', label: 'Admin View', icon: 'shield-checkmark' as const, color: theme.colors.primary },
  { key: 'client', label: 'Client View', icon: 'business' as const, color: theme.colors.secondary },
  { key: 'talent', label: 'Talent View', icon: 'person' as const, color: theme.colors.success },
];

function AdminRoleSwitcher({ viewAs, onSwitch }: { viewAs: string; onSwitch: (role: string) => void }) {
  const [open, setOpen] = useState(false);
  const current = SWITCH_ROLES.find(r => r.key === viewAs) || SWITCH_ROLES[0];

  return (
    <>
      <TouchableOpacity
        style={[sw.pill, { borderColor: current.color }]}
        onPress={() => setOpen(true)}
        activeOpacity={0.7}
      >
        <Ionicons name={current.icon} size={14} color={current.color} />
        <Text style={[sw.pillText, { color: current.color }]}>{current.label}</Text>
        <Ionicons name="swap-horizontal" size={14} color={current.color} />
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="fade">
        <Pressable style={sw.overlay} onPress={() => setOpen(false)}>
          <View style={sw.sheet}>
            <Text style={sw.sheetTitle}>Switch View</Text>
            <Text style={sw.sheetSub}>Preview the app as different user types</Text>
            {SWITCH_ROLES.map(r => (
              <TouchableOpacity
                key={r.key}
                style={[sw.roleBtn, viewAs === r.key && { borderColor: r.color, backgroundColor: r.color + '15' }]}
                onPress={() => { onSwitch(r.key); setOpen(false); }}
              >
                <View style={[sw.roleIcon, { backgroundColor: r.color + '20' }]}>
                  <Ionicons name={r.icon} size={22} color={r.color} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={sw.roleLabel}>{r.label}</Text>
                  <Text style={sw.roleDesc}>
                    {r.key === 'admin' && 'Manage talent, bookings & gigs'}
                    {r.key === 'client' && 'Search talent & submit bookings'}
                    {r.key === 'talent' && 'View profile & browse gigs'}
                  </Text>
                </View>
                {viewAs === r.key && <Ionicons name="checkmark-circle" size={22} color={r.color} />}
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

export default function AuthenticatedApp() {
  const user = useQuery(api.users.getCurrentUser);
  const [viewAsRole, setViewAsRole] = useState('admin');

  if (user === undefined) {
    return (
      <View style={s.loading}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (!user?.role) return <RoleSelectScreen />;

  const isAdmin = user.role === 'admin';
  const activeRole = isAdmin ? viewAsRole : user.role;

  return (
    <View style={{ flex: 1 }}>
      {activeRole === 'admin' && <AdminNavigator />}
      {activeRole === 'client' && <ClientNavigator />}
      {activeRole === 'talent' && <TalentNavigator />}

      {isAdmin && (
        <AdminRoleSwitcher viewAs={viewAsRole} onSwitch={setViewAsRole} />
      )}
    </View>
  );
}

const s = StyleSheet.create({
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background },
});

const sw = StyleSheet.create({
  pill: {
    position: 'absolute', top: 58, right: 16, zIndex: 100,
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 20, borderWidth: 1.5,
    backgroundColor: theme.colors.card,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3, shadowRadius: 6, elevation: 8,
  },
  pillText: { fontSize: 13, fontWeight: '700' },
  overlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center', alignItems: 'center', padding: 24,
  },
  sheet: {
    width: '100%', backgroundColor: theme.colors.card,
    borderRadius: 20, padding: 24,
    borderWidth: 1, borderColor: theme.colors.border,
  },
  sheetTitle: { fontSize: 20, fontWeight: '800', color: theme.colors.text, marginBottom: 4 },
  sheetSub: { fontSize: 14, color: theme.colors.textSecondary, marginBottom: 20 },
  roleBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    padding: 16, borderRadius: 14, marginBottom: 10,
    borderWidth: 1.5, borderColor: theme.colors.border,
    backgroundColor: theme.colors.cardLight,
  },
  roleIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  roleLabel: { fontSize: 16, fontWeight: '700', color: theme.colors.text },
  roleDesc: { fontSize: 13, color: theme.colors.textSecondary, marginTop: 2 },
});