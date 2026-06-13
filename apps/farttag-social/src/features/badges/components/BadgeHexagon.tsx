import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '../../../theme/colors';
import { rarityColors } from '../rarity';
import type { BadgeViewModel } from '../types';

type BadgeHexagonProps = {
  badge: BadgeViewModel;
  onPress: (badge: BadgeViewModel) => void;
};

export const BadgeHexagon = ({ badge, onPress }: BadgeHexagonProps) => {
  const accent = rarityColors[badge.rarity];

  return (
    <Pressable onPress={() => onPress(badge)} style={styles.wrapper}>
      <View style={[styles.hexagon, { borderColor: accent, shadowColor: accent }, !badge.isUnlocked && styles.locked]}>
        <View style={[styles.hexCorner, styles.topCorner, { borderBottomColor: accent }]} />
        <View style={[styles.hexCorner, styles.bottomCorner, { borderTopColor: accent }]} />
        <Text style={[styles.glyph, { color: accent }]}>{badge.isUnlocked ? badge.iconGlyph : '×'}</Text>
      </View>
      <Text numberOfLines={2} style={[styles.name, !badge.isUnlocked && styles.lockedText]}>{badge.name}</Text>
      <Text style={[styles.rarity, { color: accent }]}>{badge.rarity}</Text>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { backgroundColor: accent, width: `${badge.progressPercent}%` }]} />
      </View>
      <Text style={styles.progressText}>{badge.progressPercent}%</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    marginBottom: 22,
    width: '33.33%',
  },
  hexagon: {
    alignItems: 'center',
    backgroundColor: colors.surfaceElevated,
    borderLeftWidth: 2,
    borderRightWidth: 2,
    height: 61,
    justifyContent: 'center',
    marginBottom: 13,
    shadowOpacity: 0.45,
    shadowRadius: 10,
    width: 72,
  },
  hexCorner: {
    borderLeftColor: 'transparent',
    borderLeftWidth: 36,
    borderRightColor: 'transparent',
    borderRightWidth: 36,
    height: 0,
    left: -2,
    position: 'absolute',
    width: 0,
  },
  topCorner: {
    borderBottomWidth: 20,
    top: -20,
  },
  bottomCorner: {
    borderTopWidth: 20,
    bottom: -20,
  },
  locked: {
    opacity: 0.3,
  },
  glyph: {
    fontSize: 25,
    fontWeight: '900',
  },
  name: {
    color: colors.textPrimary,
    fontSize: 9,
    fontWeight: '800',
    minHeight: 24,
    paddingHorizontal: 4,
    textAlign: 'center',
  },
  lockedText: {
    color: colors.textMuted,
  },
  rarity: {
    fontSize: 7,
    fontWeight: '900',
    marginTop: 3,
    textTransform: 'uppercase',
  },
  progressTrack: {
    backgroundColor: colors.border,
    borderRadius: 3,
    height: 4,
    marginTop: 7,
    overflow: 'hidden',
    width: 63,
  },
  progressFill: {
    height: '100%',
  },
  progressText: {
    color: colors.textMuted,
    fontSize: 7,
    marginTop: 3,
  },
});
