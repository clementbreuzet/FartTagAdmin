export type BleStatus = 'disconnected' | 'connecting' | 'connected';
export type UploadStatus = 'idle' | 'pending' | 'uploaded' | 'error';

export type ConnectedFartTag = {
  id: string;
  name: string;
  batteryLevel: number;
  rssi: number;
};

export type DetectedFartEvent = {
  id: string;
  capturedAt: string;
  durationMs: number;
  audioLevel: number;
  gasLevel: number;
  provisionalScore: number;
};

export type OfficialFartResult = {
  fartEventId: string;
  officialScore: number;
  flatulonsEarned: number;
  unlockedBadges: {
    id: string;
    name: string;
  }[];
  ranking: {
    position: number;
    scope: string;
  } | null;
};

export type CreateFartEventRequest = {
  clientEventId: string;
  deviceId: string;
  capturedAt: string;
  durationMs: number;
  audioLevel: number;
  gasLevel: number;
  provisionalScore: number;
};
