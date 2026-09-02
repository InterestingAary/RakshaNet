import { apiClient, ApiError } from '@/lib/apiClient';
import type { AuthUser, LoginCredentials } from '@/types';

const SESSION_STORAGE_KEY = 'sih_auth_session';
const LEGACY_SESSION_STORAGE_KEY = 'sih_auth_user';

interface BackendUserResponse {
  id: string;
  full_name?: string | null;
  email: string;
  role?: string | null;
  phone?: string | null;
  is_active?: boolean;
  created_at?: string | null;
  updated_at?: string | null;
}

interface TokenResponse {
  access_token: string;
  token_type: string;
}

function mapBackendUser(user: BackendUserResponse, token: string): AuthUser {
  const rawRole = String(user.role ?? 'authority').toLowerCase();
  const mappedRole: AuthUser['role'] = rawRole === 'admin' ? 'admin' : 'authority';

  return {
    id: String(user.id),
    email: user.email,
    name: user.full_name?.trim() || user.email.split('@')[0] || 'Authority',
    role: mappedRole,
    token,
  };
}

function persistSession(user: AuthUser | null): void {
  if (typeof window === 'undefined') {
    return;
  }

  if (!user) {
    localStorage.removeItem(SESSION_STORAGE_KEY);
    localStorage.removeItem(LEGACY_SESSION_STORAGE_KEY);
    return;
  }

  const payload = JSON.stringify(user);
  localStorage.setItem(SESSION_STORAGE_KEY, payload);
  localStorage.setItem(LEGACY_SESSION_STORAGE_KEY, payload);
}

function readStoredUser(): AuthUser | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const stored = localStorage.getItem(SESSION_STORAGE_KEY) ?? localStorage.getItem(LEGACY_SESSION_STORAGE_KEY);
  if (!stored) {
    return null;
  }

  try {
    const parsed = JSON.parse(stored) as Partial<AuthUser>;
    if (!parsed || typeof parsed !== 'object' || !parsed.email || !parsed.token || !parsed.id) {
      return null;
    }
    return {
      id: String(parsed.id),
      email: String(parsed.email),
      name: String(parsed.name || parsed.email.split('@')[0] || 'Authority'),
      role: parsed.role === 'admin' ? 'admin' : 'authority',
      token: String(parsed.token),
    };
  } catch {
    return null;
  }
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthUser> {
    const form = new URLSearchParams();
    form.append('username', credentials.email.trim());
    form.append('password', credentials.password);

    try {
      const tokenResponse = await apiClient.post<TokenResponse>('/api/v1/auth/login', form, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
        },
      });

      if (!tokenResponse?.access_token || !tokenResponse?.token_type) {
        throw new Error('Malformed backend authentication response');
      }

      const token = tokenResponse.access_token;
      const meResponse = await apiClient.get<BackendUserResponse>('/api/v1/auth/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!meResponse?.email) {
        throw new Error('Malformed backend user response');
      }

      const user = mapBackendUser(meResponse, token);
      persistSession(user);
      return user;
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        throw new Error('Invalid credentials');
      }
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Authentication failed');
    }
  },

  async logout(): Promise<void> {
    persistSession(null);
  },

  getCurrentUser(): AuthUser | null {
    return readStoredUser();
  },

  isAuthenticated(): boolean {
    return this.getCurrentUser() !== null;
  },

  getAuthHeaders(token?: string): Record<string, string> {
    const authToken = token ?? this.getCurrentUser()?.token;
    return authToken ? { Authorization: `Bearer ${authToken}` } : {};
  },

  async validateSession(token: string): Promise<AuthUser | null> {
    if (!token) {
      return null;
    }

    try {
      const user = await apiClient.get<BackendUserResponse>('/api/v1/auth/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!user?.email) {
        return null;
      }

      const mappedUser = mapBackendUser(user, token);
      persistSession(mappedUser);
      return mappedUser;
    } catch (error) {
      if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
        persistSession(null);
        return null;
      }
      return null;
    }
  },
};
