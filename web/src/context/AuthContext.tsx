/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { apiClient } from '../api/client';
import type { AuthResponse, User } from '../types';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshMe: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const USER_STORAGE_KEY = 'currentUser';

function readStoredUser(): User | null {
  const userText = localStorage.getItem(USER_STORAGE_KEY);
  if (!userText) {
    return null;
  }
  try {
    return JSON.parse(userText) as User;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => readStoredUser());
  const [loading, setLoading] = useState(false);

  const saveAuth = useCallback((data: AuthResponse) => {
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(data.user));
    setUser(data.user);
  }, []);

  const clearAuth = useCallback(() => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem(USER_STORAGE_KEY);
    setUser(null);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    try {
      const response = await apiClient.post<AuthResponse>('/auth/login', { email, password });
      saveAuth(response.data);
    } finally {
      setLoading(false);
    }
  }, [saveAuth]);

  const register = useCallback(async (name: string, email: string, password: string) => {
    setLoading(true);
    try {
      const response = await apiClient.post<AuthResponse>('/auth/register', {
        name,
        email,
        password,
      });
      saveAuth(response.data);
    } finally {
      setLoading(false);
    }
  }, [saveAuth]);

  const refreshMe = useCallback(async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      clearAuth();
      return;
    }
    try {
      const response = await apiClient.get<User>('/auth/me');
      setUser(response.data);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(response.data));
    } catch {
      clearAuth();
    }
  }, [clearAuth]);

  const logout = useCallback(() => clearAuth(), [clearAuth]);

  const value = useMemo(
    () => ({ user, loading, login, register, logout, refreshMe }),
    [user, loading, login, register, logout, refreshMe],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
