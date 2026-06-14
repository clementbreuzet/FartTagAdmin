declare const process: {
  env: {
    EXPO_PUBLIC_API_URL?: string;
  };
};

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://192.168.1.126:50385';

let accessToken: string | null = null;

export const setApiAccessToken = (token: string | null) => {
  accessToken = token;
};

export const resolveApiUrl = (path: string | null): string | null => {
  if (!path) {
    return null;
  }
  return path.startsWith('http://') || path.startsWith('https://') ? path : `${API_URL}${path}`;
};

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export const apiRequest = async <T>(
  path: string,
  init?: RequestInit,
): Promise<T> => {
  const isMultipart = typeof FormData !== 'undefined' && init?.body instanceof FormData;
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      Accept: 'application/json',
      ...(!isMultipart ? { 'Content-Type': 'application/json' } : {}),
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...init?.headers,
    },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new ApiError(body || 'The server could not complete the request.', response.status);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
};
