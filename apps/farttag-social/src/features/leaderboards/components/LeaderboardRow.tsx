import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '../../../theme/colors';
import type { LeaderboardEntry } from '../types';

type LeaderboardRowProps = {
  entry: LeaderboardEntry;
  onPress?: (entry: LeaderboardEntry) => void;
};

const rarityAccent: Record<NonNullable<LeaderboardEntry['badgeRarity']>, string> = {
  common: colors.textMuted,
  rare: colors.neonCyan,
  epic: colors.neonPurple,
  legendary: colors.neonGreen,
  mythic: '#FF4DC4',
};

export const LeaderboardRow = ({ entry, onPress }: LeaderboardRowProps) => {
  const accent = entry.badgeRarity ? rarityAccent[entry.badgeRarity] : colors.border;

  return (
    <Pressable onPress={() => onPress?.(entry)} style={styles.card}>
      <View style={[styles.rankBadge, { borderColor: accent }]}>
        <Text style={[styles.rank, { color: accent }]}>{entry.rank}</Text>
      </View>

      <View style={[styles.avatar, { borderColor: accent }]}>
        {entry.avatarUrl ? (
          <Image source={{ uri: entry.avatarUrl }} style={styles.avatarImage} />
        ) : (
          <Text style={[styles.avatarFallback, { color: accent }]}>
            {(entry.displayName || entry.username).slice(0, 1).toUpperCase()}
          </Text>
        )}
      </View>

      <View style={styles.body}>
        <View style={styles.topRow}>
          <View style={styles.identity}>
            <Text numberOfLines={1} style={styles.name}>
              {entry.displayName}
            </Text>
            <Text numberOfLines={1} style={styles.username}>
              @{entry.username}
            </Text>
          </View>
          <View style={[styles.scoreChip, { borderColor: accent }]}>
            <Text style={[styles.scoreValue, { color: accent }]}>{entry.officialScore}</Text>
          </View>
        </View>

        <View style={styles.metaRow}>
          <Text numberOfLines={1} style={styles.title}>
            {entry.title ?? 'Sans titre'}
          </Text>
          <Text style={[styles.badge, { color: accent }]}>
            {entry.badgeRarity ?? 'common'}
          </Text>
        </View>
      </View>
    </Pressable>
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
  rankBadge: {
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    height: 30,
    justifyContent: 'center',
    marginRight: 12,
    width: 30,
  },
  rank: {
    fontSize: 11,
    fontWeight: '900',
  },
  avatar: {
    alignItems: 'center',
    backgroundColor: colors.surfaceElevated,
    borderRadius: 18,
    borderWidth: 1,
    height: 42,
    justifyContent: 'center',
    marginRight: 12,
    overflow: 'hidden',
    width: 42,
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
  },
  topRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  identity: {
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
  scoreChip: {
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    minWidth: 52,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  scoreValue: {
    fontSize: 12,
    fontWeight: '900',
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
});
