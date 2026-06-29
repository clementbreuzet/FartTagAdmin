import type { BadgeDefinition, UserBadgeProgress } from './badges/types';
import type { DetectedFartEvent, OfficialFartResult } from './detection/types';
import type { FartDetails } from './fart-details/types';
import type { PublicFartEvent } from './feed/types';
import type { FartHistoryEvent } from './history/types';
import type { FriendCard, FriendRequest } from './friends/types';
import type { InventoryItem, UserProfile, Wallet } from './profile/types';
import type { LeaderboardEntry } from './leaderboards/types';
import type { LootboxDefinition, LootboxReward, OpenLootboxResponse } from './shop/types';

const baseUser = {
  avatarUrl: null,
  displayName: 'Camille Neon',
  id: 'user-camille-neon',
  username: 'camille_neon',
};

export const mockWallet: Wallet = {
  flatulons: 12480,
};

export const mockProfile: UserProfile = {
  id: baseUser.id,
  username: baseUser.username,
  displayName: baseUser.displayName,
  avatarUrl: baseUser.avatarUrl,
  equippedTitle: 'Gaz Royal',
  equippedFrame: {
    accentColor: '#00E5FF',
    id: 'frame-cyan-wave',
    name: 'Cadre Onde Cyan',
  },
  level: 18,
  levelProgressPercent: 64,
  location: {
    city: 'Montesson',
    continent: 'Europe',
    country: 'France',
  },
  globalStats: {
    averageOfficialScore: 87,
    legendaryFarts: 7,
    publicFarts: 28,
    totalFarts: 91,
    totalReactionsReceived: 412,
  },
  bestFart: {
    id: 'fart-best-001',
    officialScore: 99,
    occurredAt: '2026-06-12T18:20:00.000Z',
  },
  recentBadges: [
    {
      description: 'Atteins 50 points officiels.',
      id: 'badge-legend',
      name: 'Neon Legend',
      unlockedAt: '2026-06-11T10:00:00.000Z',
    },
  ],
  rankings: {
    averageScore: 1,
    bestScore: 1,
    scope: 'world',
    totalDurationMs: 1,
    totalFarts: 1,
    totalGasLevel: 1,
    userCount: 1,
  },
};

export const mockInventory: InventoryItem[] = [
  {
    id: 'inv-title-royal',
    isEquipped: true,
    isShowcased: false,
    name: 'Gaz Royal',
    rarity: 'legendary',
    slot: 'title',
    sourceLabel: 'Recompense de saison',
    type: 'title',
  },
  {
    id: 'inv-frame-cyan',
    isEquipped: true,
    isShowcased: true,
    name: 'Cadre Onde Cyan',
    rarity: 'epic',
    slot: 'frame',
    sourceLabel: 'Lootbox premium',
    type: 'frame',
  },
  {
    id: 'inv-effect-spark',
    isEquipped: true,
    isShowcased: false,
    name: 'Trace Electrique',
    rarity: 'rare',
    slot: 'effect',
    sourceLabel: 'Quete detection',
    type: 'effect',
  },
  {
    id: 'inv-sticker-wink',
    isEquipped: false,
    isShowcased: true,
    name: 'Sticker Wink',
    rarity: 'common',
    slot: 'none',
    sourceLabel: 'Evenement communautaire',
    type: 'sticker',
  },
  {
    id: 'inv-mythic-vortex',
    isEquipped: false,
    isShowcased: true,
    name: 'Vortex Mythique',
    rarity: 'mythic',
    slot: 'none',
    sourceLabel: 'Boss gacha',
    type: 'mythic',
  },
];

export const mockFeedEvents: PublicFartEvent[] = [
  {
    audioReplayUrl: null,
    audioLevelDb: 78.4,
    category: 'legendary',
    commentsCount: 8,
    createdAt: '2026-06-13T12:30:00.000Z',
    durationMs: 1820,
    gasLevelKohms: 92.7,
    id: 'feed-001',
    isAuthenticated: true,
    reactions: { heart: 4, fire: 18, laugh: 12, viewerReaction: null },
    score: 94,
    user: baseUser,
    visibility: 'public',
  },
];

