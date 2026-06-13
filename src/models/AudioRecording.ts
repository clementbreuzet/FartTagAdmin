export type AudioRecording = {
  id: string;
  uri: string;
  createdAt: string;
  durationMs: number;
  averageLevel?: number;
  peakLevel?: number;
};
