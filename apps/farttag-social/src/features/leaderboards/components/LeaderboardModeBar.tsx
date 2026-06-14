import React from 'react';

import { SubmenuTabs } from '../../../shared/components';
import type { LeaderboardMode } from '../types';

type LeaderboardModeBarProps = {
  activeMode: LeaderboardMode;
  onChange: (mode: LeaderboardMode) => void;
};

const modes: { label: string; value: LeaderboardMode }[] = [
  { label: 'Global', value: 'global' },
  { label: 'Amis', value: 'friends' },
  { label: 'Semaine', value: 'week' },
  { label: 'Meilleur score', value: 'bestScore' },
  { label: 'Plus long', value: 'longest' },
  { label: 'Plus toxique', value: 'mostToxic' },
  { label: 'Legendaire', value: 'legendary' },
];

export const LeaderboardModeBar = ({ activeMode, onChange }: LeaderboardModeBarProps) => (
  <SubmenuTabs activeTab={activeMode} onChange={onChange} tabs={modes} />
);