export const mockHistoryEvents: FartHistoryEvent[] = [
  {
    audioLevel: 77.1,
    audioFileId: null,
    audioReplayUrl: null,
    category: 'legendary',
    durationMs: 1680,
    gasLevel: 88.2,
    id: 'hist-001',
    isAuthenticated: true,
    isLegendary: true,
    occurredAt: '2026-06-12T20:15:00.000Z',
    officialScore: 97,
    visibility: 'public',
  },
  {
    audioLevel: 69.4,
    audioFileId: null,
    audioReplayUrl: null,
    category: 'rare',
    durationMs: 1320,
    gasLevel: 74.8,
    id: 'hist-002',
    isAuthenticated: true,
    isLegendary: false,
    occurredAt: '2026-06-11T09:05:00.000Z',
    officialScore: 83,
    visibility: 'private',
  },
];

export const mockBadgeCatalog: BadgeDefinition[] = [
  {
    description: "Publie ton premier chef-d'oeuvre.",
    id: 'badge-first-public',
    iconGlyph: '◆',
    name: 'First Public',
    rarity: 'common',
    requirementLabel: 'Publier 1 fart public',
    targetValue: 1,
  },
  {
    description: 'Fais grimper la légende.',
    id: 'badge-legendary',
    iconGlyph: '⬣',
    name: 'Legendary',
    rarity: 'legendary',
    requirementLabel: 'Atteindre 10 farts légendaires',
    targetValue: 10,
  },
];

export const mockBadgeProgress: UserBadgeProgress[] = [
  {
    badgeId: 'badge-first-public',
    currentValue: 1,
    isUnlocked: true,
    unlockedAt: '2026-06-10T12:00:00.000Z',
  },
  {
    badgeId: 'badge-legendary',
    currentValue: 7,
    isUnlocked: false,
    unlockedAt: null,
  },
];

export const mockFriends: FriendCard[] = [
  {
    avatarUrl: null,
    badgeRarity: 'epic',
    displayName: 'Nina Volt',
    id: 'friend-001',
    level: 16,
    title: 'Gaz Pro',
    userId: 'user-nina-volt',
    username: 'nina_volt',
  },
  {
    avatarUrl: null,
    badgeRarity: 'rare',
    displayName: 'Max Sonic',
    id: 'friend-002',
    level: 12,
    title: 'Echo Master',
    userId: 'user-max-sonic',
    username: 'max_sonic',
  },
];

export const mockFriendRequestsIncoming: FriendRequest[] = [
  {
    avatarUrl: null,
    displayName: 'Theo Pulse',
    id: 'request-in-001',
    message: 'On joue ensemble ce soir ?',
    requestId: 'request-in-001',
    requestedAt: '2026-06-13T11:00:00.000Z',
    userId: 'user-theo-pulse',
    username: 'theo_pulse',
  },
];

export const mockFriendRequestsOutgoing: FriendRequest[] = [
  {
    avatarUrl: null,
    displayName: 'Lina Wave',
    id: 'request-out-001',
    message: 'Demande en attente',
    requestId: 'request-out-001',
    requestedAt: '2026-06-13T09:00:00.000Z',
    userId: 'user-lina-wave',
    username: 'lina_wave',
  },
];

export const mockLeaderboardGlobal: LeaderboardEntry[] = [
  {
    avatarUrl: null,
    badgeRarity: 'legendary',
    displayName: 'Camille Neon',
    id: 'leader-001',
    officialScore: 999,
    rank: 1,
    title: 'Gaz Royal',
    userId: 'user-camille-neon',
    username: 'camille_neon',
  } as LeaderboardEntry & { userId: string },
  {
    avatarUrl: null,
    badgeRarity: 'epic',
    displayName: 'Nina Volt',
    id: 'leader-002',
    officialScore: 912,
    rank: 2,
    title: 'Echo Master',
    userId: 'user-nina-volt',
    username: 'nina_volt',
  } as LeaderboardEntry & { userId: string },
];

