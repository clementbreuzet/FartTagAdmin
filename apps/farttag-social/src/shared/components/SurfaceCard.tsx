import React, { type PropsWithChildren } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { colors } from '../../theme/colors';

type SurfaceCardProps = PropsWithChildren<{
  accent?: keyof typeof accents;
  style?: StyleProp<ViewStyle>;
}>;

const accents = {
  cyan: colors.neonCyan,
  default: colors.border,
  green: colors.neonGreen,
  purple: colors.neonPurple,
} as const;

export const SurfaceCard = ({ accent = 'default', children, style }: SurfaceCardProps) => (
  <View style={[styles.card, { borderColor: accents[accent] }, style]}>{children}</View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    padding: 15,
  },
});
