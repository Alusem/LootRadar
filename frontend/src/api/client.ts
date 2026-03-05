const API_BASE = import.meta.env.VITE_API_URL ?? '';

export interface Game {
  id: number;
  title: string;
  thumbnail: string;
  description: string;
  platform: string;
  type: string;
  open_giveaway_url: string;
}

export interface Deal {
  id: string;
  title: string;
  thumbnail: string;
  salePrice: number;
  normalPrice: number;
  savings: number;
  storeId: string;
  storeName: string;
  dealUrl: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  createdAt: string;
}

export interface Claim {
  id: string;
  userId: string;
  gamerPowerItemId: number;
  title: string;
  claimedAt: string;
  open_giveaway_url?: string;
  openGiveawayUrl?: string | null; // API devolve em camelCase
}

const GENERIC_500_MSG =
  'Erro no servidor. Se o problema continuar, verifica a consola do backend.';
const SERVER_UNREACHABLE_MSG =
  'Servidor indisponível. Verifica se o backend está a correr em http://localhost:3000.';

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const url = API_BASE ? `${API_BASE}${path}` : path;
  let res: Response;
  try {
    res = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
  } catch (_networkErr) {
    throw new Error(SERVER_UNREACHABLE_MSG);
  }
  if (res.ok) {
    const data = await res.json().catch(() => ({}));
    return data as T;
  }
  let message: string;
  const contentType = res.headers.get('content-type') ?? '';
  if (contentType.includes('application/json')) {
    const data = await res.json().catch(() => ({}));
    message = (data as { error?: string }).error || res.statusText;
  } else {
    const text = await res.text().catch(() => '');
    message = text && text.length < 200 ? text : res.statusText;
  }
  if (
    message === 'Internal Server Error' ||
    (res.status === 500 && (!message || message === res.statusText))
  ) {
    message = GENERIC_500_MSG;
  }
  if (res.status === 502) {
    message = SERVER_UNREACHABLE_MSG;
  }
  throw new Error(message);
}

export async function getGames(params?: { platform?: string; type?: string }): Promise<Game[]> {
  const search = new URLSearchParams();
  if (params?.platform) search.set('platform', params.platform);
  if (params?.type) search.set('type', params.type);
  const qs = search.toString();
  return request<Game[]>(`/api/games${qs ? `?${qs}` : ''}`);
}

export async function getDeals(params?: {
  storeId?: string;
  upperPrice?: number;
  pageSize?: number;
}): Promise<Deal[]> {
  const search = new URLSearchParams();
  if (params?.storeId) search.set('storeId', params.storeId);
  if (params?.upperPrice != null) search.set('upperPrice', String(params.upperPrice));
  if (params?.pageSize != null) search.set('pageSize', String(params.pageSize));
  const qs = search.toString();
  return request<Deal[]>(`/api/deals${qs ? `?${qs}` : ''}`);
}

export interface CreateUserResponse {
  id: string;
  username: string;
  email: string;
  createdAt: string;
  verificationLink?: string;
}

export async function createUser(data: {
  username: string;
  email: string;
  password: string;
}): Promise<CreateUserResponse> {
  return request<CreateUserResponse>('/api/users', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function login(data: {
  email: string;
  password: string;
}): Promise<{ id: string; username: string }> {
  return request<{ id: string; username: string }>('/api/users/login', {
    method: 'POST',
    body: JSON.stringify({ email: data.email.trim().toLowerCase(), password: data.password }),
  });
}

export async function verifyEmail(token: string): Promise<{
  message: string;
  user: { id: string; username: string };
}> {
  return request<{ message: string; user: { id: string; username: string } }>(
    `/api/users/verify-email?token=${encodeURIComponent(token)}`
  );
}

export async function resendVerificationEmail(email: string): Promise<{
  message: string;
  verificationLink?: string;
}> {
  return request<{ message: string; verificationLink?: string }>(
    '/api/users/resend-verification',
    {
      method: 'POST',
      body: JSON.stringify({ email: email.trim().toLowerCase() }),
    }
  );
}

export async function createClaim(data: {
  userId: string;
  gamerPowerItemId: number;
  title: string;
  open_giveaway_url?: string;
}): Promise<Claim> {
  return request<Claim>('/api/claims', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function getClaimsByUserId(userId: string): Promise<Claim[]> {
  return request<Claim[]>(`/api/users/${userId}/claims`);
}
