import { create } from 'zustand';

import { historyApi } from './historyApi';
import type { FartHistoryEvent, HistoryFilter } from './types';

type HistoryState = {
  error: string | null;
  events: FartHistoryEvent[];
  filter: HistoryFilter;
  hasLoaded: boolean;
  isLoading: boolean;
  isRefreshing: boolean;
  loadHistory: () => Promise<void>;
  refreshHistory: () => Promise<void>;
  setFilter: (filter: HistoryFilter) => void;
};

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : "L'historique n'a pas pu être chargé.";

export const useHistoryStore = create<HistoryState>((set) => ({
  error: null,
  events: [],
  filter: 'all',
  hasLoaded: false,
  isLoading: false,
  isRefreshing: false,

  loadHistory: async () => {
    set({ error: null, isLoading: true });
    try {
      set({ events: await historyApi.getMyHistory(), hasLoaded: true });
    } catch (error) {
      set({ error: getErrorMessage(error), hasLoaded: true });
    } finally {
      set({ isLoading: false });
    }
  },

  refreshHistory: async () => {
    set({ error: null, isRefreshing: true });
    try {
      set({ events: await historyApi.getMyHistory(), hasLoaded: true });
    } catch (error) {
      set({ error: getErrorMessage(error) });
    } finally {
      set({ isRefreshing: false });
    }
  },

  setFilter: (filter) => set({ filter }),
}));
