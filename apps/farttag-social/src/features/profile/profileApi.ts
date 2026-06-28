import { apiRequest } from '../../api/apiClient';
import { apiEndpoints } from '../../api/apiEndpoints';
import type { BackendPlayerProfile, BackendUserProfile, BackendWallet } from '../../api/backendContracts';
import { mapPlayerProfile, mapUserProfile, mapWallet } from '../../api/backendMappers';
import { inventoryApi } from '../inventory/inventoryApi';
import { mockInventory, mockProfile, mockWallet } from '../mockData';
import type { InventoryItem, UserProfile, Wallet } from './types';

export const profileApi = {
  getProfile() {
    return apiRequest<BackendPlayerProfile>(apiEndpoints.profile.current)
      .then(mapPlayerProfile)
      .catch(() => mockProfile);
  },

  getPublicProfile(userId: string) {
    return apiRequest<BackendUserProfile>(apiEndpoints.profile.publicById(userId)).then(mapUserProfile);
  },

  getWallet() {
    return apiRequest<BackendWallet>(apiEndpoints.wallet).then(mapWallet).catch(() => mockWallet);
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
