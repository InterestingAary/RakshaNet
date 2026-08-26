import { AuthUser, LoginCredentials } from '@/types';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const MOCK_AUTHORITY: AuthUser = {
  id: 'auth-1',
  name: 'System Authority',
  email: 'authority@sih26191.gov.in',
  role: 'admin', token: 'mock-token-123',
};

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthUser> {
    await delay(400);
    if (credentials.email === 'authority@sih26191.gov.in' && credentials.password === 'Demo@2026') {
      localStorage.setItem('sih_auth_user', JSON.stringify(MOCK_AUTHORITY));
      return MOCK_AUTHORITY;
    }
    throw new Error('Invalid credentials');
  },
  
  async logout(): Promise<void> {
    await delay(300);
    localStorage.removeItem('sih_auth_user');
  },
  
  getCurrentUser(): AuthUser | null {
    if (typeof window === 'undefined') return null;
    const userStr = localStorage.getItem('sih_auth_user');
    if (!userStr) return null;
    try {
      return JSON.parse(userStr) as AuthUser;
    } catch {
      return null;
    }
  },
  
  isAuthenticated(): boolean {
    return this.getCurrentUser() !== null;
  },
  
  async validateSession(token: string): Promise<AuthUser | null> {
    await delay(300);
    return this.getCurrentUser();
  }
};
