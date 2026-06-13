import type { FartReactionType, ReactionSummary } from '../feed/types';

export type FartVisibility = 'public' | 'private';

export type FartDetails = {
  id: string;
  occurredAt: string;
  officialScore: number;
  isAuthenticated: boolean;
  audioLevel: number;
  gasLevel: number;
  durationMs: number;
  temperatureCelsius: number;
  visibility: FartVisibility;
  audioReplayUrl: string | null;
  device: {
    id: string;
    name: string;
    model: string;
  };
  rewards: {
    flatulons: number;
    badges: {
      id: string;
      name: string;
    }[];
  };
  reactions: ReactionSummary;
  comments: {
    id: string;
    authorDisplayName: string;
    message: string;
    createdAt: string;
  }[];
};

export type VisibilityResponse = {
  fartEventId: string;
  visibility: FartVisibility;
};

export type ReactionResponse = {
  fartEventId: string;
  reactions: ReactionSummary;
};

export type ReactToFartRequest = {
  reactionType: FartReactionType;
};
