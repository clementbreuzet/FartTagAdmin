import React, { useCallback, useEffect, useMemo, useState } from 'react';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { NeonButton } from '../../components/common/NeonButton';
import { NeonCard } from '../../components/common/NeonCard';
import { StatusPill } from '../../components/common/StatusPill';
import { MetricCard } from '../../components/telemetry/MetricCard';
import { useI18n } from '../../i18n/I18nProvider';
import type {
  CalibrationResults,
  CalibrationStepIndex,
} from '../../models/calibration';
import type { TelemetryFrame } from '../../models/telemetry';
import type { CalibrationStackParamList } from '../../navigation/types';
import { useTelemetryStore } from '../../store/telemetryStore';
import { colors } from '../../theme/colors';

const STEP_DURATION_SECONDS = 30;

const steps = [
  {
    title: 'Air neutre',
    instruction:
      'Placez le FartTag dans un environnement ventilé, sans source de gaz ni bruit proche.',
  },
  {
    title: 'Bruits parasites',
    instruction:
      'Laissez fonctionner les équipements habituels afin de mesurer le bruit ambiant à ignorer.',
  },
  {
    title: 'Baseline gaz',
    instruction:
      'Maintenez le capteur immobile dans un air propre pour établir sa résistance gaz de référence.',
  },
  {
    title: 'Test réel',
    instruction:
      'Déclenchez un événement réel à distance normale pour valider les seuils recommandés.',
  },
  {
    title: 'Résumé',
    instruction:
      'Vérifiez les résultats calculés avant de terminer la calibration.',
  },
] as const;

type CapturedFrames = Partial<Record<CalibrationStepIndex, TelemetryFrame[]>>;

type CalibrationWizardScreenProps = NativeStackScreenProps<
  CalibrationStackParamList,
  'CalibrationWizardScreen'
>;

const average = (values: number[]) =>
  values.length === 0
    ? 0
    : values.reduce((total, value) => total + value, 0) / values.length;

const calculateResults = (framesByStep: CapturedFrames): CalibrationResults => {
  const noiseFrames = framesByStep[1] ?? [];
  const baselineFrames = framesByStep[2] ?? [];
  const realTestFrames = framesByStep[3] ?? [];
  const allFrames = Object.values(framesByStep).flat();

  const ambientAudio = average(noiseFrames.map((frame) => frame.audioLevel));
  const realAudio = average(realTestFrames.map((frame) => frame.audioLevel));
  const baselineGas = average(baselineFrames.map((frame) => frame.gasLevel));
  const realGas = average(realTestFrames.map((frame) => frame.gasLevel));

  return {
    recommendedAudioThreshold: Math.round(
      realAudio > ambientAudio ? (ambientAudio + realAudio) / 2 : ambientAudio * 1.25,
    ),
    recommendedGasThreshold: Math.round(
      realGas > 0 && baselineGas > 0 ? (baselineGas + realGas) / 2 : baselineGas * 0.85,
    ),
    totalFrames: allFrames.length,
    framesByStep,
  };
};

