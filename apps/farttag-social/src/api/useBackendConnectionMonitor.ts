import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';

import { useProfileStore } from '../features/profile/profileStore';
import { pingBackend, useBackendConnectionStore } from './backendConnectionStore';

const onlinePollingMs = 15000;
const offlinePollingMs = 3000;

export const useBackendConnectionMonitor = () => {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const wasOfflineRef = useRef(false);

  useEffect(() => {
    let mounted = true;

    const clearMonitor = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };

    const refreshProfileAfterReconnect = async () => {
      const profileStore = useProfileStore.getState();
      if (profileStore.hasLoaded) {
        await profileStore.refreshProfile();
        return;
      }

      await profileStore.loadProfile();
    };

    const scheduleNextCheck = (delayMs: number) => {
      clearMonitor();
      intervalRef.current = setInterval(() => {
        void checkBackend();
      }, delayMs);
    };

    const checkBackend = async () => {
      useBackendConnectionStore.getState().markChecking();

      try {
        await pingBackend();
        const previousStatus = useBackendConnectionStore.getState().status;
        useBackendConnectionStore.getState().markOnline();

        if (mounted && (previousStatus === 'offline' || wasOfflineRef.current)) {
          wasOfflineRef.current = false;
          await refreshProfileAfterReconnect();
        }

        scheduleNextCheck(onlinePollingMs);
      } catch (error) {
        wasOfflineRef.current = true;
        useBackendConnectionStore.getState().markOffline(error);
        scheduleNextCheck(offlinePollingMs);
      }
    };

    void checkBackend();

    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        void checkBackend();
      }
    });

    return () => {
      mounted = false;
      clearMonitor();
      subscription.remove();
    };
  }, []);
};
