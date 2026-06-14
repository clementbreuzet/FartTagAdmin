import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
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

import { SubmenuTabs } from '../../shared/components';
import { FartFeedCard } from '../../features/feed/components/FartFeedCard';
import { FeedState } from '../../features/feed/components/FeedState';
import { useFeedStore } from '../../features/feed/feedStore';
import type { FartReactionType, PublicFartEvent } from '../../features/feed/types';
import { useFriendsStore } from '../../features/friends/friendsStore';
import type { RootStackParamList } from '../../navigation/types';
import { colors } from '../../theme/colors';

export const HomeFeedScreen = () => {
  const [feedTab, setFeedTab] = useState<'forYou' | 'following' | 'friends'>('forYou');
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const error = useFeedStore((state) => state.error);
  const events = useFeedStore((state) => state.events);
  const hasLoaded = useFeedStore((state) => state.hasLoaded);
  const isLoading = useFeedStore((state) => state.isLoading);
  const isRefreshing = useFeedStore((state) => state.isRefreshing);
  const reactingEventId = useFeedStore((state) => state.reactingEventId);
  const loadFeed = useFeedStore((state) => state.loadFeed);
  const refreshFeed = useFeedStore((state) => state.refreshFeed);
  const reactToEvent = useFeedStore((state) => state.reactToEvent);
  const friends = useFriendsStore((state) => state.friends);
  const friendsHaveLoaded = useFriendsStore((state) => state.hasLoaded);
  const loadFriends = useFriendsStore((state) => state.loadFriends);

  useEffect(() => {
    if (!hasLoaded && !isLoading) {
      void loadFeed();
    }
  }, [hasLoaded, isLoading, loadFeed]);

  useEffect(() => {
    if (!friendsHaveLoaded) {
      void loadFriends();
    }
  }, [friendsHaveLoaded, loadFriends]);

  const visibleEvents = useMemo(() => {
    if (feedTab === 'following') {
      return [];
    }
    if (feedTab === 'friends') {
      const friendIds = new Set(friends.map((friend) => friend.userId));
      return events.filter((event) => friendIds.has(event.user.id));
    }
    return events;
  }, [events, feedTab, friends]);

  const replayEvent = useCallback(async (event: PublicFartEvent) => {
    if (!event.audioReplayUrl) {
      return;
    }

    try {
      await Linking.openURL(event.audioReplayUrl);
    } catch {
      Alert.alert('Replay indisponible', "L'audio n'a pas pu être ouvert.");
    }
  }, []);

  const react = useCallback((eventId: string, reaction: FartReactionType) => {
    void reactToEvent(eventId, reaction);
  }, [reactToEvent]);

  const openPublicProfile = useCallback((user: PublicFartEvent['user']) => {
    navigation.navigate('PublicUserProfileScreen', {
      avatarUrl: user.avatarUrl,
      displayName: user.displayName,
      userId: user.id,
      username: user.username,
    });
  }, [navigation]);

  const openDetails = useCallback((eventId: string) => {
    navigation.navigate('FartDetailsScreen', { fartEventId: eventId });
  }, [navigation]);

  const openComments = useCallback(() => {
    Alert.alert('Commentaires', "L'écran des commentaires sera connecté à la navigation FartTag Social.");
  }, []);

  if (isLoading && events.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <FeedState
          description="Les meilleurs événements publics arrivent."
          loading
          title="Chargement du feed"
        />
      </SafeAreaView>
    );
  }

  if (error && events.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <FeedState
          actionLabel="Réessayer"
          description={error}
          onAction={() => void loadFeed()}
          title="Feed indisponible"
          tone="purple"
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        ListEmptyComponent={
          <FeedState
            actionLabel="Actualiser"
            description={
              feedTab === 'following'
                ? "Le suivi d'utilisateurs n'est pas encore disponible."
                : feedTab === 'friends'
                  ? "Aucun fart public de tes amis pour le moment."
                  : "Les prochains farts publics apparaîtront ici."
            }
            onAction={() => void refreshFeed()}
            title={feedTab === 'following' ? 'Aucun abonnement' : 'Le feed est encore silencieux'}
          />
        }
        ListHeaderComponent={
          <>
            <View style={styles.liveBadge}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>PUBLIC</Text>
            </View>
            <SubmenuTabs
              activeTab={feedTab}
              onChange={setFeedTab}
              tabs={[
                { label: 'Pour toi', value: 'forYou' },
                { label: 'Following', value: 'following' },
                { label: 'Amis', value: 'friends' },
              ]}
            />
            {error ? (
              <Pressable onPress={() => void refreshFeed()} style={styles.errorBanner}>
                <Text numberOfLines={2} style={styles.errorText}>{error}</Text>
                <Text style={styles.retryText}>RÉESSAYER</Text>
              </Pressable>
            ) : null}
          </>
        }
        contentContainerStyle={styles.content}
        data={visibleEvents}
        keyExtractor={(event) => event.id}
        refreshControl={
          <RefreshControl
            colors={[colors.neonGreen]}
            onRefresh={() => void refreshFeed()}
            refreshing={isRefreshing}
            tintColor={colors.neonGreen}
          />
        }
        renderItem={({ item }) => (
          <FartFeedCard
            event={item}
            isReacting={reactingEventId === item.id}
            onCommentsPress={openComments}
            onOpenDetails={openDetails}
            onUserPress={openPublicProfile}
            onReact={react}
            onReplay={replayEvent}
          />
        )}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: colors.background,
    flex: 1,
  },
  content: {
    flexGrow: 1,
    padding: 16,
    paddingBottom: 36,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingTop: 4,
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
    fontWeight: '800',
    marginTop: 3,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 11,
    marginTop: 5,
  },
  liveBadge: {
    alignItems: 'center',
    borderColor: colors.neonCyan,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  liveDot: {
    backgroundColor: colors.neonCyan,
    borderRadius: 4,
    height: 6,
    width: 6,
  },
  liveText: {
    color: colors.neonCyan,
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1,
  },
  errorBanner: {
    alignItems: 'center',
    backgroundColor: '#FF4D6712',
    borderColor: colors.danger,
    borderRadius: 13,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
    marginBottom: 14,
    padding: 11,
  },
  errorText: {
    color: colors.textSecondary,
    flex: 1,
    fontSize: 10,
  },
  retryText: {
    color: colors.danger,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
});

export default HomeFeedScreen;

