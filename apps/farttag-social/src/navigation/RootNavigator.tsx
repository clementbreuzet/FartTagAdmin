import React from 'react';
import { DarkTheme, NavigationContainer, type Theme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { BadgesScreen } from '../screens/BadgesScreen';
import { DetectionScreen } from '../screens/DetectionScreen';
import { FartDetailsScreen } from '../screens/FartDetailsScreen';
import { FartHistoryScreen } from '../screens/FartHistoryScreen';
import { HomeFeedScreen } from '../screens/HomeFeedScreen';
import { InventoryScreen } from '../screens/InventoryScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { colors } from '../theme/colors';
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
    <Stack.Navigator initialRouteName="DetectionScreen" screenOptions={{ headerShown: false }}>
      <Stack.Screen component={DetectionScreen} name="DetectionScreen" />
      <Stack.Screen component={ProfileScreen} name="ProfileScreen" />
      <Stack.Screen component={InventoryScreen} name="InventoryScreen" />
      <Stack.Screen component={BadgesScreen} name="BadgesScreen" />
      <Stack.Screen component={FartHistoryScreen} name="FartHistoryScreen" />
      <Stack.Screen component={FartDetailsScreen} name="FartDetailsScreen" />
      <Stack.Screen component={HomeFeedScreen} name="HomeFeedScreen" />
    </Stack.Navigator>
  </NavigationContainer>
);
