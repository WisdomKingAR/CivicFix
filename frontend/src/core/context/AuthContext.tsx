// frontend/src/core/context/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, Role } from '../types';
import { setAccessToken, getAccessToken } from '../api/client';
import { authService } from '../../features/auth/services/authService';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (payload: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    role?: 'CITIZEN' | 'AUTHORITY';
    jurisdiction?: string;
  }) => Promise<User>;
  logout: () => Promise<void>;
  demoLogin: (role: Role) => Promise<User>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        // Attempt cookie-based token refresh on initial load
        await authService.refreshToken().catch(() => null);
        const res = await authService.getMe();
        if (res.data) {
          setUser(res.data);
        }
      } catch {
        setAccessToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    initAuth();
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    const res = await authService.login({ email, password });
    if (res.data?.user) {
      setUser(res.data.user);
      return res.data.user;
    }
    throw new Error(res.error || 'Login failed');
  };

  const register = async (payload: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    role?: 'CITIZEN' | 'AUTHORITY';
    jurisdiction?: string;
  }): Promise<User> => {
    const res = await authService.register(payload);
    if (res.data?.user) {
      setUser(res.data.user);
      return res.data.user;
    }
    throw new Error(res.error || 'Registration failed');
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  const demoLogin = async (role: Role): Promise<User> => {
    const credentialsMap: Record<Role, { email: string; pass: string }> = {
      CITIZEN: { email: 'citizen@civicfix.com', pass: 'HackDemo@2025' },
      AUTHORITY: { email: 'authority@civicfix.com', pass: 'HackAuth@2025' },
      ADMIN: { email: 'admin@civicfix.com', pass: 'HackAdmin@2025' },
    };

    const target = credentialsMap[role];
    return await login(target.email, target.pass);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, demoLogin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
