import React, { useCallback, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SliderSetting } from '../../components/calibration/SliderSetting';
import { NeonButton } from '../../components/common/NeonButton';
import { NeonCard } from '../../components/common/NeonCard';
import { StatusPill } from '../../components/common/StatusPill';
import { useI18n } from '../../i18n/I18nProvider';
import type {
  CalibrationPreset,
  ManualCalibrationConfiguration,
  MicrophoneGain,
} from '../../models/calibration';
import { useCalibrationStore } from '../../store/calibrationStore';
import { colors } from '../../theme/colors';

const PRESETS: Record<CalibrationPreset, ManualCalibrationConfiguration> = {
  Sensitive: {
    audioThreshold: 38,
    gasThreshold: 85,
    cooldownMs: 8_000,
    gasWindowMs: 4_000,
    microphoneGain: 'high',
    ambientNoiseFilterEnabled: false,
    preset: 'Sensitive',
  },
  Normal: {
    audioThreshold: 52,
    gasThreshold: 120,
    cooldownMs: 20_000,
    gasWindowMs: 8_000,
    microphoneGain: 'medium',
    ambientNoiseFilterEnabled: true,
    preset: 'Normal',
  },
  'Anti False Positive': {
    audioThreshold: 68,
    gasThreshold: 165,
    cooldownMs: 45_000,
    gasWindowMs: 15_000,
    microphoneGain: 'low',
    ambientNoiseFilterEnabled: true,
    preset: 'Anti False Positive',
  },
  Competition: {
    audioThreshold: 44,
    gasThreshold: 105,
    cooldownMs: 5_000,
    gasWindowMs: 3_000,
    microphoneGain: 'high',
    ambientNoiseFilterEnabled: true,
    preset: 'Competition',
  },
};

const gains: MicrophoneGain[] = ['low', 'medium', 'high'];
const presets = Object.keys(PRESETS) as CalibrationPreset[];

