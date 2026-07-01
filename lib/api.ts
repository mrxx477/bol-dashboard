const API_URL = 'https://bolbot-production.up.railway.app';

export function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('bol_token');
}

export async function api<T = any>(
  path: string,
  opts: RequestInit & { skipAuth?: boolean } = {}
): Promise<T> {
  const token = getStoredToken();
  const { skipAuth, ...fetchOpts } = opts;

  const res = await fetch(`${API_URL}${path}`, {
    ...fetchOpts,
    headers: {
      'Content-Type': 'application/json',
      ...(token && !skipAuth ? { Authorization: `Bearer ${token}` } : {}),
      ...fetchOpts.headers,
    },
  });

  if (res.status === 401 && !skipAuth) {
    localStorage.removeItem('bol_token');
    localStorage.removeItem('bol_email');
    window.location.href = '/login';
    throw new Error('Sessie verlopen, opnieuw inloggen');
  }

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error || data.message || `HTTP ${res.status}`);
  }

  return data as T;
}

export const apiGet = <T = any>(path: string) => api<T>(path);

export const apiPost = <T = any>(path: string, body?: unknown) =>
  api<T>(path, { method: 'POST', body: body !== undefined ? JSON.stringify(body) : undefined });

export const apiPut = <T = any>(path: string, body?: unknown) =>
  api<T>(path, { method: 'PUT', body: body !== undefined ? JSON.stringify(body) : undefined });

export const apiDelete = <T = any>(path: string) =>
  api<T>(path, { method: 'DELETE' });
