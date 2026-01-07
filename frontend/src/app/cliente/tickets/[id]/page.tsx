'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { MainLayout } from '@/components/layout';
import api from '@/lib/api';

interface Ticket {
  id: number;
  titulo: string;
  descripcion: string;
  estado: string;
  prioridad: string;
  categoriaId: number;
  categoriaNombre: string;
  clienteId: number;
  clienteNombre: string;
  clienteEmail: string;
  empleadoAsignadoId: number | null;
  empleadoAsignadoNombre: string | null;
  fechaCreacion: string;
  fechaActualizacion: string;
  fechaPrimeraRespuesta: string | null;
  fechaResolucion: string | null;
  comentariosCount: number;
  archivosCount: number;
}

interface Comentario {
  id: number;
  texto: string;
  usuarioId: number;
  usuarioNombre: string;
  usuarioRol: string;
  fechaCreacion: string;
}

const estadoColors: Record<string, string> = {
  Abierto: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
  EnProceso: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
  EnEspera: 'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300',
  Resuelto: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
  Cerrado: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
};

const prioridadColors: Record<string, string> = {
  Alta: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
  Media: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
  Baja: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
};

const estadoLabels: Record<string, string> = {
  Abierto: 'Abierto',
  EnProceso: 'En Proceso',
  EnEspera: 'En Espera',
  Resuelto: 'Resuelto',
  Cerrado: 'Cerrado',
};

