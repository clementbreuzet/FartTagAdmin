export type LeaderboardMode =
  | 'global'
  | 'friends'
  | 'week'
  | 'bestScore'
  | 'longest'
  | 'mostToxic'
  | 'legendary';

export type LeaderboardBadgeRarity = 'common' | 'rare' | 'epic' | 'legendary' | 'mythic';

export type LeaderboardEntry = {
  id: string;
  rank: number;
  userId?: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  title: string | null;
  officialScore: number;
  badgeRarity: LeaderboardBadgeRarity | null;
  durationMs?: number | null;
  gasLevel?: number | null;
  audioLevel?: number | null;
  isLegendary?: boolean;
};

export type LeaderboardResponse = {
  items: LeaderboardEntry[];
};

export type LeaderboardBoards = {
  global: LeaderboardEntry[];
  week: LeaderboardEntry[];
  longest: LeaderboardEntry[];
  mostToxic: LeaderboardEntry[];
};
