'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function Home() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (user) {
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
          default:
            router.push('/login');
        }
      } else {
        router.push('/login');
      }
    }
  }, [user, isLoading, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
        <p className="mt-4 text-gray-600 dark:text-gray-400">Cargando...</p>
      </div>
    </div>
  );
}
