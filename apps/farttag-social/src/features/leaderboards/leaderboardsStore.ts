import { create } from 'zustand';

import { leaderboardsApi } from './leaderboardsApi';
import type { LeaderboardEntry, LeaderboardMode } from './types';

type LeaderboardsState = {
  activeMode: LeaderboardMode;
  error: string | null;
  friends: LeaderboardEntry[];
  global: LeaderboardEntry[];
  hasLoaded: boolean;
  isLoading: boolean;
  isRefreshing: boolean;
  longest: LeaderboardEntry[];
  mostToxic: LeaderboardEntry[];
  setMode: (mode: LeaderboardMode) => void;
  week: LeaderboardEntry[];
  loadLeaderboards: (rankingScope?: string) => Promise<void>;
  refreshLeaderboards: (rankingScope?: string) => Promise<void>;
};

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : 'Les classements ne peuvent pas etre charges.';

const sortByScore = (entries: LeaderboardEntry[]) =>
  [...entries].sort((left, right) => right.officialScore - left.officialScore);

const sortByLegendary = (entries: LeaderboardEntry[]) =>
  [...entries].sort((left, right) => Number(Boolean(right.isLegendary)) - Number(Boolean(left.isLegendary)));

export const useLeaderboardsStore = create<LeaderboardsState>((set, get) => ({
  activeMode: 'global',
  error: null,
  friends: [],
  global: [],
  hasLoaded: false,
  isLoading: false,
  isRefreshing: false,
  longest: [],
  mostToxic: [],
  week: [],

  setMode: (activeMode) => set({ activeMode }),

  loadLeaderboards: async (rankingScope = 'world') => {
    set({ error: null, isLoading: true });
    try {
      const [boards, friends] = await Promise.all([
        leaderboardsApi.getGlobal(rankingScope),
        leaderboardsApi.getFriends(),
      ]);
      set({ ...boards, friends, hasLoaded: true });
    } catch (error) {
      set({ error: getErrorMessage(error), hasLoaded: true });
    } finally {
      set({ isLoading: false });
    }
  },

  refreshLeaderboards: async (rankingScope = 'world') => {
    set({ error: null, isRefreshing: true });
    try {
      const [boards, friends] = await Promise.all([
        leaderboardsApi.getGlobal(rankingScope),
        leaderboardsApi.getFriends(),
      ]);
      set({ ...boards, friends, hasLoaded: true });
    } catch (error) {
      set({ error: getErrorMessage(error) });
    } finally {
      set({ isRefreshing: false });
    }
  },
}));

export const selectVisibleLeaderboard = (state: LeaderboardsState) => {
  switch (state.activeMode) {
    case 'friends':
      return state.friends;
    case 'week':
      return state.week;
    case 'bestScore':
      return sortByScore(state.global);
    case 'longest':
      return state.longest;
    case 'mostToxic':
      return state.mostToxic;
    case 'legendary':
      return sortByLegendary(state.global);
    case 'global':
    default:
      return state.global;
  }
};
