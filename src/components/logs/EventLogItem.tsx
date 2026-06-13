import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { EventLog } from '../../models/eventLog';
import { colors } from '../../theme/colors';
import { NeonButton } from '../common/NeonButton';
import { NeonCard } from '../common/NeonCard';
import { StatusPill } from '../common/StatusPill';

type EventLogItemProps = {
  log: EventLog;
  onReplayAudio?: (log: EventLog) => void;
};

const decisionLabels = {
  accepted: 'Accepté',
  rejected: 'Rejeté',
  error: 'Erreur',
  audio_only: 'Audio only',
} as const;

const decisionStatuses = {
  accepted: 'active',
  rejected: 'warning',
  error: 'error',
  audio_only: 'idle',
} as const;

export const EventLogItem = ({ log, onReplayAudio }: EventLogItemProps) => (
  <NeonCard
    accent={log.decision === 'accepted' ? 'green' : log.decision === 'error' ? 'purple' : 'cyan'}
    style={styles.card}
  >
    <View style={styles.header}>
      <View style={styles.headerCopy}>
        <Text style={styles.eventType}>{log.eventType}</Text>
        <Text style={styles.timestamp}>
          {new Date(log.timestampMs).toLocaleString()}
        </Text>
      </View>
      <StatusPill
        label={decisionLabels[log.decision]}
        status={decisionStatuses[log.decision]}
      />
    </View>

    <View style={styles.metrics}>
      <Metric label="Audio" value={`${log.audioLevel} dB`} />
      <Metric label="Gaz" value={`${log.gasLevel} kΩ`} />
      <Metric label="Score" value={`${log.score}%`} />
    </View>

    <View style={styles.reasonBox}>
      <Text style={styles.source}>Source : {log.source}</Text>
      {log.durationMs !== undefined ? (
        <Text style={styles.duration}>
          Durée : {(log.durationMs / 1_000).toFixed(1)} s
        </Text>
      ) : null}
      <Text style={styles.reasonLabel}>Raison</Text>
      <Text style={styles.reason}>{log.reason}</Text>
    </View>

    {log.audioUri && onReplayAudio ? (
      <NeonButton
        label="Replay audio"
        onPress={() => onReplayAudio(log)}
        style={styles.replayButton}
        variant="secondary"
      />
    ) : null}
  </NeonCard>
);

type MetricProps = {
  label: string;
  value: string;
};

const Metric = ({ label, value }: MetricProps) => (
  <View style={styles.metric}>
    <Text style={styles.metricLabel}>{label}</Text>
    <Text style={styles.metricValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  card: { marginBottom: 12 },
  header: { alignItems: 'center', flexDirection: 'row', marginBottom: 14 },
  headerCopy: { flex: 1, marginRight: 10 },
  eventType: { color: colors.textPrimary, fontSize: 16, fontWeight: '800' },
  timestamp: { color: colors.textMuted, fontSize: 10, marginTop: 4 },
  metrics: { flexDirection: 'row', gap: 8 },
  metric: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: 9,
    flex: 1,
    padding: 9,
  },
  metricLabel: {
    color: colors.textMuted,
    fontSize: 8,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  metricValue: {
    color: colors.neonCyan,
    fontSize: 12,
    fontWeight: '800',
    marginTop: 5,
  },
  reasonBox: {
    borderTopColor: colors.border,
    borderTopWidth: 1,
    marginTop: 14,
    paddingTop: 12,
  },
  reasonLabel: {
    color: colors.textMuted,
    fontSize: 9,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  source: {
    color: colors.neonPurple,
    fontSize: 9,
    fontWeight: '800',
    marginBottom: 7,
    textTransform: 'uppercase',
  },
  duration: {
    color: colors.textSecondary,
    fontSize: 10,
    marginBottom: 7,
  },
  reason: { color: colors.textSecondary, fontSize: 12, lineHeight: 18, marginTop: 5 },
  replayButton: { marginTop: 14 },
});

export default EventLogItem;
