import React from 'react';
import { Image, Pressable, StyleSheet, Text, View, type ImageSourcePropType } from 'react-native';

import { colors } from '../../../theme/colors';

type OfferCardProps = {
  accent: string;
  detail: string;
  duration: string;
  image: ImageSourcePropType;
  name: string;
  onBuy: () => void;
  price: number;
};

export const OfferCard = ({ accent, detail, duration, image, name, onBuy, price }: OfferCardProps) => (
  <View style={[styles.card, { borderColor: accent }]}>
    <Image source={image} style={styles.image} />
    <Text style={[styles.name, { color: accent }]}>{name}</Text>
    <Text style={styles.detail}>{detail}</Text>
    <Text style={styles.duration}>{duration}</Text>
    <Pressable onPress={onBuy} style={({ pressed }) => [styles.button, { borderColor: accent }, pressed && styles.pressed]}>
      <Text style={styles.price}>{price}</Text>
      <Text style={[styles.currency, { color: accent }]}>◆</Text>
    </Pressable>
  </View>
);

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    marginRight: 10,
    padding: 11,
    width: 138,
  },
  image: {
    height: 72,
    resizeMode: 'contain',
    width: 96,
  },
  name: {
    fontSize: 11,
    fontWeight: '900',
    marginTop: 6,
  },
  detail: {
    color: colors.textPrimary,
    fontSize: 9,
    fontWeight: '800',
    marginTop: 5,
  },
  duration: {
    color: colors.textMuted,
    fontSize: 8,
    marginTop: 3,
  },
  button: {
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 9,
    minHeight: 32,
    width: '100%',
  },
  price: {
    color: colors.textPrimary,
    fontSize: 10,
    fontWeight: '900',
  },
  currency: {
    marginLeft: 5,
  },
  pressed: {
    opacity: 0.7,
    transform: [{ scale: 0.97 }],
  },
});
