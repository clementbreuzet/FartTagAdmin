import { apiRequest } from '../../api/apiClient';
import type { CreateFartEventRequest, OfficialFartResult } from './types';

export const detectionApi = {
  uploadEvent(event: CreateFartEventRequest) {
    return apiRequest<OfficialFartResult>('/api/fart-events', {
      body: JSON.stringify(event),
      method: 'POST',
    });
  },
};
