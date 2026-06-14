export type HistoryFilter = 'all' | 'public' | 'private' | 'legendary';

export type AudioPlaybackStatus = 'idle' | 'loading' | 'playing' | 'error';

export type FartHistoryItem = {
  id: string;
  occurredAt: string;
  officialScore: number;
  durationMs: number;
  audioLevel: number;
  gasLevel: number;
  visibility: 'public' | 'private';
  category: string;
  isAuthenticated: boolean;
  isLegendary: boolean;
  audioFileId: string | null;
  audioReplayUrl: string | null;
};

// Kept for existing detection and profile consumers.
export type FartHistoryEvent = FartHistoryItem;

export type { FartDetails } from '../fart-details/types';

export type FartHistoryResponse = {
  items: FartHistoryItem[];
};
