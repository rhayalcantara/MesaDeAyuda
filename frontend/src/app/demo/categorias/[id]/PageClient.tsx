'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';

// Demo categoria detail page for testing breadcrumbs without backend authentication

interface Categoria {
  id: number;
  nombre: string;
  descripcion: string | null;
  activa: boolean;
  fechaCreacion: string;
  fechaActualizacion: string;
  ticketsCount: number;
}

interface TicketReciente {
  id: number;
  titulo: string;
  estado: string;
  prioridad: string;
  fecha: string;
}

const demoCategorias: Record<number, Categoria> = {
  1: {
    id: 1,
    nombre: 'Sistema de Facturacion',
    descripcion: 'Problemas relacionados con el modulo de facturacion, incluyendo generacion de facturas, reportes y configuracion.',
    activa: true,
    fechaCreacion: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
    fechaActualizacion: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    ticketsCount: 45,
  },
  2: {
    id: 2,
    nombre: 'Portal Web',
    descripcion: 'Incidencias del portal web publico, acceso de usuarios y funcionalidades online.',
    activa: true,
    fechaCreacion: new Date(Date.now() - 80 * 24 * 60 * 60 * 1000).toISOString(),
    fechaActualizacion: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    ticketsCount: 32,
  },
  3: {
    id: 3,
    nombre: 'Aplicacion Movil',
    descripcion: 'Soporte para la aplicacion movil en iOS y Android.',
    activa: true,
    fechaCreacion: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    fechaActualizacion: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    ticketsCount: 28,
  },
  4: {
    id: 4,
    nombre: 'Integraciones API',
    descripcion: 'Problemas con integraciones de terceros y API REST.',
    activa: true,
    fechaCreacion: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
    fechaActualizacion: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    ticketsCount: 15,
  },
  5: {
    id: 5,
    nombre: 'Sistema Legacy',
    descripcion: 'Sistema anterior en proceso de migracion - solo mantenimiento.',
    activa: false,
    fechaCreacion: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(),
    fechaActualizacion: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    ticketsCount: 0,
  },
};

