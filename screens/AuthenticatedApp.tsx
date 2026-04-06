import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ActivityIndicator,
  Modal, Pressable, Animated, Vibration, Platform, useWindowDimensions,
} from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../convex/_generated/api';
import { theme } from '../lib/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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
import NoticeBoardScreen from './talent/NoticeBoardScreen';
import NoticesManagementScreen from './admin/NoticesManagementScreen';

const AdminTab = createBottomTabNavigator();
const ClientTab = createBottomTabNavigator();
const TalentTab = createBottomTabNavigator();

function getTabOptions(isDesktop: boolean) {
  return {
    headerShown: false,
    sceneStyle: { backgroundColor: theme.colors.background },
    tabBarPosition: isDesktop ? 'left' as const : 'bottom' as const,
    tabBarVariant: isDesktop ? 'material' as const : 'uikit' as const,
    tabBarLabelPosition: isDesktop ? 'beside-icon' as const : 'below-icon' as const,
    tabBarActiveTintColor: theme.colors.primary,
    tabBarInactiveTintColor: theme.colors.textMuted,
    tabBarStyle: isDesktop ? {
      backgroundColor: theme.colors.card,
      borderRightColor: theme.colors.border,
      borderRightWidth: 1,
      borderTopWidth: 0,
      width: 238,
      paddingTop: 18,
      paddingBottom: 18,
    } : {
      backgroundColor: theme.colors.card,
      borderTopColor: theme.colors.border,
      height: 68,
      paddingBottom: 8,
      paddingTop: 8,
    },
    tabBarItemStyle: isDesktop ? {
      borderRadius: 14,
      marginHorizontal: 12,
      marginVertical: 4,
    } : undefined,
  };
}

function AdminNavigator({ isDesktop }: { isDesktop: boolean }) {
  return (
    <AdminTab.Navigator screenOptions={getTabOptions(isDesktop)}>
      <AdminTab.Screen name="Members" component={AdminDashboardScreen} options={{ tabBarIcon: ({ color, size }: any) => <Ionicons name="people" size={size} color={color} /> }} />
      <AdminTab.Screen name="Talent" component={TalentManagementScreen} options={{ tabBarIcon: ({ color, size }: any) => <Ionicons name="person-add" size={size} color={color} /> }} />
      <AdminTab.Screen name="Bookings" component={BookingRequestsScreen} options={{ tabBarIcon: ({ color, size }: any) => <Ionicons name="calendar" size={size} color={color} /> }} />
      <AdminTab.Screen name="Gigs" component={GigManagementScreen} options={{ tabBarIcon: ({ color, size }: any) => <Ionicons name="megaphone" size={size} color={color} /> }} />
      <AdminTab.Screen name="Notices" component={NoticesManagementScreen} options={{ tabBarIcon: ({ color, size }: any) => <Ionicons name="newspaper" size={size} color={color} /> }} />
    </AdminTab.Navigator>
  );
}

function ClientNavigator({ isDesktop }: { isDesktop: boolean }) {
  return (
    <ClientTab.Navigator screenOptions={getTabOptions(isDesktop)}>
      <ClientTab.Screen name="Search" component={SearchTalentScreen} options={{ tabBarIcon: ({ color, size }: any) => <Ionicons name="search" size={size} color={color} /> }} />
      <ClientTab.Screen name="Selections" component={MySelectionsScreen} options={{ tabBarIcon: ({ color, size }: any) => <Ionicons name="heart" size={size} color={color} /> }} />
      <ClientTab.Screen name="GigBoard" component={GigBoardScreen} options={{ tabBarLabel: 'Gig Board', tabBarIcon: ({ color, size }: any) => <Ionicons name="briefcase" size={size} color={color} /> }} />
      <ClientTab.Screen name="ClientOutfits" component={OutfitsScreen} options={{ tabBarLabel: 'Outfits', tabBarIcon: ({ color, size }: any) => <Ionicons name="shirt-outline" size={size} color={color} /> }} />
      <ClientTab.Screen name="Profile" component={ClientProfileScreen} options={{ tabBarIcon: ({ color, size }: any) => <Ionicons name="person" size={size} color={color} /> }} />
    </ClientTab.Navigator>
  );
}

