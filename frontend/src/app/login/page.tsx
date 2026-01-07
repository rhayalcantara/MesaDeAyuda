'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { MoonIcon, SunIcon } from '@heroicons/react/24/outline';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Pass the redirect URL if present (from ?redirect= query param)
      await login({ email, password }, redirectUrl || undefined);
    } catch (err: any) {
      // Handle different types of errors
      if (err.code === 'ERR_NETWORK' || err.message === 'Network Error') {
        setError('No se pudo conectar al servidor. Por favor, verifique su conexion a internet e intente nuevamente.');
      } else if (err.response?.status === 401) {
        setError('Credenciales incorrectas. Por favor, verifique su correo y contrasena.');
      } else if (err.response?.status === 403) {
        setError('Su cuenta ha sido desactivada. Contacte al administrador.');
      } else if (err.response?.status >= 500) {
        setError('Error en el servidor. Por favor, intente nuevamente mas tarde.');
      } else {
        setError(err.response?.data?.message || 'Error al iniciar sesion. Por favor, intente nuevamente.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="absolute top-4 right-4">
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-shadow"
          aria-label="Toggle theme"
        >
          {theme === 'light' ? (
            <MoonIcon className="h-6 w-6 text-gray-600 dark:text-gray-300" aria-hidden="true" />
          ) : (
            <SunIcon className="h-6 w-6 text-gray-600 dark:text-gray-300" aria-hidden="true" />
          )}
        </button>
      </div>

      <div className="max-w-md w-full space-y-8">
        <div>
          <h1 className="text-center text-4xl font-bold text-primary-600 dark:text-primary-400">
            MDAyuda
          </h1>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            Iniciar Sesion
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Ingresa tus credenciales para acceder al sistema
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="card p-6 space-y-4">
            {error && (
              <div
                id="login-error"
                role="alert"
                aria-live="assertive"
                className="bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg text-sm"
              >
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="label">
                Correo electronico
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`input ${error ? 'border-red-300 dark:border-red-700' : ''}`}
                placeholder="correo@ejemplo.com"
                aria-invalid={error ? 'true' : undefined}
                aria-describedby={error ? 'login-error' : undefined}
              />
            </div>

            <div>
              <label htmlFor="password" className="label">
                Contrasena
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`input ${error ? 'border-red-300 dark:border-red-700' : ''}`}
                placeholder="••••••••"
                aria-invalid={error ? 'true' : undefined}
                aria-describedby={error ? 'login-error' : undefined}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full py-3"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Iniciando sesion...
                </span>
              ) : (
                'Iniciar Sesion'
              )}
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              ¿No tienes una cuenta?{' '}
              <Link
                href="/solicitar-registro"
                className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400"
              >
                Solicitar registro
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
