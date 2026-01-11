'use client';

import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout';
import Link from 'next/link';
import api from '@/lib/api';

interface Ticket {
  id: number;
  titulo: string;
  estado: string;
  prioridad: string;
  categoriaNombre: string;
  clienteNombre: string;
  empleadoAsignadoNombre: string | null;
  fechaCreacion: string;
}

interface TicketListResponse {
  items: Ticket[];
  totalItems: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Demo tickets for fallback when backend is unavailable
const demoTickets: Ticket[] = [
  {
    id: 1,
    titulo: 'Error al cargar reportes en el sistema',
    estado: 'EnProceso',
    prioridad: 'Alta',
    categoriaNombre: 'Sistema de Ventas',
    clienteNombre: 'Cliente Demo',
    empleadoAsignadoNombre: 'Empleado Demo',
    fechaCreacion: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 2,
    titulo: 'No puedo acceder al portal web',
    estado: 'Abierto',
    prioridad: 'Media',
    categoriaNombre: 'Portal Web',
    clienteNombre: 'Juan Perez',
    empleadoAsignadoNombre: null,
    fechaCreacion: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 3,
    titulo: 'Solicitud de nueva funcionalidad',
    estado: 'EnEspera',
    prioridad: 'Baja',
    categoriaNombre: 'Aplicacion Movil',
    clienteNombre: 'Maria Garcia',
    empleadoAsignadoNombre: 'Admin Demo',
    fechaCreacion: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 4,
    titulo: 'Problema con facturacion electronica',
    estado: 'Abierto',
    prioridad: 'Alta',
    categoriaNombre: 'Facturacion',
    clienteNombre: 'Carlos Rodriguez',
    empleadoAsignadoNombre: null,
    fechaCreacion: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 5,
    titulo: 'Error en sincronizacion de inventario',
    estado: 'EnProceso',
    prioridad: 'Media',
    categoriaNombre: 'Inventario',
    clienteNombre: 'Ana Martinez',
    empleadoAsignadoNombre: 'Empleado Demo',
    fechaCreacion: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export default function EmpleadoTicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState('');
  const [filtroPrioridad, setFiltroPrioridad] = useState('');
  const [busqueda, setBusqueda] = useState('');

  useEffect(() => {
    // AbortController to cancel pending requests when component unmounts
    // or when filters change (prevents state updates on unmounted component)
    const abortController = new AbortController();
    let isMounted = true;

    const fetchTickets = async () => {
      try {
        const params = new URLSearchParams();
        if (filtroEstado) params.append('estado', filtroEstado);
        if (filtroPrioridad) params.append('prioridad', filtroPrioridad);
        if (busqueda) params.append('busqueda', busqueda);

        const response = await api.get<TicketListResponse>(`/tickets?${params}`, {
          signal: abortController.signal
        });

        // Only update state if component is still mounted
        if (!isMounted) return;

        setTickets(response.data.items);
      } catch (error: unknown) {
        // Don't update state if request was aborted (user navigated away)
        if (error instanceof Error && error.name === 'AbortError') {
          console.log('Request aborted - user navigated away');
          return;
        }
        // Only update state if still mounted
        if (!isMounted) return;
        console.error('Error fetching tickets:', error);
        // Fallback to demo data when API is unavailable
        console.log('Using demo tickets (API not available)');
        setTickets(filterDemoTickets());
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
  }, [filtroEstado, filtroPrioridad, busqueda]);

  const filterDemoTickets = () => {
    let filtered = [...demoTickets];
    if (filtroEstado) {
      filtered = filtered.filter(t => t.estado === filtroEstado);
    }
    if (filtroPrioridad) {
      filtered = filtered.filter(t => t.prioridad === filtroPrioridad);
    }
    if (busqueda) {
      const search = busqueda.toLowerCase();
      filtered = filtered.filter(t => t.titulo.toLowerCase().includes(search));
    }
    return filtered;
  };

  const getEstadoBadgeClass = (estado: string) => {
    const classes: Record<string, string> = {
      'Abierto': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      'EnProceso': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      'EnEspera': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
      'Resuelto': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      'Cerrado': 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
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

  return (
    <MainLayout requiredRoles={['Admin', 'Empleado']}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Todos los Tickets
          </h1>
        </div>

        {/* Filters */}
        <div className="card p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Buscar
              </label>
              <input
                type="text"
                className="input w-full"
                placeholder="Buscar por titulo..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Estado
              </label>
              <select
                className="input w-full"
                value={filtroEstado}
                onChange={(e) => setFiltroEstado(e.target.value)}
              >
                <option value="">Todos</option>
                <option value="Abierto">Abierto</option>
                <option value="EnProceso">En Proceso</option>
                <option value="EnEspera">En Espera</option>
                <option value="Resuelto">Resuelto</option>
                <option value="Cerrado">Cerrado</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Prioridad
              </label>
              <select
                className="input w-full"
                value={filtroPrioridad}
                onChange={(e) => setFiltroPrioridad(e.target.value)}
              >
                <option value="">Todas</option>
                <option value="Alta">Alta</option>
                <option value="Media">Media</option>
                <option value="Baja">Baja</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                className="btn-secondary w-full"
                onClick={() => {
                  setFiltroEstado('');
                  setFiltroPrioridad('');
                  setBusqueda('');
                }}
              >
                Limpiar Filtros
              </button>
            </div>
          </div>
        </div>

        {/* Tickets Table */}
        <div className="card overflow-hidden">
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
                    Cliente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Asignado a
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                      Cargando...
                    </td>
                  </tr>
                ) : tickets.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                      No hay tickets para mostrar
                    </td>
                  </tr>
                ) : (
                  tickets.map((ticket) => (
                    <tr key={ticket.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        #{ticket.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white max-w-xs truncate" title={ticket.titulo}>
                        {ticket.titulo}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getEstadoBadgeClass(ticket.estado)}`}>
                          {formatEstado(ticket.estado)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPrioridadBadgeClass(ticket.prioridad)}`}>
                          {ticket.prioridad}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 max-w-[150px] truncate">
                        {ticket.clienteNombre}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {ticket.empleadoAsignadoNombre || 'Sin asignar'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {new Date(ticket.fechaCreacion).toLocaleDateString('es-ES')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <Link
                          href={`/empleado/tickets/${ticket.id}`}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          Ver detalle
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
