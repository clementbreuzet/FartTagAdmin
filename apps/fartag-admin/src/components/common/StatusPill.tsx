import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors } from '../../theme/colors';

type StatusPillProps = {
  label: string;
  status: 'active' | 'idle' | 'error' | 'warning';
};

const statusColors: Record<StatusPillProps['status'], string> = {
  active: colors.neonGreen,
  idle: colors.neonCyan,
  error: colors.danger,
  warning: colors.warning,
};

export const StatusPill = ({ label, status }: StatusPillProps) => {
  const color = statusColors[status];

  return (
    <View style={[styles.pill, { borderColor: color }]}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={[styles.label, { color }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  pill: {
    alignItems: 'center',
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: 'row',
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  dot: {
    borderRadius: 4,
    height: 7,
    marginRight: 7,
    width: 7,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
});
