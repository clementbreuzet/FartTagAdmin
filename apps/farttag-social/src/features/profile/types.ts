export type RankingScope = 'world' | 'continent' | 'country' | 'city';

export type UserProfile = {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  equippedTitle: string | null;
  equippedFrame: {
    id: string;
    name: string;
    accentColor: string;
  } | null;
  level: number;
  levelProgressPercent: number;
  totalXp?: number;
  currentLevelXp?: number;
  requiredLevelXp?: number;
  flatulons?: number;
  gems?: number;
  location?: {
    continent: string;
    country: string;
    city: string;
  };
  globalStats: {
    totalFarts: number;
    publicFarts: number;
    legendaryFarts: number;
    averageOfficialScore: number;
    totalReactionsReceived: number;
  };
  bestFart: {
    id: string;
    officialScore: number;
    occurredAt: string;
  } | null;
  recentBadges: {
    id: string;
    name: string;
    description: string;
    unlockedAt: string;
  }[];
  xp?: number;
  stats?: {
    totalFarts: number;
    bestScore: number;
    averageScore: number;
    totalDurationMs: number;
    totalGasLevel: number;
  };
  rankings?: {
    scope: RankingScope;
    userCount: number;
    totalFarts: number | null;
    bestScore: number | null;
    averageScore: number | null;
    totalDurationMs: number | null;
    totalGasLevel: number | null;
  };
  notifications?: {
    socialEnabled: boolean;
    rewardsEnabled: boolean;
    challengesEnabled: boolean;
    dailyReminderEnabled: boolean;
    hasActivePushToken: boolean;
  };
  connectedDevice?: {
    id: string;
    name: string;
    model: string;
  } | null;
};

export type Wallet = {
  flatulons: number;
};

export type InventoryItem = {
  id: string;
  name: string;
  type: 'title' | 'frame' | 'effect' | 'sticker' | 'mythic' | 'collectible' | 'other';
  rarity: 'common' | 'rare' | 'epic' | 'legendary' | 'mythic';
  isShowcased: boolean;
  isEquipped: boolean;
  sourceLabel: string;
  slot: 'title' | 'frame' | 'effect' | 'none';
};

export type InventoryResponse = {
  items: InventoryItem[];
};
