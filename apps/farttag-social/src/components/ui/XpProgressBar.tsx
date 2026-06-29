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
        <Text adjustsFontSizeToFit numberOfLines={1} style={styles.value}>
          {currentXp} / {requiredXp}
        </Text>
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
    minWidth: 0,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  label: {
    color: appTheme.colors.toxicGreen,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  value: {
    color: appTheme.colors.text,
    flexShrink: 1,
    fontSize: 11,
    fontWeight: '900',
    marginLeft: 8,
    textAlign: 'right',
  },
  track: {
    backgroundColor: '#122019',
    borderColor: appTheme.colors.borderGlow,
    borderRadius: 4,
    borderWidth: 1,
    height: 9,
    marginTop: 4,
    overflow: 'hidden',
  },
  fill: {
    backgroundColor: appTheme.colors.toxicGreen,
    borderRadius: 3,
    height: '100%',
  },
});
