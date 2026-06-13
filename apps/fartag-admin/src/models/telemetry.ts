export type TelemetryFrame = {
  timestampMs: number;
  audioLevel: number;
  gasLevel: number;
  temperature: number;
  score: number;
  soundDetected: boolean;
  gasDetected: boolean;
};

export type TelemetryPoint = {
  timestampMs: number;
  value: number;
};
