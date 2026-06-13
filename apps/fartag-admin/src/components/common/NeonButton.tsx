import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  ViewStyle,
} from 'react-native';

import { colors } from '../../theme/colors';

type NeonButtonProps = {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'secondary';
  style?: ViewStyle;
};

export const NeonButton = ({
  label,
  onPress,
  loading = false,
  disabled = false,
  variant = 'primary',
  style,
}: NeonButtonProps) => {
  const accent =
    variant === 'primary' ? colors.neonGreen : colors.neonPurple;

  return (
    <Pressable
      disabled={disabled || loading}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        {
          borderColor: accent,
          opacity: disabled ? 0.45 : pressed ? 0.72 : 1,
          shadowColor: accent,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={accent} size="small" />
      ) : (
        <Text style={[styles.label, { color: accent }]}>{label}</Text>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 48,
    paddingHorizontal: 18,
    shadowOpacity: 0.45,
    shadowRadius: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
});
