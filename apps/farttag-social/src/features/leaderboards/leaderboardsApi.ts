import { apiRequest } from '../../api/apiClient';
import { apiEndpoints } from '../../api/apiEndpoints';
import type { BackendLeaderboardsResponse } from '../../api/backendContracts';
import { mapLeaderboardBoard } from '../../api/backendMappers';
import { mockLeaderboardFriends, mockLeaderboardGlobal } from '../mockData';
import type { LeaderboardBoards, LeaderboardEntry } from './types';

const fallbackBoards = (): LeaderboardBoards => ({
  global: mockLeaderboardGlobal,
  week: mockLeaderboardGlobal,
  longest: mockLeaderboardGlobal,
  mostToxic: mockLeaderboardGlobal,
});

export const leaderboardsApi = {
  async getGlobal(): Promise<LeaderboardBoards> {
    try {
      const response = await apiRequest<BackendLeaderboardsResponse>(apiEndpoints.leaderboards.global);
      const boards = {
        global: mapLeaderboardBoard(response.global),
        week: mapLeaderboardBoard(response.week),
        longest: mapLeaderboardBoard(response.longest),
        mostToxic: mapLeaderboardBoard(response.toxic),
      };
      return boards.global.length > 0 ? boards : fallbackBoards();
    } catch {
      return fallbackBoards();
    }
  },

  async getFriends(): Promise<LeaderboardEntry[]> {
    try {
      const response = await apiRequest<BackendLeaderboardsResponse>(apiEndpoints.leaderboards.friends);
      const items = mapLeaderboardBoard(response.global);
      return items.length > 0 ? items : mockLeaderboardFriends;
    } catch {
      return mockLeaderboardFriends;
    }
  },
};
