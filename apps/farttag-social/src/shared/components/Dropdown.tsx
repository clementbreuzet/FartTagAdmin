import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '../../theme/colors';

export type DropdownOption<TValue extends string> = {
  flag?: string;
  label: string;
  value: TValue;
};

type DropdownProps<TValue extends string> = {
  label: string;
  onChange: (value: TValue) => void;
  options: Array<DropdownOption<TValue>>;
  value: TValue;
};

export const Dropdown = <TValue extends string>({
  label,
  onChange,
  options,
  value,
}: DropdownProps<TValue>) => {
  const [open, setOpen] = useState(false);
  const selected = options.find((option) => option.value === value) ?? options[0];

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <Pressable onPress={() => setOpen((current) => !current)} style={styles.trigger}>
        <Text style={styles.selectedText}>
          {selected.flag ? `${selected.flag}  ` : ''}{selected.label}
        </Text>
        <Text style={styles.chevron}>{open ? '▲' : '▼'}</Text>
      </Pressable>
      {open ? (
        <View style={styles.menu}>
          {options.map((option) => {
            const active = option.value === value;
            return (
              <Pressable
                key={option.value}
                onPress={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
                style={[styles.option, active && styles.optionActive]}
              >
                <Text style={styles.optionText}>
                  {option.flag ? `${option.flag}  ` : ''}{option.label}
                </Text>
                {active ? <Text style={styles.activeMark}>✓</Text> : null}
              </Pressable>
            );
          })}
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  activeMark: {
    color: colors.neonGreen,
    fontSize: 13,
    fontWeight: '900',
  },
  chevron: {
    color: colors.neonCyan,
    fontSize: 10,
    fontWeight: '900',
  },
  container: {
    gap: 8,
  },
  label: {
    color: colors.textPrimary,
    fontSize: 11,
    fontWeight: '900',
  },
  menu: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  option: {
    alignItems: 'center',
    borderBottomColor: colors.border,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 42,
    paddingHorizontal: 12,
  },
  optionActive: {
    backgroundColor: '#7CFF0014',
  },
  optionText: {
    color: colors.textPrimary,
    fontSize: 12,
    fontWeight: '800',
  },
  selectedText: {
    color: colors.textPrimary,
    flex: 1,
    fontSize: 12,
    fontWeight: '900',
  },
  trigger: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.neonCyan,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 8,
    minHeight: 44,
    paddingHorizontal: 12,
  },
});
