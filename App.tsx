// REBUNDLE_1774500388
import React from 'react';
import {
  View, Text, StyleSheet, ActivityIndicator, StatusBar,
} from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { Authenticated, Unauthenticated, AuthLoading } from 'convex/react';
import LoginScreen from './screens/LoginScreen';

// DO NOT import convex/_generated/api or any screens that use it here.
// Those are loaded lazily inside AuthenticatedWrapper to avoid
// breaking the entire app if convex/server has a transient failure.

function AuthenticatedWrapper() {
  try {
    const AuthApp = require('./screens/AuthenticatedApp').default;
    return <AuthApp />;
  } catch (e) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#C9A84C" />
        <Text style={styles.loadingText}>Loading app...</Text>
      </View>
    );
  }
}

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar barStyle="light-content" />
        <>
          <AuthLoading>
            <View style={styles.loading}>
              <ActivityIndicator size="large" color="#C9A84C" />
              <Text style={styles.loadingText}>Loading...</Text>
            </View>
          </AuthLoading>
          <Unauthenticated>
            <LoginScreen />
          </Unauthenticated>
          <Authenticated>
            <AuthenticatedWrapper />
          </Authenticated>
        </>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0A0A0F',
  },
  loadingText: {
    marginTop: 12,
    color: '#9CA3AF',
    fontSize: 14,
  },
});
