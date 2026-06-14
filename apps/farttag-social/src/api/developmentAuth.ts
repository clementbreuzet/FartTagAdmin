import type { BackendAuthResponse } from './backendContracts';
import { ApiError, apiRequest, setApiAccessToken } from './apiClient';

const developmentUser = {
  email: 'usb-tester@farttag.local',
  login: 'usb-tester',
  password: 'UsbTest!2026',
  userName: 'usb-tester',
};

const login = () =>
  apiRequest<BackendAuthResponse>('/api/auth/login', {
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
  try {
    response = await login();
  } catch (error) {
    if (!(error instanceof ApiError) || error.status !== 401) {
      throw error;
    }

    response = await apiRequest<BackendAuthResponse>('/api/auth/register', {
      body: JSON.stringify({
        email: developmentUser.email,
        password: developmentUser.password,
        userName: developmentUser.userName,
      }),
      method: 'POST',
    });
  }

  setApiAccessToken(response.accessToken);
};
