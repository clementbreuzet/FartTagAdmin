import { apiRequest } from '../../api/apiClient';
import type { BackendFartEvent } from '../../api/backendContracts';
import { mapOfficialFartResult } from '../../api/backendMappers';
import { mockOfficialDetectionResult } from '../mockData';
import type { CreateFartEventRequest, OfficialFartResult } from './types';

export const detectionApi = {
  uploadEvent(event: CreateFartEventRequest) {
    return apiRequest<BackendFartEvent>('/api/fart-events', {
      body: JSON.stringify({
        audioFileId: null,
        audioLevel: Math.round(event.audioLevel),
        deviceId: event.deviceId,
        durationMs: event.durationMs,
        gasLevel: Math.round(event.gasLevel),
        localScore: event.provisionalScore,
        temperature: 24,
        timestamp: event.capturedAt,
      }),
      method: 'POST',
    }).then(mapOfficialFartResult).catch(() => ({
      ...mockOfficialDetectionResult,
      fartEventId: event.clientEventId,
    }));
  },
};
