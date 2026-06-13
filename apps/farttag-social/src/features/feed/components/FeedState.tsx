import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '../../../theme/colors';

type FeedStateProps = {
  actionLabel?: string;
  description: string;
  loading?: boolean;
  onAction?: () => void;
  title: string;
  tone?: 'cyan' | 'purple';
};

export const FeedState = ({
  actionLabel,
  description,
  loading = false,
  onAction,
  title,
  tone = 'cyan',
}: FeedStateProps) => {
  const accent = tone === 'cyan' ? colors.neonCyan : colors.neonPurple;

  return (
    <View style={[styles.container, { borderColor: accent }]}>
      {loading ? <ActivityIndicator color={accent} size="large" /> : <Text style={[styles.icon, { color: accent }]}>◇</Text>}
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      {actionLabel && onAction ? (
        <Pressable onPress={onAction} style={[styles.action, { borderColor: accent }]}>
          <Text style={[styles.actionText, { color: accent }]}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 22,
    borderWidth: 1,
    marginHorizontal: 16,
    marginTop: 34,
    paddingHorizontal: 24,
    paddingVertical: 42,
  },
  icon: {
    fontSize: 32,
    fontWeight: '800',
  },
  title: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '800',
    marginTop: 14,
    textAlign: 'center',
  },
  description: {
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 7,
    textAlign: 'center',
  },
  action: {
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 18,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  actionText: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
});
