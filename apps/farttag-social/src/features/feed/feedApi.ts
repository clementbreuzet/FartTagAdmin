import { apiRequest } from '../../api/apiClient';
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
      const response = await apiRequest<BackendFeedItem[]>('/api/feed/public');
      const events = response.map(mapFeedItem);
      return events.length > 0 ? events : mockFeedEvents;
    } catch {
      return mockFeedEvents;
    }
  },

  react(fartEventId: string, reactionType: FartReactionType) {
    return apiRequest<BackendFartEvent>(`/api/fart-events/${fartEventId}/react`, {
      body: JSON.stringify({ reactionType }),
      method: 'POST',
    }).then(mapReactionResponse) satisfies Promise<ReactToFartResponse>;
  },
};
