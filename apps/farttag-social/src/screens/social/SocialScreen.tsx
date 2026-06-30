import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
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
import { ReactionBar } from '../../features/feed/components/ReactionBar';
import { useFeedStore } from '../../features/feed/feedStore';
import type { FartReactionType, PublicFartEvent } from '../../features/feed/types';
import { audioPlaybackService } from '../../features/history/audioPlaybackService';
import { useLeaderboardsStore } from '../../features/leaderboards/leaderboardsStore';
import type { LeaderboardEntry } from '../../features/leaderboards/types';
import { profileApi } from '../../features/profile/profileApi';
import type { UserProfile } from '../../features/profile/types';
import type { RankingScope } from '../../features/profile/types';
import { t, useLanguageStore } from '../../i18n/translations';
import type { RootStackParamList } from '../../navigation/types';
import { Dropdown, PaginationControls, ScreenTitle, SectionTitle, SurfaceCard } from '../../shared/components';
import { colors } from '../../theme/colors';

type SocialScreenProps = NativeStackScreenProps<RootStackParamList, 'SocialScreen'>;

const formatDate = (date: string) =>
  new Intl.DateTimeFormat(undefined, {
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    month: 'short',
  }).format(new Date(date));

const formatDayTitle = (date: string) =>
  new Intl.DateTimeFormat(undefined, {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date(date));

const formatRangeLabel = (start: Date, end: Date | null) => {
  const formatter = new Intl.DateTimeFormat(undefined, { day: '2-digit', month: 'short', year: 'numeric' });
  const endDate = end ?? start;
  const isSameDay =
    start.getFullYear() === endDate.getFullYear() &&
    start.getMonth() === endDate.getMonth() &&
    start.getDate() === endDate.getDate();
  return isSameDay ? formatter.format(start) : `${formatter.format(start)} - ${formatter.format(endDate)}`;
};

const getTodayDate = () => {
  const date = new Date();
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
};

const categoryColor = (category: string) => {
  const normalized = category.toLowerCase();
  if (normalized.includes('5') || normalized === 'mythic') return colors.neonGreen;
  if (normalized.includes('4') || normalized === 'legendary') return '#FF9D00';
  if (normalized.includes('3') || normalized === 'epic') return colors.neonPurple;
  if (normalized.includes('2') || normalized === 'rare') return colors.neonCyan;
  return colors.neonGreen;
};

type GroupedFeedEvents = {
  dateKey: string;
  title: string;
  events: PublicFartEvent[];
};

const feedPageSize = 2;
const leaderboardPageSize = 5;
const playButtonImage = require('../../assets/history/play.png');
const trophyImages: Record<number, number> = {
  1: require('../../assets/leaderboard/trophy-gold.png'),
  2: require('../../assets/leaderboard/trophy-silver.png'),
  3: require('../../assets/leaderboard/trophy-bronze.png'),
};

const rankingScopeOptions: Array<{ flag: string; label: string; value: RankingScope }> = [
  { flag: '\u{1F30D}', label: 'Mondial', value: 'world' },
  { flag: '\u{1F310}', label: 'Continent', value: 'continent' },
  { flag: '\u{1F1EB}\u{1F1F7}', label: 'Pays', value: 'country' },
  { flag: '\u{1F3D9}\uFE0F', label: 'Ville', value: 'city' },
];

type ScoreSort = 'dateDesc' | 'scoreDesc';

const scoreSortOptions: Array<{ label: string; value: ScoreSort }> = [
  { label: 'Recent', value: 'dateDesc' },
  { label: 'Score +', value: 'scoreDesc' },
];

export const SocialScreen = (_props: SocialScreenProps) => {
  useLanguageStore((state) => state.locale);
  const [feedPage, setFeedPage] = useState(0);
  const [leaderboardPage, setLeaderboardPage] = useState(0);
  const [rankingScope, setRankingScope] = useState<RankingScope>('world');
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(getTodayDate);
  const [calendarFilterEnabled, setCalendarFilterEnabled] = useState(true);
  const [selectedRangeEnd, setSelectedRangeEnd] = useState<Date | null>(getTodayDate);
  const [selectedRangeStart, setSelectedRangeStart] = useState<Date | null>(getTodayDate);
  const [expandedPlayerId, setExpandedPlayerId] = useState<string | null>(null);
  const [playerProfiles, setPlayerProfiles] = useState<Record<string, UserProfile>>({});
  const [loadingPlayerId, setLoadingPlayerId] = useState<string | null>(null);
  const [currentlyPlayingId, setCurrentlyPlayingId] = useState<string | null>(null);
  const [scoreSort, setScoreSort] = useState<ScoreSort>('dateDesc');
  const error = useFeedStore((state) => state.error);
  const events = useFeedStore((state) => state.events);
  const hasLoaded = useFeedStore((state) => state.hasLoaded);
  const isLoading = useFeedStore((state) => state.isLoading);
  const isRefreshing = useFeedStore((state) => state.isRefreshing);
  const reactingEventId = useFeedStore((state) => state.reactingEventId);
  const loadFeed = useFeedStore((state) => state.loadFeed);
  const reactToEvent = useFeedStore((state) => state.reactToEvent);
  const refreshFeed = useFeedStore((state) => state.refreshFeed);
  const leaderboardError = useLeaderboardsStore((state) => state.error);
  const globalLeaderboard = useLeaderboardsStore((state) => state.global);
  const hasLoadedLeaderboards = useLeaderboardsStore((state) => state.hasLoaded);
  const isLoadingLeaderboards = useLeaderboardsStore((state) => state.isLoading);
  const isRefreshingLeaderboards = useLeaderboardsStore((state) => state.isRefreshing);
  const loadLeaderboards = useLeaderboardsStore((state) => state.loadLeaderboards);
  const refreshLeaderboards = useLeaderboardsStore((state) => state.refreshLeaderboards);

  useEffect(() => {
    if (!hasLoaded && !isLoading) {
      void loadFeed();
    }
    if (!hasLoadedLeaderboards && !isLoadingLeaderboards) {
      void loadLeaderboards(rankingScope);
    }
  }, [hasLoaded, hasLoadedLeaderboards, isLoading, isLoadingLeaderboards, loadFeed, loadLeaderboards, rankingScope]);

  useEffect(() => {
    if (hasLoadedLeaderboards) {
      void loadLeaderboards(rankingScope);
    }
  }, [hasLoadedLeaderboards, loadLeaderboards, rankingScope]);

  const replay = async (event: PublicFartEvent) => {
    if (!event.audioReplayUrl) {
      return;
    }
    if (currentlyPlayingId === event.id) {
      audioPlaybackService.stop();
      setCurrentlyPlayingId(null);
      return;
    }
    setCurrentlyPlayingId(event.id);
    try {
      await audioPlaybackService.play(
        event.id,
        event.audioReplayUrl,
        () => setCurrentlyPlayingId(null),
        () => setCurrentlyPlayingId(null),
      );
    } catch {
      audioPlaybackService.stop();
      setCurrentlyPlayingId(null);
    }
  };

  const react = (eventId: string, reaction: FartReactionType) => {
    void reactToEvent(eventId, reaction);
  };

  const togglePlayerStats = async (entry: LeaderboardEntry) => {
    const userId = entry.userId ?? entry.id;
    if (expandedPlayerId === userId) {
      setExpandedPlayerId(null);
      return;
    }
    setExpandedPlayerId(userId);
    if (playerProfiles[userId]) {
      return;
    }
    setLoadingPlayerId(userId);
    try {
      const profile = await profileApi.getPublicProfile(userId);
      setPlayerProfiles((profiles) => ({ ...profiles, [userId]: profile }));
    } finally {
      setLoadingPlayerId(null);
    }
  };

  const filteredEvents = useMemo(() => (
    events
      .filter((event) => {
        const date = new Date(event.createdAt);
        if (!calendarFilterEnabled) {
          return true;
        }
        if (!selectedRangeStart) {
          return true;
        }
        const eventDay = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
        const rangeStart = new Date(
          selectedRangeStart.getFullYear(),
          selectedRangeStart.getMonth(),
          selectedRangeStart.getDate(),
        ).getTime();
        const rangeEndDate = selectedRangeEnd ?? selectedRangeStart;
        const rangeEnd = new Date(
          rangeEndDate.getFullYear(),
          rangeEndDate.getMonth(),
          rangeEndDate.getDate(),
        ).getTime();
        return eventDay >= rangeStart && eventDay <= rangeEnd;
      })
      .sort((left, right) => {
        if (scoreSort === 'scoreDesc') {
          return right.score - left.score;
        }
        return new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime();
      })
  ), [calendarFilterEnabled, events, scoreSort, selectedRangeEnd, selectedRangeStart]);

  const visibleFeedEvents = useMemo(() => {
    const start = feedPage * feedPageSize;
    return filteredEvents.slice(start, start + feedPageSize);
  }, [feedPage, filteredEvents]);

  const feedPageCount = Math.max(1, Math.ceil(filteredEvents.length / feedPageSize));

  const groupedEvents = useMemo<GroupedFeedEvents[]>(() => {

    const groups = new Map<string, GroupedFeedEvents>();
    visibleFeedEvents.forEach((event) => {
      const date = new Date(event.createdAt);
      const dateKey = date.toISOString().slice(0, 10);
      const existing = groups.get(dateKey);
      if (existing) {
        existing.events.push(event);
        return;
      }
      groups.set(dateKey, {
        dateKey,
        events: [event],
        title: formatDayTitle(event.createdAt),
      });
    });

    return Array.from(groups.values());
  }, [visibleFeedEvents]);

  const visibleLeaderboard = useMemo(() => {
    const start = leaderboardPage * leaderboardPageSize;
    return globalLeaderboard.slice(start, start + leaderboardPageSize);
  }, [globalLeaderboard, leaderboardPage]);

  const leaderboardPageCount = Math.max(1, Math.ceil(globalLeaderboard.length / leaderboardPageSize));

  useEffect(() => {
    setFeedPage(0);
  }, [calendarFilterEnabled, scoreSort, selectedRangeEnd, selectedRangeStart]);

  useEffect(() => {
    setLeaderboardPage(0);
  }, [rankingScope]);

  useEffect(() => {
    if (feedPage > feedPageCount - 1) {
      setFeedPage(Math.max(0, feedPageCount - 1));
    }
  }, [feedPage, feedPageCount]);

  useEffect(() => {
    if (leaderboardPage > leaderboardPageCount - 1) {
      setLeaderboardPage(Math.max(0, leaderboardPageCount - 1));
    }
  }, [leaderboardPage, leaderboardPageCount]);

  if (isLoading && events.length === 0) {
    return (
      <SafeAreaView edges={['left', 'right']} style={styles.safeArea}>
        <View style={styles.stateContent}>
          <ScreenTitle title={t('screens.social.title')} />
          <FeedState description={t('social.loading.description')} loading title={t('social.loading.title')} tone="purple" />
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
            onRefresh={() => void Promise.all([refreshFeed(), refreshLeaderboards(rankingScope)])}
            refreshing={isRefreshing || isRefreshingLeaderboards}
            tintColor={colors.neonGreen}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <ScreenTitle title={t('screens.social.title')} />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <SectionTitle title={t('profile.ranking')} />
        <SurfaceCard style={styles.playersRankingCard}>
          <Dropdown
            label={t('profile.ranking')}
            onChange={setRankingScope}
            options={rankingScopeOptions}
            value={rankingScope}
          />
          {isLoadingLeaderboards && globalLeaderboard.length === 0 ? (
            <ActivityIndicator color={colors.neonGreen} />
          ) : visibleLeaderboard.length > 0 ? (
            <>
              {visibleLeaderboard.map((entry) => (
                <PlayerRankingRow
                  entry={entry}
                  expanded={expandedPlayerId === (entry.userId ?? entry.id)}
                  key={entry.id}
                  loading={loadingPlayerId === (entry.userId ?? entry.id)}
                  onPress={(nextEntry) => void togglePlayerStats(nextEntry)}
                  profile={playerProfiles[entry.userId ?? entry.id]}
                />
              ))}
              {globalLeaderboard.length > leaderboardPageSize ? (
                <PaginationControls
                  currentPage={leaderboardPage}
                  onNext={() => setLeaderboardPage((page) => Math.min(leaderboardPageCount - 1, page + 1))}
                  onPrevious={() => setLeaderboardPage((page) => Math.max(0, page - 1))}
                  pageCount={leaderboardPageCount}
                />
              ) : null}
            </>
          ) : (
            <Text style={styles.emptyRankingText}>{leaderboardError ?? '--'}</Text>
          )}
        </SurfaceCard>

        {events.length > 0 ? (
          <>
            <SectionTitle title="Historique" />
            <Pressable
              onPress={() => setCalendarOpen((open) => !open)}
              style={[styles.calendarToggle, calendarFilterEnabled && styles.calendarToggleActive]}
            >
              <View>
                <Text style={styles.calendarToggleLabel}>Calendrier</Text>
                <Text style={styles.calendarToggleValue}>
                  {calendarFilterEnabled && selectedRangeStart
                    ? formatRangeLabel(selectedRangeStart, selectedRangeEnd)
                    : 'Tous les jours'}
                </Text>
              </View>
              <Text style={styles.calendarToggleIcon}>{calendarOpen ? '×' : '+'}</Text>
            </Pressable>
            {calendarOpen ? (
              <CalendarFilter
                enabled={calendarFilterEnabled}
                month={calendarMonth}
                onClear={() => {
                  setCalendarFilterEnabled(false);
                  setSelectedRangeEnd(null);
                  setSelectedRangeStart(null);
                  setCalendarOpen(false);
                }}
                onDaySelect={(nextDate) => {
                  setCalendarFilterEnabled(true);
                  if (!selectedRangeStart || selectedRangeEnd) {
                    setSelectedRangeStart(nextDate);
                    setSelectedRangeEnd(null);
                  } else if (nextDate.getTime() < selectedRangeStart.getTime()) {
                    setSelectedRangeEnd(selectedRangeStart);
                    setSelectedRangeStart(nextDate);
                  } else {
                    setSelectedRangeEnd(nextDate);
                  }
                  setCalendarMonth(new Date(nextDate.getFullYear(), nextDate.getMonth(), 1));
                }}
                onMonthChange={setCalendarMonth}
                rangeEnd={selectedRangeEnd}
                rangeStart={selectedRangeStart}
              />
            ) : null}
            <View style={styles.scoreSortBar}>
              {scoreSortOptions.map((option) => (
                <Pressable
                  key={option.value}
                  onPress={() => setScoreSort(option.value)}
                  style={[
                    styles.scoreSortButton,
                    scoreSort === option.value && styles.scoreSortButtonActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.scoreSortText,
                      scoreSort === option.value && styles.scoreSortTextActive,
                    ]}
                  >
                    {option.label}
                  </Text>
                </Pressable>
              ))}
            </View>
            {groupedEvents.length > 0 ? groupedEvents.map((group) => (
              <View key={group.dateKey} style={styles.dayGroup}>
                <Text style={styles.dayTitle}>{group.title}</Text>
                {group.events.map((event) => (
                  <PublicFeedCard
                    event={event}
                    isReacting={reactingEventId === event.id}
                    key={event.id}
                    onReact={react}
                    onReplay={() => void replay(event)}
                  />
                ))}
              </View>
            )) : (
              <FeedState
                actionLabel={t('common.update')}
                description={t('social.empty.description')}
                onAction={() => void refreshFeed()}
                title={t('social.empty.title')}
              />
            )}
            {filteredEvents.length > feedPageSize ? (
              <PaginationControls
                currentPage={feedPage}
                onNext={() => setFeedPage((page) => Math.min(feedPageCount - 1, page + 1))}
                onPrevious={() => setFeedPage((page) => Math.max(0, page - 1))}
                pageCount={feedPageCount}
              />
            ) : null}
          </>
        ) : (
          <FeedState
            actionLabel={t('common.update')}
            description={t('social.empty.description')}
            onAction={() => void refreshFeed()}
            title={t('social.empty.title')}
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
}) => {
  const accent = categoryColor(event.category);
  return (
  <View style={[styles.card, { borderColor: `${accent}77` }]}>
    <View style={styles.cardHeader}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{event.user.displayName.slice(0, 1).toUpperCase()}</Text>
      </View>
      <View style={styles.userCopy}>
        <Text numberOfLines={1} style={styles.username}>{event.user.displayName}</Text>
        <Text style={styles.date}>{formatDate(event.createdAt)}</Text>
      </View>
      <View style={styles.score}>
        <Text style={[styles.scoreValue, { color: accent }]}>{event.score}</Text>
        <Text style={styles.scoreLabel}>{t('common.score')}</Text>
      </View>
    </View>

    <View style={styles.metaRow}>
      <Text style={[styles.category, { color: accent }]}>{event.category.toUpperCase()}</Text>
      <Text style={styles.metric}>{(event.durationMs / 1_000).toFixed(1)} s</Text>
      <Text style={styles.metric}>{event.audioLevelDb.toFixed(1)} dB</Text>
    </View>

    <View style={styles.actions}>
      <ReactionBar
        disabled={isReacting}
        onReact={(reaction) => onReact(event.id, reaction)}
        reactions={event.reactions}
      />
      <Pressable disabled={!event.audioReplayUrl} onPress={onReplay} style={[styles.replayButton, { borderColor: accent }, !event.audioReplayUrl && styles.disabled]}>
        <Image source={playButtonImage} style={styles.replayImage} />
      </Pressable>
    </View>
  </View>
  );
};

const PlayerRankingRow = ({
  entry,
  expanded,
  loading,
  onPress,
  profile,
}: {
  entry: LeaderboardEntry;
  expanded: boolean;
  loading: boolean;
  onPress: (entry: LeaderboardEntry) => void;
  profile?: UserProfile;
}) => (
  <Pressable onPress={() => onPress(entry)} style={styles.playerRankingRow}>
    <View style={styles.playerRankingMain}>
      <View style={styles.playerRankBadge}>
        {trophyImages[entry.rank] ? (
          <Image source={trophyImages[entry.rank]} style={styles.trophyImage} />
        ) : (
          <Text style={styles.playerRank}>#{entry.rank}</Text>
        )}
      </View>
      <View style={styles.playerRankingIdentity}>
        <Text numberOfLines={1} style={styles.playerRankingName}>{entry.displayName}</Text>
        <Text numberOfLines={1} style={styles.playerRankingUsername}>@{entry.username}</Text>
      </View>
      <View style={styles.playerRankingStats}>
        <InlineMetric label={t('common.score')} value={`${entry.officialScore}`} />
        <InlineMetric label={t('common.duration')} value={entry.durationMs ? `${Math.round(entry.durationMs / 1000)}s` : '--'} />
        <InlineMetric label="Gaz" value={entry.gasLevel != null ? `${entry.gasLevel}` : '--'} />
      </View>
    </View>
    {expanded ? (
      <View style={styles.playerExpandedStats}>
        {loading ? (
          <ActivityIndicator color={colors.neonGreen} />
        ) : profile ? (
          <>
            <InlineMetric label="Niveau" value={`${profile.level}`} />
            <InlineMetric label="Pets" value={`${profile.globalStats.totalFarts}`} />
            <InlineMetric label="Best" value={`${profile.bestFart?.officialScore ?? '--'}`} />
          </>
        ) : (
          <Text style={styles.emptyRankingText}>Stats indisponibles</Text>
        )}
      </View>
    ) : null}
  </Pressable>
);

const CalendarFilter = ({
  enabled,
  month,
  onClear,
  onDaySelect,
  onMonthChange,
  rangeEnd,
  rangeStart,
}: {
  enabled: boolean;
  month: Date;
  onClear: () => void;
  onDaySelect: (date: Date) => void;
  onMonthChange: (month: Date) => void;
  rangeEnd: Date | null;
  rangeStart: Date | null;
}) => {
  const monthStart = new Date(month.getFullYear(), month.getMonth(), 1);
  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const leadingBlanks = (monthStart.getDay() + 6) % 7;
  const cells = [
    ...Array.from({ length: leadingBlanks }, (_, index) => ({ date: null, key: `blank-${index}`, label: '' })),
    ...Array.from({ length: daysInMonth }, (_, index) => {
      const day = index + 1;
      return {
        date: new Date(month.getFullYear(), month.getMonth(), day),
        key: `day-${day}`,
        label: String(day),
      };
    }),
  ];
  const monthLabel = new Intl.DateTimeFormat(undefined, { month: 'long', year: 'numeric' }).format(monthStart);

  const shiftMonth = (offset: number) => {
    onMonthChange(new Date(month.getFullYear(), month.getMonth() + offset, 1));
  };

  return (
    <SurfaceCard style={styles.calendarCard}>
      <View style={styles.calendarHeader}>
        <Pressable onPress={() => shiftMonth(-1)} style={styles.calendarNav}>
          <Text style={styles.calendarNavText}>‹</Text>
        </Pressable>
        <View style={styles.calendarTitleButton}>
          <Text style={styles.calendarTitle}>{monthLabel}</Text>
          <Text style={styles.calendarSubtitle}>{enabled ? 'Jour filtre' : 'Choisis un jour'}</Text>
        </View>
        <Pressable onPress={() => shiftMonth(1)} style={styles.calendarNav}>
          <Text style={styles.calendarNavText}>›</Text>
        </Pressable>
      </View>
      <View style={styles.calendarGrid}>
        {cells.map((cell) => (
          (() => {
            const cellTime = cell.date?.getTime() ?? null;
            const startTime = rangeStart?.getTime() ?? null;
            const endTime = (rangeEnd ?? rangeStart)?.getTime() ?? null;
            const isSelected = Boolean(cellTime && startTime && endTime && cellTime >= startTime && cellTime <= endTime);
            const isEdge = Boolean(cellTime && (cellTime === startTime || cellTime === endTime));
            return (
          <Pressable
            disabled={!cell.label}
            key={cell.key}
            onPress={() => cell.date && onDaySelect(cell.date)}
            style={[
              styles.calendarDay,
              isSelected ? styles.calendarDayActive : null,
              isEdge ? styles.calendarDayEdge : null,
            ]}
          >
            <Text style={[styles.calendarDayText, isSelected ? styles.calendarDayTextActive : null]}>
              {cell.label}
            </Text>
          </Pressable>
            );
          })()
        ))}
      </View>
      <Pressable onPress={onClear} style={styles.calendarAction}>
        <Text style={styles.calendarActionText}>{enabled ? 'Afficher tout' : 'Aucun filtre'}</Text>
      </Pressable>
    </SurfaceCard>
  );
};

const InlineMetric = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.inlineMetric}>
    <Text style={styles.inlineMetricLabel}>{label}</Text>
    <Text style={styles.inlineMetricValue}>{value}</Text>
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
  dayGroup: {
    marginBottom: 8,
  },
  dayTitle: {
    color: colors.neonCyan,
    fontSize: 12,
    fontWeight: '900',
    marginBottom: 8,
    marginTop: 8,
    textTransform: 'uppercase',
  },
  filters: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  filterItem: {
    flex: 1,
  },
  calendarToggle: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    minHeight: 54,
    paddingHorizontal: 12,
  },
  calendarToggleActive: {
    borderColor: colors.neonGreen,
  },
  calendarToggleLabel: {
    color: colors.textMuted,
    fontSize: 8,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  calendarToggleValue: {
    color: colors.textPrimary,
    fontSize: 12,
    fontWeight: '900',
    marginTop: 3,
    textTransform: 'uppercase',
  },
  calendarToggleIcon: {
    color: colors.neonGreen,
    fontSize: 24,
    fontWeight: '900',
  },
  calendarCard: {
    gap: 10,
    marginBottom: 12,
  },
  calendarHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  calendarNav: {
    alignItems: 'center',
    borderColor: colors.neonCyan,
    borderRadius: 14,
    borderWidth: 1,
    height: 34,
    justifyContent: 'center',
    width: 34,
  },
  calendarNavText: {
    color: colors.neonCyan,
    fontSize: 24,
    fontWeight: '900',
    lineHeight: 26,
  },
  calendarTitleButton: {
    alignItems: 'center',
    flex: 1,
  },
  calendarTitle: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  calendarSubtitle: {
    color: colors.textMuted,
    fontSize: 8,
    fontWeight: '900',
    marginTop: 2,
    textTransform: 'uppercase',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
  },
  calendarDay: {
    alignItems: 'center',
    backgroundColor: colors.surfaceElevated,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    height: 28,
    justifyContent: 'center',
    width: '13.3%',
  },
  calendarDayActive: {
    backgroundColor: `${colors.neonGreen}16`,
    borderColor: `${colors.neonGreen}88`,
  },
  calendarDayEdge: {
    backgroundColor: `${colors.neonGreen}30`,
    borderColor: colors.neonGreen,
  },
  calendarDayText: {
    color: colors.textSecondary,
    fontSize: 9,
    fontWeight: '800',
  },
  calendarDayTextActive: {
    color: colors.neonGreen,
  },
  calendarAction: {
    alignItems: 'center',
    borderColor: colors.neonGreen,
    borderRadius: 12,
    borderWidth: 1,
    minHeight: 34,
    justifyContent: 'center',
  },
  calendarActionText: {
    color: colors.neonGreen,
    fontSize: 8,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  scoreSortBar: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  scoreSortButton: {
    alignItems: 'center',
    borderColor: colors.border,
    borderRadius: 12,
    borderWidth: 1,
    flex: 1,
    minHeight: 34,
    justifyContent: 'center',
  },
  scoreSortButtonActive: {
    backgroundColor: `${colors.neonGreen}16`,
    borderColor: colors.neonGreen,
  },
  scoreSortText: {
    color: colors.textSecondary,
    fontSize: 8,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  scoreSortTextActive: {
    color: colors.neonGreen,
  },
  playersRankingCard: {
    gap: 8,
    marginBottom: 18,
    zIndex: 20,
  },
  playerRankingRow: {
    backgroundColor: colors.surfaceElevated,
    borderColor: colors.border,
    borderRadius: 12,
    borderWidth: 1,
    padding: 8,
  },
  playerRankingMain: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  playerRankBadge: {
    alignItems: 'center',
    height: 40,
    justifyContent: 'center',
    width: 44,
  },
  trophyImage: {
    height: 42,
    resizeMode: 'contain',
    width: 42,
  },
  playerRank: {
    color: colors.neonGreen,
    fontSize: 10,
    fontWeight: '900',
  },
  playerRankingIdentity: {
    flex: 1,
    minWidth: 0,
  },
  playerRankingName: {
    color: colors.textPrimary,
    fontSize: 11,
    fontWeight: '900',
  },
  playerRankingUsername: {
    color: colors.textSecondary,
    fontSize: 8,
    marginTop: 2,
  },
  playerRankingStats: {
    flexDirection: 'row',
    gap: 5,
    width: 168,
  },
  playerExpandedStats: {
    borderTopColor: colors.border,
    borderTopWidth: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 9,
    paddingTop: 9,
  },
  inlineMetric: {
    backgroundColor: colors.surface,
    borderRadius: 10,
    flex: 1,
    padding: 7,
  },
  inlineMetricLabel: {
    color: colors.textMuted,
    fontSize: 6,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  inlineMetricValue: {
    color: colors.textPrimary,
    fontSize: 8,
    fontWeight: '900',
    marginTop: 3,
  },
  emptyRankingText: {
    color: colors.textSecondary,
    fontSize: 10,
    fontWeight: '800',
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
    alignItems: 'center',
    borderColor: colors.neonGreen,
    borderRadius: 18,
    borderWidth: 1,
    height: 36,
    justifyContent: 'center',
    overflow: 'hidden',
    width: 36,
  },
  replayImage: {
    height: 24,
    resizeMode: 'contain',
    width: 24,
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
