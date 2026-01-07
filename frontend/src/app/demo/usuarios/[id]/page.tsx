'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';

// Demo usuario detail page for testing breadcrumbs without backend authentication

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
  telefono?: string;
  departamento?: string;
}

const demoUsuarios: Record<number, Usuario> = {
  1: {
    id: 1,
    nombre: 'Admin Sistema',
    email: 'admin@mesadeayuda.com',
    rol: 'Admin',
    activo: true,
    telefono: '+1 555-0100',
    departamento: 'Administracion',
    ultimoAcceso: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    fechaCreacion: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
  },
  2: {
    id: 2,
    nombre: 'Carlos Soporte',
    email: 'carlos@mesadeayuda.com',
    rol: 'Empleado',
    activo: true,
    telefono: '+1 555-0101',
    departamento: 'Soporte Tecnico',
    ultimoAcceso: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    fechaCreacion: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
  },
  3: {
    id: 3,
    nombre: 'Maria Tecnica',
    email: 'maria@mesadeayuda.com',
    rol: 'Empleado',
    activo: true,
    telefono: '+1 555-0102',
    departamento: 'Desarrollo',
    ultimoAcceso: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    fechaCreacion: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
  },
  4: {
    id: 4,
    nombre: 'Juan Perez',
    email: 'juan@empresa-demo.com',
    rol: 'Cliente',
    activo: true,
    empresaId: 1,
    empresaNombre: 'Empresa Demo SA',
    telefono: '+1 555-0200',
    ultimoAcceso: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    fechaCreacion: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
  },
  5: {
    id: 5,
    nombre: 'Pedro Gonzalez',
    email: 'pedro@tecnologias-abc.com',
    rol: 'Cliente',
    activo: false,
    empresaId: 2,
    empresaNombre: 'Tecnologias ABC',
    telefono: '+1 555-0201',
    ultimoAcceso: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    fechaCreacion: new Date(Date.now() - 50 * 24 * 60 * 60 * 1000).toISOString(),
  },
};

