import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

import { colors } from '../../../theme/colors';

type DailyProgressCardProps = {
  goal: number;
  progress: number;
  reward: number;
};

const chestImage = require('../../../assets/shop/chest-common.png');

export const DailyProgressCard = ({ goal, progress, reward }: DailyProgressCardProps) => (
  <View style={styles.card}>
    <Text style={styles.heading}>PROGRESSION DU JOUR</Text>
    <View style={styles.progressHeader}>
      <Text style={styles.challenge}>Défi quotidien</Text>
      <View style={styles.progressCopy}>
        <Text style={styles.progressValue}>{progress} / {goal}</Text>
        <Text style={styles.progressLabel}>pets détectés</Text>
      </View>
    </View>
    <View style={styles.segments}>
      {Array.from({ length: goal }, (_, index) => (
        <View key={index} style={[styles.segment, index < progress && styles.segmentActive]} />
      ))}
    </View>
    <View style={styles.rewardRow}>
      <View>
        <Text style={styles.rewardLabel}>RÉCOMPENSE</Text>
        <Text style={styles.rewardValue}>+{reward} <Text style={styles.rewardUnit}>FLATULONS</Text></Text>
      </View>
      <Image source={chestImage} style={styles.chest} />
    </View>
  </View>
);

const styles = StyleSheet.create({
  card: { backgroundColor: '#050B10', borderColor: '#9CFF0035', borderRadius: 20, borderWidth: 1, flex: 1, padding: 13 },
  heading: { color: colors.neonGreen, fontSize: 9, fontWeight: '900', letterSpacing: 0.7 },
  progressHeader: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginTop: 13 },
  challenge: { color: colors.textSecondary, fontSize: 8 },
  progressCopy: { alignItems: 'flex-end' },
  progressValue: { color: colors.textPrimary, fontSize: 16, fontWeight: '900' },
  progressLabel: { color: colors.textMuted, fontSize: 6, marginTop: 2 },
  segments: { flexDirection: 'row', gap: 3, marginTop: 11 },
  segment: { backgroundColor: '#07150E', borderColor: '#21602A', borderRadius: 4, borderWidth: 1, flex: 1, height: 12 },
  segmentActive: { backgroundColor: colors.neonGreen, elevation: 4, shadowColor: colors.neonGreen, shadowOpacity: 0.5, shadowRadius: 5 },
  rewardRow: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 },
  rewardLabel: { color: colors.textMuted, fontSize: 7, fontWeight: '900' },
  rewardValue: { color: '#FFAE00', fontSize: 20, fontWeight: '900', marginTop: 4 },
  rewardUnit: { fontSize: 7 },
  chest: { height: 64, resizeMode: 'contain', width: 72 },
});
