import React, { useEffect } from 'react';
import { Alert, StatusBar } from 'react-native';
import {
  initialWindowMetrics,
  SafeAreaProvider,
} from 'react-native-safe-area-context';

import { I18nProvider } from './src/i18n/I18nProvider';
import { RootNavigator } from './src/navigation/RootNavigator';
import { PhoneMicService } from './src/services/audio/PhoneMicService';
import { colors } from './src/theme/colors';

export default function App() {
  useEffect(() => {
    const requestMicrophonePermission = async () => {
      try {
        const granted = await PhoneMicService.requestPermission();

        if (!granted) {
          Alert.alert(
            'Permission microphone requise',
            'Autorisez le microphone dans les réglages du téléphone pour utiliser le mode téléphone.',
          );
        }
      } catch {
        Alert.alert(
          'Permission microphone indisponible',
          "L'application n'a pas pu demander l'autorisation du microphone.",
        );
      }
    };

    void requestMicrophonePermission();
  }, []);

  return (
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
      <I18nProvider>
        <StatusBar backgroundColor={colors.background} barStyle="light-content" />
        <RootNavigator />
      </I18nProvider>
    </SafeAreaProvider>
  );
}
