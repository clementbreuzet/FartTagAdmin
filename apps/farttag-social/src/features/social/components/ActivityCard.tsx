import React, { useEffect, useRef } from 'react';
import { Animated, Image, StyleSheet, Text, View } from 'react-native';

import { colors } from '../../../theme/colors';
import type { FriendBadgeRarity } from '../../friends/types';

type ActivityCardProps = {
  avatarUrl: string | null;
  detail: string;
  displayName: string;
  eyebrow: string;
  rarity: FriendBadgeRarity;
  reward?: string;
};

const rarityColors: Record<FriendBadgeRarity, string> = {
  common: colors.textMuted,
  rare: colors.neonCyan,
  epic: colors.neonPurple,
  legendary: '#FF9D3D',
  mythic: colors.neonGreen,
};

export const ActivityCard = ({
  avatarUrl,
  detail,
  displayName,
  eyebrow,
  rarity,
  reward,
}: ActivityCardProps) => {
  const entrance = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(0.04)).current;
  const accent = rarityColors[rarity];

  useEffect(() => {
    Animated.timing(entrance, {
      duration: 420,
      toValue: 1,
      useNativeDriver: true,
    }).start();
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { duration: 1500, toValue: 0.12, useNativeDriver: true }),
        Animated.timing(pulse, { duration: 1500, toValue: 0.04, useNativeDriver: true }),
      ]),
    );
    pulseAnimation.start();
    return () => pulseAnimation.stop();
  }, [entrance, pulse]);

  return (
    <Animated.View
      style={[
        styles.card,
        { borderColor: accent },
        {
          opacity: entrance,
          transform: [
            {
              translateY: entrance.interpolate({
                inputRange: [0, 1],
                outputRange: [12, 0],
              }),
            },
          ],
        },
      ]}
    >
      <Animated.View pointerEvents="none" style={[styles.glow, { backgroundColor: accent, opacity: pulse }]} />
      <View style={[styles.avatar, { borderColor: accent }]}>
        {avatarUrl ? (
          <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
        ) : (
          <Text style={[styles.avatarFallback, { color: accent }]}>
            {displayName.slice(0, 1).toUpperCase()}
          </Text>
        )}
      </View>
      <Text numberOfLines={1} style={styles.name}>{displayName}</Text>
      <Text style={styles.eyebrow}>{eyebrow}</Text>
      <Text numberOfLines={2} style={styles.detail}>{detail}</Text>
      {reward ? <Text style={[styles.reward, { color: accent }]}>{reward}</Text> : null}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 12,
    minHeight: 168,
    padding: 14,
    width: 156,
  },
  glow: {
    bottom: 0,
    borderRadius: 20,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  avatar: {
    alignItems: 'center',
    backgroundColor: colors.surfaceElevated,
    borderRadius: 22,
    borderWidth: 1,
    height: 44,
    justifyContent: 'center',
    overflow: 'hidden',
    width: 44,
  },
  avatarImage: {
    height: '100%',
    width: '100%',
  },
  avatarFallback: {
    fontSize: 17,
    fontWeight: '900',
  },
  name: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '900',
    marginTop: 10,
  },
  eyebrow: {
    color: colors.textSecondary,
    fontSize: 9,
    fontWeight: '700',
    marginTop: 4,
  },
  detail: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '900',
    lineHeight: 18,
    marginTop: 4,
  },
  reward: {
    fontSize: 10,
    fontWeight: '900',
    marginTop: 8,
  },
});
