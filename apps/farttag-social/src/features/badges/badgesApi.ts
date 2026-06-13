import { apiRequest } from '../../api/apiClient';
import type {
  BadgeCatalogResponse,
  BadgeDefinition,
  UserBadgeProgress,
  UserBadgesResponse,
} from './types';

export const badgesApi = {
  async getCatalog(): Promise<BadgeDefinition[]> {
    const response = await apiRequest<BadgeCatalogResponse | BadgeDefinition[]>('/api/badges');
    return Array.isArray(response) ? response : response.items;
  },

  async getMine(): Promise<UserBadgeProgress[]> {
    const response = await apiRequest<UserBadgesResponse | UserBadgeProgress[]>('/api/badges/me');
    return Array.isArray(response) ? response : response.items;
  },
};
