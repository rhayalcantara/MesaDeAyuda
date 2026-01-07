'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Header from './Header';
import Sidebar from './Sidebar';
import { cn } from '@/lib/utils';

interface MainLayoutProps {
  children: React.ReactNode;
  requiredRoles?: ('Admin' | 'Empleado' | 'Cliente')[];
}

export default function MainLayout({ children, requiredRoles }: MainLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (!isLoading && user && requiredRoles && !requiredRoles.includes(user.rol)) {
      // Redirect to appropriate dashboard based on role
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
    }
  }, [user, isLoading, requiredRoles, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (requiredRoles && !requiredRoles.includes(user.rol)) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)} />
      <Sidebar collapsed={sidebarCollapsed} />
      <main
        className={cn(
          'pt-16 transition-all duration-300',
          sidebarCollapsed ? 'ml-16' : 'ml-64'
        )}
      >
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
