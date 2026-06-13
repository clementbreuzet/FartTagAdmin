import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useEffect, useMemo } from 'react';
import {
  Alert,
  FlatList,
  Linking,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FeedState } from '../features/feed/components/FeedState';
import { HistoryEventCard } from '../features/history/components/HistoryEventCard';
import { HistoryFilterBar } from '../features/history/components/HistoryFilterBar';
import { useHistoryStore } from '../features/history/historyStore';
import type { FartHistoryEvent } from '../features/history/types';
import type { RootStackParamList } from '../navigation/types';
import { colors } from '../theme/colors';

type FartHistoryScreenProps = NativeStackScreenProps<RootStackParamList, 'FartHistoryScreen'>;

export const FartHistoryScreen = ({ navigation }: FartHistoryScreenProps) => {
  const error = useHistoryStore((state) => state.error);
  const events = useHistoryStore((state) => state.events);
  const filter = useHistoryStore((state) => state.filter);
  const hasLoaded = useHistoryStore((state) => state.hasLoaded);
  const isLoading = useHistoryStore((state) => state.isLoading);
  const isRefreshing = useHistoryStore((state) => state.isRefreshing);
  const loadHistory = useHistoryStore((state) => state.loadHistory);
  const refreshHistory = useHistoryStore((state) => state.refreshHistory);
  const setFilter = useHistoryStore((state) => state.setFilter);

  useEffect(() => {
    if (!hasLoaded && !isLoading) {
      void loadHistory();
    }
  }, [hasLoaded, isLoading, loadHistory]);

  const visibleEvents = useMemo(
    () =>
      events.filter((event) => {
        if (filter === 'legendary') {
          return event.isLegendary;
        }
        if (filter === 'public' || filter === 'private') {
          return event.visibility === filter;
        }
        return true;
      }),
    [events, filter],
  );

  const replay = async (event: FartHistoryEvent) => {
    if (!event.audioReplayUrl) {
      return;
    }
    try {
      await Linking.openURL(event.audioReplayUrl);
    } catch {
      Alert.alert('Replay indisponible', "L'audio n'a pas pu être ouvert.");
    }
  };

  if (isLoading && events.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <HistoryHeader onBack={navigation.goBack} />
        <FeedState description="Récupération de tes scores officiels." loading title="Chargement de l'historique" />
      </SafeAreaView>
    );
  }

  if (error && events.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <HistoryHeader onBack={navigation.goBack} />
        <FeedState actionLabel="Réessayer" description={error} onAction={() => void loadHistory()} title="Historique indisponible" tone="purple" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        ListEmptyComponent={
          <FeedState
            description={events.length === 0 ? "Tes futurs événements apparaîtront ici." : "Aucun fart ne correspond à ce filtre."}
            title={events.length === 0 ? 'Aucun fart enregistré' : 'Aucun résultat'}
          />
        }
        ListHeaderComponent={
          <>
            <HistoryHeader onBack={navigation.goBack} />
            <HistoryFilterBar activeFilter={filter} onChange={setFilter} />
            {error ? <Text style={styles.error}>{error}</Text> : null}
          </>
        }
        contentContainerStyle={styles.content}
        data={visibleEvents}
        keyExtractor={(event) => event.id}
        refreshControl={
          <RefreshControl
            colors={[colors.neonGreen]}
            onRefresh={() => void refreshHistory()}
            refreshing={isRefreshing}
            tintColor={colors.neonGreen}
          />
        }
        renderItem={({ item }) => (
          <HistoryEventCard
            event={item}
            onOpen={(event) => navigation.navigate('FartDetailsScreen', { fartEventId: event.id })}
            onReplay={(event) => void replay(event)}
          />
        )}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const HistoryHeader = ({ onBack }: { onBack: () => void }) => (
  <View style={styles.header}>
    <View>
      <Text style={styles.eyebrow}>FARTTAG SOCIAL</Text>
      <Text style={styles.title}>Historique</Text>
      <Text style={styles.subtitle}>Tes farts, classés du plus récent au plus ancien.</Text>
    </View>
    <Pressable onPress={onBack} style={styles.backButton}>
      <Text style={styles.backText}>RETOUR</Text>
    </Pressable>
  </View>
);

const styles = StyleSheet.create({
  safeArea: { backgroundColor: colors.background, flex: 1 },
  content: { flexGrow: 1, padding: 16, paddingBottom: 40 },
  header: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 19 },
  eyebrow: { color: colors.neonGreen, fontSize: 11, fontWeight: '900', letterSpacing: 2.2 },
  title: { color: colors.textPrimary, fontSize: 29, fontWeight: '800', marginTop: 3 },
  subtitle: { color: colors.textSecondary, fontSize: 10, marginTop: 5 },
  backButton: { borderColor: colors.neonCyan, borderRadius: 12, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 8 },
  backText: { color: colors.neonCyan, fontSize: 8, fontWeight: '900', letterSpacing: 0.8 },
  error: { color: colors.danger, fontSize: 10, marginBottom: 13, textAlign: 'center' },
});

export default FartHistoryScreen;
