export type HomeFartEvent = {
  id: string;
  occurredAt: string;
  officialScore: number;
  durationMs: number;
  audioLevel: number;
  gasLevel: number;
  category: string;
  isAuthenticated: boolean;
};

export type HomeDashboard = {
  level: number;
  xp: number;
  flatulons: number;
  gems: number;
  dailyChallenge: {
    id: string;
    title: string;
    description: string;
    targetCount: number;
    rewardFlatulons: number;
  };
  dailyChallengeProgress: number;
  dailyChestAvailable: boolean;
  recentFarts: HomeFartEvent[];
};
