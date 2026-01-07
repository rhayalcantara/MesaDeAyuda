'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { User, LoginRequest, LoginResponse } from '@/types';
import api from '@/lib/api';
import toast from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setIsLoading(false);
        return;
      }

      // Check for demo mode first (when backend is not available)
      const demoUser = localStorage.getItem('demo_user');
      if (token.startsWith('demo-token-') && demoUser) {
        const user = JSON.parse(demoUser) as User;
        setUser(user);
        setIsLoading(false);
        return;
      }

      const response = await api.get<User>('/auth/me');
      setUser(response.data);
    } catch (error) {
      // If API fails, check for demo user as fallback
      const demoUser = localStorage.getItem('demo_user');
      if (demoUser) {
        try {
          const user = JSON.parse(demoUser) as User;
          setUser(user);
          setIsLoading(false);
          return;
        } catch {
          // Invalid demo user, clear storage
        }
      }
      localStorage.removeItem('token');
      localStorage.removeItem('demo_user');
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (credentials: LoginRequest) => {
    try {
      const response = await api.post<LoginResponse>('/auth/login', credentials);
      const { token, user } = response.data;

      localStorage.setItem('token', token);
      setUser(user);

      // Check if password change is required
      if (user.requiereCambioPassword) {
        router.push('/cambiar-password');
        return;
      }

      // Redirect based on role
      switch (user.rol) {
        case 'Admin':
          router.push('/admin/dashboard');
          break;
        case 'Empleado':
          router.push('/empleado/dashboard');
          break;
        case 'Cliente':
          router.push('/cliente/tickets');
          break;
      }

      toast.success(`Bienvenido, ${user.nombre}`);
    } catch (error: any) {
      const message = error.response?.data?.message || 'Error al iniciar sesion';
      toast.error(message);
      throw error;
    }
  };

  const logout = async () => {
    try {
      // Only call API if not in demo mode
      const token = localStorage.getItem('token');
      if (!token?.startsWith('demo-token-')) {
        await api.post('/auth/logout');
      }
    } catch (error) {
      // Ignore logout errors
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('demo_user');
      setUser(null);
      router.push('/login');
      toast.success('Sesion cerrada');
    }
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
