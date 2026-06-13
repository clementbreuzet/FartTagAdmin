import type { BadgeDefinition, BadgeRarity, UserBadgeProgress } from '../features/badges/types';
import type { OfficialFartResult } from '../features/detection/types';
import type { FartDetails, FartVisibility, ReactionResponse, VisibilityResponse } from '../features/fart-details/types';
import type { FartReactionType, PublicFartEvent, ReactionSummary } from '../features/feed/types';
import type { FriendCard, FriendRequest } from '../features/friends/types';
import type { FartHistoryEvent } from '../features/history/types';
import type { LeaderboardBadgeRarity, LeaderboardEntry } from '../features/leaderboards/types';
import type { InventoryItem, UserProfile, Wallet } from '../features/profile/types';
import type { LootboxDefinition, LootboxRarity, OpenLootboxResponse } from '../features/shop/types';
import type {
  BackendBadge,
  BackendFartEvent,
  BackendFartHistoryItem,
  BackendFeedItem,
  BackendFriend,
  BackendFriendRequest,
  BackendInventoryItem,
  BackendInventoryResponse,
  BackendLeaderboardBoard,
  BackendLeaderboardEntry,
  BackendLootBox,
  BackendMe,
  BackendOpenLootBoxResult,
  BackendReactionSummary,
  BackendUserBadge,
  BackendWallet,
} from './backendContracts';

const badgeRarities: BadgeRarity[] = ['common', 'rare', 'epic', 'legendary', 'mythic'];
const reactionTypes: FartReactionType[] = ['fire', 'laugh', 'shock'];

const normalizeBadgeRarity = (rarity: string | null): BadgeRarity => {
  const normalized = rarity?.toLowerCase() as BadgeRarity | undefined;
  return normalized && badgeRarities.includes(normalized) ? normalized : 'common';
};

const normalizeLeaderboardRarity = (rarity: string | null): LeaderboardBadgeRarity | null =>
  rarity ? normalizeBadgeRarity(rarity) : null;

const normalizeReaction = (reaction: string | null): FartReactionType | null => {
  const normalized = reaction?.toLowerCase() as FartReactionType | undefined;
  return normalized && reactionTypes.includes(normalized) ? normalized : null;
};

const normalizeVisibility = (visibility: string | number): FartVisibility =>
  visibility === 1 || String(visibility).toLowerCase() === 'public' ? 'public' : 'private';

const iconForRarity = (rarity: string) => {
  switch (normalizeBadgeRarity(rarity)) {
    case 'mythic':
      return 'M';
    case 'legendary':
      return 'L';
    case 'epic':
      return 'E';
    case 'rare':
      return 'R';
    default:
      return 'C';
  }
};

export const mapReactionSummary = (reaction: BackendReactionSummary): ReactionSummary => ({
  fire: reaction.fire,
  laugh: reaction.laugh,
  shock: reaction.shock,
  viewerReaction: normalizeReaction(reaction.viewerReaction),
});

export const mapFeedItem = (item: BackendFeedItem): PublicFartEvent => ({
  id: item.id,
  user: {
    id: item.userId,
    displayName: item.userName,
    username: item.userName,
    avatarUrl: item.avatarUrl,
  },
  createdAt: item.timestamp,
  score: item.officialScore,
  durationMs: item.durationMs,
  audioLevelDb: item.audioLevel,
  gasLevelKohms: item.gasLevel,
  isAuthenticated: item.isAuthenticated,
  audioReplayUrl: null,
  reactions: mapReactionSummary(item.reactions),
  commentsCount: item.commentsCount,
});

const mapLeaderboardEntry = (entry: BackendLeaderboardEntry): LeaderboardEntry => ({
  id: entry.userId,
  rank: entry.rank,
  userId: entry.userId,
  username: entry.userName,
  displayName: entry.userName,
  avatarUrl: entry.avatarUrl,
  title: entry.equippedTitle,
  officialScore: entry.score,
  badgeRarity: normalizeLeaderboardRarity(entry.featuredBadgeRarity),
  durationMs: entry.durationMs,
  gasLevel: entry.gasLevel,
  isLegendary: normalizeLeaderboardRarity(entry.featuredBadgeRarity) === 'legendary',
});

export const mapLeaderboardBoard = (board: BackendLeaderboardBoard): LeaderboardEntry[] =>
  board.entries.map(mapLeaderboardEntry);

export const mapFriend = (friend: BackendFriend): FriendCard => ({
  id: friend.userId,
  userId: friend.userId,
  username: friend.userName,
  displayName: friend.userName,
  avatarUrl: friend.avatarUrl,
  title: null,
  badgeRarity: null,
  level: null,
});

export const mapFriendRequest = (
  request: BackendFriendRequest,
  direction: 'incoming' | 'outgoing',
): FriendRequest => {
  const isIncoming = direction === 'incoming';
  return {
    id: request.id,
    requestId: request.id,
    userId: isIncoming ? request.requesterUserId : request.recipientUserId,
    username: isIncoming ? request.requesterUserName : request.recipientUserName,
    displayName: isIncoming ? request.requesterUserName : request.recipientUserName,
    avatarUrl: isIncoming ? request.requesterAvatarUrl : request.recipientAvatarUrl,
    message: request.status,
    requestedAt: request.requestedAt,
  };
};

export const mapBadge = (badge: BackendBadge): BadgeDefinition => ({
  id: badge.id,
  name: badge.name,
  description: badge.description,
  rarity: normalizeBadgeRarity(badge.rarity),
  iconGlyph: badge.iconKey ?? iconForRarity(badge.rarity),
  requirementLabel: badge.description,
  targetValue: 1,
});

export const mapUserBadge = (badge: BackendUserBadge): UserBadgeProgress => ({
  badgeId: badge.badgeId,
  currentValue: 1,
  isUnlocked: true,
  unlockedAt: badge.earnedAt,
});

