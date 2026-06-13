import React, { useCallback, useMemo } from 'react';
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
import { useI18n } from '../../i18n/I18nProvider';
import { MetricCard } from '../../components/telemetry/MetricCard';
import type {
  CalibrationConfiguration,
  CalibrationProfile,
  CalibrationResults,
} from '../../models/calibration';
import type { CalibrationStackParamList } from '../../navigation/types';
import { useCalibrationStore } from '../../store/calibrationStore';
import { colors } from '../../theme/colors';

type CalibrationResultsScreenProps = NativeStackScreenProps<
  CalibrationStackParamList,
  'CalibrationResultsScreen'
>;

const EMPTY_RESULTS: CalibrationResults = {
  recommendedAudioThreshold: 0,
  recommendedGasThreshold: 0,
  totalFrames: 0,
  framesByStep: {},
};

const buildConfiguration = (
  results: CalibrationResults,
): CalibrationConfiguration => {
  const confidencePercent = Math.min(
    98,
    Math.max(20, Math.round((results.totalFrames / 120) * 100)),
  );

  return {
    audioThreshold: results.recommendedAudioThreshold,
    gasThreshold: results.recommendedGasThreshold,
    cooldownSeconds: confidencePercent >= 75 ? 20 : 30,
    gasAnalysisWindowSeconds: confidencePercent >= 75 ? 8 : 12,
    confidencePercent,
    recommendedProfile:
      confidencePercent >= 80
        ? 'Haute précision'
        : confidencePercent >= 50
          ? 'Équilibré'
          : 'Prudent',
  };
};

export const CalibrationResultsScreen = ({
  route,
  navigation,
}: CalibrationResultsScreenProps) => {
  const { t } = useI18n();
  const results = route.params.results ?? EMPTY_RESULTS;
  const applyConfiguration = useCalibrationStore(
    (state) => state.applyConfiguration,
  );
  const saveProfile = useCalibrationStore((state) => state.saveProfile);
  const configuration = useMemo(() => buildConfiguration(results), [results]);

  const applyToDevice = useCallback(() => {
    applyConfiguration(configuration);
    Alert.alert(
      'Calibration appliquée',
      "Les seuils recommandés sont maintenant actifs dans l'application.",
    );
  }, [applyConfiguration, configuration]);

  const saveAsProfile = useCallback(() => {
    const createdAt = new Date().toISOString();
    const profile: CalibrationProfile = {
      ...configuration,
      id: createdAt,
      name: `${configuration.recommendedProfile} ${new Date().toLocaleDateString()}`,
      createdAt,
    };

    saveProfile(profile);
    Alert.alert('Profil sauvegardé', profile.name);
  }, [configuration, saveProfile]);

  const exportJson = useCallback(() => {
    const json = JSON.stringify(
      {
        exportedAt: new Date().toISOString(),
        configuration,
        calibration: results,
      },
      null,
      2,
    );

    Alert.alert('Export JSON prêt', json);
  }, [configuration, results]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>{t('app.admin')}</Text>
            <Text style={styles.title}>{t('screen.calibrationResults')}</Text>
          </View>
          <StatusPill
            label={`${configuration.confidencePercent}% confiance`}
            status={configuration.confidencePercent >= 60 ? 'active' : 'warning'}
          />
        </View>

        <NeonCard accent="green" style={styles.profileCard}>
          <Text style={styles.profileLabel}>Profil recommandé</Text>
          <Text style={styles.profileName}>
            {configuration.recommendedProfile}
          </Text>
          <Text style={styles.profileDescription}>
            Recommandation calculée à partir de {results.totalFrames} trames
            collectées pendant l’assistant.
          </Text>
          <View style={styles.confidenceTrack}>
            <View
              style={[
                styles.confidenceFill,
                { width: `${configuration.confidencePercent}%` },
              ]}
            />
          </View>
        </NeonCard>

        <View style={styles.metricGrid}>
          <MetricCard
            accent="purple"
            detail="Seuil recommandé"
            label="Audio"
            value={`${configuration.audioThreshold} dB`}
          />
          <MetricCard
            accent="cyan"
            detail="Seuil recommandé"
            label="Gaz"
            value={`${configuration.gasThreshold} kΩ`}
          />
          <MetricCard
            accent="green"
            detail="Avant nouvelle détection"
            label="Cooldown"
            value={`${configuration.cooldownSeconds} s`}
          />
          <MetricCard
            accent="cyan"
            detail="Fenêtre glissante"
            label="Analyse gaz"
            value={`${configuration.gasAnalysisWindowSeconds} s`}
          />
          <MetricCard
            accent="green"
            detail="Qualité de calibration"
            label="Confiance"
            value={`${configuration.confidencePercent}%`}
          />
          <MetricCard
            accent="purple"
            detail="Configuration suggérée"
            label="Profil"
            value={configuration.recommendedProfile}
          />
        </View>

        <NeonButton
          label="Appliquer à l’appareil"
          onPress={applyToDevice}
          style={styles.primaryButton}
        />

        <View style={styles.secondaryActions}>
          <NeonButton
            label="Sauvegarder profil"
            onPress={saveAsProfile}
            style={styles.secondaryButton}
            variant="secondary"
          />
          <NeonButton
            label="Exporter JSON"
            onPress={exportJson}
            style={styles.secondaryButton}
            variant="secondary"
          />
          <NeonButton
            label="Recommencer"
            onPress={() => navigation.navigate('CalibrationWizardScreen')}
            style={styles.restartButton}
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
  title: {
    color: colors.textPrimary,
    fontSize: 28,
    fontWeight: '700',
    marginTop: 4,
  },
  profileCard: {
    marginBottom: 16,
  },
  profileLabel: {
    color: colors.neonGreen,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  profileName: {
    color: colors.textPrimary,
    fontSize: 25,
    fontWeight: '800',
    marginTop: 8,
  },
  profileDescription: {
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 7,
  },
  confidenceTrack: {
    backgroundColor: colors.border,
    borderRadius: 4,
    height: 6,
    marginTop: 16,
    overflow: 'hidden',
  },
  confidenceFill: {
    backgroundColor: colors.neonGreen,
    borderRadius: 4,
    height: '100%',
  },
  metricGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  primaryButton: {
    marginBottom: 12,
    minHeight: 56,
  },
  secondaryActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  secondaryButton: {
    flex: 1,
    minWidth: '46%',
  },
  restartButton: {
    width: '100%',
  },
});

export default CalibrationResultsScreen;
