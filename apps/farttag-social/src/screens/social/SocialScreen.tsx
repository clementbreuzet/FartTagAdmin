import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useEffect, useMemo } from 'react';
import {
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FeedState } from '../../features/feed/components/FeedState';
import { FriendRequestCard } from '../../features/friends/components/FriendRequestCard';
import { selectFilteredFriends, useFriendsStore } from '../../features/friends/friendsStore';
import type { FriendCard as FriendModel } from '../../features/friends/types';
import { LeaderboardModeBar } from '../../features/leaderboards/components/LeaderboardModeBar';
import { LeaderboardRow } from '../../features/leaderboards/components/LeaderboardRow';
import {
  selectVisibleLeaderboard,
  useLeaderboardsStore,
} from '../../features/leaderboards/leaderboardsStore';
import type { LeaderboardEntry } from '../../features/leaderboards/types';
import { ActivityCard } from '../../features/social/components/ActivityCard';
import { AddFriendCard } from '../../features/social/components/AddFriendCard';
import {
  FriendCard,
  type FriendSocialStats,
} from '../../features/social/components/FriendCard';
import { TopFriendsCarousel } from '../../features/social/components/TopFriendsCarousel';
import type { RootStackParamList } from '../../navigation/types';
import { ScreenTitle } from '../../shared/components';
import { colors } from '../../theme/colors';

type SocialScreenProps = NativeStackScreenProps<RootStackParamList, 'SocialScreen'>;

const statsForFriend = (friend: FriendModel, index: number): FriendSocialStats => {
  const seed = friend.displayName.length + friend.username.length + index * 7;
  return {
    badges: 18 + (seed % 19),
    bestDb: 88 + (seed % 18),
    collectionPercent: 54 + (seed % 39),
    fartCount: 72 + seed * 4,
    flatulons: 640 + seed * 23,
    rareItems: 8 + (seed % 17),
  };
};

