import React, { useCallback, useEffect } from 'react';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
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
import { LiveChart } from '../../components/telemetry/LiveChart';
import { MetricCard } from '../../components/telemetry/MetricCard';
import { useI18n } from '../../i18n/I18nProvider';
import type { DashboardStackParamList } from '../../navigation/types';
import { PhoneMicService } from '../../services/audio/PhoneMicService';
import { useAudioStore } from '../../store/audioStore';
import { useDeviceStore } from '../../store/deviceStore';
import { useLogStore } from '../../store/logStore';
import { useTelemetryStore } from '../../store/telemetryStore';
import { colors } from '../../theme/colors';

type LiveDashboardScreenProps = NativeStackScreenProps<
  DashboardStackParamList,
  'LiveDashboardScreen'
>;

export const LiveDashboardScreen = ({
  navigation,
}: LiveDashboardScreenProps) => {
  const { t } = useI18n();
  const connectedDevice = useDeviceStore((state) => state.connectedDevice);
  const latestFrame = useTelemetryStore((state) => state.latestFrame);
  const audioHistory = useTelemetryStore((state) => state.audioHistory);
  const gasHistory = useTelemetryStore((state) => state.gasHistory);
  const scoreHistory = useTelemetryStore((state) => state.scoreHistory);
  const clearTelemetry = useTelemetryStore((state) => state.clearTelemetry);
  const appendFrame = useTelemetryStore((state) => state.appendFrame);
  const addLog = useLogStore((state) => state.addLog);
  const addRecording = useAudioStore((state) => state.addRecording);
  const isRecording = useAudioStore((state) => state.isRecording);
  const currentDurationMs = useAudioStore((state) => state.currentDurationMs);
  const currentLevel = useAudioStore((state) => state.currentLevel);
  const setRecordingState = useAudioStore((state) => state.setRecordingState);
  const updateLiveMetrics = useAudioStore((state) => state.updateLiveMetrics);

  const navigateTo = useCallback(
    (route: 'AudioAnalysisScreen' | 'GasAnalysisScreen') =>
      navigation.navigate(route),
    [navigation],
  );

  const isConnected = connectedDevice !== null;
  const isPhoneMicMode = connectedDevice?.source === 'phoneMic';
  const battery = connectedDevice?.batteryLevel ?? 80;
  const signal = connectedDevice?.rssi ?? null;

  useEffect(() => {
    if (!isRecording) {
      return;
    }

    const timer = setInterval(() => {
      void PhoneMicService.getCurrentLevel().then(({ durationMs, level }) => {
        updateLiveMetrics(durationMs, level);
      });
    }, 250);

    return () => clearInterval(timer);
  }, [isRecording, updateLiveMetrics]);

  const togglePhoneRecording = useCallback(async () => {
    try {
      if (!isRecording) {
        const granted = await PhoneMicService.requestPermission();
        if (!granted) {
          Alert.alert(
            'Permission requise',
            'Autorisez le microphone pour utiliser PhoneMicMode.',
          );
          return;
        }

        await PhoneMicService.startRecording();
        setRecordingState(true);
        return;
      }

      const recording = await PhoneMicService.stopRecording();
      const audioLevel = recording.averageLevel ?? 45;
      const score = Math.min(100, Math.round(audioLevel * 1.15));
      const timestampMs = Date.now();

      addRecording(recording);
      addLog({
        id: recording.id,
        source: 'phoneMic',
        timestampMs,
        eventType: 'PhoneMic recording',
        audioLevel,
        gasLevel: 0,
        score,
        decision: 'audio_only',
        reason: 'Enregistrement micro téléphone sans capteur gaz',
        audioSampleId: recording.id,
        audioUri: recording.uri,
        durationMs: recording.durationMs,
      });
      appendFrame({
        timestampMs,
        audioLevel,
        gasLevel: 0,
        temperature: 0,
        score,
        soundDetected: score >= 50,
        gasDetected: false,
      });
      setRecordingState(false);
    } catch (error) {
      setRecordingState(false);
      Alert.alert(
        'Erreur microphone',
        error instanceof Error
          ? error.message
          : "L'enregistrement n'a pas pu être traité.",
      );
    }
  }, [
    addLog,
    addRecording,
    appendFrame,
    isRecording,
    setRecordingState,
  ]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.headerCopy}>
            <Text style={styles.eyebrow}>{t('app.admin')}</Text>
            <Text style={styles.title}>{t('screen.dashboard')}</Text>
          </View>
          <StatusPill
            label={
              isPhoneMicMode
                ? 'Mode téléphone'
                : isConnected
                  ? 'Connecté'
                  : 'Déconnecté'
            }
            status={isConnected ? 'active' : 'error'}
          />
        </View>

        <NeonCard accent="green" style={styles.deviceCard}>
          <View style={styles.deviceHeader}>
            <View style={styles.deviceCopy}>
              <Text style={styles.deviceName}>
                {connectedDevice?.name ?? 'Aucun FartTag connecté'}
              </Text>
              <Text style={styles.deviceId}>
                {connectedDevice?.id ??
                  'Connectez un appareil pour recevoir la télémétrie.'}
              </Text>
            </View>
            <View style={styles.deviceStats}>
              <Text style={styles.deviceStat}>{battery}% BAT</Text>
              <Text style={styles.deviceStat}>
                {signal === null ? '--' : signal} dBm
              </Text>
            </View>
          </View>
        </NeonCard>

        {isPhoneMicMode ? (
          <NeonCard accent="purple" style={styles.deviceCard}>
            <View style={styles.phoneMicHeader}>
              <View>
                <Text style={styles.phoneMicTitle}>
                  {isRecording ? 'Recording...' : 'Micro téléphone prêt'}
                </Text>
                <Text style={styles.phoneMicDetail}>
                  Durée {(currentDurationMs / 1_000).toFixed(1)} s · Niveau{' '}
                  {currentLevel} dB
                </Text>
              </View>
              <StatusPill
                label={isRecording ? 'Recording' : 'Simulation'}
                status={isRecording ? 'warning' : 'idle'}
              />
            </View>
            <View style={styles.levelTrack}>
              <View style={[styles.levelFill, { width: `${currentLevel}%` }]} />
            </View>
            <NeonButton
              label={isRecording ? "Arrêter l'enregistrement" : 'Enregistrer un son'}
              onPress={() => void togglePhoneRecording()}
              variant={isRecording ? 'secondary' : 'primary'}
            />
          </NeonCard>
        ) : null}

        <View style={styles.metricGrid}>
          <MetricCard
            accent="purple"
            detail="Niveau microphone"
            label="Audio"
            value={`${latestFrame?.audioLevel ?? '--'} dB`}
          />
          <MetricCard
            accent="cyan"
            detail="Résistance BME688"
            label="Gaz"
            value={`${latestFrame?.gasLevel ?? '--'} kΩ`}
          />
          <MetricCard
            accent="green"
            detail="Température ambiante"
            label="Température"
            value={`${latestFrame?.temperature?.toFixed(1) ?? '--'} °C`}
          />
          <MetricCard
            accent="green"
            detail="Confiance détection"
            label="Score"
            value={`${latestFrame?.score ?? '--'}%`}
          />
          <MetricCard
            accent="purple"
            detected={latestFrame?.soundDetected ?? false}
            label="Son"
            value={latestFrame?.soundDetected ? 'Détecté' : 'Normal'}
          />
          <MetricCard
            accent="cyan"
            detected={latestFrame?.gasDetected ?? false}
            label="Gaz"
            value={latestFrame?.gasDetected ? 'Détecté' : 'Normal'}
          />
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Télémétrie temps réel</Text>
          <StatusPill
            label={latestFrame ? 'Live' : 'En attente'}
            status={latestFrame ? 'active' : 'idle'}
          />
        </View>

        <LiveChart
          accent="purple"
          data={audioHistory}
          title="Courbe audio"
          unit="dB"
        />
        <LiveChart
          accent="cyan"
          data={gasHistory}
          title="Courbe gaz"
          unit="kΩ"
        />
        <LiveChart
          accent="green"
          data={scoreHistory}
          title="Courbe score"
          unit="%"
        />

        <View style={styles.actions}>
          <NeonButton
            label="Analyse audio"
            onPress={() => navigateTo('AudioAnalysisScreen')}
            style={styles.actionButton}
            variant="secondary"
          />
          <NeonButton
            label="Analyse gaz"
            onPress={() => navigateTo('GasAnalysisScreen')}
            style={styles.actionButton}
          />
          <NeonButton
            disabled={!latestFrame}
            label="Effacer télémétrie"
            onPress={clearTelemetry}
            style={styles.clearButton}
            variant="secondary"
          />
        </View>
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
  deviceCard: {
    marginBottom: 16,
  },
  deviceHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  deviceCopy: {
    flex: 1,
    marginRight: 12,
  },
  deviceName: {
    color: colors.textPrimary,
    fontSize: 19,
    fontWeight: '700',
  },
  deviceId: {
    color: colors.textMuted,
    fontSize: 11,
    marginTop: 5,
  },
  deviceStats: {
    alignItems: 'flex-end',
    gap: 5,
  },
  deviceStat: {
    color: colors.neonGreen,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  phoneMicHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  phoneMicTitle: {
    color: colors.neonPurple,
    fontSize: 15,
    fontWeight: '800',
  },
  phoneMicDetail: {
    color: colors.textSecondary,
    fontSize: 11,
    marginTop: 5,
  },
  levelTrack: {
    backgroundColor: colors.border,
    borderRadius: 4,
    height: 7,
    marginBottom: 16,
    overflow: 'hidden',
  },
  levelFill: {
    backgroundColor: colors.neonPurple,
    borderRadius: 4,
    height: '100%',
  },
  metricGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 22,
  },
  sectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: {
    color: colors.neonCyan,
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 4,
  },
  actionButton: {
    flex: 1,
    minWidth: '46%',
  },
  clearButton: {
    width: '100%',
  },
});

export default LiveDashboardScreen;