const normalizeInventoryType = (category: string): InventoryItem['type'] => {
  switch (category.toLowerCase()) {
    case 'title':
      return 'title';
    case 'profileframe':
      return 'frame';
    case 'detectioneffect':
      return 'effect';
    case 'sticker':
      return 'sticker';
    case 'mythicitem':
      return 'mythic';
    default:
      return 'other';
  }
};

const slotForType = (type: InventoryItem['type']): InventoryItem['slot'] => {
  if (type === 'title' || type === 'frame' || type === 'effect') {
    return type;
  }
  return 'none';
};

export const mapInventoryItem = (item: BackendInventoryItem): InventoryItem => {
  const type = normalizeInventoryType(item.category);
  return {
    id: item.inventoryItemId,
    name: item.name,
    type,
    rarity: normalizeBadgeRarity(item.rarity),
    isShowcased: false,
    isEquipped: item.isEquipped,
    sourceLabel: item.isDuplicate
      ? `Doublon compense: ${item.duplicateCompensationFlatulons ?? 0} Flatulons`
      : 'Reacteur a Gaz',
    slot: slotForType(type),
  };
};

export const mapInventory = (response: BackendInventoryResponse): InventoryItem[] =>
  response.items.map(mapInventoryItem);

export const mapEquippedInventoryIds = (response: BackendInventoryResponse) => ({
  titleId: response.equippedTitleInventoryItemId,
  frameId: response.equippedProfileFrameInventoryItemId,
  effectId: response.equippedDetectionEffectInventoryItemId,
});

const lootboxRarity = (lootbox: BackendLootBox): LootboxRarity => {
  const name = lootbox.name.toLowerCase();
  if (name.includes('myth')) {
    return 'mythic';
  }
  if (name.includes('epic') || name.includes('epique')) {
    return 'epic';
  }
  return 'rare';
};

export const mapLootBox = (lootbox: BackendLootBox): LootboxDefinition => {
  const rarity = lootboxRarity(lootbox);
  const totalWeight = lootbox.rewards.reduce((total, reward) => total + reward.weight, 0);
  const rarityWeight = lootbox.rewards
    .filter((reward) => reward.rarity.toLowerCase() === rarity)
    .reduce((total, reward) => total + reward.weight, 0);

  return {
    id: lootbox.id,
    name: lootbox.name,
    description: lootbox.description,
    rarity,
    priceFlatulons: lootbox.priceFlatulons,
    probability: totalWeight > 0 ? Math.round((rarityWeight / totalWeight) * 100) : 0,
    iconGlyph: iconForRarity(rarity),
  };
};

export const mapOpenLootBox = (result: BackendOpenLootBoxResult): OpenLootboxResponse => ({
  lootboxId: result.lootBoxId,
  reward: {
    id: result.item.id,
    name: result.item.name,
    rarity: normalizeBadgeRarity(result.item.rarity),
    iconGlyph: result.item.assetKey ?? iconForRarity(result.item.rarity),
    description: result.item.description ?? result.item.category,
  },
  wallet: {
    flatulons: result.walletBalanceAfterOpen,
  },
});

export const mapWallet = (wallet: BackendWallet): Wallet => ({
  flatulons: wallet.balance,
});

export const mapMeToProfile = (me: BackendMe, fallback: UserProfile): UserProfile => ({
  ...fallback,
  id: me.id,
  username: me.userName,
  displayName: me.userName,
});

export const mapHistoryItem = (item: BackendFartHistoryItem): FartHistoryEvent => ({
  id: item.id,
  occurredAt: item.timestamp,
  officialScore: item.officialScore,
  durationMs: item.durationMs,
  audioLevel: item.audioLevel,
  gasLevel: item.gasLevel,
  visibility: normalizeVisibility(item.visibility),
  isLegendary: item.category.toLowerCase() === 'legendary' || item.category.toLowerCase() === 'mythic',
  audioReplayUrl: null,
});

export const mapFartDetails = (event: BackendFartEvent): FartDetails => ({
  id: event.id,
  occurredAt: event.timestamp,
  officialScore: event.officialScore,
  isAuthenticated: event.isAuthenticated,
  audioLevel: event.audioLevel,
  gasLevel: event.gasLevel,
  durationMs: event.durationMs,
  temperatureCelsius: event.temperature,
  visibility: normalizeVisibility(event.visibility),
  audioReplayUrl: null,
  device: {
    id: event.deviceId,
    name: 'FartTag',
    model: 'FartTag',
  },
  rewards: {
    flatulons: event.rewards
      .filter((reward) => reward.type.toLowerCase() === 'flatulons')
      .reduce((total, reward) => total + reward.amount, 0),
    badges: event.badges.map((name, index) => ({ id: `${event.id}-badge-${index}`, name })),
  },
  reactions: mapReactionSummary(event.reactions),
  comments: [],
});

export const mapOfficialFartResult = (event: BackendFartEvent): OfficialFartResult => ({
  fartEventId: event.id,
  officialScore: event.officialScore,
  flatulonsEarned: event.rewards
    .filter((reward) => reward.type.toLowerCase() === 'flatulons')
    .reduce((total, reward) => total + reward.amount, 0),
  unlockedBadges: event.badges.map((name, index) => ({ id: `${event.id}-badge-${index}`, name })),
  ranking: null,
});

export const mapVisibilityResponse = (event: BackendFartEvent): VisibilityResponse => ({
  fartEventId: event.id,
  visibility: normalizeVisibility(event.visibility),
});

export const mapReactionResponse = (event: BackendFartEvent): ReactionResponse => ({
  fartEventId: event.id,
  reactions: mapReactionSummary(event.reactions),
});
