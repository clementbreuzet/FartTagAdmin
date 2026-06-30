import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors } from '../../../theme/colors';

type ProfileStatProps = {
  label: string;
  ranking?: number | null;
  value: string;
};

export const ProfileStat = ({
  label,
  ranking,
  value,
}: ProfileStatProps) => (
  <View style={styles.stat}>
    <View style={styles.copy}>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
    <Text style={styles.ranking}>
      {ranking ? `#${ranking}` : '--'}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  stat: {
    alignItems: 'center',
    backgroundColor: colors.surfaceElevated,
    borderRadius: 13,
    flexDirection: 'row',
    gap: 8,
    flex: 1,
    justifyContent: 'space-between',
    minWidth: '29%',
    padding: 11,
  },
  copy: {
    flex: 1,
    minWidth: 0,
  },
  value: {
    color: colors.neonCyan,
    fontSize: 17,
    fontWeight: '900',
  },
  label: {
    color: colors.textMuted,
    fontSize: 7,
    fontWeight: '900',
    letterSpacing: 0.6,
    marginTop: 4,
    textTransform: 'uppercase',
  },
  ranking: {
    color: colors.neonGreen,
    fontSize: 18,
    fontWeight: '900',
    textAlign: 'right',
  },
});
