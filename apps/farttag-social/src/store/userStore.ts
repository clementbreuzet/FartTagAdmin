import { create } from 'zustand';

type UserResourcesState = {
  currentXp: number;
  flatulons: number;
  gems: number;
  level: number;
  requiredXp: number;
};

export const useUserStore = create<UserResourcesState>(() => ({
  currentXp: 1,
  flatulons: 545,
  gems: 114,
  level: 3,
  requiredXp: 100,
}));
