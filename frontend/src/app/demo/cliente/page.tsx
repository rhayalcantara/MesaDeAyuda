'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

// Demo page to test Cliente sidebar navigation without backend authentication
// This simulates a logged-in Cliente user

const clienteNavItems = [
  {
    name: 'Mis Tickets',
    href: '/cliente/tickets',
    icon: 'M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 010 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 010-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375z'
  },
  {
    name: 'Crear Ticket',
    href: '/cliente/tickets/nuevo',
    icon: 'M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z'
  },
];

export default function DemoClientePage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleToggleSidebar = () => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setMobileMenuOpen(!mobileMenuOpen);
    } else {
      setSidebarCollapsed(!sidebarCollapsed);
    }
  };

  const handleMobileMenuClose = () => {
    setMobileMenuOpen(false);
  };

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 z-50">
        <div className="h-full px-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={handleToggleSidebar}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Toggle sidebar"
            >
              <svg className="h-6 w-6 text-gray-600 dark:text-gray-300" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            </button>
            <span className="text-xl font-bold text-primary-600 dark:text-primary-400">
              MDAyuda
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 hidden sm:block">
              Cliente Demo
            </span>
            <span className="inline-block px-2 py-0.5 text-xs font-medium rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
              Cliente
            </span>
          </div>
        </div>
      </header>

      {/* Mobile backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={handleMobileMenuClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-16 h-[calc(100vh-4rem)] bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 z-40',
          'hidden md:block',
          mobileMenuOpen && 'block',
          sidebarCollapsed ? 'md:w-16' : 'md:w-64',
          'w-64'
        )}
      >
        {/* Mobile close button */}
        <div className="md:hidden flex justify-end p-2">
          <button
            onClick={handleMobileMenuClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Cerrar menu"
          >
            <svg className="h-6 w-6 text-gray-600 dark:text-gray-300" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <nav className="h-full overflow-y-auto py-2 md:py-4">
          <ul className="space-y-1 px-3">
            {clienteNavItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');

              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    onClick={handleMobileMenuClose}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/50 dark:text-primary-300'
                        : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                    )}
                    title={sidebarCollapsed ? item.name : undefined}
                  >
                    <svg className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                    </svg>
                    <span className={cn('md:hidden', !sidebarCollapsed && 'md:inline')}>
                      {item.name}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>

      {/* Main content */}
      <main
        className={cn(
          'pt-16 transition-all duration-300',
          'ml-0',
          sidebarCollapsed ? 'md:ml-16' : 'md:ml-64'
        )}
      >
        <div className="p-4 md:p-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Demo - Cliente Sidebar Navigation
          </h1>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 md:p-6">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Esta pagina demuestra la navegacion del sidebar para el rol Cliente.
            </p>
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Items del Menu:
                </h2>
                <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-400">
                  <li><strong>Mis Tickets</strong> - Navega a /cliente/tickets</li>
                  <li><strong>Crear Ticket</strong> - Navega a /cliente/tickets/nuevo</li>
                </ul>
              </div>
              <div className="mt-6 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                  <strong>Instrucciones de prueba:</strong>
                </p>
                <ol className="list-decimal list-inside text-sm text-gray-500 dark:text-gray-400 space-y-1">
                  <li>Haz clic en &quot;Mis Tickets&quot; en el sidebar</li>
                  <li>Verifica que la URL cambia a /cliente/tickets</li>
                  <li>Regresa a esta pagina</li>
                  <li>Haz clic en &quot;Crear Ticket&quot; en el sidebar</li>
                  <li>Verifica que la URL cambia a /cliente/tickets/nuevo</li>
                </ol>
              </div>
              <div className="mt-4">
                <Link
                  href="/demo/cliente"
                  className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Volver a esta pagina
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
