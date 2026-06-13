import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors } from '../../theme/colors';
import { NeonCard } from '../common/NeonCard';
import { StatusPill } from '../common/StatusPill';

type MetricCardProps = {
  label: string;
  value: string;
  detail?: string;
  accent?: 'green' | 'cyan' | 'purple';
  detected?: boolean;
};

export const MetricCard = ({
  label,
  value,
  detail,
  accent = 'cyan',
  detected,
}: MetricCardProps) => (
  <NeonCard accent={accent} style={styles.card}>
    <Text style={styles.label}>{label}</Text>
    <Text numberOfLines={1} style={styles.value}>
      {value}
    </Text>
    <View style={styles.footer}>
      {typeof detected === 'boolean' ? (
        <StatusPill
          label={detected ? 'Détecté' : 'Normal'}
          status={detected ? 'warning' : 'active'}
        />
      ) : (
        <Text style={styles.detail}>{detail ?? 'Temps réel'}</Text>
      )}
    </View>
  </NeonCard>
);

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minHeight: 132,
    minWidth: '46%',
  },
  label: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  value: {
    color: colors.textPrimary,
    fontSize: 29,
    fontWeight: '700',
    marginVertical: 14,
  },
  footer: {
    marginTop: 'auto',
  },
  detail: {
    color: colors.textMuted,
    fontSize: 11,
  },
});
