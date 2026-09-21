import axios from 'axios';

export const API_URL = import.meta.env.VITE_API_URL ?? 'http://19429ba06ff2.vps.myjino.ru/api';
export const TOKEN_KEY = 'otus-shop-token';

export const api = axios.create({ baseURL: API_URL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem(TOKEN_KEY);
      window.dispatchEvent(new Event('auth:expired'));
    }
    return Promise.reject(error);
  },
);

export const getErrorMessage = (error: unknown) => {
  if (axios.isAxiosError(error))
    return (
      error.response?.data?.errors?.[0]?.message ??
      'Не удалось выполнить запрос. Попробуйте ещё раз.'
    );
  return 'Произошла непредвиденная ошибка.';
};
