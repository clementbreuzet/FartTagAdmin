import React, { useEffect } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppTopBar } from '../components/layout/AppTopBar';
import { TabIcon } from '../components/navigation/TabIcon';
import { useProfileStore } from '../features/profile/profileStore';
import { DetectionScreen } from '../screens/detection/DetectionScreen';
import { FartDetailsScreen } from '../screens/history/FartDetailsScreen';
import { HomeFeedScreen } from '../screens/home/HomeFeedScreen';
import { ProfileScreen } from '../screens/profile/ProfileScreen';
import { PublicUserProfileScreen } from '../screens/profile/PublicUserProfileScreen';
import { ShopScreen } from '../screens/shop/ShopScreen';
import { SocialScreen } from '../screens/social/SocialScreen';
import { useUserStore } from '../store/userStore';
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
    <SocialStack.Screen component={SocialScreen} name="SocialScreen" />
    <SocialStack.Screen component={PublicUserProfileScreen} name="PublicUserProfileScreen" />
  </SocialStack.Navigator>
);

const ProfileNavigator = () => (
  <ProfileStack.Navigator screenOptions={stackOptions}>
    <ProfileStack.Screen component={ProfileScreen} name="ProfileScreen" />
    <ProfileStack.Screen component={PublicUserProfileScreen} name="PublicUserProfileScreen" />
    <ProfileStack.Screen component={FartDetailsScreen} name="FartDetailsScreen" />
  </ProfileStack.Navigator>
);

export const TabNavigator = () => {
  const insets = useSafeAreaInsets();
  const bottomInset = Math.max(insets.bottom, 8);
  const fallbackCurrentXp = useUserStore((state) => state.currentXp);
  const fallbackFlatulons = useUserStore((state) => state.flatulons);
  const gems = useUserStore((state) => state.gems);
  const fallbackLevel = useUserStore((state) => state.level);
  const requiredXp = useUserStore((state) => state.requiredXp);
  const hasLoadedProfile = useProfileStore((state) => state.hasLoaded);
  const loadProfile = useProfileStore((state) => state.loadProfile);
  const profile = useProfileStore((state) => state.profile);
  const wallet = useProfileStore((state) => state.wallet);

  useEffect(() => {
    if (!hasLoadedProfile) {
      void loadProfile();
    }
  }, [hasLoadedProfile, loadProfile]);

  return (
    <Tab.Navigator
      initialRouteName="HomeTab"
      screenOptions={({ navigation, route }) => ({
        header: () => (
          <AppTopBar
            currentXp={profile?.levelProgressPercent ?? fallbackCurrentXp}
            flatulons={wallet?.flatulons ?? fallbackFlatulons}
            gems={gems}
            level={profile?.level ?? fallbackLevel}
            onOpenShop={() => navigation.navigate('ShopTab', { screen: 'ShopScreen' })}
            requiredXp={requiredXp}
          />
        ),
        headerShown: true,
        tabBarActiveTintColor: appTheme.colors.neonGreen,
        tabBarInactiveTintColor: appTheme.colors.textMuted,
        tabBarIcon: ({ focused }) => (
          <TabIcon
            focused={focused}
            name={route.name as keyof RootTabParamList}
          />
        ),
        tabBarShowLabel: false,
        tabBarStyle: [
          styles.tabBar,
          {
            height: 78 + bottomInset,
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
    paddingTop: 5,
    shadowColor: '#7CFF00',
    shadowOpacity: 0.16,
    shadowRadius: 8,
  },
});

export default TabNavigator;
