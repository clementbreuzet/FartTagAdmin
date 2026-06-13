import { create } from 'zustand';

import { badgesApi } from './badgesApi';
import type { BadgeFilter, BadgeViewModel } from './types';

type BadgesState = {
  badges: BadgeViewModel[];
  error: string | null;
  filter: BadgeFilter;
  hasLoaded: boolean;
  isLoading: boolean;
  isRefreshing: boolean;
  selectedBadgeId: string | null;
  loadBadges: () => Promise<void>;
  refreshBadges: () => Promise<void>;
  selectBadge: (badgeId: string | null) => void;
  setFilter: (filter: BadgeFilter) => void;
};

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : 'Les badges ne peuvent pas être chargés.';

const fetchBadges = async (): Promise<BadgeViewModel[]> => {
  const [catalog, mine] = await Promise.all([badgesApi.getCatalog(), badgesApi.getMine()]);
  const progressById = new Map(mine.map((progress) => [progress.badgeId, progress]));

  return catalog.map((badge) => {
    const progress = progressById.get(badge.id);
    const currentValue = progress?.currentValue ?? 0;
    return {
      ...badge,
      badgeId: badge.id,
      currentValue,
      isUnlocked: progress?.isUnlocked ?? false,
      progressPercent: badge.targetValue > 0
        ? Math.min(100, Math.round((currentValue / badge.targetValue) * 100))
        : 0,
      unlockedAt: progress?.unlockedAt ?? null,
    };
  });
};

export const useBadgesStore = create<BadgesState>((set) => ({
  badges: [],
  error: null,
  filter: 'all',
  hasLoaded: false,
  isLoading: false,
  isRefreshing: false,
  selectedBadgeId: null,

  loadBadges: async () => {
    set({ error: null, isLoading: true });
    try {
      set({ badges: await fetchBadges(), hasLoaded: true });
    } catch (error) {
      set({ error: getErrorMessage(error), hasLoaded: true });
    } finally {
      set({ isLoading: false });
    }
  },

  refreshBadges: async () => {
    set({ error: null, isRefreshing: true });
    try {
      set({ badges: await fetchBadges(), hasLoaded: true });
    } catch (error) {
      set({ error: getErrorMessage(error) });
    } finally {
      set({ isRefreshing: false });
    }
  },

  selectBadge: (selectedBadgeId) => set({ selectedBadgeId }),
  setFilter: (filter) => set({ filter }),
}));
