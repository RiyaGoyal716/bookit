import Constants from 'expo-constants';

/**
 * Resolve the API base URL.
 *
 * Priority:
 *   1. EXPO_PUBLIC_API_URL (inlined at build time, available at runtime)
 *   2. app config `extra.apiUrl`
 *   3. a safe localhost default for development
 */
function resolveBaseUrl(): string {
  const fromEnv = process.env.EXPO_PUBLIC_API_URL;
  if (fromEnv) {
    return fromEnv;
  }
  const fromExtra = (Constants.expoConfig?.extra as { apiUrl?: string } | undefined)?.apiUrl;
  if (fromExtra) {
    return fromExtra;
  }
  return 'http://localhost:3000';
}

export const API_BASE_URL = resolveBaseUrl();

export interface ApiError {
  status: number;
  message: string;
}

export interface ApiFetchOptions extends Omit<RequestInit, 'body'> {
  /** Optional JSON body — serialised automatically. */
  body?: unknown;
}

/**
 * A minimal typed fetch wrapper around the Bookit API.
 *
 * This is scaffolding only — there are no real endpoints wired up. It simply
 * provides a typed, reusable client that prefixes the configured base URL and
 * handles JSON (de)serialisation.
 */
export async function apiFetch<TResponse = unknown>(
  path: string,
  options: ApiFetchOptions = {},
): Promise<TResponse> {
  const { body, headers, ...rest } = options;

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...rest,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...headers,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  if (!response.ok) {
    const error: ApiError = {
      status: response.status,
      message: response.statusText || 'Request failed',
    };
    throw error;
  }

  // 204 No Content → nothing to parse.
  if (response.status === 204) {
    return undefined as TResponse;
  }

  return (await response.json()) as TResponse;
}

export const apiClient = {
  get: <TResponse = unknown>(path: string, options?: ApiFetchOptions) =>
    apiFetch<TResponse>(path, { ...options, method: 'GET' }),
  post: <TResponse = unknown>(path: string, body?: unknown, options?: ApiFetchOptions) =>
    apiFetch<TResponse>(path, { ...options, method: 'POST', body }),
  put: <TResponse = unknown>(path: string, body?: unknown, options?: ApiFetchOptions) =>
    apiFetch<TResponse>(path, { ...options, method: 'PUT', body }),
  delete: <TResponse = unknown>(path: string, options?: ApiFetchOptions) =>
    apiFetch<TResponse>(path, { ...options, method: 'DELETE' }),
};

export type ApiClient = typeof apiClient;
