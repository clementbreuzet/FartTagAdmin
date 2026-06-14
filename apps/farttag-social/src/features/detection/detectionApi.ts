import { apiRequest } from '../../api/apiClient';
import type { BackendAudioUpload, BackendFartEvent } from '../../api/backendContracts';
import { mapOfficialFartResult } from '../../api/backendMappers';
import type { CreateFartEventRequest, OfficialFartResult } from './types';

const getFileExtension = (uri: string) => uri.split('.').pop()?.toLowerCase() || 'm4a';

const getFileExtension = (uri: string) =>
  uri.split('.').pop()?.toLowerCase() || 'm4a';

const getMimeType = (extension: string) => {
  switch (extension) {
    case 'wav':
      return 'audio/wav';
    case 'mp3':
      return 'audio/mpeg';
    case 'm4a':
    case 'mp4':
      return 'audio/mp4';
    default:
      return 'audio/mp4';
  }
};

const uploadAudio = async (
  uri: string,
  durationMs: number,
): Promise<BackendAudioUpload> => {
  const extension = getFileExtension(uri);

  const form = new FormData();

  form.append('DurationMs', String(durationMs));

  form.append('File', {
    uri,
    name: `phone-mic-${Date.now()}.${extension}`,
    type: getMimeType(extension),
  } as any);

  return apiRequest<BackendAudioUpload>('/api/fart-events/audio', {
    method: 'POST',
    body: form,
  });
};

export const detectionApi = {
  uploadAudio,

  async uploadEvent(event: CreateFartEventRequest): Promise<OfficialFartResult> {
    const uploadedAudio = !event.audioFileId && event.audioUri
      ? await uploadAudio(event.audioUri, event.durationMs)
      : null;
    const audioFileId = event.audioFileId ?? uploadedAudio?.id ?? null;
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
