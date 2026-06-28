import { create } from 'zustand';

import { homeApi } from './homeApi';
import type { HomeDashboard } from './types';

type HomeState = {
  dashboard: HomeDashboard | null;
  error: string | null;
  hasLoaded: boolean;
  isLoading: boolean;
  isRefreshing: boolean;
  loadHome: () => Promise<void>;
  refreshHome: () => Promise<void>;
};

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : "L'accueil n'a pas pu etre charge.";

export const useHomeStore = create<HomeState>((set) => ({
  dashboard: null,
  error: null,
  hasLoaded: false,
  isLoading: false,
  isRefreshing: false,

  loadHome: async () => {
    set({ error: null, isLoading: true });
    try {
      set({ dashboard: await homeApi.getHome(), hasLoaded: true });
    } catch (error) {
      set({ error: getErrorMessage(error), hasLoaded: true });
    } finally {
      set({ isLoading: false });
    }
  },

  refreshHome: async () => {
    set({ error: null, isRefreshing: true });
    try {
      set({ dashboard: await homeApi.getHome(), hasLoaded: true });
    } catch (error) {
      set({ error: getErrorMessage(error) });
    } finally {
      set({ isRefreshing: false });
    }
  },
}));
