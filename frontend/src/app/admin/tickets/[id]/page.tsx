'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { MainLayout } from '@/components/layout';
import api from '@/lib/api';

interface Ticket {
  id: number;
  titulo: string;
  descripcion: string;
  estado: string;
  prioridad: string;
  categoria: { id: number; nombre: string };
  cliente: { id: number; nombre: string; email: string };
  empleadoAsignado: { id: number; nombre: string } | null;
  fechaCreacion: string;
  fechaActualizacion: string;
  fechaPrimeraRespuesta: string | null;
  fechaResolucion: string | null;
}

interface Comentario {
  id: number;
  texto: string;
  usuario: { id: number; nombre: string; rol: string };
  fechaCreacion: string;
}

// Demo ticket data for testing without backend
const demoTicket: Ticket = {
  id: 1,
  titulo: 'Error al cargar reportes en el sistema',
  descripcion: 'Al intentar generar el reporte mensual de ventas, el sistema muestra un error de timeout. El problema ocurre cuando se seleccionan fechas mayores a 30 dias. He intentado con diferentes navegadores pero el error persiste.',
  estado: 'EnProceso',
  prioridad: 'Alta',
  categoria: { id: 1, nombre: 'Sistema de Ventas' },
  cliente: { id: 3, nombre: 'Cliente Demo', email: 'cliente@demo.com' },
  empleadoAsignado: { id: 2, nombre: 'Empleado Demo' },
  fechaCreacion: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  fechaActualizacion: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
  fechaPrimeraRespuesta: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  fechaResolucion: null,
};

const demoComentarios: Comentario[] = [
  {
    id: 1,
    texto: 'Gracias por reportar el problema. Vamos a revisar los logs del servidor para identificar la causa del timeout.',
    usuario: { id: 2, nombre: 'Empleado Demo', rol: 'Empleado' },
    fechaCreacion: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 2,
    texto: 'Gracias por la respuesta rapida. Quedo atento a cualquier actualizacion.',
    usuario: { id: 3, nombre: 'Cliente Demo', rol: 'Cliente' },
    fechaCreacion: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
  },
];

