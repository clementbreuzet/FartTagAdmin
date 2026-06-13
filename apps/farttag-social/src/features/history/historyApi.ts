import { apiRequest } from '../../api/apiClient';
import type { FartHistoryEvent, FartHistoryResponse } from './types';

export const historyApi = {
  async getMyHistory(): Promise<FartHistoryEvent[]> {
    const response = await apiRequest<FartHistoryResponse | FartHistoryEvent[]>(
      '/api/fart-events/my-history',
    );
    const events = Array.isArray(response) ? response : response.items;
    return [...events].sort(
      (left, right) =>
        new Date(right.occurredAt).getTime() - new Date(left.occurredAt).getTime(),
    );
  },
};