export const CalibrationWizardScreen = ({
  navigation,
}: CalibrationWizardScreenProps) => {
  const { t } = useI18n();
  const recentFrames = useTelemetryStore((state) => state.recentFrames);
  const [currentStep, setCurrentStep] = useState<CalibrationStepIndex>(0);
  const [secondsRemaining, setSecondsRemaining] = useState(
    STEP_DURATION_SECONDS,
  );
  const [stepStartedAt, setStepStartedAt] = useState(Date.now());
  const [capturedFrames, setCapturedFrames] = useState<CapturedFrames>({});

  const isSummary = currentStep === 4;
  const progress = ((currentStep + 1) / steps.length) * 100;
  const currentFrames = useMemo(
    () => recentFrames.filter((frame) => frame.timestampMs >= stepStartedAt),
    [recentFrames, stepStartedAt],
  );
  const previewResults = useMemo(
    () => calculateResults(capturedFrames),
    [capturedFrames],
  );

  useEffect(() => {
    if (isSummary || secondsRemaining === 0) {
      return;
    }

    const timer = setInterval(() => {
      setSecondsRemaining((seconds) => Math.max(0, seconds - 1));
    }, 1_000);

    return () => clearInterval(timer);
  }, [isSummary, secondsRemaining]);

  const nextStep = useCallback(() => {
    if (isSummary) {
      navigation.navigate('CalibrationResultsScreen', {
        results: previewResults,
      });
      return;
    }

    const nextCapturedFrames = {
      ...capturedFrames,
      [currentStep]: currentFrames,
    };

    if (currentStep === 3) {
      setCapturedFrames(nextCapturedFrames);
      setCurrentStep(4);
      return;
    }

    setCapturedFrames(nextCapturedFrames);
    setCurrentStep((currentStep + 1) as CalibrationStepIndex);
    setSecondsRemaining(STEP_DURATION_SECONDS);
    setStepStartedAt(Date.now());
  }, [
    capturedFrames,
    currentFrames,
    currentStep,
    isSummary,
    navigation,
    previewResults,
  ]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>{t('app.admin')}</Text>
            <Text style={styles.title}>{t('nav.calibration')}</Text>
          </View>
          <StatusPill
            label={`Étape ${currentStep + 1}/${steps.length}`}
            status={isSummary ? 'active' : 'idle'}
          />
        </View>

        <View style={styles.screenLinks}>
          <Pressable
            onPress={() => navigation.navigate('CalibrationProfilesScreen')}
            style={styles.screenLink}
          >
            <Text style={styles.screenLinkText}>Profils</Text>
          </Pressable>
          <Pressable
            onPress={() => navigation.navigate('AdvancedSettingsScreen')}
            style={styles.screenLink}
          >
            <Text style={styles.screenLinkText}>Avancé</Text>
          </Pressable>
        </View>

        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>

        <NeonCard accent={isSummary ? 'green' : 'cyan'} style={styles.stepCard}>
          <Text style={styles.stepNumber}>ÉTAPE {currentStep + 1}</Text>
          <Text style={styles.stepTitle}>{steps[currentStep].title}</Text>
          <Text style={styles.instruction}>
            {steps[currentStep].instruction}
          </Text>

          {!isSummary ? (
            <View style={styles.timerRow}>
              <Text style={styles.timer}>{secondsRemaining}s</Text>
              <View style={styles.timerCopy}>
                <Text style={styles.timerLabel}>
                  {secondsRemaining === 0 ? 'Mesure terminée' : 'Collecte en cours'}
                </Text>
                <Text style={styles.frameCount}>
                  {currentFrames.length} trames collectées
                </Text>
              </View>
            </View>
          ) : null}
        </NeonCard>

        {isSummary ? (
          <View style={styles.metricGrid}>
            <MetricCard
              accent="purple"
              detail="Seuil recommandé"
              label="Audio"
              value={`${previewResults.recommendedAudioThreshold} dB`}
            />
            <MetricCard
              accent="cyan"
              detail="Seuil recommandé"
              label="Gaz"
              value={`${previewResults.recommendedGasThreshold} kΩ`}
            />
            <MetricCard
              accent="green"
              detail="Toutes les étapes"
              label="Trames"
              value={`${previewResults.totalFrames}`}
            />
          </View>
        ) : (
          <NeonCard accent="purple" style={styles.tipCard}>
            <Text style={styles.tipTitle}>Consigne</Text>
            <Text style={styles.tipText}>
              Attendez idéalement la fin des 30 secondes avant de passer à
              l’étape suivante. Le bouton reste disponible pour les tests.
            </Text>
          </NeonCard>
        )}

        <View style={styles.actions}>
          <NeonButton
            label={isSummary ? 'Voir les résultats' : 'Suivant'}
            onPress={nextStep}
            style={styles.actionButton}
          />
          <NeonButton
            label="Annuler"
            onPress={() => navigation.goBack()}
            style={styles.actionButton}
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
  eyebrow: {
    color: colors.neonGreen,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 2,
  },
  screenLinks: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'flex-end',
    marginBottom: 16,
  },
  screenLink: {
    borderColor: colors.neonCyan,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  screenLinkText: {
    color: colors.neonCyan,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  title: {
    color: colors.textPrimary,
    fontSize: 28,
    fontWeight: '700',
    marginTop: 4,
  },
  progressTrack: {
    backgroundColor: colors.border,
    borderRadius: 4,
    height: 7,
    marginBottom: 18,
    overflow: 'hidden',
  },
  progressFill: {
    backgroundColor: colors.neonGreen,
    borderRadius: 4,
    height: '100%',
  },
  stepCard: {
    marginBottom: 16,
  },
  stepNumber: {
    color: colors.neonCyan,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  stepTitle: {
    color: colors.textPrimary,
    fontSize: 24,
    fontWeight: '700',
    marginTop: 8,
  },
  instruction: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 20,
    marginTop: 10,
  },
  timerRow: {
    alignItems: 'center',
    borderTopColor: colors.border,
    borderTopWidth: 1,
    flexDirection: 'row',
    marginTop: 20,
    paddingTop: 18,
  },
  timer: {
    color: colors.neonGreen,
    fontSize: 40,
    fontWeight: '800',
    marginRight: 16,
  },
  timerCopy: {
    flex: 1,
  },
  timerLabel: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '700',
  },
  frameCount: {
    color: colors.textMuted,
    fontSize: 11,
    marginTop: 5,
  },
  tipCard: {
    marginBottom: 16,
  },
  tipTitle: {
    color: colors.neonPurple,
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  tipText: {
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 7,
  },
  metricGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
  },
});

export default CalibrationWizardScreen;
