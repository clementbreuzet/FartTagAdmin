import { apiRequest } from '../../api/apiClient';
import type { BackendFartHistoryItem } from '../../api/backendContracts';
import { mapHistoryItem } from '../../api/backendMappers';
import { mockHistoryEvents } from '../mockData';
import type { FartHistoryEvent } from './types';

export const historyApi = {
  async getMyHistory(): Promise<FartHistoryEvent[]> {
    try {
      const response = await apiRequest<BackendFartHistoryItem[]>(
        '/api/fart-events/my-history',
      );
      const events = response.map(mapHistoryItem);
      const resolved = events.length > 0 ? events : mockHistoryEvents;
      return [...resolved].sort(
        (left, right) =>
          new Date(right.occurredAt).getTime() - new Date(left.occurredAt).getTime(),
      );
    } catch {
      return [...mockHistoryEvents].sort(
        (left, right) =>
          new Date(right.occurredAt).getTime() - new Date(left.occurredAt).getTime(),
      );
    }
  },
};
