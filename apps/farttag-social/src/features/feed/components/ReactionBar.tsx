import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '../../../theme/colors';
import type { FartReactionType, ReactionSummary } from '../types';

type ReactionBarProps = {
  disabled: boolean;
  onReact: (reaction: FartReactionType) => void;
  reactions: ReactionSummary;
};

const reactionOptions: { label: string; type: FartReactionType }[] = [
  { label: '🔥', type: 'fire' },
  { label: '😂', type: 'laugh' },
  { label: '😱', type: 'shock' },
];

export const ReactionBar = ({ disabled, onReact, reactions }: ReactionBarProps) => (
  <View style={styles.row}>
    {reactionOptions.map(({ label, type }) => {
      const selected = reactions.viewerReaction === type;
      return (
        <Pressable
          disabled={disabled}
          key={type}
          onPress={() => onReact(type)}
          style={[styles.reaction, selected && styles.selected]}
        >
          <Text style={styles.emoji}>{label}</Text>
          <Text style={[styles.count, selected && styles.selectedCount]}>
            {reactions[type]}
          </Text>
        </Pressable>
      );
    })}
    {disabled ? <ActivityIndicator color={colors.neonGreen} size="small" /> : null}
  </View>
);

const styles = StyleSheet.create({
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  reaction: {
    alignItems: 'center',
    backgroundColor: colors.surfaceElevated,
    borderColor: colors.border,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 5,
    minHeight: 32,
    paddingHorizontal: 10,
  },
  selected: {
    backgroundColor: '#9CFF0015',
    borderColor: colors.neonGreen,
  },
  emoji: {
    fontSize: 14,
  },
  count: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '800',
  },
  selectedCount: {
    color: colors.neonGreen,
  },
});
