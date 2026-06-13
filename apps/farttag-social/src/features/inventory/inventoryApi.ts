import { apiRequest } from '../../api/apiClient';
import type { BackendInventoryResponse } from '../../api/backendContracts';
import { mapEquippedInventoryIds, mapInventory } from '../../api/backendMappers';
import { mockInventory } from '../mockData';
import type { InventoryItem } from '../profile/types';

export type EquipInventoryResponse = {
  itemId: string;
  equippedItemIds: {
    titleId: string | null;
    frameId: string | null;
    effectId: string | null;
  };
};

export const inventoryApi = {
  async getInventory(): Promise<InventoryItem[]> {
    try {
      const response = await apiRequest<BackendInventoryResponse>('/api/inventory');
      const items = mapInventory(response);
      return items.length > 0 ? items : mockInventory;
    } catch {
      return mockInventory;
    }
  },

  equipItem(itemId: string) {
    return apiRequest<BackendInventoryResponse>(`/api/inventory/${itemId}/equip`, {
      method: 'POST',
    }).then((response): EquipInventoryResponse => ({
      itemId,
      equippedItemIds: mapEquippedInventoryIds(response),
    }));
  },
};
