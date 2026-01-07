'use client';

import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout';

interface SolicitudRegistro {
  id: number;
  email: string;
  nombre: string;
  empresaId: number;
  empresaNombre: string;
  estado: string;
  fechaSolicitud: string;
  fechaResolucion: string | null;
  aprobadoPorNombre: string | null;
}

export default function EmpleadoSolicitudesPage() {
  const [solicitudes, setSolicitudes] = useState<SolicitudRegistro[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState('Pendiente');

  useEffect(() => {
    fetchSolicitudes();
  }, [filtroEstado]);

  const fetchSolicitudes = async () => {
    try {
      const params = new URLSearchParams();
      if (filtroEstado) params.append('estado', filtroEstado);

      const response = await fetch(`http://localhost:5000/api/solicitudes-registro?${params}`);
      if (response.ok) {
        const data = await response.json();
        setSolicitudes(data);
      }
    } catch (error) {
      console.error('Error fetching solicitudes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAprobar = async (id: number) => {
    try {
      const response = await fetch(`http://localhost:5000/api/solicitudes-registro/${id}/aprobar`, {
        method: 'PUT',
      });

      if (response.ok) {
        fetchSolicitudes();
        alert('Solicitud aprobada. Se ha enviado un correo con las credenciales temporales.');
      }
    } catch (error) {
      console.error('Error aprobando solicitud:', error);
    }
  };

  const handleRechazar = async (id: number) => {
    if (!confirm('Esta seguro de rechazar esta solicitud?')) return;

    try {
      const response = await fetch(`http://localhost:5000/api/solicitudes-registro/${id}/rechazar`, {
        method: 'PUT',
      });

      if (response.ok) {
        fetchSolicitudes();
      }
    } catch (error) {
      console.error('Error rechazando solicitud:', error);
    }
  };

  const getEstadoBadgeClass = (estado: string) => {
    const classes: Record<string, string> = {
      'Pendiente': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      'Aprobada': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      'Rechazada': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    };
    return classes[estado] || 'bg-gray-100 text-gray-800';
  };

  return (
    <MainLayout requiredRoles={['Admin', 'Empleado']}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Solicitudes de Registro
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Revisa y aprueba las solicitudes de nuevos clientes
            </p>
          </div>
        </div>

        {/* Filter */}
        <div className="card p-4">
          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Filtrar por estado:
            </label>
            <select
              className="input w-48"
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
            >
              <option value="">Todos</option>
              <option value="Pendiente">Pendiente</option>
              <option value="Aprobada">Aprobada</option>
              <option value="Rechazada">Rechazada</option>
            </select>
          </div>
        </div>

        {/* Solicitudes Table */}
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Nombre
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Empresa
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Fecha Solicitud
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
                ) : solicitudes.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                      <div className="flex flex-col items-center py-8">
                        <svg className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p className="mt-2">No hay solicitudes {filtroEstado ? `con estado "${filtroEstado}"` : ''}</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  solicitudes.map((solicitud) => (
                    <tr key={solicitud.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {solicitud.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white font-medium">
                        {solicitud.nombre}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {solicitud.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {solicitud.empresaNombre}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getEstadoBadgeClass(solicitud.estado)}`}>
                          {solicitud.estado}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {new Date(solicitud.fechaSolicitud).toLocaleDateString('es-ES')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                        {solicitud.estado === 'Pendiente' ? (
                          <>
                            <button
                              onClick={() => handleAprobar(solicitud.id)}
                              className="text-green-600 hover:text-green-900 dark:text-green-400 font-medium"
                            >
                              Aprobar
                            </button>
                            <button
                              onClick={() => handleRechazar(solicitud.id)}
                              className="text-red-600 hover:text-red-900 dark:text-red-400"
                            >
                              Rechazar
                            </button>
                          </>
                        ) : (
                          <span className="text-gray-400 dark:text-gray-500">
                            {solicitud.estado === 'Aprobada'
                              ? `Aprobada por ${solicitud.aprobadoPorNombre || 'Sistema'}`
                              : 'Rechazada'}
                          </span>
                        )}
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
