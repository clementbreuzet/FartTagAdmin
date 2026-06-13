import React, { useCallback, useEffect, useMemo, useState } from 'react';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  ActivityIndicator,
  FlatList,
  ListRenderItem,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DeviceListItem } from '../../components/devices/DeviceListItem';
import { NeonButton } from '../../components/common/NeonButton';
import { NeonCard } from '../../components/common/NeonCard';
import { StatusPill } from '../../components/common/StatusPill';
import { useI18n } from '../../i18n/I18nProvider';
import type {
  DevicesStackParamList,
  RootTabParamList,
} from '../../navigation/types';
import { PhoneMicService } from '../../services/audio/PhoneMicService';
import { BleService } from '../../services/ble/BleService';
import { useDeviceStore } from '../../store/deviceStore';
import { colors } from '../../theme/colors';

const MOCK_BATTERY_LEVEL = 80;
const MOCK_FIRMWARE_VERSION = 'Inconnue';
const WEAK_SIGNAL_RSSI = -80;

type DeviceStatus = 'available' | 'connected' | 'weak-signal';

type ScannerDevice = {
  id: string;
  name: string | null;
  source: 'ble' | 'phoneMic';
  rssi: number | null;
  batteryLevel?: number | null;
  firmwareVersion?: string | null;
};

type DeviceListViewModel = Omit<ScannerDevice, 'name'> & {
  name: string;
  batteryLevel: number;
  firmwareVersion: string;
  status: DeviceStatus;
};

const getDeviceStatus = (
  device: ScannerDevice,
  connectedDeviceId: string | null,
): DeviceStatus => {
  if (device.id === connectedDeviceId) {
    return 'connected';
  }

  if (device.rssi !== null && device.rssi <= WEAK_SIGNAL_RSSI) {
    return 'weak-signal';
  }

  return 'available';
};

type DeviceScannerScreenProps = NativeStackScreenProps<
  DevicesStackParamList,
  'DeviceScannerScreen'
>;