export const SocialScreen = ({ navigation }: SocialScreenProps) => {
  const error = useFriendsStore((state) => state.error);
  const friends = useFriendsStore((state) => state.friends);
  const friendsHaveLoaded = useFriendsStore((state) => state.hasLoaded);
  const incomingRequests = useFriendsStore((state) => state.incomingRequests);
  const outgoingRequests = useFriendsStore((state) => state.outgoingRequests);
  const isAcceptingRequestId = useFriendsStore((state) => state.isAcceptingRequestId);
  const isAddingFriend = useFriendsStore((state) => state.isAddingFriend);
  const isDecliningRequestId = useFriendsStore((state) => state.isDecliningRequestId);
  const isLoading = useFriendsStore((state) => state.isLoading);
  const isRefreshingFriends = useFriendsStore((state) => state.isRefreshing);
  const query = useFriendsStore((state) => state.query);
  const acceptRequest = useFriendsStore((state) => state.acceptRequest);
  const addFriend = useFriendsStore((state) => state.addFriend);
  const declineRequest = useFriendsStore((state) => state.declineRequest);
  const loadFriends = useFriendsStore((state) => state.loadFriends);
  const refreshFriends = useFriendsStore((state) => state.refreshFriends);
  const removeFriend = useFriendsStore((state) => state.removeFriend);
  const setQuery = useFriendsStore((state) => state.setQuery);

  const activeMode = useLeaderboardsStore((state) => state.activeMode);
  const leaderboardFriends = useLeaderboardsStore((state) => state.friends);
  const globalLeaderboard = useLeaderboardsStore((state) => state.global);
  const leaderboardsHaveLoaded = useLeaderboardsStore((state) => state.hasLoaded);
  const isRefreshingLeaderboards = useLeaderboardsStore((state) => state.isRefreshing);
  const longest = useLeaderboardsStore((state) => state.longest);
  const mostToxic = useLeaderboardsStore((state) => state.mostToxic);
  const week = useLeaderboardsStore((state) => state.week);
  const loadLeaderboards = useLeaderboardsStore((state) => state.loadLeaderboards);
  const refreshLeaderboards = useLeaderboardsStore((state) => state.refreshLeaderboards);
  const setMode = useLeaderboardsStore((state) => state.setMode);

  useEffect(() => {
    if (!leaderboardsHaveLoaded) {
      void loadLeaderboards();
    }
    if (!friendsHaveLoaded) {
      void loadFriends();
    }
  }, [friendsHaveLoaded, leaderboardsHaveLoaded, loadFriends, loadLeaderboards]);

  const filteredFriends = useMemo(
    () => selectFilteredFriends(useFriendsStore.getState()),
    [friends, query],
  );
  const topFriends = leaderboardFriends.length > 0 ? leaderboardFriends : globalLeaderboard;
  const visibleLeaderboard = useMemo(
    () => selectVisibleLeaderboard(useLeaderboardsStore.getState()),
    [activeMode, globalLeaderboard, leaderboardFriends, longest, mostToxic, week],
  );
  const onlineCount = Math.min(friends.length, Math.max(0, Math.ceil(friends.length * 0.4)));
  const activeChallenges = Math.max(1, incomingRequests.length + 1);
  const isRefreshing = isRefreshingFriends || isRefreshingLeaderboards;

  const activities = useMemo(() => {
    const people = [...friends];
    const first = people[0];
    const second = people[1] ?? first;
    const top = topFriends[0];

    return [
      {
        avatarUrl: first?.avatarUrl ?? null,
        detail: '104 dB',
        displayName: first?.displayName ?? 'Hugo Pulse',
        eyebrow: 'a battu son record',
        rarity: first?.badgeRarity ?? 'mythic',
        reward: '+120 Flatulons',
      },
      {
        avatarUrl: second?.avatarUrl ?? null,
        detail: 'Gaz Noble',
        displayName: second?.displayName ?? 'Lucas Volt',
        eyebrow: 'a débloqué',
        rarity: second?.badgeRarity ?? 'epic',
      },
      {
        avatarUrl: top?.avatarUrl ?? null,
        detail: 'Top 100',
        displayName: top?.displayName ?? 'Max Sonic',
        eyebrow: 'vient d’entrer dans le',
        rarity: top?.badgeRarity ?? 'legendary',
      },
    ] as const;
  }, [friends, topFriends]);

  const openProfile = (friend: FriendModel) => {
    navigation.navigate('PublicUserProfileScreen', {
      avatarUrl: friend.avatarUrl,
      badgeRarity: friend.badgeRarity,
      displayName: friend.displayName,
      title: friend.title,
      userId: friend.userId,
      username: friend.username,
    });
  };

  const openLeaderboardProfile = (entry: LeaderboardEntry) => {
    navigation.navigate('PublicUserProfileScreen', {
      avatarUrl: entry.avatarUrl,
      badgeRarity: entry.badgeRarity,
      displayName: entry.displayName,
      title: entry.title,
      userId: entry.userId ?? entry.id,
      username: entry.username,
    });
  };

  const openFriendMenu = (friend: FriendModel) => {
    Alert.alert(friend.displayName, 'Actions du profil', [
      { text: 'Voir la collection', onPress: () => openProfile(friend) },
      { text: 'Voir les badges', onPress: () => openProfile(friend) },
      {
        text: 'Supprimer cet ami',
        style: 'destructive',
        onPress: () => void removeFriend(friend.userId),
      },
      { text: 'Annuler', style: 'cancel' },
    ]);
  };

  const refreshAll = async () => {
    await Promise.all([refreshFriends(), refreshLeaderboards()]);
  };

  if (isLoading && !friendsHaveLoaded) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <FeedState loading description="Connexion au réseau social." title="Chargement du Social Hub" tone="purple" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            colors={[colors.neonGreen]}
            onRefresh={() => void refreshAll()}
            refreshing={isRefreshing}
            tintColor={colors.neonGreen}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <ScreenTitle title="SOCIAL" />
        <View style={styles.hero}>
          <Text style={styles.heroTitle}>Le réseau prend vie.</Text>
          <Text style={styles.heroSubtitle}>
            Découvrez les exploits, défis et légendes de votre réseau.
          </Text>
          <View style={styles.summaryRow}>
            <SummaryPill label="AMIS" value={`👥 ${friends.length}`} />
            <SummaryPill label="EN LIGNE" value={`🟢 ${onlineCount}`} />
            <SummaryPill label="DÉFIS ACTIFS" value={`🎯 ${activeChallenges}`} />
          </View>
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <SectionHeading action="EN DIRECT" title="🔥 Activité récente" />
        <ScrollView
          contentContainerStyle={styles.horizontalContent}
          horizontal
          showsHorizontalScrollIndicator={false}
        >
          {activities.map((activity) => (
            <ActivityCard key={`${activity.displayName}-${activity.detail}`} {...activity} />
          ))}
        </ScrollView>

        <SectionHeading action="CETTE SEMAINE" title="🏆 Top amis" />
        {topFriends.length > 0 ? (
          <TopFriendsCarousel entries={topFriends} onViewProfile={openLeaderboardProfile} />
        ) : (
          <FeedState description="Le podium apparaîtra après les premiers exploits." title="Podium en préparation" tone="cyan" />
        )}

        {incomingRequests.length > 0 ? (
          <>
            <SectionHeading action={`${incomingRequests.length} EN ATTENTE`} title="⚡ Demandes reçues" />
            {incomingRequests.map((request) => (
              <FriendRequestCard
                accepting={isAcceptingRequestId === request.requestId}
                declining={isDecliningRequestId === request.requestId}
                key={request.requestId}
                mode="incoming"
                onAccept={(nextRequest) => void acceptRequest(nextRequest.requestId)}
                onDecline={(nextRequest) => void declineRequest(nextRequest.requestId)}
                request={request}
              />
            ))}
          </>
        ) : null}

        {outgoingRequests.length > 0 ? (
          <>
            <SectionHeading action={`${outgoingRequests.length} EN ATTENTE`} title="📨 Défis sociaux envoyés" />
            {outgoingRequests.map((request) => (
              <FriendRequestCard key={request.requestId} mode="outgoing" request={request} />
            ))}
          </>
        ) : null}

        <SectionHeading action={`${filteredFriends.length} JOUEURS`} title="👥 Mes amis" />
        {filteredFriends.length > 0 ? (
          filteredFriends.map((friend, index) => (
            <FriendCard
              friend={friend}
              key={friend.id}
              onChallenge={(nextFriend) => {
                Alert.alert('Défi lancé', `${nextFriend.displayName} a reçu ton défi.`);
              }}
              onMenu={openFriendMenu}
              onViewProfile={openProfile}
              stats={statsForFriend(friend, index)}
            />
          ))
        ) : (
          <FeedState description="Aucun ami ne correspond à cette recherche." title="Aucun joueur trouvé" tone="cyan" />
        )}

        <SectionHeading action={`${visibleLeaderboard.length} CLASSÉS`} title="⚔️ Classements" />
        <LeaderboardModeBar activeMode={activeMode} onChange={setMode} />
        {visibleLeaderboard.length > 0 ? (
          visibleLeaderboard.map((entry) => (
            <LeaderboardRow entry={entry} key={entry.id} onPress={openLeaderboardProfile} />
          ))
        ) : (
          <FeedState description="Aucun joueur dans ce classement." title="Classement vide" tone="purple" />
        )}

        <SectionHeading action="NOUVEAU RIVAL" title="➕ Agrandir le réseau" />
        <AddFriendCard
          isAdding={isAddingFriend}
          onAdd={() => void addFriend(query)}
          onInvite={() => Alert.alert('Lien d’invitation', 'Le lien d’invitation est prêt à être partagé.')}
          onQueryChange={setQuery}
          onScanQr={() => Alert.alert('Scanner QR Code', 'Le scanner QR sera disponible ici.')}
          query={query}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const SummaryPill = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.summaryPill}>
    <Text style={styles.summaryValue}>{value}</Text>
    <Text style={styles.summaryLabel}>{label}</Text>
  </View>
);

