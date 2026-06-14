import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { colors } from '../../theme/colors';

export type SubmenuTab<T extends string> = {
  label: string;
  value: T;
};

type SubmenuTabsProps<T extends string> = {
  activeTab: T;
  onChange: (tab: T) => void;
  tabs: readonly SubmenuTab<T>[];
};

export const SubmenuTabs = <T extends string>({
  activeTab,
  onChange,
  tabs,
}: SubmenuTabsProps<T>) => (
  <View style={styles.shell}>
    <ScrollView
      contentContainerStyle={styles.row}
      horizontal
      showsHorizontalScrollIndicator={false}
    >
      {tabs.map((tab) => {
        const active = activeTab === tab.value;
        return (
          <Pressable
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            key={tab.value}
            onPress={() => onChange(tab.value)}
            style={styles.tab}
          >
            <Text style={[styles.label, active && styles.activeLabel]}>{tab.label}</Text>
            <View style={[styles.indicator, active && styles.activeIndicator]} />
          </Pressable>
        );
      })}
    </ScrollView>
  </View>
);

const styles = StyleSheet.create({
  shell: {
    borderBottomColor: colors.border,
    borderBottomWidth: StyleSheet.hairlineWidth,
    marginBottom: 16,
  },
  row: { flexGrow: 1 },
  tab: {
    alignItems: 'center',
    flexGrow: 1,
    minWidth: 82,
    paddingHorizontal: 12,
    paddingTop: 5,
  },
  label: {
    color: colors.textMuted,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.7,
    paddingBottom: 10,
    textTransform: 'uppercase',
  },
  activeLabel: { color: colors.neonGreen },
  indicator: {
    backgroundColor: 'transparent',
    height: 2,
    width: '100%',
  },
  activeIndicator: {
    backgroundColor: colors.neonGreen,
    shadowColor: colors.neonGreen,
    shadowOpacity: 0.8,
    shadowRadius: 5,
  },
});
