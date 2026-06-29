import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect } from 'react';
import {
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FeedState } from '../../features/feed/components/FeedState';
import { useHomeStore } from '../../features/home/homeStore';
import type { HomeFartEvent } from '../../features/home/types';
import { t, useLanguageStore } from '../../i18n/translations';
import { routeNames } from '../../navigation/routeNames';
import type { RootStackParamList } from '../../navigation/types';
import { ScreenTitle } from '../../shared/components';
import { colors } from '../../theme/colors';

const logo = require('../../assets/branding/logo-app.png');

const formatDate = (date: string) =>
  new Intl.DateTimeFormat(undefined, {
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    month: 'short',
  }).format(new Date(date));

const formatDuration = (durationMs: number) => `${(durationMs / 1_000).toFixed(1)} s`;

export const HomeFeedScreen = () => {
  useLanguageStore((state) => state.locale);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const dashboard = useHomeStore((state) => state.dashboard);
  const error = useHomeStore((state) => state.error);
  const hasLoaded = useHomeStore((state) => state.hasLoaded);
  const isLoading = useHomeStore((state) => state.isLoading);
  const isRefreshing = useHomeStore((state) => state.isRefreshing);
  const loadHome = useHomeStore((state) => state.loadHome);
  const refreshHome = useHomeStore((state) => state.refreshHome);

  useEffect(() => {
    if (!hasLoaded && !isLoading) {
      void loadHome();
    }
  }, [hasLoaded, isLoading, loadHome]);

  const openHistory = () => {
    navigation.navigate(routeNames.mainTabs, {
      params: { screen: routeNames.profile },
      screen: routeNames.profileTab,
    });
  };

  const openDetails = (eventId: string) => {
    navigation.navigate(routeNames.fartDetails, { fartEventId: eventId });
  };

  if (isLoading && !dashboard) {
    return (
      <SafeAreaView edges={['left', 'right']} style={styles.safeArea}>
        <View style={styles.stateContent}>
          <ScreenTitle title={t('screens.home.title')} />
          <FeedState
            description="Preparation de ton tableau de bord quotidien."
            loading
            title="Chargement de l'accueil"
          />
        </View>
      </SafeAreaView>
    );
  }

  if (!dashboard) {
    return (
      <SafeAreaView edges={['left', 'right']} style={styles.safeArea}>
        <View style={styles.stateContent}>
          <ScreenTitle title={t('screens.home.title')} />
          <FeedState
            actionLabel="Reessayer"
            description={error ?? "Impossible de charger l'accueil."}
            onAction={() => void loadHome()}
            title="Accueil indisponible"
            tone="purple"
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['left', 'right']} style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            colors={[colors.neonGreen]}
            onRefresh={() => void refreshHome()}
            refreshing={isRefreshing}
            tintColor={colors.neonGreen}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <ScreenTitle title={t('screens.home.title')} />

        <View style={styles.hero}>
          <Image resizeMode="contain" source={logo} style={styles.logo} />
          <View style={styles.heroCopy}>
            <Text style={styles.heroLabel}>TABLEAU DE BORD</Text>
            <Text style={styles.heroTitle}>Reviens faire monter le score.</Text>
            <Text style={styles.heroText}>
              Ton defi, ton coffre et tes derniers exploits sont prets pour aujourd'hui.
            </Text>
          </View>
        </View>

        <View style={styles.dailyGrid}>
          <View style={styles.panel}>
            <Text style={styles.panelEyebrow}>DEFI DU JOUR</Text>
            <Text style={styles.panelTitle}>{dashboard.dailyChallenge.title}</Text>
            <Text style={styles.panelText}>{dashboard.dailyChallenge.description}</Text>
            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${Math.min(
                      100,
                      (dashboard.dailyChallengeProgress / dashboard.dailyChallenge.targetCount) * 100,
                    )}%`,
                  },
                ]}
              />
            </View>
            <Text style={styles.progressText}>
              {dashboard.dailyChallengeProgress}/{dashboard.dailyChallenge.targetCount} - +{dashboard.dailyChallenge.rewardFlatulons} {t('currency.flatulons')}
            </Text>
          </View>

          <View style={[styles.panel, styles.chestPanel]}>
            <Text style={styles.panelEyebrow}>COFFRE QUOTIDIEN</Text>
            <Text style={styles.chestIcon}>◇</Text>
            <Text style={styles.panelTitle}>
              {dashboard.dailyChestAvailable ? 'Disponible' : 'Deja recupere'}
            </Text>
            <Text style={styles.panelText}>
              {dashboard.dailyChestAvailable
                ? 'Un bonus attend ta prochaine session.'
                : 'Reviens demain pour un nouveau coffre.'}
            </Text>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>LES 3 DERNIERS PETS</Text>
          <Pressable onPress={openHistory} style={styles.historyButton}>
            <Text style={styles.historyButtonText}>VOIR MON HISTORIQUE</Text>
          </Pressable>
        </View>

        {dashboard.recentFarts.length > 0 ? (
          dashboard.recentFarts.map((event) => (
            <RecentFartCard event={event} key={event.id} onPress={() => openDetails(event.id)} />
          ))
        ) : (
          <View style={styles.emptyPanel}>
            <Text style={styles.emptyTitle}>Aucun pet encore</Text>
            <Text style={styles.emptyText}>Passe par Detection pour creer ton premier event officiel.</Text>
          </View>
        )}

        {error ? <Text style={styles.error}>{error}</Text> : null}
      </ScrollView>
    </SafeAreaView>
  );
};

const RecentFartCard = ({ event, onPress }: { event: HomeFartEvent; onPress: () => void }) => (
  <Pressable onPress={onPress} style={styles.fartCard}>
    <View>
      <Text style={styles.fartCategory}>{event.category.toUpperCase()}</Text>
      <Text style={styles.fartDate}>{formatDate(event.occurredAt)}</Text>
      <Text style={styles.fartMeta}>
        {formatDuration(event.durationMs)} - {event.audioLevel} dB - {event.gasLevel} kOhm
      </Text>
    </View>
    <View style={styles.fartScore}>
      <Text style={styles.fartScoreLabel}>SCORE</Text>
      <Text style={styles.fartScoreValue}>{event.officialScore}</Text>
    </View>
  </Pressable>
);

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: colors.background,
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 36,
  },
  stateContent: {
    flex: 1,
    padding: 16,
  },
  hero: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.neonGreen,
    borderRadius: 22,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 14,
    padding: 16,
  },
  logo: {
    height: 76,
    width: 76,
  },
  heroCopy: {
    flex: 1,
  },
  heroLabel: {
    color: colors.neonCyan,
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1.1,
  },
  heroTitle: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: '900',
    marginTop: 5,
  },
  heroText: {
    color: colors.textSecondary,
    fontSize: 11,
    lineHeight: 16,
    marginTop: 6,
  },
  dailyGrid: {
    gap: 12,
    marginTop: 14,
  },
  panel: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 18,
    borderWidth: 1,
    padding: 15,
  },
  chestPanel: {
    borderColor: colors.neonPurple,
  },
  panelEyebrow: {
    color: colors.neonCyan,
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1,
  },
  panelTitle: {
    color: colors.textPrimary,
    fontSize: 17,
    fontWeight: '900',
    marginTop: 6,
  },
  panelText: {
    color: colors.textSecondary,
    fontSize: 11,
    lineHeight: 16,
    marginTop: 5,
  },
  progressTrack: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: 6,
    height: 8,
    marginTop: 13,
    overflow: 'hidden',
  },
  progressFill: {
    backgroundColor: colors.neonGreen,
    height: '100%',
  },
  progressText: {
    color: colors.textMuted,
    fontSize: 9,
    fontWeight: '800',
    marginTop: 7,
  },
  chestIcon: {
    color: colors.neonPurple,
    fontSize: 34,
    fontWeight: '900',
    marginTop: 8,
  },
  sectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    marginTop: 22,
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '900',
  },
  historyButton: {
    borderColor: colors.neonCyan,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  historyButtonText: {
    color: colors.neonCyan,
    fontSize: 7,
    fontWeight: '900',
    letterSpacing: 0.6,
  },
  fartCard: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 17,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    padding: 13,
  },
  fartCategory: {
    color: colors.neonGreen,
    fontSize: 9,
    fontWeight: '900',
  },
  fartDate: {
    color: colors.textPrimary,
    fontSize: 12,
    fontWeight: '800',
    marginTop: 4,
  },
  fartMeta: {
    color: colors.textMuted,
    fontSize: 9,
    marginTop: 4,
  },
  fartScore: {
    alignItems: 'flex-end',
  },
  fartScoreLabel: {
    color: colors.textMuted,
    fontSize: 7,
    fontWeight: '900',
  },
  fartScoreValue: {
    color: colors.neonGreen,
    fontSize: 24,
    fontWeight: '900',
  },
  emptyPanel: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 18,
    borderWidth: 1,
    padding: 20,
  },
  emptyTitle: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '900',
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: 11,
    marginTop: 6,
    textAlign: 'center',
  },
  error: {
    color: colors.danger,
    fontSize: 10,
    marginTop: 14,
    textAlign: 'center',
  },
});

export default HomeFeedScreen;
