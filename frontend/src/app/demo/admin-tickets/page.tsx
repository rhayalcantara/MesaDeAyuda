'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';

interface Ticket {
  id: number;
  titulo: string;
  estado: string;
  prioridad: string;
  categoria: string;
  clienteNombre: string;
  empleadoNombre: string | null;
  fechaCreacion: string;
}

// Demo tickets for testing filter state preservation
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
];

export default function DemoAdminTicketsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Initialize filters from URL params (for state preservation)
  const [filtroEstado, setFiltroEstado] = useState(searchParams.get('estado') || '');
  const [filtroPrioridad, setFiltroPrioridad] = useState(searchParams.get('prioridad') || '');
  const [busqueda, setBusqueda] = useState(searchParams.get('busqueda') || '');
  const [currentPage, setCurrentPage] = useState(1);

  // Update URL when filters change (to preserve state on back navigation)
  useEffect(() => {
    const params = new URLSearchParams();
    if (filtroEstado) params.set('estado', filtroEstado);
    if (filtroPrioridad) params.set('prioridad', filtroPrioridad);
    if (busqueda) params.set('busqueda', busqueda);

    const queryString = params.toString();
    const newUrl = queryString ? `?${queryString}` : '/demo/admin-tickets';

    // Use replaceState to update URL without adding to history
    window.history.replaceState(null, '', newUrl);
  }, [filtroEstado, filtroPrioridad, busqueda]);

  // Filter tickets
  const filteredTickets = demoTickets.filter(ticket => {
    if (filtroEstado && ticket.estado !== filtroEstado) return false;
    if (filtroPrioridad && ticket.prioridad !== filtroPrioridad) return false;
    if (busqueda && !ticket.titulo.toLowerCase().includes(busqueda.toLowerCase())) return false;
    return true;
  });

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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Demo - Lista de Tickets con Filtros
          </h1>
          <Link href="/demo" className="text-blue-600 hover:text-blue-800 dark:text-blue-400">
            Volver a Demo
          </Link>
        </div>

        {/* Info box */}
        <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <h4 className="font-semibold text-blue-800 dark:text-blue-200">Feature #69: Filter state preserved when returning to list</h4>
          <p className="text-blue-700 dark:text-blue-300 text-sm mt-1">
            Los filtros se guardan en la URL. Al hacer clic en un ticket y volver con el boton atras,
            los filtros se mantienen aplicados.
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Buscar
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
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
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
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
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
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
                className="w-full px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
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

          {/* Current filter status */}
          <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
            Filtros activos:
            {filtroEstado && <span className="ml-2 px-2 py-1 bg-blue-100 dark:bg-blue-900 rounded">Estado: {formatEstado(filtroEstado)}</span>}
            {filtroPrioridad && <span className="ml-2 px-2 py-1 bg-yellow-100 dark:bg-yellow-900 rounded">Prioridad: {filtroPrioridad}</span>}
            {busqueda && <span className="ml-2 px-2 py-1 bg-green-100 dark:bg-green-900 rounded">Busqueda: {busqueda}</span>}
            {!filtroEstado && !filtroPrioridad && !busqueda && <span className="ml-2">Ninguno</span>}
          </div>
        </div>

        {/* Tickets Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Titulo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Estado</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Prioridad</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Cliente</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredTickets.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                      No hay tickets que coincidan con los filtros
                    </td>
                  </tr>
                ) : (
                  filteredTickets.map((ticket) => (
                    <tr key={ticket.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        #{ticket.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white max-w-xs truncate">
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
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {ticket.clienteNombre}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <Link
                          href={`/demo/admin-tickets/${ticket.id}?returnUrl=${encodeURIComponent(`/demo/admin-tickets?estado=${filtroEstado}&prioridad=${filtroPrioridad}&busqueda=${busqueda}`)}`}
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

          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Mostrando {filteredTickets.length} de {demoTickets.length} tickets
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
