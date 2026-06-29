export type FartReactionType = 'heart' | 'laugh' | 'fire';

export type ReactionSummary = {
  heart: number;
  fire: number;
  laugh: number;
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
  category: string;
  durationMs: number;
  audioLevelDb: number;
  gasLevelKohms: number;
  isAuthenticated: boolean;
  visibility: 'public';
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
