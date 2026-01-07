'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';

// Demo empresa detail page for testing breadcrumbs without backend authentication

interface Empresa {
  id: number;
  nombre: string;
  configVisibilidadTickets: string;
  colorPrimario: string;
  activa: boolean;
  fechaCreacion: string;
  fechaActualizacion: string;
}

interface Cliente {
  id: number;
  nombre: string;
  email: string;
  activo: boolean;
  fechaCreacion: string;
}

const demoEmpresas: Record<number, Empresa> = {
  1: {
    id: 1,
    nombre: 'Empresa Demo SA',
    configVisibilidadTickets: 'propios',
    colorPrimario: '#2563eb',
    activa: true,
    fechaCreacion: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    fechaActualizacion: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  2: {
    id: 2,
    nombre: 'Tecnologias ABC',
    configVisibilidadTickets: 'empresa',
    colorPrimario: '#16a34a',
    activa: true,
    fechaCreacion: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    fechaActualizacion: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  },
  3: {
    id: 3,
    nombre: 'Consultores XYZ',
    configVisibilidadTickets: 'propios',
    colorPrimario: '#dc2626',
    activa: false,
    fechaCreacion: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
    fechaActualizacion: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
  },
};

const demoClientes: Record<number, Cliente[]> = {
  1: [
    { id: 1, nombre: 'Juan Perez', email: 'juan@empresa-demo.com', activo: true, fechaCreacion: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString() },
    { id: 2, nombre: 'Maria Garcia', email: 'maria@empresa-demo.com', activo: true, fechaCreacion: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString() },
  ],
  2: [
    { id: 3, nombre: 'Carlos Lopez', email: 'carlos@tecnologias-abc.com', activo: true, fechaCreacion: new Date(Date.now() - 50 * 24 * 60 * 60 * 1000).toISOString() },
  ],
  3: [],
};

export default function DemoEmpresaDetailPage() {
  const params = useParams();
  const empresaId = parseInt(params.id as string);

  const empresa = demoEmpresas[empresaId];
  const clientes = demoClientes[empresaId] || [];

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('es-ES', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(dateString));
  };

  if (!empresa) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Empresa no encontrada
          </h2>
          <Link href="/demo/empresas" className="btn-primary inline-block px-4 py-2 bg-primary-600 text-white rounded-lg">
            Volver a empresas
          </Link>
        </div>
      </div>
    );
  }

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
          <Link href="/demo/empresas" className="hover:text-primary-600 dark:hover:text-primary-400">
            Empresas
          </Link>
          <svg className="mx-2 h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
          <span className="text-gray-900 dark:text-white font-medium">{empresa.nombre}</span>
        </nav>

        {/* Info Banner */}
        <div className="mb-6 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <h2 className="text-sm font-medium text-green-800 dark:text-green-200 mb-2">
            Breadcrumbs Completos
          </h2>
          <p className="text-sm text-green-700 dark:text-green-300">
            Observa los breadcrumbs arriba: <strong>Inicio {'>'} Empresas {'>'} {empresa.nombre}</strong>.
            Puedes hacer clic en &quot;Empresas&quot; para volver a la lista.
          </p>
        </div>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <div
              className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-xl"
              style={{ backgroundColor: empresa.colorPrimario }}
            >
              {empresa.nombre.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {empresa.nombre}
              </h1>
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                  empresa.activa
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                }`}
              >
                {empresa.activa ? 'Activa' : 'Inactiva'}
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors flex items-center gap-2">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
              </svg>
              Editar
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Empresa Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Details Card */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Informacion de la Empresa
              </h2>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm text-gray-500 dark:text-gray-400">ID</dt>
                  <dd className="mt-1 text-gray-900 dark:text-white font-medium">
                    {empresa.id}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500 dark:text-gray-400">Visibilidad de Tickets</dt>
                  <dd className="mt-1 text-gray-900 dark:text-white">
                    {empresa.configVisibilidadTickets === 'propios' ? 'Solo tickets propios' : 'Todos los tickets de la empresa'}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500 dark:text-gray-400">Color Primario</dt>
                  <dd className="mt-1 flex items-center gap-2">
                    <div
                      className="w-6 h-6 rounded border border-gray-300"
                      style={{ backgroundColor: empresa.colorPrimario }}
                    />
                    <span className="text-gray-900 dark:text-white">
                      {empresa.colorPrimario}
                    </span>
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500 dark:text-gray-400">Fecha de Creacion</dt>
                  <dd className="mt-1 text-gray-900 dark:text-white">
                    {formatDate(empresa.fechaCreacion)}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500 dark:text-gray-400">Ultima Actualizacion</dt>
                  <dd className="mt-1 text-gray-900 dark:text-white">
                    {formatDate(empresa.fechaActualizacion)}
                  </dd>
                </div>
              </dl>
            </div>

            {/* Clients Card */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Clientes ({clientes.length})
                </h2>
              </div>
              {clientes.length === 0 ? (
                <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                  No hay clientes registrados para esta empresa.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Nombre
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Estado
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Fecha Registro
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                      {clientes.map((cliente) => (
                        <tr key={cliente.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {cliente.nombre}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {cliente.email}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 py-1 text-xs font-medium rounded-full ${
                                cliente.activo
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                                  : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                              }`}
                            >
                              {cliente.activo ? 'Activo' : 'Inactivo'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {new Date(cliente.fechaCreacion).toLocaleDateString('es-ES')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Stats Sidebar */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Estadisticas
              </h2>
              <dl className="space-y-4">
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-500 dark:text-gray-400">Total Clientes</dt>
                  <dd className="text-sm font-medium text-gray-900 dark:text-white">
                    {clientes.length}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-500 dark:text-gray-400">Clientes Activos</dt>
                  <dd className="text-sm font-medium text-green-600 dark:text-green-400">
                    {clientes.filter(c => c.activo).length}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-500 dark:text-gray-400">Clientes Inactivos</dt>
                  <dd className="text-sm font-medium text-red-600 dark:text-red-400">
                    {clientes.filter(c => !c.activo).length}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
