export type BleStatus = 'disconnected' | 'connecting' | 'connected';
export type UploadStatus = 'idle' | 'pending' | 'uploaded' | 'error';
export type AudioSaveStatus = 'idle' | 'saving' | 'saved' | 'error';
export type DetectionSource = 'ble' | 'phone-mic';

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
  source?: DetectionSource;
  audioFileId?: string;
  audioReplayUrl?: string;
  audioUri?: string;
};

export type OfficialFartResult = {
  fartEventId: string;
  officialScore: number;
  xpGained: number;
  flatulonsEarned: number;
  oldLevel: number;
  newLevel: number;
  leveledUp: boolean;
  totalXp: number;
  currentLevelXp: number;
  requiredLevelXp: number;
  progressPercent: number;
  oldFlatulons: number;
  newFlatulons: number;
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
  deviceId: string | null;
  capturedAt: string;
  durationMs: number;
  audioLevel: number;
  gasLevel: number;
  provisionalScore: number;
  audioFileId?: string;
  audioUri?: string;
};
