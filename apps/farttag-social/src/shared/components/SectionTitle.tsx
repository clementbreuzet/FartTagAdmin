import React from 'react';
import { StyleSheet, Text } from 'react-native';

import { colors } from '../../theme/colors';

type SectionTitleProps = {
  accent?: 'cyan' | 'default';
  title: string;
};

export const SectionTitle = ({ accent = 'cyan', title }: SectionTitleProps) => (
  <Text style={[styles.title, accent === 'default' && styles.defaultTitle]}>{title}</Text>
);

const styles = StyleSheet.create({
  title: {
    color: colors.neonCyan,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1,
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  defaultTitle: {
    color: colors.textPrimary,
    fontSize: 12,
    letterSpacing: 0.8,
    marginBottom: 12,
  },
});
