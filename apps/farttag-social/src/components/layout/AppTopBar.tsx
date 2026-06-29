import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { appTheme } from '../../theme/theme';
import { CurrencyPill } from '../ui/CurrencyPill';
import { XpProgressBar } from '../ui/XpProgressBar';

export type AppTopBarProps = {
  backendStatus?: 'checking' | 'offline' | 'online' | 'unknown';
  level: number;
  currentXp: number;
  requiredXp: number;
  flatulons: number;
  gems: number;
  onOpenShop: () => void;
};

export const AppTopBar = ({
  backendStatus = 'unknown',
  level,
  currentXp,
  requiredXp,
  flatulons,
  gems,
  onOpenShop,
}: AppTopBarProps) => {
  const insets = useSafeAreaInsets();
  const showConnectionBanner = backendStatus === 'offline' || backendStatus === 'checking';
  const connectionLabel = backendStatus === 'offline' ? 'DECONNECTE' : 'CONNEXION';

  return (
    <View style={[styles.safeArea, { paddingTop: insets.top }]}>
      {showConnectionBanner ? (
        <View style={[styles.connectionBanner, backendStatus === 'offline' && styles.connectionBannerOffline]}>
          {backendStatus === 'checking' ? <ActivityIndicator color={appTheme.colors.toxicGreen} size="small" /> : null}
          <Text style={styles.connectionText}>{connectionLabel}</Text>
        </View>
      ) : null}
      <View style={styles.bar}>
        <View style={styles.levelCard}>
          <View style={styles.levelBadge}>
            <Text style={styles.levelLabel}>NIV</Text>
            <Text style={styles.levelValue}>{level}</Text>
          </View>
          <XpProgressBar currentXp={currentXp} requiredXp={requiredXp} />
        </View>
        <View style={styles.currency}>
          <CurrencyPill amount={flatulons} onAdd={onOpenShop} />
        </View>
        <View style={styles.gems}>
          <CurrencyPill accent="cyan" amount={gems} onAdd={onOpenShop} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: appTheme.colors.background,
  },
  connectionBanner: {
    alignItems: 'center',
    backgroundColor: '#101A0A',
    borderBottomColor: appTheme.colors.toxicGreen,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    minHeight: 28,
    paddingHorizontal: 12,
  },
  connectionBannerOffline: {
    backgroundColor: '#260C14',
    borderBottomColor: '#FF4D67',
  },
  connectionText: {
    color: appTheme.colors.text,
    fontSize: 9,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  bar: {
    alignItems: 'center',
    backgroundColor: appTheme.colors.background,
    borderBottomColor: appTheme.colors.borderGlow,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    gap: 6,
    paddingBottom: 8,
    paddingHorizontal: 10,
    paddingTop: 6,
  },
  levelCard: {
    alignItems: 'center',
    backgroundColor: appTheme.colors.cardBackground,
    borderColor: appTheme.colors.borderGlow,
    borderRadius: 18,
    borderWidth: 1,
    flex: 1,
    flexDirection: 'row',
    gap: 6,
    padding: 5,
  },
  levelBadge: {
    alignItems: 'center',
    backgroundColor: '#17250C',
    borderColor: appTheme.colors.toxicGreen,
    borderRadius: 13,
    borderWidth: 1,
    height: 28,
    justifyContent: 'center',
    width: 34,
  },
  levelLabel: {
    color: appTheme.colors.textMuted,
    fontSize: 5,
    fontWeight: '900',
    letterSpacing: 0.6,
  },
  levelValue: {
    color: appTheme.colors.toxicGreen,
    fontSize: 13,
    fontWeight: '900',
    lineHeight: 14,
  },
  currency: {
    flex: 1,
  },
  gems: {
    flex: 1,
  },
});
