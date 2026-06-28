declare const process: {
  env: {
    EXPO_PUBLIC_API_URL?: string;
  };
};

import { apiConfig } from '../config/apiConfig';

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? apiConfig.defaultApiUrl;

let accessToken: string | null = null;

export const setApiAccessToken = (token: string | null) => {
  accessToken = token;
};

export const getAccessToken = () => accessToken;

export const getApiUrl = () => {
  return API_URL;
};

export const resolveApiUrl = (path: string | null): string | null => {
  if (!path) {
    return null;
  }
  return path.startsWith('http://') || path.startsWith('https://') ? path : `${getApiUrl()}${path}`;
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
  const isMultipart =
    typeof FormData !== 'undefined' &&
    init?.body instanceof FormData;

  if (__DEV__) {
    console.log('========================');
    console.log('API REQUEST');
    console.log('URL:', `${getApiUrl()}${path}`);
    console.log('METHOD:', init?.method ?? 'GET');
    console.log('IS MULTIPART:', isMultipart);
    console.log('HAS TOKEN:', !!accessToken);
  }

  try{
    const response = await fetch(`${getApiUrl()}${path}`, {
    ...init,
    headers: {
      Accept: 'application/json',
      ...(!isMultipart ? { 'Content-Type': 'application/json' } : {}),
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...init?.headers,
    },
  });
  if (__DEV__) {
    console.log('STATUS:', response.status);
    console.log('OK:', response.ok);
  }

  if (!response.ok) {
    const body = await response.text();

    if (__DEV__) {
      console.log('ERROR BODY:', body);
    }

    throw new ApiError(
      body || 'The server could not complete the request.',
      response.status,
    );
  }

  if (response.status === 204) {
    if (__DEV__) {
      console.log('NO CONTENT');
    }
    return undefined as T;
  }

  const json = await response.json();

  if (__DEV__) {
    console.log('SUCCESS RESPONSE:', json);
  }

  return json as Promise<T>;
  }
  catch (error) {
  if (__DEV__) {
    console.log('FETCH EXCEPTION');
    console.log(error);
  }
  throw error;
  }
};
