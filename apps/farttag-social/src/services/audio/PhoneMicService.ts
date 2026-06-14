import {
  AudioModule,
  RecordingPresets,
  createAudioPlayer,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  type AudioPlayer,
  type AudioRecorder,
} from 'expo-audio';

let activeRecorder: AudioRecorder | null = null;
let activeRecordingUri: string | null = null;
let collectedLevels: number[] = [];
let meteringTimer: ReturnType<typeof setInterval> | null = null;
let activePlayer: AudioPlayer | null = null;

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
    if (!recorder.uri) {
      throw new Error("Le fichier audio n'a pas pu être préparé.");
    }

    activeRecordingUri = recorder.uri;
    recorder.record();
    activeRecorder = recorder;
    collectedLevels = [];
    meteringTimer = setInterval(() => {
      if (!activeRecorder) {
        return;
      }
      collectedLevels.push(normalizeMetering(activeRecorder.getStatus().metering));
    }, 150);
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
    const recordingUri = activeRecordingUri ?? recorder.uri;
    const status = recorder.getStatus();
    if (meteringTimer) {
      clearInterval(meteringTimer);
      meteringTimer = null;
    }
    await recorder.stop();
    activeRecorder = null;
    activeRecordingUri = null;
    await setAudioModeAsync({ allowsRecording: false });

    if (!recordingUri) {
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
      uri: recordingUri,
    };
  },

  play(uri: string): void {
    activePlayer?.release();
    activePlayer = createAudioPlayer(uri);
    activePlayer.play();
  },
};
