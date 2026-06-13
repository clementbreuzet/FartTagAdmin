import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '../../../theme/colors';
import type { LootboxDefinition } from '../types';

type LootboxCardProps = {
  disabled?: boolean;
  isOpening?: boolean;
  lootbox: LootboxDefinition;
  onOpen: (lootboxId: string) => void;
};

const rarityAccent: Record<LootboxDefinition['rarity'], string> = {
  rare: colors.neonCyan,
  epic: colors.neonPurple,
  mythic: '#FF4DC4',
};

export const LootboxCard = ({ disabled = false, isOpening = false, lootbox, onOpen }: LootboxCardProps) => {
  const accent = rarityAccent[lootbox.rarity];

  return (
    <View style={[styles.card, { borderColor: accent, shadowColor: accent }]}>
      <View style={styles.header}>
        <View>
          <Text style={[styles.rarity, { color: accent }]}>{lootbox.rarity}</Text>
          <Text style={styles.name}>{lootbox.name}</Text>
        </View>
        <Text style={[styles.glyph, { color: accent }]}>{lootbox.iconGlyph}</Text>
      </View>
      <Text style={styles.description}>{lootbox.description}</Text>

      <View style={styles.metaRow}>
        <Text style={styles.price}>{lootbox.priceFlatulons.toLocaleString()} FLATULONS</Text>
        <Text style={styles.probability}>{Math.round(lootbox.probability * 100)}%</Text>
      </View>
      <Text style={styles.probabilityLabel}>PROBABILITÉ DE SORTIE</Text>

      <Pressable
        disabled={disabled}
        onPress={() => onOpen(lootbox.id)}
        style={({ pressed }) => [
          styles.button,
          { borderColor: accent },
          disabled && styles.buttonDisabled,
          pressed && styles.buttonPressed,
        ]}
      >
        <Text style={[styles.buttonText, { color: accent }]}>
          {isOpening ? 'OUVERTURE...' : 'OUVRIR'}
        </Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 22,
    borderWidth: 1,
    marginBottom: 14,
    padding: 16,
    shadowOpacity: 0.24,
    shadowRadius: 12,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  rarity: {
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  name: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '900',
    marginTop: 4,
  },
  glyph: {
    fontSize: 28,
    fontWeight: '900',
  },
  description: {
    color: colors.textSecondary,
    fontSize: 11,
    lineHeight: 17,
    marginTop: 10,
  },
  metaRow: {
    alignItems: 'baseline',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 14,
  },
  price: {
    color: colors.neonGreen,
    fontSize: 10,
    fontWeight: '900',
  },
  probability: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: '900',
  },
  probabilityLabel: {
    color: colors.textMuted,
    fontSize: 7,
    fontWeight: '900',
    letterSpacing: 0.8,
    marginTop: 3,
    textAlign: 'right',
  },
  button: {
    alignItems: 'center',
    borderRadius: 13,
    borderWidth: 1,
    marginTop: 14,
    minHeight: 44,
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.45,
  },
  buttonPressed: {
    opacity: 0.8,
  },
  buttonText: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },
});
