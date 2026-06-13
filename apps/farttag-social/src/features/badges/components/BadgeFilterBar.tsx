import React from 'react';
import { ScrollView, Pressable, StyleSheet, Text } from 'react-native';

import { colors } from '../../../theme/colors';
import { rarityColors } from '../rarity';
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
  <ScrollView contentContainerStyle={styles.row} horizontal showsHorizontalScrollIndicator={false}>
    {filters.map((filter) => {
      const active = filter.value === activeFilter;
      const accent = filter.value === 'all' ? colors.neonGreen : rarityColors[filter.value];
      return (
        <Pressable
          key={filter.value}
          onPress={() => onChange(filter.value)}
          style={[styles.filter, active && { backgroundColor: `${accent}18`, borderColor: accent }]}
        >
          <Text style={[styles.label, active && { color: accent }]}>{filter.label}</Text>
        </Pressable>
      );
    })}
  </ScrollView>
);

const styles = StyleSheet.create({
  row: {
    gap: 8,
    paddingBottom: 16,
  },
  filter: {
    borderColor: colors.border,
    borderRadius: 13,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  label: {
    color: colors.textSecondary,
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
});
