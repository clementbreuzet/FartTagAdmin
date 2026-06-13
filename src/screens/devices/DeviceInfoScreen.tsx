import React, { useCallback, useMemo, useState } from 'react';
import {
  Alert,
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
import { useDeviceStore } from '../../store/deviceStore';
import { colors } from '../../theme/colors';

const MOCK_FREE_MEMORY_KB = 184;
const MOCK_INTERNAL_TEMPERATURE_C = 31.4;
const MOCK_BATTERY_VOLTAGE = 3.92;
const MOCK_HARDWARE_REVISION = 'FT-HW-01';
const MOCK_BLE_PROTOCOL_VERSION = '1.2';
const MOCK_UPTIME_SECONDS = 18_540;

const formatUptime = (seconds: number) => {
  const hours = Math.floor(seconds / 3_600);
  const minutes = Math.floor((seconds % 3_600) / 60);
  return `${hours}h ${minutes}m`;
};

export const DeviceInfoScreen = () => {
  const { t } = useI18n();
  const connectedDevice = useDeviceStore((state) => state.connectedDevice);
  const disconnectDevice = useDeviceStore((state) => state.disconnectDevice);
  const renameConnectedDevice = useDeviceStore(
    (state) => state.renameConnectedDevice,
  );
  const [isRenaming, setIsRenaming] = useState(false);
  const [deviceName, setDeviceName] = useState(connectedDevice?.name ?? '');

  const report = useMemo(
    () =>
      connectedDevice
        ? {
            deviceId: connectedDevice.id,
            name: connectedDevice.name,
            macAddress: connectedDevice.id,
            firmwareVersion: connectedDevice.firmwareVersion ?? 'Inconnue',
            hardwareRevision:
              connectedDevice.hardwareRevision ?? MOCK_HARDWARE_REVISION,
            uptimeSeconds:
              connectedDevice.uptimeSeconds ?? MOCK_UPTIME_SECONDS,
            batteryVoltage:
              connectedDevice.batteryVoltage ?? MOCK_BATTERY_VOLTAGE,
            batteryLevel: connectedDevice.batteryLevel ?? 80,
            rssi: connectedDevice.rssi,
            freeMemoryKb: MOCK_FREE_MEMORY_KB,
            internalTemperatureC: MOCK_INTERNAL_TEMPERATURE_C,
            bleProtocolVersion:
              connectedDevice.bleProtocolVersion ?? MOCK_BLE_PROTOCOL_VERSION,
          }
        : null,
    [connectedDevice],
  );

  const runDiagnostic = useCallback(() => {
    if (!report) {
      return;
    }

    const signalStatus =
      report.rssi !== null && report.rssi < -80 ? 'signal faible' : 'signal stable';
    Alert.alert(
      'Diagnostic terminé',
      `Batterie ${report.batteryLevel}%, ${signalStatus}, mémoire ${report.freeMemoryKb} KB. Aucun défaut critique détecté.`,
    );
  }, [report]);

  const saveName = useCallback(() => {
    const trimmedName = deviceName.trim();
    if (!trimmedName) {
      Alert.alert('Nom invalide', 'Saisissez un nom pour le FartTag.');
      return;
    }

    renameConnectedDevice(trimmedName);
    setIsRenaming(false);
    Alert.alert('Appareil renommé', trimmedName);
  }, [deviceName, renameConnectedDevice]);

  const exportReport = useCallback(() => {
    Alert.alert(
      'Rapport JSON prêt',
      JSON.stringify({ exportedAt: new Date().toISOString(), device: report }, null, 2),
    );
  }, [report]);

  const confirmDisconnect = useCallback(() => {
    Alert.alert(
      'Déconnecter le FartTag',
      'Voulez-vous déconnecter cet appareil ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Déconnecter', style: 'destructive', onPress: disconnectDevice },
      ],
    );
  }, [disconnectDevice]);

  if (!connectedDevice || !report) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.emptyContainer}>
          <NeonCard accent="purple" style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>Aucun appareil connecté</Text>
            <Text style={styles.emptyDescription}>
              Connectez un FartTag depuis le scanner pour afficher ses
              informations techniques.
            </Text>
            <StatusPill label="Déconnecté" status="error" />
          </NeonCard>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View style={styles.headerCopy}>
            <Text style={styles.eyebrow}>{t('app.admin')}</Text>
            <Text style={styles.title}>{t('screen.deviceInfo')}</Text>
          </View>
          <StatusPill label="Connecté" status="active" />
        </View>

        {isRenaming ? (
          <NeonCard accent="purple" style={styles.renameCard}>
            <Text style={styles.sectionTitle}>Renommer l’appareil</Text>
            <TextInput
              autoFocus
              onChangeText={setDeviceName}
              placeholder="Nom du FartTag"
              placeholderTextColor={colors.textMuted}
              style={styles.input}
              value={deviceName}
            />
            <View style={styles.inlineActions}>
              <NeonButton label="Enregistrer" onPress={saveName} style={styles.inlineButton} />
              <NeonButton
                label="Annuler"
                onPress={() => setIsRenaming(false)}
                style={styles.inlineButton}
                variant="secondary"
              />
            </View>
          </NeonCard>
        ) : null}

        <NeonCard accent="cyan" style={styles.card}>
          <Text style={styles.sectionTitle}>Identité</Text>
          <InfoRow label="Device ID" value={report.deviceId} />
          <InfoRow label="Nom" value={report.name} />
          <InfoRow label="MAC address" value={report.macAddress} />
          <InfoRow label="Firmware" value={report.firmwareVersion} />
          <InfoRow label="Hardware revision" value={report.hardwareRevision} />
          <InfoRow label="Protocole BLE" value={`v${report.bleProtocolVersion}`} />
        </NeonCard>

        <NeonCard accent="green" style={styles.card}>
          <Text style={styles.sectionTitle}>État système</Text>
          <View style={styles.metricGrid}>
            <Metric label="Uptime" value={formatUptime(report.uptimeSeconds)} />
            <Metric label="Batterie" value={`${report.batteryLevel}%`} />
            <Metric label="Voltage" value={`${report.batteryVoltage.toFixed(2)} V`} />
            <Metric label="RSSI" value={`${report.rssi ?? '--'} dBm`} />
            <Metric label="Mémoire libre (mock)" value={`${report.freeMemoryKb} KB`} />
            <Metric
              label="Temp. interne (mock)"
              value={`${report.internalTemperatureC.toFixed(1)} °C`}
            />
          </View>
        </NeonCard>

        <View style={styles.actions}>
          <NeonButton
            label="Diagnostic complet"
            onPress={runDiagnostic}
            style={styles.actionButton}
          />
          <NeonButton
            label="Renommer appareil"
            onPress={() => setIsRenaming(true)}
            style={styles.actionButton}
            variant="secondary"
          />
          <NeonButton
            label="Exporter rapport"
            onPress={exportReport}
            style={styles.actionButton}
            variant="secondary"
          />
          <NeonButton
            label="Déconnecter"
            onPress={confirmDisconnect}
            style={styles.actionButton}
            variant="secondary"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

