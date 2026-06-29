import React from 'react';
import { Image, StyleSheet, type ImageStyle, type StyleProp } from 'react-native';

type GemIconProps = {
  size?: number;
  style?: StyleProp<ImageStyle>;
};

const gemLogo = require('../../assets/currency/gem.png');

export const GemIcon = ({ size = 32, style }: GemIconProps) => (
  <Image
    source={gemLogo}
    style={[
      styles.icon,
      {
        height: size,
        width: size,
      },
      style,
    ]}
  />
);

const styles = StyleSheet.create({
  icon: {
    resizeMode: 'contain',
  },
});
