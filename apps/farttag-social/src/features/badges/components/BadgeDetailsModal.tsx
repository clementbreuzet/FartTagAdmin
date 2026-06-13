import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '../../../theme/colors';
import { rarityColors } from '../rarity';
import type { BadgeViewModel } from '../types';

type BadgeDetailsModalProps = {
  badge: BadgeViewModel | null;
  onClose: () => void;
};

export const BadgeDetailsModal = ({ badge, onClose }: BadgeDetailsModalProps) => {
  if (!badge) {
    return null;
  }

  const accent = rarityColors[badge.rarity];

  return (
    <Modal animationType="fade" onRequestClose={onClose} transparent visible>
      <Pressable onPress={onClose} style={styles.backdrop}>
        <Pressable style={[styles.card, { borderColor: accent, shadowColor: accent }]}>
          <Text style={[styles.glyph, { color: accent }]}>{badge.isUnlocked ? badge.iconGlyph : '×'}</Text>
          <Text style={styles.name}>{badge.name}</Text>
          <Text style={[styles.rarity, { color: accent }]}>{badge.rarity}</Text>
          <Text style={styles.description}>{badge.description}</Text>
          <Text style={styles.requirement}>{badge.requirementLabel}</Text>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { backgroundColor: accent, width: `${badge.progressPercent}%` }]} />
          </View>
          <Text style={styles.progressText}>{badge.currentValue} / {badge.targetValue} · {badge.progressPercent}%</Text>
          <Text style={[styles.status, { color: badge.isUnlocked ? colors.neonGreen : colors.textMuted }]}>
            {badge.isUnlocked
              ? `DÉBLOQUÉ${badge.unlockedAt ? ` · ${new Date(badge.unlockedAt).toLocaleDateString()}` : ''}`
              : 'VERROUILLÉ'}
          </Text>
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
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 24,
    borderWidth: 1,
    padding: 22,
    shadowOpacity: 0.4,
    shadowRadius: 16,
    width: '100%',
  },
  glyph: {
    fontSize: 46,
    fontWeight: '900',
  },
  name: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: '900',
    marginTop: 13,
    textAlign: 'center',
  },
  rarity: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
    marginTop: 5,
    textTransform: 'uppercase',
  },
  description: {
    color: colors.textSecondary,
    fontSize: 11,
    lineHeight: 18,
    marginTop: 15,
    textAlign: 'center',
  },
  requirement: {
    color: colors.textPrimary,
    fontSize: 10,
    fontWeight: '800',
    marginTop: 15,
    textAlign: 'center',
  },
  progressTrack: {
    backgroundColor: colors.border,
    borderRadius: 4,
    height: 7,
    marginTop: 13,
    overflow: 'hidden',
    width: '100%',
  },
  progressFill: {
    height: '100%',
  },
  progressText: {
    color: colors.textMuted,
    fontSize: 9,
    marginTop: 7,
  },
  status: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.8,
    marginTop: 15,
  },
  close: {
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 18,
    paddingHorizontal: 28,
    paddingVertical: 10,
  },
  closeText: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
});
