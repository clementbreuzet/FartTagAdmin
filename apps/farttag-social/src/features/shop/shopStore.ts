import { create } from 'zustand';

import { profileApi } from '../profile/profileApi';
import type { Wallet } from '../profile/types';
import { shopApi } from './shopApi';
import type { LootboxDefinition, LootboxReward } from './types';

type ShopState = {
  error: string | null;
  hasLoaded: boolean;
  isOpening: boolean;
  isLoading: boolean;
  lootboxes: LootboxDefinition[];
  lastReward: LootboxReward | null;
  openingLootboxId: string | null;
  revealVisible: boolean;
  wallet: Wallet | null;
  loadShop: () => Promise<void>;
  openLootbox: (lootboxId: string) => Promise<void>;
  setRevealVisible: (visible: boolean) => void;
};

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : 'La boutique ne peut pas être chargée.';

export const useShopStore = create<ShopState>((set, get) => ({
  error: null,
  hasLoaded: false,
  isOpening: false,
  isLoading: false,
  lootboxes: [],
  lastReward: null,
  openingLootboxId: null,
  revealVisible: false,
  wallet: null,

  loadShop: async () => {
    set({ error: null, isLoading: true });
    try {
      const [wallet, lootboxes] = await Promise.all([
        profileApi.getWallet(),
        shopApi.getLootboxes(),
      ]);
      set({ hasLoaded: true, lootboxes, wallet });
    } catch (error) {
      set({ error: getErrorMessage(error), hasLoaded: true });
    } finally {
      set({ isLoading: false });
    }
  },

  openLootbox: async (lootboxId) => {
    set({ error: null, isOpening: true, openingLootboxId: lootboxId, revealVisible: false });
    try {
      const result = await shopApi.openLootbox(lootboxId);
      set({
        lastReward: result.reward,
        wallet: result.wallet,
        revealVisible: true,
      });
    } catch (error) {
      set({ error: getErrorMessage(error) });
    } finally {
      set({ isOpening: false, openingLootboxId: null });
    }
  },

  setRevealVisible: (visible) => set({ revealVisible: visible }),
}));
