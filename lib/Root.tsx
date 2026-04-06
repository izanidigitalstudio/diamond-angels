import React from 'react';
import { Platform } from 'react-native';
import { ConvexAuthProvider } from '@convex-dev/auth/react';
import { ConvexReactClient } from 'convex/react';
import App from '../App';

const CONVEX_URL =
  process.env.EXPO_PUBLIC_CONVEX_URL?.trim() || 'https://usable-zebra-858.convex.cloud';

const convex = new ConvexReactClient(CONVEX_URL);

const memoryStorage = {
  _map: new Map<string, string>(),
  getItem(key: string) {
    return this._map.get(key) ?? null;
  },
  setItem(key: string, value: string) {
    this._map.set(key, value);
  },
  removeItem(key: string) {
    this._map.delete(key);
  },
};

export default function Root() {
  return (
    <ConvexAuthProvider
      client={convex}
      storage={Platform.OS === 'web' ? undefined : memoryStorage}
    >
      <App />
    </ConvexAuthProvider>
  );
}
