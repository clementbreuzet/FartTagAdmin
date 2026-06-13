import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors } from '../../../theme/colors';

type ProfileStatProps = {
  label: string;
  value: string;
};

export const ProfileStat = ({ label, value }: ProfileStatProps) => (
  <View style={styles.stat}>
    <Text style={styles.value}>{value}</Text>
    <Text style={styles.label}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  stat: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: 13,
    flex: 1,
    minWidth: '29%',
    padding: 11,
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
});
