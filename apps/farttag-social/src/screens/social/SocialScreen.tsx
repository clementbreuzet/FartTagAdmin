import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useEffect } from 'react';
import {
  Linking,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FeedState } from '../../features/feed/components/FeedState';
import { ReactionBar } from '../../features/feed/components/ReactionBar';
import { useFeedStore } from '../../features/feed/feedStore';
import type { FartReactionType, PublicFartEvent } from '../../features/feed/types';
import { t } from '../../i18n/translations';
import type { RootStackParamList } from '../../navigation/types';
import { ScreenTitle } from '../../shared/components';
import { colors } from '../../theme/colors';

type SocialScreenProps = NativeStackScreenProps<RootStackParamList, 'SocialScreen'>;

const formatDate = (date: string) =>
  new Intl.DateTimeFormat(undefined, {
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    month: 'short',
  }).format(new Date(date));

export const SocialScreen = (_props: SocialScreenProps) => {
  const error = useFeedStore((state) => state.error);
  const events = useFeedStore((state) => state.events);
  const hasLoaded = useFeedStore((state) => state.hasLoaded);
  const isLoading = useFeedStore((state) => state.isLoading);
  const isRefreshing = useFeedStore((state) => state.isRefreshing);
  const reactingEventId = useFeedStore((state) => state.reactingEventId);
  const loadFeed = useFeedStore((state) => state.loadFeed);
  const reactToEvent = useFeedStore((state) => state.reactToEvent);
  const refreshFeed = useFeedStore((state) => state.refreshFeed);

  useEffect(() => {
    if (!hasLoaded && !isLoading) {
      void loadFeed();
    }
  }, [hasLoaded, isLoading, loadFeed]);

  const replay = async (event: PublicFartEvent) => {
    if (!event.audioReplayUrl) {
      return;
    }
    await Linking.openURL(event.audioReplayUrl);
  };

  const react = (eventId: string, reaction: FartReactionType) => {
    void reactToEvent(eventId, reaction);
  };

  if (isLoading && events.length === 0) {
    return (
      <SafeAreaView edges={['left', 'right']} style={styles.safeArea}>
        <View style={styles.stateContent}>
          <ScreenTitle title={t('screens.social.title')} />
          <FeedState description="Chargement du feed public." loading title="Feed public" tone="purple" />
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
            onRefresh={() => void refreshFeed()}
            refreshing={isRefreshing}
            tintColor={colors.neonGreen}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <ScreenTitle title={t('screens.social.title')} />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        {events.length > 0 ? (
          events.map((event) => (
            <PublicFeedCard
              event={event}
              isReacting={reactingEventId === event.id}
              key={event.id}
              onReact={react}
              onReplay={() => void replay(event)}
            />
          ))
        ) : (
          <FeedState
            actionLabel="Actualiser"
            description="Les pets publics apparaitront ici."
            onAction={() => void refreshFeed()}
            title="Feed vide"
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const PublicFeedCard = ({
  event,
  isReacting,
  onReact,
  onReplay,
}: {
  event: PublicFartEvent;
  isReacting: boolean;
  onReact: (eventId: string, reaction: FartReactionType) => void;
  onReplay: () => void;
}) => (
  <View style={styles.card}>
    <View style={styles.cardHeader}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{event.user.displayName.slice(0, 1).toUpperCase()}</Text>
      </View>
      <View style={styles.userCopy}>
        <Text numberOfLines={1} style={styles.username}>{event.user.displayName}</Text>
        <Text style={styles.date}>{formatDate(event.createdAt)}</Text>
      </View>
      <View style={styles.score}>
        <Text style={styles.scoreValue}>{event.score}</Text>
        <Text style={styles.scoreLabel}>SCORE</Text>
      </View>
    </View>

    <View style={styles.metaRow}>
      <Text style={styles.category}>{event.category.toUpperCase()}</Text>
      <Text style={styles.metric}>{(event.durationMs / 1_000).toFixed(1)} s</Text>
      <Text style={styles.metric}>{event.audioLevelDb.toFixed(1)} dB</Text>
    </View>

    <View style={styles.actions}>
      <ReactionBar
        disabled={isReacting}
        onReact={(reaction) => onReact(event.id, reaction)}
        reactions={event.reactions}
      />
      <Pressable disabled={!event.audioReplayUrl} onPress={onReplay} style={[styles.replayButton, !event.audioReplayUrl && styles.disabled]}>
        <Text style={styles.replayText}>REECOUTER</Text>
      </Pressable>
    </View>
  </View>
);

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: colors.background,
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 44,
  },
  stateContent: {
    flex: 1,
    padding: 16,
  },
  error: {
    color: colors.danger,
    fontSize: 10,
    marginBottom: 10,
    textAlign: 'center',
  },
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: 12,
    padding: 14,
  },
  cardHeader: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  avatar: {
    alignItems: 'center',
    backgroundColor: colors.surfaceElevated,
    borderColor: colors.neonGreen,
    borderRadius: 18,
    borderWidth: 1,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  avatarText: {
    color: colors.neonGreen,
    fontSize: 14,
    fontWeight: '900',
  },
  userCopy: {
    flex: 1,
    marginHorizontal: 10,
  },
  username: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '900',
  },
  date: {
    color: colors.textMuted,
    fontSize: 10,
    marginTop: 3,
  },
  score: {
    alignItems: 'flex-end',
  },
  scoreValue: {
    color: colors.neonGreen,
    fontSize: 25,
    fontWeight: '900',
  },
  scoreLabel: {
    color: colors.textMuted,
    fontSize: 7,
    fontWeight: '900',
  },
  metaRow: {
    borderTopColor: colors.border,
    borderTopWidth: 1,
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
    paddingTop: 12,
  },
  category: {
    color: colors.neonCyan,
    flex: 1,
    fontSize: 10,
    fontWeight: '900',
  },
  metric: {
    color: colors.textSecondary,
    fontSize: 10,
    fontWeight: '800',
  },
  actions: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 13,
  },
  replayButton: {
    borderColor: colors.neonPurple,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  replayText: {
    color: colors.neonPurple,
    fontSize: 8,
    fontWeight: '900',
  },
  disabled: {
    opacity: 0.4,
  },
});

export default SocialScreen;
