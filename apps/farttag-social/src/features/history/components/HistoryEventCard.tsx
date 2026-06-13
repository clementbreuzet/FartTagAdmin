import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '../../../theme/colors';
import type { FartHistoryEvent } from '../types';

type HistoryEventCardProps = {
  event: FartHistoryEvent;
  onOpen: (event: FartHistoryEvent) => void;
  onReplay: (event: FartHistoryEvent) => void;
};

const formatDate = (date: string) =>
  new Intl.DateTimeFormat(undefined, {
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date));

export const HistoryEventCard = ({ event, onOpen, onReplay }: HistoryEventCardProps) => (
  <Pressable onPress={() => onOpen(event)} style={styles.card}>
    <View style={[styles.glow, event.isLegendary && styles.legendaryGlow]} />
    <View style={styles.header}>
      <View style={styles.headerCopy}>
        <View style={styles.badges}>
          <View style={[styles.visibility, event.visibility === 'public' && styles.publicVisibility]}>
            <Text style={[styles.visibilityText, event.visibility === 'public' && styles.publicVisibilityText]}>
              {event.visibility === 'public' ? 'PUBLIC' : 'PRIVÉ'}
            </Text>
          </View>
          {event.isLegendary ? (
            <View style={styles.legendary}>
              <Text style={styles.legendaryText}>LÉGENDAIRE</Text>
            </View>
          ) : null}
        </View>
        <Text style={styles.date}>{formatDate(event.occurredAt)}</Text>
      </View>
      <View style={styles.score}>
        <Text style={styles.scoreLabel}>SCORE OFFICIEL</Text>
        <Text style={styles.scoreValue}>{event.officialScore}</Text>
      </View>
    </View>

    <View style={styles.metrics}>
      <Metric label="Durée" value={`${(event.durationMs / 1_000).toFixed(1)} s`} />
      <Metric label="Audio" value={`${event.audioLevel.toFixed(1)} dB`} />
      <Metric label="Gaz" value={`${event.gasLevel.toFixed(1)} kΩ`} />
    </View>

    <View style={styles.footer}>
      <Pressable
        disabled={!event.audioReplayUrl}
        onPress={(pressEvent) => {
          pressEvent.stopPropagation();
          onReplay(event);
        }}
        style={[styles.replay, !event.audioReplayUrl && styles.disabled]}
      >
        <Text style={styles.replayText}>{event.audioReplayUrl ? '▶ RÉÉCOUTER' : 'AUDIO INDISPONIBLE'}</Text>
      </Pressable>
      <Text style={styles.detailsLink}>VOIR DÉTAIL ›</Text>
    </View>
  </Pressable>
);

const Metric = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.metric}>
    <Text style={styles.metricLabel}>{label}</Text>
    <Text style={styles.metricValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 14,
    overflow: 'hidden',
    padding: 15,
  },
  glow: {
    backgroundColor: colors.neonCyan,
    height: 2,
    left: 32,
    opacity: 0.7,
    position: 'absolute',
    right: 32,
    top: 0,
  },
  legendaryGlow: {
    backgroundColor: colors.neonPurple,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  headerCopy: {
    flex: 1,
  },
  badges: {
    flexDirection: 'row',
    gap: 7,
  },
  visibility: {
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 7,
    paddingVertical: 4,
  },
  publicVisibility: {
    borderColor: colors.neonCyan,
  },
  visibilityText: {
    color: colors.textMuted,
    fontSize: 7,
    fontWeight: '900',
  },
  publicVisibilityText: {
    color: colors.neonCyan,
  },
  legendary: {
    borderColor: colors.neonPurple,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 7,
    paddingVertical: 4,
  },
  legendaryText: {
    color: colors.neonPurple,
    fontSize: 7,
    fontWeight: '900',
  },
  date: {
    color: colors.textSecondary,
    fontSize: 10,
    marginTop: 8,
  },
  score: {
    alignItems: 'flex-end',
  },
  scoreLabel: {
    color: colors.textMuted,
    fontSize: 7,
    fontWeight: '900',
    letterSpacing: 0.7,
  },
  scoreValue: {
    color: colors.neonGreen,
    fontSize: 29,
    fontWeight: '900',
    marginTop: 2,
  },
  metrics: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 14,
  },
  metric: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: 11,
    flex: 1,
    padding: 9,
  },
  metricLabel: {
    color: colors.textMuted,
    fontSize: 7,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  metricValue: {
    color: colors.textPrimary,
    fontSize: 11,
    fontWeight: '800',
    marginTop: 4,
  },
  footer: {
    alignItems: 'center',
    borderTopColor: colors.border,
    borderTopWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 13,
    paddingTop: 12,
  },
  replay: {
    borderColor: colors.neonPurple,
    borderRadius: 11,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  disabled: {
    borderColor: colors.border,
    opacity: 0.45,
  },
  replayText: {
    color: colors.neonPurple,
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.6,
  },
  detailsLink: {
    color: colors.neonCyan,
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.7,
  },
});
