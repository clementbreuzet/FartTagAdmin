import React, { PropsWithChildren } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

import { colors } from '../../theme/colors';

type Accent = 'green' | 'cyan' | 'purple';

type NeonCardProps = PropsWithChildren<{
  accent?: Accent;
  style?: StyleProp<ViewStyle>;
}>;

const accents: Record<Accent, string> = {
  green: colors.neonGreen,
  cyan: colors.neonCyan,
  purple: colors.neonPurple,
};

export const NeonCard = ({
  accent = 'cyan',
  children,
  style,
}: NeonCardProps) => (
  <View
    style={[
      styles.card,
      {
        borderColor: accents[accent],
        shadowColor: accents[accent],
      },
      style,
    ]}
  >
    {children}
  </View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    shadowOpacity: 0.22,
    shadowRadius: 10,
  },
});