export const AdvancedSettingsScreen = () => {
  const { t } = useI18n();
  const savedConfiguration = useCalibrationStore(
    (state) => state.savedManualConfiguration,
  );
  const saveConfiguration = useCalibrationStore(
    (state) => state.saveManualConfiguration,
  );
  const applyConfiguration = useCalibrationStore(
    (state) => state.applyManualConfiguration,
  );
  const [configuration, setConfiguration] =
    useState<ManualCalibrationConfiguration>(
      savedConfiguration ?? PRESETS.Normal,
    );

  const update = useCallback(
    <Key extends keyof ManualCalibrationConfiguration>(
      key: Key,
      value: ManualCalibrationConfiguration[Key],
    ) => {
      setConfiguration((current) => ({ ...current, [key]: value }));
    },
    [],
  );

  const selectPreset = useCallback((preset: CalibrationPreset) => {
    setConfiguration(PRESETS[preset]);
  }, []);

  const save = useCallback(() => {
    saveConfiguration(configuration);
    Alert.alert('Configuration enregistrée', 'Les réglages manuels sont sauvegardés.');
  }, [configuration, saveConfiguration]);

  const apply = useCallback(() => {
    applyConfiguration(configuration);
    Alert.alert('Configuration appliquée', 'Les réglages sont actifs pour le FartTag.');
  }, [applyConfiguration, configuration]);

  const exportJson = useCallback(() => {
    Alert.alert(
      'Export JSON prêt',
      JSON.stringify({ exportedAt: new Date().toISOString(), configuration }, null, 2),
    );
  }, [configuration]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>{t('app.admin')}</Text>
            <Text style={styles.title}>{t('screen.advancedSettings')}</Text>
          </View>
          <StatusPill label={configuration.preset} status="idle" />
        </View>

        <NeonCard accent="purple" style={styles.card}>
          <Text style={styles.sectionTitle}>Preset</Text>
          <View style={styles.options}>
            {presets.map((preset) => (
              <OptionButton
                active={configuration.preset === preset}
                key={preset}
                label={preset}
                onPress={() => selectPreset(preset)}
              />
            ))}
          </View>
        </NeonCard>

        <NeonCard accent="cyan" style={styles.card}>
          <Text style={styles.sectionTitle}>Seuils de détection</Text>
          <SliderSetting
            label="Audio threshold"
            maximumValue={100}
            minimumValue={20}
            onValueChange={(value) => update('audioThreshold', value)}
            step={1}
            unit="dB"
            value={configuration.audioThreshold}
          />
          <SliderSetting
            label="Gas threshold"
            maximumValue={300}
            minimumValue={40}
            onValueChange={(value) => update('gasThreshold', value)}
            step={5}
            unit="kΩ"
            value={configuration.gasThreshold}
          />
          <SliderSetting
            label="Cooldown"
            maximumValue={60_000}
            minimumValue={1_000}
            onValueChange={(value) => update('cooldownMs', value)}
            step={1_000}
            unit="ms"
            value={configuration.cooldownMs}
          />
          <SliderSetting
            label="Fenêtre d'analyse gaz"
            maximumValue={30_000}
            minimumValue={1_000}
            onValueChange={(value) => update('gasWindowMs', value)}
            step={1_000}
            unit="ms"
            value={configuration.gasWindowMs}
          />
        </NeonCard>

        <NeonCard accent="green" style={styles.card}>
          <Text style={styles.sectionTitle}>Traitement du signal</Text>
          <Text style={styles.controlLabel}>Gain microphone</Text>
          <View style={styles.options}>
            {gains.map((gain) => (
              <OptionButton
                active={configuration.microphoneGain === gain}
                key={gain}
                label={gain}
                onPress={() => update('microphoneGain', gain)}
              />
            ))}
          </View>
          <View style={styles.switchRow}>
            <View style={styles.switchCopy}>
              <Text style={styles.controlLabel}>Filtre bruit ambiant</Text>
              <Text style={styles.description}>
                Réduit les déclenchements liés au bruit de fond constant.
              </Text>
            </View>
            <Switch
              onValueChange={(value) =>
                update('ambientNoiseFilterEnabled', value)
              }
              thumbColor={
                configuration.ambientNoiseFilterEnabled
                  ? colors.neonGreen
                  : colors.textMuted
              }
              trackColor={{ false: colors.border, true: '#315800' }}
              value={configuration.ambientNoiseFilterEnabled}
            />
          </View>
        </NeonCard>

        <NeonButton
          label="Appliquer à l'appareil"
          onPress={apply}
          style={styles.primaryButton}
        />
        <View style={styles.actions}>
          <NeonButton
            label="Enregistrer config"
            onPress={save}
            style={styles.actionButton}
            variant="secondary"
          />
          <NeonButton
            label="Reset valeurs"
            onPress={() => setConfiguration(PRESETS.Normal)}
            style={styles.actionButton}
            variant="secondary"
          />
          <NeonButton
            label="Exporter JSON"
            onPress={exportJson}
            style={styles.fullButton}
            variant="secondary"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

type OptionButtonProps = {
  active: boolean;
  label: string;
  onPress: () => void;
};

const OptionButton = ({ active, label, onPress }: OptionButtonProps) => (
  <Pressable
    onPress={onPress}
    style={({ pressed }) => [
      styles.option,
      active && styles.activeOption,
      pressed && styles.pressedOption,
    ]}
  >
    <Text style={[styles.optionText, active && styles.activeOptionText]}>
      {label}
    </Text>
  </Pressable>
);

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
  card: { marginBottom: 16 },
  sectionTitle: {
    color: colors.neonCyan,
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 16,
    textTransform: 'uppercase',
  },
  options: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  option: {
    borderColor: colors.border,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 13,
    paddingVertical: 10,
  },
  activeOption: {
    backgroundColor: '#102000',
    borderColor: colors.neonGreen,
  },
  pressedOption: { opacity: 0.7 },
  optionText: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  activeOptionText: { color: colors.neonGreen },
  controlLabel: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 12,
  },
  switchRow: {
    alignItems: 'center',
    borderTopColor: colors.border,
    borderTopWidth: 1,
    flexDirection: 'row',
    marginTop: 20,
    paddingTop: 18,
  },
  switchCopy: { flex: 1, marginRight: 14 },
  description: {
    color: colors.textMuted,
    fontSize: 11,
    lineHeight: 17,
    marginTop: -6,
  },
  primaryButton: { marginBottom: 12, minHeight: 56 },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  actionButton: { flex: 1, minWidth: '46%' },
  fullButton: { width: '100%' },
});

export default AdvancedSettingsScreen;
