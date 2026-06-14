import { apiRequest } from '../../api/apiClient';
import type {
  BackendFriend,
  BackendFriendRequest,
  BackendFriendRequestsResponse,
  BackendUserSearchResult,
} from '../../api/backendContracts';
import { mapFriend, mapFriendRequest } from '../../api/backendMappers';
import { mockFriendRequestsIncoming, mockFriendRequestsOutgoing, mockFriends } from '../mockData';
import type { FriendCard, FriendRequestsResponse } from './types';

export const friendsApi = {
  searchUsers(query: string) {
    return apiRequest<BackendUserSearchResult[]>(
      `/api/profiles/search?query=${encodeURIComponent(query.trim())}`,
    );
  },
  async getFriends(): Promise<FriendCard[]> {
    try {
      const response = await apiRequest<BackendFriend[]>('/api/friends');
      const friends = response.map(mapFriend);
      return friends.length > 0 ? friends : mockFriends;
    } catch {
      return mockFriends;
    }
  },

  async getRequests(): Promise<FriendRequestsResponse> {
    try {
      const response = await apiRequest<BackendFriendRequestsResponse>('/api/friends/requests');
      const incoming = response.incoming.map((request) => mapFriendRequest(request, 'incoming'));
      const outgoing = response.outgoing.map((request) => mapFriendRequest(request, 'outgoing'));
      return {
        incoming: incoming.length > 0 ? incoming : mockFriendRequestsIncoming,
        outgoing: outgoing.length > 0 ? outgoing : mockFriendRequestsOutgoing,
      };
    } catch {
      return {
        incoming: mockFriendRequestsIncoming,
        outgoing: mockFriendRequestsOutgoing,
      };
    }
  },

  requestFriend(userId: string) {
    return apiRequest<BackendFriendRequest>(`/api/friends/${userId}/request`, {
      method: 'POST',
    });
  },

  acceptRequest(requestId: string) {
    return apiRequest<BackendFriendRequest>(`/api/friends/${requestId}/accept`, {
      method: 'POST',
    });
  },

  declineRequest(requestId: string) {
    return apiRequest<BackendFriendRequest>(`/api/friends/requests/${requestId}`, {
      method: 'DELETE',
    });
  },

  removeFriend(userId: string) {
    return apiRequest<void>(`/api/friends/${userId}`, {
      method: 'DELETE',
    });
  },
};
