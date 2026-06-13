import React from 'react';
import { StatusBar } from 'react-native';
import { initialWindowMetrics, SafeAreaProvider } from 'react-native-safe-area-context';

import { RootNavigator } from './src/navigation/RootNavigator';
import { appTheme } from './src/theme/theme';

export default function App() {
  return (
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
      <StatusBar backgroundColor={appTheme.navigation.background} barStyle="light-content" />
      <RootNavigator />
    </SafeAreaProvider>
  );
}
