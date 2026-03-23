import React from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import DemoApp from './screens/DemoApp';

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar barStyle="light-content" />
        <DemoApp onExit={() => {}} />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
