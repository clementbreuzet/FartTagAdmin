import type { BackendAuthResponse } from './backendContracts';
import { ApiError, apiRequest, setApiAccessToken } from './apiClient';
import { apiEndpoints } from './apiEndpoints';

const developmentUser = {
  email: 'usb-tester@farttag.local',
  login: 'usb-tester',
  password: 'UsbTest!2026',
  userName: 'usb-tester',
};

const login = () =>
  apiRequest<BackendAuthResponse>(apiEndpoints.auth.login, {
    body: JSON.stringify({
      login: developmentUser.login,
      password: developmentUser.password,
    }),
    method: 'POST',
  });

export const initializeDevelopmentAuth = async (): Promise<void> => {
  if (!__DEV__) {
    return;
  }

  let response: BackendAuthResponse;
  console.log('[auth] Development authentication started');
  try {
    response = await login();
  } catch (error) {
    if (!(error instanceof ApiError) || error.status !== 401) {
      throw error;
    }

    response = await apiRequest<BackendAuthResponse>(apiEndpoints.auth.register, {
      body: JSON.stringify({
        email: developmentUser.email,
        password: developmentUser.password,
        userName: developmentUser.userName,
      }),
      method: 'POST',
    });
  }

  setApiAccessToken(response.accessToken);
  console.log('[auth] Development authentication ready', {
    hasAccessToken: Boolean(response.accessToken),
    userId: response.user.id,
    userName: response.user.userName,
  });
};