function TalentNavigator({ isDesktop }: { isDesktop: boolean }) {
  return (
    <TalentTab.Navigator screenOptions={getTabOptions(isDesktop)}>
      <TalentTab.Screen name="TalentGigs" component={TalentGigsScreen} options={{ tabBarLabel: 'Gigs', tabBarIcon: ({ color, size }: any) => <Ionicons name="briefcase" size={size} color={color} /> }} />
      <TalentTab.Screen name="Activity" component={TalentActivityScreen} options={{ tabBarIcon: ({ color, size }: any) => <Ionicons name="pulse" size={size} color={color} /> }} />
      <TalentTab.Screen name="TalentOutfits" component={OutfitsScreen} options={{ tabBarLabel: 'Outfits', tabBarIcon: ({ color, size }: any) => <Ionicons name="shirt-outline" size={size} color={color} /> }} />
      <TalentTab.Screen name="NoticeBoard" component={NoticeBoardScreen} options={{ tabBarLabel: 'Notices', tabBarIcon: ({ color, size }: any) => <Ionicons name="newspaper" size={size} color={color} /> }} />
      <TalentTab.Screen name="MyProfile" component={TalentProfileScreen} options={{ tabBarLabel: 'Profile', tabBarIcon: ({ color, size }: any) => <Ionicons name="person" size={size} color={color} /> }} />
    </TalentTab.Navigator>
  );
}

const SWITCH_ROLES = [
  { key: 'admin', label: 'Admin View', icon: 'shield-checkmark' as const, color: theme.colors.primary },
  { key: 'client', label: 'Client View', icon: 'business' as const, color: theme.colors.secondary },
  { key: 'talent', label: 'Talent View', icon: 'person' as const, color: theme.colors.success },
];

// Context for admin view switching
export const AdminViewContext = React.createContext<{
  viewAs: string;
  onSwitch: (role: string) => void;
  isSuper: boolean;
}>({ viewAs: 'admin', onSwitch: () => {}, isSuper: false });

export function useAdminView() {
  return React.useContext(AdminViewContext);
}

/* ========== PIN ENTRY MODAL ========== */
const ADMIN_PIN = '2025';
const SUPER_PIN = '1977';

