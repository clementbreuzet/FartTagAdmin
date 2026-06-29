import { create } from 'zustand';

import { apiConfig } from '../config/apiConfig';

declare const process: {
  env: {
    EXPO_PUBLIC_API_URL?: string;
  };
};

const getHealthUrl = () => `${process.env.EXPO_PUBLIC_API_URL ?? apiConfig.defaultApiUrl}/health`;

export type BackendConnectionStatus = 'checking' | 'offline' | 'online' | 'unknown';

type BackendConnectionState = {
  checkedAt: string | null;
  errorMessage: string | null;
  lastOfflineAt: string | null;
  lastOnlineAt: string | null;
  status: BackendConnectionStatus;
  markChecking: () => void;
  markOffline: (error?: unknown) => void;
  markOnline: () => void;
};

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : 'Backend indisponible.';

export const useBackendConnectionStore = create<BackendConnectionState>((set) => ({
  checkedAt: null,
  errorMessage: null,
  lastOfflineAt: null,
  lastOnlineAt: null,
  status: 'unknown',
  markChecking: () => set((state) => ({
    status: state.status === 'online' ? 'online' : 'checking',
  })),
  markOffline: (error) => set({
    checkedAt: new Date().toISOString(),
    errorMessage: getErrorMessage(error),
    lastOfflineAt: new Date().toISOString(),
    status: 'offline',
  }),
  markOnline: () => set({
    checkedAt: new Date().toISOString(),
    errorMessage: null,
    lastOnlineAt: new Date().toISOString(),
    status: 'online',
  }),
}));

export const pingBackend = async () => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);

  try {
    const response = await fetch(getHealthUrl(), {
      headers: {
        Accept: 'application/json',
      },
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`Backend health check failed with ${response.status}.`);
    }
  } finally {
    clearTimeout(timeoutId);
  }
};
