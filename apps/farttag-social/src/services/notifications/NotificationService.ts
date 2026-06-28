import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { apiRequest } from '../../api/apiClient';
import { apiEndpoints } from '../../api/apiEndpoints';

const ANDROID_NOTIFICATION_CHANNEL = 'fartsocial-v2';

export type NotificationPermissionStatus = 'denied' | 'granted' | 'undetermined';

export type NotificationPreferences = {
  challengesEnabled: boolean;
  dailyReminderEnabled: boolean;
  rewardsEnabled: boolean;
  socialEnabled: boolean;
};

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

const ensureAndroidChannel = async () => {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync(ANDROID_NOTIFICATION_CHANNEL, {
    importance: Notifications.AndroidImportance.HIGH,
    name: 'FartSocial',
    vibrationPattern: [0, 250, 150, 250],
  });
};

export const requestNotificationPermissions = async (): Promise<NotificationPermissionStatus> => {
  await ensureAndroidChannel();
  const current = await Notifications.getPermissionsAsync();
  const result = current.status === 'granted'
    ? current
    : await Notifications.requestPermissionsAsync();
  if (__DEV__) {
    console.log('[notifications] Permission status:', result.status);
  }
  return result.status;
};

export const getExpoPushToken = async (): Promise<string> => {
  if (__DEV__) {
    console.log('[notifications] Getting Expo push token', {
      isDevice: Device.isDevice,
      platform: Platform.OS,
    });
  }
  if (!Device.isDevice) {
    throw new Error('Le token push Expo nécessite un appareil physique.');
  }
  const projectId =
    Constants.expoConfig?.extra?.eas?.projectId ??
    Constants.easConfig?.projectId;
  if (!projectId) {
    // TODO: Configure extra.eas.projectId after linking the project with EAS.
    throw new Error("Le projectId EAS n'est pas configuré.");
  }
  if (__DEV__) {
    console.log('[notifications] Using EAS projectId:', projectId);
  }
  const token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
  if (__DEV__) {
    console.log('[notifications] Expo push token:', token);
  }
  return token;
};

export const registerPushTokenWithBackend = async (token: string) => {
  if (__DEV__) {
    console.log('[notifications] Register push token', {
      deviceName: Device.deviceName ?? null,
      platform: Platform.OS,
      tokenPrefix: token.slice(0, 24),
    });
  }
  await apiRequest<void>(apiEndpoints.notifications.registerToken, {
    body: JSON.stringify({
      deviceName: Device.deviceName ?? undefined,
      platform: Platform.OS,
      token,
    }),
    method: 'POST',
  });
  if (__DEV__) {
    console.log('[notifications] Backend token registration succeeded');
  }
};

export const unregisterPushTokenWithBackend = (token: string) =>
  apiRequest<void>(apiEndpoints.notifications.registerToken, {
    body: JSON.stringify({ token }),
    method: 'DELETE',
  });

export const getNotificationPreferences = () =>
  apiRequest<NotificationPreferences>(apiEndpoints.notifications.preferences);

export const updateNotificationPreferences = (preferences: NotificationPreferences) =>
  apiRequest<NotificationPreferences>(apiEndpoints.notifications.preferences, {
    body: JSON.stringify(preferences),
    method: 'PUT',
  });

export const scheduleLocalNotification = async (
  title: string,
  body: string,
  data?: Record<string, string | number | boolean>,
) => {
  await ensureAndroidChannel();
  return Notifications.scheduleNotificationAsync({
    content: { body, data, sound: true, title },
    trigger: null,
  });
};

export const showFartDetectedNotification = (score: number, flatulons: number) =>
  scheduleLocalNotification('Pet authentifié 💨', `Score ${score} · +${flatulons} Flatulons`, {
    type: 'fart-detected',
  });

export const showRewardNotification = (rewardName: string) =>
  scheduleLocalNotification('Badge débloqué', `${rewardName} obtenu`, { type: 'reward' });

export const showLootBoxNotification = (itemName: string, rarity: string) =>
  scheduleLocalNotification('Objet rare obtenu', `${itemName} · ${rarity}`, { type: 'loot-box' });

export const NotificationService = {
  getExpoPushToken,
  getNotificationPreferences,
  registerPushTokenWithBackend,
  requestNotificationPermissions,
  scheduleLocalNotification,
  showFartDetectedNotification,
  showLootBoxNotification,
  showRewardNotification,
  unregisterPushTokenWithBackend,
  updateNotificationPreferences,
};
