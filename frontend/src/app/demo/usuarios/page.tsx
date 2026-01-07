'use client';

import { useState } from 'react';
import Link from 'next/link';

// Demo usuarios page for testing CRUD navigation without backend authentication

interface Usuario {
  id: number;
  nombre: string;
  email: string;
  rol: 'Admin' | 'Empleado' | 'Cliente';
  activo: boolean;
  empresaId?: number;
  empresaNombre?: string;
  ultimoAcceso: string;
  fechaCreacion: string;
}

const demoUsuarios: Usuario[] = [
  {
    id: 1,
    nombre: 'Admin Sistema',
    email: 'admin@mesadeayuda.com',
    rol: 'Admin',
    activo: true,
    ultimoAcceso: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    fechaCreacion: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 2,
    nombre: 'Carlos Soporte',
    email: 'carlos@mesadeayuda.com',
    rol: 'Empleado',
    activo: true,
    ultimoAcceso: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    fechaCreacion: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 3,
    nombre: 'Maria Tecnica',
    email: 'maria@mesadeayuda.com',
    rol: 'Empleado',
    activo: true,
    ultimoAcceso: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    fechaCreacion: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 4,
    nombre: 'Juan Perez',
    email: 'juan@empresa-demo.com',
    rol: 'Cliente',
    activo: true,
    empresaId: 1,
    empresaNombre: 'Empresa Demo SA',
    ultimoAcceso: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    fechaCreacion: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 5,
    nombre: 'Pedro Gonzalez',
    email: 'pedro@tecnologias-abc.com',
    rol: 'Cliente',
    activo: false,
    empresaId: 2,
    empresaNombre: 'Tecnologias ABC',
    ultimoAcceso: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    fechaCreacion: new Date(Date.now() - 50 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export default function DemoUsuariosPage() {
  const [activeTab, setActiveTab] = useState<'empleados' | 'clientes'>('empleados');

  const empleados = demoUsuarios.filter(u => u.rol === 'Admin' || u.rol === 'Empleado');
  const clientes = demoUsuarios.filter(u => u.rol === 'Cliente');
  const usuariosMostrados = activeTab === 'empleados' ? empleados : clientes;

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('es-ES', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(dateString));
  };

  const getRolBadgeClass = (rol: string) => {
    switch (rol) {
      case 'Admin':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      case 'Empleado':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'Cliente':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Breadcrumbs */}
        <nav className="flex items-center text-sm text-gray-500 dark:text-gray-400" aria-label="Breadcrumb">
          <Link href="/demo" className="hover:text-primary-600 dark:hover:text-primary-400">
            Inicio
          </Link>
          <svg className="mx-2 h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
          <span className="text-gray-900 dark:text-white font-medium">Usuarios</span>
        </nav>

        {/* Info Banner */}
        <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <h2 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
            Demo: Gestion de Usuarios
          </h2>
          <p className="text-sm text-blue-700 dark:text-blue-300">
            Esta pagina muestra la gestion de usuarios. Usa los botones <strong>Ver</strong> y <strong>Editar</strong>
            para probar la navegacion CRUD sin autenticacion.
          </p>
        </div>

        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Gestion de Usuarios
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Administra empleados y clientes del sistema
            </p>
          </div>
          <button className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors">
            Nuevo Usuario
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8" role="tablist">
            <button
              onClick={() => setActiveTab('empleados')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'empleados'
                  ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              role="tab"
              aria-selected={activeTab === 'empleados'}
              id="tab-empleados"
              aria-controls="tabpanel-empleados"
            >
              Empleados ({empleados.length})
            </button>
            <button
              onClick={() => setActiveTab('clientes')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'clientes'
                  ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              role="tab"
              aria-selected={activeTab === 'clientes'}
              id="tab-clientes"
              aria-controls="tabpanel-clientes"
            >
              Clientes ({clientes.length})
            </button>
          </nav>
        </div>

        {/* Users Table */}
        <div
          className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden"
          role="tabpanel"
          id={`tabpanel-${activeTab}`}
          aria-labelledby={`tab-${activeTab}`}
        >
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Usuario
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Rol
                  </th>
                  {activeTab === 'clientes' && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Empresa
                    </th>
                  )}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Ultimo Acceso
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                {usuariosMostrados.map((usuario) => (
                  <tr key={usuario.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {usuario.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <Link
                          href={`/demo/usuarios/${usuario.id}`}
                          className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:underline"
                        >
                          {usuario.nombre}
                        </Link>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {usuario.email}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRolBadgeClass(usuario.rol)}`}>
                        {usuario.rol}
                      </span>
                    </td>
                    {activeTab === 'clientes' && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {usuario.empresaNombre || '-'}
                      </td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          usuario.activo
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                        }`}
                      >
                        {usuario.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(usuario.ultimoAcceso)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                      <Link
                        href={`/demo/usuarios/${usuario.id}`}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        Ver
                      </Link>
                      <Link
                        href={`/demo/usuarios/${usuario.id}/editar`}
                        className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                      >
                        Editar
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
