'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { MainLayout } from '@/components/layout';
import api from '@/lib/api';
import toast from 'react-hot-toast';

interface Empresa {
  id: number;
  nombre: string;
  configVisibilidadTickets: string;
  logoUrl: string | null;
  colorPrimario: string | null;
  activa: boolean;
  fechaCreacion: string;
  fechaActualizacion?: string;
}

interface Cliente {
  id: number;
  nombre: string;
  email: string;
  activo: boolean;
  fechaCreacion: string;
}

export default function AdminEmpresaDetailPage() {
  const params = useParams();
  const router = useRouter();
  const empresaId = parseInt(params.id as string);

  const [empresa, setEmpresa] = useState<Empresa | null>(null);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEmpresa();
  }, [empresaId]);

  const fetchEmpresa = async () => {
    try {
      const [empresaRes, clientesRes] = await Promise.all([
        api.get<Empresa>(`/empresas/${empresaId}`),
        api.get<Cliente[]>(`/empresas/${empresaId}/clientes`),
      ]);

      setEmpresa(empresaRes.data);
      setClientes(clientesRes.data);
    } catch (error: any) {
      console.error('Error fetching empresa:', error);
      if (error.response?.status === 404) {
        setEmpresa(null);
      } else {
        toast.error('Error al cargar empresa');
      }
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('es-ES', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(dateString));
  };

  if (loading) {
    return (
      <MainLayout requiredRoles={['Admin']}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </MainLayout>
    );
  }

  if (!empresa) {
    return (
      <MainLayout requiredRoles={['Admin']}>
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Empresa no encontrada
          </h2>
          <Link href="/admin/empresas" className="btn-primary mt-4 inline-block">
            Volver a empresas
          </Link>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout requiredRoles={['Admin']}>
      <div className="space-y-6">
        {/* Breadcrumbs */}
        <nav className="flex items-center text-sm text-gray-500 dark:text-gray-400" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-primary-600 dark:hover:text-primary-400">
            Inicio
          </Link>
          <svg className="mx-2 h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
          <Link href="/admin/empresas" className="hover:text-primary-600 dark:hover:text-primary-400">
            Empresas
          </Link>
          <svg className="mx-2 h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
          <span className="text-gray-900 dark:text-white font-medium">{empresa.nombre}</span>
        </nav>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div
              className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-xl"
              style={{ backgroundColor: empresa.colorPrimario || '#2563eb' }}
            >
              {empresa.nombre.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {empresa.nombre}
              </h1>
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                  empresa.activa
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                }`}
              >
                {empresa.activa ? 'Activa' : 'Inactiva'}
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <Link
              href={`/admin/empresas/${empresa.id}/editar`}
              className="btn-secondary flex items-center gap-2"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
              </svg>
              Editar
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Empresa Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Details Card */}
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Informacion de la Empresa
              </h2>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm text-gray-500 dark:text-gray-400">ID</dt>
                  <dd className="mt-1 text-gray-900 dark:text-white font-medium">
                    {empresa.id}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500 dark:text-gray-400">Visibilidad de Tickets</dt>
                  <dd className="mt-1 text-gray-900 dark:text-white">
                    {empresa.configVisibilidadTickets === 'propios' ? 'Solo tickets propios' : 'Todos los tickets de la empresa'}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500 dark:text-gray-400">Color Primario</dt>
                  <dd className="mt-1 flex items-center gap-2">
                    <div
                      className="w-6 h-6 rounded border border-gray-300"
                      style={{ backgroundColor: empresa.colorPrimario || '#2563eb' }}
                    />
                    <span className="text-gray-900 dark:text-white">
                      {empresa.colorPrimario || '#2563eb'}
                    </span>
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500 dark:text-gray-400">Fecha de Creacion</dt>
                  <dd className="mt-1 text-gray-900 dark:text-white">
                    {formatDate(empresa.fechaCreacion)}
                  </dd>
                </div>
                {empresa.fechaActualizacion && (
                  <div>
                    <dt className="text-sm text-gray-500 dark:text-gray-400">Ultima Actualizacion</dt>
                    <dd className="mt-1 text-gray-900 dark:text-white">
                      {formatDate(empresa.fechaActualizacion)}
                    </dd>
                  </div>
                )}
              </dl>
            </div>

            {/* Clients Card */}
            <div className="card">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Clientes ({clientes.length})
                  </h2>
                </div>
              </div>
              {clientes.length === 0 ? (
                <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                  No hay clientes registrados para esta empresa.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Nombre
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Estado
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Fecha Registro
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                      {clientes.map((cliente) => (
                        <tr key={cliente.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {cliente.nombre}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {cliente.email}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 py-1 text-xs font-medium rounded-full ${
                                cliente.activo
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                                  : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                              }`}
                            >
                              {cliente.activo ? 'Activo' : 'Inactivo'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {new Date(cliente.fechaCreacion).toLocaleDateString('es-ES')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Stats Sidebar */}
          <div className="space-y-6">
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Estadisticas
              </h2>
              <dl className="space-y-4">
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-500 dark:text-gray-400">Total Clientes</dt>
                  <dd className="text-sm font-medium text-gray-900 dark:text-white">
                    {clientes.length}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-500 dark:text-gray-400">Clientes Activos</dt>
                  <dd className="text-sm font-medium text-green-600 dark:text-green-400">
                    {clientes.filter(c => c.activo).length}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-500 dark:text-gray-400">Clientes Inactivos</dt>
                  <dd className="text-sm font-medium text-red-600 dark:text-red-400">
                    {clientes.filter(c => !c.activo).length}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
