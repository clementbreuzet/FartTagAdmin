import { apiRequest } from '../../api/apiClient';
import type {
  FartReactionType,
  FeedResponse,
  PublicFartEvent,
  ReactToFartResponse,
} from './types';

export const feedApi = {
  async getFeed(): Promise<PublicFartEvent[]> {
    const response = await apiRequest<FeedResponse | PublicFartEvent[]>('/api/feed');
    return Array.isArray(response) ? response : response.items;
  },

  react(fartEventId: string, reactionType: FartReactionType) {
    return apiRequest<ReactToFartResponse>(`/api/fart-events/${fartEventId}/react`, {
      body: JSON.stringify({ reactionType }),
      method: 'POST',
    });
  },
};
