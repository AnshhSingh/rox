import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { apiClient } from '../utils/apiClient';

export type User = { id: string; name: string; email: string; role: 'ADMIN' | 'USER' | 'OWNER' } | null;

type AuthContextValue = {
  user: User;
  token: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('auth');
    if (saved) {
      const parsed = JSON.parse(saved);
      setUser(parsed.user);
      setToken(parsed.token);
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await apiClient<{ user: User; token: string }>('/api/auth/login', { 
        method: 'POST', 
        body: JSON.stringify({ email, password }) 
      });
      setUser(response.user);
      setToken(response.token);
      localStorage.setItem('auth', JSON.stringify({ user: response.user, token: response.token }));
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
    localStorage.setItem('auth', JSON.stringify({ user: data.user, token: data.token }));
    return true;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('auth');
  };

  const value = useMemo(() => ({ user, token, login, logout }), [user, token]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export const authHeader = (token: string | null): Record<string, string> => token ? { Authorization: `Bearer ${token}` } : {};
