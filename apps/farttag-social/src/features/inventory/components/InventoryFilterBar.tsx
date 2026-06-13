import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '../../../theme/colors';

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
  <View style={styles.row}>
    {filters.map((filter) => {
      const active = filter.value === activeFilter;

      return (
        <Pressable
          key={filter.value}
          onPress={() => onChange(filter.value)}
          style={[styles.filter, active && styles.activeFilter]}
        >
          <Text style={[styles.label, active && styles.activeLabel]}>{filter.label}</Text>
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
  filter: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  activeFilter: {
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
