import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useEffect, useMemo } from 'react';
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
import { HistoryEventCard } from '../../features/history/components/HistoryEventCard';
import { useHistoryStore } from '../../features/history/historyStore';
import type { FartHistoryEvent } from '../../features/history/types';
import { useNotificationStore } from '../../features/notifications/notificationStore';
import { ProfileStat } from '../../features/profile/components/ProfileStat';
import { useProfileStore } from '../../features/profile/profileStore';
import type { RootStackParamList } from '../../navigation/types';
import type { NotificationPreferences } from '../../services/notifications/NotificationService';
import { ScreenTitle, SectionTitle, SurfaceCard } from '../../shared/components';
import { colors } from '../../theme/colors';

type ProfileScreenProps = NativeStackScreenProps<RootStackParamList, 'ProfileScreen'>;
export type ProfileTab = 'badges' | 'history' | 'inventory' | 'profile' | 'settings';

const formatDuration = (durationMs: number) => {
  const totalSeconds = Math.round(durationMs / 1_000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return minutes > 0 ? `${minutes} min ${seconds}s` : `${seconds}s`;
};

export const ProfileScreen = ({ navigation }: ProfileScreenProps) => {
  const profileError = useProfileStore((state) => state.error);
  const hasLoadedProfile = useProfileStore((state) => state.hasLoaded);
  const isLoadingProfile = useProfileStore((state) => state.isLoading);
  const isRefreshingProfile = useProfileStore((state) => state.isRefreshing);
  const profile = useProfileStore((state) => state.profile);
  const loadProfile = useProfileStore((state) => state.loadProfile);
  const refreshProfile = useProfileStore((state) => state.refreshProfile);

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

  const notificationError = useNotificationStore((state) => state.error);
  const isRegistering = useNotificationStore((state) => state.isRegistering);
  const permissionStatus = useNotificationStore((state) => state.permissionStatus);
  const preferences = useNotificationStore((state) => state.preferences);
  const initializeNotifications = useNotificationStore((state) => state.initializeNotifications);
  const registerToken = useNotificationStore((state) => state.registerToken);
  const updatePreference = useNotificationStore((state) => state.updatePreference);

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

  const openHistoryEvent = (event: FartHistoryEvent) => {
    navigation.navigate('FartDetailsScreen', { fartEventId: event.id });
  };

  const logout = () => {
    setApiAccessToken(null);
  };

  if (isLoadingProfile && !profile) {
    return (
      <SafeAreaView edges={['left', 'right']} style={styles.safeArea}>
        <View style={styles.stateContent}>
          <ScreenTitle title="PROFIL" />
          <FeedState description="Chargement du joueur." loading title="Profil" tone="purple" />
        </View>
      </SafeAreaView>
    );
  }

  if (!profile) {
    return (
      <SafeAreaView edges={['left', 'right']} style={styles.safeArea}>
        <View style={styles.stateContent}>
          <ScreenTitle title="PROFIL" />
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
        <ScreenTitle title="PROFIL" />

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

        <SectionTitle title="Statistiques" />
        <View style={styles.stats}>
          <ProfileStat label="Nombre de pets" value={`${stats.totalFarts}`} />
          <ProfileStat label="Meilleur score" value={`${stats.bestScore}`} />
          <ProfileStat label="Score moyen" value={`${stats.averageScore}`} />
          <ProfileStat label="Temps total" value={formatDuration(stats.totalDurationMs)} />
          <ProfileStat label="Gaz total" value={`${Math.round(stats.totalGasLevel)}`} />
        </View>

        <SectionTitle title="Historique complet" />
        {isLoadingHistory && history.length === 0 ? (
          <SurfaceCard style={styles.loadingCard}>
            <ActivityIndicator color={colors.neonGreen} />
          </SurfaceCard>
        ) : history.length > 0 ? (
          history.map((event) => (
            <HistoryEventCard
              currentlyPlayingId={currentlyPlayingId}
              event={event}
              key={event.id}
              onOpen={openHistoryEvent}
              onReplay={(nextEvent) => void playAudio(nextEvent)}
              playbackStatus={playbackStatus}
            />
          ))
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

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: colors.background,
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 44,
    paddingTop: 0,
  },
  stateContent: {
    flex: 1,
    paddingHorizontal: 16,
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
  loadingCard: {
    alignItems: 'center',
    marginBottom: 16,
  },
  settingsCard: {
    gap: 2,
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
