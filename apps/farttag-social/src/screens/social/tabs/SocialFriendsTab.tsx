import React, { useMemo, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SubmenuTabs } from '../../../shared/components';
import { FeedState } from '../../../features/feed/components/FeedState';
import { FriendChip } from '../../../features/friends/components/FriendChip';
import { FriendProfileModal } from '../../../features/friends/components/FriendProfileModal';
import { FriendRequestCard } from '../../../features/friends/components/FriendRequestCard';
import { selectFilteredFriends, selectFilteredIncomingRequests, selectFilteredOutgoingRequests, useFriendsStore } from '../../../features/friends/friendsStore';
import { colors } from '../../../theme/colors';

type Section = 'friends' | 'incoming' | 'outgoing' | 'search';

export const SocialFriendsTab = () => {
  const [section, setSection] = useState<Section>('friends');
  const error = useFriendsStore((state) => state.error);
  const friends = useFriendsStore((state) => state.friends);
  const hasLoaded = useFriendsStore((state) => state.hasLoaded);
  const incomingRequests = useFriendsStore((state) => state.incomingRequests);
  const outgoingRequests = useFriendsStore((state) => state.outgoingRequests);
  const isAcceptingRequestId = useFriendsStore((state) => state.isAcceptingRequestId);
  const isAddingFriend = useFriendsStore((state) => state.isAddingFriend);
  const isDecliningRequestId = useFriendsStore((state) => state.isDecliningRequestId);
  const isLoading = useFriendsStore((state) => state.isLoading);
  const isRefreshing = useFriendsStore((state) => state.isRefreshing);
  const isRemovingFriendId = useFriendsStore((state) => state.isRemovingFriendId);
  const query = useFriendsStore((state) => state.query);
  const selectedFriendId = useFriendsStore((state) => state.selectedFriendId);
  const loadFriends = useFriendsStore((state) => state.loadFriends);
  const refreshFriends = useFriendsStore((state) => state.refreshFriends);
  const setQuery = useFriendsStore((state) => state.setQuery);
  const setSelectedFriendId = useFriendsStore((state) => state.setSelectedFriendId);
  const addFriend = useFriendsStore((state) => state.addFriend);
  const acceptRequest = useFriendsStore((state) => state.acceptRequest);
  const declineRequest = useFriendsStore((state) => state.declineRequest);
  const removeFriend = useFriendsStore((state) => state.removeFriend);

  const filteredFriends = useMemo(() => selectFilteredFriends({ error, friends, hasLoaded, incomingRequests, outgoingRequests, isAddingFriend, isAcceptingRequestId, isLoading, isRefreshing, isRemovingFriendId, isDecliningRequestId, query, selectedFriendId, loadFriends, refreshFriends, setQuery, setSelectedFriendId, addFriend, acceptRequest, declineRequest, removeFriend }), [acceptRequest, addFriend, declineRequest, error, friends, hasLoaded, incomingRequests, isAcceptingRequestId, isAddingFriend, isDecliningRequestId, isLoading, isRefreshing, isRemovingFriendId, query, outgoingRequests, refreshFriends, removeFriend, selectedFriendId, setQuery, setSelectedFriendId, loadFriends]);
  const filteredIncoming = useMemo(() => selectFilteredIncomingRequests({ error, friends, hasLoaded, incomingRequests, outgoingRequests, isAddingFriend, isAcceptingRequestId, isLoading, isRefreshing, isRemovingFriendId, isDecliningRequestId, query, selectedFriendId, loadFriends, refreshFriends, setQuery, setSelectedFriendId, addFriend, acceptRequest, declineRequest, removeFriend }), [acceptRequest, addFriend, declineRequest, error, friends, hasLoaded, incomingRequests, isAcceptingRequestId, isAddingFriend, isDecliningRequestId, isLoading, isRefreshing, isRemovingFriendId, query, outgoingRequests, refreshFriends, removeFriend, selectedFriendId, setQuery, setSelectedFriendId, loadFriends]);
  const filteredOutgoing = useMemo(() => selectFilteredOutgoingRequests({ error, friends, hasLoaded, incomingRequests, outgoingRequests, isAddingFriend, isAcceptingRequestId, isLoading, isRefreshing, isRemovingFriendId, isDecliningRequestId, query, selectedFriendId, loadFriends, refreshFriends, setQuery, setSelectedFriendId, addFriend, acceptRequest, declineRequest, removeFriend }), [acceptRequest, addFriend, declineRequest, error, friends, hasLoaded, incomingRequests, isAcceptingRequestId, isAddingFriend, isDecliningRequestId, isLoading, isRefreshing, isRemovingFriendId, query, outgoingRequests, refreshFriends, removeFriend, selectedFriendId, setQuery, setSelectedFriendId, loadFriends]);
  const selectedFriend = friends.find((friend) => friend.id === selectedFriendId) ?? null;

  const searchHit = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) {
      return null;
    }
    return friends.find((friend) =>
      [friend.username, friend.displayName, friend.userId].some((value) => value.toLowerCase().includes(needle)),
    ) ?? incomingRequests.find((request) =>
      [request.username, request.displayName, request.userId].some((value) => value.toLowerCase().includes(needle)),
    ) ?? outgoingRequests.find((request) =>
      [request.username, request.displayName, request.userId].some((value) => value.toLowerCase().includes(needle)),
    ) ?? null;
  }, [friends, incomingRequests, outgoingRequests, query]);

  if (isLoading && !hasLoaded) {
    return (
      <View style={styles.safeArea}>
        <FeedState loading description="Chargement des amis et des demandes." title="Chargement des amis" tone="purple" />
      </View>
    );
  }

  if (error && !hasLoaded) {
    return (
      <View style={styles.safeArea}>
        <FeedState
          actionLabel="Reessayer"
          description={error}
          onAction={() => {
            void loadFriends();
          }}
          title="Amis indisponibles"
          tone="purple"
        />
      </View>
    );
  }

  return (
    <View style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            colors={[colors.neonGreen]}
            onRefresh={() => void refreshFriends()}
            refreshing={isRefreshing}
            tintColor={colors.neonGreen}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.summaryCard}>
          <Summary label="Amis" value={String(friends.length)} />
          <Summary label="Recues" value={String(incomingRequests.length)} />
          <Summary label="Envoyees" value={String(outgoingRequests.length)} />
        </View>

        <View style={styles.searchCard}>
          <Text style={styles.searchLabel}>Recherche utilisateur</Text>
          <TextInput
            autoCapitalize="none"
            autoCorrect={false}
            onChangeText={setQuery}
            placeholder="userId ou pseudo"
            placeholderTextColor={colors.textMuted}
            style={styles.input}
            value={query}
          />
          <Text style={styles.searchHint}>Tape un identifiant pour filtrer ou envoyer une demande.</Text>
          <Pressable
            disabled={isAddingFriend || !query.trim()}
            onPress={() => void addFriend(query)}
            style={[styles.primaryButton, (isAddingFriend || !query.trim()) && styles.disabled]}
          >
            <Text style={styles.primaryButtonText}>{isAddingFriend ? 'ENVOI...' : 'AJOUTER AMI'}</Text>
          </Pressable>
          {searchHit ? <Text style={styles.searchResult}>Resultat detecte: {searchHit.displayName}</Text> : null}
        </View>

        <SubmenuTabs
          activeTab={section}
          onChange={setSection}
          tabs={[
            { label: 'Amis', value: 'friends' },
            { label: 'Recues', value: 'incoming' },
            { label: 'Envoyees', value: 'outgoing' },
            { label: 'Recherche', value: 'search' },
          ]}
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        {section === 'friends' ? (
          filteredFriends.length > 0 ? (
            filteredFriends.map((friend) => (
              <FriendChip
                friend={friend}
                key={friend.id}
                onRemove={(nextFriend) => void removeFriend(nextFriend.userId)}
                onViewProfile={(nextFriend) => setSelectedFriendId(nextFriend.id)}
              />
            ))
          ) : (
            <FeedState description="Aucun ami ne correspond a cette recherche." title="Aucun ami" tone="cyan" />
          )
        ) : null}

        {section === 'incoming' ? (
          filteredIncoming.length > 0 ? (
            filteredIncoming.map((request) => (
              <FriendRequestCard
                accepting={isAcceptingRequestId === request.requestId}
                declining={isDecliningRequestId === request.requestId}
                key={request.requestId}
                mode="incoming"
                onAccept={(nextRequest) => void acceptRequest(nextRequest.requestId)}
                onDecline={(nextRequest) => void declineRequest(nextRequest.requestId)}
                request={request}
              />
            ))
          ) : (
            <FeedState description="Aucune demande recue." title="Rien a traiter" tone="cyan" />
          )
        ) : null}

        {section === 'outgoing' ? (
          filteredOutgoing.length > 0 ? (
            filteredOutgoing.map((request) => (
              <FriendRequestCard key={request.requestId} mode="outgoing" request={request} />
            ))
          ) : (
            <FeedState description="Aucune demande envoyee." title="Aucun envoi" tone="cyan" />
          )
        ) : null}

        {section === 'search' ? (
          searchHit ? (
            <View style={styles.searchPreview}>
              <Text style={styles.searchPreviewTitle}>Resultat</Text>
              <Text style={styles.searchPreviewText}>{searchHit.displayName}</Text>
              <Text style={styles.searchPreviewText}>@{searchHit.username}</Text>
              <Text style={styles.searchPreviewMeta}>{'requestId' in searchHit ? 'Demande deja existante' : 'Ami deja present'}</Text>
            </View>
          ) : (
            <FeedState description="Aucun resultat local. Utilise l'identifiant pour envoyer une demande." title="Recherche vide" tone="cyan" />
          )
        ) : null}
      </ScrollView>

      <FriendProfileModal friend={selectedFriend} onClose={() => setSelectedFriendId(null)} />
    </View>
  );
};

