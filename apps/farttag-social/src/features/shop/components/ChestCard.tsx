import React from 'react';
import { Image, Pressable, StyleSheet, Text, View, type ImageSourcePropType } from 'react-native';

import { colors } from '../../../theme/colors';

type ChestCardProps = {
  accent: string;
  description: string;
  disabled?: boolean;
  image: ImageSourcePropType;
  isOpening?: boolean;
  name: string;
  onBuy: () => void;
  price: number;
};

export const ChestCard = ({
  accent,
  description,
  disabled = false,
  image,
  isOpening = false,
  name,
  onBuy,
  price,
}: ChestCardProps) => (
  <View style={[styles.card, { borderColor: accent, shadowColor: accent }]}>
    <Image source={image} style={styles.image} />
    <Text style={[styles.name, { color: accent }]}>{name}</Text>
    <Text numberOfLines={2} style={styles.description}>{description}</Text>
    <Pressable
      disabled={disabled}
      onPress={onBuy}
      style={({ pressed }) => [
        styles.buyButton,
        { borderColor: accent },
        disabled && styles.disabled,
        pressed && styles.pressed,
      ]}
    >
      <Text style={styles.price}>{isOpening ? 'OUVERTURE...' : price.toLocaleString()}</Text>
      {!isOpening ? <Text style={[styles.currency, { color: accent }]}>◆</Text> : null}
    </Pressable>
  </View>
);

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    backgroundColor: '#000000',
    borderRadius: 18,
    borderWidth: 1,
    marginRight: 10,
    padding: 9,
    shadowOpacity: 0.22,
    shadowRadius: 10,
    width: 142,
  },
  image: {
    height: 122,
    resizeMode: 'contain',
    width: 128,
  },
  name: {
    fontSize: 11,
    fontWeight: '900',
    marginTop: 4,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  description: {
    color: colors.textMuted,
    fontSize: 8,
    lineHeight: 12,
    marginTop: 5,
    minHeight: 24,
    textAlign: 'center',
  },
  buyButton: {
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 9,
    minHeight: 34,
    width: '100%',
  },
  price: {
    color: colors.textPrimary,
    fontSize: 10,
    fontWeight: '900',
  },
  currency: {
    fontSize: 11,
    marginLeft: 5,
  },
  disabled: {
    opacity: 0.45,
  },
  pressed: {
    opacity: 0.72,
    transform: [{ scale: 0.97 }],
  },
});
