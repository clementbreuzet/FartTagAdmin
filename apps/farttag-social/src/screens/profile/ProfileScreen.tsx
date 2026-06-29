import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { setApiAccessToken } from '../../api/apiClient';
import { FeedState } from '../../features/feed/components/FeedState';
import { useHistoryStore } from '../../features/history/historyStore';
import type { FartHistoryEvent } from '../../features/history/types';
import { languageOptions, t, useLanguageStore } from '../../i18n/translations';
import { useNotificationStore } from '../../features/notifications/notificationStore';
import { ProfileStat } from '../../features/profile/components/ProfileStat';
import { useProfileStore } from '../../features/profile/profileStore';
import type { RankingScope } from '../../features/profile/types';
import type { RootStackParamList } from '../../navigation/types';
import type { NotificationPreferences } from '../../services/notifications/NotificationService';
import { Dropdown, ScreenTitle, SectionTitle, SurfaceCard } from '../../shared/components';
import { colors } from '../../theme/colors';

type ProfileScreenProps = NativeStackScreenProps<RootStackParamList, 'ProfileScreen'>;
export type ProfileTab = 'badges' | 'history' | 'inventory' | 'profile' | 'settings';

const formatDuration = (durationMs: number) => {
  const totalSeconds = Math.round(durationMs / 1_000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return minutes > 0 ? `${minutes} min ${seconds}s` : `${seconds}s`;
};

const formatDate = (date: string) =>
  new Intl.DateTimeFormat(undefined, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date));

const categoryColor = (category: string) => {
  const normalized = category.toLowerCase();
  if (normalized.includes('5') || normalized === 'mythic') return colors.neonGreen;
  if (normalized.includes('4') || normalized === 'legendary') return '#FF9D00';
  if (normalized.includes('3') || normalized === 'epic') return colors.neonPurple;
  if (normalized.includes('2') || normalized === 'rare') return colors.neonCyan;
  return colors.neonGreen;
};

const collapsedHistoryLimit = 3;
const historyPageSize = 3;
const playButtonImage = require('../../assets/history/play-button.png');

const rankingScopeOptions: Array<{ flag: string; label: string; value: RankingScope }> = [
  { flag: '🌍', label: 'Mondial', value: 'world' },
  { flag: '🌐', label: 'Continent', value: 'continent' },
  { flag: '🇫🇷', label: 'Pays', value: 'country' },
  { flag: '🏙️', label: 'Ville', value: 'city' },
];

const rankingScopeLabels: Record<RankingScope, string> = {
  city: 'ville',
  continent: 'continent',
  country: 'pays',
  world: 'mondial',
};

