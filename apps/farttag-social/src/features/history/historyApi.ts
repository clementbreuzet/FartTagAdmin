import { apiRequest, getAccessToken, getApiUrl } from '../../api/apiClient';
import type { BackendFartEvent, BackendFartHistoryItem } from '../../api/backendContracts';
import { mapFartDetails, mapHistoryItem } from '../../api/backendMappers';
import type { FartDetails, FartHistoryItem } from './types';

export const getAudioReplayUrl = (audioFileIdOrReplayUrl: string | null): string | null => {
  if (!audioFileIdOrReplayUrl) {
    return null;
  }
  if (audioFileIdOrReplayUrl.startsWith('http://') || audioFileIdOrReplayUrl.startsWith('https://')) {
    return audioFileIdOrReplayUrl;
  }
  if (audioFileIdOrReplayUrl.startsWith('/')) {
    return `${getApiUrl()}${audioFileIdOrReplayUrl}`;
  }
  return `${getApiUrl()}/api/fart-events/audio/${audioFileIdOrReplayUrl}`;
};

export const historyApi = {
  async getMyHistory(): Promise<FartHistoryItem[]> {
    console.log('[history-api] GET /api/fart-events/my-history', {
      apiUrl: getApiUrl(),
      hasAccessToken: Boolean(getAccessToken()),
    });
    const response = await apiRequest<BackendFartHistoryItem[]>('/api/fart-events/my-history');
    console.log('[history-api] Raw history response', {
      isArray: Array.isArray(response),
      itemCount: Array.isArray(response) ? response.length : null,
      firstItem: Array.isArray(response) ? response[0] ?? null : null,
    });
    const items = response.map(mapHistoryItem).sort(
      (left, right) =>
        new Date(right.occurredAt).getTime() - new Date(left.occurredAt).getTime(),
    );
    console.log('[history-api] Mapped history', {
      itemCount: items.length,
      ids: items.map((item) => item.id),
    });
    return items;
  },

  async getFartEventById(id: string): Promise<FartDetails> {
    return mapFartDetails(await apiRequest<BackendFartEvent>(`/api/fart-events/${id}`));
  },

  getAudioReplayUrl,
};

export const getMyHistory = historyApi.getMyHistory;
export const getFartEventById = historyApi.getFartEventById;
