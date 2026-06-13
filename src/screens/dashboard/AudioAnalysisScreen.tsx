import React, { useCallback, useMemo, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { NeonButton } from '../../components/common/NeonButton';
import { NeonCard } from '../../components/common/NeonCard';
import { StatusPill } from '../../components/common/StatusPill';
import { useI18n } from '../../i18n/I18nProvider';
import { AudioWaveform } from '../../components/telemetry/AudioWaveform';
import { MetricCard } from '../../components/telemetry/MetricCard';
import { useTelemetryStore } from '../../store/telemetryStore';
import { colors } from '../../theme/colors';

const MOCK_EVENT_DURATION_SECONDS = 2.8;
const MOCK_DOMINANT_FREQUENCY_HZ = 184;
const MOCK_SIGNAL_TO_NOISE_DB = 24.6;

export const AudioAnalysisScreen = () => {
  const { t } = useI18n();
  const latestFrame = useTelemetryStore((state) => state.latestFrame);
  const recentFrames = useTelemetryStore((state) => state.recentFrames);
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedFrames, setCapturedFrames] = useState<typeof recentFrames>([]);

  const visibleFrames = isCapturing ? recentFrames : capturedFrames;
  const hasTelemetry = recentFrames.length > 0;
  const hasSample = capturedFrames.length > 0;

  const audioPeak = useMemo(
    () =>
      visibleFrames.length > 0
        ? Math.max(...visibleFrames.map((frame) => frame.audioLevel))
        : null,
    [visibleFrames],
  );

  const startCapture = useCallback(() => {
    setCapturedFrames([]);
    setIsCapturing(true);
  }, []);

  const stopCapture = useCallback(() => {
    setCapturedFrames(recentFrames);
    setIsCapturing(false);
  }, [recentFrames]);

  const saveSample = useCallback(() => {
    Alert.alert(
      'Sample sauvegardé',
      `${capturedFrames.length} trames audio ont été sauvegardées localement.`,
    );
  }, [capturedFrames.length]);

  const exportSample = useCallback(() => {
    Alert.alert(
      'Export prêt',
      "L'export du sample audio sera relié au service de fichiers.",
    );
  }, []);

  if (!hasTelemetry) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.emptyContainer}>
          <NeonCard accent="purple" style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>≈</Text>
            <Text style={styles.emptyTitle}>Aucune donnée audio</Text>
            <Text style={styles.emptyDescription}>
              Connectez un FartTag et démarrez la télémétrie pour analyser le
              signal du microphone INMP441.
            </Text>
            <StatusPill label="En attente de trames" status="idle" />
          </NeonCard>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.headerCopy}>
            <Text style={styles.eyebrow}>{t('app.admin')}</Text>
            <Text style={styles.title}>{t('screen.audioAnalysis')}</Text>
          </View>
          <StatusPill
            label={isCapturing ? 'Capture active' : 'Prêt'}
            status={isCapturing ? 'active' : 'idle'}
          />
        </View>

        <AudioWaveform frames={visibleFrames} isCapturing={isCapturing} />

        <View style={styles.metricGrid}>
          <MetricCard
            accent="purple"
            detail="Dernière trame"
            label="Audio RMS"
            value={`${latestFrame?.audioLevel ?? '--'} dB`}
          />
          <MetricCard
            accent="cyan"
            detail="Maximum capture"
            label="Audio Peak"
            value={`${audioPeak ?? '--'} dB`}
          />
          <MetricCard
            accent="green"
            detail="Valeur mockée"
            label="Durée événement"
            value={`${MOCK_EVENT_DURATION_SECONDS.toFixed(1)} s`}
          />
          <MetricCard
            accent="cyan"
            detail="Valeur mockée"
            label="Fréquence dominante"
            value={`${MOCK_DOMINANT_FREQUENCY_HZ} Hz`}
          />
          <MetricCard
            accent="purple"
            detail="Valeur mockée"
            label="Signal / bruit"
            value={`${MOCK_SIGNAL_TO_NOISE_DB.toFixed(1)} dB`}
          />
        </View>

        <NeonCard accent="cyan" style={styles.captureCard}>
          <View style={styles.captureHeader}>
            <View>
              <Text style={styles.captureTitle}>Contrôle de capture</Text>
              <Text style={styles.captureDescription}>
                {isCapturing
                  ? 'Acquisition des dernières trames en cours.'
                  : hasSample
                    ? `${capturedFrames.length} trames prêtes à sauvegarder.`
                    : 'Démarrez une capture pour créer un sample.'}
              </Text>
            </View>
          </View>

          <View style={styles.actions}>
            <NeonButton
              disabled={isCapturing}
              label="Démarrer capture"
              onPress={startCapture}
              style={styles.actionButton}
            />
            <NeonButton
              disabled={!isCapturing}
              label="Arrêter capture"
              onPress={stopCapture}
              style={styles.actionButton}
              variant="secondary"
            />
            <NeonButton
              disabled={!hasSample || isCapturing}
              label="Sauvegarder sample"
              onPress={saveSample}
              style={styles.actionButton}
            />
            <NeonButton
              disabled={!hasSample || isCapturing}
              label="Exporter sample"
              onPress={exportSample}
              style={styles.actionButton}
              variant="secondary"
            />
          </View>
        </NeonCard>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: colors.background,
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 36,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  headerCopy: {
    flex: 1,
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
  metricGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  captureCard: {
    marginTop: 2,
  },
  captureHeader: {
    marginBottom: 16,
  },
  captureTitle: {
    color: colors.neonCyan,
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  captureDescription: {
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 7,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    minWidth: '46%',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  emptyCard: {
    alignItems: 'center',
    paddingVertical: 38,
  },
  emptyIcon: {
    color: colors.neonPurple,
    fontSize: 64,
    lineHeight: 70,
  },
  emptyTitle: {
    color: colors.textPrimary,
    fontSize: 21,
    fontWeight: '700',
    marginTop: 10,
  },
  emptyDescription: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 20,
    marginTop: 9,
    maxWidth: 320,
    textAlign: 'center',
  },
});

export default AudioAnalysisScreen;
