import React, { useEffect, useRef } from 'react';
import { Animated, Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '../../../theme/colors';
import type { FriendBadgeRarity, FriendCard as FriendModel } from '../../friends/types';

export type FriendSocialStats = {
  badges: number;
  bestDb: number;
  collectionPercent: number;
  fartCount: number;
  flatulons: number;
  rareItems: number;
};

type FriendCardProps = {
  friend: FriendModel;
  onChallenge: (friend: FriendModel) => void;
  onMenu: (friend: FriendModel) => void;
  onViewProfile: (friend: FriendModel) => void;
  stats: FriendSocialStats;
};

const rarityColors: Record<FriendBadgeRarity, string> = {
  common: colors.textMuted,
  rare: colors.neonCyan,
  epic: colors.neonPurple,
  legendary: '#FF9D3D',
  mythic: colors.neonGreen,
};

const rarityLabels: Record<FriendBadgeRarity, string> = {
  common: 'Commun',
  rare: 'Rare',
  epic: 'Épique',
  legendary: 'Légendaire',
  mythic: 'Mythique',
};

export const FriendCard = ({
  friend,
  onChallenge,
  onMenu,
  onViewProfile,
  stats,
}: FriendCardProps) => {
  const entrance = useRef(new Animated.Value(0)).current;
  const rarity = friend.badgeRarity ?? 'common';
  const accent = rarityColors[rarity];

  useEffect(() => {
    Animated.timing(entrance, {
      duration: 460,
      toValue: 1,
      useNativeDriver: true,
    }).start();
  }, [entrance]);

  return (
    <Animated.View
      style={[
        styles.card,
        { borderColor: accent, opacity: entrance },
        {
          transform: [
            {
              translateY: entrance.interpolate({
                inputRange: [0, 1],
                outputRange: [18, 0],
              }),
            },
          ],
        },
      ]}
    >
      <View style={styles.topRow}>
        <View style={[styles.avatar, { borderColor: accent }]}>
          {friend.avatarUrl ? (
            <Image source={{ uri: friend.avatarUrl }} style={styles.avatarImage} />
          ) : (
            <Text style={[styles.avatarFallback, { color: accent }]}>
              {friend.displayName.slice(0, 1).toUpperCase()}
            </Text>
          )}
        </View>
        <View style={styles.identity}>
          <Text style={styles.name}>{friend.displayName}</Text>
          <Text style={[styles.title, { color: accent }]}>{friend.title ?? 'Étoile montante'}</Text>
          <Text style={styles.level}>NIVEAU {friend.level ?? 1}</Text>
        </View>
        <View style={styles.rarityArea}>
          <Text style={[styles.rarity, { color: accent }]}>{rarityLabels[rarity]}</Text>
          <Pressable onPress={() => onMenu(friend)} hitSlop={10} style={styles.menuButton}>
            <Text style={styles.menuText}>•••</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.statsRow}>
        <Stat label="PETS" value={String(stats.fartCount)} />
        <Stat label="FLATULONS" value={String(stats.flatulons)} />
        <Stat label="MEILLEUR EXPLOIT" value={`${stats.bestDb} dB`} />
      </View>

      <View style={styles.collection}>
        <View style={styles.collectionHeader}>
          <Text style={styles.collectionTitle}>COLLECTION</Text>
          <Text style={[styles.collectionPercent, { color: accent }]}>{stats.collectionPercent}%</Text>
        </View>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { backgroundColor: accent, width: `${stats.collectionPercent}%` }]} />
        </View>
        <View style={styles.collectionMeta}>
          <Text style={styles.collectionMetaText}>{stats.rareItems} objets rares</Text>
          <Text style={styles.collectionMetaText}>{stats.badges} badges</Text>
        </View>
      </View>

      <View style={styles.actions}>
        <Action accent={accent} label="VOIR PROFIL" onPress={() => onViewProfile(friend)} />
        <Action accent={colors.neonGreen} label="DÉFIER" onPress={() => onChallenge(friend)} />
      </View>
    </Animated.View>
  );
};

const Stat = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.stat}>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const Action = ({ accent, label, onPress }: { accent: string; label: string; onPress: () => void }) => (
  <Pressable
    onPress={onPress}
    style={({ pressed }) => [styles.action, { borderColor: accent }, pressed && styles.pressed]}
  >
    <Text style={[styles.actionText, { color: accent }]}>{label}</Text>
  </Pressable>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    borderWidth: 1,
    marginBottom: 14,
    padding: 15,
  },
  topRow: {
    flexDirection: 'row',
  },
  avatar: {
    alignItems: 'center',
    backgroundColor: colors.surfaceElevated,
    borderRadius: 30,
    borderWidth: 2,
    height: 60,
    justifyContent: 'center',
    overflow: 'hidden',
    width: 60,
  },
  avatarImage: {
    height: '100%',
    width: '100%',
  },
  avatarFallback: {
    fontSize: 22,
    fontWeight: '900',
  },
  identity: {
    flex: 1,
    marginLeft: 12,
  },
  name: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '900',
  },
  title: {
    fontSize: 10,
    fontWeight: '800',
    marginTop: 4,
  },
  level: {
    color: colors.textMuted,
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.8,
    marginTop: 7,
  },
  rarityArea: {
    alignItems: 'flex-end',
  },
  rarity: {
    fontSize: 9,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  menuButton: {
    marginTop: 10,
    paddingHorizontal: 2,
  },
  menuText: {
    color: colors.textSecondary,
    fontSize: 16,
    letterSpacing: 1,
  },
  statsRow: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: 16,
    flexDirection: 'row',
    marginTop: 14,
    paddingVertical: 12,
  },
  stat: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '900',
  },
  statLabel: {
    color: colors.textMuted,
    fontSize: 6,
    fontWeight: '900',
    letterSpacing: 0.6,
    marginTop: 4,
  },
  collection: {
    marginTop: 14,
  },
  collectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  collectionTitle: {
    color: colors.textSecondary,
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1,
  },
  collectionPercent: {
    fontSize: 10,
    fontWeight: '900',
  },
  progressTrack: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: 4,
    height: 5,
    marginTop: 7,
    overflow: 'hidden',
  },
  progressFill: {
    borderRadius: 4,
    height: '100%',
  },
  collectionMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 7,
  },
  collectionMetaText: {
    color: colors.textMuted,
    fontSize: 8,
  },
  actions: {
    flexDirection: 'row',
    gap: 9,
    marginTop: 14,
  },
  action: {
    alignItems: 'center',
    borderRadius: 13,
    borderWidth: 1,
    flex: 1,
    paddingVertical: 10,
  },
  actionText: {
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  pressed: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }],
  },
});
