import React, { useCallback, useMemo, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { NeonButton } from '../../components/common/NeonButton';
import { NeonCard } from '../../components/common/NeonCard';
import { StatusPill } from '../../components/common/StatusPill';
import { useI18n } from '../../i18n/I18nProvider';
import { EventLogItem } from '../../components/logs/EventLogItem';
import type { EventDecision, EventLog } from '../../models/eventLog';
import { PhoneMicService } from '../../services/audio/PhoneMicService';
import { useLogStore } from '../../store/logStore';
import { colors } from '../../theme/colors';

type LogFilter = 'all' | EventDecision;

const filters: { label: string; value: LogFilter }[] = [
  { label: 'Tous', value: 'all' },
  { label: 'Acceptés', value: 'accepted' },
  { label: 'Rejetés', value: 'rejected' },
  { label: 'Erreurs', value: 'error' },
  { label: 'Audio only', value: 'audio_only' },
];

export const EventLogsScreen = () => {
  const { t } = useI18n();
  const logs = useLogStore((state) => state.logs);
  const clearLogs = useLogStore((state) => state.clearLogs);
  const [filter, setFilter] = useState<LogFilter>('all');
  const [query, setQuery] = useState('');

  const visibleLogs = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return logs.filter((log) => {
      const matchesFilter = filter === 'all' || log.decision === filter;
      const searchableText = [
        log.eventType,
        log.decision,
        log.reason,
        log.source,
        log.audioLevel,
        log.gasLevel,
        log.score,
      ]
        .join(' ')
        .toLowerCase();

      return matchesFilter && searchableText.includes(normalizedQuery);
    });
  }, [filter, logs, query]);

  const confirmClear = useCallback(() => {
    Alert.alert(
      'Effacer les logs',
      'Cette action supprimera tous les logs de détection et diagnostic.',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Effacer', style: 'destructive', onPress: clearLogs },
      ],
    );
  }, [clearLogs]);

  const exportJson = useCallback(() => {
    Alert.alert(
      'Export JSON prêt',
      JSON.stringify(
        { exportedAt: new Date().toISOString(), logs: visibleLogs },
        null,
        2,
      ),
    );
  }, [visibleLogs]);

  const replayAudio = useCallback((log: EventLog) => {
    if (log.audioUri) {
      void PhoneMicService.replay(log.audioUri);
    }
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>{t('app.admin')}</Text>
            <Text style={styles.title}>{t('screen.eventLogs')}</Text>
          </View>
          <StatusPill label={`${visibleLogs.length} logs`} status="idle" />
        </View>

        <NeonCard accent="cyan" style={styles.filterCard}>
          <TextInput
            onChangeText={setQuery}
            placeholder="Rechercher type, raison, décision..."
            placeholderTextColor={colors.textMuted}
            style={styles.searchInput}
            value={query}
          />
          <View style={styles.filters}>
            {filters.map((item) => (
              <Pressable
                key={item.value}
                onPress={() => setFilter(item.value)}
                style={[
                  styles.filter,
                  filter === item.value && styles.activeFilter,
                ]}
              >
                <Text
                  style={[
                    styles.filterText,
                    filter === item.value && styles.activeFilterText,
                  ]}
                >
                  {item.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </NeonCard>

        <View style={styles.actions}>
          <NeonButton
            disabled={visibleLogs.length === 0}
            label="Exporter JSON"
            onPress={exportJson}
            style={styles.actionButton}
          />
          <NeonButton
            disabled={logs.length === 0}
            label="Clear logs"
            onPress={confirmClear}
            style={styles.actionButton}
            variant="secondary"
          />
        </View>

        {visibleLogs.length === 0 ? (
          <NeonCard accent="purple" style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>Aucun log trouvé</Text>
            <Text style={styles.emptyDescription}>
              Les événements de détection et diagnostics apparaîtront ici.
            </Text>
          </NeonCard>
        ) : (
          visibleLogs.map((log) => (
            <EventLogItem key={log.id} log={log} onReplayAudio={replayAudio} />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { backgroundColor: colors.background, flex: 1 },
  content: { padding: 16, paddingBottom: 36 },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  eyebrow: {
    color: colors.neonGreen,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 2,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 28,
    fontWeight: '700',
    marginTop: 4,
  },
  filterCard: { marginBottom: 12 },
  searchInput: {
    backgroundColor: colors.surfaceElevated,
    borderColor: colors.border,
    borderRadius: 10,
    borderWidth: 1,
    color: colors.textPrimary,
    fontSize: 13,
    minHeight: 46,
    paddingHorizontal: 13,
  },
  filters: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  filter: {
    borderColor: colors.border,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  activeFilter: { backgroundColor: '#102000', borderColor: colors.neonGreen },
  filterText: { color: colors.textMuted, fontSize: 10, fontWeight: '700' },
  activeFilterText: { color: colors.neonGreen },
  actions: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  actionButton: { flex: 1 },
  emptyCard: { alignItems: 'center', paddingVertical: 38 },
  emptyTitle: { color: colors.textPrimary, fontSize: 18, fontWeight: '700' },
  emptyDescription: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
  },
});

export default EventLogsScreen;
