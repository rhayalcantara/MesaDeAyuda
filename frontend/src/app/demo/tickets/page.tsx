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

const demoTickets: Ticket[] = [
  {
    id: 1,
    titulo: 'Error al generar reportes de ventas',
    estado: 'Abierto',
    prioridad: 'Alta',
    categoria: 'Sistema de Ventas',
    fechaCreacion: '2026-01-06',
    cliente: 'Juan Perez',
  },
  {
    id: 2,
    titulo: 'Actualizacion de datos de inventario lenta',
    estado: 'EnProceso',
    prioridad: 'Media',
    categoria: 'Sistema de Inventario',
    fechaCreacion: '2026-01-05',
    cliente: 'Maria Garcia',
  },
  {
    id: 3,
    titulo: 'Solicitud de nuevo modulo de facturacion',
    estado: 'EnEspera',
    prioridad: 'Baja',
    categoria: 'Portal Web',
    fechaCreacion: '2026-01-04',
    cliente: 'Carlos Lopez',
  },
  {
    id: 4,
    titulo: 'Bug en la aplicacion movil al sincronizar',
    estado: 'Resuelto',
    prioridad: 'Alta',
    categoria: 'Aplicacion Movil',
    fechaCreacion: '2026-01-03',
    cliente: 'Ana Martinez',
  },
  {
    id: 5,
    titulo: 'Consulta sobre configuracion del sistema',
    estado: 'Cerrado',
    prioridad: 'Baja',
    categoria: 'Otro',
    fechaCreacion: '2026-01-02',
    cliente: 'Pedro Sanchez',
  },
];

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

export default function DemoTicketsPage() {
  const [tickets] = useState(demoTickets);

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

        {/* Tickets table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
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
              {tickets.map((ticket) => (
                <tr key={ticket.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    #{ticket.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    <Link
                      href={`/demo/tickets/${ticket.id}`}
                      className="text-primary-600 dark:text-primary-400 hover:underline"
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
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {ticket.categoria}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {ticket.cliente}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

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
