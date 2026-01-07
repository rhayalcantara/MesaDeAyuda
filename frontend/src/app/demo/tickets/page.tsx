'use client';

import { useState } from 'react';
import Link from 'next/link';

// Demo tickets page for testing accessibility of status/priority indicators
// This page doesn't require authentication

interface Ticket {
  id: number;
  titulo: string;
  estado: 'Abierto' | 'EnProceso' | 'EnEspera' | 'Resuelto' | 'Cerrado';
  prioridad: 'Alta' | 'Media' | 'Baja';
  categoria: string;
  fechaCreacion: string;
  cliente: string;
}

// Generate many demo tickets for pagination testing
const generateDemoTickets = (): Ticket[] => {
  const estados: Ticket['estado'][] = ['Abierto', 'EnProceso', 'EnEspera', 'Resuelto', 'Cerrado'];
  const prioridades: Ticket['prioridad'][] = ['Alta', 'Media', 'Baja'];
  const categorias = ['Sistema de Ventas', 'Portal Web', 'Aplicacion Movil', 'Sistema de Inventario', 'Facturacion', 'Soporte General'];
  const clientes = ['Juan Perez', 'Maria Garcia', 'Carlos Lopez', 'Ana Martinez', 'Pedro Sanchez', 'Laura Rodriguez', 'Miguel Torres', 'Sofia Fernandez'];
  const titulos = [
    'Error al generar reportes',
    'Problema de sincronizacion',
    'Solicitud de nueva funcionalidad',
    'Bug en la interfaz',
    'Consulta sobre configuracion',
    'Falla al exportar datos',
    'Lentitud en el sistema',
    'Error de autenticacion',
    'Problema con notificaciones',
    'Actualizacion requerida',
  ];

  const tickets: Ticket[] = [];
  for (let i = 1; i <= 50; i++) {
    tickets.push({
      id: i,
      titulo: `${titulos[i % titulos.length]} #${i}`,
      estado: estados[i % estados.length],
      prioridad: prioridades[i % prioridades.length],
      categoria: categorias[i % categorias.length],
      fechaCreacion: `2026-01-${String(Math.max(1, 15 - (i % 15))).padStart(2, '0')}`,
      cliente: clientes[i % clientes.length],
    });
  }
  return tickets;
};

const demoTickets: Ticket[] = generateDemoTickets();

// Priority badge component - uses text AND color (accessible)
function PriorityBadge({ prioridad }: { prioridad: Ticket['prioridad'] }) {
  const config = {
    Alta: {
      bg: 'bg-red-100 dark:bg-red-900/50',
      text: 'text-red-800 dark:text-red-200',
      border: 'border-red-200 dark:border-red-800',
      icon: '⚠️', // Visual icon for emphasis
    },
    Media: {
      bg: 'bg-yellow-100 dark:bg-yellow-900/50',
      text: 'text-yellow-800 dark:text-yellow-200',
      border: 'border-yellow-200 dark:border-yellow-800',
      icon: '●',
    },
    Baja: {
      bg: 'bg-green-100 dark:bg-green-900/50',
      text: 'text-green-800 dark:text-green-200',
      border: 'border-green-200 dark:border-green-800',
      icon: '○',
    },
  };

  const styles = config[prioridad];

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles.bg} ${styles.text} ${styles.border}`}
    >
      <span aria-hidden="true">{styles.icon}</span>
      {prioridad}
    </span>
  );
}

// Status badge component - uses text AND color (accessible)
function StatusBadge({ estado }: { estado: Ticket['estado'] }) {
  const config = {
    Abierto: {
      bg: 'bg-blue-100 dark:bg-blue-900/50',
      text: 'text-blue-800 dark:text-blue-200',
      border: 'border-blue-200 dark:border-blue-800',
      icon: '🔵',
    },
    EnProceso: {
      bg: 'bg-purple-100 dark:bg-purple-900/50',
      text: 'text-purple-800 dark:text-purple-200',
      border: 'border-purple-200 dark:border-purple-800',
      icon: '🟣',
    },
    EnEspera: {
      bg: 'bg-orange-100 dark:bg-orange-900/50',
      text: 'text-orange-800 dark:text-orange-200',
      border: 'border-orange-200 dark:border-orange-800',
      icon: '🟠',
    },
    Resuelto: {
      bg: 'bg-green-100 dark:bg-green-900/50',
      text: 'text-green-800 dark:text-green-200',
      border: 'border-green-200 dark:border-green-800',
      icon: '✅',
    },
    Cerrado: {
      bg: 'bg-gray-100 dark:bg-gray-700',
      text: 'text-gray-800 dark:text-gray-200',
      border: 'border-gray-200 dark:border-gray-600',
      icon: '⬛',
    },
  };

  const styles = config[estado];

  // Map estado to readable label
  const labels: Record<string, string> = {
    Abierto: 'Abierto',
    EnProceso: 'En Proceso',
    EnEspera: 'En Espera',
    Resuelto: 'Resuelto',
    Cerrado: 'Cerrado',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles.bg} ${styles.text} ${styles.border}`}
    >
      <span aria-hidden="true">{styles.icon}</span>
      {labels[estado]}
    </span>
  );
}

