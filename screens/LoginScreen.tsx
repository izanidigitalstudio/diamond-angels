import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Platform, StatusBar,
  TextInput, ActivityIndicator, Alert, KeyboardAvoidingView, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthActions } from '@convex-dev/auth/react';
import { a0 } from 'a0-sdk';
import { Ionicons } from '@expo/vector-icons';

const C = {
  bg: '#0A0A0F', card: '#141420', gold: '#C9A84C',
  text: '#FFFFFF', sub: '#9CA3AF', muted: '#6B7280',
  border: '#2D2D3D', inputBg: '#1A1A2E', black: '#111118',
};

export default function LoginScreen({ onEnterDemo }: { onEnterDemo: () => void }) {
  const { signIn } = useAuthActions();
  const [isSignUp, setIsSignUp] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

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
      await signIn('password', {
        email: email.trim().toLowerCase(),
        password,
        name: isSignUp ? name.trim() : undefined,
        flow: isSignUp ? 'signUp' : 'signIn',
      });
    } catch (e: any) {
      // If sign-up fails because account exists, auto-retry as sign-in
      if (isSignUp && e?.message?.toLowerCase().includes('already exists')) {
        try {
          await signIn('password', {
            email: email.trim().toLowerCase(),
            password,
            flow: 'signIn',
          });
          setIsSignUp(false);
          return;
        } catch (retryError: any) {
          Alert.alert('Sign In Failed', retryError?.message || 'Account exists but sign-in failed. Check your password.');
          return;
        }
      }
      Alert.alert(isSignUp ? 'Sign Up Failed' : 'Sign In Failed', e?.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    try { await a0.auth.signInWithGoogle(); } catch (e: any) {
      if (!e.message?.includes('cancel')) Alert.alert('Error', 'Google sign-in unavailable in web preview. Use email/password or try on device.');
    }
  };

  return (
    <View style={st.container}>
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView contentContainerStyle={st.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            {/* Logo */}
            <View style={st.logoBox}>
              <View style={st.icon}>
                <Ionicons name="diamond" size={40} color={C.gold} />
              </View>
              <Text style={st.appName}>Diamond Angels</Text>
              <Text style={st.tag}>South Africa's Premier Female Talent Agency</Text>
            </View>

            {/* Toggle */}
            <View style={st.toggle}>
              <TouchableOpacity style={[st.togBtn, isSignUp && st.togActive]} onPress={() => setIsSignUp(true)}>
                <Text style={[st.togText, isSignUp && st.togTextActive]}>Sign Up</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[st.togBtn, !isSignUp && st.togActive]} onPress={() => setIsSignUp(false)}>
                <Text style={[st.togText, !isSignUp && st.togTextActive]}>Sign In</Text>
              </TouchableOpacity>
            </View>

            {/* Form */}
            <View style={{ gap: 12 }}>
              {isSignUp && (
                <View style={st.inputRow}>
                  <Ionicons name="person-outline" size={18} color={C.muted} style={{ marginRight: 10 }} />
                  <TextInput style={st.input} placeholder="Full Name" placeholderTextColor={C.muted} value={name} onChangeText={setName} autoCapitalize="words" />
                </View>
              )}
              <View style={st.inputRow}>
                <Ionicons name="mail-outline" size={18} color={C.muted} style={{ marginRight: 10 }} />
                <TextInput style={st.input} placeholder="Email Address" placeholderTextColor={C.muted} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" autoCorrect={false} />
              </View>
              <View style={st.inputRow}>
                <Ionicons name="lock-closed-outline" size={18} color={C.muted} style={{ marginRight: 10 }} />
                <TextInput style={[st.input, { flex: 1 }]} placeholder="Password" placeholderTextColor={C.muted} value={password} onChangeText={setPassword} secureTextEntry={!showPw} autoCapitalize="none" />
                <TouchableOpacity onPress={() => setShowPw(!showPw)} style={{ padding: 6 }}>
                  <Ionicons name={showPw ? 'eye-off-outline' : 'eye-outline'} size={20} color={C.muted} />
                </TouchableOpacity>
              </View>
              <TouchableOpacity style={[st.mainBtn, loading && { opacity: 0.6 }]} onPress={handleEmail} disabled={loading} activeOpacity={0.8}>
                {loading ? <ActivityIndicator color={C.black} /> : <Text style={st.mainBtnText}>{isSignUp ? 'Create Account' : 'Sign In'}</Text>}
              </TouchableOpacity>
            </View>

            {/* Divider */}
            <View style={st.divider}>
              <View style={st.line} /><Text style={st.or}>OR</Text><View style={st.line} />
            </View>

            {/* Google */}
            <TouchableOpacity style={st.googleBtn} onPress={handleGoogle} activeOpacity={0.8}>
              <Ionicons name="logo-google" size={18} color="#333" />
              <Text style={st.googleText}>Continue with Google</Text>
            </TouchableOpacity>

            {Platform.OS === 'ios' && (
              <TouchableOpacity style={st.appleBtn} onPress={() => a0.auth.signInWithApple().catch(() => {})} activeOpacity={0.8}>
                <Ionicons name="logo-apple" size={18} color="#FFF" />
                <Text style={st.appleText}>Continue with Apple</Text>
              </TouchableOpacity>
            )}

            {/* Demo Button */}
            <TouchableOpacity style={st.demoBtn} onPress={onEnterDemo} activeOpacity={0.7}>
              <Ionicons name="eye-outline" size={20} color={C.gold} />
              <View style={{ flex: 1 }}>
                <Text style={st.demoText}>Explore Demo</Text>
                <Text style={st.demoSub}>Preview the full app experience</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={C.gold} />
            </TouchableOpacity>

            <Text style={st.footer}>By continuing, you agree to our Terms of Service & Privacy Policy</Text>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const st = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  scroll: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 28, paddingVertical: 24 },
  logoBox: { alignItems: 'center', marginBottom: 28 },
  icon: { width: 68, height: 68, borderRadius: 34, backgroundColor: 'rgba(201,168,76,0.12)', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  appName: { fontSize: 28, fontWeight: '800', color: C.gold, letterSpacing: 2 },
  tag: { fontSize: 13, color: C.sub, marginTop: 4 },
  toggle: { flexDirection: 'row', backgroundColor: C.card, borderRadius: 12, padding: 4, marginBottom: 18 },
  togBtn: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
  togActive: { backgroundColor: C.gold },
  togText: { fontSize: 15, fontWeight: '600', color: C.muted },
  togTextActive: { color: C.black },
  inputRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.inputBg, borderRadius: 12, borderWidth: 1, borderColor: C.border, paddingHorizontal: 14 },
  input: { flex: 1, paddingVertical: 14, fontSize: 15, color: C.text },
  mainBtn: { backgroundColor: C.gold, paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginTop: 4 },
  mainBtnText: { fontSize: 16, fontWeight: '700', color: C.black },
  divider: { flexDirection: 'row', alignItems: 'center', gap: 12, marginVertical: 18 },
  line: { flex: 1, height: 1, backgroundColor: C.border },
  or: { fontSize: 12, fontWeight: '600', color: C.muted },
  googleBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFF', paddingVertical: 14, borderRadius: 12, gap: 10, marginBottom: 10 },
  googleText: { fontSize: 15, fontWeight: '600', color: '#333' },
  appleBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#000', paddingVertical: 14, borderRadius: 12, gap: 10, borderWidth: 1, borderColor: '#333', marginBottom: 10 },
  appleText: { fontSize: 15, fontWeight: '600', color: '#FFF' },
  demoBtn: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14, paddingHorizontal: 16, borderRadius: 12, borderWidth: 1.5, borderColor: C.gold, backgroundColor: 'rgba(201,168,76,0.06)', marginTop: 6 },
  demoText: { fontSize: 15, fontWeight: '600', color: C.gold },
  demoSub: { fontSize: 11, color: C.sub, marginTop: 1 },
  footer: { fontSize: 11, color: C.muted, textAlign: 'center', marginTop: 20, lineHeight: 16 },
});