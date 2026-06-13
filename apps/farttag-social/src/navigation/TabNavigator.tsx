import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { TabIcon } from '../components/navigation/TabIcon';
import { BadgesScreen } from '../screens/badges/BadgesScreen';
import { DetectionScreen } from '../screens/detection/DetectionScreen';
import { FartDetailsScreen } from '../screens/history/FartDetailsScreen';
import { FartHistoryScreen } from '../screens/history/FartHistoryScreen';
import { FriendsScreen } from '../screens/friends/FriendsScreen';
import { HomeFeedScreen } from '../screens/home/HomeFeedScreen';
import { InventoryScreen } from '../screens/inventory/InventoryScreen';
import { LeaderboardScreen } from '../screens/leaderboard/LeaderboardScreen';
import { ProfileScreen } from '../screens/profile/ProfileScreen';
import { PublicUserProfileScreen } from '../screens/profile/PublicUserProfileScreen';
import { SettingsScreen } from '../screens/settings/SettingsScreen';
import { ShopScreen } from '../screens/shop/ShopScreen';
import { appTheme } from '../theme/theme';
import type {
  AppRouteParamList,
  RootTabParamList,
} from './types';

const Tab = createBottomTabNavigator<RootTabParamList>();
const HomeStack = createNativeStackNavigator<AppRouteParamList>();
const DetectionStack = createNativeStackNavigator<AppRouteParamList>();
const ShopStack = createNativeStackNavigator<AppRouteParamList>();
const SocialStack = createNativeStackNavigator<AppRouteParamList>();
const ProfileStack = createNativeStackNavigator<AppRouteParamList>();

const stackOptions = {
  headerShown: false,
  contentStyle: {
    backgroundColor: appTheme.navigation.background,
  },
};

const HomeNavigator = () => (
  <HomeStack.Navigator screenOptions={stackOptions}>
    <HomeStack.Screen component={HomeFeedScreen} name="HomeFeedScreen" />
    <HomeStack.Screen component={FartDetailsScreen} name="FartDetailsScreen" />
    <HomeStack.Screen component={PublicUserProfileScreen} name="PublicUserProfileScreen" />
  </HomeStack.Navigator>
);

const DetectionNavigator = () => (
  <DetectionStack.Navigator screenOptions={stackOptions}>
    <DetectionStack.Screen component={DetectionScreen} name="DetectionScreen" />
    <DetectionStack.Screen component={FartDetailsScreen} name="FartDetailsScreen" />
  </DetectionStack.Navigator>
);

const ShopNavigator = () => (
  <ShopStack.Navigator screenOptions={stackOptions}>
    <ShopStack.Screen component={ShopScreen} name="ShopScreen" />
  </ShopStack.Navigator>
);

const SocialNavigator = () => (
  <SocialStack.Navigator screenOptions={stackOptions}>
    <SocialStack.Screen component={LeaderboardScreen} name="LeaderboardScreen" />
    <SocialStack.Screen component={FriendsScreen} name="FriendsScreen" />
    <SocialStack.Screen component={PublicUserProfileScreen} name="PublicUserProfileScreen" />
  </SocialStack.Navigator>
);

const ProfileNavigator = () => (
  <ProfileStack.Navigator screenOptions={stackOptions}>
    <ProfileStack.Screen component={ProfileScreen} name="ProfileScreen" />
    <ProfileStack.Screen component={BadgesScreen} name="BadgesScreen" />
    <ProfileStack.Screen component={FartHistoryScreen} name="FartHistoryScreen" />
    <ProfileStack.Screen component={InventoryScreen} name="InventoryScreen" />
    <ProfileStack.Screen component={SettingsScreen} name="SettingsScreen" />
    <ProfileStack.Screen component={PublicUserProfileScreen} name="PublicUserProfileScreen" />
  </ProfileStack.Navigator>
);

export const TabNavigator = () => {
  const insets = useSafeAreaInsets();
  const bottomInset = Math.max(insets.bottom, 8);

  return (
    <Tab.Navigator
      initialRouteName="HomeTab"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: appTheme.colors.neonGreen,
        tabBarInactiveTintColor: appTheme.colors.textMuted,
        tabBarIcon: ({ color, focused }) => (
          <TabIcon
            color={color}
            focused={focused}
            name={route.name as keyof RootTabParamList}
          />
        ),
        tabBarLabelStyle: styles.tabLabel,
        tabBarStyle: [
          styles.tabBar,
          {
            height: 62 + bottomInset,
            paddingBottom: bottomInset,
          },
        ],
      })}
    >
      <Tab.Screen component={HomeNavigator} name="HomeTab" options={{ title: 'Home' }} />
      <Tab.Screen component={DetectionNavigator} name="DetectionTab" options={{ title: 'Detection' }} />
      <Tab.Screen component={ShopNavigator} name="ShopTab" options={{ title: 'Shop' }} />
      <Tab.Screen component={SocialNavigator} name="SocialTab" options={{ title: 'Social' }} />
      <Tab.Screen component={ProfileNavigator} name="ProfileTab" options={{ title: 'Profile' }} />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#05070A',
    borderTopColor: '#7CFF0030',
    borderTopWidth: StyleSheet.hairlineWidth,
    elevation: 0,
    shadowColor: '#7CFF00',
    shadowOpacity: 0.16,
    shadowRadius: 8,
  },
  tabLabel: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});

export default TabNavigator;
