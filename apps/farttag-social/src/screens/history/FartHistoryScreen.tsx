import React, { useEffect, useMemo } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';

import { FeedState } from '../../features/feed/components/FeedState';
import { HistoryEventCard } from '../../features/history/components/HistoryEventCard';
import { HistoryFilterBar } from '../../features/history/components/HistoryFilterBar';
import { useHistoryStore } from '../../features/history/historyStore';
import type { SectionScreenNavigation } from '../../navigation/screenNavigation';
import { colors } from '../../theme/colors';

type FartHistoryScreenProps = {
  navigation: SectionScreenNavigation;
};

export const FartHistoryScreen = ({ navigation }: FartHistoryScreenProps) => {
  const error = useHistoryStore((state) => state.error);
  const events = useHistoryStore((state) => state.events);
  const filter = useHistoryStore((state) => state.filter);
  const isLoading = useHistoryStore((state) => state.isLoading);
  const isRefreshing = useHistoryStore((state) => state.isRefreshing);
  const currentlyPlayingId = useHistoryStore((state) => state.currentlyPlayingId);
  const playbackStatus = useHistoryStore((state) => state.playbackStatus);
  const loadHistory = useHistoryStore((state) => state.loadHistory);
  const playAudio = useHistoryStore((state) => state.playAudio);
  const refreshHistory = useHistoryStore((state) => state.refreshHistory);
  const setFilter = useHistoryStore((state) => state.setFilter);

  const visibleEvents = useMemo(
    () =>
      events.filter((event) => {
        if (filter === 'legendary') return event.isLegendary;
        if (filter === 'public' || filter === 'private') return event.visibility === filter;
        return true;
      }),
    [events, filter],
  );

  useEffect(() => {
    if (__DEV__) {
      console.log('[history-screen] Render state', {
        error,
        filter,
        isLoading,
        isRefreshing,
        totalItemCount: events.length,
        visibleItemCount: visibleEvents.length,
      });
    }
  }, [error, events.length, filter, isLoading, isRefreshing, visibleEvents.length]);

  if (isLoading && events.length === 0) {
    return <View style={styles.safeArea}><FeedState description="Récupération de tes scores officiels." loading title="Chargement de l'historique" /></View>;
  }

  if (error && events.length === 0) {
    return <View style={styles.safeArea}><FeedState actionLabel="Réessayer" description={error} onAction={() => void loadHistory()} title="Historique indisponible" tone="purple" /></View>;
  }

  return (
    <View style={styles.safeArea}>
      <FlatList
        ListEmptyComponent={<FeedState description={events.length === 0 ? 'Tes futurs événements apparaîtront ici.' : 'Aucun fart ne correspond à ce filtre.'} title={events.length === 0 ? 'Aucun fart enregistré' : 'Aucun résultat'} />}
        ListHeaderComponent={<><HistoryFilterBar activeFilter={filter} onChange={setFilter} />{error ? <Text style={styles.error}>{error}</Text> : null}</>}
        contentContainerStyle={styles.content}
        data={visibleEvents}
        keyExtractor={(event) => event.id}
        refreshControl={<RefreshControl colors={[colors.neonGreen]} onRefresh={() => void refreshHistory()} refreshing={isRefreshing} tintColor={colors.neonGreen} />}
        renderItem={({ item }) => (
          <HistoryEventCard
            currentlyPlayingId={currentlyPlayingId}
            event={item}
            onOpen={(event) => navigation.navigate('FartDetailsScreen', { fartEventId: event.id })}
            onReplay={(event) => void playAudio(event)}
            playbackStatus={playbackStatus}
          />
        )}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: { backgroundColor: colors.background, flex: 1 },
  content: { flexGrow: 1, padding: 16, paddingBottom: 40 },
  error: { color: colors.danger, fontSize: 10, marginBottom: 13, textAlign: 'center' },
});

export default FartHistoryScreen;
