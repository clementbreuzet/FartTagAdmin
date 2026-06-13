import type { DeviceSource } from './device';

export type EventDecision = 'accepted' | 'rejected' | 'error' | 'audio_only';

export type EventLog = {
  id: string;
  source: DeviceSource;
  timestampMs: number;
  eventType: string;
  audioLevel: number;
  gasLevel: number;
  score: number;
  decision: EventDecision;
  reason: string;
  audioSampleId?: string;
  audioUri?: string;
  durationMs?: number;
};
