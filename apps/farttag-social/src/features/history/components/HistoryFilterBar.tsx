import React from 'react';

import { SubmenuTabs } from '../../../shared/components';
import type { HistoryFilter } from '../types';

type HistoryFilterBarProps = {
  activeFilter: HistoryFilter;
  onChange: (filter: HistoryFilter) => void;
};

const filters: { label: string; value: HistoryFilter }[] = [
  { label: 'Tous', value: 'all' },
  { label: 'Publics', value: 'public' },
  { label: 'Privés', value: 'private' },
  { label: 'Légendaires', value: 'legendary' },
];

export const HistoryFilterBar = ({ activeFilter, onChange }: HistoryFilterBarProps) => (
  <SubmenuTabs activeTab={activeFilter} onChange={onChange} tabs={filters} />
);
