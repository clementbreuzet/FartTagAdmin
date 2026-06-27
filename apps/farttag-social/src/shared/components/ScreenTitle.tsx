import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors } from '../../theme/colors';

type ScreenTitleProps = {
  title: string;
};

const titleColors = [colors.neonGreen, colors.neonCyan, colors.neonPurple];

export const ScreenTitle = ({ title }: ScreenTitleProps) => {
  const words = title.split(' ');

  return (
    <View style={styles.header}>
      <View style={styles.titleLine}>
        <View style={styles.lineStem} />
        <View style={styles.lineDot} />
      </View>
      <Text style={styles.title}>
        {words.map((word, index) => (
          <Text key={`${word}-${index}`} style={{ color: titleColors[index % titleColors.length] }}>
            {word}
            {index < words.length - 1 ? ' ' : ''}
          </Text>
        ))}
      </Text>
      <View style={[styles.titleLine, styles.titleLineRight]}>
        <View style={[styles.lineStem, styles.lineStemPurple]} />
        <View style={[styles.lineDot, styles.lineDotPurple]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    marginBottom: 8,
    marginTop: 1,
  },
  lineDot: {
    borderColor: colors.neonGreen,
    borderRadius: 3,
    borderWidth: 1,
    height: 5,
    width: 5,
  },
  lineDotPurple: {
    borderColor: colors.neonPurple,
  },
  lineStem: {
    backgroundColor: colors.neonGreen,
    height: 1,
    opacity: 0.55,
    width: 22,
  },
  lineStemPurple: {
    backgroundColor: colors.neonPurple,
  },
  title: {
    fontSize: 17,
    fontWeight: '900',
    letterSpacing: 0.3,
    textAlign: 'center',
  },
  titleLine: {
    alignItems: 'center',
    flexDirection: 'row',
    width: 29,
  },
  titleLineRight: {
    flexDirection: 'row-reverse',
  },
});
