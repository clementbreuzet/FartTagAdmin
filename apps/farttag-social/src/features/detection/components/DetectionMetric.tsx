import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors } from '../../../theme/colors';

type DetectionMetricProps = {
  accent?: 'green' | 'cyan' | 'purple';
  label: string;
  value: string;
};

const accents = {
  green: colors.neonGreen,
  cyan: colors.neonCyan,
  purple: colors.neonPurple,
};

export const DetectionMetric = ({ accent = 'cyan', label, value }: DetectionMetricProps) => (
  <View style={[styles.metric, { borderColor: accents[accent] }]}>
    <Text style={styles.label}>{label}</Text>
    <Text style={[styles.value, { color: accents[accent] }]}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  metric: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: 14,
    borderWidth: 1,
    flex: 1,
    minWidth: '46%',
    padding: 12,
  },
  label: {
    color: colors.textMuted,
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.9,
    textTransform: 'uppercase',
  },
  value: {
    fontSize: 19,
    fontWeight: '900',
    marginTop: 6,
  },
});
