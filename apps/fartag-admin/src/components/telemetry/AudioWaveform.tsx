import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { TelemetryFrame } from '../../models/telemetry';
import { colors } from '../../theme/colors';
import { NeonCard } from '../common/NeonCard';
import { StatusPill } from '../common/StatusPill';

type AudioWaveformProps = {
  frames: TelemetryFrame[];
  isCapturing: boolean;
};

export const AudioWaveform = ({
  frames,
  isCapturing,
}: AudioWaveformProps) => {
  const bars = useMemo(() => {
    const values = frames.slice(-36).map((frame) => frame.audioLevel);
    const maximum = Math.max(...values, 1);

    return values.map((value, index) => ({
      height: Math.max(4, (value / maximum) * 126),
      key: `${frames[frames.length - values.length + index]?.timestampMs ?? 'frame'}-${index}`,
    }));
  }, [frames]);

  return (
    <NeonCard accent="purple" style={styles.card}>
      <View style={styles.header}>
        <View>
          <Text style={styles.eyebrow}>INMP441 LIVE INPUT</Text>
          <Text style={styles.title}>Waveform audio</Text>
        </View>
        <StatusPill
          label={isCapturing ? 'Capture' : 'Veille'}
          status={isCapturing ? 'active' : 'idle'}
        />
      </View>

      <View style={styles.waveform}>
        <View style={styles.centerLine} />
        {bars.map((bar) => (
          <View
            key={bar.key}
            style={[
              styles.bar,
              {
                height: bar.height,
                opacity: isCapturing ? 1 : 0.58,
              },
            ]}
          />
        ))}
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>-5 s</Text>
        <Text style={styles.footerText}>
          {frames.length} trame{frames.length === 1 ? '' : 's'}
        </Text>
        <Text style={styles.footerText}>Maintenant</Text>
      </View>
    </NeonCard>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
    minHeight: 246,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  eyebrow: {
    color: colors.neonPurple,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.4,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: '700',
    marginTop: 4,
  },
  waveform: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 2,
    height: 142,
    justifyContent: 'center',
    marginTop: 18,
    overflow: 'hidden',
    position: 'relative',
  },
  centerLine: {
    backgroundColor: colors.border,
    height: 1,
    left: 0,
    position: 'absolute',
    right: 0,
  },
  bar: {
    backgroundColor: colors.neonPurple,
    borderRadius: 2,
    maxWidth: 8,
    minWidth: 3,
    shadowColor: colors.neonPurple,
    shadowOpacity: 0.75,
    shadowRadius: 5,
    width: '2%',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  footerText: {
    color: colors.textMuted,
    fontSize: 10,
  },
});
