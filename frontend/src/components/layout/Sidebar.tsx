'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import {
  HomeIcon,
  TicketIcon,
  BuildingOfficeIcon,
  UsersIcon,
  TagIcon,
  DocumentCheckIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  PlusCircleIcon,
  ClipboardDocumentListIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const adminNavItems: NavItem[] = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: HomeIcon },
  { name: 'Tickets', href: '/admin/tickets', icon: TicketIcon },
  { name: 'Empresas', href: '/admin/empresas', icon: BuildingOfficeIcon },
  { name: 'Usuarios', href: '/admin/usuarios', icon: UsersIcon },
  { name: 'Categorias', href: '/admin/categorias', icon: TagIcon },
  { name: 'Solicitudes', href: '/admin/solicitudes', icon: DocumentCheckIcon },
  { name: 'Reportes', href: '/admin/reportes', icon: ChartBarIcon },
  { name: 'Configuracion', href: '/admin/configuracion', icon: Cog6ToothIcon },
];

const empleadoNavItems: NavItem[] = [
  { name: 'Dashboard', href: '/empleado/dashboard', icon: HomeIcon },
  { name: 'Todos los Tickets', href: '/empleado/tickets', icon: TicketIcon },
  { name: 'Mis Tickets', href: '/empleado/mis-tickets', icon: ClipboardDocumentListIcon },
  { name: 'Sin Asignar', href: '/empleado/sin-asignar', icon: TicketIcon },
  { name: 'Solicitudes', href: '/empleado/solicitudes', icon: DocumentCheckIcon },
];

const clienteNavItems: NavItem[] = [
  { name: 'Mis Tickets', href: '/cliente/tickets', icon: TicketIcon },
  { name: 'Crear Ticket', href: '/cliente/tickets/nuevo', icon: PlusCircleIcon },
];

interface SidebarProps {
  collapsed?: boolean;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export default function Sidebar({ collapsed = false, mobileOpen = false, onMobileClose }: SidebarProps) {
  const pathname = usePathname();
  const { user } = useAuth();

  const getNavItems = (): NavItem[] => {
    switch (user?.rol) {
      case 'Admin':
        return adminNavItems;
      case 'Empleado':
        return empleadoNavItems;
      case 'Cliente':
        return clienteNavItems;
      default:
        return [];
    }
  };

  const navItems = getNavItems();

  const handleLinkClick = () => {
    // Close mobile menu when a link is clicked
    if (onMobileClose) {
      onMobileClose();
    }
  };

  return (
    <aside
      className={cn(
        'fixed left-0 top-16 h-[calc(100vh-4rem)] bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 z-40',
        // Mobile: hidden by default, shown as slide-in when mobileOpen
        'hidden md:block',
        mobileOpen && 'block',
        // Desktop: collapsed state
        collapsed ? 'md:w-16' : 'md:w-64',
        // Mobile: always full width when visible (but maxed at 64)
        'w-64'
      )}
    >
      {/* Mobile close button */}
      <div className="md:hidden flex justify-end p-2">
        <button
          onClick={onMobileClose}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          aria-label="Cerrar menu"
        >
          <XMarkIcon className="h-6 w-6 text-gray-600 dark:text-gray-300" aria-hidden="true" />
        </button>
      </div>

      <nav className="h-full overflow-y-auto py-2 md:py-4">
        <ul className="space-y-1 px-3">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + '/');

            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  onClick={handleLinkClick}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/50 dark:text-primary-300'
                      : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                  )}
                  title={collapsed ? item.name : undefined}
                >
                  <item.icon className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
                  {/* On mobile always show text, on desktop respect collapsed state */}
                  <span className={cn('md:hidden', !collapsed && 'md:inline')}>
                    {item.name}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
