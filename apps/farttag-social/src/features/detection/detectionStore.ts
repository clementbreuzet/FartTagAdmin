import { create } from 'zustand';

import { detectionApi } from './detectionApi';
import type {
  BleStatus,
  ConnectedFartTag,
  DetectedFartEvent,
  OfficialFartResult,
  UploadStatus,
} from './types';

type DetectionState = {
  bleStatus: BleStatus;
  device: ConnectedFartTag | null;
  error: string | null;
  lastEvent: DetectedFartEvent | null;
  officialResult: OfficialFartResult | null;
  uploadStatus: UploadStatus;
  connectDevice: () => Promise<void>;
  receiveAutomaticEvent: (event: DetectedFartEvent) => void;
  simulateAutomaticEvent: () => void;
  uploadLastEvent: () => Promise<void>;
};

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : "L'événement n'a pas pu être envoyé.";

const wait = (durationMs: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, durationMs));

const createProvisionalEvent = (): DetectedFartEvent => {
  const audioLevel = Math.round((62 + Math.random() * 25) * 10) / 10;
  const gasLevel = Math.round((78 + Math.random() * 65) * 10) / 10;
  const durationMs = Math.round(900 + Math.random() * 3_500);

  return {
    id: `local-${Date.now()}`,
    capturedAt: new Date().toISOString(),
    durationMs,
    audioLevel,
    gasLevel,
    provisionalScore: Math.round(audioLevel * 0.65 + gasLevel * 0.35),
  };
};

export const useDetectionStore = create<DetectionState>((set, get) => ({
  bleStatus: 'disconnected',
  device: null,
  error: null,
  lastEvent: null,
  officialResult: null,
  uploadStatus: 'idle',

  connectDevice: async () => {
    set({ bleStatus: 'connecting', error: null });
    await wait(700);
    set({
      bleStatus: 'connected',
      device: {
        id: 'FT-SOCIAL-DEMO-01',
        name: 'FartTag de Camille',
        batteryLevel: 84,
        rssi: -58,
      },
    });
  },

  receiveAutomaticEvent: (event) => {
    set({
      error: null,
      lastEvent: event,
      officialResult: null,
      uploadStatus: 'idle',
    });
  },

  simulateAutomaticEvent: () => {
    if (get().bleStatus !== 'connected') {
      return;
    }
    get().receiveAutomaticEvent(createProvisionalEvent());
  },

  uploadLastEvent: async () => {
    const { device, lastEvent } = get();
    if (!device || !lastEvent) {
      return;
    }

    set({ error: null, uploadStatus: 'pending' });
    try {
      const officialResult = await detectionApi.uploadEvent({
        audioLevel: lastEvent.audioLevel,
        capturedAt: lastEvent.capturedAt,
        clientEventId: lastEvent.id,
        deviceId: device.id,
        durationMs: lastEvent.durationMs,
        gasLevel: lastEvent.gasLevel,
        provisionalScore: lastEvent.provisionalScore,
      });
      set({ officialResult, uploadStatus: 'uploaded' });
    } catch (error) {
      set({ error: getErrorMessage(error), uploadStatus: 'error' });
    }
  },
}));
