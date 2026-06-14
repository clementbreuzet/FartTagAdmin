import React from 'react';

import { SubmenuTabs } from '../../../shared/components';
import type { BadgeFilter } from '../types';

type BadgeFilterBarProps = {
  activeFilter: BadgeFilter;
  onChange: (filter: BadgeFilter) => void;
};

const filters: { label: string; value: BadgeFilter }[] = [
  { label: 'Tous', value: 'all' },
  { label: 'Common', value: 'common' },
  { label: 'Rare', value: 'rare' },
  { label: 'Epic', value: 'epic' },
  { label: 'Legendary', value: 'legendary' },
  { label: 'Mythic', value: 'mythic' },
];

export const BadgeFilterBar = ({ activeFilter, onChange }: BadgeFilterBarProps) => (
  <SubmenuTabs activeTab={activeFilter} onChange={onChange} tabs={filters} />
);
