import { apiRequest } from '../../api/apiClient';
import type { BackendUserProfile, BackendWallet } from '../../api/backendContracts';
import { mapUserProfile, mapWallet } from '../../api/backendMappers';
import { inventoryApi } from '../inventory/inventoryApi';
import { mockInventory, mockProfile, mockWallet } from '../mockData';
import type { InventoryItem, UserProfile, Wallet } from './types';

export const profileApi = {
  getProfile() {
    return apiRequest<BackendUserProfile>('/api/profiles/me')
      .then(mapUserProfile)
      .catch(() => mockProfile);
  },

  getPublicProfile(userId: string) {
    return apiRequest<BackendUserProfile>(`/api/profiles/${userId}`).then(mapUserProfile);
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
