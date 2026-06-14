import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { appTheme } from '../../theme/theme';

type XpProgressBarProps = {
  currentXp: number;
  requiredXp: number;
};

export const XpProgressBar = ({ currentXp, requiredXp }: XpProgressBarProps) => {
  const safeRequiredXp = Math.max(requiredXp, 1);
  const progress = Math.min(Math.max(currentXp / safeRequiredXp, 0), 1);

  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>XP</Text>
        <Text style={styles.value}>{currentXp} / {requiredXp}</Text>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${progress * 100}%` }]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minWidth: 66,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  label: {
    color: appTheme.colors.toxicGreen,
    fontSize: 6,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  value: {
    color: appTheme.colors.textMuted,
    fontSize: 7,
    fontWeight: '800',
  },
  track: {
    backgroundColor: '#122019',
    borderColor: appTheme.colors.borderGlow,
    borderRadius: 4,
    borderWidth: 1,
    height: 6,
    marginTop: 3,
    overflow: 'hidden',
  },
  fill: {
    backgroundColor: appTheme.colors.toxicGreen,
    borderRadius: 3,
    height: '100%',
  },
});
