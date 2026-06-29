import { apiRequest, getAccessToken, getApiUrl } from '../../api/apiClient';
import { apiEndpoints } from '../../api/apiEndpoints';
import type { BackendFartEvent, BackendFartHistoryItem } from '../../api/backendContracts';
import { mapFartDetails, mapHistoryItem, mapVisibilityResponse } from '../../api/backendMappers';
import type { FartVisibility } from '../fart-details/types';
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

  async setVisibility(id: string, visibility: FartVisibility): Promise<FartVisibility> {
    const response = await apiRequest<BackendFartEvent>(apiEndpoints.fartEvents.visibility(id), {
      body: JSON.stringify({ isPublic: visibility === 'public' }),
      method: 'POST',
    });
    return mapVisibilityResponse(response).visibility;
  },

  getAudioReplayUrl,
};

export const getMyHistory = historyApi.getMyHistory;
export const getFartEventById = historyApi.getFartEventById;
