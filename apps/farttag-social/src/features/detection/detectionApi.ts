import { apiRequest } from '../../api/apiClient';
import type { BackendAudioUpload, BackendFartEvent } from '../../api/backendContracts';
import { mapOfficialFartResult } from '../../api/backendMappers';
import type { CreateFartEventRequest, OfficialFartResult } from './types';

const getFileExtension = (uri: string) => uri.split('.').pop()?.toLowerCase() || 'm4a';

const uploadAudio = async (uri: string, durationMs: number): Promise<string> => {
  const extension = getFileExtension(uri);
  const form = new FormData();
  form.append('durationMs', String(durationMs));
  form.append('file', {
    name: `phone-mic-${Date.now()}.${extension}`,
    type: extension === 'wav' ? 'audio/wav' : 'audio/mp4',
    uri,
  } as unknown as Blob);

  const uploaded = await apiRequest<BackendAudioUpload>('/api/fart-events/audio', {
    body: form,
    method: 'POST',
  });
  return uploaded.id;
};

export const detectionApi = {
  async uploadEvent(event: CreateFartEventRequest): Promise<OfficialFartResult> {
    const audioFileId = event.audioUri ? await uploadAudio(event.audioUri, event.durationMs) : null;
    return apiRequest<BackendFartEvent>('/api/fart-events', {
      body: JSON.stringify({
        audioFileId,
        audioLevel: Math.round(event.audioLevel),
        deviceId: event.deviceId,
        durationMs: event.durationMs,
        gasLevel: Math.round(event.gasLevel),
        localScore: event.provisionalScore,
        temperature: 24,
        timestamp: event.capturedAt,
      }),
      method: 'POST',
    }).then(mapOfficialFartResult);
  },
};
