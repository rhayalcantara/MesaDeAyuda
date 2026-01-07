'use client';

import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';

// Demo ticket data
const demoTickets: Record<number, {
  id: number;
  titulo: string;
  estado: string;
  prioridad: string;
  categoria: string;
  clienteNombre: string;
  empleadoNombre: string | null;
  descripcion: string;
  fechaCreacion: string;
}> = {
  1: {
    id: 1,
    titulo: 'Error al cargar reportes en el sistema',
    estado: 'EnProceso',
    prioridad: 'Alta',
    categoria: 'Sistema de Ventas',
    clienteNombre: 'Cliente Demo',
    empleadoNombre: 'Empleado Demo',
    descripcion: 'Al intentar generar el reporte de ventas mensual, el sistema muestra un error 500 y no carga los datos.',
    fechaCreacion: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  2: {
    id: 2,
    titulo: 'No puedo acceder al portal web',
    estado: 'Abierto',
    prioridad: 'Media',
    categoria: 'Portal Web',
    clienteNombre: 'Juan Perez',
    empleadoNombre: null,
    descripcion: 'Al intentar iniciar sesion en el portal, aparece un mensaje de error de autenticacion aunque las credenciales son correctas.',
    fechaCreacion: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  3: {
    id: 3,
    titulo: 'Solicitud de nueva funcionalidad',
    estado: 'EnEspera',
    prioridad: 'Baja',
    categoria: 'Aplicacion Movil',
    clienteNombre: 'Maria Garcia',
    empleadoNombre: 'Admin Demo',
    descripcion: 'Necesitamos poder exportar los datos de clientes en formato Excel desde la aplicacion movil.',
    fechaCreacion: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  4: {
    id: 4,
    titulo: 'Problema con facturacion electronica',
    estado: 'Abierto',
    prioridad: 'Alta',
    categoria: 'Facturacion',
    clienteNombre: 'Carlos Rodriguez',
    empleadoNombre: null,
    descripcion: 'Las facturas electronicas no se estan enviando al SAT correctamente. Aparece error de conexion.',
    fechaCreacion: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  5: {
    id: 5,
    titulo: 'Error en sincronizacion de inventario',
    estado: 'EnProceso',
    prioridad: 'Media',
    categoria: 'Inventario',
    clienteNombre: 'Ana Martinez',
    empleadoNombre: 'Empleado Demo',
    descripcion: 'El inventario no se sincroniza correctamente entre sucursales. Hay diferencias en las cantidades.',
    fechaCreacion: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
  },
  6: {
    id: 6,
    titulo: 'Solicitud de capacitacion',
    estado: 'Resuelto',
    prioridad: 'Baja',
    categoria: 'Soporte',
    clienteNombre: 'Luis Fernandez',
    empleadoNombre: 'Admin Demo',
    descripcion: 'Necesitamos capacitacion para el nuevo modulo de reportes para 5 usuarios.',
    fechaCreacion: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  },
  7: {
    id: 7,
    titulo: 'Cambio de contrasena no funciona',
    estado: 'Abierto',
    prioridad: 'Alta',
    categoria: 'Seguridad',
    clienteNombre: 'Rosa Lopez',
    empleadoNombre: null,
    descripcion: 'Al intentar cambiar la contrasena, el sistema indica que se realizo correctamente pero al volver a iniciar sesion no funciona la nueva contrasena.',
    fechaCreacion: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  8: {
    id: 8,
    titulo: 'Reporte de ventas incorrecto',
    estado: 'EnEspera',
    prioridad: 'Media',
    categoria: 'Reportes',
    clienteNombre: 'Pedro Sanchez',
    empleadoNombre: 'Empleado Demo',
    descripcion: 'El reporte de ventas del mes pasado muestra totales incorrectos. Las sumas no coinciden con los registros individuales.',
    fechaCreacion: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
  },
};

export default function DemoTicketDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const ticketId = Number(params.id);
  const returnUrl = searchParams.get('returnUrl') || '/demo/admin-tickets';

  const ticket = demoTickets[ticketId];

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

  if (!ticket) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Ticket no encontrado</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-4">El ticket #{ticketId} no existe.</p>
            <Link href={returnUrl} className="text-blue-600 hover:text-blue-800 dark:text-blue-400">
              ← Volver a la lista
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Back button */}
        <div>
          <Link
            href={decodeURIComponent(returnUrl)}
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Volver a la lista
          </Link>
        </div>

        {/* Info box */}
        <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <h4 className="font-semibold text-green-800 dark:text-green-200">Feature #69: Test de preservacion de filtros</h4>
          <p className="text-green-700 dark:text-green-300 text-sm mt-1">
            Al hacer clic en &quot;Volver a la lista&quot; o usar el boton atras del navegador,
            los filtros que aplicaste en la lista deben mantenerse.
          </p>
        </div>

        {/* Ticket header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Ticket #{ticket.id}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {ticket.titulo}
              </p>
            </div>
            <div className="flex gap-2">
              <span className={`px-3 py-1 text-sm font-medium rounded-full ${getEstadoBadgeClass(ticket.estado)}`}>
                {formatEstado(ticket.estado)}
              </span>
              <span className={`px-3 py-1 text-sm font-medium rounded-full ${getPrioridadBadgeClass(ticket.prioridad)}`}>
                {ticket.prioridad}
              </span>
            </div>
          </div>

          {/* Ticket details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Cliente</h3>
              <p className="mt-1 text-gray-900 dark:text-white">{ticket.clienteNombre}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Asignado a</h3>
              <p className="mt-1 text-gray-900 dark:text-white">{ticket.empleadoNombre || 'Sin asignar'}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Categoria</h3>
              <p className="mt-1 text-gray-900 dark:text-white">{ticket.categoria}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Fecha de creacion</h3>
              <p className="mt-1 text-gray-900 dark:text-white">
                {new Date(ticket.fechaCreacion).toLocaleDateString('es-ES', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          </div>

          {/* Description */}
          <div className="mt-6">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Descripcion</h3>
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="text-gray-900 dark:text-white">{ticket.descripcion}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
