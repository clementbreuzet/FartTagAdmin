import React, { useCallback, useState } from 'react';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  Alert,
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
import { LiveChart } from '../../components/telemetry/LiveChart';
import { MetricCard } from '../../components/telemetry/MetricCard';
import { useI18n } from '../../i18n/I18nProvider';
import { supportedLanguages } from '../../i18n/translations';
import type { TelemetryPoint } from '../../models/telemetry';
import type { SettingsStackParamList } from '../../navigation/types';
import { colors } from '../../theme/colors';

const MODEL_VERSION = 'FT-Detect 3.4.1';
const MODEL_UPDATED_AT = '28 mai 2026';
const DATASET_SIZE = 18_642;
const PRECISION_PERCENT = 96.8;
const RECALL_PERCENT = 94.3;
const F1_SCORE_PERCENT = 95.5;
const FALSE_POSITIVES = 37;
const FALSE_NEGATIVES = 21;

const chartPoint = (index: number, value: number): TelemetryPoint => ({
  timestampMs: Date.UTC(2025, index, 1),
  value,
});

const precisionHistory = [
  88.2, 89.6, 91.1, 92.4, 92.8, 93.7, 94.2, 94.8, 95.1, 95.9, 96.3, 96.8,
].map(chartPoint);

const falsePositiveHistory = [91, 84, 79, 72, 68, 61, 57, 51, 48, 44, 40, 37].map(
  chartPoint,
);

type DetectionModelScreenProps = NativeStackScreenProps<
  SettingsStackParamList,
  'DetectionModelScreen'
>;

