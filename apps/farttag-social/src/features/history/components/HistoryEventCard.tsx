import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '../../../theme/colors';
import type { AudioPlaybackStatus, FartHistoryEvent } from '../types';
import { AudioPlayButton } from './AudioPlayButton';

type HistoryEventCardProps = {
  currentlyPlayingId: string | null;
  event: FartHistoryEvent;
  onOpen: (event: FartHistoryEvent) => void;
  onReplay: (event: FartHistoryEvent) => void;
  playbackStatus: AudioPlaybackStatus;
};

const formatDate = (date: string) =>
  new Intl.DateTimeFormat(undefined, {
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date));

const categoryColor = (category: string) => {
  const normalized = category.toLowerCase();
  if (normalized.includes('5') || normalized === 'mythic') return colors.neonGreen;
  if (normalized.includes('4') || normalized === 'legendary') return '#FF9D00';
  if (normalized.includes('3') || normalized === 'epic') return colors.neonPurple;
  if (normalized.includes('2') || normalized === 'rare') return colors.neonCyan;
  return colors.neonGreen;
};

export const HistoryEventCard = ({
  currentlyPlayingId,
  event,
  onOpen,
  onReplay,
  playbackStatus,
}: HistoryEventCardProps) => {
  const accent = categoryColor(event.category);
  return (
    <Pressable onPress={() => onOpen(event)} style={[styles.card, { borderColor: `${accent}55` }]}>
      <View style={[styles.glow, { backgroundColor: accent }]} />
      <View style={styles.header}>
        <View style={styles.headerCopy}>
          <View style={styles.badges}>
            <Badge color={event.visibility === 'public' ? colors.neonCyan : colors.textMuted} label={event.visibility} />
            {event.isAuthenticated ? <Badge color={colors.neonGreen} label="Authentifié" /> : null}
          </View>
          <Text style={[styles.category, { color: accent }]}>{event.category.toUpperCase()}</Text>
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
        <AudioPlayButton
          disabled={!event.audioReplayUrl && !event.audioFileId}
          isCurrent={currentlyPlayingId === event.id}
          onPress={() => onReplay(event)}
          status={playbackStatus}
        />
        <Text style={styles.detailsLink}>VOIR DÉTAIL ›</Text>
      </View>
    </Pressable>
  );
};

const Badge = ({ color, label }: { color: string; label: string }) => (
  <View style={[styles.badge, { borderColor: color }]}>
    <Text style={[styles.badgeText, { color }]}>{label.toUpperCase()}</Text>
  </View>
);

const Metric = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.metric}>
    <Text style={styles.metricLabel}>{label}</Text>
    <Text style={styles.metricValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: 20, borderWidth: 1, marginBottom: 14, overflow: 'hidden', padding: 15 },
  glow: { height: 2, left: 32, opacity: 0.8, position: 'absolute', right: 32, top: 0 },
  header: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  headerCopy: { flex: 1 },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  badge: { borderRadius: 8, borderWidth: 1, paddingHorizontal: 7, paddingVertical: 4 },
  badgeText: { fontSize: 7, fontWeight: '900' },
  category: { fontSize: 8, fontWeight: '900', marginTop: 8 },
  date: { color: colors.textSecondary, fontSize: 10, marginTop: 5 },
  score: { alignItems: 'flex-end' },
  scoreLabel: { color: colors.textMuted, fontSize: 7, fontWeight: '900', letterSpacing: 0.7 },
  scoreValue: { color: colors.neonGreen, fontSize: 29, fontWeight: '900', marginTop: 2 },
  metrics: { flexDirection: 'row', gap: 8, marginTop: 14 },
  metric: { backgroundColor: colors.surfaceElevated, borderRadius: 11, flex: 1, padding: 9 },
  metricLabel: { color: colors.textMuted, fontSize: 7, fontWeight: '800', textTransform: 'uppercase' },
  metricValue: { color: colors.textPrimary, fontSize: 11, fontWeight: '800', marginTop: 4 },
  footer: { alignItems: 'center', borderTopColor: colors.border, borderTopWidth: 1, flexDirection: 'row', justifyContent: 'space-between', marginTop: 13, paddingTop: 12 },
  detailsLink: { color: colors.neonCyan, fontSize: 8, fontWeight: '900', letterSpacing: 0.7 },
});