const ITEMS_PER_PAGE = 10;

export default function DemoTicketsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredTickets, setFilteredTickets] = useState(demoTickets);
  const [currentPage, setCurrentPage] = useState(1);

  // Calculate pagination values
  const totalPages = Math.ceil(filteredTickets.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedTickets = filteredTickets.slice(startIndex, endIndex);

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1); // Reset to page 1 when searching
    if (searchTerm.trim() === '') {
      setFilteredTickets(demoTickets);
    } else {
      const filtered = demoTickets.filter(
        ticket =>
          ticket.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
          ticket.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
          ticket.categoria.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredTickets(filtered);
    }
  };

  // Clear search
  const handleClearSearch = () => {
    setSearchTerm('');
    setFilteredTickets(demoTickets);
    setCurrentPage(1);
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Demo - Lista de Tickets
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Esta pagina demuestra indicadores de estado y prioridad accesibles
          </p>
        </div>

        {/* Search bar */}
        <div className="mb-6 bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <label htmlFor="search" className="sr-only">Buscar tickets</label>
              <input
                id="search"
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por titulo, cliente o categoria..."
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                Buscar
              </button>
              {searchTerm && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                >
                  Limpiar
                </button>
              )}
            </div>
          </form>
          {searchTerm && (
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Buscando: &quot;{searchTerm}&quot; - {filteredTickets.length} resultado(s) encontrado(s)
            </p>
          )}
        </div>

        {/* Accessibility information */}
        <div className="mb-6 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <h2 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
            Informacion de Accesibilidad - Color + Texto
          </h2>
          <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1 list-disc list-inside">
            <li>Los indicadores de prioridad usan color <strong>Y</strong> texto (Alta, Media, Baja)</li>
            <li>Los indicadores de estado usan color <strong>Y</strong> texto (Abierto, En Proceso, etc.)</li>
            <li>Los iconos son decorativos (aria-hidden) - el texto es lo que importa</li>
            <li>La informacion no depende solo del color para ser comprendida</li>
          </ul>
        </div>

        {/* No results message */}
        {filteredTickets.length === 0 && (
          <div className="mb-6 bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center">
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
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
              No se encontraron resultados
            </h3>
            <p className="mt-2 text-gray-500 dark:text-gray-400">
              No hay tickets que coincidan con &quot;{searchTerm}&quot;
            </p>
            <button
              onClick={handleClearSearch}
              className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Limpiar busqueda
            </button>
          </div>
        )}

        {/* Tickets table - only show if there are results */}
        {filteredTickets.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  ID
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Titulo
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Estado
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Prioridad
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Categoria
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Cliente
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {paginatedTickets.map((ticket) => (
                <tr key={ticket.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    #{ticket.id}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-white max-w-xs">
                    <Link
                      href={`/demo/tickets/${ticket.id}`}
                      className="text-primary-600 dark:text-primary-400 hover:underline block truncate"
                      title={ticket.titulo}
                    >
                      {ticket.titulo}
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge estado={ticket.estado} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <PriorityBadge prioridad={ticket.prioridad} />
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 max-w-[150px]">
                    <span className="block truncate" title={ticket.categoria}>
                      {ticket.categoria}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 max-w-[150px]">
                    <span className="block truncate" title={ticket.cliente}>
                      {ticket.cliente}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Mostrando {startIndex + 1} - {Math.min(endIndex, filteredTickets.length)} de {filteredTickets.length} tickets
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-2 text-sm font-medium rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Anterior
                </button>
                {/* Page numbers */}
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      currentPage === page
                        ? 'bg-primary-600 text-white'
                        : 'border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600'
                    }`}
                    aria-current={currentPage === page ? 'page' : undefined}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 text-sm font-medium rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Siguiente
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Legend */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
              Prioridades (Color + Texto)
            </h3>
            <div className="flex flex-wrap gap-2">
              <PriorityBadge prioridad="Alta" />
              <PriorityBadge prioridad="Media" />
              <PriorityBadge prioridad="Baja" />
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
              Estados (Color + Texto)
            </h3>
            <div className="flex flex-wrap gap-2">
              <StatusBadge estado="Abierto" />
              <StatusBadge estado="EnProceso" />
              <StatusBadge estado="EnEspera" />
              <StatusBadge estado="Resuelto" />
              <StatusBadge estado="Cerrado" />
            </div>
          </div>
        </div>

        <div className="mt-6">
          <Link
            href="/demo"
            className="text-primary-600 dark:text-primary-400 hover:underline text-sm"
          >
            ← Volver a la demo principal
          </Link>
        </div>
      </div>
    </div>
  );
}