export const DetectionModelScreen = ({ navigation }: DetectionModelScreenProps) => {
  const { language, locale, setLanguage, t } = useI18n();
  const [isChecking, setIsChecking] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const checkForUpdates = useCallback(() => {
    setIsChecking(true);
    setTimeout(() => {
      setIsChecking(false);
      Alert.alert(
        'Modèle à jour',
        `${MODEL_VERSION} est la dernière version disponible.`,
      );
    }, 700);
  }, []);

  const downloadModel = useCallback(() => {
    setIsDownloading(true);
    setTimeout(() => {
      setIsDownloading(false);
      Alert.alert(
        'Téléchargement simulé',
        'Le service de distribution des modèles sera connecté ultérieurement.',
      );
    }, 900);
  }, []);

  const exportDataset = useCallback(() => {
    Alert.alert(
      'Export dataset prêt',
      JSON.stringify(
        {
          exportedAt: new Date().toISOString(),
          modelVersion: MODEL_VERSION,
          datasetSize: DATASET_SIZE,
          metrics: {
            precision: PRECISION_PERCENT,
            recall: RECALL_PERCENT,
            f1Score: F1_SCORE_PERCENT,
            falsePositives: FALSE_POSITIVES,
            falseNegatives: FALSE_NEGATIVES,
          },
        },
        null,
        2,
      ),
    );
  }, []);

  const showMisclassifiedEvents = useCallback(() => {
    Alert.alert(
      'Événements mal classifiés',
      `${FALSE_POSITIVES + FALSE_NEGATIVES} événements nécessitent une révision.`,
    );
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.headerCopy}>
            <Text style={styles.eyebrow}>{t('app.admin')}</Text>
            <Text style={styles.title}>{t('nav.settings')}</Text>
          </View>
          <StatusPill label="Production" status="active" />
        </View>

        <Pressable
          onPress={() => navigation.navigate('FirmwareScreen')}
          style={styles.screenLink}
        >
          <Text style={styles.screenLinkText}>Firmware</Text>
        </Pressable>

        <NeonCard accent="purple" style={styles.languageCard}>
          <Text style={styles.languageTitle}>{t('language.title')}</Text>
          <Text style={styles.languageDescription}>{t('language.description')}</Text>
          <View style={styles.languageGrid}>
            {supportedLanguages.map((item) => {
              const active = item.code === language;
              return (
                <Pressable
                  key={item.code}
                  onPress={() => setLanguage(item.code)}
                  style={[styles.languageButton, active && styles.languageButtonActive]}
                >
                  <Text style={[styles.languageButtonText, active && styles.languageButtonTextActive]}>
                    {item.nativeName}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </NeonCard>

        <NeonCard accent="green" style={styles.modelCard}>
          <View style={styles.modelHeader}>
            <View style={styles.modelCopy}>
              <Text style={styles.modelLabel}>Modèle actif</Text>
              <Text style={styles.modelVersion}>{MODEL_VERSION}</Text>
              <Text style={styles.modelDetail}>
                Mis à jour le {MODEL_UPDATED_AT}
              </Text>
            </View>
            <View style={styles.healthScore}>
              <Text style={styles.healthValue}>A+</Text>
              <Text style={styles.healthLabel}>Santé</Text>
            </View>
          </View>
        </NeonCard>

        <View style={styles.metricGrid}>
          <MetricCard
            accent="cyan"
            detail="Version actuellement déployée"
            label="Version modèle"
            value="3.4.1"
          />
          <MetricCard
            accent="purple"
            detail={MODEL_UPDATED_AT}
            label="Dataset size"
            value={DATASET_SIZE.toLocaleString(locale)}
          />
          <MetricCard
            accent="green"
            detail="Prédictions positives correctes"
            label="Precision"
            value={`${PRECISION_PERCENT}%`}
          />
          <MetricCard
            accent="cyan"
            detail="Événements réels détectés"
            label="Recall"
            value={`${RECALL_PERCENT}%`}
          />
          <MetricCard
            accent="green"
            detail="Équilibre precision / recall"
            label="F1 Score"
            value={`${F1_SCORE_PERCENT}%`}
          />
          <MetricCard
            accent="purple"
            detail="Sur le dataset de validation"
            label="False Positives"
            value={`${FALSE_POSITIVES}`}
          />
          <MetricCard
            accent="purple"
            detail="Sur le dataset de validation"
            label="False Negatives"
            value={`${FALSE_NEGATIVES}`}
          />
          <MetricCard
            accent="cyan"
            detail="Dernière synchronisation"
            label="Mise à jour"
            value="28/05/26"
          />
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Performance historique</Text>
          <StatusPill label="12 versions" status="idle" />
        </View>

        <LiveChart
          accent="green"
          data={precisionHistory}
          title="Évolution de la précision"
          unit="%"
        />
        <LiveChart
          accent="purple"
          data={falsePositiveHistory}
          title="Faux positifs"
          unit="events"
        />

        <NeonCard accent="cyan" style={styles.actionCard}>
          <Text style={styles.actionTitle}>Gestion du modèle</Text>
          <Text style={styles.actionDescription}>
            Vérifiez, distribuez ou analysez le moteur de détection embarqué.
          </Text>
          <View style={styles.actions}>
            <NeonButton
              label="Vérifier les mises à jour"
              loading={isChecking}
              onPress={checkForUpdates}
              style={styles.actionButton}
            />
            <NeonButton
              label="Télécharger nouveau modèle"
              loading={isDownloading}
              onPress={downloadModel}
              style={styles.actionButton}
              variant="secondary"
            />
            <NeonButton
              label="Exporter dataset"
              onPress={exportDataset}
              style={styles.actionButton}
              variant="secondary"
            />
            <NeonButton
              label="Voir les événements mal classifiés"
              onPress={showMisclassifiedEvents}
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
    marginRight: 12,
  },
  screenLink: {
    alignSelf: 'flex-end',
    borderColor: colors.neonCyan,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
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
  languageCard: {
    marginBottom: 16,
  },
  languageTitle: {
    color: colors.neonPurple,
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  languageDescription: {
    color: colors.textSecondary,
    fontSize: 11,
    lineHeight: 17,
    marginBottom: 12,
    marginTop: 6,
  },
  languageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  languageButton: {
    borderColor: colors.border,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 11,
    paddingVertical: 8,
  },
  languageButtonActive: {
    backgroundColor: '#9CFF0018',
    borderColor: colors.neonGreen,
  },
  languageButtonText: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '700',
  },
  languageButtonTextActive: {
    color: colors.neonGreen,
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
  modelCard: {
    marginBottom: 16,
  },
  modelHeader: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  modelCopy: {
    flex: 1,
    marginRight: 12,
  },
  modelLabel: {
    color: colors.neonGreen,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  modelVersion: {
    color: colors.textPrimary,
    fontSize: 23,
    fontWeight: '800',
    marginTop: 7,
  },
  modelDetail: {
    color: colors.textSecondary,
    fontSize: 11,
    marginTop: 5,
  },
  healthScore: {
    alignItems: 'center',
    backgroundColor: colors.surfaceElevated,
    borderColor: colors.neonGreen,
    borderRadius: 14,
    borderWidth: 1,
    minWidth: 68,
    padding: 10,
  },
  healthValue: {
    color: colors.neonGreen,
    fontSize: 24,
    fontWeight: '900',
  },
  healthLabel: {
    color: colors.textMuted,
    fontSize: 8,
    fontWeight: '700',
    marginTop: 2,
    textTransform: 'uppercase',
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
  actionCard: {
    marginTop: 4,
  },
  actionTitle: {
    color: colors.neonCyan,
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  actionDescription: {
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 16,
    marginTop: 7,
  },
  actions: {
    gap: 12,
  },
  actionButton: {
    minHeight: 52,
    width: '100%',
  },
});

export default DetectionModelScreen;
