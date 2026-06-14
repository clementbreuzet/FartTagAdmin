import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StatusBar, StyleSheet, Text, View } from 'react-native';
import { initialWindowMetrics, SafeAreaProvider } from 'react-native-safe-area-context';

import { initializeDevelopmentAuth } from './src/api/developmentAuth';
import { RootNavigator } from './src/navigation/RootNavigator';
import { colors } from './src/theme/colors';
import { appTheme } from './src/theme/theme';

export default function App() {
  const [authError, setAuthError] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    void initializeDevelopmentAuth()
      .catch((error: unknown) => {
        setAuthError(error instanceof Error ? error.message : "L'authentification de développement a échoué.");
      })
      .finally(() => setIsReady(true));
  }, []);

  return (
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
      <StatusBar backgroundColor={appTheme.navigation.background} barStyle="light-content" />
      {isReady ? (
        <>
          <RootNavigator />
          {authError ? <Text style={styles.authError}>{authError}</Text> : null}
        </>
      ) : (
        <View style={styles.loading}>
          <ActivityIndicator color={colors.neonGreen} size="large" />
          <Text style={styles.loadingText}>Connexion au backend...</Text>
        </View>
      )}
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  authError: {
    backgroundColor: colors.danger,
    bottom: 0,
    color: colors.textPrimary,
    fontSize: 10,
    left: 0,
    padding: 8,
    position: 'absolute',
    right: 0,
    textAlign: 'center',
  },
  loading: {
    alignItems: 'center',
    backgroundColor: colors.background,
    flex: 1,
    gap: 12,
    justifyContent: 'center',
  },
  loadingText: { color: colors.textSecondary, fontSize: 11 },
});