export const ProfileScreen = (_props: ProfileScreenProps) => {
  const [expandedHistoryId, setExpandedHistoryId] = useState<string | null>(null);
  const [historyPage, setHistoryPage] = useState(0);

  const profileError = useProfileStore((state) => state.error);
  const hasLoadedProfile = useProfileStore((state) => state.hasLoaded);
  const isLoadingProfile = useProfileStore((state) => state.isLoading);
  const isRefreshingProfile = useProfileStore((state) => state.isRefreshing);
  const profile = useProfileStore((state) => state.profile);
  const rankingScope = useProfileStore((state) => state.rankingScope);
  const loadProfile = useProfileStore((state) => state.loadProfile);
  const refreshProfile = useProfileStore((state) => state.refreshProfile);
  const setRankingScope = useProfileStore((state) => state.setRankingScope);

  const historyError = useHistoryStore((state) => state.error);
  const history = useHistoryStore((state) => state.items);
  const hasLoadedHistory = useHistoryStore((state) => state.hasLoaded);
  const isLoadingHistory = useHistoryStore((state) => state.isLoading);
  const isRefreshingHistory = useHistoryStore((state) => state.isRefreshing);
  const currentlyPlayingId = useHistoryStore((state) => state.currentlyPlayingId);
  const playbackStatus = useHistoryStore((state) => state.playbackStatus);
  const loadHistory = useHistoryStore((state) => state.loadHistory);
  const playAudio = useHistoryStore((state) => state.playAudio);
  const refreshHistory = useHistoryStore((state) => state.refreshHistory);
  const toggleVisibility = useHistoryStore((state) => state.toggleVisibility);

  const notificationError = useNotificationStore((state) => state.error);
  const isRegistering = useNotificationStore((state) => state.isRegistering);
  const permissionStatus = useNotificationStore((state) => state.permissionStatus);
  const preferences = useNotificationStore((state) => state.preferences);
  const initializeNotifications = useNotificationStore((state) => state.initializeNotifications);
  const registerToken = useNotificationStore((state) => state.registerToken);
  const updatePreference = useNotificationStore((state) => state.updatePreference);
  const locale = useLanguageStore((state) => state.locale);
  const setLocale = useLanguageStore((state) => state.setLocale);

  useEffect(() => {
    if (!hasLoadedProfile) {
      void loadProfile();
    }
    if (!hasLoadedHistory) {
      void loadHistory();
    }
    void initializeNotifications();
  }, [hasLoadedHistory, hasLoadedProfile, initializeNotifications, loadHistory, loadProfile]);

  const stats = useMemo(() => {
    if (profile?.stats) {
      return profile.stats;
    }
    const totalFarts = profile?.globalStats.totalFarts ?? 0;
    return {
      averageScore: profile?.globalStats.averageOfficialScore ?? 0,
      bestScore: profile?.bestFart?.officialScore ?? 0,
      totalDurationMs: history.reduce((total, event) => total + event.durationMs, 0),
      totalFarts,
      totalGasLevel: history.reduce((total, event) => total + event.gasLevel, 0),
    };
  }, [history, profile]);

  const refreshAll = async () => {
    await Promise.all([refreshProfile(), refreshHistory()]);
  };

  const visibleHistory = useMemo(() => {
    const start = historyPage * historyPageSize;
    return history.slice(start, start + historyPageSize);
  }, [history, historyPage]);

  const historyPageCount = Math.max(1, Math.ceil(history.length / historyPageSize));
  const rankingUserCount = profile?.rankings?.userCount;
  const rankingScopeLabel = rankingScopeLabels[profile?.rankings?.scope ?? rankingScope];

  useEffect(() => {
    if (historyPage > historyPageCount - 1) {
      setHistoryPage(Math.max(0, historyPageCount - 1));
    }
  }, [historyPage, historyPageCount]);

  const toggleHistoryDetails = (event: FartHistoryEvent) => {
    setExpandedHistoryId((current) => current === event.id ? null : event.id);
  };

  const logout = () => {
    setApiAccessToken(null);
  };

  if (isLoadingProfile && !profile) {
    return (
      <SafeAreaView edges={['left', 'right']} style={styles.safeArea}>
        <View style={styles.stateContent}>
          <ScreenTitle title={t('screens.profile.title')} />
          <FeedState description="Chargement du joueur." loading title="Profil" tone="purple" />
        </View>
      </SafeAreaView>
    );
  }

  if (!profile) {
    return (
      <SafeAreaView edges={['left', 'right']} style={styles.safeArea}>
        <View style={styles.stateContent}>
          <ScreenTitle title={t('screens.profile.title')} />
          <FeedState
            actionLabel="Reessayer"
            description={profileError ?? 'Profil indisponible.'}
            onAction={() => void loadProfile()}
            title="Profil indisponible"
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
            onRefresh={() => void refreshAll()}
            refreshing={isRefreshingProfile || isRefreshingHistory}
            tintColor={colors.neonGreen}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <ScreenTitle title={t('screens.profile.title')} />

        <SurfaceCard accent="cyan" style={styles.identityCard}>
          <View style={styles.identityRow}>
            <View style={styles.avatarFrame}>
              {profile.avatarUrl ? (
                <Image source={{ uri: profile.avatarUrl }} style={styles.avatar} />
              ) : (
                <Text style={styles.avatarInitials}>{profile.displayName.slice(0, 2).toUpperCase()}</Text>
              )}
            </View>
            <View style={styles.identityCopy}>
              <Text style={styles.displayName}>{profile.displayName}</Text>
              <Text style={styles.username}>@{profile.username}</Text>
              <View style={styles.levelRow}>
                <Text style={styles.level}>NIVEAU {profile.level}</Text>
                <Text style={styles.xp}>{profile.xp ?? 0} XP</Text>
              </View>
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${profile.levelProgressPercent}%` }]} />
              </View>
            </View>
          </View>
        </SurfaceCard>

        <View style={styles.sectionHeader}>
          <SectionTitle title="Statistiques" />
          <Text style={styles.locationLabel}>
            {profile.location ? `${profile.location.continent} / ${profile.location.country} / ${profile.location.city}` : ''}
          </Text>
        </View>
        <SurfaceCard style={styles.rankingFilterCard}>
          <Dropdown
            label="Classement"
            onChange={(scope) => void setRankingScope(scope)}
            options={rankingScopeOptions}
            value={rankingScope}
          />
        </SurfaceCard>
        <View style={styles.stats}>
          <ProfileStat
            label="Nombre de pets"
            ranking={profile.rankings?.totalFarts}
            rankingScopeLabel={rankingScopeLabel}
            rankingUserCount={rankingUserCount}
            value={`${stats.totalFarts}`}
          />
          <ProfileStat
            label="Meilleur score"
            ranking={profile.rankings?.bestScore}
            rankingScopeLabel={rankingScopeLabel}
            rankingUserCount={rankingUserCount}
            value={`${stats.bestScore}`}
          />
          <ProfileStat
            label="Score moyen"
            ranking={profile.rankings?.averageScore}
            rankingScopeLabel={rankingScopeLabel}
            rankingUserCount={rankingUserCount}
            value={`${stats.averageScore}`}
          />
          <ProfileStat
            label="Temps total"
            ranking={profile.rankings?.totalDurationMs}
            rankingScopeLabel={rankingScopeLabel}
            rankingUserCount={rankingUserCount}
            value={formatDuration(stats.totalDurationMs)}
          />
          <ProfileStat
            label="Gaz total"
            ranking={profile.rankings?.totalGasLevel}
            rankingScopeLabel={rankingScopeLabel}
            rankingUserCount={rankingUserCount}
            value={`${Math.round(stats.totalGasLevel)}`}
          />
        </View>

        <SectionTitle title="Historique complet" />
        {isLoadingHistory && history.length === 0 ? (
          <SurfaceCard style={styles.loadingCard}>
            <ActivityIndicator color={colors.neonGreen} />
          </SurfaceCard>
        ) : history.length > 0 ? (
          <View style={styles.historyList}>
            {visibleHistory.map((event) => (
              <ProfileHistoryRow
                currentlyPlayingId={currentlyPlayingId}
                event={event}
                expanded={expandedHistoryId === event.id}
                key={event.id}
                onPress={toggleHistoryDetails}
                onReplay={(nextEvent) => void playAudio(nextEvent)}
                onToggleVisibility={(nextEvent) => void toggleVisibility(nextEvent)}
                playbackStatus={playbackStatus}
              />
            ))}
            {history.length > collapsedHistoryLimit ? (
              <View style={styles.pagination}>
                <Pressable
                  disabled={historyPage === 0}
                  onPress={() => setHistoryPage((page) => Math.max(0, page - 1))}
                  style={[styles.pageButton, historyPage === 0 && styles.pageButtonDisabled]}
                >
                  <Text style={styles.pageButtonText}>PRECEDENT</Text>
                </Pressable>
                <Text style={styles.pageLabel}>{historyPage + 1} / {historyPageCount}</Text>
                <Pressable
                  disabled={historyPage >= historyPageCount - 1}
                  onPress={() => setHistoryPage((page) => Math.min(historyPageCount - 1, page + 1))}
                  style={[styles.pageButton, historyPage >= historyPageCount - 1 && styles.pageButtonDisabled]}
                >
                  <Text style={styles.pageButtonText}>SUIVANT</Text>
                </Pressable>
              </View>
            ) : null}
          </View>
        ) : (
          <FeedState
            actionLabel="Actualiser"
            description="Tes pets detectes apparaitront ici."
            onAction={() => void refreshHistory()}
            title="Historique vide"
          />
        )}

        <SectionTitle title="Parametres" />
        <SurfaceCard style={styles.settingsCard}>
          <SettingToggle
            label="Notifications"
            onValueChange={(enabled) => void updatePreference('dailyReminderEnabled', enabled)}
            value={preferences.dailyReminderEnabled}
          />
          <SettingToggle
            label="Recompenses"
            onValueChange={(enabled) => void updatePreference('rewardsEnabled', enabled)}
            value={preferences.rewardsEnabled}
          />
          <View style={styles.settingRow}>
            <View style={styles.settingCopy}>
              <Text style={styles.settingLabel}>Token push</Text>
              <Text style={styles.settingValue}>
                {profile.notifications?.hasActivePushToken || permissionStatus === 'granted'
                  ? 'Notifications actives'
                  : 'Non configure'}
              </Text>
            </View>
            <Pressable disabled={isRegistering} onPress={() => void registerToken()} style={styles.smallButton}>
              {isRegistering ? <ActivityIndicator color={colors.neonGreen} size="small" /> : <Text style={styles.smallButtonText}>ACTIVER</Text>}
            </Pressable>
          </View>
          <View style={styles.settingRow}>
            <View style={styles.settingCopy}>
              <Text style={styles.settingLabel}>Appareil connecte</Text>
              <Text style={styles.settingValue}>
                {profile.connectedDevice
                  ? `${profile.connectedDevice.name} - ${profile.connectedDevice.model}`
                  : 'Aucun appareil rattache'}
              </Text>
            </View>
          </View>
          <Pressable onPress={logout} style={styles.logoutButton}>
            <Text style={styles.logoutText}>DECONNEXION</Text>
          </Pressable>
        </SurfaceCard>

        <SurfaceCard style={styles.languageCard}>
          <Dropdown
            label="Langue"
            onChange={setLocale}
            options={languageOptions}
            value={locale}
          />
        </SurfaceCard>

        {profileError || historyError || notificationError ? (
          <Text style={styles.error}>{profileError ?? historyError ?? notificationError}</Text>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
};

const SettingToggle = ({
  label,
  onValueChange,
  value,
}: {
  label: string;
  onValueChange: (enabled: boolean) => void;
  value: boolean;
}) => (
  <View style={styles.settingRow}>
    <View style={styles.settingCopy}>
      <Text style={styles.settingLabel}>{label}</Text>
      <Text style={styles.settingValue}>{value ? 'Active' : 'Desactive'}</Text>
    </View>
    <Switch
      onValueChange={onValueChange}
      thumbColor={value ? colors.neonGreen : colors.textMuted}
      trackColor={{ false: colors.border, true: '#9CFF0044' }}
      value={value}
    />
  </View>
);

const ProfileHistoryRow = ({
  currentlyPlayingId,
  event,
  expanded,
  onPress,
  onReplay,
  onToggleVisibility,
  playbackStatus,
}: {
  currentlyPlayingId: string | null;
  event: FartHistoryEvent;
  expanded: boolean;
  onPress: (event: FartHistoryEvent) => void;
  onReplay: (event: FartHistoryEvent) => void;
  onToggleVisibility: (event: FartHistoryEvent) => void;
  playbackStatus: string;
}) => {
  const accent = categoryColor(event.category);
  const isPlaying = currentlyPlayingId === event.id && playbackStatus === 'playing';
  return (
    <View style={[styles.historyRow, { borderColor: `${accent}55` }]}>
      <View style={styles.historyRowMain}>
        <Pressable
          onPress={() => onToggleVisibility(event)}
          style={[
            styles.visibilityButton,
            { borderColor: event.visibility === 'public' ? colors.neonCyan : colors.textMuted },
          ]}
        >
          <Text
            style={[
              styles.visibilityText,
              { color: event.visibility === 'public' ? colors.neonCyan : colors.textMuted },
            ]}
          >
            {event.visibility.toUpperCase()}
          </Text>
        </Pressable>
        <Pressable onPress={() => onPress(event)} style={styles.historyRowTap}>
          <View style={styles.historyRowCopy}>
            <Text style={[styles.historyCategory, { color: accent }]}>{event.category.toUpperCase()}</Text>
            <Text style={styles.historyDate}>{formatDate(event.occurredAt)}</Text>
          </View>
          <View style={styles.historyScore}>
            <Text style={styles.historyScoreLabel}>SCORE</Text>
            <Text style={styles.historyScoreValue}>{event.officialScore}</Text>
          </View>
        </Pressable>
      </View>

      {expanded ? (
        <View style={styles.historyDetails}>
          <View style={styles.historyMetrics}>
            <InlineMetric label="Duree" value={formatDuration(event.durationMs)} />
            <InlineMetric label="Audio" value={`${event.audioLevel.toFixed(1)} dB`} />
            <InlineMetric label="Gaz" value={`${event.gasLevel.toFixed(1)} kOhm`} />
          </View>
          <View style={styles.historyDetailFooter}>
            <Text style={styles.historyAuth}>{event.isAuthenticated ? 'Authentifie' : 'Non authentifie'}</Text>
            <Pressable
              disabled={!event.audioReplayUrl && !event.audioFileId}
              onPress={() => onReplay(event)}
              style={[styles.playButton, (!event.audioReplayUrl && !event.audioFileId) && styles.pageButtonDisabled]}
            >
              <Image source={playButtonImage} style={[styles.playButtonImage, isPlaying && styles.playButtonActive]} />
            </Pressable>
          </View>
        </View>
      ) : null}
    </View>
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
  identityCard: {
    marginBottom: 20,
  },
  identityRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 14,
  },
  avatarFrame: {
    alignItems: 'center',
    backgroundColor: colors.surfaceElevated,
    borderColor: colors.neonCyan,
    borderRadius: 42,
    borderWidth: 2,
    height: 84,
    justifyContent: 'center',
    width: 84,
  },
  avatar: {
    borderRadius: 38,
    height: 76,
    width: 76,
  },
  avatarInitials: {
    color: colors.neonCyan,
    fontSize: 24,
    fontWeight: '900',
  },
  identityCopy: {
    flex: 1,
  },
  displayName: {
    color: colors.textPrimary,
    fontSize: 22,
    fontWeight: '900',
  },
  username: {
    color: colors.textSecondary,
    fontSize: 11,
    marginTop: 3,
  },
  levelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  level: {
    color: colors.neonGreen,
    fontSize: 9,
    fontWeight: '900',
  },
  xp: {
    color: colors.textMuted,
    fontSize: 9,
    fontWeight: '900',
  },
  progressTrack: {
    backgroundColor: colors.border,
    borderRadius: 5,
    height: 8,
    marginTop: 7,
    overflow: 'hidden',
  },
  progressFill: {
    backgroundColor: colors.neonGreen,
    height: '100%',
  },
  stats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 9,
    marginBottom: 22,
  },
  sectionHeader: {
    marginBottom: 8,
  },
  locationLabel: {
    color: colors.textSecondary,
    fontSize: 9,
    fontWeight: '800',
    marginTop: -8,
    textTransform: 'uppercase',
  },
  rankingFilterCard: {
    marginBottom: 12,
  },
  loadingCard: {
    alignItems: 'center',
    marginBottom: 16,
  },
  historyList: {
    gap: 8,
    marginBottom: 20,
  },
  historyRow: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
    padding: 11,
  },
  historyRowMain: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    minHeight: 42,
  },
  historyRowTap: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
  },
  visibilityButton: {
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 30,
    width: 72,
  },
  visibilityText: {
    fontSize: 8,
    fontWeight: '900',
  },
  historyRowCopy: {
    flex: 1,
  },
  historyCategory: {
    fontSize: 10,
    fontWeight: '900',
  },
  historyDate: {
    color: colors.textSecondary,
    fontSize: 9,
    marginTop: 4,
  },
  historyScore: {
    alignItems: 'flex-end',
    minWidth: 54,
  },
  historyScoreLabel: {
    color: colors.textMuted,
    fontSize: 7,
    fontWeight: '900',
  },
  historyScoreValue: {
    color: colors.neonGreen,
    fontSize: 22,
    fontWeight: '900',
  },
  historyDetails: {
    borderTopColor: colors.border,
    borderTopWidth: 1,
    marginTop: 10,
    paddingTop: 10,
  },
  historyMetrics: {
    flexDirection: 'row',
    gap: 8,
  },
  inlineMetric: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: 10,
    flex: 1,
    padding: 8,
  },
  inlineMetricLabel: {
    color: colors.textMuted,
    fontSize: 7,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  inlineMetricValue: {
    color: colors.textPrimary,
    fontSize: 9,
    fontWeight: '900',
    marginTop: 4,
  },
  historyDetailFooter: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  historyAuth: {
    color: colors.textSecondary,
    fontSize: 9,
    fontWeight: '800',
  },
  playButton: {
    alignItems: 'center',
    borderColor: colors.neonCyan,
    borderRadius: 21,
    borderWidth: 1,
    height: 42,
    width: 42,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  playButtonActive: {
    opacity: 0.55,
  },
  playButtonImage: {
    height: 42,
    resizeMode: 'cover',
    width: 42,
  },
  pagination: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'space-between',
    marginTop: 4,
  },
  pageButton: {
    alignItems: 'center',
    borderColor: colors.neonCyan,
    borderRadius: 10,
    borderWidth: 1,
    flex: 1,
    minHeight: 34,
    justifyContent: 'center',
  },
  pageButtonDisabled: {
    opacity: 0.38,
  },
  pageButtonText: {
    color: colors.neonCyan,
    fontSize: 8,
    fontWeight: '900',
  },
  pageLabel: {
    color: colors.textPrimary,
    fontSize: 10,
    fontWeight: '900',
    minWidth: 46,
    textAlign: 'center',
  },
  settingsCard: {
    gap: 2,
  },
  languageCard: {
    marginTop: 14,
  },
  settingRow: {
    alignItems: 'center',
    borderBottomColor: colors.border,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    minHeight: 54,
    paddingVertical: 8,
  },
  settingCopy: {
    flex: 1,
  },
  settingLabel: {
    color: colors.textPrimary,
    fontSize: 11,
    fontWeight: '900',
  },
  settingValue: {
    color: colors.textSecondary,
    fontSize: 9,
    marginTop: 3,
  },
  smallButton: {
    alignItems: 'center',
    borderColor: colors.neonGreen,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 34,
    minWidth: 82,
  },
  smallButtonText: {
    color: colors.neonGreen,
    fontSize: 8,
    fontWeight: '900',
  },
  logoutButton: {
    alignItems: 'center',
    borderColor: colors.danger,
    borderRadius: 14,
    borderWidth: 1,
    marginTop: 14,
    minHeight: 44,
    justifyContent: 'center',
  },
  logoutText: {
    color: colors.danger,
    fontSize: 9,
    fontWeight: '900',
  },
  error: {
    color: colors.danger,
    fontSize: 10,
    marginTop: 12,
    textAlign: 'center',
  },
});

export default ProfileScreen;
