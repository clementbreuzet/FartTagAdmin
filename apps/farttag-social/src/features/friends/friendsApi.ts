import { apiRequest } from '../../api/apiClient';
import { apiEndpoints } from '../../api/apiEndpoints';
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
      apiEndpoints.friends.search(query.trim()),
    );
  },
  async getFriends(): Promise<FriendCard[]> {
    try {
      const response = await apiRequest<BackendFriend[]>(apiEndpoints.friends.list);
      const friends = response.map(mapFriend);
      return friends.length > 0 ? friends : mockFriends;
    } catch {
      return mockFriends;
    }
  },

  async getRequests(): Promise<FriendRequestsResponse> {
    try {
      const response = await apiRequest<BackendFriendRequestsResponse>(apiEndpoints.friends.requests);
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
    return apiRequest<BackendFriendRequest>(apiEndpoints.friends.request(userId), {
      method: 'POST',
    });
  },

  acceptRequest(requestId: string) {
    return apiRequest<BackendFriendRequest>(apiEndpoints.friends.accept(requestId), {
      method: 'POST',
    });
  },

  declineRequest(requestId: string) {
    return apiRequest<BackendFriendRequest>(apiEndpoints.friends.reject(requestId), {
      method: 'DELETE',
    });
  },

  removeFriend(userId: string) {
    return apiRequest<void>(apiEndpoints.friends.byUserId(userId), {
      method: 'DELETE',
    });
  },
};
