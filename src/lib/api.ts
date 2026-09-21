import type { ServerError } from '../types/api';

export const API_URL = import.meta.env.VITE_API_URL ?? 'http://19429ba06ff2.vps.myjino.ru/api';
export const TOKEN_KEY = 'otus-shop-token';

export class ApiError extends Error {
  readonly status: number;
  readonly payload?: ServerError;

  constructor(message: string, status: number, payload?: ServerError) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.payload = payload;
  }
}

async function request<T>(path: string, method = 'GET', body?: unknown): Promise<T> {
  const token = localStorage.getItem(TOKEN_KEY);
  const response = await fetch(`${API_URL}${path}`, {
    method,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });

  const payload = (await response.json().catch(() => undefined)) as T | ServerError | undefined;
  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem(TOKEN_KEY);
      window.dispatchEvent(new Event('auth:expired'));
    }
    const errors = payload as ServerError | undefined;
    throw new ApiError(
      errors?.errors?.[0]?.message ?? 'Не удалось выполнить запрос.',
      response.status,
      errors,
    );
  }
  return payload as T;
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) => request<T>(path, 'POST', body),
  put: <T>(path: string, body?: unknown) => request<T>(path, 'PUT', body),
  patch: <T>(path: string, body?: unknown) => request<T>(path, 'PATCH', body),
  delete: <T = void>(path: string) => request<T>(path, 'DELETE'),
};

export const getErrorMessage = (error: unknown) =>
  error instanceof ApiError
    ? (error.payload?.errors?.[0]?.message ?? error.message)
    : 'Произошла непредвиденная ошибка.';
