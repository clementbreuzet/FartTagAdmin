import React from 'react';

import { SubmenuTabs } from '../../../shared/components';

export type InventoryFilter = 'all' | 'title' | 'frame' | 'effect' | 'sticker' | 'mythic';

type InventoryFilterBarProps = {
  activeFilter: InventoryFilter;
  onChange: (filter: InventoryFilter) => void;
};

const filters: { label: string; value: InventoryFilter }[] = [
  { label: 'Tous', value: 'all' },
  { label: 'Titres', value: 'title' },
  { label: 'Cadres', value: 'frame' },
  { label: 'Effets', value: 'effect' },
  { label: 'Stickers', value: 'sticker' },
  { label: 'Mythiques', value: 'mythic' },
];

export const InventoryFilterBar = ({ activeFilter, onChange }: InventoryFilterBarProps) => (
  <SubmenuTabs activeTab={activeFilter} onChange={onChange} tabs={filters} />
);
