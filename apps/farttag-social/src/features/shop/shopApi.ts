import { apiRequest } from '../../api/apiClient';
import { apiEndpoints } from '../../api/apiEndpoints';
import type { BackendLootBox, BackendOpenLootBoxResult } from '../../api/backendContracts';
import { mapLootBox, mapOpenLootBox } from '../../api/backendMappers';
import type { LootboxDefinition } from './types';

export const shopApi = {
  async getLootboxes(): Promise<LootboxDefinition[]> {
    const response = await apiRequest<BackendLootBox[]>(apiEndpoints.shop.list);
    return response.filter((lootbox) => lootbox.isActive).map(mapLootBox);
  },

  openLootbox(id: string) {
    return apiRequest<BackendOpenLootBoxResult>(apiEndpoints.shop.open, {
      body: JSON.stringify({ lootBoxId: id }),
      method: 'POST',
    }).then(mapOpenLootBox);
  },
};