export const mockLeaderboardFriends: LeaderboardEntry[] = [
  {
    avatarUrl: null,
    badgeRarity: 'epic',
    displayName: 'Nina Volt',
    id: 'leader-friend-001',
    officialScore: 912,
    rank: 1,
    title: 'Echo Master',
    userId: 'user-nina-volt',
    username: 'nina_volt',
  } as LeaderboardEntry & { userId: string },
];

export const mockLootboxes: LootboxDefinition[] = [
  {
    description: 'Un reacteur fiable avec une chance de rarete verte.',
    iconGlyph: '◉',
    id: 'lootbox-rare',
    name: 'Réacteur Rare',
    probability: 68,
    priceFlatulons: 500,
    rarity: 'rare',
  },
  {
    description: 'Des objets plus flashy et une vraie aura.',
    iconGlyph: '⬢',
    id: 'lootbox-epic',
    name: 'Réacteur Épique',
    probability: 24,
    priceFlatulons: 1200,
    rarity: 'epic',
  },
  {
    description: 'Peut sortir un objet mythique.',
    iconGlyph: '◆',
    id: 'lootbox-mythic',
    name: 'Réacteur Mythique',
    probability: 8,
    priceFlatulons: 3000,
    rarity: 'mythic',
  },
];

export const mockLootboxRewardById: Record<string, LootboxReward> = {
  'lootbox-rare': {
    description: 'Cadre rare néon.',
    id: 'reward-frame-rare',
    iconGlyph: '◉',
    name: 'Cadre Pulse',
    rarity: 'rare',
  },
  'lootbox-epic': {
    description: 'Sticker épique brillant.',
    id: 'reward-sticker-epic',
    iconGlyph: '⬢',
    name: 'Sticker Flash',
    rarity: 'epic',
  },
  'lootbox-mythic': {
    description: 'Objet mythique ultra rare.',
    id: 'reward-mythic-001',
    iconGlyph: '◆',
    name: 'Artefact Mythique',
    rarity: 'mythic',
  },
};

export const mockOpenLootboxResponse = (lootboxId: string): OpenLootboxResponse => ({
  lootboxId,
  reward: mockLootboxRewardById[lootboxId] ?? mockLootboxRewardById['lootbox-rare'],
  wallet: {
    flatulons: 10880,
  },
});

export const mockFartDetailsById: Record<string, FartDetails> = {
  'fart-best-001': {
    audioLevel: 82.4,
    audioFileId: null,
    audioReplayUrl: null,
    category: 'legendary',
    comments: [
      {
        authorDisplayName: 'Nina Volt',
        createdAt: '2026-06-12T18:40:00.000Z',
        id: 'comment-1',
        message: 'Légendaire.',
      },
    ],
    device: {
      id: 'device-001',
      model: 'FartTag Pro X',
      name: 'FartTag de Camille',
    },
    durationMs: 1820,
    gasLevel: 92.7,
    id: 'fart-best-001',
    isAuthenticated: true,
    occurredAt: '2026-06-12T18:20:00.000Z',
    officialScore: 99,
    reactions: { heart: 4, fire: 18, laugh: 12, viewerReaction: null },
    rewards: {
      badges: [{ id: 'badge-legend', name: 'Neon Legend' }],
      flatulons: 150,
    },
    temperatureCelsius: 27.4,
    visibility: 'public',
  },
};

export const mockOfficialDetectionResult: OfficialFartResult = {
  fartEventId: 'local-demo-event',
  flatulonsEarned: 42,
  currentLevelXp: 640,
  leveledUp: false,
  newFlatulons: 12522,
  newLevel: 18,
  oldFlatulons: 12480,
  oldLevel: 18,
  progressPercent: 64,
  ranking: {
    position: 12,
    scope: 'global',
  },
  officialScore: 86,
  requiredLevelXp: 1000,
  totalXp: 17640,
  unlockedBadges: [{ id: 'badge-first-public', name: 'First Public' }],
  xpGained: 96,
};

export const mockDetectedEvent: DetectedFartEvent = {
  audioLevel: 78.5,
  capturedAt: '2026-06-13T18:00:00.000Z',
  durationMs: 1610,
  gasLevel: 84.1,
  id: 'local-demo-event',
  provisionalScore: 83,
  source: 'ble',
};
