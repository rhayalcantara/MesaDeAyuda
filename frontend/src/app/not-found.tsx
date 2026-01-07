'use client';

import Link from 'next/link';
import { useTheme } from '@/context/ThemeContext';
import { MoonIcon, SunIcon } from '@heroicons/react/24/outline';

export default function NotFound() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="absolute top-4 right-4">
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-shadow"
          aria-label="Toggle theme"
        >
          {theme === 'light' ? (
            <MoonIcon className="h-6 w-6 text-gray-600 dark:text-gray-300" />
          ) : (
            <SunIcon className="h-6 w-6 text-gray-600 dark:text-gray-300" />
          )}
        </button>
      </div>

      <div className="text-center">
        <h1 className="text-6xl font-bold text-primary-600 dark:text-primary-400 mb-4">
          404
        </h1>
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
          Pagina no encontrada
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md">
          Lo sentimos, la pagina que buscas no existe o ha sido movida.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="btn-primary px-6 py-3"
          >
            Ir al inicio
          </Link>
          <Link
            href="/login"
            className="btn-secondary px-6 py-3"
          >
            Iniciar sesion
          </Link>
        </div>
      </div>
    </div>
  );
}