// Demo tickets for users
const demoTickets: Record<number, Array<{ id: number; titulo: string; estado: string; fecha: string }>> = {
  4: [
    { id: 101, titulo: 'Error en facturacion', estado: 'Abierto', fecha: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
    { id: 102, titulo: 'Consulta sobre reportes', estado: 'Resuelto', fecha: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString() },
  ],
  5: [
    { id: 103, titulo: 'Problema de acceso', estado: 'Cerrado', fecha: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString() },
  ],
};

export default function DemoUsuarioDetailPage() {
  const params = useParams();
  const usuarioId = parseInt(params.id as string);

  const usuario = demoUsuarios[usuarioId];
  const tickets = demoTickets[usuarioId] || [];

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

  if (!usuario) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Usuario no encontrado
          </h2>
          <Link href="/demo/usuarios" className="px-4 py-2 bg-primary-600 text-white rounded-lg inline-block">
            Volver a usuarios
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
          <Link href="/demo/usuarios" className="hover:text-primary-600 dark:hover:text-primary-400">
            Usuarios
          </Link>
          <svg className="mx-2 h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
          <span className="text-gray-900 dark:text-white font-medium">{usuario.nombre}</span>
        </nav>

        {/* Info Banner */}
        <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <h2 className="text-sm font-medium text-green-800 dark:text-green-200 mb-2">
            Vista de Detalle - ID #{usuario.id}
          </h2>
          <p className="text-sm text-green-700 dark:text-green-300">
            Observa los breadcrumbs: <strong>Inicio {'>'} Usuarios {'>'} {usuario.nombre}</strong>.
            Puedes hacer clic en &quot;Usuarios&quot; para volver a la lista.
          </p>
        </div>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary-500 flex items-center justify-center text-white font-bold text-2xl">
              {usuario.nombre.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {usuario.nombre}
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getRolBadgeClass(usuario.rol)}`}>
                  {usuario.rol}
                </span>
                <span
                  className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                    usuario.activo
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                  }`}
                >
                  {usuario.activo ? 'Activo' : 'Inactivo'}
                </span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Link
              href={`/demo/usuarios/${usuario.id}/editar`}
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
          {/* User Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Details Card */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Informacion del Usuario
              </h2>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm text-gray-500 dark:text-gray-400">ID</dt>
                  <dd className="mt-1 text-gray-900 dark:text-white font-medium">
                    {usuario.id}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500 dark:text-gray-400">Email</dt>
                  <dd className="mt-1 text-gray-900 dark:text-white">
                    {usuario.email}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500 dark:text-gray-400">Telefono</dt>
                  <dd className="mt-1 text-gray-900 dark:text-white">
                    {usuario.telefono || '-'}
                  </dd>
                </div>
                {usuario.departamento && (
                  <div>
                    <dt className="text-sm text-gray-500 dark:text-gray-400">Departamento</dt>
                    <dd className="mt-1 text-gray-900 dark:text-white">
                      {usuario.departamento}
                    </dd>
                  </div>
                )}
                {usuario.empresaNombre && (
                  <div>
                    <dt className="text-sm text-gray-500 dark:text-gray-400">Empresa</dt>
                    <dd className="mt-1 text-gray-900 dark:text-white">
                      <Link
                        href={`/demo/empresas/${usuario.empresaId}`}
                        className="text-primary-600 dark:text-primary-400 hover:underline"
                      >
                        {usuario.empresaNombre}
                      </Link>
                    </dd>
                  </div>
                )}
                <div>
                  <dt className="text-sm text-gray-500 dark:text-gray-400">Fecha de Creacion</dt>
                  <dd className="mt-1 text-gray-900 dark:text-white">
                    {formatDate(usuario.fechaCreacion)}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500 dark:text-gray-400">Ultimo Acceso</dt>
                  <dd className="mt-1 text-gray-900 dark:text-white">
                    {formatDate(usuario.ultimoAcceso)}
                  </dd>
                </div>
              </dl>
            </div>

            {/* Tickets Card (for clients) */}
            {usuario.rol === 'Cliente' && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Tickets ({tickets.length})
                  </h2>
                </div>
                {tickets.length === 0 ? (
                  <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                    Este usuario no tiene tickets.
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
                            Fecha
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                        {tickets.map((ticket) => (
                          <tr key={ticket.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                              #{ticket.id}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-primary-600 dark:text-primary-400">
                              {ticket.titulo}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`px-2 py-1 text-xs font-medium rounded-full ${
                                  ticket.estado === 'Abierto'
                                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                                    : ticket.estado === 'Resuelto'
                                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                                    : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                                }`}
                              >
                                {ticket.estado}
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
            )}
          </div>

          {/* Stats Sidebar */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Actividad
              </h2>
              <dl className="space-y-4">
                {usuario.rol === 'Cliente' && (
                  <>
                    <div className="flex justify-between">
                      <dt className="text-sm text-gray-500 dark:text-gray-400">Total Tickets</dt>
                      <dd className="text-sm font-medium text-gray-900 dark:text-white">
                        {tickets.length}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm text-gray-500 dark:text-gray-400">Tickets Abiertos</dt>
                      <dd className="text-sm font-medium text-yellow-600 dark:text-yellow-400">
                        {tickets.filter(t => t.estado === 'Abierto').length}
                      </dd>
                    </div>
                  </>
                )}
                {(usuario.rol === 'Empleado' || usuario.rol === 'Admin') && (
                  <>
                    <div className="flex justify-between">
                      <dt className="text-sm text-gray-500 dark:text-gray-400">Tickets Asignados</dt>
                      <dd className="text-sm font-medium text-gray-900 dark:text-white">
                        12
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm text-gray-500 dark:text-gray-400">Tickets Resueltos</dt>
                      <dd className="text-sm font-medium text-green-600 dark:text-green-400">
                        45
                      </dd>
                    </div>
                  </>
                )}
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-500 dark:text-gray-400">Dias en Sistema</dt>
                  <dd className="text-sm font-medium text-gray-900 dark:text-white">
                    {Math.floor((Date.now() - new Date(usuario.fechaCreacion).getTime()) / (1000 * 60 * 60 * 24))}
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
