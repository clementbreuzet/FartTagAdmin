import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { appTheme } from '../../theme/theme';

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
        <View style={[styles.gemIcon, { borderColor: accentColor }]}>
          <Text style={[styles.gemText, { color: accentColor }]}>◆</Text>
        </View>
      ) : (
        <Image source={currencyLogo} style={styles.logo} />
      )}
      <Text numberOfLines={1} style={styles.amount}>{amount.toLocaleString()}</Text>
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
    paddingLeft: 5,
    paddingRight: 4,
    paddingVertical: 4,
  },
  logo: {
    borderRadius: 15,
    height: 30,
    resizeMode: 'cover',
    width: 30,
  },
  gemIcon: {
    alignItems: 'center',
    backgroundColor: '#001C22',
    borderRadius: 15,
    borderWidth: 1,
    height: 30,
    justifyContent: 'center',
    width: 30,
  },
  gemText: {
    fontSize: 17,
  },
  amount: {
    color: appTheme.colors.text,
    flex: 1,
    fontSize: 13,
    fontWeight: '900',
    marginHorizontal: 4,
    textAlign: 'right',
  },
  addButton: {
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    height: 30,
    justifyContent: 'center',
    width: 30,
  },
  addText: {
    fontSize: 20,
    fontWeight: '900',
    lineHeight: 22,
  },
  pressed: {
    opacity: 0.68,
    transform: [{ scale: 0.92 }],
  },
});
