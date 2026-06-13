export type FriendBadgeRarity = 'common' | 'rare' | 'epic' | 'legendary' | 'mythic';

export type FriendCard = {
  id: string;
  userId: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  title: string | null;
  badgeRarity: FriendBadgeRarity | null;
  level?: number | null;
};

export type FriendRequest = {
  id: string;
  requestId: string;
  userId: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  message?: string | null;
  requestedAt?: string | null;
};

export type FriendsResponse = {
  items: FriendCard[];
};

export type FriendRequestsResponse = {
  incoming: FriendRequest[];
  outgoing: FriendRequest[];
};