export default function AdminTicketDetailPage() {
  const params = useParams();
  const router = useRouter();
  const ticketId = params.id as string;

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [comentarios, setComentarios] = useState<Comentario[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchTicket();
  }, [ticketId]);

  const fetchTicket = async () => {
    try {
      // Try to fetch from API first
      const [ticketRes, comentariosRes] = await Promise.all([
        api.get(`/tickets/${ticketId}`),
        api.get(`/tickets/${ticketId}/comentarios`),
      ]);
      setTicket(ticketRes.data);
      setComentarios(comentariosRes.data);
    } catch (error) {
      // Fall back to demo data if API is not available
      console.log('Using demo data (API not available)');
      setTicket({ ...demoTicket, id: parseInt(ticketId) });
      setComentarios(demoComentarios);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.delete(`/tickets/${ticketId}`);
      router.push('/admin/tickets');
    } catch (error) {
      // In demo mode, just redirect
      console.log('Demo: Ticket would be deleted');
      router.push('/admin/tickets');
    }
  };

  const getEstadoBadgeClass = (estado: string) => {
    const classes: Record<string, string> = {
      'Abierto': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      'EnProceso': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      'EnEspera': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
      'Resuelto': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      'Cerrado': 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    };
    return classes[estado] || 'bg-gray-100 text-gray-800';
  };

  const getPrioridadBadgeClass = (prioridad: string) => {
    const classes: Record<string, string> = {
      'Alta': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
      'Media': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      'Baja': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    };
    return classes[prioridad] || 'bg-gray-100 text-gray-800';
  };

  const formatEstado = (estado: string) => {
    const labels: Record<string, string> = {
      'Abierto': 'Abierto',
      'EnProceso': 'En Proceso',
      'EnEspera': 'En Espera',
      'Resuelto': 'Resuelto',
      'Cerrado': 'Cerrado',
    };
    return labels[estado] || estado;
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('es-ES', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(dateString));
  };

  if (loading) {
    return (
      <MainLayout requiredRoles={['Admin']}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </MainLayout>
    );
  }

  if (!ticket) {
    return (
      <MainLayout requiredRoles={['Admin']}>
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Ticket no encontrado
          </h2>
          <Link href="/admin/tickets" className="btn-primary mt-4 inline-block">
            Volver a tickets
          </Link>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout requiredRoles={['Admin']}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-2">
              <Link href="/admin/tickets" className="hover:text-primary-600">
                Tickets
              </Link>
              <span>/</span>
              <span>#{ticket.id}</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {ticket.titulo}
            </h1>
          </div>
          <div className="flex gap-2">
            <Link
              href={`/admin/tickets/${ticket.id}/editar`}
              className="btn-secondary flex items-center gap-2"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
              </svg>
              Editar
            </Link>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="btn-danger flex items-center gap-2"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
              </svg>
              Eliminar
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Ticket Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Descripcion
              </h2>
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {ticket.descripcion}
              </p>
            </div>

            {/* Comments */}
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Conversacion ({comentarios.length})
              </h2>
              {comentarios.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400">
                  No hay comentarios todavia.
                </p>
              ) : (
                <div className="space-y-4">
                  {comentarios.map((comentario) => (
                    <div
                      key={comentario.id}
                      className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900 dark:text-white">
                            {comentario.usuario.nombre}
                          </span>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                            {comentario.usuario.rol}
                          </span>
                        </div>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {formatDate(comentario.fechaCreacion)}
                        </span>
                      </div>
                      <p className="text-gray-700 dark:text-gray-300">
                        {comentario.texto}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar Info */}
          <div className="space-y-6">
            {/* Status Card */}
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Informacion
              </h2>
              <dl className="space-y-4">
                <div>
                  <dt className="text-sm text-gray-500 dark:text-gray-400">Estado</dt>
                  <dd className="mt-1">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getEstadoBadgeClass(ticket.estado)}`}>
                      {formatEstado(ticket.estado)}
                    </span>
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500 dark:text-gray-400">Prioridad</dt>
                  <dd className="mt-1">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPrioridadBadgeClass(ticket.prioridad)}`}>
                      {ticket.prioridad}
                    </span>
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500 dark:text-gray-400">Categoria</dt>
                  <dd className="mt-1 text-gray-900 dark:text-white">
                    {ticket.categoria.nombre}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500 dark:text-gray-400">Cliente</dt>
                  <dd className="mt-1">
                    <div className="text-gray-900 dark:text-white">{ticket.cliente.nombre}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{ticket.cliente.email}</div>
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500 dark:text-gray-400">Asignado a</dt>
                  <dd className="mt-1 text-gray-900 dark:text-white">
                    {ticket.empleadoAsignado?.nombre || 'Sin asignar'}
                  </dd>
                </div>
              </dl>
            </div>

            {/* Dates Card */}
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Fechas
              </h2>
              <dl className="space-y-4">
                <div>
                  <dt className="text-sm text-gray-500 dark:text-gray-400">Creado</dt>
                  <dd className="mt-1 text-gray-900 dark:text-white">
                    {formatDate(ticket.fechaCreacion)}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500 dark:text-gray-400">Actualizado</dt>
                  <dd className="mt-1 text-gray-900 dark:text-white">
                    {formatDate(ticket.fechaActualizacion)}
                  </dd>
                </div>
                {ticket.fechaPrimeraRespuesta && (
                  <div>
                    <dt className="text-sm text-gray-500 dark:text-gray-400">Primera respuesta</dt>
                    <dd className="mt-1 text-gray-900 dark:text-white">
                      {formatDate(ticket.fechaPrimeraRespuesta)}
                    </dd>
                  </div>
                )}
                {ticket.fechaResolucion && (
                  <div>
                    <dt className="text-sm text-gray-500 dark:text-gray-400">Resuelto</dt>
                    <dd className="mt-1 text-gray-900 dark:text-white">
                      {formatDate(ticket.fechaResolucion)}
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            {/* Background overlay */}
            <div
              className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75 dark:bg-gray-900 dark:bg-opacity-75"
              onClick={() => setShowDeleteModal(false)}
            ></div>

            {/* Modal */}
            <div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white dark:bg-gray-800 shadow-xl rounded-lg">
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/30">
                  <svg className="h-6 w-6 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    Eliminar ticket
                  </h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    ¿Esta seguro de que desea eliminar este ticket? Esta accion no se puede deshacer.
                  </p>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowDeleteModal(false)}
                  disabled={deleting}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  className="btn-danger"
                  onClick={handleDelete}
                  disabled={deleting}
                >
                  {deleting ? 'Eliminando...' : 'Eliminar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
}
