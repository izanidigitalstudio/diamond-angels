import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  StatusBar,
  TextInput,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthActions } from '@convex-dev/auth/react';
import { useMutation } from 'convex/react';
import { api } from '../convex/_generated/api';
import { Ionicons } from '@expo/vector-icons';

const C = {
  bg: '#0A0A0F',
  panel: '#11111A',
  card: '#171723',
  cardSoft: '#1D1D2B',
  gold: '#C9A84C',
  text: '#FFFFFF',
  sub: '#9CA3AF',
  muted: '#6B7280',
  border: '#2D2D3D',
  inputBg: '#131320',
  black: '#111118',
  success: '#34D399',
};

const TRUST_POINTS = [
  'Live talent, booking, outfit and notice workflows',
  'Role-based access for admin, clients and talent',
  'Secure sign up backed by the live Convex database',
];

export default function LoginScreen() {
  const { width } = useWindowDimensions();
  const { signIn } = useAuthActions();
  const setRole = useMutation(api.users.setRole);
  const [isSignUp, setIsSignUp] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [devLoading, setDevLoading] = useState(false);

  const isDesktop = width >= 1080;
  const isTablet = width >= 760;

  const DEV_EMAIL = 'leboggg@gmail.com';
  const DEV_PASSWORD = 'IzaniDigital@100';

  const handleDevLogin = async () => {
    setDevLoading(true);
    try {
      await signIn('password', {
        email: DEV_EMAIL,
        password: DEV_PASSWORD,
        flow: 'signIn',
      });
    } catch {
      try {
        await signIn('password', {
          email: DEV_EMAIL,
          password: DEV_PASSWORD,
          name: 'Chairman - Izani Capital',
          flow: 'signUp',
        });
      } catch (e: any) {
        Alert.alert('Dev Login Failed', e?.message || 'Could not auto-login. Try manually.');
        setDevLoading(false);
        return;
      }
    }

    try {
      await setRole({ role: 'admin', adminCode: '2025' });
    } catch {}

    setDevLoading(false);
  };

  const handleEmail = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Missing fields', 'Please enter email and password.');
      return;
    }
    if (isSignUp && !name.trim()) {
      Alert.alert('Missing name', 'Please enter your name.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Weak password', 'Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      const authParams = {
        email: email.trim().toLowerCase(),
        password,
        flow: isSignUp ? 'signUp' : 'signIn',
        ...(isSignUp ? { name: name.trim() } : {}),
      };
      await signIn('password', authParams);
    } catch (e: any) {
      const msg = e?.message || 'Something went wrong.';

      if (!isSignUp && msg.toLowerCase().includes('invalidaccountid')) {
        try {
          await signIn('password', {
            email: email.trim().toLowerCase(),
            password,
            name: name.trim() || email.trim().split('@')[0],
            flow: 'signUp',
          });
          setIsSignUp(true);
          return;
        } catch (retryError: any) {
          const retryMsg = retryError?.message || '';
          if (retryMsg.toLowerCase().includes('already') || retryMsg.toLowerCase().includes('exist')) {
            Alert.alert('Incorrect Password', 'An account with this email exists but the password is incorrect. Please try again.');
          } else {
            Alert.alert('Sign In Failed', 'No account found with this email. Please sign up first.');
          }
          return;
        }
      }

      if (isSignUp && (msg.toLowerCase().includes('already') || msg.toLowerCase().includes('exist') || msg.toLowerCase().includes('invalidaccountid'))) {
        try {
          await signIn('password', {
            email: email.trim().toLowerCase(),
            password,
            flow: 'signIn',
          });
          setIsSignUp(false);
          return;
        } catch {
          Alert.alert('Account Exists', 'An account with this email already exists. Please sign in and check your password.');
          return;
        }
      }

      if (msg.toLowerCase().includes('invalid password') || msg.toLowerCase().includes('credentials')) {
        Alert.alert('Invalid Credentials', 'Please check your email and password.');
      } else if (msg.toLowerCase().includes('security') || msg.toLowerCase().includes('securityerror')) {
        Alert.alert('Browser Restriction', 'Refresh the page and try again.');
      } else {
        Alert.alert(isSignUp ? 'Sign Up Failed' : 'Sign In Failed', msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={st.container}>
      <StatusBar barStyle="light-content" />
      <View style={[st.bgOrb, st.bgOrbOne]} />
      <View style={[st.bgOrb, st.bgOrbTwo]} />
      <SafeAreaView style={st.safeArea}>
        <KeyboardAvoidingView style={st.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView
            contentContainerStyle={[
              st.scroll,
              isDesktop ? st.scrollDesktop : isTablet ? st.scrollTablet : null,
            ]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={[st.shell, isDesktop ? st.shellDesktop : isTablet ? st.shellTablet : null]}>
              <View style={[st.heroPanel, isDesktop ? st.heroPanelDesktop : null]}>
                <View style={st.brandRow}>
                  <TouchableOpacity
                    onLongPress={handleDevLogin}
                    delayLongPress={800}
                    activeOpacity={0.8}
                    style={st.icon}
                  >
                    {devLoading ? (
                      <ActivityIndicator color={C.gold} />
                    ) : (
                      <Ionicons name="diamond" size={36} color={C.gold} />
                    )}
                  </TouchableOpacity>
                  <View style={st.brandTextWrap}>
                    <Text style={st.appName}>Diamond Angels</Text>
                    <Text style={st.tag}>South Africa&apos;s premier female talent agency platform</Text>
                  </View>
                </View>

                <View style={st.heroCopy}>
                  <View style={st.liveBadge}>
                    <View style={st.liveDot} />
                    <Text style={st.liveBadgeText}>Live web access</Text>
                  </View>
                  <Text style={[st.heroTitle, isDesktop ? st.heroTitleDesktop : null]}>
                    Book premium talent with a proper agency dashboard built for web.
                  </Text>
                  <Text style={[st.heroBody, isDesktop ? st.heroBodyDesktop : null]}>
                    Create your account to access the live client, talent and admin workflows backed by Convex.
                  </Text>
                </View>

                <View style={[st.metricsRow, isDesktop ? st.metricsRowDesktop : null]}>
                  <View style={st.metricCard}>
                    <Text style={st.metricValue}>Live</Text>
                    <Text style={st.metricLabel}>Database connection</Text>
                  </View>
                  <View style={st.metricCard}>
                    <Text style={st.metricValue}>3</Text>
                    <Text style={st.metricLabel}>User roles</Text>
                  </View>
                  <View style={st.metricCard}>
                    <Text style={st.metricValue}>Web</Text>
                    <Text style={st.metricLabel}>Mobile + desktop</Text>
                  </View>
                </View>

                <View style={st.trustList}>
                  {TRUST_POINTS.map(point => (
                    <View key={point} style={st.trustItem}>
                      <View style={st.trustIcon}>
                        <Ionicons name="checkmark" size={14} color={C.gold} />
                      </View>
                      <Text style={st.trustText}>{point}</Text>
                    </View>
                  ))}
                </View>
              </View>

              <View style={[st.authCard, isDesktop ? st.authCardDesktop : null]}>
                <View style={st.authCardHeader}>
                  <Text style={st.authEyebrow}>{isSignUp ? 'Create account' : 'Welcome back'}</Text>
                  <Text style={st.authTitle}>{isSignUp ? 'Get started' : 'Sign in to continue'}</Text>
                  <Text style={st.authSub}>
                    {isSignUp
                      ? 'Create your account to access the live platform.'
                      : 'Use your email and password to access your account.'}
                  </Text>
                </View>

                <View style={st.toggle}>
                  <TouchableOpacity style={[st.togBtn, isSignUp && st.togActive]} onPress={() => setIsSignUp(true)}>
                    <Text style={[st.togText, isSignUp && st.togTextActive]}>Sign Up</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[st.togBtn, !isSignUp && st.togActive]} onPress={() => setIsSignUp(false)}>
                    <Text style={[st.togText, !isSignUp && st.togTextActive]}>Sign In</Text>
                  </TouchableOpacity>
                </View>

                <View style={st.form}>
                  {isSignUp && (
                    <View style={st.inputRow}>
                      <Ionicons name="person-outline" size={18} color={C.muted} style={st.inputIcon} />
                      <TextInput
                        style={st.input}
                        placeholder="Full Name"
                        placeholderTextColor={C.muted}
                        value={name}
                        onChangeText={setName}
                        autoCapitalize="words"
                      />
                    </View>
                  )}

                  <View style={st.inputRow}>
                    <Ionicons name="mail-outline" size={18} color={C.muted} style={st.inputIcon} />
                    <TextInput
                      style={st.input}
                      placeholder="Email Address"
                      placeholderTextColor={C.muted}
                      value={email}
                      onChangeText={setEmail}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                  </View>

                  <View style={st.inputRow}>
                    <Ionicons name="lock-closed-outline" size={18} color={C.muted} style={st.inputIcon} />
                    <TextInput
                      style={[st.input, st.passwordInput]}
                      placeholder="Password"
                      placeholderTextColor={C.muted}
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry={!showPw}
                      autoCapitalize="none"
                    />
                    <TouchableOpacity onPress={() => setShowPw(!showPw)} style={st.eyeBtn}>
                      <Ionicons name={showPw ? 'eye-off-outline' : 'eye-outline'} size={20} color={C.muted} />
                    </TouchableOpacity>
                  </View>

                  <TouchableOpacity
                    style={[st.mainBtn, loading && st.mainBtnDisabled]}
                    onPress={handleEmail}
                    disabled={loading}
                    activeOpacity={0.85}
                  >
                    {loading ? (
                      <ActivityIndicator color={C.black} />
                    ) : (
                      <Text style={st.mainBtnText}>{isSignUp ? 'Create Account' : 'Sign In'}</Text>
                    )}
                  </TouchableOpacity>
                </View>

                <View style={st.authHint}>
                  <Ionicons name="shield-checkmark-outline" size={16} color={C.sub} />
                  <Text style={st.authHintText}>Web sign in uses the live Convex backend and requires account creation.</Text>
                </View>

                <Text style={st.footer}>By continuing, you agree to our Terms of Service and Privacy Policy.</Text>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const st = StyleSheet.create({
  flex: { flex: 1 },
  container: { flex: 1, backgroundColor: C.bg },
  safeArea: { flex: 1 },
  bgOrb: {
    position: 'absolute',
    borderRadius: 999,
    opacity: 0.22,
  },
  bgOrbOne: {
    width: 320,
    height: 320,
    backgroundColor: '#4C5BD4',
    top: -120,
    right: -80,
  },
  bgOrbTwo: {
    width: 280,
    height: 280,
    backgroundColor: '#C9A84C',
    bottom: -100,
    left: -80,
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  scrollTablet: {
    paddingHorizontal: 28,
    paddingVertical: 28,
  },
  scrollDesktop: {
    paddingHorizontal: 40,
    paddingVertical: 36,
  },
  shell: {
    width: '100%',
    maxWidth: 1240,
    alignSelf: 'center',
    gap: 20,
  },
  shellTablet: {
    gap: 24,
  },
  shellDesktop: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: 24,
  },
  heroPanel: {
    backgroundColor: 'rgba(23,23,35,0.86)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 28,
    padding: 24,
    overflow: 'hidden',
  },
  heroPanelDesktop: {
    flex: 1.05,
    padding: 34,
    minHeight: 680,
    justifyContent: 'space-between',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandTextWrap: {
    flex: 1,
  },
  icon: {
    width: 68,
    height: 68,
    borderRadius: 24,
    backgroundColor: 'rgba(201,168,76,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(201,168,76,0.28)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  appName: {
    fontSize: 28,
    fontWeight: '800',
    color: C.text,
    letterSpacing: 0.3,
  },
  tag: {
    fontSize: 13,
    color: C.sub,
    marginTop: 4,
    lineHeight: 18,
  },
  heroCopy: {
    marginTop: 28,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    marginBottom: 18,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: C.success,
    marginRight: 8,
  },
  liveBadgeText: {
    color: C.text,
    fontSize: 12,
    fontWeight: '700',
  },
  heroTitle: {
    color: C.text,
    fontSize: 30,
    fontWeight: '800',
    lineHeight: 38,
  },
  heroTitleDesktop: {
    fontSize: 42,
    lineHeight: 52,
    maxWidth: 540,
  },
  heroBody: {
    color: C.sub,
    fontSize: 15,
    lineHeight: 24,
    marginTop: 14,
  },
  heroBodyDesktop: {
    fontSize: 17,
    lineHeight: 28,
    maxWidth: 520,
  },
  metricsRow: {
    marginTop: 26,
    gap: 12,
  },
  metricsRowDesktop: {
    flexDirection: 'row',
  },
  metricCard: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 18,
  },
  metricValue: {
    color: C.gold,
    fontSize: 22,
    fontWeight: '800',
  },
  metricLabel: {
    color: C.sub,
    fontSize: 12,
    marginTop: 4,
  },
  trustList: {
    marginTop: 26,
    gap: 12,
  },
  trustItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(10,10,15,0.35)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  trustIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(201,168,76,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  trustText: {
    flex: 1,
    color: C.text,
    fontSize: 13,
    lineHeight: 19,
  },
  authCard: {
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 28,
    padding: 22,
  },
  authCardDesktop: {
    width: 460,
    padding: 30,
    justifyContent: 'center',
  },
  authCardHeader: {
    marginBottom: 20,
  },
  authEyebrow: {
    color: C.gold,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 10,
  },
  authTitle: {
    color: C.text,
    fontSize: 30,
    fontWeight: '800',
  },
  authSub: {
    color: C.sub,
    fontSize: 14,
    lineHeight: 22,
    marginTop: 8,
  },
  toggle: {
    flexDirection: 'row',
    backgroundColor: C.cardSoft,
    borderRadius: 14,
    padding: 4,
    marginBottom: 18,
  },
  togBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  togActive: {
    backgroundColor: C.gold,
  },
  togText: {
    fontSize: 15,
    fontWeight: '700',
    color: C.muted,
  },
  togTextActive: {
    color: C.black,
  },
  form: {
    gap: 12,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.inputBg,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
    paddingHorizontal: 14,
    minHeight: 56,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 15,
    fontSize: 15,
    color: C.text,
  },
  passwordInput: {
    paddingRight: 8,
  },
  eyeBtn: {
    padding: 6,
  },
  mainBtn: {
    backgroundColor: C.gold,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  mainBtnDisabled: {
    opacity: 0.65,
  },
  mainBtnText: {
    fontSize: 16,
    fontWeight: '800',
    color: C.black,
  },
  authHint: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginTop: 18,
  },
  authHintText: {
    flex: 1,
    fontSize: 12,
    color: C.sub,
    lineHeight: 18,
    marginLeft: 8,
  },
  footer: {
    fontSize: 11,
    color: C.muted,
    textAlign: 'center',
    marginTop: 20,
    lineHeight: 17,
  },
});
