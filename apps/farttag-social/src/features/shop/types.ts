export type LootboxRarity = 'common' | 'rare' | 'epic' | 'legendary' | 'mythic';

export type LootboxDefinition = {
  id: string;
  name: string;
  description: string;
  rarity: LootboxRarity;
  priceFlatulons: number;
  probability: number;
  iconGlyph: string;
};

export type LootboxesResponse = {
  items: LootboxDefinition[];
};

export type LootboxReward = {
  id: string;
  name: string;
  rarity: LootboxRarity;
  iconGlyph: string;
  description: string;
};

export type OpenLootboxResponse = {
  lootboxId: string;
  reward: LootboxReward;
  wallet: {
    flatulons: number;
  };
};
