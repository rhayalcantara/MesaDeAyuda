'use client';

import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import api from '@/lib/api';

interface Ticket {
  id: number;
  titulo: string;
  estado: string;
  prioridad: string;
  categoria: string;
  clienteNombre: string;
  fechaCreacion: string;
}

export default function EmpleadoMisTicketsPage() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState('');

  useEffect(() => {
    if (user) {
      fetchMisTickets();
    }
  }, [user, filtroEstado]);

  const fetchMisTickets = async () => {
    try {
      const params = new URLSearchParams();
      if (filtroEstado) params.append('estado', filtroEstado);

      const response = await api.get(`/tickets/mis-tickets?${params}`);
      setTickets(response.data.items || response.data);
    } catch (error) {
      console.error('Error fetching mis tickets:', error);
    } finally {
      setLoading(false);
    }
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
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Mis Tickets
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Tickets asignados a ti
            </p>
          </div>
        </div>

        {/* Filter */}
        <div className="card p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Filtrar por estado
              </label>
              <select
                className="input w-48"
                value={filtroEstado}
                onChange={(e) => setFiltroEstado(e.target.value)}
              >
                <option value="">Todos</option>
                <option value="EnProceso">En Proceso</option>
                <option value="EnEspera">En Espera</option>
                <option value="Resuelto">Resuelto</option>
              </select>
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
                    <td colSpan={7} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                      Cargando...
                    </td>
                  </tr>
                ) : tickets.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                      <div className="flex flex-col items-center py-8">
                        <svg className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        <p className="mt-2">No tienes tickets asignados</p>
                        <Link href="/empleado/sin-asignar" className="mt-4 text-blue-600 hover:text-blue-800 dark:text-blue-400">
                          Ver tickets sin asignar
                        </Link>
                      </div>
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
