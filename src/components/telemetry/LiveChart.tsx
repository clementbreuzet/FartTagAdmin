import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { TelemetryPoint } from '../../models/telemetry';
import { colors } from '../../theme/colors';
import { NeonCard } from '../common/NeonCard';

type LiveChartProps = {
  title: string;
  data: TelemetryPoint[];
  unit: string;
  accent?: 'green' | 'cyan' | 'purple';
};

const accentColors = {
  green: colors.neonGreen,
  cyan: colors.neonCyan,
  purple: colors.neonPurple,
} as const;

export const LiveChart = ({
  title,
  data,
  unit,
  accent = 'cyan',
}: LiveChartProps) => {
  const color = accentColors[accent];
  const bars = useMemo(() => {
    const values = data.slice(-24).map((point) => point.value);
    const maximum = Math.max(...values, 1);

    return values.map((value, index) => ({
      height: Math.max(5, (value / maximum) * 72),
      key: `${data[data.length - values.length + index]?.timestampMs ?? 'point'}-${index}`,
    }));
  }, [data]);

  const latestValue = data.at(-1)?.value;

  return (
    <NeonCard accent={accent} style={styles.card}>
      <View style={styles.header}>
        <Text style={[styles.title, { color }]}>{title}</Text>
        <Text style={styles.latest}>
          {latestValue === undefined ? '--' : Math.round(latestValue)} {unit}
        </Text>
      </View>

      <View style={styles.chart}>
        {bars.length > 0 ? (
          bars.map((bar) => (
            <View
              key={bar.key}
              style={[
                styles.bar,
                {
                  backgroundColor: color,
                  height: bar.height,
                  shadowColor: color,
                },
              ]}
            />
          ))
        ) : (
          <Text style={styles.empty}>En attente de télémétrie...</Text>
        )}
      </View>
    </NeonCard>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  latest: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  chart: {
    alignItems: 'flex-end',
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: 3,
    height: 90,
    marginTop: 16,
  },
  bar: {
    borderRadius: 2,
    flex: 1,
    maxWidth: 12,
    minWidth: 3,
    opacity: 0.85,
    shadowOpacity: 0.55,
    shadowRadius: 4,
  },
  empty: {
    alignSelf: 'center',
    color: colors.textMuted,
    fontSize: 12,
    marginBottom: 34,
    textAlign: 'center',
    width: '100%',
  },
});
