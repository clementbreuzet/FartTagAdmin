import { apiRequest, getAccessToken, getApiUrl } from '../../api/apiClient';
import { apiEndpoints } from '../../api/apiEndpoints';
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
  return `${getApiUrl()}${apiEndpoints.fartEvents.audio}/${audioFileIdOrReplayUrl}`;
};

export const historyApi = {
  async getMyHistory(): Promise<FartHistoryItem[]> {
    if (__DEV__) {
      console.log('[history-api] GET my history', {
        apiUrl: getApiUrl(),
        hasAccessToken: Boolean(getAccessToken()),
      });
    }
    const response = await apiRequest<BackendFartHistoryItem[]>(apiEndpoints.fartEvents.myHistory);
    const items = response.map(mapHistoryItem).sort(
      (left, right) =>
        new Date(right.occurredAt).getTime() - new Date(left.occurredAt).getTime(),
    );
    if (__DEV__) {
      console.log('[history-api] Mapped history', { itemCount: items.length });
    }
    return items;
  },

  async getFartEventById(id: string): Promise<FartDetails> {
    return mapFartDetails(await apiRequest<BackendFartEvent>(apiEndpoints.fartEvents.byId(id)));
  },

  getAudioReplayUrl,
};

export const getMyHistory = historyApi.getMyHistory;
export const getFartEventById = historyApi.getFartEventById;
