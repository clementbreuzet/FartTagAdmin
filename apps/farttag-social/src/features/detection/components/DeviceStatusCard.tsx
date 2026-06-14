import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '../../../theme/colors';
import type { ConnectedFartTag, DetectionSource } from '../types';

type DeviceStatusCardProps = {
  device: ConnectedFartTag | null;
  mode: DetectionSource;
  onPress: () => void;
};

export const DeviceStatusCard = ({ device, mode, onPress }: DeviceStatusCardProps) => {
  const isMicro = mode === 'phone-mic';
  return (
    <Pressable onPress={onPress} style={[styles.card, isMicro && styles.microCard]}>
      <View style={[styles.icon, isMicro && styles.microIcon]}>
        <Text style={[styles.iconText, isMicro && styles.microText]}>{isMicro ? 'MIC' : 'BLE'}</Text>
      </View>
      <View style={styles.copy}>
        <Text style={[styles.title, isMicro && styles.microText]}>
          {isMicro ? 'MODE MICRO BÊTA' : device ? 'FARTTAG CONNECTÉ' : 'FARTTAG NON CONNECTÉ'}
        </Text>
        <Text style={styles.description}>
          {isMicro
            ? 'Enregistrement via micro téléphone · Sans capteur gaz'
            : device
              ? `${device.batteryLevel}% batterie · Signal excellent`
              : 'Appuie pour connecter un FartTag'}
        </Text>
      </View>
      <Text style={[styles.arrow, isMicro && styles.microText]}>›</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: { alignItems: 'center', backgroundColor: '#071409', borderColor: '#9CFF0060', borderRadius: 19, borderWidth: 1, flexDirection: 'row', marginTop: 14, padding: 12 },
  microCard: { backgroundColor: '#100817', borderColor: '#E85CFF60' },
  icon: { alignItems: 'center', borderColor: colors.neonGreen, borderRadius: 14, borderWidth: 1, height: 42, justifyContent: 'center', width: 42 },
  microIcon: { borderColor: colors.neonPurple },
  iconText: { color: colors.neonGreen, fontSize: 8, fontWeight: '900' },
  microText: { color: colors.neonPurple },
  copy: { flex: 1, marginLeft: 11 },
  title: { color: colors.neonGreen, fontSize: 10, fontWeight: '900', letterSpacing: 0.5 },
  description: { color: colors.textSecondary, fontSize: 8, marginTop: 5 },
  arrow: { color: colors.neonGreen, fontSize: 28, fontWeight: '300' },
});
