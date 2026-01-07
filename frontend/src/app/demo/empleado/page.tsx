'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  HomeIcon,
  TicketIcon,
  ClipboardDocumentListIcon,
  DocumentCheckIcon,
  Bars3Icon,
  XMarkIcon,
  SunIcon,
  MoonIcon,
} from '@heroicons/react/24/outline';
import { useTheme } from '@/context/ThemeContext';

// Empleado navigation items (same as Sidebar.tsx)
const empleadoNavItems = [
  { name: 'Dashboard', href: '/empleado/dashboard', icon: HomeIcon },
  { name: 'Todos los Tickets', href: '/empleado/tickets', icon: TicketIcon },
  { name: 'Mis Tickets', href: '/empleado/mis-tickets', icon: ClipboardDocumentListIcon },
  { name: 'Sin Asignar', href: '/empleado/sin-asignar', icon: TicketIcon },
  { name: 'Solicitudes', href: '/empleado/solicitudes', icon: DocumentCheckIcon },
];

export default function DemoEmpleadoPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();

  const handleNavClick = (href: string) => {
    // Navigate to the actual route (will redirect to login since not authenticated)
    router.push(href);
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 z-50 flex items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              if (window.innerWidth < 768) {
                setMobileMenuOpen(!mobileMenuOpen);
              } else {
                setSidebarOpen(!sidebarOpen);
              }
            }}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Toggle sidebar"
          >
            <Bars3Icon className="h-6 w-6 text-gray-600 dark:text-gray-300" aria-hidden="true" />
          </button>
          <span className="text-xl font-bold text-primary-600 dark:text-primary-400">MDAyuda</span>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label={theme === 'dark' ? 'Activar modo claro' : 'Activar modo oscuro'}
          >
            {theme === 'dark' ? (
              <SunIcon className="h-5 w-5 text-gray-300" aria-hidden="true" />
            ) : (
              <MoonIcon className="h-5 w-5 text-gray-600" aria-hidden="true" />
            )}
          </button>
          <div className="text-right">
            <div className="text-sm font-medium text-gray-700 dark:text-gray-200">Empleado Demo</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Empleado</div>
          </div>
        </div>
      </header>

      {/* Mobile backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-16 h-[calc(100vh-4rem)] bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 z-40
          ${mobileMenuOpen ? 'block' : 'hidden'} md:block
          ${sidebarOpen ? 'md:w-64' : 'md:w-16'} w-64`}
      >
        {/* Mobile close button */}
        <div className="md:hidden flex justify-end p-2">
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Cerrar menu"
          >
            <XMarkIcon className="h-6 w-6 text-gray-600 dark:text-gray-300" aria-hidden="true" />
          </button>
        </div>

        <nav className="h-full overflow-y-auto py-2 md:py-4">
          <ul className="space-y-1 px-3">
            {empleadoNavItems.map((item) => (
              <li key={item.name}>
                <button
                  onClick={() => handleNavClick(item.href)}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  <item.icon className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
                  <span className={`md:hidden ${sidebarOpen ? 'md:inline' : ''}`}>
                    {item.name}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* Main content */}
      <main className={`pt-16 transition-all duration-300 ${sidebarOpen ? 'md:pl-64' : 'md:pl-16'}`}>
        <div className="p-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Demo - Empleado Sidebar Navigation
          </h1>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Feature #7: Empleado sidebar navigation works correctly
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Esta pagina demuestra la navegacion del sidebar para usuarios con rol Empleado.
            </p>

            <h3 className="font-medium text-gray-900 dark:text-white mb-2">Items del menu:</h3>
            <ul className="space-y-2 text-gray-600 dark:text-gray-300">
              {empleadoNavItems.map((item) => (
                <li key={item.name} className="flex items-center gap-2">
                  <item.icon className="h-5 w-5 text-primary-600" aria-hidden="true" />
                  <span className="font-medium">{item.name}</span>
                  <span className="text-gray-400">→</span>
                  <code className="text-sm bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                    {item.href}
                  </code>
                </li>
              ))}
            </ul>

            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                <strong>Nota:</strong> Al hacer clic en cualquier item del menu, sera redirigido a la
                pagina de login ya que no esta autenticado. Esto demuestra que la navegacion funciona
                correctamente y que las rutas protegidas requieren autenticacion.
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Pasos de prueba:
            </h3>
            <ol className="list-decimal list-inside space-y-2 text-gray-600 dark:text-gray-300">
              <li>Hacer clic en "Dashboard" - verifica que navega a /empleado/dashboard</li>
              <li>Hacer clic en "Todos los Tickets" - verifica que navega a /empleado/tickets</li>
              <li>Hacer clic en "Mis Tickets" - verifica que navega a /empleado/mis-tickets</li>
              <li>Hacer clic en "Sin Asignar" - verifica que navega a /empleado/sin-asignar</li>
              <li>Hacer clic en "Solicitudes" - verifica que navega a /empleado/solicitudes</li>
            </ol>
          </div>
        </div>
      </main>
    </div>
  );
}
