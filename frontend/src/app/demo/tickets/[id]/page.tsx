'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

// Demo ticket detail page for testing timezone display
// This page doesn't require authentication

interface Ticket {
  id: number;
  titulo: string;
  descripcion: string;
  estado: 'Abierto' | 'EnProceso' | 'EnEspera' | 'Resuelto' | 'Cerrado';
  prioridad: 'Alta' | 'Media' | 'Baja';
  categoria: string;
  fechaCreacion: Date;
  fechaActualizacion: Date;
  fechaPrimeraRespuesta?: Date;
  cliente: string;
  empleadoAsignado?: string;
}

interface Comment {
  id: number;
  usuario: string;
  texto: string;
  fecha: Date;
}

// Helper function to format date in local timezone
function formatLocalDate(date: Date): string {
  return new Intl.DateTimeFormat('es-ES', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  }).format(date);
}

// Helper function to get relative time
function getRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'hace un momento';
  if (diffMins < 60) return `hace ${diffMins} minuto${diffMins !== 1 ? 's' : ''}`;
  if (diffHours < 24) return `hace ${diffHours} hora${diffHours !== 1 ? 's' : ''}`;
  if (diffDays < 7) return `hace ${diffDays} día${diffDays !== 1 ? 's' : ''}`;
  return formatLocalDate(date);
}

// Priority badge component
function PriorityBadge({ prioridad }: { prioridad: Ticket['prioridad'] }) {
  const config = {
    Alta: {
      bg: 'bg-red-100 dark:bg-red-900/50',
      text: 'text-red-800 dark:text-red-200',
      border: 'border-red-200 dark:border-red-800',
      icon: '⚠️',
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
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles.bg} ${styles.text} ${styles.border}`}>
      <span aria-hidden="true">{styles.icon}</span>
      {prioridad}
    </span>
  );
}

// Status badge component
function StatusBadge({ estado }: { estado: Ticket['estado'] }) {
  const config = {
    Abierto: { bg: 'bg-blue-100 dark:bg-blue-900/50', text: 'text-blue-800 dark:text-blue-200', border: 'border-blue-200 dark:border-blue-800', icon: '🔵' },
    EnProceso: { bg: 'bg-purple-100 dark:bg-purple-900/50', text: 'text-purple-800 dark:text-purple-200', border: 'border-purple-200 dark:border-purple-800', icon: '🟣' },
    EnEspera: { bg: 'bg-orange-100 dark:bg-orange-900/50', text: 'text-orange-800 dark:text-orange-200', border: 'border-orange-200 dark:border-orange-800', icon: '🟠' },
    Resuelto: { bg: 'bg-green-100 dark:bg-green-900/50', text: 'text-green-800 dark:text-green-200', border: 'border-green-200 dark:border-green-800', icon: '✅' },
    Cerrado: { bg: 'bg-gray-100 dark:bg-gray-700', text: 'text-gray-800 dark:text-gray-200', border: 'border-gray-200 dark:border-gray-600', icon: '⬛' },
  };

  const labels: Record<string, string> = {
    Abierto: 'Abierto',
    EnProceso: 'En Proceso',
    EnEspera: 'En Espera',
    Resuelto: 'Resuelto',
    Cerrado: 'Cerrado',
  };

  const styles = config[estado];

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles.bg} ${styles.text} ${styles.border}`}>
      <span aria-hidden="true">{styles.icon}</span>
      {labels[estado]}
    </span>
  );
}

