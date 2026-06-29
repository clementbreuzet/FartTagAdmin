import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { OfficialFartResult } from '../../features/detection/types';
import { t, useLanguageStore } from '../../i18n/translations';
import { appTheme } from '../../theme/theme';
import { EventCelebrationModal } from './EventCelebrationModal';

type FartRewardsOverlayProps = {
  result: OfficialFartResult | null;
};

export const FartRewardsOverlay = ({ result }: FartRewardsOverlayProps) => {
  useLanguageStore((state) => state.locale);
  const [visibleResult, setVisibleResult] = useState<OfficialFartResult | null>(null);
  const lastShownId = useRef<string | null>(result?.fartEventId ?? null);

  useEffect(() => {
    if (!result || result.fartEventId === lastShownId.current) {
      return;
    }

    lastShownId.current = result.fartEventId;
    setVisibleResult(result);
  }, [result]);

  return (
    <EventCelebrationModal
      accentColor={appTheme.colors.toxicGreen}
      onClose={() => setVisibleResult(null)}
      title={t('rewards.title')}
      visible={Boolean(visibleResult)}
    >
      {visibleResult ? (
        <>
          <Text style={styles.score}>{t('common.score')} {visibleResult.officialScore}</Text>
          <View style={styles.rewards}>
            <View style={styles.rewardPill}>
              <Text style={styles.xp}>+{visibleResult.xpGained}</Text>
              <Text style={styles.rewardLabel}>XP</Text>
            </View>
            <View style={[styles.rewardPill, styles.flatulonsPill]}>
              <Text style={styles.flatulons}>+{visibleResult.flatulonsEarned}</Text>
              <Text style={styles.rewardLabel}>{t('currency.flatulons')}</Text>
            </View>
          </View>
          {visibleResult.leveledUp ? (
            <Text style={styles.levelUp}>
              {t('rewards.levelUp')} {visibleResult.oldLevel} - {visibleResult.newLevel}
            </Text>
          ) : null}
        </>
      ) : null}
    </EventCelebrationModal>
  );
};

const styles = StyleSheet.create({
  flatulons: {
    color: appTheme.colors.toxicGreen,
    fontSize: 24,
    fontWeight: '900',
  },
  flatulonsPill: {
    borderColor: `${appTheme.colors.toxicGreen}88`,
  },
  levelUp: {
    color: '#FFAE00',
    fontSize: 13,
    fontWeight: '900',
    marginTop: 12,
  },
  rewardLabel: {
    color: appTheme.colors.textMuted,
    fontSize: 9,
    fontWeight: '900',
    marginTop: 2,
    textTransform: 'uppercase',
  },
  rewardPill: {
    alignItems: 'center',
    backgroundColor: '#101620',
    borderColor: `${appTheme.colors.neonPurple}88`,
    borderRadius: 16,
    borderWidth: 1,
    flex: 1,
    paddingVertical: 10,
  },
  rewards: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
    width: '100%',
  },
  score: {
    color: appTheme.colors.text,
    fontSize: 32,
    fontWeight: '900',
    marginTop: 4,
  },
  xp: {
    color: appTheme.colors.neonPurple,
    fontSize: 24,
    fontWeight: '900',
  },
});
