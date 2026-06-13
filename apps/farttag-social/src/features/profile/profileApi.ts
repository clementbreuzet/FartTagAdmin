import { apiRequest } from '../../api/apiClient';
import type { InventoryItem, InventoryResponse, UserProfile, Wallet } from './types';

export const profileApi = {
  getProfile() {
    return apiRequest<UserProfile>('/api/me/profile');
  },

  getWallet() {
    return apiRequest<Wallet>('/api/wallet');
  },

  async getInventory(): Promise<InventoryItem[]> {
    const response = await apiRequest<InventoryResponse | InventoryItem[]>('/api/inventory');
    return Array.isArray(response) ? response : response.items;
  },
};
