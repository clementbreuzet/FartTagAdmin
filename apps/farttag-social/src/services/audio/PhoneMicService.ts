import {
  AudioModule,
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  type AudioRecorder,
} from 'expo-audio';

let activeRecorder: AudioRecorder | null = null;
let collectedLevels: number[] = [];

const normalizeMetering = (metering?: number) => {
  if (metering === undefined) {
    return 45;
  }

  return Math.round(Math.max(0, Math.min(100, metering + 100)));
};

export type PhoneMicCapture = {
  averageLevel: number;
  durationMs: number;
  peakLevel: number;
  uri: string;
};

export const PhoneMicService = {
  async requestPermission(): Promise<boolean> {
    const permission = await requestRecordingPermissionsAsync();
    return permission.granted;
  },

  async startRecording(): Promise<void> {
    if (activeRecorder) {
      return;
    }

    await setAudioModeAsync({
      allowsRecording: true,
      playsInSilentMode: true,
    });

    const recorder = new AudioModule.AudioRecorder({
      ...RecordingPresets.HIGH_QUALITY,
      directory: 'document',
      isMeteringEnabled: true,
    });

    await recorder.prepareToRecordAsync();
    recorder.record();
    activeRecorder = recorder;
    collectedLevels = [];
  },

  async getCurrentLevel(): Promise<{ durationMs: number; level: number }> {
    if (!activeRecorder) {
      return { durationMs: 0, level: 0 };
    }

    const status = activeRecorder.getStatus();
    const level = normalizeMetering(status.metering);
    collectedLevels.push(level);

    return {
      durationMs: status.durationMillis,
      level,
    };
  },

  async stopRecording(): Promise<PhoneMicCapture> {
    if (!activeRecorder) {
      throw new Error('Aucun enregistrement micro actif.');
    }

    const recorder = activeRecorder;
    const status = recorder.getStatus();
    await recorder.stop();
    activeRecorder = null;
    await setAudioModeAsync({ allowsRecording: false });

    if (!recorder.uri) {
      throw new Error("Le fichier audio n'a pas pu être sauvegardé.");
    }

    const averageLevel =
      collectedLevels.length > 0
        ? Math.round(collectedLevels.reduce((total, value) => total + value, 0) / collectedLevels.length)
        : 45;

    return {
      averageLevel,
      durationMs: status.durationMillis,
      peakLevel: collectedLevels.length > 0 ? Math.max(...collectedLevels) : averageLevel,
      uri: recorder.uri,
    };
  },
};
