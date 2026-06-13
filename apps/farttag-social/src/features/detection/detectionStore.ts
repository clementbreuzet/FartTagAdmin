import { create } from 'zustand';

import { detectionApi } from './detectionApi';
import { PhoneMicService } from '../../services/audio/PhoneMicService';
import { mockDetectedEvent, mockOfficialDetectionResult } from '../mockData';
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
  isPhoneMicRecording: boolean;
  inputMode: 'ble' | 'phone-mic';
  uploadStatus: UploadStatus;
  connectDevice: () => Promise<void>;
  receiveAutomaticEvent: (event: DetectedFartEvent) => void;
  startPhoneMicTest: () => Promise<void>;
  stopPhoneMicTest: () => Promise<void>;
  simulateAutomaticEvent: () => void;
  uploadLastEvent: () => Promise<void>;
};

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : "L'événement n'a pas pu être envoyé.";

const wait = (durationMs: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, durationMs));

const createProvisionalEvent = (source: 'ble' | 'phone-mic'): DetectedFartEvent => {
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
    source,
  };
};

export const useDetectionStore = create<DetectionState>((set, get) => ({
  bleStatus: 'connected',
  device: {
    id: 'FT-SOCIAL-DEMO-01',
    name: 'FartTag de Camille',
    batteryLevel: 84,
    rssi: -58,
  },
  error: null,
  lastEvent: mockDetectedEvent,
  inputMode: 'ble',
  officialResult: mockOfficialDetectionResult,
  isPhoneMicRecording: false,
  uploadStatus: 'uploaded',

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
      inputMode: 'ble',
    });
  },

  receiveAutomaticEvent: (event) => {
    set({
      error: null,
      lastEvent: event,
      officialResult: null,
      inputMode: event.source === 'phone-mic' ? 'phone-mic' : 'ble',
      uploadStatus: 'idle',
    });
  },

  simulateAutomaticEvent: () => {
    if (get().bleStatus !== 'connected') {
      return;
    }
    get().receiveAutomaticEvent(createProvisionalEvent('ble'));
  },

  startPhoneMicTest: async () => {
    if (get().isPhoneMicRecording) {
      return;
    }

    set({ error: null, isPhoneMicRecording: true });

    try {
      const granted = await PhoneMicService.requestPermission();
      if (!granted) {
        throw new Error('Le micro est nécessaire pour ce mode de test temporaire.');
      }

      await PhoneMicService.startRecording();
    } catch (error) {
      set({
        error: getErrorMessage(error),
        isPhoneMicRecording: false,
      });
    }
  },

  stopPhoneMicTest: async () => {
    if (!get().isPhoneMicRecording) {
      return;
    }

    set({ error: null });

    try {
      const capture = await PhoneMicService.stopRecording();
      const provisionalEvent: DetectedFartEvent = {
        audioLevel: capture.averageLevel,
        capturedAt: new Date().toISOString(),
        durationMs: capture.durationMs || 1_800,
        gasLevel: Math.round(Math.max(20, Math.min(100, capture.peakLevel * 0.9 + 9))),
        id: `phone-mic-${Date.now()}`,
        provisionalScore: Math.round(capture.averageLevel * 0.68 + capture.peakLevel * 0.32),
        source: 'phone-mic',
      };

      get().receiveAutomaticEvent(provisionalEvent);
    } catch (error) {
      set({
        error: getErrorMessage(error),
      });
    } finally {
      set({ isPhoneMicRecording: false });
    }
  },

  uploadLastEvent: async () => {
    const { device, inputMode, lastEvent } = get();
    const deviceId = device?.id ?? (inputMode === 'phone-mic' ? 'PHONE-MIC-TEST' : null);
    if (!deviceId || !lastEvent) {
      return;
    }

    set({ error: null, uploadStatus: 'pending' });
    try {
      const officialResult = await detectionApi.uploadEvent({
        audioLevel: lastEvent.audioLevel,
        capturedAt: lastEvent.capturedAt,
        clientEventId: lastEvent.id,
        deviceId,
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
