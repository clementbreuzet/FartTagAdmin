import { apiRequest } from '../../api/apiClient';
import { apiEndpoints } from '../../api/apiEndpoints';
import type { BackendHomeDashboard } from '../../api/backendContracts';
import type { HomeDashboard } from './types';

export const homeApi = {
  getHome() {
    return apiRequest<BackendHomeDashboard>(apiEndpoints.home).then((dashboard): HomeDashboard => dashboard);
  },
};
