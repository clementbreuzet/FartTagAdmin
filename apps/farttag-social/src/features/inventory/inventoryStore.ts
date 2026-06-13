import { create } from 'zustand';

import { inventoryApi } from './inventoryApi';
import type { InventoryItem } from '../profile/types';
import { useProfileStore } from '../profile/profileStore';

type InventoryState = {
  error: string | null;
  hasLoaded: boolean;
  inventory: InventoryItem[];
  isLoading: boolean;
  isRefreshing: boolean;
  isEquippingItemId: string | null;
  selectedItemId: string | null;
  loadInventory: () => Promise<void>;
  refreshInventory: () => Promise<void>;
  equipItem: (itemId: string) => Promise<void>;
  selectItem: (itemId: string | null) => void;
};

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : "L'inventaire n'a pas pu être chargé.";

export const useInventoryStore = create<InventoryState>((set, get) => ({
  error: null,
  hasLoaded: false,
  inventory: [],
  isLoading: false,
  isRefreshing: false,
  isEquippingItemId: null,
  selectedItemId: null,

  loadInventory: async () => {
    set({ error: null, isLoading: true });
    try {
      set({ hasLoaded: true, inventory: await inventoryApi.getInventory() });
    } catch (error) {
      set({ error: getErrorMessage(error), hasLoaded: true });
    } finally {
      set({ isLoading: false });
    }
  },

  refreshInventory: async () => {
    set({ error: null, isRefreshing: true });
    try {
      set({ inventory: await inventoryApi.getInventory() });
    } catch (error) {
      set({ error: getErrorMessage(error) });
    } finally {
      set({ isRefreshing: false });
    }
  },

  equipItem: async (itemId) => {
    const current = get().inventory;
    set({ error: null, isEquippingItemId: itemId });
    try {
      const response = await inventoryApi.equipItem(itemId);
      const equippedSet = new Set(Object.values(response.equippedItemIds).filter(Boolean));
      const nextInventory = current.map((item) => ({
        ...item,
        isEquipped: equippedSet.has(item.id),
      }));
      set({ inventory: nextInventory });
      useProfileStore.setState((state) => ({
        inventory: nextInventory,
        profile: state.profile
          ? {
              ...state.profile,
              equippedTitle: nextInventory.find((item) => item.slot === 'title' && item.isEquipped)?.name ?? state.profile.equippedTitle,
              equippedFrame: nextInventory.find((item) => item.slot === 'frame' && item.isEquipped)
                ? {
                    id: nextInventory.find((item) => item.slot === 'frame' && item.isEquipped)!.id,
                    name: nextInventory.find((item) => item.slot === 'frame' && item.isEquipped)!.name,
                    accentColor: '#00E5FF',
                  }
                : state.profile.equippedFrame,
            }
          : state.profile,
      }));
    } catch (error) {
      set({ error: getErrorMessage(error) });
    } finally {
      set({ isEquippingItemId: null });
    }
  },

  selectItem: (selectedItemId) => set({ selectedItemId }),
}));