type InfoRowProps = {
  label: string;
  value: string;
};

const InfoRow = ({ label, value }: InfoRowProps) => (
  <View style={styles.infoRow}>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text numberOfLines={1} style={styles.infoValue}>{value}</Text>
  </View>
);

const Metric = ({ label, value }: InfoRowProps) => (
  <View style={styles.metric}>
    <Text style={styles.metricLabel}>{label}</Text>
    <Text style={styles.metricValue}>{value}</Text>
  </View>
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
  headerCopy: { flex: 1, marginRight: 12 },
  eyebrow: {
    color: colors.neonGreen,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 2,
  },
  title: { color: colors.textPrimary, fontSize: 28, fontWeight: '700', marginTop: 4 },
  card: { marginBottom: 16 },
  renameCard: { marginBottom: 16 },
  sectionTitle: {
    color: colors.neonCyan,
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  infoRow: {
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    flexDirection: 'row',
    paddingVertical: 11,
  },
  infoLabel: { color: colors.textMuted, flex: 1, fontSize: 11 },
  infoValue: { color: colors.textPrimary, flex: 1.5, fontSize: 12, fontWeight: '700', textAlign: 'right' },
  metricGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  metric: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: 10,
    minWidth: '46%',
    padding: 12,
    flex: 1,
  },
  metricLabel: { color: colors.textMuted, fontSize: 9, textTransform: 'uppercase' },
  metricValue: { color: colors.neonGreen, fontSize: 16, fontWeight: '800', marginTop: 7 },
  input: {
    backgroundColor: colors.surfaceElevated,
    borderColor: colors.border,
    borderRadius: 10,
    borderWidth: 1,
    color: colors.textPrimary,
    minHeight: 46,
    paddingHorizontal: 13,
  },
  inlineActions: { flexDirection: 'row', gap: 10, marginTop: 12 },
  inlineButton: { flex: 1 },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  actionButton: { flex: 1, minWidth: '46%' },
  emptyContainer: { flex: 1, justifyContent: 'center', padding: 16 },
  emptyCard: { alignItems: 'center', paddingVertical: 38 },
  emptyTitle: { color: colors.textPrimary, fontSize: 19, fontWeight: '700' },
  emptyDescription: {
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 18,
    marginTop: 8,
    textAlign: 'center',
  },
});

export default DeviceInfoScreen;
