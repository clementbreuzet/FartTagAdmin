import { apiRequest } from '../../api/apiClient';
import { apiEndpoints } from '../../api/apiEndpoints';
import type { BackendFartEvent, BackendFeedItem } from '../../api/backendContracts';
import { mapFeedItem, mapReactionResponse } from '../../api/backendMappers';
import { mockFeedEvents } from '../mockData';
import type {
  FartReactionType,
  PublicFartEvent,
  ReactToFartResponse,
} from './types';

export const feedApi = {
  async getFeed(): Promise<PublicFartEvent[]> {
    try {
      const response = await apiRequest<BackendFeedItem[]>(apiEndpoints.feed.public);
      const events = response.map(mapFeedItem);
      return events.length > 0 ? events : mockFeedEvents;
    } catch {
      return mockFeedEvents;
    }
  },

  react(fartEventId: string, reactionType: FartReactionType) {
    return apiRequest<BackendFartEvent>(apiEndpoints.fartEvents.react(fartEventId), {
      body: JSON.stringify({ reactionType }),
      method: 'POST',
    }).then(mapReactionResponse) satisfies Promise<ReactToFartResponse>;
  },
};
