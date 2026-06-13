import type { TelemetryFrame } from './telemetry';

export type CalibrationStepIndex = 0 | 1 | 2 | 3 | 4;

export type CalibrationResults = {
  recommendedAudioThreshold: number;
  recommendedGasThreshold: number;
  totalFrames: number;
  framesByStep: Partial<Record<CalibrationStepIndex, TelemetryFrame[]>>;
};

export type CalibrationConfiguration = {
  audioThreshold: number;
  gasThreshold: number;
  cooldownSeconds: number;
  gasAnalysisWindowSeconds: number;
  confidencePercent: number;
  recommendedProfile: string;
};

export type CalibrationProfile = CalibrationConfiguration & {
  id: string;
  name: string;
  createdAt: string;
};

export type MicrophoneGain = 'low' | 'medium' | 'high';

export type CalibrationPreset =
  | 'Sensitive'
  | 'Normal'
  | 'Anti False Positive'
  | 'Competition';

export type ManualCalibrationConfiguration = {
  audioThreshold: number;
  gasThreshold: number;
  cooldownMs: number;
  gasWindowMs: number;
  microphoneGain: MicrophoneGain;
  ambientNoiseFilterEnabled: boolean;
  preset: CalibrationPreset;
};
