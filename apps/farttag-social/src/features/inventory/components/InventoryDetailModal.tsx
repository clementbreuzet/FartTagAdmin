import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '../../../theme/colors';
import type { InventoryItem } from '../../profile/types';

type InventoryDetailModalProps = {
  item: InventoryItem | null;
  isEquipping: boolean;
  onClose: () => void;
  onEquip: (item: InventoryItem) => void;
};

const rarityAccent: Record<InventoryItem['rarity'], string> = {
  common: colors.textMuted,
  rare: colors.neonCyan,
  epic: colors.neonPurple,
  legendary: colors.neonGreen,
  mythic: '#FFB800',
};

const categoryLabel: Record<InventoryItem['type'], string> = {
  title: 'Titre',
  frame: 'Cadre',
  effect: 'Effet de detection',
  sticker: 'Sticker',
  mythic: 'Objet mythique',
  collectible: 'Collectible',
  other: 'Autre',
};

export const InventoryDetailModal = ({ item, isEquipping, onClose, onEquip }: InventoryDetailModalProps) => {
  if (!item) {
    return null;
  }

  const accent = rarityAccent[item.rarity];
  const canEquip = item.slot !== 'none';

  return (
    <Modal animationType="fade" onRequestClose={onClose} transparent visible>
      <Pressable onPress={onClose} style={styles.backdrop}>
        <Pressable style={[styles.card, { borderColor: accent, shadowColor: accent }]}>
          <Text style={[styles.glyph, { color: accent }]}>{item.name.slice(0, 1).toUpperCase()}</Text>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={[styles.rarity, { color: accent }]}>{item.rarity}</Text>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Categorie</Text>
            <Text style={styles.metaValue}>{categoryLabel[item.type]}</Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Slot</Text>
            <Text style={styles.metaValue}>{item.slot === 'none' ? 'Aucun' : item.slot}</Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Source</Text>
            <Text style={styles.metaValue}>{item.sourceLabel}</Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Rareté</Text>
            <Text style={styles.metaValue}>{item.rarity}</Text>
          </View>
          <Text style={[styles.status, { color: item.isEquipped ? colors.neonGreen : colors.textMuted }]}>
            {item.isEquipped ? 'EQUIPE' : 'NON EQUIPE'}
          </Text>
          {canEquip ? (
            <Pressable
              disabled={isEquipping}
              onPress={() => onEquip(item)}
              style={[styles.action, { borderColor: accent }, isEquipping && styles.disabled]}
            >
              <Text style={[styles.actionText, { color: accent }]}>{isEquipping ? 'EQUIPMENT...' : 'EQUIPER'}</Text>
            </Pressable>
          ) : null}
          <Pressable onPress={onClose} style={[styles.close, { borderColor: accent }]}>
            <Text style={[styles.closeText, { color: accent }]}>FERMER</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    alignItems: 'center',
    backgroundColor: '#000000CC',
    flex: 1,
    justifyContent: 'center',
    padding: 22,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    borderWidth: 1,
    padding: 22,
    shadowOpacity: 0.42,
    shadowRadius: 16,
    width: '100%',
  },
  glyph: {
    fontSize: 46,
    fontWeight: '900',
    textAlign: 'center',
  },
  name: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: '900',
    marginTop: 12,
    textAlign: 'center',
  },
  rarity: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
    marginTop: 5,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  metaRow: {
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  metaLabel: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  metaValue: {
    color: colors.textPrimary,
    fontSize: 10,
    fontWeight: '800',
    textAlign: 'right',
    textTransform: 'uppercase',
  },
  status: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.8,
    marginTop: 14,
    textAlign: 'center',
  },
  action: {
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 16,
    paddingHorizontal: 18,
    paddingVertical: 11,
  },
  actionText: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.8,
    textAlign: 'center',
  },
  disabled: {
    opacity: 0.45,
  },
  close: {
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 12,
    paddingHorizontal: 18,
    paddingVertical: 11,
  },
  closeText: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.8,
    textAlign: 'center',
  },
});
