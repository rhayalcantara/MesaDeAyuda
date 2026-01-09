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
  // Flat DTO structure from API
  categoriaId: number;
  categoriaNombre: string;
  clienteId: number;
  clienteNombre: string;
  clienteEmail?: string;
  empleadoAsignadoId?: number | null;
  empleadoAsignadoNombre?: string | null;
  fechaCreacion: string;
  fechaActualizacion: string;
  fechaPrimeraRespuesta: string | null;
  fechaResolucion: string | null;
  // Legacy nested structure for demo data compatibility
  categoria?: { id: number; nombre: string };
  cliente?: { id: number; nombre: string; email: string };
  empleadoAsignado?: { id: number; nombre: string } | null;
}

interface Comentario {
  id: number;
  texto: string;
  usuario: { id: number; nombre: string; rol: string };
  fechaCreacion: string;
}

interface Archivo {
  id: number;
  nombreOriginal: string;
  tamanio: number;
  tipoMime: string;
  fechaSubida: string;
  subidoPor: { id: number; nombre: string };
}

// Demo ticket data for testing without backend
const demoTicket: Ticket = {
  id: 1,
  titulo: 'Error al cargar reportes en el sistema',
  descripcion: 'Al intentar generar el reporte mensual de ventas, el sistema muestra un error de timeout. El problema ocurre cuando se seleccionan fechas mayores a 30 dias. He intentado con diferentes navegadores pero el error persiste.',
  estado: 'EnProceso',
  prioridad: 'Alta',
  categoriaId: 1,
  categoriaNombre: 'Sistema de Ventas',
  clienteId: 3,
  clienteNombre: 'Cliente Demo',
  clienteEmail: 'cliente@demo.com',
  empleadoAsignadoId: 2,
  empleadoAsignadoNombre: 'Empleado Demo',
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

const demoArchivos: Archivo[] = [
  {
    id: 1,
    nombreOriginal: 'captura_error.png',
    tamanio: 245760, // ~240KB
    tipoMime: 'image/png',
    fechaSubida: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    subidoPor: { id: 3, nombre: 'Cliente Demo' },
  },
  {
    id: 2,
    nombreOriginal: 'log_servidor.txt',
    tamanio: 15360, // ~15KB
    tipoMime: 'text/plain',
    fechaSubida: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    subidoPor: { id: 2, nombre: 'Empleado Demo' },
  },
];

export default function AdminTicketDetailPage() {
  const params = useParams();
  const router = useRouter();
  const ticketId = params.id as string;

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [comentarios, setComentarios] = useState<Comentario[]>([]);
  const [archivos, setArchivos] = useState<Archivo[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [activeTab, setActiveTab] = useState<'comentarios' | 'archivos'>('comentarios');
  const [sincronizando, setSincronizando] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    // AbortController to cancel pending requests when component unmounts
    // or when ticketId changes (prevents state updates on unmounted component)
    const abortController = new AbortController();
    let isMounted = true;

    const fetchTicket = async () => {
      try {
        // Fetch ticket first - this is required
        const ticketRes = await api.get(`/tickets/${ticketId}`, {
          signal: abortController.signal
        });

        // Only update state if component is still mounted
        if (!isMounted) return;
        setTicket(ticketRes.data);

        // Fetch comentarios - use demo if fails (endpoint may not exist yet)
        try {
          const comentariosRes = await api.get(`/tickets/${ticketId}/comentarios`, {
            signal: abortController.signal
          });
          if (isMounted) setComentarios(comentariosRes.data);
        } catch {
          if (isMounted) setComentarios(demoComentarios);
        }

        // Fetch archivos - use demo if fails (endpoint may not exist yet)
        try {
          const archivosRes = await api.get(`/tickets/${ticketId}/archivos`, {
            signal: abortController.signal
          });
          if (isMounted) setArchivos(archivosRes.data);
        } catch {
          if (isMounted) setArchivos(demoArchivos);
        }
      } catch (error: unknown) {
        // Don't update state if request was aborted (user navigated away)
        if (error instanceof Error && error.name === 'AbortError') {
          console.log('Request aborted - user navigated away');
          return;
        }
        // Only update state if still mounted
        if (!isMounted) return;
        // Fall back to demo data only if ticket fetch fails
        console.log('Using demo data (API not available)');
        setTicket({ ...demoTicket, id: parseInt(ticketId) });
        setComentarios(demoComentarios);
        setArchivos(demoArchivos);
      } finally {
        // Only update loading state if still mounted
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchTicket();

    // Cleanup function - runs when component unmounts or before next effect
    return () => {
      isMounted = false;
      abortController.abort();
    };
  }, [ticketId]);

  // Function to refetch ticket data (for use after concurrency conflicts)
  const refetchTicket = async () => {
    try {
      const ticketRes = await api.get(`/tickets/${ticketId}`);
      setTicket(ticketRes.data);

      try {
        const comentariosRes = await api.get(`/tickets/${ticketId}/comentarios`);
        setComentarios(comentariosRes.data);
      } catch {
        // Keep existing comentarios if fetch fails
      }

      try {
        const archivosRes = await api.get(`/tickets/${ticketId}/archivos`);
        setArchivos(archivosRes.data);
      } catch {
        // Keep existing archivos if fetch fails
      }
    } catch (error) {
      console.error('Error refetching ticket:', error);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) {
      return (
        <svg className="h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
        </svg>
      );
    }
    if (mimeType === 'application/pdf') {
      return (
        <svg className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
        </svg>
      );
    }
    return (
      <svg className="h-8 w-8 text-gray-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
      </svg>
    );
  };

  const handleDelete = async () => {
    setDeleting(true);
    setErrorMessage('');
    try {
      await api.delete(`/tickets/${ticketId}`);
      router.push('/admin/tickets');
    } catch (error: any) {
      if (error.response?.status === 409 || error.response?.data?.code === 'CONCURRENCY_CONFLICT') {
        setErrorMessage('Este ticket fue modificado por otro usuario. Los datos se actualizaran automaticamente.');
        setShowDeleteModal(false);
        setSincronizando(true);
        try {
          await refetchTicket();
          setSuccessMessage('Datos actualizados correctamente');
          setTimeout(() => setSuccessMessage(''), 3000);
        } finally {
          setSincronizando(false);
          setDeleting(false);
        }
      } else if (error.response?.status === 404) {
        // Ticket was deleted by another user
        setErrorMessage('Este ticket ya fue eliminado por otro usuario.');
        setTimeout(() => {
          router.push('/admin/tickets');
        }, 2000);
      } else {
        // In demo mode, just redirect
        console.log('Demo: Ticket would be deleted');
        router.push('/admin/tickets');
      }
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
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
              </svg>
              Eliminar
            </button>
          </div>
        </div>

        {/* Success/Error/Sync messages */}
        {successMessage && (
          <div className="bg-green-50 dark:bg-green-900/50 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 px-4 py-3 rounded-lg" role="status">
            {successMessage}
          </div>
        )}
        {errorMessage && (
          <div className="bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg" role="alert">
            {errorMessage}
          </div>
        )}
        {sincronizando && (
          <div className="bg-blue-50 dark:bg-blue-900/50 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 px-4 py-3 rounded-lg flex items-center gap-2" role="status">
            <svg
              className="animate-spin h-4 w-4"
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
            Actualizando datos...
          </div>
        )}

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

            {/* Tabs for Comments and Files */}
            <div className="card">
              {/* Tab Navigation */}
              <div className="border-b border-gray-200 dark:border-gray-700">
                <nav className="flex -mb-px" aria-label="Tabs">
                  <button
                    onClick={() => setActiveTab('comentarios')}
                    className={`py-4 px-6 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === 'comentarios'
                        ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                    }`}
                    aria-selected={activeTab === 'comentarios'}
                    role="tab"
                  >
                    <span className="flex items-center gap-2">
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
                      </svg>
                      Comentarios ({comentarios.length})
                    </span>
                  </button>
                  <button
                    onClick={() => setActiveTab('archivos')}
                    className={`py-4 px-6 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === 'archivos'
                        ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                    }`}
                    aria-selected={activeTab === 'archivos'}
                    role="tab"
                  >
                    <span className="flex items-center gap-2">
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.112 2.13" />
                      </svg>
                      Archivos ({archivos.length})
                    </span>
                  </button>
                </nav>
              </div>

              {/* Tab Content */}
              <div className="p-6" role="tabpanel">
                {/* Comments Tab */}
                {activeTab === 'comentarios' && (
                  <div>
                    {comentarios.length === 0 ? (
                      <p className="text-gray-500 dark:text-gray-400 text-center py-8">
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
                )}

                {/* Files Tab */}
                {activeTab === 'archivos' && (
                  <div>
                    {archivos.length === 0 ? (
                      <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                        No hay archivos adjuntos.
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {archivos.map((archivo) => (
                          <div
                            key={archivo.id}
                            className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-750 transition-colors"
                          >
                            <div className="flex-shrink-0" aria-hidden="true">
                              {getFileIcon(archivo.tipoMime)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-900 dark:text-white truncate">
                                {archivo.nombreOriginal}
                              </p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {formatFileSize(archivo.tamanio)} - Subido por {archivo.subidoPor.nombre} - {formatDate(archivo.fechaSubida)}
                              </p>
                            </div>
                            <button
                              className="flex-shrink-0 p-2 text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
                              title="Descargar archivo"
                              aria-label={`Descargar ${archivo.nombreOriginal}`}
                            >
                              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                              </svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
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
                    {ticket.categoriaNombre || ticket.categoria?.nombre}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500 dark:text-gray-400">Cliente</dt>
                  <dd className="mt-1">
                    <div className="text-gray-900 dark:text-white">{ticket.clienteNombre || ticket.cliente?.nombre}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{ticket.clienteEmail || ticket.cliente?.email}</div>
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500 dark:text-gray-400">Asignado a</dt>
                  <dd className="mt-1 text-gray-900 dark:text-white">
                    {ticket.empleadoAsignadoNombre || ticket.empleadoAsignado?.nombre || 'Sin asignar'}
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
                    Esta seguro de que desea eliminar este ticket? Esta accion no se puede deshacer.
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
                  className="btn-danger flex items-center gap-2"
                  onClick={handleDelete}
                  disabled={deleting}
                >
                  {deleting ? (
                    <>
                      <svg
                        className="animate-spin h-4 w-4"
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
                      Eliminando...
                    </>
                  ) : (
                    'Eliminar'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
}
