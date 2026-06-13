import { apiRequest } from '../../api/apiClient';
import type { BackendFartEvent } from '../../api/backendContracts';
import {
  mapFartDetails,
  mapReactionResponse,
  mapVisibilityResponse,
} from '../../api/backendMappers';
import { mockFartDetailsById } from '../mockData';
import type { FartReactionType } from '../feed/types';
import type {
  FartDetails,
  FartVisibility,
  ReactionResponse,
  VisibilityResponse,
} from './types';

export const fartDetailsApi = {
  getById(id: string) {
    return apiRequest<BackendFartEvent>(`/api/fart-events/${id}`).then(mapFartDetails).catch(() => {
      return mockFartDetailsById[id] ?? mockFartDetailsById['fart-best-001'];
    });
  },

  setVisibility(id: string, visibility: FartVisibility) {
    return apiRequest<BackendFartEvent>(`/api/fart-events/${id}/visibility`, {
      body: JSON.stringify({ isPublic: visibility === 'public' }),
      method: 'POST',
    }).then(mapVisibilityResponse).catch(() => ({
      fartEventId: id,
      visibility,
    }));
  },

  react(id: string, reactionType: FartReactionType) {
    return apiRequest<BackendFartEvent>(`/api/fart-events/${id}/react`, {
      body: JSON.stringify({ reactionType }),
      method: 'POST',
    }).then(mapReactionResponse).catch(() => ({
      fartEventId: id,
      reactions: mockFartDetailsById[id]?.reactions ?? mockFartDetailsById['fart-best-001'].reactions,
    }));
  },
};
