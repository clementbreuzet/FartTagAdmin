import { apiRequest } from '../../api/apiClient';
import { apiEndpoints } from '../../api/apiEndpoints';
import type { BackendPlayerProfile, BackendUserProfile, BackendWallet } from '../../api/backendContracts';
import { mapPlayerProfile, mapUserProfile, mapWallet } from '../../api/backendMappers';
import { inventoryApi } from '../inventory/inventoryApi';
import { mockInventory } from '../mockData';
import type { InventoryItem, RankingScope, UserProfile, Wallet } from './types';

export const profileApi = {
  getProfile(rankingScope: RankingScope = 'world') {
    return apiRequest<BackendPlayerProfile>(apiEndpoints.profile.current(rankingScope)).then(mapPlayerProfile);
  },

  getPublicProfile(userId: string) {
    return apiRequest<BackendUserProfile>(apiEndpoints.profile.publicById(userId)).then(mapUserProfile);
  },

  getWallet() {
    return apiRequest<BackendWallet>(apiEndpoints.wallet).then(mapWallet);
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
