import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';

import { colors } from '../../../theme/colors';
import type { AudioPlaybackStatus } from '../types';

type AudioPlayButtonProps = {
  disabled?: boolean;
  isCurrent: boolean;
  onPress: () => void;
  status: AudioPlaybackStatus;
};

export const AudioPlayButton = ({
  disabled = false,
  isCurrent,
  onPress,
  status,
}: AudioPlayButtonProps) => {
  const isLoading = isCurrent && status === 'loading';
  const isPlaying = isCurrent && status === 'playing';

  return (
    <Pressable
      disabled={disabled || isLoading}
      onPress={(event) => {
        event.stopPropagation();
        onPress();
      }}
      style={[styles.button, disabled && styles.disabled]}
    >
      {isLoading ? (
        <ActivityIndicator color={colors.neonPurple} size="small" />
      ) : (
        <Text style={styles.text}>
          {disabled ? 'AUDIO INDISPONIBLE' : isPlaying ? 'PAUSE' : 'PLAY'}
        </Text>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    borderColor: colors.neonPurple,
    borderRadius: 11,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 34,
    minWidth: 92,
    paddingHorizontal: 12,
  },
  disabled: {
    borderColor: colors.border,
    opacity: 0.45,
  },
  text: {
    color: colors.neonPurple,
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.6,
  },
});
