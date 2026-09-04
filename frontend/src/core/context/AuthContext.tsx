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
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = typeof window !== 'undefined' ? localStorage.getItem('civicfix_user') : null;
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = getAccessToken();

      // If no token exists, attempt a silent refresh first in case refresh cookie/storage exists
      if (!token) {
        try {
          await authService.refreshToken();
        } catch {
          // No active session
          setUser(null);
          if (typeof window !== 'undefined') {
            localStorage.removeItem('civicfix_user');
          }
          setLoading(false);
          return;
        }
      }

      try {
        const res = await authService.getMe();
        if (res.data) {
          setUser(res.data);
          if (typeof window !== 'undefined') {
            localStorage.setItem('civicfix_user', JSON.stringify(res.data));
          }
        }
      } catch {
        // Access token might be expired, attempt refresh
        try {
          const refreshRes = await authService.refreshToken();
          if (refreshRes.data?.accessToken) {
            const retryRes = await authService.getMe();
            if (retryRes.data) {
              setUser(retryRes.data);
              if (typeof window !== 'undefined') {
                localStorage.setItem('civicfix_user', JSON.stringify(retryRes.data));
              }
              return;
            }
          }
        } catch {
          // Refresh also failed
        }
        setAccessToken(null);
        setUser(null);
        if (typeof window !== 'undefined') {
          localStorage.removeItem('civicfix_user');
        }
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
      if (typeof window !== 'undefined') {
        localStorage.setItem('civicfix_user', JSON.stringify(res.data.user));
      }
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
      if (typeof window !== 'undefined') {
        localStorage.setItem('civicfix_user', JSON.stringify(res.data.user));
      }
      return res.data.user;
    }
    throw new Error(res.error || 'Registration failed');
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('civicfix_user');
    }
  };

  const refreshUser = async () => {
    try {
      const res = await authService.getMe();
      if (res.data) {
        setUser(res.data);
        if (typeof window !== 'undefined') {
          localStorage.setItem('civicfix_user', JSON.stringify(res.data));
        }
      }
    } catch {
      // silently ignore refresh failure
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
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
