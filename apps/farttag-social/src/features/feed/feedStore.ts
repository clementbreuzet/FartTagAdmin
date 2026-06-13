import { create } from 'zustand';

import { feedApi } from './feedApi';
import type { FartReactionType, PublicFartEvent } from './types';

type FeedState = {
  error: string | null;
  events: PublicFartEvent[];
  hasLoaded: boolean;
  isLoading: boolean;
  isRefreshing: boolean;
  reactingEventId: string | null;
  loadFeed: () => Promise<void>;
  refreshFeed: () => Promise<void>;
  reactToEvent: (eventId: string, reaction: FartReactionType) => Promise<void>;
};

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : 'Unable to load the public feed.';

export const useFeedStore = create<FeedState>((set) => ({
  error: null,
  events: [],
  hasLoaded: false,
  isLoading: false,
  isRefreshing: false,
  reactingEventId: null,

  loadFeed: async () => {
    set({ error: null, isLoading: true });
    try {
      const events = await feedApi.getFeed();
      set({ events, hasLoaded: true });
    } catch (error) {
      set({ error: getErrorMessage(error), hasLoaded: true });
    } finally {
      set({ isLoading: false });
    }
  },

  refreshFeed: async () => {
    set({ error: null, isRefreshing: true });
    try {
      const events = await feedApi.getFeed();
      set({ events, hasLoaded: true });
    } catch (error) {
      set({ error: getErrorMessage(error) });
    } finally {
      set({ isRefreshing: false });
    }
  },

  reactToEvent: async (eventId, reaction) => {
    set({ error: null, reactingEventId: eventId });
    try {
      const officialResult = await feedApi.react(eventId, reaction);
      set((state) => ({
        events: state.events.map((event) =>
          event.id === officialResult.fartEventId
            ? { ...event, reactions: officialResult.reactions }
            : event,
        ),
      }));
    } catch (error) {
      set({ error: getErrorMessage(error) });
    } finally {
      set({ reactingEventId: null });
    }
  },
}));