export default function ClienteTicketDetailPage() {
  const params = useParams();
  const ticketId = params.id as string;

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [comentarios, setComentarios] = useState<Comentario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [nuevoComentario, setNuevoComentario] = useState('');
  const [enviandoComentario, setEnviandoComentario] = useState(false);
  const [comentarioError, setComentarioError] = useState('');
  const [comentarioExito, setComentarioExito] = useState('');

  useEffect(() => {
    fetchTicket();
    fetchComentarios();
  }, [ticketId]);

  const fetchTicket = async () => {
    try {
      const response = await api.get<Ticket>(`/tickets/${ticketId}`);
      setTicket(response.data);
    } catch (err: any) {
      console.error('Error fetching ticket:', err);
      setError('No se pudo cargar el ticket.');
    } finally {
      setLoading(false);
    }
  };

  const fetchComentarios = async () => {
    try {
      const response = await api.get<Comentario[]>(`/tickets/${ticketId}/comentarios`);
      setComentarios(response.data);
    } catch (err) {
      console.error('Error fetching comentarios:', err);
      // Comments might fail silently
    }
  };

  const handleSubmitComentario = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoComentario.trim()) return;

    setEnviandoComentario(true);
    setComentarioError('');
    setComentarioExito('');

    try {
      await api.post(`/tickets/${ticketId}/comentarios`, {
        texto: nuevoComentario.trim(),
      });
      setNuevoComentario('');
      setComentarioExito('Comentario agregado exitosamente');
      fetchComentarios();
      setTimeout(() => setComentarioExito(''), 3000);
    } catch (err: any) {
      setComentarioError(err.response?.data?.message || 'Error al agregar el comentario');
    } finally {
      setEnviandoComentario(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <MainLayout requiredRoles={['Cliente']}>
        <div className="flex items-center justify-center py-12">
          <svg
            className="animate-spin h-8 w-8 text-primary-600"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span className="ml-3 text-gray-600 dark:text-gray-400">Cargando ticket...</span>
        </div>
      </MainLayout>
    );
  }

  if (error || !ticket) {
    return (
      <MainLayout requiredRoles={['Cliente']}>
        <div className="text-center py-12">
          <svg
            className="mx-auto h-12 w-12 text-red-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
            Error al cargar el ticket
          </h3>
          <p className="mt-2 text-gray-500 dark:text-gray-400">{error}</p>
          <div className="mt-6">
            <Link href="/cliente/tickets" className="btn-primary">
              Volver a Mis Tickets
            </Link>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout requiredRoles={['Cliente']}>
      <div className="space-y-6">
        {/* Breadcrumb and header */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
          <div>
            <nav className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-2">
              <Link href="/cliente/tickets" className="hover:text-primary-600">
                Mis Tickets
              </Link>
              <span className="mx-2">/</span>
              <span>#{ticket.id}</span>
            </nav>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {ticket.titulo}
            </h1>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content */}
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
                <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                  No hay comentarios aun. Agrega uno para comunicarte con el equipo de soporte.
                </p>
              ) : (
                <div className="space-y-4 mb-6">
                  {comentarios.map((comentario) => (
                    <div
                      key={comentario.id}
                      className="border-l-4 border-primary-500 pl-4 py-2"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900 dark:text-white">
                            {comentario.usuarioNombre}
                          </span>
                          <span className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-gray-600 dark:text-gray-400">
                            {comentario.usuarioRol}
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

              {/* Add comment form */}
              {ticket.estado !== 'Cerrado' && (
                <form onSubmit={handleSubmitComentario} className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <label htmlFor="comentario" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Agregar comentario
                  </label>
                  {comentarioError && (
                    <div className="mb-2 text-sm text-red-600 dark:text-red-400" role="alert">
                      {comentarioError}
                    </div>
                  )}
                  {comentarioExito && (
                    <div className="mb-2 text-sm text-green-600 dark:text-green-400" role="status">
                      {comentarioExito}
                    </div>
                  )}
                  <textarea
                    id="comentario"
                    value={nuevoComentario}
                    onChange={(e) => setNuevoComentario(e.target.value)}
                    className="input min-h-[100px] resize-y w-full mb-3"
                    placeholder="Escribe tu comentario aqui..."
                    disabled={enviandoComentario}
                  />
                  <button
                    type="submit"
                    disabled={enviandoComentario || !nuevoComentario.trim()}
                    className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {enviandoComentario ? 'Enviando...' : 'Enviar comentario'}
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Sidebar info */}
          <div className="space-y-6">
            {/* Status and priority */}
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Informacion
              </h2>
              <dl className="space-y-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Estado</dt>
                  <dd className="mt-1">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium ${estadoColors[ticket.estado] || 'bg-gray-100 text-gray-800'}`}>
                      {estadoLabels[ticket.estado] || ticket.estado}
                    </span>
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Prioridad</dt>
                  <dd className="mt-1">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium ${prioridadColors[ticket.prioridad] || 'bg-gray-100 text-gray-800'}`}>
                      {ticket.prioridad}
                    </span>
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Categoria</dt>
                  <dd className="mt-1 text-gray-900 dark:text-white">{ticket.categoriaNombre}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Asignado a</dt>
                  <dd className="mt-1 text-gray-900 dark:text-white">
                    {ticket.empleadoAsignadoNombre || 'Sin asignar'}
                  </dd>
                </div>
              </dl>
            </div>

            {/* Dates */}
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Fechas
              </h2>
              <dl className="space-y-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Creado</dt>
                  <dd className="mt-1 text-gray-900 dark:text-white">
                    {formatDate(ticket.fechaCreacion)}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Actualizado</dt>
                  <dd className="mt-1 text-gray-900 dark:text-white">
                    {formatDate(ticket.fechaActualizacion)}
                  </dd>
                </div>
                {ticket.fechaPrimeraRespuesta && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Primera respuesta</dt>
                    <dd className="mt-1 text-gray-900 dark:text-white">
                      {formatDate(ticket.fechaPrimeraRespuesta)}
                    </dd>
                  </div>
                )}
                {ticket.fechaResolucion && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Resuelto</dt>
                    <dd className="mt-1 text-gray-900 dark:text-white">
                      {formatDate(ticket.fechaResolucion)}
                    </dd>
                  </div>
                )}
              </dl>
            </div>

            {/* Back link */}
            <Link
              href="/cliente/tickets"
              className="btn-secondary w-full flex items-center justify-center"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Volver a Mis Tickets
            </Link>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
