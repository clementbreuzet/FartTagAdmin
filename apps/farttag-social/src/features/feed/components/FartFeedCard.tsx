import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '../../../theme/colors';
import { FeedMetric } from './FeedMetric';
import { ReactionBar } from './ReactionBar';
import { UserAvatar } from './UserAvatar';
import type { FartReactionType, PublicFartEvent } from '../types';

type FartFeedCardProps = {
  event: PublicFartEvent;
  isReacting: boolean;
  onCommentsPress?: (eventId: string) => void;
  onOpenDetails?: (eventId: string) => void;
  onUserPress?: (user: PublicFartEvent['user']) => void;
  onReact: (eventId: string, reaction: FartReactionType) => void;
  onReplay: (event: PublicFartEvent) => void;
};

const formatDuration = (durationMs: number) => `${(durationMs / 1_000).toFixed(1)} s`;

const formatDate = (isoDate: string) =>
  new Intl.DateTimeFormat(undefined, {
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    month: 'short',
  }).format(new Date(isoDate));

export const FartFeedCard = ({
  event,
  isReacting,
  onCommentsPress,
  onOpenDetails,
  onUserPress,
  onReact,
  onReplay,
}: FartFeedCardProps) => (
  <View style={styles.card}>
    <View style={styles.topGlow} />

    <Pressable onPress={() => onUserPress?.(event.user)} style={styles.userRow}>
      <UserAvatar displayName={event.user.displayName} imageUrl={event.user.avatarUrl} />
      <View style={styles.userCopy}>
        <View style={styles.nameRow}>
          <Text numberOfLines={1} style={styles.displayName}>{event.user.displayName}</Text>
          {event.isAuthenticated ? (
            <View style={styles.verifiedBadge}>
              <Text style={styles.verifiedText}>✓ AUTHENTIFIÉ</Text>
            </View>
          ) : null}
        </View>
        <Text style={styles.metadata}>@{event.user.username} · {formatDate(event.createdAt)}</Text>
      </View>
      <View style={styles.score}>
        <Text style={styles.scoreLabel}>SCORE</Text>
        <Text style={styles.scoreValue}>{event.score}</Text>
      </View>
    </Pressable>

    <View style={styles.metrics}>
      <FeedMetric accent="purple" label="Durée" value={formatDuration(event.durationMs)} />
      <FeedMetric accent="cyan" label="Audio" value={`${event.audioLevelDb.toFixed(1)} dB`} />
      <FeedMetric accent="green" label="Gaz" value={`${event.gasLevelKohms.toFixed(1)} kΩ`} />
    </View>

    <Pressable
      disabled={!event.audioReplayUrl}
      onPress={() => onReplay(event)}
      style={({ pressed }) => [
        styles.replayButton,
        !event.audioReplayUrl && styles.disabledButton,
        pressed && styles.pressedButton,
      ]}
    >
      <Text style={styles.replayIcon}>▶</Text>
      <Text style={styles.replayText}>
        {event.audioReplayUrl ? 'RÉÉCOUTER' : 'AUDIO INDISPONIBLE'}
      </Text>
    </Pressable>

    <Pressable onPress={() => onOpenDetails?.(event.id)} style={styles.detailsButton}>
      <Text style={styles.detailsText}>VOIR LES DÉTAILS</Text>
    </Pressable>

    <View style={styles.footer}>
      <ReactionBar
        disabled={isReacting}
        onReact={(reaction) => onReact(event.id, reaction)}
        reactions={event.reactions}
      />
      <Pressable onPress={() => onCommentsPress?.(event.id)} style={styles.commentButton}>
        <Text style={styles.commentIcon}>◌</Text>
        <Text style={styles.commentCount}>{event.commentsCount}</Text>
      </Pressable>
    </View>
  </View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 22,
    borderWidth: 1,
    marginBottom: 16,
    overflow: 'hidden',
    padding: 16,
    shadowColor: colors.neonCyan,
    shadowOpacity: 0.16,
    shadowRadius: 12,
  },
  topGlow: {
    backgroundColor: colors.neonCyan,
    height: 2,
    left: 28,
    opacity: 0.8,
    position: 'absolute',
    right: 28,
    top: 0,
  },
  userRow: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  userCopy: {
    flex: 1,
    marginHorizontal: 11,
  },
  nameRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 7,
  },
  displayName: {
    color: colors.textPrimary,
    flexShrink: 1,
    fontSize: 15,
    fontWeight: '800',
  },
  verifiedBadge: {
    backgroundColor: '#9CFF0014',
    borderColor: colors.neonGreen,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 5,
    paddingVertical: 3,
  },
  verifiedText: {
    color: colors.neonGreen,
    fontSize: 7,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  metadata: {
    color: colors.textMuted,
    fontSize: 10,
    marginTop: 4,
  },
  score: {
    alignItems: 'flex-end',
  },
  scoreLabel: {
    color: colors.textMuted,
    fontSize: 7,
    fontWeight: '800',
    letterSpacing: 1,
  },
  scoreValue: {
    color: colors.neonGreen,
    fontSize: 24,
    fontWeight: '900',
    marginTop: 1,
  },
  metrics: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
  },
  replayButton: {
    alignItems: 'center',
    borderColor: colors.neonPurple,
    borderRadius: 13,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 9,
    justifyContent: 'center',
    marginTop: 13,
    minHeight: 43,
  },
  disabledButton: {
    borderColor: colors.border,
    opacity: 0.5,
  },
  pressedButton: {
    opacity: 0.7,
  },
  replayIcon: {
    color: colors.neonPurple,
    fontSize: 11,
  },
  replayText: {
    color: colors.neonPurple,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.1,
  },
  footer: {
    alignItems: 'center',
    borderTopColor: colors.border,
    borderTopWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 14,
    paddingTop: 13,
  },
  commentButton: {
    alignItems: 'center',
    borderColor: colors.border,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 5,
    minHeight: 32,
    paddingHorizontal: 11,
  },
  commentIcon: {
    color: colors.neonCyan,
    fontSize: 16,
  },
  commentCount: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '800',
  },
  detailsButton: {
    alignItems: 'center',
    borderColor: colors.neonCyan,
    borderRadius: 13,
    borderWidth: 1,
    marginTop: 12,
    minHeight: 40,
    justifyContent: 'center',
  },
  detailsText: {
    color: colors.neonCyan,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.9,
  },
});
