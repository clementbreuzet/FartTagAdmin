import { create } from 'zustand';

import type { AudioRecording } from '../models/AudioRecording';

type AudioStore = {
  recordings: AudioRecording[];
  isRecording: boolean;
  currentDurationMs: number;
  currentLevel: number;
  addRecording: (recording: AudioRecording) => void;
  setRecordingState: (
    isRecording: boolean,
    currentDurationMs?: number,
    currentLevel?: number,
  ) => void;
  updateLiveMetrics: (durationMs: number, level: number) => void;
};

export const useAudioStore = create<AudioStore>((set) => ({
  recordings: [],
  isRecording: false,
  currentDurationMs: 0,
  currentLevel: 0,
  addRecording: (recording) =>
    set((state) => ({
      recordings: [
        recording,
        ...state.recordings.filter((candidate) => candidate.id !== recording.id),
      ],
    })),
  setRecordingState: (
    isRecording,
    currentDurationMs = 0,
    currentLevel = 0,
  ) => set({ isRecording, currentDurationMs, currentLevel }),
  updateLiveMetrics: (currentDurationMs, currentLevel) =>
    set({ currentDurationMs, currentLevel }),
}));
