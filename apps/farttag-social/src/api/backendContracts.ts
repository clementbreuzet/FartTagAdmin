export type BackendReactionSummary = {
  fire: number;
  laugh: number;
  shock: number;
  heart: number;
  viewerReaction: string | null;
};

export type BackendFartReward = {
  type: string;
  label: string;
  amount: number;
};

export type BackendFartEvent = {
  id: string;
  userId: string;
  deviceId: string;
  audioFileId: string | null;
  timestamp: string;
  audioLevel: number;
  gasLevel: number;
  temperature: number;
  durationMs: number;
  localScore: number;
  officialScore: number;
  authenticity: number;
  isAuthenticated: boolean;
  category: string;
  visibility: string | number;
  rewards: BackendFartReward[];
  badges: string[];
  reactions: BackendReactionSummary;
};

export type BackendFartHistoryItem = {
  id: string;
  timestamp: string;
  officialScore: number;
  durationMs: number;
  audioLevel: number;
  gasLevel: number;
  temperature: number;
  isAuthenticated: boolean;
  category: string;
  visibility: string;
  reactions: BackendReactionSummary;
};

export type BackendFeedItem = {
  id: string;
  userId: string;
  userName: string;
  avatarUrl: string | null;
  officialScore: number;
  durationMs: number;
  audioLevel: number;
  gasLevel: number;
  temperature: number;
  timestamp: string;
  isAuthenticated: boolean;
  category: string;
  reactions: BackendReactionSummary;
  commentsCount: number;
};

export type BackendLeaderboardEntry = {
  rank: number;
  userId: string;
  userName: string;
  avatarUrl: string | null;
  equippedTitle: string | null;
  score: number;
  durationMs: number | null;
  gasLevel: number | null;
  featuredBadgeName: string | null;
  featuredBadgeRarity: string | null;
};

export type BackendLeaderboardBoard = {
  key: string;
  title: string;
  metricLabel: string;
  entries: BackendLeaderboardEntry[];
};

export type BackendLeaderboardsResponse = {
  global: BackendLeaderboardBoard;
  week: BackendLeaderboardBoard;
  longest: BackendLeaderboardBoard;
  toxic: BackendLeaderboardBoard;
};

export type BackendFriend = {
  userId: string;
  userName: string;
  avatarUrl: string | null;
  since: string;
};

export type BackendFriendRequest = {
  id: string;
  requesterUserId: string;
  requesterUserName: string;
  requesterAvatarUrl: string | null;
  recipientUserId: string;
  recipientUserName: string;
  recipientAvatarUrl: string | null;
  status: string;
  requestedAt: string;
  respondedAt: string | null;
};

export type BackendFriendRequestsResponse = {
  incoming: BackendFriendRequest[];
  outgoing: BackendFriendRequest[];
};

export type BackendBadge = {
  id: string;
  code: string;
  name: string;
  description: string;
  rarity: string;
  iconKey: string | null;
  isActive: boolean;
};

export type BackendUserBadge = {
  id: string;
  badgeId: string;
  code: string;
  name: string;
  description: string;
  rarity: string;
  iconKey: string | null;
  sourceFartEventId: string | null;
  earnedAt: string;
};

export type BackendInventoryItem = {
  userInventoryItemId: string;
  inventoryItemId: string;
  name: string;
  category: string;
  rarity: string;
  assetKey: string | null;
  description: string | null;
  isTradable: boolean;
  isEquipped: boolean;
  acquiredAt: string;
  isDuplicate: boolean;
  duplicateCompensationFlatulons: number | null;
  lootBoxRewardId: string;
};

export type BackendInventoryResponse = {
  equippedTitleInventoryItemId: string | null;
  equippedProfileFrameInventoryItemId: string | null;
  equippedDetectionEffectInventoryItemId: string | null;
  items: BackendInventoryItem[];
};

export type BackendLootBoxReward = {
  id: string;
  inventoryItemId: string;
  inventoryItemName: string;
  category: string;
  rarity: string;
  weight: number;
  duplicateCompensationFlatulons: number;
};

export type BackendLootBox = {
  id: string;
  name: string;
  description: string;
  priceFlatulons: number;
  isActive: boolean;
  rewards: BackendLootBoxReward[];
};

export type BackendOpenedInventoryItem = {
  id: string;
  name: string;
  category: string;
  rarity: string;
  assetKey: string | null;
  description: string | null;
  isTradable: boolean;
};

export type BackendOpenLootBoxResult = {
  lootBoxId: string;
  lootBoxName: string;
  item: BackendOpenedInventoryItem;
  isDuplicate: boolean;
  duplicateCompensationFlatulons: number;
  walletBalanceAfterOpen: number;
};

export type BackendWallet = {
  id: string;
  userId: string;
  currency: string;
  balance: number;
  createdAt: string;
};

export type BackendMe = {
  id: string;
  userName: string;
  email: string;
  roles: string[];
  permissions: string[];
};
