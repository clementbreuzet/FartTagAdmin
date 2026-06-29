import { create } from 'zustand';

import type { OfficialFartResult } from '../features/detection/types';

type UserResourcesState = {
  currentXp: number;
  flatulons: number;
  gems: number;
  level: number;
  requiredXp: number;
  totalXp: number;
  applyFartRewards: (rewards: OfficialFartResult) => void;
  setResources: (resources: {
    currentXp?: number;
    flatulons?: number;
    gems?: number;
    level?: number;
    requiredXp?: number;
    totalXp?: number;
  }) => void;
};

export const useUserStore = create<UserResourcesState>((set) => ({
  currentXp: 0,
  flatulons: 0,
  gems: 0,
  level: 1,
  requiredXp: 100,
  totalXp: 0,
  applyFartRewards: (rewards) => set({
    currentXp: rewards.currentLevelXp,
    flatulons: rewards.newFlatulons,
    level: rewards.newLevel,
    requiredXp: rewards.requiredLevelXp,
    totalXp: rewards.totalXp,
  }),
  setResources: (resources) => set((state) => ({
    currentXp: resources.currentXp ?? state.currentXp,
    flatulons: resources.flatulons ?? state.flatulons,
    gems: resources.gems ?? state.gems,
    level: resources.level ?? state.level,
    requiredXp: resources.requiredXp ?? state.requiredXp,
    totalXp: resources.totalXp ?? state.totalXp,
  })),
}));
