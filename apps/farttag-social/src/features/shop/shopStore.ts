import { create } from 'zustand';

import { profileApi } from '../profile/profileApi';
import { useProfileStore } from '../profile/profileStore';
import type { Wallet } from '../profile/types';
import { shopApi } from './shopApi';
import type { LootboxDefinition, LootboxReward } from './types';
import { useNotificationStore } from '../notifications/notificationStore';
import { NotificationService } from '../../services/notifications/NotificationService';

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
      useProfileStore.setState({ wallet: result.wallet });
      const notifications = useNotificationStore.getState();
      if (notifications.preferences.rewardsEnabled && notifications.permissionStatus === 'granted') {
        void NotificationService.showLootBoxNotification(result.reward.name, result.reward.rarity)
          .catch((error: unknown) => console.log('[notifications] Loot box notification failed:', error));
      }
    } catch (error) {
      set({ error: getErrorMessage(error) });
    } finally {
      set({ isOpening: false, openingLootboxId: null });
    }
  },

  setRevealVisible: (visible) => set({ revealVisible: visible }),
}));
