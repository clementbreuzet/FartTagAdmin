export type HistoryFilter = 'all' | 'public' | 'private' | 'legendary';

export type FartHistoryEvent = {
  id: string;
  occurredAt: string;
  officialScore: number;
  durationMs: number;
  audioLevel: number;
  gasLevel: number;
  visibility: 'public' | 'private';
  isLegendary: boolean;
  audioReplayUrl: string | null;
};

export type FartHistoryResponse = {
  items: FartHistoryEvent[];
};