export const DeviceScannerScreen = ({
  navigation,
}: DeviceScannerScreenProps) => {
  const { t } = useI18n();
  const devices = useDeviceStore((state) => state.devices);
  const connectedDeviceId = useDeviceStore((state) => state.connectedDeviceId);
  const isScanning = useDeviceStore((state) => state.isScanning);
  const scanError = useDeviceStore((state) => state.scanError);
  const upsertDevice = useDeviceStore((state) => state.upsertDevice);
  const setConnectedDevice = useDeviceStore(
    (state) => state.setConnectedDevice,
  );
  const setIsScanning = useDeviceStore((state) => state.setIsScanning);
  const setScanError = useDeviceStore((state) => state.setScanError);
  const clearDevices = useDeviceStore((state) => state.clearDevices);

  const [connectingDeviceId, setConnectingDeviceId] = useState<string | null>(
    null,
  );
  const [isStartingPhoneMic, setIsStartingPhoneMic] = useState(false);

  const stopScan = useCallback(() => {
    BleService.stopScan();
    setIsScanning(false);
  }, [setIsScanning]);

  const startScan = useCallback(async () => {
    setScanError(null);
    clearDevices();
    setIsScanning(true);

    try {
      await BleService.startScan({
        onDeviceFound: upsertDevice,
        onError: (error) => {
          setScanError(error.message);
          stopScan();
        },
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Impossible de lancer le scan Bluetooth.';

      setScanError(message);
      stopScan();
    }
  }, [clearDevices, setIsScanning, setScanError, stopScan, upsertDevice]);

  const connectToDevice = useCallback(
    async (deviceId: string) => {
      stopScan();
      setScanError(null);
      setConnectingDeviceId(deviceId);

      try {
        const connectedDevice = await BleService.connectToDevice(deviceId);
        setConnectedDevice(connectedDevice);
        navigation.navigate('DeviceInfoScreen');
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Impossible de se connecter à l'appareil.";

        setScanError(message);
      } finally {
        setConnectingDeviceId(null);
      }
    },
    [navigation, setConnectedDevice, setScanError, stopScan],
  );

  const usePhoneMic = useCallback(async () => {
    setIsStartingPhoneMic(true);
    setScanError(null);

    try {
      const granted = await PhoneMicService.requestPermission();
      if (!granted) {
        throw new Error(
          'La permission microphone est requise pour utiliser le mode téléphone.',
        );
      }

      setConnectedDevice({
        id: 'phone-mic-simulator',
        name: 'PhoneMic Simulator',
        source: 'phoneMic',
        rssi: null,
        batteryLevel: 100,
        firmwareVersion: 'PhoneMic Dev Mode',
      });
      navigation
        .getParent<BottomTabNavigationProp<RootTabParamList>>()
        ?.navigate('DashboardTab', { screen: 'LiveDashboardScreen' });
    } catch (error) {
      setScanError(
        error instanceof Error
          ? error.message
          : "Impossible d'activer le microphone du téléphone.",
      );
    } finally {
      setIsStartingPhoneMic(false);
    }
  }, [navigation, setConnectedDevice, setScanError]);

  useEffect(() => stopScan, [stopScan]);

  const deviceViewModels = useMemo<DeviceListViewModel[]>(
    () =>
      devices.map((device: ScannerDevice) => ({
        ...device,
        name: device.name?.trim() || 'FartTag sans nom',
        batteryLevel: device.batteryLevel ?? MOCK_BATTERY_LEVEL,
        firmwareVersion:
          device.firmwareVersion?.trim() || MOCK_FIRMWARE_VERSION,
        status: getDeviceStatus(device, connectedDeviceId),
      })),
    [connectedDeviceId, devices],
  );

  const renderDevice: ListRenderItem<DeviceListViewModel> = useCallback(
    ({ item }) => (
      <DeviceListItem
        device={item}
        isConnecting={connectingDeviceId === item.id}
        onConnect={() => connectToDevice(item.id)}
      />
    ),
    [connectToDevice, connectingDeviceId],
  );

  const renderEmptyState = useCallback(
    () => (
      <NeonCard style={styles.emptyCard} accent="cyan">
        {isScanning ? (
          <>
            <ActivityIndicator color={colors.neonCyan} size="large" />
            <Text style={styles.emptyTitle}>Recherche en cours</Text>
            <Text style={styles.emptyDescription}>
              Détection des appareils FartTag à proximité...
            </Text>
          </>
        ) : (
          <>
            <Text style={styles.emptyIcon}>⌁</Text>
            <Text style={styles.emptyTitle}>Aucun appareil détecté</Text>
            <Text style={styles.emptyDescription}>
              Vérifiez que le Bluetooth et votre FartTag sont activés, puis
              relancez le scan.
            </Text>
          </>
        )}
      </NeonCard>
    ),
    [isScanning],
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>{t('app.admin')}</Text>
            <Text style={styles.title}>{t('screen.scanner')}</Text>
          </View>

          <StatusPill
            label={isScanning ? 'Scan actif' : 'Prêt'}
            status={isScanning ? 'active' : 'idle'}
          />
        </View>

        <NeonCard style={styles.scannerCard} accent="green">
          <View style={styles.scannerStatus}>
            <View style={styles.radar}>
              <View style={styles.radarMiddle}>
                <View style={styles.radarCore} />
              </View>
            </View>

            <View style={styles.scannerCopy}>
              <Text style={styles.scannerTitle}>
                {isScanning ? 'Recherche en cours' : 'Connecter un FartTag'}
              </Text>
              <Text style={styles.scannerDescription}>
                Scanner les appareils Bluetooth à proximité
              </Text>
            </View>
          </View>

          <NeonButton
            label={isScanning ? 'Arrêter le scan' : 'Scanner BLE'}
            onPress={isScanning ? stopScan : startScan}
            variant={isScanning ? 'secondary' : 'primary'}
          />
        </NeonCard>

        <NeonCard style={styles.scannerCard} accent="purple">
          <View style={styles.scannerStatus}>
            <View style={[styles.radar, styles.phoneRadar]}>
              <Text style={styles.phoneGlyph}>MIC</Text>
            </View>
            <View style={styles.scannerCopy}>
              <Text style={styles.scannerTitle}>Mode micro téléphone</Text>
              <Text style={styles.scannerDescription}>
                Utiliser le micro du téléphone pour tester les premiers
                enregistrements sans boîtier
              </Text>
            </View>
          </View>
          <NeonButton
            label="Utiliser le micro"
            loading={isStartingPhoneMic}
            onPress={usePhoneMic}
            variant="secondary"
          />
        </NeonCard>

        {scanError ? (
          <NeonCard style={styles.errorCard} accent="purple">
            <StatusPill label="Erreur BLE" status="error" />
            <Text style={styles.errorText}>{scanError}</Text>
          </NeonCard>
        ) : null}

        <View style={styles.listHeader}>
          <Text style={styles.sectionTitle}>Appareils proches</Text>
          {isScanning ? (
            <ActivityIndicator color={colors.neonGreen} size="small" />
          ) : null}
        </View>

        <FlatList
          contentContainerStyle={[
            styles.listContent,
            deviceViewModels.length === 0 && styles.emptyListContent,
          ]}
          data={deviceViewModels}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={renderEmptyState}
          renderItem={renderDevice}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
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
  scannerCard: {
    marginBottom: 16,
  },
  scannerStatus: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 16,
  },
  radar: {
    alignItems: 'center',
    borderColor: colors.neonGreen,
    borderRadius: 36,
    borderWidth: 1,
    height: 72,
    justifyContent: 'center',
    marginRight: 16,
    shadowColor: colors.neonGreen,
    shadowOpacity: 0.65,
    shadowRadius: 12,
    width: 72,
  },
  radarMiddle: {
    alignItems: 'center',
    borderColor: colors.neonCyan,
    borderRadius: 24,
    borderWidth: 1,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  radarCore: {
    backgroundColor: colors.neonGreen,
    borderRadius: 5,
    height: 10,
    width: 10,
  },
  phoneRadar: {
    borderColor: colors.neonPurple,
  },
  phoneGlyph: {
    color: colors.neonPurple,
    fontSize: 12,
    fontWeight: '900',
  },
  scannerCopy: {
    flex: 1,
  },
  scannerTitle: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '700',
  },
  scannerDescription: {
    color: colors.textSecondary,
    fontSize: 14,
    marginTop: 6,
  },
  errorCard: {
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  errorText: {
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: 10,
  },
  listHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  sectionTitle: {
    color: colors.neonCyan,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  listContent: {
    gap: 12,
    paddingBottom: 24,
  },
  emptyListContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  emptyCard: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyIcon: {
    color: colors.neonCyan,
    fontSize: 56,
    lineHeight: 60,
  },
  emptyTitle: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '700',
    marginTop: 14,
    textAlign: 'center',
  },
  emptyDescription: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8,
    maxWidth: 300,
    textAlign: 'center',
  },
});

export default DeviceScannerScreen;
