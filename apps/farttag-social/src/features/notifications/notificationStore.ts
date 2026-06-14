import { create } from 'zustand';

import {
  NotificationService,
  type NotificationPermissionStatus,
  type NotificationPreferences,
} from '../../services/notifications/NotificationService';

type NotificationState = {
  error: string | null;
  expoPushToken: string | null;
  isRegistering: boolean;
  permissionStatus: NotificationPermissionStatus;
  preferences: NotificationPreferences;
  initializeNotifications: () => Promise<void>;
  registerToken: () => Promise<void>;
  sendLocalTestNotification: () => Promise<void>;
  updatePreference: (key: keyof NotificationPreferences, enabled: boolean) => Promise<void>;
};

const defaultPreferences: NotificationPreferences = {
  challengesEnabled: true,
  dailyReminderEnabled: true,
  rewardsEnabled: true,
  socialEnabled: true,
};

const messageFor = (error: unknown) =>
  error instanceof Error ? error.message : "Les notifications n'ont pas pu être configurées.";

export const useNotificationStore = create<NotificationState>((set, get) => ({
  error: null,
  expoPushToken: null,
  isRegistering: false,
  permissionStatus: 'undetermined',
  preferences: defaultPreferences,

  initializeNotifications: async () => {
    console.log('[notifications-store] Initialization started');
    set({ error: null });
    try {
      const permissionStatus = await NotificationService.requestNotificationPermissions();
      set({ permissionStatus });
      if (permissionStatus === 'granted') {
        console.log('[notifications-store] Permission granted, registering token');
        await get().registerToken();
      } else {
        console.log('[notifications-store] Token registration skipped:', permissionStatus);
      }
    } catch (error) {
      const message = messageFor(error);
      console.error('[notifications-store] Initialization failed:', error);
      set({ error: message });
    }

    try {
      console.log('[notifications-store] Loading preferences');
      const preferences = await NotificationService.getNotificationPreferences();
      console.log('[notifications-store] Preferences loaded:', preferences);
      set({ preferences });
    } catch (error) {
      const message = messageFor(error);
      console.error('[notifications-store] Preferences loading failed:', error);
      set({ error: message });
    }
  },

  registerToken: async () => {
    console.log('[notifications-store] Token registration started');
    set({ error: null, isRegistering: true });
    try {
      const permissionStatus = await NotificationService.requestNotificationPermissions();
      set({ permissionStatus });
      if (permissionStatus !== 'granted') {
        console.log('[notifications-store] Token registration stopped:', permissionStatus);
        return;
      }
      console.log('[notifications-store] Requesting Expo push token');
      const expoPushToken = await NotificationService.getExpoPushToken();
      console.log('[notifications-store] Registering token with backend');
      await NotificationService.registerPushTokenWithBackend(expoPushToken);
      console.log('[notifications-store] Token registered with backend');
      set({ expoPushToken });
    } catch (error) {
      const message = messageFor(error);
      console.error('[notifications-store] Token registration failed:', error);
      set({ error: message });
    } finally {
      set({ isRegistering: false });
      console.log('[notifications-store] Token registration finished');
    }
  },

  sendLocalTestNotification: async () => {
    try {
      await NotificationService.scheduleLocalNotification(
        'FartSocial est prêt',
        'Les notifications locales fonctionnent correctement.',
        { type: 'test' },
      );
    } catch (error) {
      set({ error: messageFor(error) });
    }
  },

  updatePreference: async (key, enabled) => {
    const previous = get().preferences;
    const preferences = { ...previous, [key]: enabled };
    set({ error: null, preferences });
    try {
      set({ preferences: await NotificationService.updateNotificationPreferences(preferences) });
    } catch (error) {
      set({ error: messageFor(error), preferences: previous });
    }
  },
}));
