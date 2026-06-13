import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useEffect, useMemo } from 'react';
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FeedState } from '../../features/feed/components/FeedState';
import { LeaderboardModeBar } from '../../features/leaderboards/components/LeaderboardModeBar';
import { LeaderboardRow } from '../../features/leaderboards/components/LeaderboardRow';
import { selectVisibleLeaderboard, useLeaderboardsStore } from '../../features/leaderboards/leaderboardsStore';
import type { RootStackParamList } from '../../navigation/types';
import { colors } from '../../theme/colors';

type LeaderboardScreenProps = NativeStackScreenProps<RootStackParamList, 'LeaderboardScreen'>;

export const LeaderboardScreen = ({ navigation }: LeaderboardScreenProps) => {
  const activeMode = useLeaderboardsStore((state) => state.activeMode);
  const error = useLeaderboardsStore((state) => state.error);
  const hasLoaded = useLeaderboardsStore((state) => state.hasLoaded);
  const isLoading = useLeaderboardsStore((state) => state.isLoading);
  const isRefreshing = useLeaderboardsStore((state) => state.isRefreshing);
  const global = useLeaderboardsStore((state) => state.global);
  const friends = useLeaderboardsStore((state) => state.friends);
  const longest = useLeaderboardsStore((state) => state.longest);
  const mostToxic = useLeaderboardsStore((state) => state.mostToxic);
  const week = useLeaderboardsStore((state) => state.week);
  const loadLeaderboards = useLeaderboardsStore((state) => state.loadLeaderboards);
  const refreshLeaderboards = useLeaderboardsStore((state) => state.refreshLeaderboards);
  const setMode = useLeaderboardsStore((state) => state.setMode);

  useEffect(() => {
    if (!hasLoaded && !isLoading) {
      void loadLeaderboards();
    }
  }, [hasLoaded, isLoading, loadLeaderboards]);

  const visibleEntries = useMemo(
    () => selectVisibleLeaderboard({ activeMode, error, friends, global, hasLoaded, isLoading, isRefreshing, loadLeaderboards, longest, mostToxic, refreshLeaderboards, setMode, week }),
    [activeMode, error, friends, global, hasLoaded, isLoading, isRefreshing, loadLeaderboards, longest, mostToxic, refreshLeaderboards, setMode, week],
  );

  if (isLoading && global.length === 0 && friends.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <LeaderboardHeader />
        <FeedState description="Chargement des classements et de la hierarchie." loading title="Chargement du leaderboard" />
      </SafeAreaView>
    );
  }

  if (error && global.length === 0 && friends.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <LeaderboardHeader />
        <FeedState
          actionLabel="Reessayer"
          description={error}
          onAction={() => {
            void loadLeaderboards();
          }}
          title="Leaderboard indisponible"
          tone="purple"
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        contentContainerStyle={styles.content}
        data={visibleEntries}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl
            colors={[colors.neonGreen]}
            onRefresh={() => void refreshLeaderboards()}
            refreshing={isRefreshing}
            tintColor={colors.neonGreen}
          />
        }
        ListHeaderComponent={
          <>
            <LeaderboardHeader />
            <View style={styles.summaryCard}>
              <View>
                <Text style={styles.summaryValue}>{visibleEntries.length}</Text>
                <Text style={styles.summaryLabel}>JOUEURS CLASSES</Text>
              </View>
              <Text style={styles.summaryMode}>{modeLabel(activeMode)}</Text>
            </View>
            <LeaderboardModeBar activeMode={activeMode} onChange={setMode} />
            {error ? <Text style={styles.error}>{error}</Text> : null}
          </>
        }
        ListEmptyComponent={
          <FeedState
            description="Aucun joueur ne correspond a ce classement."
            title="Classement vide"
            tone="cyan"
          />
        }
        renderItem={({ item }) => (
          <LeaderboardRow
            entry={item}
            onPress={(nextEntry) => {
              navigation.navigate('PublicUserProfileScreen', {
                avatarUrl: nextEntry.avatarUrl,
                badgeRarity: nextEntry.badgeRarity,
                displayName: nextEntry.displayName,
                title: nextEntry.title,
                userId: nextEntry.id,
                username: nextEntry.username,
              });
            }}
          />
        )}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const modeLabel = (mode: string) => {
  switch (mode) {
    case 'global':
      return 'GLOBAL';
    case 'friends':
      return 'AMIS';
    case 'week':
      return 'SEMAINE';
    case 'bestScore':
      return 'MEILLEUR SCORE';
    case 'longest':
      return 'PLUS LONG';
    case 'mostToxic':
      return 'PLUS TOXIQUE';
    case 'legendary':
      return 'LEGENDAIRE';
    default:
      return mode.toUpperCase();
  }
};

const LeaderboardHeader = () => (
  <View style={styles.header}>
    <View>
      <Text style={styles.eyebrow}>FARTTAG SOCIAL</Text>
      <Text style={styles.title}>Leaderboard</Text>
      <Text style={styles.subtitle}>Rangs, scores et bragging rights sur tout le reseau.</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: colors.background,
    flex: 1,
  },
  content: {
    flexGrow: 1,
    padding: 16,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 18,
  },
  eyebrow: {
    color: colors.neonGreen,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 2.2,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 29,
    fontWeight: '900',
    marginTop: 3,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 10,
    marginTop: 5,
  },
  summaryCard: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.neonPurple,
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
    padding: 14,
  },
  summaryValue: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '900',
  },
  summaryLabel: {
    color: colors.textMuted,
    fontSize: 7,
    fontWeight: '900',
    letterSpacing: 0.8,
    marginTop: 3,
  },
  summaryMode: {
    color: colors.neonPurple,
    fontSize: 18,
    fontWeight: '900',
    textAlign: 'right',
  },
  error: {
    color: colors.danger,
    fontSize: 10,
    marginBottom: 14,
    textAlign: 'center',
  },
});

export default LeaderboardScreen;

