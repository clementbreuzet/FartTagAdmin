import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

import { colors } from '../../../theme/colors';

type UserAvatarProps = {
  displayName: string;
  imageUrl: string | null;
};

export const UserAvatar = ({ displayName, imageUrl }: UserAvatarProps) => {
  const initials = displayName
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <View style={styles.ring}>
      {imageUrl ? (
        <Image source={{ uri: imageUrl }} style={styles.image} />
      ) : (
        <View style={styles.fallback}>
          <Text style={styles.initials}>{initials || 'FS'}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  ring: {
    borderColor: colors.neonCyan,
    borderRadius: 26,
    borderWidth: 1,
    height: 52,
    padding: 3,
    shadowColor: colors.neonCyan,
    shadowOpacity: 0.35,
    shadowRadius: 8,
    width: 52,
  },
  image: {
    borderRadius: 22,
    height: '100%',
    width: '100%',
  },
  fallback: {
    alignItems: 'center',
    backgroundColor: colors.surfaceElevated,
    borderRadius: 22,
    flex: 1,
    justifyContent: 'center',
  },
  initials: {
    color: colors.neonCyan,
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 1,
  },
});
