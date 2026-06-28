import { create } from 'zustand';

import { profileApi } from './profileApi';
import type { OfficialFartResult } from '../detection/types';
import { useUserStore } from '../../store/userStore';
import type { InventoryItem, UserProfile, Wallet } from './types';

type ProfileState = {
  error: string | null;
  hasLoaded: boolean;
  inventory: InventoryItem[];
  isLoading: boolean;
  isRefreshing: boolean;
  profile: UserProfile | null;
  wallet: Wallet | null;
  applyFartRewards: (rewards: OfficialFartResult) => void;
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
      useUserStore.getState().setResources({
        currentXp: profile.currentLevelXp,
        flatulons: profile.flatulons,
        gems: profile.gems,
        level: profile.level,
        requiredXp: profile.requiredLevelXp,
        totalXp: profile.totalXp,
      });
      set({ hasLoaded: true, inventory: [], profile, wallet: { flatulons: profile.flatulons ?? 0 } });
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
      useUserStore.getState().setResources({
        currentXp: profile.currentLevelXp,
        flatulons: profile.flatulons,
        gems: profile.gems,
        level: profile.level,
        requiredXp: profile.requiredLevelXp,
        totalXp: profile.totalXp,
      });
      set({ hasLoaded: true, inventory: [], profile, wallet: { flatulons: profile.flatulons ?? 0 } });
    } catch (error) {
      set({ error: getErrorMessage(error) });
    } finally {
      set({ isRefreshing: false });
    }
  },

  applyFartRewards: (rewards) => {
    useUserStore.getState().applyFartRewards(rewards);
    set((state) => ({
      profile: state.profile
        ? {
            ...state.profile,
            currentLevelXp: rewards.currentLevelXp,
            flatulons: rewards.newFlatulons,
            level: rewards.newLevel,
            levelProgressPercent: rewards.progressPercent,
            requiredLevelXp: rewards.requiredLevelXp,
            totalXp: rewards.totalXp,
            xp: rewards.totalXp,
          }
        : state.profile,
      wallet: {
        flatulons: rewards.newFlatulons,
      },
    }));
  },
}));
