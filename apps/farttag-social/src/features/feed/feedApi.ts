import { apiRequest } from '../../api/apiClient';
import { apiEndpoints } from '../../api/apiEndpoints';
import type { BackendFartEvent, BackendFeedItem } from '../../api/backendContracts';
import { mapFeedItem, mapReactionResponse } from '../../api/backendMappers';
import type {
  FartReactionType,
  PublicFartEvent,
  ReactToFartResponse,
} from './types';

export const feedApi = {
  async getFeed(): Promise<PublicFartEvent[]> {
    const response = await apiRequest<BackendFeedItem[]>(apiEndpoints.feed.public);
    return response
      .filter((event) => (event.visibility ?? 'public').toLowerCase() === 'public')
      .map(mapFeedItem);
  },

  react(fartEventId: string, reactionType: FartReactionType) {
    return apiRequest<BackendFartEvent>(apiEndpoints.fartEvents.react(fartEventId), {
      body: JSON.stringify({ reactionType }),
      method: 'POST',
    }).then(mapReactionResponse) satisfies Promise<ReactToFartResponse>;
  },
};
