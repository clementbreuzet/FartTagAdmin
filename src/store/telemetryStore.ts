import { create } from 'zustand';

import type { TelemetryFrame, TelemetryPoint } from '../models/telemetry';

const MAX_HISTORY_POINTS = 40;

type TelemetryStore = {
  latestFrame: TelemetryFrame | null;
  recentFrames: TelemetryFrame[];
  audioHistory: TelemetryPoint[];
  gasHistory: TelemetryPoint[];
  scoreHistory: TelemetryPoint[];
  appendFrame: (frame: TelemetryFrame) => void;
  clearTelemetry: () => void;
};

const appendPoint = (
  history: TelemetryPoint[],
  point: TelemetryPoint,
): TelemetryPoint[] => [...history, point].slice(-MAX_HISTORY_POINTS);

export const useTelemetryStore = create<TelemetryStore>((set) => ({
  latestFrame: null,
  recentFrames: [],
  audioHistory: [],
  gasHistory: [],
  scoreHistory: [],
  appendFrame: (frame) =>
    set((state) => ({
      latestFrame: frame,
      recentFrames: [...state.recentFrames, frame].slice(-MAX_HISTORY_POINTS),
      audioHistory: appendPoint(state.audioHistory, {
        timestampMs: frame.timestampMs,
        value: frame.audioLevel,
      }),
      gasHistory: appendPoint(state.gasHistory, {
        timestampMs: frame.timestampMs,
        value: frame.gasLevel,
      }),
      scoreHistory: appendPoint(state.scoreHistory, {
        timestampMs: frame.timestampMs,
        value: frame.score,
      }),
    })),
  clearTelemetry: () =>
    set({
      latestFrame: null,
      recentFrames: [],
      audioHistory: [],
      gasHistory: [],
      scoreHistory: [],
    }),
}));
