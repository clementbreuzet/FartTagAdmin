import { create } from 'zustand';

import { friendsApi } from './friendsApi';
import type { FriendCard, FriendRequest } from './types';

type FriendsState = {
  error: string | null;
  friends: FriendCard[];
  hasLoaded: boolean;
  incomingRequests: FriendRequest[];
  outgoingRequests: FriendRequest[];
  isAddingFriend: boolean;
  isAcceptingRequestId: string | null;
  isLoading: boolean;
  isRefreshing: boolean;
  isRemovingFriendId: string | null;
  isDecliningRequestId: string | null;
  query: string;
  selectedFriendId: string | null;
  loadFriends: () => Promise<void>;
  refreshFriends: () => Promise<void>;
  setQuery: (query: string) => void;
  setSelectedFriendId: (friendId: string | null) => void;
  addFriend: (userId: string) => Promise<void>;
  acceptRequest: (requestId: string) => Promise<void>;
  declineRequest: (requestId: string) => Promise<void>;
  removeFriend: (userId: string) => Promise<void>;
};

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : 'Les amis ne peuvent pas etre charges.';

const normalize = (value: string) => value.trim().toLowerCase();

export const useFriendsStore = create<FriendsState>((set, get) => ({
  error: null,
  friends: [],
  hasLoaded: false,
  incomingRequests: [],
  outgoingRequests: [],
  isAddingFriend: false,
  isAcceptingRequestId: null,
  isLoading: false,
  isRefreshing: false,
  isRemovingFriendId: null,
  isDecliningRequestId: null,
  query: '',
  selectedFriendId: null,

  loadFriends: async () => {
    set({ error: null, isLoading: true });
    try {
      const [friends, requests] = await Promise.all([friendsApi.getFriends(), friendsApi.getRequests()]);
      set({
        friends,
        hasLoaded: true,
        incomingRequests: requests.incoming,
        outgoingRequests: requests.outgoing,
      });
    } catch (error) {
      set({ error: getErrorMessage(error), hasLoaded: true });
    } finally {
      set({ isLoading: false });
    }
  },

  refreshFriends: async () => {
    set({ error: null, isRefreshing: true });
    try {
      const [friends, requests] = await Promise.all([friendsApi.getFriends(), friendsApi.getRequests()]);
      set({
        friends,
        incomingRequests: requests.incoming,
        outgoingRequests: requests.outgoing,
      });
    } catch (error) {
      set({ error: getErrorMessage(error) });
    } finally {
      set({ isRefreshing: false });
    }
  },

  setQuery: (query) => set({ query }),
  setSelectedFriendId: (selectedFriendId) => set({ selectedFriendId }),

  addFriend: async (userId) => {
    const target = userId.trim();
    if (!target) {
      return;
    }

    set({ error: null, isAddingFriend: true });
    try {
      const isGuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(target);
      const targetUserId = isGuid
        ? target
        : (await friendsApi.searchUsers(target)).find(
            (user) => user.userName.toLowerCase() === target.toLowerCase(),
          )?.userId;
      if (!targetUserId) {
        throw new Error('Utilisateur introuvable.');
      }
      await friendsApi.requestFriend(targetUserId);
    } catch (error) {
      set({ error: getErrorMessage(error) });
    } finally {
      set({ isAddingFriend: false });
    }
  },

  acceptRequest: async (requestId) => {
    set({ error: null, isAcceptingRequestId: requestId });
    try {
      await friendsApi.acceptRequest(requestId);
      const nextIncoming = get().incomingRequests.filter((request) => request.requestId !== requestId);
      set({ incomingRequests: nextIncoming });
    } catch (error) {
      set({ error: getErrorMessage(error) });
    } finally {
      set({ isAcceptingRequestId: null });
    }
  },

  declineRequest: async (requestId) => {
    set({ error: null, isDecliningRequestId: requestId });
    try {
      await friendsApi.declineRequest(requestId);
      const nextIncoming = get().incomingRequests.filter((request) => request.requestId !== requestId);
      set({ incomingRequests: nextIncoming });
    } catch (error) {
      set({ error: getErrorMessage(error) });
    } finally {
      set({ isDecliningRequestId: null });
    }
  },

  removeFriend: async (userId) => {
    set({ error: null, isRemovingFriendId: userId });
    try {
      await friendsApi.removeFriend(userId);
      const nextFriends = get().friends.filter((friend) => friend.userId !== userId);
      set({ friends: nextFriends });
    } catch (error) {
      set({ error: getErrorMessage(error) });
    } finally {
      set({ isRemovingFriendId: null });
    }
  },
}));

export const selectFilteredFriends = (state: FriendsState) => {
  const q = normalize(state.query);
  if (!q) {
    return state.friends;
  }

  return state.friends.filter((friend) =>
    [friend.username, friend.displayName, friend.title ?? '', friend.userId].some((value) => normalize(value).includes(q)),
  );
};

export const selectFilteredIncomingRequests = (state: FriendsState) => {
  const q = normalize(state.query);
  if (!q) {
    return state.incomingRequests;
  }

  return state.incomingRequests.filter((request) =>
    [request.username, request.displayName, request.userId, request.message ?? ''].some((value) => normalize(value).includes(q)),
  );
};

export const selectFilteredOutgoingRequests = (state: FriendsState) => {
  const q = normalize(state.query);
  if (!q) {
    return state.outgoingRequests;
  }

  return state.outgoingRequests.filter((request) =>
    [request.username, request.displayName, request.userId, request.message ?? ''].some((value) => normalize(value).includes(q)),
  );
};
