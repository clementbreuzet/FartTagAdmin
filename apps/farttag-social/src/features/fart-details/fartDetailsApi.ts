import { apiRequest } from '../../api/apiClient';
import type { FartReactionType } from '../feed/types';
import type {
  FartDetails,
  FartVisibility,
  ReactionResponse,
  VisibilityResponse,
} from './types';

export const fartDetailsApi = {
  getById(id: string) {
    return apiRequest<FartDetails>(`/api/fart-events/${id}`);
  },

  setVisibility(id: string, visibility: FartVisibility) {
    return apiRequest<VisibilityResponse>(`/api/fart-events/${id}/visibility`, {
      body: JSON.stringify({ visibility }),
      method: 'POST',
    });
  },

  react(id: string, reactionType: FartReactionType) {
    return apiRequest<ReactionResponse>(`/api/fart-events/${id}/react`, {
      body: JSON.stringify({ reactionType }),
      method: 'POST',
    });
  },
};
