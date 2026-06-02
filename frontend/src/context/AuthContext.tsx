// src/context/AuthContext.tsx
import React, { createContext, useState, useEffect } from 'react';
import { User, AuthResponse } from '../interfaces';
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
    const bootstrapAuth = async () => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        try {
          // Attempt token refresh on first page mount to pull state context safely
          const res = await axios.post('http://localhost:5000/api/auth/refresh', {}, { withCredentials: true });
          localStorage.setItem('accessToken', res.data.accessToken);
          // Assuming an optional endpoint to fetch current profile details
          // const profile = await apiClient.get('/users/me'); 
        } catch {
          localStorage.removeItem('accessToken');
        }
      }
      setLoading(false);
    };
    bootstrapAuth();
  }, []);

  const login = async (credentials: object) => {
    const res = await apiClient.post<AuthResponse>('/auth/login', credentials);
    localStorage.setItem('accessToken', res.data.accessToken);
    setUser(res.data.user);
  };

  const register = async (payload: object) => {
    await apiClient.post('/auth/register', payload);
  };

  const logout = async () => {
    await apiClient.post('/auth/logout');
    localStorage.removeItem('accessToken');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