const Summary = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.summaryBox}>
    <Text style={styles.summaryLabel}>{label}</Text>
    <Text style={styles.summaryValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: colors.background,
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
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
  backButton: {
    borderColor: colors.neonCyan,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  backText: {
    color: colors.neonCyan,
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  summaryCard: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  summaryBox: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 18,
    borderWidth: 1,
    flex: 1,
    padding: 12,
  },
  summaryLabel: {
    color: colors.textMuted,
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  summaryValue: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '900',
    marginTop: 5,
  },
  searchCard: {
    backgroundColor: colors.surface,
    borderColor: colors.neonPurple,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 14,
    padding: 14,
  },
  searchLabel: {
    color: colors.neonPurple,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  input: {
    backgroundColor: colors.surfaceElevated,
    borderColor: colors.border,
    borderRadius: 14,
    borderWidth: 1,
    color: colors.textPrimary,
    fontSize: 12,
    marginTop: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  searchHint: {
    color: colors.textMuted,
    fontSize: 10,
    lineHeight: 15,
    marginTop: 8,
  },
  primaryButton: {
    backgroundColor: '#9CFF0018',
    borderColor: colors.neonGreen,
    borderRadius: 14,
    borderWidth: 1,
    marginTop: 12,
    paddingVertical: 12,
  },
  primaryButtonText: {
    color: colors.neonGreen,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.8,
    textAlign: 'center',
  },
  searchResult: {
    color: colors.neonCyan,
    fontSize: 10,
    fontWeight: '700',
    marginTop: 10,
  },
  tabs: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  tab: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  tabActive: {
    backgroundColor: '#9CFF0018',
    borderColor: colors.neonGreen,
  },
  tabText: {
    color: colors.textSecondary,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  tabTextActive: {
    color: colors.neonGreen,
  },
  error: {
    color: colors.danger,
    fontSize: 10,
    marginBottom: 12,
    textAlign: 'center',
  },
  searchPreview: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.neonCyan,
    borderRadius: 20,
    borderWidth: 1,
    padding: 18,
  },
  searchPreviewTitle: {
    color: colors.neonCyan,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  searchPreviewText: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '800',
    marginTop: 6,
  },
  searchPreviewMeta: {
    color: colors.textMuted,
    fontSize: 10,
    marginTop: 8,
  },
  disabled: {
    opacity: 0.5,
  },
});

export default SocialFriendsTab;

