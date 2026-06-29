import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { appTheme } from '../../theme/theme';
import { GemIcon } from './GemIcon';

type CurrencyPillProps = {
  accent?: 'cyan' | 'green';
  amount: number;
  onAdd: () => void;
};

const currencyLogo = require('../../assets/branding/logo-app.png');

export const CurrencyPill = ({ accent = 'green', amount, onAdd }: CurrencyPillProps) => {
  const accentColor = accent === 'cyan' ? appTheme.colors.neonCyan : appTheme.colors.toxicGreen;

  return (
    <View style={[styles.pill, { borderColor: `${accentColor}66` }]}>
      {accent === 'cyan' ? (
        <View style={styles.gemIcon}>
          <GemIcon size={38} />
        </View>
      ) : (
        <Image source={currencyLogo} style={styles.logo} />
      )}
      <Text adjustsFontSizeToFit minimumFontScale={0.72} numberOfLines={1} style={styles.amount}>
        {amount.toLocaleString()}
      </Text>
      <Pressable
        accessibilityLabel="Ouvrir la boutique"
        hitSlop={6}
        onPress={onAdd}
        style={({ pressed }) => [
          styles.addButton,
          { backgroundColor: `${accentColor}22`, borderColor: accentColor },
          pressed && styles.pressed,
        ]}
      >
        <Text style={[styles.addText, { color: accentColor }]}>+</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  pill: {
    alignItems: 'center',
    backgroundColor: appTheme.colors.cardBackground,
    borderRadius: 18,
    borderWidth: 1,
    flex: 1,
    flexDirection: 'row',
    minWidth: 0,
    paddingLeft: 4,
    paddingRight: 3,
    paddingVertical: 4,
  },
  logo: {
    borderRadius: 15,
    height: 26,
    resizeMode: 'cover',
    width: 26,
  },
  gemIcon: {
    alignItems: 'center',
    height: 32,
    justifyContent: 'center',
    width: 32,
  },
  amount: {
    color: appTheme.colors.text,
    flex: 1,
    fontSize: 11,
    fontWeight: '900',
    marginHorizontal: 3,
    textAlign: 'right',
  },
  addButton: {
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    height: 26,
    justifyContent: 'center',
    width: 26,
  },
  addText: {
    fontSize: 18,
    fontWeight: '900',
    lineHeight: 22,
  },
  pressed: {
    opacity: 0.68,
    transform: [{ scale: 0.92 }],
  },
});
