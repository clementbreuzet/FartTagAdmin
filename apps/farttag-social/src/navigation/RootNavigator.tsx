import React from 'react';
import { DarkTheme, NavigationContainer, type Theme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { appTheme } from '../theme/theme';
import { TabNavigator } from './TabNavigator';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

const theme: Theme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: appTheme.navigation.background,
    border: appTheme.navigation.border,
    card: appTheme.navigation.card,
    notification: appTheme.colors.neonCyan,
    primary: appTheme.colors.neonGreen,
    text: appTheme.navigation.text,
  },
};

export const RootNavigator = () => (
  <NavigationContainer theme={theme}>
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen component={TabNavigator} name="MainTabs" />
    </Stack.Navigator>
  </NavigationContainer>
);

export default RootNavigator;
