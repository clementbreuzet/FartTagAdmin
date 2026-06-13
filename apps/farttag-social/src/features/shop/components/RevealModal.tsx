import React, { useEffect, useRef } from 'react';
import { Animated, Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '../../../theme/colors';
import type { LootboxReward } from '../types';

type RevealModalProps = {
  onClose: () => void;
  reward: LootboxReward | null;
  visible: boolean;
};

const rarityColor = (rarity: LootboxReward['rarity']) => {
  if (rarity === 'mythic') return '#FF4DC4';
  if (rarity === 'legendary') return colors.neonGreen;
  if (rarity === 'epic') return colors.neonPurple;
  return colors.neonCyan;
};

export const RevealModal = ({ onClose, reward, visible }: RevealModalProps) => {
  const scale = useRef(new Animated.Value(0.8)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const accent = reward ? rarityColor(reward.rarity) : colors.neonCyan;

  useEffect(() => {
    if (!visible || !reward) {
      return;
    }

    scale.setValue(0.8);
    opacity.setValue(0);
    Animated.parallel([
      Animated.spring(scale, {
        bounciness: 10,
        toValue: 1,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        duration: 220,
        toValue: 1,
        useNativeDriver: true,
      }),
    ]).start();
  }, [opacity, scale, visible]);

  if (!reward) {
    return null;
  }

  return (
    <Modal animationType="fade" transparent visible={visible}>
      <View style={styles.backdrop}>
        <Animated.View style={[styles.card, { borderColor: accent, shadowColor: accent, opacity, transform: [{ scale }] }]}>
          <Text style={[styles.label, { color: accent }]}>RÉVÉLATION</Text>
          <Text style={[styles.glyph, { color: accent }]}>{reward.iconGlyph}</Text>
          <Text style={styles.name}>{reward.name}</Text>
          <Text style={[styles.rarity, { color: accent }]}>{reward.rarity}</Text>
          <Text style={styles.description}>{reward.description}</Text>
          <Pressable onPress={onClose} style={[styles.close, { borderColor: accent }]}>
            <Text style={[styles.closeText, { color: accent }]}>FERMER</Text>
          </Pressable>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    alignItems: 'center',
    backgroundColor: '#000000E6',
    flex: 1,
    justifyContent: 'center',
    padding: 22,
  },
  card: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 24,
    borderWidth: 1,
    padding: 24,
    shadowOpacity: 0.45,
    shadowRadius: 18,
    width: '100%',
  },
  label: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  glyph: {
    fontSize: 76,
    fontWeight: '900',
    marginTop: 12,
  },
  name: {
    color: colors.textPrimary,
    fontSize: 21,
    fontWeight: '900',
    marginTop: 12,
    textAlign: 'center',
  },
  rarity: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
    marginTop: 4,
    textTransform: 'uppercase',
  },
  description: {
    color: colors.textSecondary,
    fontSize: 11,
    lineHeight: 18,
    marginTop: 14,
    textAlign: 'center',
  },
  close: {
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 20,
    paddingHorizontal: 24,
    paddingVertical: 10,
  },
  closeText: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
  },
});
