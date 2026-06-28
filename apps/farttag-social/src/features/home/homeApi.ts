import { apiRequest } from '../../api/apiClient';
import type { BackendHomeDashboard } from '../../api/backendContracts';
import type { HomeDashboard } from './types';

export const homeApi = {
  getHome() {
    return apiRequest<BackendHomeDashboard>('/api/home').then((dashboard): HomeDashboard => dashboard);
  },
};
