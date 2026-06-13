import React from 'react';
import { Image, Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '../../../theme/colors';
import type { FriendCard } from '../types';

type FriendProfileModalProps = {
  friend: FriendCard | null;
  onClose: () => void;
};

export const FriendProfileModal = ({ friend, onClose }: FriendProfileModalProps) => {
  if (!friend) {
    return null;
  }

  return (
    <Modal animationType="fade" onRequestClose={onClose} transparent visible>
      <Pressable onPress={onClose} style={styles.backdrop}>
        <Pressable style={styles.card}>
          <View style={styles.avatar}>
            {friend.avatarUrl ? (
              <Image source={{ uri: friend.avatarUrl }} style={styles.avatarImage} />
            ) : (
              <Text style={styles.avatarFallback}>{(friend.displayName || friend.username).slice(0, 1).toUpperCase()}</Text>
            )}
          </View>
          <Text style={styles.name}>{friend.displayName}</Text>
          <Text style={styles.username}>@{friend.username}</Text>
          <Text style={styles.meta}>{friend.title ?? 'Sans titre'}</Text>
          <Text style={styles.meta}>{friend.badgeRarity ?? 'common'}</Text>
          <Text style={styles.hint}>Apercu du profil social.</Text>
          <Pressable onPress={onClose} style={styles.close}>
            <Text style={styles.closeText}>FERMER</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    alignItems: 'center',
    backgroundColor: '#000000CC',
    flex: 1,
    justifyContent: 'center',
    padding: 22,
  },
  card: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.neonCyan,
    borderRadius: 24,
    borderWidth: 1,
    padding: 22,
    width: '100%',
  },
  avatar: {
    alignItems: 'center',
    backgroundColor: colors.surfaceElevated,
    borderColor: colors.neonCyan,
    borderRadius: 28,
    borderWidth: 1,
    height: 72,
    justifyContent: 'center',
    overflow: 'hidden',
    width: 72,
  },
  avatarImage: {
    height: '100%',
    width: '100%',
  },
  avatarFallback: {
    color: colors.neonCyan,
    fontSize: 28,
    fontWeight: '900',
  },
  name: {
    color: colors.textPrimary,
    fontSize: 22,
    fontWeight: '900',
    marginTop: 14,
  },
  username: {
    color: colors.textSecondary,
    fontSize: 11,
    marginTop: 4,
  },
  meta: {
    color: colors.neonPurple,
    fontSize: 10,
    fontWeight: '900',
    marginTop: 10,
    textTransform: 'uppercase',
  },
  hint: {
    color: colors.textMuted,
    fontSize: 10,
    marginTop: 12,
    textAlign: 'center',
  },
  close: {
    borderColor: colors.neonCyan,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 18,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  closeText: {
    color: colors.neonCyan,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
});
