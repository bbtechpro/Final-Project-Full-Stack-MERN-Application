// src/context/AuthContext.tsx
import React, { createContext, useState, useEffect } from 'react';
import type { User, AuthResponse } from '../interfaces/index';
import apiClient from '../services/apiClient';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (credentials: object) => Promise<void>;
  register: (payload: object) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('authUser');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem('authUser');
      }
    }
    setLoading(false);
  }, []);

  const login = async (credentials: object) => {
    const res = await apiClient.post<AuthResponse>('/auth/login', credentials);
    localStorage.setItem('token', res.data.token);
    localStorage.setItem('authUser', JSON.stringify(res.data.user));
    setUser(res.data.user);
  };

  const register = async (payload: object) => {
    await apiClient.post('/auth/register', payload);
  };

  const logout = async () => {
    await apiClient.post('/auth/logout');
    localStorage.removeItem('token');
    localStorage.removeItem('authUser');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