const SectionHeading = ({ action, title }: { action: string; title: string }) => (
  <View style={styles.sectionHeading}>
    <Text style={styles.sectionTitle}>{title}</Text>
    <Text style={styles.sectionAction}>{action}</Text>
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
  hero: {
    backgroundColor: colors.surface,
    borderColor: colors.neonGreen,
    borderRadius: 28,
    borderWidth: 1,
    padding: 18,
  },
  heroTitle: {
    color: colors.textPrimary,
    fontSize: 26,
    fontWeight: '900',
    marginTop: 8,
  },
  heroSubtitle: {
    color: colors.textSecondary,
    fontSize: 11,
    lineHeight: 17,
    marginTop: 6,
    maxWidth: 310,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 18,
  },
  summaryPill: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: 14,
    flex: 1,
    paddingHorizontal: 8,
    paddingVertical: 10,
  },
  summaryValue: {
    color: colors.textPrimary,
    fontSize: 12,
    fontWeight: '900',
  },
  summaryLabel: {
    color: colors.textMuted,
    fontSize: 6,
    fontWeight: '900',
    letterSpacing: 0.7,
    marginTop: 4,
  },
  error: {
    color: colors.danger,
    fontSize: 10,
    marginTop: 12,
    textAlign: 'center',
  },
  sectionHeading: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    marginTop: 26,
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '900',
  },
  sectionAction: {
    color: colors.neonCyan,
    fontSize: 7,
    fontWeight: '900',
    letterSpacing: 0.9,
  },
  horizontalContent: {
    paddingRight: 4,
  },
});

export default SocialScreen;
