import { apiRequest } from '../../api/apiClient';
import type { BackendMe, BackendWallet } from '../../api/backendContracts';
import { mapMeToProfile, mapWallet } from '../../api/backendMappers';
import { inventoryApi } from '../inventory/inventoryApi';
import { mockInventory, mockProfile, mockWallet } from '../mockData';
import type { InventoryItem, UserProfile, Wallet } from './types';

export const profileApi = {
  getProfile() {
    return apiRequest<BackendMe>('/api/me')
      .then((me) => mapMeToProfile(me, mockProfile))
      .catch(() => mockProfile);
  },

  getWallet() {
    return apiRequest<BackendWallet>('/api/wallet').then(mapWallet).catch(() => mockWallet);
  },

  async getInventory(): Promise<InventoryItem[]> {
    try {
      const inventory = await inventoryApi.getInventory();
      return inventory.length > 0 ? inventory : mockInventory;
    } catch {
      return mockInventory;
    }
  },
};
