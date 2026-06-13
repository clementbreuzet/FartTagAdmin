import React, { useCallback, useState } from 'react';
import {
  LayoutChangeEvent,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { colors } from '../../theme/colors';

type SliderSettingProps = {
  label: string;
  value: number;
  minimumValue: number;
  maximumValue: number;
  step: number;
  unit: string;
  onValueChange: (value: number) => void;
};

const clamp = (value: number, minimum: number, maximum: number) =>
  Math.min(maximum, Math.max(minimum, value));

export const SliderSetting = ({
  label,
  value,
  minimumValue,
  maximumValue,
  step,
  unit,
  onValueChange,
}: SliderSettingProps) => {
  const [trackWidth, setTrackWidth] = useState(0);
  const range = maximumValue - minimumValue;
  const percentage = range === 0 ? 0 : ((value - minimumValue) / range) * 100;

  const updateFromPosition = useCallback(
    (position: number) => {
      if (trackWidth === 0) {
        return;
      }

      const rawValue = minimumValue + (position / trackWidth) * range;
      const steppedValue = Math.round(rawValue / step) * step;
      onValueChange(clamp(steppedValue, minimumValue, maximumValue));
    },
    [maximumValue, minimumValue, onValueChange, range, step, trackWidth],
  );

  const onLayout = useCallback((event: LayoutChangeEvent) => {
    setTrackWidth(event.nativeEvent.layout.width);
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>
          {value} {unit}
        </Text>
      </View>
      <Pressable
        accessibilityRole="adjustable"
        onLayout={onLayout}
        onPress={(event) => updateFromPosition(event.nativeEvent.locationX)}
        style={styles.track}
      >
        <View style={[styles.fill, { width: `${percentage}%` }]} />
        <View style={[styles.thumb, { left: `${percentage}%` }]} />
      </Pressable>
      <View style={styles.range}>
        <Text style={styles.rangeText}>{minimumValue}</Text>
        <Text style={styles.rangeText}>{maximumValue}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 22,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 13,
  },
  label: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '700',
  },
  value: {
    color: colors.neonCyan,
    fontSize: 13,
    fontWeight: '800',
  },
  track: {
    backgroundColor: colors.border,
    borderRadius: 4,
    height: 8,
    justifyContent: 'center',
  },
  fill: {
    backgroundColor: colors.neonCyan,
    borderRadius: 4,
    height: '100%',
  },
  thumb: {
    backgroundColor: colors.neonGreen,
    borderRadius: 8,
    height: 16,
    marginLeft: -8,
    position: 'absolute',
    width: 16,
  },
  range: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  rangeText: {
    color: colors.textMuted,
    fontSize: 9,
  },
});

export default SliderSetting;