export default function DemoTicketDetailPage() {
  const params = useParams();
  const ticketId = params.id;

  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [timezone, setTimezone] = useState<string>('');

  useEffect(() => {
    // Get the user's timezone
    setTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone);

    // Update current time every second
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Create demo ticket with actual timestamps
  const now = new Date();
  const ticket: Ticket = {
    id: Number(ticketId) || 1,
    titulo: 'Error al generar reportes de ventas',
    descripcion: 'Al intentar generar el reporte mensual de ventas, el sistema muestra un error "Timeout exceeded". Esto ocurre cuando selecciono más de 30 días de datos. El problema comenzó después de la última actualización del sistema.\n\nPasos para reproducir:\n1. Ir a Reportes > Ventas\n2. Seleccionar rango de fechas mayor a 30 días\n3. Hacer clic en "Generar Reporte"\n4. El sistema muestra error de timeout',
    estado: 'EnProceso',
    prioridad: 'Alta',
    categoria: 'Sistema de Ventas',
    fechaCreacion: new Date(now.getTime() - 3600000 * 24 * 2), // 2 days ago
    fechaActualizacion: new Date(now.getTime() - 3600000 * 2), // 2 hours ago
    fechaPrimeraRespuesta: new Date(now.getTime() - 3600000 * 24), // 1 day ago
    cliente: 'Juan Perez',
    empleadoAsignado: 'Maria Garcia',
  };

  // Demo comments with timestamps
  const comments: Comment[] = [
    {
      id: 1,
      usuario: 'Maria Garcia (Empleado)',
      texto: 'He recibido tu ticket y estoy investigando el problema. Parece estar relacionado con el tamaño del conjunto de datos.',
      fecha: new Date(now.getTime() - 3600000 * 24), // 1 day ago
    },
    {
      id: 2,
      usuario: 'Juan Perez (Cliente)',
      texto: 'Gracias por la respuesta rápida. ¿Hay algún workaround mientras tanto?',
      fecha: new Date(now.getTime() - 3600000 * 20), // 20 hours ago
    },
    {
      id: 3,
      usuario: 'Maria Garcia (Empleado)',
      texto: 'Sí, por ahora puedes generar reportes en rangos de 15 días y combinarlos. Estoy trabajando en una solución permanente.',
      fecha: new Date(now.getTime() - 3600000 * 2), // 2 hours ago
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Breadcrumb */}
        <div className="mb-4">
          <Link
            href="/demo/tickets"
            className="text-primary-600 dark:text-primary-400 hover:underline text-sm"
          >
            ← Volver a lista de tickets
          </Link>
        </div>

        {/* Timezone info */}
        <div className="mb-6 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <h2 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
            Información de Zona Horaria
          </h2>
          <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
            <li><strong>Tu zona horaria:</strong> {timezone || 'Cargando...'}</li>
            <li><strong>Hora actual (local):</strong> {formatLocalDate(currentTime)}</li>
            <li>Todas las fechas se muestran en tu zona horaria local</li>
          </ul>
        </div>

        {/* Ticket header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
          <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
            <div>
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-1">
                <span>Ticket #{ticket.id}</span>
                <span>•</span>
                <span>{ticket.categoria}</span>
              </div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                {ticket.titulo}
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <StatusBadge estado={ticket.estado} />
              <PriorityBadge prioridad={ticket.prioridad} />
            </div>
          </div>

          {/* Timestamps */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Fecha de Creación
              </p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {formatLocalDate(ticket.fechaCreacion)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                ({getRelativeTime(ticket.fechaCreacion)})
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Primera Respuesta
              </p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {ticket.fechaPrimeraRespuesta ? formatLocalDate(ticket.fechaPrimeraRespuesta) : '-'}
              </p>
              {ticket.fechaPrimeraRespuesta && (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  ({getRelativeTime(ticket.fechaPrimeraRespuesta)})
                </p>
              )}
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Última Actualización
              </p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {formatLocalDate(ticket.fechaActualizacion)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                ({getRelativeTime(ticket.fechaActualizacion)})
              </p>
            </div>
          </div>

          {/* Assignee info */}
          <div className="mt-4 flex flex-wrap gap-4 text-sm">
            <div>
              <span className="text-gray-500 dark:text-gray-400">Cliente:</span>{' '}
              <span className="text-gray-900 dark:text-white font-medium">{ticket.cliente}</span>
            </div>
            {ticket.empleadoAsignado && (
              <div>
                <span className="text-gray-500 dark:text-gray-400">Asignado a:</span>{' '}
                <span className="text-gray-900 dark:text-white font-medium">{ticket.empleadoAsignado}</span>
              </div>
            )}
          </div>
        </div>

        {/* Description */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Descripción
          </h2>
          <div className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
            {ticket.descripcion}
          </div>
        </div>

        {/* Comments */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Conversación ({comments.length} comentarios)
          </h2>

          <div className="space-y-4">
            {comments.map((comment) => (
              <div key={comment.id} className="border-b border-gray-200 dark:border-gray-700 pb-4 last:border-0 last:pb-0">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-900 dark:text-white">
                    {comment.usuario}
                  </span>
                  <time
                    dateTime={comment.fecha.toISOString()}
                    className="text-sm text-gray-500 dark:text-gray-400"
                    title={formatLocalDate(comment.fecha)}
                  >
                    {getRelativeTime(comment.fecha)}
                  </time>
                </div>
                <p className="text-gray-700 dark:text-gray-300">
                  {comment.texto}
                </p>
              </div>
            ))}
          </div>

          {/* Comment form placeholder */}
          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <label htmlFor="new-comment" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Agregar comentario
            </label>
            <textarea
              id="new-comment"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Escribe tu comentario..."
            />
            <div className="mt-2 flex justify-end">
              <button
                type="button"
                className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors"
              >
                Enviar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
