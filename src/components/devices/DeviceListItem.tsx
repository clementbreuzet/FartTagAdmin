import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { DeviceStatus, FartTagDevice } from '../../models/device';
import { colors } from '../../theme/colors';
import { NeonButton } from '../common/NeonButton';
import { NeonCard } from '../common/NeonCard';
import { StatusPill } from '../common/StatusPill';

type DeviceListItemProps = {
  device: FartTagDevice & {
    name: string;
    batteryLevel: number;
    firmwareVersion: string;
    status: DeviceStatus;
  };
  isConnecting: boolean;
  onConnect: () => void;
};

const statusLabels: Record<DeviceStatus, string> = {
  available: 'Disponible',
  connected: 'Connecté',
  'weak-signal': 'Signal faible',
};

export const DeviceListItem = ({
  device,
  isConnecting,
  onConnect,
}: DeviceListItemProps) => {
  const status =
    device.status === 'connected'
      ? 'active'
      : device.status === 'weak-signal'
        ? 'warning'
        : 'idle';

  return (
    <NeonCard accent={device.status === 'connected' ? 'green' : 'cyan'}>
      <View style={styles.header}>
        <View style={styles.identity}>
          <View style={styles.deviceGlyph}>
            <View style={styles.deviceLight} />
            <Text style={styles.deviceLabel}>FT</Text>
          </View>
          <View style={styles.nameBlock}>
            <Text numberOfLines={1} style={styles.name}>
              {device.name}
            </Text>
            <Text numberOfLines={1} style={styles.id}>
              {device.id}
            </Text>
          </View>
        </View>
        <StatusPill label={statusLabels[device.status]} status={status} />
      </View>

      <View style={styles.metrics}>
        <Metric label="Signal" value={`${device.rssi ?? '--'} dBm`} />
        <Metric label="Batterie" value={`${device.batteryLevel}%`} />
        <Metric label="Firmware" value={device.firmwareVersion} />
      </View>

      <NeonButton
        disabled={device.status === 'connected'}
        label={device.status === 'connected' ? 'Connecté' : 'Connecter'}
        loading={isConnecting}
        onPress={onConnect}
      />
    </NeonCard>
  );
};

const Metric = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.metric}>
    <Text style={styles.metricLabel}>{label}</Text>
    <Text style={styles.metricValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  identity: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    marginRight: 8,
  },
  deviceGlyph: {
    alignItems: 'center',
    borderColor: colors.neonCyan,
    borderRadius: 10,
    borderWidth: 1,
    height: 52,
    justifyContent: 'center',
    marginRight: 12,
    width: 34,
  },
  deviceLight: {
    backgroundColor: colors.neonGreen,
    borderRadius: 3,
    height: 6,
    position: 'absolute',
    top: 7,
    width: 6,
  },
  deviceLabel: {
    color: colors.textMuted,
    fontSize: 9,
    fontWeight: '700',
  },
  nameBlock: {
    flex: 1,
  },
  name: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '700',
  },
  id: {
    color: colors.textMuted,
    fontSize: 10,
    marginTop: 4,
  },
  metrics: {
    flexDirection: 'row',
    gap: 8,
    marginVertical: 16,
  },
  metric: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: 10,
    flex: 1,
    padding: 10,
  },
  metricLabel: {
    color: colors.textMuted,
    fontSize: 9,
    textTransform: 'uppercase',
  },
  metricValue: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '700',
    marginTop: 5,
  },
});
