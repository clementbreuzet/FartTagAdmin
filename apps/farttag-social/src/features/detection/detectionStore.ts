import { create } from 'zustand';

import { detectionApi } from './detectionApi';
import { PhoneMicService } from '../../services/audio/PhoneMicService';
import { mockDetectedEvent, mockOfficialDetectionResult } from '../mockData';
import { useHistoryStore } from '../history/historyStore';
import { useNotificationStore } from '../notifications/notificationStore';
import { NotificationService } from '../../services/notifications/NotificationService';
import type {
  BleStatus,
  ConnectedFartTag,
  DetectedFartEvent,
  OfficialFartResult,
  AudioSaveStatus,
  UploadStatus,
} from './types';

type DetectionState = {
  bleStatus: BleStatus;
  device: ConnectedFartTag | null;
  error: string | null;
  lastEvent: DetectedFartEvent | null;
  officialResult: OfficialFartResult | null;
  isPhoneMicRecording: boolean;
  audioSaveStatus: AudioSaveStatus;
  inputMode: 'ble' | 'phone-mic';
  uploadStatus: UploadStatus;
  connectDevice: () => Promise<void>;
  receiveAutomaticEvent: (event: DetectedFartEvent) => void;
  saveLastAudio: () => Promise<void>;
  startPhoneMicTest: () => Promise<void>;
  stopPhoneMicTest: () => Promise<void>;
  simulateAutomaticEvent: () => void;
  uploadLastEvent: () => Promise<void>;
};

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : "L'événement n'a pas pu être envoyé.";

const wait = (durationMs: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, durationMs));

const refreshHistoryAfterInsert = () => {
  console.log('[detection] FartEvent created, refreshing history');
  void useHistoryStore.getState().refreshHistory();
};

const notifyForOfficialResult = (result: OfficialFartResult) => {
  const { permissionStatus, preferences } = useNotificationStore.getState();
  if (preferences.rewardsEnabled && permissionStatus === 'granted') {
    void NotificationService.showFartDetectedNotification(result.officialScore, result.flatulonsEarned)
      .catch((error: unknown) => console.log('[notifications] Fart notification failed:', error));
    result.unlockedBadges.forEach((badge) => {
      void NotificationService.showRewardNotification(badge.name)
        .catch((error: unknown) => console.log('[notifications] Reward notification failed:', error));
    });
  }
};

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
  audioSaveStatus: 'idle',
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

  saveLastAudio: async () => {
    const { device, inputMode, lastEvent, uploadStatus } = get();
    const deviceId = inputMode === 'phone-mic' ? null : device?.id ?? null;
    if (
      !lastEvent ||
      (!lastEvent.audioUri && !lastEvent.audioFileId) ||
      uploadStatus === 'uploaded' ||
      (inputMode === 'ble' && !deviceId)
    ) {
      return;
    }

    set({ audioSaveStatus: 'saving', error: null, uploadStatus: 'pending' });
    try {
      const uploadedAudio = lastEvent.audioFileId
        ? {
            id: lastEvent.audioFileId,
            replayUrl: lastEvent.audioReplayUrl,
          }
        : await detectionApi.uploadAudio(lastEvent.audioUri!, lastEvent.durationMs);

      set((state) => ({
        lastEvent: state.lastEvent?.id === lastEvent.id
          ? {
              ...state.lastEvent,
              audioFileId: uploadedAudio.id,
              audioReplayUrl: uploadedAudio.replayUrl ?? state.lastEvent.audioReplayUrl,
            }
          : state.lastEvent,
      }));

      const officialResult = await detectionApi.uploadEvent({
        audioFileId: uploadedAudio.id,
        audioLevel: lastEvent.audioLevel,
        capturedAt: lastEvent.capturedAt,
        clientEventId: lastEvent.id,
        deviceId,
        durationMs: lastEvent.durationMs,
        gasLevel: lastEvent.gasLevel,
        provisionalScore: lastEvent.provisionalScore,
      });

      set((state) => ({
        audioSaveStatus: 'saved',
        officialResult,
        uploadStatus: 'uploaded',
        lastEvent: state.lastEvent,
      }));
      refreshHistoryAfterInsert();
      notifyForOfficialResult(officialResult);
    } catch (error) {
      set({ audioSaveStatus: 'error', error: getErrorMessage(error), uploadStatus: 'error' });
    }
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

    set({ audioSaveStatus: 'idle', error: null });

    try {
      const granted = await PhoneMicService.requestPermission();
      if (!granted) {
        throw new Error('Le micro est nécessaire pour ce mode de test temporaire.');
      }

      await PhoneMicService.startRecording();
      set({ isPhoneMicRecording: true });
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
      set({ isPhoneMicRecording: false });
      const provisionalEvent: DetectedFartEvent = {
        audioUri: capture.uri,
        audioLevel: capture.averageLevel,
        capturedAt: new Date().toISOString(),
        durationMs: capture.durationMs || 1_800,
        gasLevel: Math.round(Math.max(20, Math.min(100, capture.peakLevel * 0.9 + 9))),
        id: `phone-mic-${Date.now()}`,
        provisionalScore: Math.round(capture.averageLevel * 0.68 + capture.peakLevel * 0.32),
        source: 'phone-mic',
      };

      get().receiveAutomaticEvent(provisionalEvent);
      await get().saveLastAudio();
    } catch (error) {
      set({
        audioSaveStatus: 'error',
        error: getErrorMessage(error),
      });
    } finally {
      set({ isPhoneMicRecording: false });
    }
  },

  uploadLastEvent: async () => {
    const { device, inputMode, lastEvent } = get();
    const deviceId = inputMode === 'phone-mic' ? null : device?.id ?? null;
    if (!lastEvent || (inputMode === 'ble' && !deviceId)) {
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
        audioFileId: lastEvent.audioFileId,
        audioUri: lastEvent.audioUri,
      });
      set({ officialResult, uploadStatus: 'uploaded' });
      refreshHistoryAfterInsert();
      notifyForOfficialResult(officialResult);
    } catch (error) {
      set({ error: getErrorMessage(error), uploadStatus: 'error' });
    }
  },
}));
