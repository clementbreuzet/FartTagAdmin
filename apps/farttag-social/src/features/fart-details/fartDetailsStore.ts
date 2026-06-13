import { create } from 'zustand';

import type { FartReactionType } from '../feed/types';
import { fartDetailsApi } from './fartDetailsApi';
import type { FartDetails, FartVisibility } from './types';

type FartDetailsState = {
  details: FartDetails | null;
  error: string | null;
  isLoading: boolean;
  isReacting: boolean;
  isUpdatingVisibility: boolean;
  loadDetails: (id: string) => Promise<void>;
  react: (reaction: FartReactionType) => Promise<void>;
  reset: () => void;
  setVisibility: (visibility: FartVisibility) => Promise<void>;
};

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : "L'opération n'a pas pu être effectuée.";

export const useFartDetailsStore = create<FartDetailsState>((set, get) => ({
  details: null,
  error: null,
  isLoading: false,
  isReacting: false,
  isUpdatingVisibility: false,

  loadDetails: async (id) => {
    set({ details: null, error: null, isLoading: true });
    try {
      set({ details: await fartDetailsApi.getById(id) });
    } catch (error) {
      set({ error: getErrorMessage(error) });
    } finally {
      set({ isLoading: false });
    }
  },

  react: async (reaction) => {
    const details = get().details;
    if (!details) {
      return;
    }
    set({ error: null, isReacting: true });
    try {
      const result = await fartDetailsApi.react(details.id, reaction);
      set({ details: { ...details, reactions: result.reactions } });
    } catch (error) {
      set({ error: getErrorMessage(error) });
    } finally {
      set({ isReacting: false });
    }
  },

  reset: () => set({ details: null, error: null }),

  setVisibility: async (visibility) => {
    const details = get().details;
    if (!details) {
      return;
    }
    set({ error: null, isUpdatingVisibility: true });
    try {
      const result = await fartDetailsApi.setVisibility(details.id, visibility);
      set({ details: { ...details, visibility: result.visibility } });
    } catch (error) {
      set({ error: getErrorMessage(error) });
    } finally {
      set({ isUpdatingVisibility: false });
    }
  },
}));
