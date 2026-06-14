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
  DetectionScreen: undefined;
  FartDetailsScreen: { fartEventId: string };
  HomeFeedScreen: undefined;
  ProfileScreen: undefined;
  PublicUserProfileScreen: PublicUserProfileRouteParams;
  ShopScreen: undefined;
  SocialScreen: undefined;
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

export type SocialStackParamList = {
  PublicUserProfileScreen: PublicUserProfileRouteParams;
  SocialScreen: undefined;
};

export type ProfileStackParamList = {
  FartDetailsScreen: { fartEventId: string };
  ProfileScreen: undefined;
  PublicUserProfileScreen: PublicUserProfileRouteParams;
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
