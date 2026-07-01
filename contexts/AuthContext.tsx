'use client';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '@/lib/api';

interface AuthState {
  token: string | null;
  email: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthState>({} as AuthState);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const t = localStorage.getItem('bol_token');
    const e = localStorage.getItem('bol_email');
    if (t) { setToken(t); setEmail(e); }
    setIsLoading(false);
  }, []);

  const login = async (emailInput: string, password: string) => {
    const data = await api<{ token: string; email: string }>('/api/users/login', {
      method: 'POST',
      body: JSON.stringify({ email: emailInput, password }),
      skipAuth: true,
    });
    localStorage.setItem('bol_token', data.token);
    localStorage.setItem('bol_email', data.email);
    setToken(data.token);
    setEmail(data.email);
  };

  const logout = () => {
    localStorage.removeItem('bol_token');
    localStorage.removeItem('bol_email');
    setToken(null);
    setEmail(null);
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ token, email, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
