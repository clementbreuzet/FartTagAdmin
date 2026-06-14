import React from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { colors } from '../../../theme/colors';
import type { LeaderboardEntry } from '../../leaderboards/types';

type TopFriendsCarouselProps = {
  entries: LeaderboardEntry[];
  onViewProfile: (entry: LeaderboardEntry) => void;
};

const podiumColors = [colors.neonGreen, colors.neonCyan, '#FF9D3D'];

export const TopFriendsCarousel = ({ entries, onViewProfile }: TopFriendsCarouselProps) => (
  <ScrollView
    contentContainerStyle={styles.content}
    horizontal
    showsHorizontalScrollIndicator={false}
  >
    {entries.slice(0, 3).map((entry, index) => {
      const accent = podiumColors[index] ?? colors.border;
      return (
        <Pressable
          key={entry.id}
          onPress={() => onViewProfile(entry)}
          style={({ pressed }) => [
            styles.card,
            { borderColor: accent },
            index === 0 && styles.firstCard,
            pressed && styles.pressed,
          ]}
        >
          <Text style={[styles.rank, { color: accent }]}>#{entry.rank || index + 1}</Text>
          <View style={[styles.avatar, { borderColor: accent }]}>
            {entry.avatarUrl ? (
              <Image source={{ uri: entry.avatarUrl }} style={styles.avatarImage} />
            ) : (
              <Text style={[styles.avatarFallback, { color: accent }]}>
                {entry.displayName.slice(0, 1).toUpperCase()}
              </Text>
            )}
          </View>
          <Text numberOfLines={1} style={styles.name}>{entry.displayName}</Text>
          <Text numberOfLines={1} style={styles.title}>{entry.title ?? 'Rising legend'}</Text>
          <Text style={[styles.score, { color: accent }]}>{entry.officialScore}</Text>
          <Text style={styles.scoreLabel}>SCORE</Text>
        </Pressable>
      );
    })}
  </ScrollView>
);

const styles = StyleSheet.create({
  content: {
    paddingBottom: 4,
  },
  card: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 22,
    borderWidth: 1,
    marginRight: 12,
    padding: 14,
    width: 142,
  },
  firstCard: {
    backgroundColor: '#132014',
  },
  pressed: {
    opacity: 0.72,
    transform: [{ scale: 0.97 }],
  },
  rank: {
    alignSelf: 'flex-start',
    fontSize: 14,
    fontWeight: '900',
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
  name: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '900',
    marginTop: 10,
  },
  title: {
    color: colors.textMuted,
    fontSize: 9,
    marginTop: 3,
  },
  score: {
    fontSize: 22,
    fontWeight: '900',
    marginTop: 10,
  },
  scoreLabel: {
    color: colors.textMuted,
    fontSize: 7,
    fontWeight: '900',
    letterSpacing: 1,
  },
});
