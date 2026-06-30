export const apiEndpoints = {
  auth: {
    login: '/api/auth/login',
    register: '/api/auth/register',
  },
  badges: {
    all: '/api/badges',
    mine: '/api/badges/me',
  },
  fartEvents: {
    audio: '/api/fart-events/audio',
    byId: (id: string) => `/api/fart-events/${id}`,
    comments: (id: string) => `/api/fart-events/${id}/comments`,
    create: '/api/fart-events',
    myHistory: '/api/fart-events/my-history',
    react: (id: string) => `/api/fart-events/${id}/react`,
    visibility: (id: string) => `/api/fart-events/${id}/visibility`,
  },
  feed: {
    public: '/api/feed/public',
  },
  friends: {
    accept: (requestId: string) => `/api/friends/${requestId}/accept`,
    byUserId: (userId: string) => `/api/friends/${userId}`,
    list: '/api/friends',
    reject: (requestId: string) => `/api/friends/requests/${requestId}`,
    request: (userId: string) => `/api/friends/${userId}/request`,
    requests: '/api/friends/requests',
    search: (query: string) => `/api/profiles/search?query=${encodeURIComponent(query)}`,
  },
  home: '/api/home',
  inventory: {
    equip: (itemId: string) => `/api/inventory/${itemId}/equip`,
    list: '/api/inventory',
  },
  leaderboards: {
    friends: '/api/leaderboards/friends',
    global: (rankingScope = 'world') => `/api/leaderboards/global?rankingScope=${encodeURIComponent(rankingScope)}`,
  },
  notifications: {
    preferences: '/api/notifications/preferences',
    registerToken: '/api/notifications/register-token',
  },
  profile: {
    current: (rankingScope = 'world') => `/api/profile?rankingScope=${encodeURIComponent(rankingScope)}`,
    publicById: (userId: string) => `/api/profiles/${userId}`,
  },
  shop: {
    list: '/api/shop',
    open: '/api/shop/open',
  },
  wallet: '/api/wallet',
} as const;
