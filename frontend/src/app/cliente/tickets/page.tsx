'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { MainLayout } from '@/components/layout';
import api from '@/lib/api';

interface Ticket {
  id: number;
  titulo: string;
  descripcion: string;
  estado: string;
  prioridad: string;
  categoriaNombre: string;
  fechaCreacion: string;
  fechaActualizacion: string;
  empleadoAsignadoNombre: string | null;
  comentariosCount: number;
  archivosCount: number;
}

interface TicketListResponse {
  items: Ticket[];
  totalItems: number;
  page: number;
  pageSize: number;
  totalPages: number;
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

export default function ClienteTicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [totalItems, setTotalItems] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filtroEstado, setFiltroEstado] = useState('');
  const [busqueda, setBusqueda] = useState('');

  useEffect(() => {
    // AbortController to cancel pending requests when component unmounts
    // or when page/filters change (prevents state updates on unmounted component)
    const abortController = new AbortController();
    let isMounted = true;

    const fetchTickets = async () => {
      setLoading(true);
      setError('');
      try {
        const params = new URLSearchParams();
        params.append('page', page.toString());
        params.append('pageSize', '10');
        if (filtroEstado) params.append('estado', filtroEstado);
        if (busqueda) params.append('busqueda', busqueda);

        const response = await api.get<TicketListResponse>(`/tickets/mis-tickets?${params.toString()}`, {
          signal: abortController.signal
        });

        // Only update state if component is still mounted
        if (!isMounted) return;

        setTickets(response.data.items);
        setTotalItems(response.data.totalItems);
        setTotalPages(response.data.totalPages);
      } catch (err: unknown) {
        // Don't update state if request was aborted (user navigated away)
        if (err instanceof Error && err.name === 'AbortError') {
          console.log('Request aborted - user navigated away');
          return;
        }
        // Only update state if still mounted
        if (!isMounted) return;
        console.error('Error fetching tickets:', err);
        setError('No se pudieron cargar los tickets. Intente nuevamente.');
        setTickets([]);
      } finally {
        // Only update loading state if still mounted
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchTickets();

    // Cleanup function - runs when component unmounts or before next effect
    return () => {
      isMounted = false;
      abortController.abort();
    };
  }, [page, filtroEstado, busqueda]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Setting page to 1 will trigger the useEffect to fetch tickets
    setPage(1);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <MainLayout requiredRoles={['Cliente']}>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Mis Tickets
          </h1>
          <Link href="/cliente/tickets/nuevo" className="btn-primary">
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
                d="M12 4v16m8-8H4"
              />
            </svg>
            Nuevo Ticket
          </Link>
        </div>

        {/* Filters */}
        <div className="card p-4">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label htmlFor="busqueda" className="sr-only">Buscar</label>
              <input
                id="busqueda"
                type="text"
                placeholder="Buscar por titulo..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="input w-full"
              />
            </div>
            <div className="w-full sm:w-48">
              <label htmlFor="estado" className="sr-only">Estado</label>
              <select
                id="estado"
                value={filtroEstado}
                onChange={(e) => {
                  setFiltroEstado(e.target.value);
                  setPage(1);
                }}
                className="input w-full"
              >
                <option value="">Todos los estados</option>
                <option value="Abierto">Abierto</option>
                <option value="EnProceso">En Proceso</option>
                <option value="EnEspera">En Espera</option>
                <option value="Resuelto">Resuelto</option>
                <option value="Cerrado">Cerrado</option>
              </select>
            </div>
            <button type="submit" className="btn-secondary">
              Buscar
            </button>
          </form>
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg" role="alert">
            {error}
          </div>
        )}

        {/* Loading state */}
        {loading ? (
          <div className="card p-6">
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
              <span className="ml-3 text-gray-600 dark:text-gray-400">Cargando tickets...</span>
            </div>
          </div>
        ) : tickets.length === 0 ? (
          /* Empty state */
          <div className="card p-6">
            <div className="text-center py-12">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
              <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
                No tienes tickets aun
              </h3>
              <p className="mt-2 text-gray-500 dark:text-gray-400">
                Crea tu primer ticket para reportar un problema o solicitar ayuda.
              </p>
              <div className="mt-6">
                <Link href="/cliente/tickets/nuevo" className="btn-primary">
                  Crear primer ticket
                </Link>
              </div>
            </div>
          </div>
        ) : (
          /* Tickets list */
          <>
            <div className="card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        ID
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Titulo
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Estado
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Prioridad
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Categoria
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Fecha
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                    {tickets.map((ticket) => (
                      <tr key={ticket.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                          #{ticket.id}
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-900 dark:text-white max-w-xs truncate" title={ticket.titulo}>
                          {ticket.titulo}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${estadoColors[ticket.estado] || 'bg-gray-100 text-gray-800'}`}>
                            {estadoLabels[ticket.estado] || ticket.estado}
                          </span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${prioridadColors[ticket.prioridad] || 'bg-gray-100 text-gray-800'}`}>
                            {ticket.prioridad}
                          </span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 max-w-[150px] truncate" title={ticket.categoriaNombre}>
                          {ticket.categoriaNombre}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {formatDate(ticket.fechaCreacion)}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm">
                          <Link
                            href={`/cliente/tickets/${ticket.id}`}
                            className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300"
                          >
                            Ver detalle
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Mostrando {(page - 1) * 10 + 1} - {Math.min(page * 10, totalItems)} de {totalItems} tickets
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Anterior
                  </button>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = i + 1;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPage(pageNum)}
                        className={`px-3 py-2 rounded-md text-sm font-medium ${
                          page === pageNum
                            ? 'bg-primary-600 text-white'
                            : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Siguiente
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </MainLayout>
  );
}
