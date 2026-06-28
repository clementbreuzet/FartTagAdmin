import { apiRequest } from '../../api/apiClient';
import { apiEndpoints } from '../../api/apiEndpoints';
import type { BackendBadge, BackendUserBadge } from '../../api/backendContracts';
import { mapBadge, mapUserBadge } from '../../api/backendMappers';
import { mockBadgeCatalog, mockBadgeProgress } from '../mockData';
import type {
  BadgeDefinition,
  UserBadgeProgress,
} from './types';

export const badgesApi = {
  async getCatalog(): Promise<BadgeDefinition[]> {
    try {
      const response = await apiRequest<BackendBadge[]>(apiEndpoints.badges.all);
      const items = response.filter((badge) => badge.isActive).map(mapBadge);
      return items.length > 0 ? items : mockBadgeCatalog;
    } catch {
      return mockBadgeCatalog;
    }
  },

  async getMine(): Promise<UserBadgeProgress[]> {
    try {
      const response = await apiRequest<BackendUserBadge[]>(apiEndpoints.badges.mine);
      const items = response.map(mapUserBadge);
      return items.length > 0 ? items : mockBadgeProgress;
    } catch {
      return mockBadgeProgress;
    }
  },
};
