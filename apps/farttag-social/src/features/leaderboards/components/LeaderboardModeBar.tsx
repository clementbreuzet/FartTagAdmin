import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '../../../theme/colors';
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
  <View style={styles.row}>
    {modes.map((mode) => {
      const active = mode.value === activeMode;
      return (
        <Pressable
          key={mode.value}
          onPress={() => onChange(mode.value)}
          style={[styles.chip, active && styles.activeChip]}
        >
          <Text style={[styles.label, active && styles.activeLabel]}>{mode.label}</Text>
        </Pressable>
      );
    })}
  </View>
);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  chip: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  activeChip: {
    backgroundColor: '#9CFF0018',
    borderColor: colors.neonGreen,
  },
  label: {
    color: colors.textSecondary,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  activeLabel: {
    color: colors.neonGreen,
  },
});
