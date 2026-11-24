import { retrieveLaunchParams } from '@telegram-apps/sdk-react';

const BASE = import.meta.env.VITE_API_BASE as string;

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

function getInitDataRaw(): string | null {
  try {
    const { initDataRaw } = retrieveLaunchParams();
    if (initDataRaw) return initDataRaw;
  } catch {
    /* запущено вне Telegram — ниже вернём null */
  }

  // Фоллбэк для локальной отладки в обычном браузере
  if (import.meta.env.DEV) {
    return import.meta.env.VITE_DEV_INIT_DATA ?? null;
  }
  return null;
}

export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  if (!BASE) {
    throw new ApiError(0, 'VITE_API_BASE is not configured');
  }

  const initDataRaw = getInitDataRaw();
  if (!initDataRaw) {
    throw new ApiError(401, 'No Telegram initData — open the app inside Telegram');
  }

  const headers = new Headers(init.headers);
  headers.set('Authorization', `tma ${initDataRaw}`);
  if (init.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  headers.set('Accept', 'application/json');

  let res: Response;
  try {
    res = await fetch(`${BASE}${path}`, { ...init, headers });
  } catch (e) {
    throw new ApiError(0, `Network error: ${(e as Error).message}`);
  }

  if (res.status === 204) {
    return undefined as T;
  }

  const text = await res.text();
  const data = text ? safeJson(text) : null;

  if (!res.ok) {
    const msg =
      (data && typeof data === 'object' && 'error' in data && String((data as any).error)) ||
      text ||
      res.statusText;
    throw new ApiError(res.status, msg);
  }

  return data as T;
}

function safeJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

// Удобные шорткаты
export const apiGet  = <T>(p: string) => api<T>(p);
export const apiPost = <T>(p: string, body?: unknown) =>
  api<T>(p, { method: 'POST', body: body ? JSON.stringify(body) : undefined });
export const apiPut  = <T>(p: string, body?: unknown) =>
  api<T>(p, { method: 'PUT',  body: body ? JSON.stringify(body) : undefined });
export const apiDel  = <T>(p: string) => api<T>(p, { method: 'DELETE' });
