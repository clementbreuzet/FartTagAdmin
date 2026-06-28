import { create } from 'zustand';

import { profileApi } from './profileApi';
import type { InventoryItem, UserProfile, Wallet } from './types';

type ProfileState = {
  error: string | null;
  hasLoaded: boolean;
  inventory: InventoryItem[];
  isLoading: boolean;
  isRefreshing: boolean;
  profile: UserProfile | null;
  wallet: Wallet | null;
  loadProfile: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : "Le profil n'a pas pu être chargé.";

export const useProfileStore = create<ProfileState>((set) => ({
  error: null,
  hasLoaded: false,
  inventory: [],
  isLoading: false,
  isRefreshing: false,
  profile: null,
  wallet: null,

  loadProfile: async () => {
    set({ error: null, isLoading: true });
    try {
      const profile = await profileApi.getProfile();
      set({ hasLoaded: true, inventory: [], profile, wallet: null });
    } catch (error) {
      set({ error: getErrorMessage(error), hasLoaded: true });
    } finally {
      set({ isLoading: false });
    }
  },

  refreshProfile: async () => {
    set({ error: null, isRefreshing: true });
    try {
      const profile = await profileApi.getProfile();
      set({ hasLoaded: true, inventory: [], profile, wallet: null });
    } catch (error) {
      set({ error: getErrorMessage(error) });
    } finally {
      set({ isRefreshing: false });
    }
  },
}));
