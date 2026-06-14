import React from 'react';
import { ActivityIndicator, Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '../../../theme/colors';
import type { BleStatus, ConnectedFartTag, DetectionSource } from '../types';

const bluetoothIcon = require('../../../assets/detection/bluetooth.png');
const microphoneIcon = require('../../../assets/detection/mic.png');

type DetectionModeSwitchProps = {
  bleStatus: BleStatus;
  device: ConnectedFartTag | null;
  isPhoneMicRecording: boolean;
  mode: DetectionSource;
  onConnect: () => void;
  onModeChange: (mode: DetectionSource) => void;
  onToggleMicrophone: () => void;
};

export const DetectionModeSwitch = ({
  bleStatus,
  isPhoneMicRecording,
  mode,
  onConnect,
  onModeChange,
  onToggleMicrophone,
}: DetectionModeSwitchProps) => {
  const isBle = mode === 'ble';

  const selectBle = () => {
    if (isBle && bleStatus === 'disconnected') {
      onConnect();
      return;
    }
    onModeChange('ble');
  };

  const selectMicrophone = () => {
    if (!isBle) {
      onToggleMicrophone();
      return;
    }
    onModeChange('phone-mic');
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.trackGlow} />
      <View style={styles.track}>
        <View style={styles.purpleRail} />
        <Pressable accessibilityRole="button" onPress={selectBle} style={[styles.option, styles.leftOption]}>
          <View style={[styles.iconFrame, !isBle && styles.inactiveIcon]}>
            <Image source={bluetoothIcon} style={styles.icon} />
          </View>
          <Text style={[styles.label, isBle && styles.activeLabel]}>FARTTAG BLE</Text>
        </Pressable>

        <Pressable
          accessibilityLabel="Changer de mode de détection"
          accessibilityRole="switch"
          accessibilityState={{ checked: !isBle }}
          onPress={() => onModeChange(isBle ? 'phone-mic' : 'ble')}
          style={[styles.toggle, !isBle && styles.toggleMicro]}
        >
          {bleStatus === 'connecting' && isBle ? (
            <ActivityIndicator color={colors.neonGreen} size="small" />
          ) : (
            <View
              style={[
                styles.knob,
                isBle ? styles.knobBle : styles.knobMicro,
                !isBle && styles.knobRight,
                isPhoneMicRecording && styles.knobRecording,
              ]}
            />
          )}
        </Pressable>

        <Pressable accessibilityRole="button" onPress={selectMicrophone} style={[styles.option, styles.rightOption]}>
          <View style={[styles.iconFrame, isBle && styles.inactiveIcon]}>
            <Image source={microphoneIcon} style={styles.icon} />
          </View>
          <Text style={[styles.label, !isBle && styles.activeLabel]}>MICRO BÊTA</Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 16,
  },
  trackGlow: {
    backgroundColor: '#9CFF0010',
    borderRadius: 24,
    bottom: 17,
    left: 4,
    position: 'absolute',
    right: 4,
    top: 0,
  },
  track: {
    alignItems: 'center',
    backgroundColor: '#030507',
    borderColor: colors.neonGreen,
    borderRadius: 24,
    borderWidth: 1,
    flexDirection: 'row',
    minHeight: 50,
    overflow: 'hidden',
    paddingHorizontal: 8,
    shadowColor: colors.neonGreen,
    shadowOpacity: 0.22,
    shadowRadius: 8,
  },
  purpleRail: {
    borderBottomColor: colors.neonPurple,
    borderBottomRightRadius: 24,
    borderBottomWidth: 1,
    borderRightColor: colors.neonPurple,
    borderRightWidth: 1,
    borderTopColor: colors.neonPurple,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    bottom: -1,
    position: 'absolute',
    right: -1,
    top: -1,
    width: '50%',
  },
  option: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 7,
    justifyContent: 'center',
    minHeight: 48,
    position: 'absolute',
    top: 0,
    width: '50%',
  },
  leftOption: {
    left: 0,
    paddingRight: 30,
  },
  rightOption: {
    paddingLeft: 30,
    right: 0,
  },
  iconFrame: {
    borderRadius: 12,
    height: 24,
    overflow: 'hidden',
    width: 24,
  },
  icon: {
    height: 43,
    left: -10,
    position: 'absolute',
    resizeMode: 'cover',
    top: -10,
    width: 43,
  },
  inactiveIcon: {
    opacity: 0.55,
  },
  label: {
    color: colors.textSecondary,
    fontSize: 9,
    fontWeight: '900',
  },
  activeLabel: {
    color: colors.textPrimary,
  },
  bleText: {
    color: colors.neonGreen,
  },
  microText: {
    color: colors.neonPurple,
  },
  toggle: {
    alignSelf: 'center',
    backgroundColor: '#07110B',
    borderColor: '#24652F',
    borderRadius: 18,
    borderWidth: 1,
    height: 34,
    justifyContent: 'center',
    left: '50%',
    marginLeft: -29,
    paddingHorizontal: 3,
    position: 'absolute',
    top: 7,
    width: 58,
    zIndex: 3,
  },
  toggleMicro: {
    backgroundColor: '#110716',
    borderColor: '#7C3290',
  },
  knob: {
    borderRadius: 14,
    height: 26,
    width: 26,
  },
  knobBle: {
    backgroundColor: colors.neonGreen,
    elevation: 7,
    shadowColor: colors.neonGreen,
    shadowOpacity: 0.9,
    shadowRadius: 9,
  },
  knobMicro: {
    backgroundColor: colors.neonPurple,
    elevation: 7,
    shadowColor: colors.neonPurple,
    shadowOpacity: 0.9,
    shadowRadius: 9,
  },
  knobRight: {
    alignSelf: 'flex-end',
  },
  knobRecording: {
    backgroundColor: '#FF4DCE',
  },
});
