import { create } from 'zustand';

import { audioPlaybackService } from './audioPlaybackService';
import { historyApi } from './historyApi';
import type {
  AudioPlaybackStatus,
  FartDetails,
  FartHistoryItem,
  HistoryFilter,
} from './types';

type HistoryState = {
  error: string | null;
  events: FartHistoryItem[];
  items: FartHistoryItem[];
  selectedEvent: FartDetails | null;
  filter: HistoryFilter;
  hasLoaded: boolean;
  isLoading: boolean;
  isRefreshing: boolean;
  playbackStatus: AudioPlaybackStatus;
  currentlyPlayingId: string | null;
  loadHistory: () => Promise<void>;
  loadDetails: (id: string) => Promise<void>;
  playAudio: (event: FartHistoryItem | FartDetails) => Promise<void>;
  stopAudio: () => void;
  refreshHistory: () => Promise<void>;
  setFilter: (filter: HistoryFilter) => void;
};

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : "L'opération n'a pas pu être effectuée.";

const devLog = (...args: unknown[]) => {
  if (__DEV__) {
    console.log(...args);
  }
};

const devError = (...args: unknown[]) => {
  if (__DEV__) {
    console.error(...args);
  }
};

export const useHistoryStore = create<HistoryState>((set, get) => ({
  error: null,
  events: [],
  items: [],
  selectedEvent: null,
  filter: 'all',
  hasLoaded: false,
  isLoading: false,
  isRefreshing: false,
  playbackStatus: 'idle',
  currentlyPlayingId: null,

  loadHistory: async () => {
    devLog('[history-store] loadHistory started', {
      previousItemCount: get().items.length,
      previousHasLoaded: get().hasLoaded,
    });
    set({ error: null, isLoading: true });
    try {
      const items = await historyApi.getMyHistory();
      devLog('[history-store] loadHistory succeeded', { itemCount: items.length });
      set({ events: items, items, hasLoaded: true });
    } catch (error) {
      const message = getErrorMessage(error);
      devError('[history-store] loadHistory failed', { error, message });
      set({ error: message, hasLoaded: true });
    } finally {
      set({ isLoading: false });
      devLog('[history-store] loadHistory finished');
    }
  },

  refreshHistory: async () => {
    devLog('[history-store] refreshHistory started', {
      previousItemCount: get().items.length,
    });
    set({ error: null, isRefreshing: true });
    try {
      const items = await historyApi.getMyHistory();
      devLog('[history-store] refreshHistory succeeded', { itemCount: items.length });
      set({ events: items, items, hasLoaded: true });
    } catch (error) {
      const message = getErrorMessage(error);
      devError('[history-store] refreshHistory failed', { error, message });
      set({ error: message });
    } finally {
      set({ isRefreshing: false });
      devLog('[history-store] refreshHistory finished');
    }
  },

  loadDetails: async (id) => {
    set({ error: null, isLoading: true, selectedEvent: null });
    try {
      set({ selectedEvent: await historyApi.getFartEventById(id) });
    } catch (error) {
      set({ error: getErrorMessage(error) });
    } finally {
      set({ isLoading: false });
    }
  },

  playAudio: async (event) => {
    if (get().currentlyPlayingId === event.id) {
      get().stopAudio();
      return;
    }

    const audioUrl = historyApi.getAudioReplayUrl(event.audioReplayUrl ?? event.audioFileId);
    if (!audioUrl) {
      set({ error: 'Aucun audio disponible pour cet événement.', playbackStatus: 'error' });
      return;
    }

    devLog('[history] Play audio:', event.id);
    devLog('[history] Audio URL:', audioUrl);
    set({ currentlyPlayingId: event.id, error: null, playbackStatus: 'loading' });
    try {
      await audioPlaybackService.play(
        event.id,
        audioUrl,
        () => set({ currentlyPlayingId: null, playbackStatus: 'idle' }),
        (message) => {
          devLog('[history] Audio playback error:', message);
          set({ currentlyPlayingId: null, error: message, playbackStatus: 'error' });
        },
      );
      if (get().currentlyPlayingId === event.id) {
        set({ playbackStatus: 'playing' });
      }
    } catch (error) {
      devLog('[history] Audio playback error:', error);
      audioPlaybackService.stop();
      set({
        currentlyPlayingId: null,
        error: getErrorMessage(error),
        playbackStatus: 'error',
      });
    }
  },

  stopAudio: () => {
    audioPlaybackService.stop();
    set({ currentlyPlayingId: null, playbackStatus: 'idle' });
  },

  setFilter: (filter) => set({ filter }),
}));
