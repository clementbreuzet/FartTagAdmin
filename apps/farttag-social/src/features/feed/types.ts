export type FartReactionType = 'fire' | 'laugh' | 'shock';

export type ReactionSummary = {
  fire: number;
  laugh: number;
  shock: number;
  viewerReaction: FartReactionType | null;
};

export type FeedUser = {
  id: string;
  displayName: string;
  username: string;
  avatarUrl: string | null;
};

export type PublicFartEvent = {
  id: string;
  user: FeedUser;
  createdAt: string;
  score: number;
  durationMs: number;
  audioLevelDb: number;
  gasLevelKohms: number;
  isAuthenticated: boolean;
  audioReplayUrl: string | null;
  reactions: ReactionSummary;
  commentsCount: number;
};

export type FeedResponse = {
  items: PublicFartEvent[];
};

export type ReactToFartResponse = {
  fartEventId: string;
  reactions: ReactionSummary;
};
