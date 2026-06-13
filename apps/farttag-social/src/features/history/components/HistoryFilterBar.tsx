import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '../../../theme/colors';
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
  <View style={styles.row}>
    {filters.map((filter) => {
      const active = activeFilter === filter.value;
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
    marginBottom: 16,
  },
  filter: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 13,
    paddingVertical: 8,
  },
  activeFilter: {
    backgroundColor: '#9CFF0015',
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
