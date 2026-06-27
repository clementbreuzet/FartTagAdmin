import { apiRequest, getAccessToken, getApiUrl } from '../../api/apiClient';
import type { BackendAudioUpload, BackendFartEvent } from '../../api/backendContracts';
import { mapOfficialFartResult } from '../../api/backendMappers';
import type { CreateFartEventRequest, OfficialFartResult } from './types';
import {
  uploadAsync,
  FileSystemUploadType,
} from 'expo-file-system/legacy';

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

  const token = getAccessToken();
  const extension = getFileExtension(uri);
  const mimeType = getMimeType(extension);
  const url = getApiUrl() + '/api/fart-events/audio';
  console.log('[audio-upload] POST /api/fart-events/audio', {
    hasAccessToken: Boolean(token),
    mimeType,
  });
try {
const response = await uploadAsync(
  url,
  uri,
  {
    httpMethod: 'POST',
    fieldName: 'file',
    mimeType,
    uploadType: FileSystemUploadType.MULTIPART,
    parameters: {
      durationMs: String(durationMs),
    },
    headers: {
      Accept: 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  },
);
  if (response.status < 200 || response.status >= 300) {
    throw new Error(response.body || `Upload failed (${response.status})`);
  }

  return JSON.parse(response.body) as BackendAudioUpload;
}
catch (error) {
  console.error('UPLOAD ERROR:', error);
  throw error;
}
  
};

export const detectionApi = {
  uploadAudio,

  async uploadEvent(event: CreateFartEventRequest): Promise<OfficialFartResult> {
    console.log('========================');
    console.log('UPLOAD EVENT CALLED');
    console.log('EVENT:', event);

    const shouldUploadAudio = !event.audioFileId && !!event.audioUri;

    console.log('SHOULD UPLOAD AUDIO:', shouldUploadAudio);
    console.log('AUDIO FILE ID:', event.audioFileId);
    console.log('AUDIO URI:', event.audioUri);

    const uploadedAudio = shouldUploadAudio
      ? await uploadAudio(event.audioUri!, event.durationMs)
      : null;

    const audioFileId = event.audioFileId ?? uploadedAudio?.id ?? null;

    console.log('FINAL AUDIO FILE ID:', audioFileId);

    const payload = {
      audioFileId,
      audioLevel: Math.round(event.audioLevel),
      deviceId: event.deviceId,
      durationMs: event.durationMs,
      gasLevel: Math.round(event.gasLevel),
      localScore: event.provisionalScore,
      temperature: 24,
      timestamp: event.capturedAt,
    };

    console.log('FART EVENT PAYLOAD:', payload);

    const backendResult = await apiRequest<BackendFartEvent>('/api/fart-events', {
      body: JSON.stringify(payload),
      method: 'POST',
    });

    console.log('UPLOAD EVENT SUCCESS');
    console.log('BACKEND RESULT:', backendResult);

    return mapOfficialFartResult(backendResult);
  },
};
