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
  categoria?: string;
  categoriaNombre?: string;
  clienteNombre: string;
  empleadoNombre?: string | null;
  empleadoAsignadoNombre?: string | null;
  fechaCreacion: string;
}

// Demo tickets for testing when backend is unavailable
const demoTickets: Ticket[] = [
  {
    id: 1,
    titulo: 'Error al cargar reportes en el sistema',
    estado: 'EnProceso',
    prioridad: 'Alta',
    categoria: 'Sistema de Ventas',
    clienteNombre: 'Cliente Demo',
    empleadoNombre: 'Empleado Demo',
    fechaCreacion: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 2,
    titulo: 'No puedo acceder al portal web',
    estado: 'Abierto',
    prioridad: 'Media',
    categoria: 'Portal Web',
    clienteNombre: 'Juan Perez',
    empleadoNombre: null,
    fechaCreacion: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 3,
    titulo: 'Solicitud de nueva funcionalidad',
    estado: 'EnEspera',
    prioridad: 'Baja',
    categoria: 'Aplicacion Movil',
    clienteNombre: 'Maria Garcia',
    empleadoNombre: 'Admin Demo',
    fechaCreacion: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 4,
    titulo: 'Problema con facturacion electronica',
    estado: 'Abierto',
    prioridad: 'Alta',
    categoria: 'Facturacion',
    clienteNombre: 'Carlos Rodriguez',
    empleadoNombre: null,
    fechaCreacion: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 5,
    titulo: 'Error en sincronizacion de inventario',
    estado: 'EnProceso',
    prioridad: 'Media',
    categoria: 'Inventario',
    clienteNombre: 'Ana Martinez',
    empleadoNombre: 'Empleado Demo',
    fechaCreacion: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 6,
    titulo: 'Solicitud de capacitacion',
    estado: 'Resuelto',
    prioridad: 'Baja',
    categoria: 'Soporte',
    clienteNombre: 'Luis Fernandez',
    empleadoNombre: 'Admin Demo',
    fechaCreacion: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 7,
    titulo: 'Cambio de contrasena no funciona',
    estado: 'Abierto',
    prioridad: 'Alta',
    categoria: 'Seguridad',
    clienteNombre: 'Rosa Lopez',
    empleadoNombre: null,
    fechaCreacion: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 8,
    titulo: 'Reporte de ventas incorrecto',
    estado: 'EnEspera',
    prioridad: 'Media',
    categoria: 'Reportes',
    clienteNombre: 'Pedro Sanchez',
    empleadoNombre: 'Empleado Demo',
    fechaCreacion: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 9,
    titulo: 'Integracion con API externa',
    estado: 'EnProceso',
    prioridad: 'Alta',
    categoria: 'Integraciones',
    clienteNombre: 'Sofia Torres',
    empleadoNombre: 'Admin Demo',
    fechaCreacion: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 10,
    titulo: 'Actualizacion de datos de cliente',
    estado: 'Cerrado',
    prioridad: 'Baja',
    categoria: 'Datos',
    clienteNombre: 'Miguel Herrera',
    empleadoNombre: 'Empleado Demo',
    fechaCreacion: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 11,
    titulo: 'Error en modulo de pagos',
    estado: 'Abierto',
    prioridad: 'Alta',
    categoria: 'Pagos',
    clienteNombre: 'Laura Gomez',
    empleadoNombre: null,
    fechaCreacion: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 12,
    titulo: 'Consulta sobre precios',
    estado: 'Resuelto',
    prioridad: 'Baja',
    categoria: 'Ventas',
    clienteNombre: 'Diego Ruiz',
    empleadoNombre: 'Admin Demo',
    fechaCreacion: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 13,
    titulo: 'Sistema caido urgente',
    estado: 'Abierto',
    prioridad: 'Alta',
    categoria: 'Infraestructura',
    clienteNombre: 'Fernando Diaz',
    empleadoNombre: null,
    fechaCreacion: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 14,
    titulo: 'Error critico en produccion',
    estado: 'Abierto',
    prioridad: 'Alta',
    categoria: 'Produccion',
    clienteNombre: 'Carmen Vega',
    empleadoNombre: null,
    fechaCreacion: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 15,
    titulo: 'Base de datos lenta',
    estado: 'Abierto',
    prioridad: 'Alta',
    categoria: 'Base de Datos',
    clienteNombre: 'Roberto Nunez',
    empleadoNombre: null,
    fechaCreacion: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 16,
    titulo: 'Problema de memoria',
    estado: 'Abierto',
    prioridad: 'Alta',
    categoria: 'Servidor',
    clienteNombre: 'Isabel Castro',
    empleadoNombre: null,
    fechaCreacion: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 17,
    titulo: 'Fallo en backup',
    estado: 'Abierto',
    prioridad: 'Alta',
    categoria: 'Backup',
    clienteNombre: 'Andres Moreno',
    empleadoNombre: null,
    fechaCreacion: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 18,
    titulo: 'Problema de red',
    estado: 'Abierto',
    prioridad: 'Alta',
    categoria: 'Red',
    clienteNombre: 'Patricia Luna',
    empleadoNombre: null,
    fechaCreacion: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

const ITEMS_PER_PAGE = 5;

export default function AdminTicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState('');
  const [filtroPrioridad, setFiltroPrioridad] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchTickets();
    setCurrentPage(1); // Reset to page 1 when filters change
  }, [filtroEstado, filtroPrioridad, busqueda]);

  // Pagination calculations
  const totalPages = Math.ceil(tickets.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedTickets = tickets.slice(startIndex, endIndex);

  const fetchTickets = async () => {
    try {
      const params = new URLSearchParams();
      if (filtroEstado) params.append('estado', filtroEstado);
      if (filtroPrioridad) params.append('prioridad', filtroPrioridad);
      if (busqueda) params.append('busqueda', busqueda);

      const response = await api.get(`/tickets?${params}`);
      // API returns { items: [], totalItems, page, pageSize, totalPages }
      const data = response.data;
      if (data.items) {
        setTickets(data.items);
      } else if (Array.isArray(data)) {
        setTickets(data);
      } else {
        console.log('Using demo tickets (unexpected response format)');
        setTickets(filterDemoTickets());
      }
    } catch (error) {
      // Fallback to demo data
      console.log('Using demo tickets (API not available)');
      setTickets(filterDemoTickets());
    } finally {
      setLoading(false);
    }
  };

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
    <MainLayout requiredRoles={['Admin']}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Gestion de Tickets
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
                ) : paginatedTickets.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                      No hay tickets para mostrar
                    </td>
                  </tr>
                ) : (
                  paginatedTickets.map((ticket) => (
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
                        {ticket.empleadoAsignadoNombre || ticket.empleadoNombre || 'Sin asignar'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {new Date(ticket.fechaCreacion).toLocaleDateString('es-ES')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <Link
                          href={`/admin/tickets/${ticket.id}`}
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

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Mostrando {startIndex + 1} - {Math.min(endIndex, tickets.length)} de {tickets.length} tickets
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 text-sm font-medium rounded-md border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Anterior
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                      currentPage === page
                        ? 'bg-primary-600 text-white'
                        : 'border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 text-sm font-medium rounded-md border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Siguiente
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