function PinEntryModal({ visible, onClose, onUnlock }: {
  visible: boolean;
  onClose: () => void;
  onUnlock: (isSuper: boolean) => void;
}) {
  const [pinDisplay, setPinDisplay] = useState('');
  const [error, setError] = useState(false);
  const pinRef = React.useRef('');
  const shakeAnim = React.useRef(new Animated.Value(0)).current;

  // Reset pin when modal opens
  React.useEffect(() => {
    if (visible) {
      pinRef.current = '';
      setPinDisplay('');
      setError(false);
    }
  }, [visible]);

  const shake = () => {
    Vibration.vibrate(100);
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 8, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -8, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  };

  const handleDigit = (digit: string) => {
    setError(false);
    const next = pinRef.current + digit;
    if (next.length > 4) return;
    pinRef.current = next;
    setPinDisplay(next);
    if (next.length === 4) {
      setTimeout(() => {
        if (next === SUPER_PIN) {
          pinRef.current = '';
          setPinDisplay('');
          onUnlock(true);
        } else if (next === ADMIN_PIN) {
          pinRef.current = '';
          setPinDisplay('');
          onUnlock(false);
        } else {
          setError(true);
          shake();
          setTimeout(() => {
            pinRef.current = '';
            setPinDisplay('');
          }, 400);
        }
      }, 150);
    }
  };

  const handleDelete = () => {
    setError(false);
    pinRef.current = pinRef.current.slice(0, -1);
    setPinDisplay(pinRef.current);
  };

  const handleClose = () => {
    pinRef.current = '';
    setPinDisplay('');
    setError(false);
    onClose();
  };

  const digits = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del'];

  return (
    <Modal visible={visible} transparent animationType="fade">
      <Pressable style={pinStyles.overlay} onPress={handleClose}>
        <Pressable style={pinStyles.container} onPress={e => e.stopPropagation()}>
          <View style={pinStyles.header}>
            <Ionicons name="shield-checkmark" size={32} color={theme.colors.primary} />
            <Text style={pinStyles.title}>Admin Access</Text>
            <Text style={pinStyles.subtitle}>Enter PIN to unlock view switching</Text>
          </View>

          <Animated.View style={[pinStyles.dotsRow, { transform: [{ translateX: shakeAnim }] }]}>
            {[0, 1, 2, 3].map(i => (
              <View
                key={i}
                style={[
                  pinStyles.dot,
                  pinDisplay.length > i && pinStyles.dotFilled,
                  error && pinStyles.dotError,
                ]}
              />
            ))}
          </Animated.View>

          {error && (
            <Text style={pinStyles.errorText}>Incorrect PIN</Text>
          )}

          <View style={pinStyles.keypad}>
            {digits.map((d, i) => {
              if (d === '') return <View key={i} style={pinStyles.keyEmpty} />;
              if (d === 'del') {
                return (
                  <TouchableOpacity
                    key={i}
                    style={pinStyles.key}
                    onPress={handleDelete}
                    activeOpacity={0.6}
                  >
                    <Ionicons name="backspace-outline" size={24} color={theme.colors.textSecondary} />
                  </TouchableOpacity>
                );
              }
              return (
                <TouchableOpacity
                  key={i}
                  style={pinStyles.key}
                  onPress={() => handleDigit(d)}
                  activeOpacity={0.6}
                >
                  <Text style={pinStyles.keyText}>{d}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <TouchableOpacity style={pinStyles.cancelBtn} onPress={handleClose}>
            <Text style={pinStyles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

/* ========== FLOATING ADMIN BUTTON ========== */
function FloatingAdminButton({
  unlocked,
  isSuper,
  viewAs,
  onPress,
  onLock,
}: {
  unlocked: boolean;
  isSuper: boolean;
  viewAs: string;
  onPress: () => void;
  onLock: () => void;
}) {
  const insets = useSafeAreaInsets();
  const current = SWITCH_ROLES.find(r => r.key === viewAs) || SWITCH_ROLES[0];

  if (unlocked) {
    return (
      <View style={[fabStyles.unlockedContainer, { bottom: 60 + insets.bottom }]}>
        <View style={[fabStyles.badge, isSuper && fabStyles.badgeSuper]}>
          <Ionicons
            name={isSuper ? 'diamond' : 'shield-checkmark'}
            size={10}
            color={isSuper ? '#FFD700' : theme.colors.primary}
          />
          <Text style={[fabStyles.badgeText, isSuper && fabStyles.badgeTextSuper]}>
            {isSuper ? 'SUPER' : 'ADMIN'}
          </Text>
        </View>
        <TouchableOpacity
          style={[fabStyles.unlockedPill, { borderColor: current.color }]}
          onPress={onPress}
          activeOpacity={0.7}
        >
          <Ionicons name={current.icon} size={16} color={current.color} />
          <Text style={[fabStyles.pillText, { color: current.color }]}>{current.label}</Text>
          <Ionicons name="swap-horizontal" size={14} color={current.color} />
        </TouchableOpacity>
        <TouchableOpacity style={fabStyles.lockBtn} onPress={onLock} activeOpacity={0.7}>
          <Ionicons name="lock-closed" size={12} color={theme.colors.textMuted} />
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <TouchableOpacity
      style={[fabStyles.lockedBtn, { bottom: 60 + insets.bottom }]}
      onPress={onPress}
      activeOpacity={0.7}
      onLongPress={onPress}
    >
      <Ionicons name="lock-closed" size={14} color={theme.colors.textMuted} />
    </TouchableOpacity>
  );
}

// Inline switcher pill component (no absolute positioning)
export function AdminViewSwitcherPill() {
  const { viewAs, onSwitch, isSuper } = React.useContext(AdminViewContext);
  const [open, setOpen] = useState(false);
  const current = SWITCH_ROLES.find(r => r.key === viewAs) || SWITCH_ROLES[0];

  return (
    <>
      <TouchableOpacity
        style={[sw.inlinePill, { borderColor: current.color }]}
        onPress={() => setOpen(true)}
        activeOpacity={0.7}
      >
        <Ionicons name={current.icon} size={14} color={current.color} />
        <Text style={[sw.pillText, { color: current.color }]}>{current.label}</Text>
        {isSuper && (
          <View style={{ backgroundColor: '#FFD70020', paddingHorizontal: 4, paddingVertical: 1, borderRadius: 4 }}>
            <Text style={{ fontSize: 8, fontWeight: '800', color: '#FFD700' }}>SUPER</Text>
          </View>
        )}
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
                onPress={() => {
                  onSwitch(r.key);
                  // Only close if not switching to admin (PIN modal may open)
                  if (r.key !== 'admin' || viewAs === 'admin') {
                    setOpen(false);
                  } else {
                    // Close after a short delay to let PIN modal appear
                    setTimeout(() => setOpen(false), 100);
                  }
                }}
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
  const { width } = useWindowDimensions();
  const user = useQuery(api.users.getCurrentUser);
  const [viewAsRole, setViewAsRole] = useState<string | null>(null);
  const checkAndLink = useMutation(api.users.checkAndLinkOnboardedTalent);
  const [linkChecked, setLinkChecked] = useState(false);
  const isDesktop = Platform.OS === 'web' && width >= 1024;

  // Admin PIN unlock state - PIN is ALWAYS required for admin access
  const [adminUnlocked, setAdminUnlocked] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [showSwitcher, setShowSwitcher] = useState(false);

  // Auto-link onboarded talent when user has no role
  React.useEffect(() => {
    if (user && !user.role && !linkChecked) {
      checkAndLink()
        .then(() => {
          setLinkChecked(true);
        })
        .catch(() => {
          setLinkChecked(true);
        });
    }
  }, [user, linkChecked]);

  // Set initial viewAs role based on user's actual role
  React.useEffect(() => {
    if (user?.role && viewAsRole === null) {
      // Admin-role users start on client view until they enter PIN
      setViewAsRole(user.role === 'admin' ? 'client' : user.role);
    }
  }, [user?.role]);

  // Auto-show PIN modal for admin-role users on first load
  React.useEffect(() => {
    if (user?.role === 'admin' && !adminUnlocked && viewAsRole === 'admin') {
      setShowPinModal(true);
    }
  }, [user?.role, viewAsRole, adminUnlocked]);

  if (user === undefined) {
    return (
      <View style={s.loading}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  // Show loading while we check for onboarded talent link
  if (!user?.role && !linkChecked) {
    return (
      <View style={s.loading}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={{ color: theme.colors.textSecondary, marginTop: 12, fontSize: 14 }}>
          Setting up your account...
        </Text>
      </View>
    );
  }

  if (!user?.role) return <RoleSelectScreen />;

  // Force PIN check: admin view only available when PIN is entered
  const effectiveRole = (() => {
    const targetRole = viewAsRole || user.role;
    // ALWAYS require PIN for admin - no exceptions
    if (targetRole === 'admin' && !adminUnlocked) {
      return 'client';
    }
    return targetRole;
  })();

  const handleUnlock = (isSuper: boolean) => {
    setAdminUnlocked(true);
    setIsSuperAdmin(isSuper);
    setShowPinModal(false);
    setViewAsRole('admin');
  };

  const handleLock = () => {
    setAdminUnlocked(false);
    setIsSuperAdmin(false);
    setShowSwitcher(false);
    setViewAsRole(user.role === 'admin' ? 'client' : user.role);
  };

  const handleViewSwitch = (role: string) => {
    if (role === 'admin' && !adminUnlocked) {
      setShowPinModal(true);
      return;
    }
    setViewAsRole(role);
  };

  return (
    <AdminViewContext.Provider value={{ viewAs: effectiveRole, onSwitch: handleViewSwitch, isSuper: isSuperAdmin }}>
      <View style={{ flex: 1 }}>
        {effectiveRole === 'admin' && <AdminNavigator isDesktop={isDesktop} />}
        {effectiveRole === 'client' && <ClientNavigator isDesktop={isDesktop} />}
        {effectiveRole === 'talent' && <TalentNavigator isDesktop={isDesktop} />}

        {/* Floating admin button - always requires PIN */}
        <FloatingAdminButton
          unlocked={adminUnlocked}
          isSuper={isSuperAdmin}
          viewAs={effectiveRole}
          onPress={() => {
            if (adminUnlocked) {
              setShowSwitcher(true);
            } else {
              setShowPinModal(true);
            }
          }}
          onLock={handleLock}
        />

        {/* PIN Entry Modal */}
        <PinEntryModal
          visible={showPinModal}
          onClose={() => {
            setShowPinModal(false);
            // If admin-role user hasn't unlocked yet, keep them on non-admin view
            if (!adminUnlocked && viewAsRole === 'admin') {
              setViewAsRole(user.role === 'admin' ? 'client' : user.role);
            }
          }}
          onUnlock={handleUnlock}
        />

        {/* View Switcher Modal (for floating button) */}
        <Modal visible={showSwitcher} transparent animationType="fade">
          <Pressable style={sw.overlay} onPress={() => setShowSwitcher(false)}>
            <View style={sw.sheet}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <Text style={sw.sheetTitle}>Switch View</Text>
                {isSuperAdmin && (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#FFD70015', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 }}>
                    <Ionicons name="diamond" size={12} color="#FFD700" />
                    <Text style={{ fontSize: 11, fontWeight: '800', color: '#FFD700' }}>SUPER ADMIN</Text>
                  </View>
                )}
              </View>
              <Text style={sw.sheetSub}>Preview the app as different user types</Text>
              {SWITCH_ROLES.map(r => (
                <TouchableOpacity
                  key={r.key}
                  style={[sw.roleBtn, effectiveRole === r.key && { borderColor: r.color, backgroundColor: r.color + '15' }]}
                  onPress={() => { handleViewSwitch(r.key); setShowSwitcher(false); }}
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
                  {effectiveRole === r.key && <Ionicons name="checkmark-circle" size={22} color={r.color} />}
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 14, marginTop: 6, borderRadius: 12, backgroundColor: 'rgba(239,68,68,0.1)' }}
                onPress={handleLock}
              >
                <Ionicons name="lock-closed" size={16} color={theme.colors.error} />
                <Text style={{ color: theme.colors.error, fontWeight: '600', fontSize: 14 }}>Lock Admin Access</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Modal>
      </View>
    </AdminViewContext.Provider>
  );
}

const s = StyleSheet.create({
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background },
});

const sw = StyleSheet.create({
  inlinePill: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 12, paddingVertical: 8,
    borderRadius: 20, borderWidth: 1.5,
    backgroundColor: theme.colors.card,
  },
  pillText: { fontSize: 12, fontWeight: '700' },
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

const pinStyles = StyleSheet.create({
  overlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center', alignItems: 'center', padding: 24,
  },
  container: {
    width: '100%', maxWidth: 320,
    backgroundColor: theme.colors.card,
    borderRadius: 24, padding: 28,
    borderWidth: 1, borderColor: theme.colors.border,
    alignItems: 'center',
  },
  header: { alignItems: 'center', marginBottom: 28 },
  title: { fontSize: 20, fontWeight: '800', color: theme.colors.text, marginTop: 12 },
  subtitle: { fontSize: 13, color: theme.colors.textSecondary, marginTop: 4 },
  dotsRow: { flexDirection: 'row', gap: 16, marginBottom: 8 },
  dot: {
    width: 16, height: 16, borderRadius: 8,
    borderWidth: 2, borderColor: theme.colors.border,
    backgroundColor: 'transparent',
  },
  dotFilled: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
  dotError: { backgroundColor: theme.colors.error, borderColor: theme.colors.error },
  errorText: { color: theme.colors.error, fontSize: 13, fontWeight: '600', marginTop: 8, marginBottom: 4 },
  keypad: {
    flexDirection: 'row', flexWrap: 'wrap',
    justifyContent: 'center', gap: 12, marginTop: 24,
    width: 240,
  },
  key: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: theme.colors.cardLight,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: theme.colors.border,
  },
  keyText: { fontSize: 24, fontWeight: '600', color: theme.colors.text },
  keyEmpty: { width: 64, height: 64 },
  cancelBtn: { marginTop: 20, paddingVertical: 10, paddingHorizontal: 24 },
  cancelText: { color: theme.colors.textSecondary, fontSize: 15, fontWeight: '600' },
});

const fabStyles = StyleSheet.create({
  lockedBtn: {
    position: 'absolute', left: 16,
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: theme.colors.card,
    borderWidth: 1, borderColor: theme.colors.border,
    alignItems: 'center', justifyContent: 'center',
    opacity: 0.6,
  },
  unlockedContainer: {
    position: 'absolute', left: 16,
    alignItems: 'flex-start', gap: 4,
  },
  badge: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: theme.colors.primary + '15',
    paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6,
  },
  badgeSuper: { backgroundColor: '#FFD70020' },
  badgeText: { fontSize: 8, fontWeight: '800', color: theme.colors.primary, letterSpacing: 0.5 },
  badgeTextSuper: { color: '#FFD700' },
  unlockedPill: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 12, paddingVertical: 8,
    borderRadius: 20, borderWidth: 1.5,
    backgroundColor: theme.colors.card,
  },
  pillText: { fontSize: 12, fontWeight: '700' },
  lockBtn: {
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: theme.colors.cardLight,
    borderWidth: 1, borderColor: theme.colors.border,
    alignItems: 'center', justifyContent: 'center',
    alignSelf: 'center',
  },
});
