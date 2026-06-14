import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors } from '../../theme/colors';

type LabelValueRowProps = {
  compact?: boolean;
  divider?: 'bottom' | 'none' | 'top';
  label: string;
  value: string;
  valueTone?: 'primary' | 'secondary';
};

export const LabelValueRow = ({
  compact = false,
  divider = 'bottom',
  label,
  value,
  valueTone = 'primary',
}: LabelValueRowProps) => (
  <View
    style={[
      styles.row,
      compact && styles.compact,
      divider === 'top' && styles.topDivider,
      divider === 'bottom' && styles.bottomDivider,
    ]}
  >
    <Text style={[styles.label, compact && styles.compactText]}>{label}</Text>
    <Text
      numberOfLines={1}
      style={[
        styles.value,
        compact && styles.compactText,
        valueTone === 'secondary' && styles.secondaryValue,
      ]}
    >
      {value}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  compact: {
    gap: 12,
    paddingHorizontal: 0,
    paddingVertical: 7,
  },
  topDivider: {
    borderTopColor: colors.border,
    borderTopWidth: 1,
  },
  bottomDivider: {
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
  },
  label: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  value: {
    color: colors.textPrimary,
    flex: 1,
    fontSize: 11,
    fontWeight: '900',
    textAlign: 'right',
  },
  compactText: {
    fontSize: 9,
    textTransform: 'none',
  },
  secondaryValue: {
    color: colors.textSecondary,
    fontWeight: '700',
  },
});
