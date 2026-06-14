import React, { type ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors } from '../../theme/colors';

type ScreenHeaderProps = {
  action?: ReactNode;
  eyebrow?: string;
  subtitle?: string;
  title: string;
};

export const ScreenHeader = ({
  action,
  eyebrow = 'FARTTAG SOCIAL',
  subtitle,
  title,
}: ScreenHeaderProps) => (
  <View style={styles.header}>
    <View style={styles.copy}>
      <Text style={styles.eyebrow}>{eyebrow}</Text>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
    {action ? <View style={styles.action}>{action}</View> : null}
  </View>
);

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingTop: 4,
  },
  copy: { flex: 1 },
  eyebrow: {
    color: colors.neonGreen,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 2.2,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 29,
    fontWeight: '800',
    marginTop: 3,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 11,
    marginTop: 5,
  },
  action: { marginLeft: 12 },
});
