import type { NavigatorScreenParams } from '@react-navigation/native';

import type { LeaderboardBadgeRarity } from '../features/leaderboards/types';

export type PublicUserProfileRouteParams = {
  avatarUrl?: string | null;
  badgeRarity?: LeaderboardBadgeRarity | null;
  displayName?: string;
  title?: string | null;
  userId: string;
  username?: string;
};

export type AppRouteParamList = {
  BadgesScreen: undefined;
  DetectionScreen: undefined;
  FartDetailsScreen: { fartEventId: string };
  FartHistoryScreen: undefined;
  FriendsScreen: undefined;
  HomeFeedScreen: undefined;
  InventoryScreen: undefined;
  LeaderboardScreen: undefined;
  ProfileScreen: undefined;
  PublicUserProfileScreen: PublicUserProfileRouteParams;
  SettingsScreen: undefined;
  ShopScreen: undefined;
};

export type HomeStackParamList = {
  HomeFeedScreen: undefined;
  FartDetailsScreen: { fartEventId: string };
  PublicUserProfileScreen: PublicUserProfileRouteParams;
};

export type DetectionStackParamList = {
  DetectionScreen: undefined;
  FartDetailsScreen: { fartEventId: string };
};

export type HistoryStackParamList = {
  FartHistoryScreen: undefined;
  FartDetailsScreen: { fartEventId: string };
};

export type SocialStackParamList = {
  FriendsScreen: undefined;
  LeaderboardScreen: undefined;
  PublicUserProfileScreen: PublicUserProfileRouteParams;
};

export type ProfileStackParamList = {
  BadgesScreen: undefined;
  InventoryScreen: undefined;
  FartHistoryScreen: undefined;
  ProfileScreen: undefined;
  PublicUserProfileScreen: PublicUserProfileRouteParams;
  SettingsScreen: undefined;
};

export type RootTabParamList = {
  HomeTab: NavigatorScreenParams<HomeStackParamList>;
  DetectionTab: NavigatorScreenParams<DetectionStackParamList>;
  ShopTab: NavigatorScreenParams<{ ShopScreen: undefined }>;
  SocialTab: NavigatorScreenParams<SocialStackParamList>;
  ProfileTab: NavigatorScreenParams<ProfileStackParamList>;
};

export type RootNavigatorParamList = RootTabParamList;
export type RootStackParamList = AppRouteParamList & {
  MainTabs: NavigatorScreenParams<RootTabParamList>;
};
