'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTheme } from '@/context/ThemeContext';

// Demo login page to test role-based access control without backend
// This sets a mock user in localStorage to simulate different roles

const mockUsers = {
  admin: {
    id: 1,
    email: 'admin@mdayuda.com',
    nombre: 'Admin Demo',
    rol: 'Admin' as const,
    empresaId: null,
    activo: true,
    requiereCambioPassword: false,
    fechaCreacion: new Date().toISOString(),
  },
  empleado: {
    id: 2,
    email: 'empleado@mdayuda.com',
    nombre: 'Empleado Demo',
    rol: 'Empleado' as const,
    empresaId: null,
    activo: true,
    requiereCambioPassword: false,
    fechaCreacion: new Date().toISOString(),
  },
  cliente: {
    id: 3,
    email: 'cliente@demo.com',
    nombre: 'Cliente Demo',
    rol: 'Cliente' as const,
    empresaId: 1,
    activo: true,
    requiereCambioPassword: false,
    fechaCreacion: new Date().toISOString(),
  },
};

export default function DemoLoginPage() {
  const [selectedRole, setSelectedRole] = useState<'admin' | 'empleado' | 'cliente'>('cliente');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect');
  const { theme, toggleTheme } = useTheme();

  // Validate that redirect URL is appropriate for the user's role
  const validateRedirectForRole = (url: string, role: string): boolean => {
    // Admin can access anything
    if (role === 'Admin') return true;

    // Empleado can access empleado and some admin routes
    if (role === 'Empleado') {
      return url.startsWith('/empleado/') || url.startsWith('/admin/tickets');
    }

    // Cliente can only access cliente routes
    if (role === 'Cliente') {
      return url.startsWith('/cliente/');
    }

    return false;
  };

  const handleDemoLogin = () => {
    setIsLoading(true);

    // Clear any existing session data first
    localStorage.removeItem('token');
    localStorage.removeItem('demo_user');

    // Set mock token and user in localStorage
    const user = mockUsers[selectedRole];
    localStorage.setItem('token', 'demo-token-' + selectedRole);
    localStorage.setItem('demo_user', JSON.stringify(user));

    // Redirect based on role - use window.location to force full page reload
    // This ensures AuthContext picks up the new user
    setTimeout(() => {
      // Check if we have a valid redirect URL for this role
      if (redirectUrl && validateRedirectForRole(redirectUrl, user.rol)) {
        window.location.href = redirectUrl;
        return;
      }

      // Default redirect based on role
      switch (user.rol) {
        case 'Admin':
          window.location.href = '/admin/dashboard';
          break;
        case 'Empleado':
          window.location.href = '/empleado/dashboard';
          break;
        case 'Cliente':
          window.location.href = '/cliente/tickets';
          break;
      }
    }, 300);
  };

  const handleTestAdminAccess = () => {
    setIsLoading(true);

    // Set as Cliente user
    const user = mockUsers.cliente;
    localStorage.setItem('token', 'demo-token-cliente');
    localStorage.setItem('demo_user', JSON.stringify(user));

    // Try to access admin route - should redirect to cliente/tickets
    setTimeout(() => {
      router.push('/admin/usuarios');
    }, 500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div role="alert" aria-live="assertive" className="sr-only" />

      <button
        onClick={toggleTheme}
        className="absolute top-4 right-4 p-2 rounded-lg bg-white dark:bg-gray-800 shadow-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        aria-label="Toggle theme"
      >
        <svg
          className="h-5 w-5 text-gray-600 dark:text-gray-300"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          aria-hidden="true"
        >
          {theme === 'dark' ? (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"
            />
          ) : (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z"
            />
          )}
        </svg>
      </button>

      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 md:p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-primary-600 dark:text-primary-400">
              MDAyuda
            </h1>
            <h2 className="mt-2 text-xl font-semibold text-gray-900 dark:text-white">
              Demo Login
            </h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Selecciona un rol para probar el sistema sin backend
            </p>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Seleccionar Rol
              </label>
              <div className="space-y-2">
                {[
                  { value: 'admin', label: 'Administrador', description: 'Acceso completo a todas las funciones' },
                  { value: 'empleado', label: 'Empleado', description: 'Gestión de tickets y solicitudes' },
                  { value: 'cliente', label: 'Cliente', description: 'Crear y ver sus propios tickets' },
                ].map((role) => (
                  <label
                    key={role.value}
                    className={`flex items-start p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedRole === role.value
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value={role.value}
                      checked={selectedRole === role.value}
                      onChange={(e) => setSelectedRole(e.target.value as any)}
                      className="mt-1 h-4 w-4 text-primary-600 border-gray-300 focus:ring-primary-500"
                    />
                    <div className="ml-3">
                      <span className="block text-sm font-medium text-gray-900 dark:text-white">
                        {role.label}
                      </span>
                      <span className="block text-xs text-gray-500 dark:text-gray-400">
                        {role.description}
                      </span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <button
              onClick={handleDemoLogin}
              disabled={isLoading}
              className="w-full py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Cargando...' : `Iniciar como ${selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)}`}
            </button>

            <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 text-center">
                Prueba de Seguridad
              </p>
              <button
                onClick={handleTestAdminAccess}
                disabled={isLoading}
                className="w-full py-2 px-4 border border-red-300 dark:border-red-600 rounded-lg text-sm font-medium text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                🔒 Probar: Cliente accede a /admin/usuarios
              </button>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-2 text-center">
                Debería redirigir a /cliente/tickets
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
