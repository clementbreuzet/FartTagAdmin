import { apiRequest } from '../../api/apiClient';
import { apiEndpoints } from '../../api/apiEndpoints';
import type { BackendLootBox, BackendOpenLootBoxResult } from '../../api/backendContracts';
import { mapLootBox, mapOpenLootBox } from '../../api/backendMappers';
import { mockLootboxes, mockOpenLootboxResponse } from '../mockData';
import type { LootboxDefinition } from './types';

export const shopApi = {
  async getLootboxes(): Promise<LootboxDefinition[]> {
    try {
      const response = await apiRequest<BackendLootBox[]>(apiEndpoints.shop.list);
      const items = response.filter((lootbox) => lootbox.isActive).map(mapLootBox);
      return items.length > 0 ? items : mockLootboxes;
    } catch {
      return mockLootboxes;
    }
  },

  openLootbox(id: string) {
    return apiRequest<BackendOpenLootBoxResult>(apiEndpoints.shop.open, {
      body: JSON.stringify({ lootBoxId: id }),
      method: 'POST',
    }).then(mapOpenLootBox).catch(() => mockOpenLootboxResponse(id));
  },
};
