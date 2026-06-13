import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '../../../theme/colors';
import type { FriendCard } from '../types';

type FriendChipProps = {
  friend: FriendCard;
  onViewProfile: (friend: FriendCard) => void;
  onRemove: (friend: FriendCard) => void;
};

const rarityAccent = {
  common: colors.textMuted,
  rare: colors.neonCyan,
  epic: colors.neonPurple,
  legendary: colors.neonGreen,
  mythic: '#FF4DC4',
} as const;

export const FriendChip = ({ friend, onViewProfile, onRemove }: FriendChipProps) => {
  const accent = friend.badgeRarity ? rarityAccent[friend.badgeRarity] : colors.border;

  return (
    <View style={styles.card}>
      <View style={[styles.avatar, { borderColor: accent }]}>
        {friend.avatarUrl ? (
          <Image source={{ uri: friend.avatarUrl }} style={styles.avatarImage} />
        ) : (
          <Text style={[styles.avatarFallback, { color: accent }]}>
            {(friend.displayName || friend.username).slice(0, 1).toUpperCase()}
          </Text>
        )}
      </View>
      <View style={styles.body}>
        <Text style={styles.name}>{friend.displayName}</Text>
        <Text style={styles.username}>@{friend.username}</Text>
        <View style={styles.metaRow}>
          <Text style={styles.title}>{friend.title ?? 'Sans titre'}</Text>
          <Text style={[styles.badge, { color: accent }]}>{friend.badgeRarity ?? 'common'}</Text>
        </View>
      </View>
      <View style={styles.actions}>
        <Pressable onPress={() => onViewProfile(friend)} style={[styles.action, { borderColor: accent }]}>
          <Text style={[styles.actionText, { color: accent }]}>PROFIL</Text>
        </Pressable>
        <Pressable onPress={() => onRemove(friend)} style={styles.remove}>
          <Text style={styles.removeText}>SUPPR</Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 20,
    borderWidth: 1,
    flexDirection: 'row',
    marginBottom: 12,
    padding: 14,
  },
  avatar: {
    alignItems: 'center',
    backgroundColor: colors.surfaceElevated,
    borderRadius: 18,
    borderWidth: 1,
    height: 44,
    justifyContent: 'center',
    marginRight: 12,
    overflow: 'hidden',
    width: 44,
  },
  avatarImage: {
    height: '100%',
    width: '100%',
  },
  avatarFallback: {
    fontSize: 16,
    fontWeight: '900',
  },
  body: {
    flex: 1,
    paddingRight: 10,
  },
  name: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '900',
  },
  username: {
    color: colors.textSecondary,
    fontSize: 10,
    marginTop: 2,
  },
  metaRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  title: {
    color: colors.textMuted,
    flex: 1,
    fontSize: 10,
    fontWeight: '700',
    paddingRight: 10,
    textTransform: 'uppercase',
  },
  badge: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  actions: {
    gap: 8,
  },
  action: {
    borderRadius: 12,
    borderWidth: 1,
    minWidth: 60,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  actionText: {
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.8,
    textAlign: 'center',
  },
  remove: {
    borderColor: colors.danger,
    borderRadius: 12,
    borderWidth: 1,
    minWidth: 60,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  removeText: {
    color: colors.danger,
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.8,
    textAlign: 'center',
  },
});
