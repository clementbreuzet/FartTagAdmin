export type BadgeRarity = 'common' | 'rare' | 'epic' | 'legendary' | 'mythic';
export type BadgeFilter = 'all' | BadgeRarity;

export type BadgeDefinition = {
  id: string;
  name: string;
  description: string;
  rarity: BadgeRarity;
  iconGlyph: string;
  requirementLabel: string;
  targetValue: number;
};

export type UserBadgeProgress = {
  badgeId: string;
  currentValue: number;
  isUnlocked: boolean;
  unlockedAt: string | null;
};

export type BadgeCatalogResponse = {
  items: BadgeDefinition[];
};

export type UserBadgesResponse = {
  items: UserBadgeProgress[];
};

export type BadgeViewModel = BadgeDefinition & UserBadgeProgress & {
  progressPercent: number;
};
