import React from 'react';
import { DarkTheme, NavigationContainer, type Theme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { colors } from '../theme/colors';
import { TabNavigator } from './TabNavigator';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

const theme: Theme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: colors.background,
    border: colors.border,
    card: colors.surface,
    primary: colors.neonGreen,
    text: colors.textPrimary,
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
