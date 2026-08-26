export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: 'authority' | 'admin';
  token: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}
