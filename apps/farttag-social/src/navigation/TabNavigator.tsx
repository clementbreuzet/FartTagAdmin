import React, { useEffect } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppTopBar } from '../components/layout/AppTopBar';
import { useBackendConnectionStore } from '../api/backendConnectionStore';
import { useBackendConnectionMonitor } from '../api/useBackendConnectionMonitor';
import { FartRewardsOverlay } from '../components/layout/FartRewardsOverlay';
import { TabIcon } from '../components/navigation/TabIcon';
import { useDetectionStore } from '../features/detection/detectionStore';
import { useProfileStore } from '../features/profile/profileStore';
import { DetectionScreen } from '../screens/detection/DetectionScreen';
import { FartDetailsScreen } from '../screens/history/FartDetailsScreen';
import { HomeFeedScreen } from '../screens/home/HomeFeedScreen';
import { ProfileScreen } from '../screens/profile/ProfileScreen';
import { PublicUserProfileScreen } from '../screens/profile/PublicUserProfileScreen';
import { ShopScreen } from '../screens/shop/ShopScreen';
import { SocialScreen } from '../screens/social/SocialScreen';
import { useUserStore } from '../store/userStore';
import { t, useLanguageStore } from '../i18n/translations';
import { appTheme } from '../theme/theme';
import { routeNames } from './routeNames';
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
    <HomeStack.Screen component={HomeFeedScreen} name={routeNames.home} />
    <HomeStack.Screen component={FartDetailsScreen} name={routeNames.fartDetails} />
    <HomeStack.Screen component={PublicUserProfileScreen} name={routeNames.publicUserProfile} />
  </HomeStack.Navigator>
);

const DetectionNavigator = () => (
  <DetectionStack.Navigator screenOptions={stackOptions}>
    <DetectionStack.Screen component={DetectionScreen} name={routeNames.detection} />
    <DetectionStack.Screen component={FartDetailsScreen} name={routeNames.fartDetails} />
  </DetectionStack.Navigator>
);

const ShopNavigator = () => (
  <ShopStack.Navigator screenOptions={stackOptions}>
    <ShopStack.Screen component={ShopScreen} name={routeNames.shop} />
  </ShopStack.Navigator>
);

const SocialNavigator = () => (
  <SocialStack.Navigator screenOptions={stackOptions}>
    <SocialStack.Screen component={SocialScreen} name={routeNames.social} />
    <SocialStack.Screen component={PublicUserProfileScreen} name={routeNames.publicUserProfile} />
  </SocialStack.Navigator>
);

const ProfileNavigator = () => (
  <ProfileStack.Navigator screenOptions={stackOptions}>
    <ProfileStack.Screen component={ProfileScreen} name={routeNames.profile} />
    <ProfileStack.Screen component={PublicUserProfileScreen} name={routeNames.publicUserProfile} />
    <ProfileStack.Screen component={FartDetailsScreen} name={routeNames.fartDetails} />
  </ProfileStack.Navigator>
);

export const TabNavigator = () => {
  useBackendConnectionMonitor();
  const insets = useSafeAreaInsets();
  const bottomInset = Math.max(insets.bottom, 8);
  const fallbackCurrentXp = useUserStore((state) => state.currentXp);
  const fallbackFlatulons = useUserStore((state) => state.flatulons);
  const fallbackGems = useUserStore((state) => state.gems);
  const fallbackLevel = useUserStore((state) => state.level);
  const fallbackRequiredXp = useUserStore((state) => state.requiredXp);
  const hasLoadedProfile = useProfileStore((state) => state.hasLoaded);
  const loadProfile = useProfileStore((state) => state.loadProfile);
  const profile = useProfileStore((state) => state.profile);
  const wallet = useProfileStore((state) => state.wallet);
  const backendStatus = useBackendConnectionStore((state) => state.status);
  const officialResult = useDetectionStore((state) => state.officialResult);
  useLanguageStore((state) => state.locale);

  useEffect(() => {
    if (!hasLoadedProfile) {
      void loadProfile();
    }
  }, [hasLoadedProfile, loadProfile]);

  return (
    <View style={styles.root}>
      <Tab.Navigator
        initialRouteName={routeNames.homeTab}
        screenOptions={({ navigation, route }) => ({
          header: () => (
            <AppTopBar
              backendStatus={backendStatus}
              currentXp={profile?.currentLevelXp ?? fallbackCurrentXp}
              flatulons={wallet?.flatulons ?? fallbackFlatulons}
              gems={profile?.gems ?? fallbackGems}
              level={profile?.level ?? fallbackLevel}
              onOpenShop={() => navigation.navigate(routeNames.shopTab, { screen: routeNames.shop })}
              requiredXp={profile?.requiredLevelXp ?? fallbackRequiredXp}
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
        <Tab.Screen component={HomeNavigator} name={routeNames.homeTab} options={{ title: t('nav.home') }} />
        <Tab.Screen component={DetectionNavigator} name={routeNames.detectionTab} options={{ title: t('nav.detection') }} />
        <Tab.Screen component={ShopNavigator} name={routeNames.shopTab} options={{ title: t('nav.shop') }} />
        <Tab.Screen component={SocialNavigator} name={routeNames.socialTab} options={{ title: t('nav.social') }} />
        <Tab.Screen component={ProfileNavigator} name={routeNames.profileTab} options={{ title: t('nav.profile') }} />
      </Tab.Navigator>
      <FartRewardsOverlay result={officialResult} />
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
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
