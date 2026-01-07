'use client';

import Link from 'next/link';

// Demo categorias page for testing CRUD navigation without backend authentication

interface Categoria {
  id: number;
  nombre: string;
  descripcion: string | null;
  activa: boolean;
  fechaCreacion: string;
  ticketsCount: number;
}

const demoCategorias: Categoria[] = [
  {
    id: 1,
    nombre: 'Sistema de Facturacion',
    descripcion: 'Problemas relacionados con el modulo de facturacion, incluyendo generacion de facturas, reportes y configuracion.',
    activa: true,
    fechaCreacion: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
    ticketsCount: 45,
  },
  {
    id: 2,
    nombre: 'Portal Web',
    descripcion: 'Incidencias del portal web publico, acceso de usuarios y funcionalidades online.',
    activa: true,
    fechaCreacion: new Date(Date.now() - 80 * 24 * 60 * 60 * 1000).toISOString(),
    ticketsCount: 32,
  },
  {
    id: 3,
    nombre: 'Aplicacion Movil',
    descripcion: 'Soporte para la aplicacion movil en iOS y Android.',
    activa: true,
    fechaCreacion: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    ticketsCount: 28,
  },
  {
    id: 4,
    nombre: 'Integraciones API',
    descripcion: 'Problemas con integraciones de terceros y API REST.',
    activa: true,
    fechaCreacion: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
    ticketsCount: 15,
  },
  {
    id: 5,
    nombre: 'Sistema Legacy',
    descripcion: 'Sistema anterior en proceso de migracion - solo mantenimiento.',
    activa: false,
    fechaCreacion: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(),
    ticketsCount: 0,
  },
];

export default function DemoCategoriasPage() {
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
          <span className="text-gray-900 dark:text-white font-medium">Categorias</span>
        </nav>

        {/* Info Banner */}
        <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <h2 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
            Demo: Gestion de Categorias
          </h2>
          <p className="text-sm text-blue-700 dark:text-blue-300">
            Las categorias representan los sistemas o areas sobre los cuales los clientes pueden reportar problemas.
            Usa el boton <strong>Editar</strong> para probar la navegacion CRUD.
          </p>
        </div>

        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Gestion de Categorias
          </h1>
          <button className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors">
            Nueva Categoria
          </button>
        </div>

        {/* Categorias Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Nombre
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Descripcion
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Tickets
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Fecha Creacion
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                {demoCategorias.map((categoria) => (
                  <tr key={categoria.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {categoria.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link
                        href={`/demo/categorias/${categoria.id}`}
                        className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:underline"
                      >
                        {categoria.nombre}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 max-w-xs truncate" title={categoria.descripcion || ''}>
                      {categoria.descripcion || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {categoria.ticketsCount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          categoria.activa
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                        }`}
                      >
                        {categoria.activa ? 'Activa' : 'Inactiva'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {new Date(categoria.fechaCreacion).toLocaleDateString('es-ES')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                      <Link
                        href={`/demo/categorias/${categoria.id}`}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        Ver
                      </Link>
                      <Link
                        href={`/demo/categorias/${categoria.id}/editar`}
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
