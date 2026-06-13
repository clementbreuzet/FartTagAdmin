import React, { useCallback, useMemo, useState } from 'react';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
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
import { LiveChart } from '../../components/telemetry/LiveChart';
import { MetricCard } from '../../components/telemetry/MetricCard';
import type { TelemetryPoint } from '../../models/telemetry';
import type {
  DashboardStackParamList,
  RootTabParamList,
} from '../../navigation/types';
import { useTelemetryStore } from '../../store/telemetryStore';
import { colors } from '../../theme/colors';

const DEFAULT_MOCK_BASELINE_KOHMS = 145;
const DEFAULT_MOCK_HUMIDITY_PERCENT = 48;
const FILTER_WINDOW_SIZE = 5;

type GasAnalysisScreenProps = NativeStackScreenProps<
  DashboardStackParamList,
  'GasAnalysisScreen'
>;

const average = (values: number[]) =>
  values.length > 0
    ? values.reduce((total, value) => total + value, 0) / values.length
    : null;

const formatValue = (value: number | null | undefined, digits = 1) =>
  value === null || value === undefined ? '--' : value.toFixed(digits);

export const GasAnalysisScreen = ({
  navigation,
}: GasAnalysisScreenProps) => {
  const { t } = useI18n();
  const latestFrame = useTelemetryStore((state) => state.latestFrame);
  const recentFrames = useTelemetryStore((state) => state.recentFrames);
  const gasHistory = useTelemetryStore((state) => state.gasHistory);
  const [mockBaseline, setMockBaseline] = useState(DEFAULT_MOCK_BASELINE_KOHMS);

  const filteredGas = useMemo(
    () =>
      average(
        recentFrames
          .slice(-FILTER_WINDOW_SIZE)
          .map((frame) => frame.gasLevel),
      ),
    [recentFrames],
  );

  const temperatureHistory = useMemo<TelemetryPoint[]>(
    () =>
      recentFrames.map((frame) => ({
        timestampMs: frame.timestampMs,
        value: frame.temperature,
      })),
    [recentFrames],
  );

  const mockHumidityHistory = useMemo<TelemetryPoint[]>(
    () =>
      recentFrames.map((frame, index) => ({
        timestampMs: frame.timestampMs,
        value: Math.max(
          35,
          Math.min(
            68,
            DEFAULT_MOCK_HUMIDITY_PERCENT +
              Math.sin(index / 3) * 4 -
              (frame.temperature - 22) * 0.35,
          ),
        ),
      })),
    [recentFrames],
  );

  const mockHumidity =
    mockHumidityHistory.at(-1)?.value ?? DEFAULT_MOCK_HUMIDITY_PERCENT;

  const recalculateBaseline = useCallback(() => {
    const measuredAverage = average(
      recentFrames.map((frame) => frame.gasLevel),
    );
    const nextBaseline =
      measuredAverage === null
        ? DEFAULT_MOCK_BASELINE_KOHMS
        : Math.round(measuredAverage * 1.04);

    setMockBaseline(nextBaseline);
    Alert.alert(
      'Baseline recalculée',
      `Nouvelle baseline gaz mockée : ${nextBaseline} kΩ.`,
    );
  }, [recentFrames]);

  const exportData = useCallback(() => {
    Alert.alert(
      'Export prêt',
      `${recentFrames.length} trames BME688 sont prêtes à être exportées.`,
    );
  }, [recentFrames.length]);

  const openAdvancedSettings = useCallback(() => {
    navigation
      .getParent<BottomTabNavigationProp<RootTabParamList>>()
      ?.navigate('CalibrationTab', { screen: 'AdvancedSettingsScreen' });
  }, [navigation]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.headerCopy}>
            <Text style={styles.eyebrow}>{t('app.admin')}</Text>
            <Text style={styles.title}>{t('screen.gasAnalysis')}</Text>
          </View>
          <StatusPill
            label={latestFrame ? 'Analyse live' : 'En attente'}
            status={latestFrame ? 'active' : 'idle'}
          />
        </View>

        <NeonCard accent="cyan" style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <View style={styles.summaryCopy}>
              <Text style={styles.summaryTitle}>Qualité du signal gaz</Text>
              <Text style={styles.summaryDescription}>
                Résistance brute, baseline et moyenne filtrée du capteur
                BME688.
              </Text>
            </View>
            <Text style={styles.score}>
              {latestFrame?.score ?? '--'}
              <Text style={styles.scoreUnit}>%</Text>
            </Text>
          </View>
          <View style={styles.baselineTrack}>
            <View
              style={[
                styles.baselineFill,
                { width: `${Math.min(latestFrame?.score ?? 0, 100)}%` },
              ]}
            />
          </View>
        </NeonCard>

        <View style={styles.metricGrid}>
          <MetricCard
            accent="cyan"
            detail="Résistance BME688 actuelle"
            label="Gaz actuel"
            value={`${formatValue(latestFrame?.gasLevel)} kΩ`}
          />
          <MetricCard
            accent="purple"
            detail="Valeur mockée recalculable"
            label="Baseline gaz"
            value={`${mockBaseline} kΩ`}
          />
          <MetricCard
            accent="green"
            detail={`Moyenne mockée sur ${FILTER_WINDOW_SIZE} trames`}
            label="Gaz filtré"
            value={`${formatValue(filteredGas)} kΩ`}
          />
          <MetricCard
            accent="green"
            detail="Mesure BME688"
            label="Température"
            value={`${formatValue(latestFrame?.temperature)} °C`}
          />
          <MetricCard
            accent="purple"
            detail="Valeur mockée"
            label="Humidité"
            value={`${formatValue(mockHumidity)}%`}
          />
          <MetricCard
            accent="cyan"
            detail="Confiance de détection"
            label="Score gaz"
            value={`${latestFrame?.score ?? '--'}%`}
          />
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Tendances BME688</Text>
          <Text style={styles.sampleCount}>{recentFrames.length} trames</Text>
        </View>

        <LiveChart
          accent="cyan"
          data={gasHistory}
          title="Courbe gaz live"
          unit="kΩ"
        />
        <LiveChart
          accent="green"
          data={temperatureHistory}
          title="Température mockée"
          unit="°C"
        />
        <LiveChart
          accent="purple"
          data={mockHumidityHistory}
          title="Humidité mockée"
          unit="%"
        />

        <NeonCard accent="green" style={styles.actionCard}>
          <Text style={styles.actionTitle}>Outils d'analyse</Text>
          <Text style={styles.actionDescription}>
            Ajustez la référence du capteur ou préparez les mesures pour une
            analyse externe.
          </Text>
          <View style={styles.actions}>
            <NeonButton
              label="Recalculer baseline"
              onPress={recalculateBaseline}
              style={styles.actionButton}
            />
            <NeonButton
              disabled={recentFrames.length === 0}
              label="Exporter données"
              onPress={exportData}
              style={styles.actionButton}
              variant="secondary"
            />
            <NeonButton
              label="Réglages avancés"
              onPress={openAdvancedSettings}
              style={styles.settingsButton}
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
  summaryCard: {
    marginBottom: 16,
  },
  summaryHeader: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  summaryCopy: {
    flex: 1,
    marginRight: 16,
  },
  summaryTitle: {
    color: colors.neonCyan,
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  summaryDescription: {
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 7,
  },
  score: {
    color: colors.textPrimary,
    fontSize: 34,
    fontWeight: '800',
  },
  scoreUnit: {
    color: colors.neonCyan,
    fontSize: 16,
  },
  baselineTrack: {
    backgroundColor: colors.border,
    borderRadius: 3,
    height: 5,
    marginTop: 16,
    overflow: 'hidden',
  },
  baselineFill: {
    backgroundColor: colors.neonCyan,
    borderRadius: 3,
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
    color: colors.neonGreen,
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  sampleCount: {
    color: colors.textMuted,
    fontSize: 11,
  },
  actionCard: {
    marginTop: 4,
  },
  actionTitle: {
    color: colors.neonGreen,
    fontSize: 14,
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
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    minWidth: '46%',
  },
  settingsButton: {
    width: '100%',
  },
});

export default GasAnalysisScreen;
