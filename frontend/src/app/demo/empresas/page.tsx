'use client';

import Link from 'next/link';

// Demo empresas list page for testing breadcrumbs without backend authentication

interface Empresa {
  id: number;
  nombre: string;
  configVisibilidadTickets: string;
  colorPrimario: string;
  activa: boolean;
  fechaCreacion: string;
}

const demoEmpresas: Empresa[] = [
  {
    id: 1,
    nombre: 'Empresa Demo SA',
    configVisibilidadTickets: 'propios',
    colorPrimario: '#2563eb',
    activa: true,
    fechaCreacion: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 2,
    nombre: 'Tecnologias ABC',
    configVisibilidadTickets: 'empresa',
    colorPrimario: '#16a34a',
    activa: true,
    fechaCreacion: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 3,
    nombre: 'Consultores XYZ',
    configVisibilidadTickets: 'propios',
    colorPrimario: '#dc2626',
    activa: false,
    fechaCreacion: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export default function DemoEmpresasPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Breadcrumbs */}
        <nav className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-6" aria-label="Breadcrumb">
          <Link href="/demo" className="hover:text-primary-600 dark:hover:text-primary-400">
            Inicio
          </Link>
          <svg className="mx-2 h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
          <span className="text-gray-900 dark:text-white font-medium">Empresas</span>
        </nav>

        {/* Info Banner */}
        <div className="mb-6 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <h2 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
            Demo de Breadcrumbs
          </h2>
          <p className="text-sm text-blue-700 dark:text-blue-300">
            Esta pagina demuestra la navegacion con breadcrumbs. Haz clic en una empresa para ver los breadcrumbs completos: Inicio {'>'} Empresas {'>'} [Nombre de Empresa]
          </p>
        </div>

        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Gestion de Empresas
          </h1>
          <button className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors">
            Nueva Empresa
          </button>
        </div>

        {/* Empresas Table */}
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
                    Visibilidad
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Color
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Fecha Creacion
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                {demoEmpresas.map((empresa) => (
                  <tr key={empresa.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {empresa.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <Link
                        href={`/demo/empresas/${empresa.id}`}
                        className="text-primary-600 dark:text-primary-400 hover:underline font-medium"
                      >
                        {empresa.nombre}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {empresa.configVisibilidadTickets === 'propios' ? 'Solo propios' : 'Toda la empresa'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div
                        className="w-6 h-6 rounded border border-gray-300"
                        style={{ backgroundColor: empresa.colorPrimario }}
                        title={empresa.colorPrimario}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          empresa.activa
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                        }`}
                      >
                        {empresa.activa ? 'Activa' : 'Inactiva'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {new Date(empresa.fechaCreacion).toLocaleDateString('es-ES')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Back link */}
        <div className="mt-6">
          <Link
            href="/demo"
            className="text-primary-600 dark:text-primary-400 hover:underline text-sm"
          >
            ← Volver a la demo principal
          </Link>
        </div>
      </div>
    </div>
  );
}
