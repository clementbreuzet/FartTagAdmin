import { apiRequest } from '../../api/apiClient';
import { apiEndpoints } from '../../api/apiEndpoints';
import type { BackendComment, BackendFartEvent } from '../../api/backendContracts';
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
  getComments(id: string) {
    return apiRequest<BackendComment[]>(apiEndpoints.fartEvents.comments(id));
  },

  addComment(id: string, content: string) {
    return apiRequest<BackendComment>(apiEndpoints.fartEvents.comments(id), {
      body: JSON.stringify({ content }),
      method: 'POST',
    });
  },
  getById(id: string) {
    return apiRequest<BackendFartEvent>(apiEndpoints.fartEvents.byId(id)).then(mapFartDetails).catch(() => {
      return mockFartDetailsById[id] ?? mockFartDetailsById['fart-best-001'];
    });
  },

  setVisibility(id: string, visibility: FartVisibility) {
    return apiRequest<BackendFartEvent>(apiEndpoints.fartEvents.visibility(id), {
      body: JSON.stringify({ isPublic: visibility === 'public' }),
      method: 'POST',
    }).then(mapVisibilityResponse).catch(() => ({
      fartEventId: id,
      visibility,
    }));
  },

  react(id: string, reactionType: FartReactionType) {
    return apiRequest<BackendFartEvent>(apiEndpoints.fartEvents.react(id), {
      body: JSON.stringify({ reactionType }),
      method: 'POST',
    }).then(mapReactionResponse).catch(() => ({
      fartEventId: id,
      reactions: mockFartDetailsById[id]?.reactions ?? mockFartDetailsById['fart-best-001'].reactions,
    }));
  },
};
