import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '../../../theme/colors';
import type { InventoryItem } from '../../profile/types';

type InventoryHexCardProps = {
  item: InventoryItem;
  onPress: (item: InventoryItem) => void;
};

const rarityAccent: Record<InventoryItem['rarity'], string> = {
  common: colors.textMuted,
  rare: colors.neonCyan,
  epic: colors.neonPurple,
  legendary: colors.neonGreen,
  mythic: '#FFB800',
};

const typeGlyph: Record<InventoryItem['type'], string> = {
  title: 'T',
  frame: 'F',
  effect: 'E',
  sticker: 'S',
  mythic: 'M',
  collectible: 'C',
  other: '•',
};

export const InventoryHexCard = ({ item, onPress }: InventoryHexCardProps) => {
  const accent = rarityAccent[item.rarity];

  return (
    <Pressable onPress={() => onPress(item)} style={styles.wrapper}>
      <View style={[styles.hexagon, { borderColor: accent, shadowColor: accent }, item.isEquipped && styles.equipped]}>
        <View style={[styles.hexCorner, styles.topCorner, { borderBottomColor: accent }]} />
        <View style={[styles.hexCorner, styles.bottomCorner, { borderTopColor: accent }]} />
        <Text style={[styles.glyph, { color: accent }]}>{typeGlyph[item.type]}</Text>
      </View>
      <Text numberOfLines={2} style={styles.name}>
        {item.name}
      </Text>
      <Text style={[styles.rarity, { color: accent }]}>{item.rarity}</Text>
      <Text style={styles.meta}>{item.slot === 'none' ? 'No slot' : item.slot}</Text>
      {item.isEquipped ? <Text style={styles.equippedLabel}>EQUIPPED</Text> : null}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    marginBottom: 18,
    width: '33.33%',
  },
  hexagon: {
    alignItems: 'center',
    backgroundColor: colors.surfaceElevated,
    borderLeftWidth: 2,
    borderRightWidth: 2,
    height: 62,
    justifyContent: 'center',
    marginBottom: 10,
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
  equipped: {
    backgroundColor: '#9CFF0018',
  },
  glyph: {
    fontSize: 24,
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
  rarity: {
    fontSize: 7,
    fontWeight: '900',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  meta: {
    color: colors.textMuted,
    fontSize: 7,
    marginTop: 2,
    textTransform: 'uppercase',
  },
  equippedLabel: {
    color: colors.neonGreen,
    fontSize: 7,
    fontWeight: '900',
    marginTop: 4,
    textTransform: 'uppercase',
  },
});
