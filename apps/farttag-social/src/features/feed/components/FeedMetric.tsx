import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors } from '../../../theme/colors';

type FeedMetricProps = {
  accent?: 'green' | 'cyan' | 'purple';
  label: string;
  value: string;
};

const accents = {
  green: colors.neonGreen,
  cyan: colors.neonCyan,
  purple: colors.neonPurple,
};

export const FeedMetric = ({ accent = 'cyan', label, value }: FeedMetricProps) => (
  <View style={[styles.metric, { borderColor: accents[accent] }]}>
    <Text style={styles.label}>{label}</Text>
    <Text style={[styles.value, { color: accents[accent] }]}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  metric: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: 12,
    borderWidth: 1,
    flex: 1,
    minWidth: '29%',
    paddingHorizontal: 10,
    paddingVertical: 9,
  },
  label: {
    color: colors.textMuted,
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  value: {
    fontSize: 14,
    fontWeight: '900',
    marginTop: 4,
  },
});
