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
};

export type Wallet = {
  flatulons: number;
};

export type InventoryItem = {
  id: string;
  name: string;
  type: 'title' | 'frame' | 'collectible' | 'other';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  isShowcased: boolean;
};

export type InventoryResponse = {
  items: InventoryItem[];
};
