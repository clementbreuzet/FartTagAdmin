import React from 'react';
import { StyleSheet, View } from 'react-native';

import type { RootTabParamList } from '../../navigation/types';

type TabIconProps = {
  color: string;
  focused: boolean;
  name: keyof RootTabParamList;
};

const DevicesIcon = ({ color }: Pick<TabIconProps, 'color'>) => (
  <View style={styles.iconCanvas}>
    <View style={[styles.deviceBody, { borderColor: color }]}>
      <View style={[styles.deviceScreen, { backgroundColor: color }]} />
      <View style={[styles.deviceLight, { backgroundColor: color }]} />
    </View>
    <View style={[styles.signalDot, { backgroundColor: color }]} />
    <View style={[styles.signalWave, { borderRightColor: color }]} />
  </View>
);

const DashboardIcon = ({ color }: Pick<TabIconProps, 'color'>) => (
  <View style={[styles.iconCanvas, styles.chart]}>
    {[8, 13, 18, 11].map((height, index) => (
      <View
        key={height}
        style={[styles.chartBar, { backgroundColor: color, height, opacity: 0.55 + index * 0.15 }]}
      />
    ))}
  </View>
);

const CalibrationIcon = ({ color }: Pick<TabIconProps, 'color'>) => (
  <View style={styles.iconCanvas}>
    <View style={[styles.targetRing, { borderColor: color }]} />
    <View style={[styles.targetDot, { backgroundColor: color }]} />
    <View style={[styles.targetHorizontal, { backgroundColor: color }]} />
    <View style={[styles.targetVertical, { backgroundColor: color }]} />
  </View>
);

const LogsIcon = ({ color }: Pick<TabIconProps, 'color'>) => (
  <View style={[styles.iconCanvas, styles.logs]}>
    {[0, 1, 2].map((row) => (
      <View key={row} style={styles.logRow}>
        <View style={[styles.logDot, { backgroundColor: color }]} />
        <View style={[styles.logLine, { backgroundColor: color, opacity: 1 - row * 0.18 }]} />
      </View>
    ))}
  </View>
);

const SettingsIcon = ({ color }: Pick<TabIconProps, 'color'>) => (
  <View style={[styles.iconCanvas, styles.sliders]}>
    {[7, 14, 10].map((knobLeft, row) => (
      <View key={row} style={styles.sliderRow}>
        <View style={[styles.sliderLine, { backgroundColor: color }]} />
        <View style={[styles.sliderKnob, { backgroundColor: color, left: knobLeft }]} />
      </View>
    ))}
  </View>
);

const iconComponents: Record<keyof RootTabParamList, React.ComponentType<Pick<TabIconProps, 'color'>>> = {
  DevicesTab: DevicesIcon,
  DashboardTab: DashboardIcon,
  CalibrationTab: CalibrationIcon,
  LogsTab: LogsIcon,
  SettingsTab: SettingsIcon,
};

export const TabIcon = ({ color, focused, name }: TabIconProps) => {
  const Icon = iconComponents[name];

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: focused ? `${color}18` : 'transparent',
          borderColor: color,
          transform: [{ scale: focused ? 1.08 : 1 }],
        },
      ]}
    >
      <Icon color={color} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    height: 28,
    justifyContent: 'center',
    width: 32,
  },
  iconCanvas: {
    height: 20,
    position: 'relative',
    width: 22,
  },
  deviceBody: {
    alignItems: 'center',
    borderRadius: 3,
    borderWidth: 1.5,
    height: 18,
    justifyContent: 'center',
    left: 2,
    position: 'absolute',
    top: 1,
    width: 12,
  },
  deviceLight: {
    borderRadius: 2,
    bottom: 2,
    height: 2,
    position: 'absolute',
    width: 2,
  },
  deviceScreen: {
    borderRadius: 1,
    height: 5,
    opacity: 0.7,
    width: 6,
  },
  signalDot: {
    borderRadius: 2,
    height: 3,
    position: 'absolute',
    right: 2,
    top: 9,
    width: 3,
  },
  signalWave: {
    borderRadius: 8,
    borderRightWidth: 1.5,
    height: 11,
    position: 'absolute',
    right: 0,
    top: 5,
    width: 7,
  },
  chart: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    gap: 2,
    justifyContent: 'center',
  },
  chartBar: {
    borderRadius: 2,
    width: 3,
  },
  targetRing: {
    borderRadius: 8,
    borderWidth: 1.5,
    height: 15,
    left: 4,
    position: 'absolute',
    top: 2.5,
    width: 15,
  },
  targetDot: {
    borderRadius: 2,
    height: 4,
    left: 9.5,
    position: 'absolute',
    top: 8,
    width: 4,
  },
  targetHorizontal: {
    height: 1,
    left: 1,
    position: 'absolute',
    top: 9.5,
    width: 21,
  },
  targetVertical: {
    height: 20,
    left: 10.5,
    position: 'absolute',
    top: 0,
    width: 1,
  },
  logs: {
    gap: 3,
    justifyContent: 'center',
  },
  logRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 3,
  },
  logDot: {
    borderRadius: 2,
    height: 3,
    width: 3,
  },
  logLine: {
    borderRadius: 2,
    height: 2,
    width: 15,
  },
  sliders: {
    gap: 4,
    justifyContent: 'center',
  },
  sliderRow: {
    height: 2,
    position: 'relative',
  },
  sliderLine: {
    borderRadius: 2,
    height: 1,
    opacity: 0.65,
    position: 'absolute',
    top: 1.5,
    width: 22,
  },
  sliderKnob: {
    borderRadius: 3,
    height: 5,
    position: 'absolute',
    top: -0.5,
    width: 5,
  },
});