const demoTicketsRecientes: Record<number, TicketReciente[]> = {
  1: [
    { id: 101, titulo: 'Error al generar factura PDF', estado: 'Abierto', prioridad: 'Alta', fecha: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
    { id: 102, titulo: 'Reporte mensual incorrecto', estado: 'En Progreso', prioridad: 'Media', fecha: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() },
    { id: 103, titulo: 'Configuracion de impuestos', estado: 'Resuelto', prioridad: 'Baja', fecha: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() },
  ],
  2: [
    { id: 201, titulo: 'Portal no carga en Safari', estado: 'Abierto', prioridad: 'Alta', fecha: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
    { id: 202, titulo: 'Error de login intermitente', estado: 'En Progreso', prioridad: 'Alta', fecha: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString() },
  ],
  3: [
    { id: 301, titulo: 'App se cierra en iPhone', estado: 'Abierto', prioridad: 'Critica', fecha: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
  ],
  4: [
    { id: 401, titulo: 'Timeout en API de pagos', estado: 'Abierto', prioridad: 'Alta', fecha: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
  ],
  5: [],
};

export default function DemoCategoriaDetailPage() {
  const params = useParams();
  const categoriaId = parseInt(params.id as string);

  const categoria = demoCategorias[categoriaId];
  const ticketsRecientes = demoTicketsRecientes[categoriaId] || [];

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('es-ES', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(dateString));
  };

  const getPrioridadClass = (prioridad: string) => {
    switch (prioridad) {
      case 'Critica':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'Alta':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      case 'Media':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'Baja':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getEstadoClass = (estado: string) => {
    switch (estado) {
      case 'Abierto':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'En Progreso':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'Resuelto':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  if (!categoria) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Categoria no encontrada
          </h2>
          <Link href="/demo/categorias" className="px-4 py-2 bg-primary-600 text-white rounded-lg inline-block">
            Volver a categorias
          </Link>
        </div>
      </div>
    );
  }

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
          <Link href="/demo/categorias" className="hover:text-primary-600 dark:hover:text-primary-400">
            Categorias
          </Link>
          <svg className="mx-2 h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
          <span className="text-gray-900 dark:text-white font-medium">{categoria.nombre}</span>
        </nav>

        {/* Info Banner */}
        <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <h2 className="text-sm font-medium text-green-800 dark:text-green-200 mb-2">
            Vista de Detalle - ID #{categoria.id}
          </h2>
          <p className="text-sm text-green-700 dark:text-green-300">
            Observa los breadcrumbs: <strong>Inicio {'>'} Categorias {'>'} {categoria.nombre}</strong>.
            Puedes hacer clic en &quot;Categorias&quot; para volver a la lista.
          </p>
        </div>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-primary-500 flex items-center justify-center text-white font-bold text-xl">
              {categoria.nombre.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {categoria.nombre}
              </h1>
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                  categoria.activa
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                }`}
              >
                {categoria.activa ? 'Activa' : 'Inactiva'}
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <Link
              href={`/demo/categorias/${categoria.id}/editar`}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors flex items-center gap-2"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
              </svg>
              Editar
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Categoria Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Details Card */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Informacion de la Categoria
              </h2>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm text-gray-500 dark:text-gray-400">ID</dt>
                  <dd className="mt-1 text-gray-900 dark:text-white font-medium">
                    {categoria.id}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500 dark:text-gray-400">Total de Tickets</dt>
                  <dd className="mt-1 text-gray-900 dark:text-white font-medium">
                    {categoria.ticketsCount}
                  </dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-sm text-gray-500 dark:text-gray-400">Descripcion</dt>
                  <dd className="mt-1 text-gray-900 dark:text-white">
                    {categoria.descripcion || 'Sin descripcion'}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500 dark:text-gray-400">Fecha de Creacion</dt>
                  <dd className="mt-1 text-gray-900 dark:text-white">
                    {formatDate(categoria.fechaCreacion)}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500 dark:text-gray-400">Ultima Actualizacion</dt>
                  <dd className="mt-1 text-gray-900 dark:text-white">
                    {formatDate(categoria.fechaActualizacion)}
                  </dd>
                </div>
              </dl>
            </div>

            {/* Recent Tickets */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Tickets Recientes ({ticketsRecientes.length})
                </h2>
              </div>
              {ticketsRecientes.length === 0 ? (
                <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                  No hay tickets recientes en esta categoria.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          ID
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Titulo
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Estado
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Prioridad
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Fecha
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                      {ticketsRecientes.map((ticket) => (
                        <tr key={ticket.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            #{ticket.id}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-primary-600 dark:text-primary-400">
                            {ticket.titulo}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getEstadoClass(ticket.estado)}`}>
                              {ticket.estado}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPrioridadClass(ticket.prioridad)}`}>
                              {ticket.prioridad}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {new Date(ticket.fecha).toLocaleDateString('es-ES')}
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
                  <dt className="text-sm text-gray-500 dark:text-gray-400">Total Tickets</dt>
                  <dd className="text-sm font-medium text-gray-900 dark:text-white">
                    {categoria.ticketsCount}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-500 dark:text-gray-400">Tickets Abiertos</dt>
                  <dd className="text-sm font-medium text-blue-600 dark:text-blue-400">
                    {ticketsRecientes.filter(t => t.estado === 'Abierto').length}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-500 dark:text-gray-400">En Progreso</dt>
                  <dd className="text-sm font-medium text-yellow-600 dark:text-yellow-400">
                    {ticketsRecientes.filter(t => t.estado === 'En Progreso').length}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-500 dark:text-gray-400">Dias Activa</dt>
                  <dd className="text-sm font-medium text-gray-900 dark:text-white">
                    {Math.floor((Date.now() - new Date(categoria.fechaCreacion).getTime()) / (1000 * 60 * 60 * 24))}
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
