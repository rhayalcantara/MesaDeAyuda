'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { MainLayout } from '@/components/layout';

interface Empresa {
  id: number;
  nombre: string;
  configVisibilidadTickets: string;
  logoUrl: string | null;
  colorPrimario: string | null;
  activa: boolean;
  fechaCreacion: string;
}

// Demo data for testing without backend
const demoEmpresas: Empresa[] = [
  {
    id: 1,
    nombre: 'Empresa Demo SA',
    configVisibilidadTickets: 'propios',
    logoUrl: null,
    colorPrimario: '#2563eb',
    activa: true,
    fechaCreacion: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 2,
    nombre: 'Tecnologias ABC',
    configVisibilidadTickets: 'empresa',
    logoUrl: null,
    colorPrimario: '#16a34a',
    activa: true,
    fechaCreacion: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 3,
    nombre: 'Consultores XYZ',
    configVisibilidadTickets: 'propios',
    logoUrl: null,
    colorPrimario: '#dc2626',
    activa: false,
    fechaCreacion: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export default function AdminEmpresasPage() {
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingEmpresa, setEditingEmpresa] = useState<Empresa | null>(null);
  const [formData, setFormData] = useState({
    nombre: '',
    configVisibilidadTickets: 'propios',
    colorPrimario: '#2563eb',
    activa: true,
  });

  useEffect(() => {
    fetchEmpresas();
  }, []);

  const fetchEmpresas = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/empresas');
      if (response.ok) {
        const data = await response.json();
        setEmpresas(data);
      } else {
        // Fall back to demo data
        console.log('Using demo data (API not available)');
        setEmpresas(demoEmpresas);
      }
    } catch (error) {
      console.log('Using demo data (API not available)');
      setEmpresas(demoEmpresas);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingEmpresa
        ? `http://localhost:5000/api/empresas/${editingEmpresa.id}`
        : 'http://localhost:5000/api/empresas';
      const method = editingEmpresa ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        fetchEmpresas();
        setShowModal(false);
        resetForm();
      }
    } catch (error) {
      console.error('Error saving empresa:', error);
    }
  };

  const handleEdit = (empresa: Empresa) => {
    setEditingEmpresa(empresa);
    setFormData({
      nombre: empresa.nombre,
      configVisibilidadTickets: empresa.configVisibilidadTickets,
      colorPrimario: empresa.colorPrimario || '#2563eb',
      activa: empresa.activa,
    });
    setShowModal(true);
  };

  const handleToggleActive = async (empresa: Empresa) => {
    try {
      const response = await fetch(`http://localhost:5000/api/empresas/${empresa.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...empresa,
          activa: !empresa.activa,
        }),
      });

      if (response.ok) {
        fetchEmpresas();
      }
    } catch (error) {
      console.error('Error toggling empresa:', error);
    }
  };

  const resetForm = () => {
    setEditingEmpresa(null);
    setFormData({
      nombre: '',
      configVisibilidadTickets: 'propios',
      colorPrimario: '#2563eb',
      activa: true,
    });
  };

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
          <span className="text-gray-900 dark:text-white font-medium">Empresas</span>
        </nav>

        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Gestion de Empresas
          </h1>
          <button
            className="btn-primary"
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
          >
            Nueva Empresa
          </button>
        </div>

        {/* Empresas Table */}
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
                    Visibilidad
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Color
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Fecha Creacion
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
                ) : empresas.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                      No hay empresas registradas
                    </td>
                  </tr>
                ) : (
                  empresas.map((empresa) => (
                    <tr key={empresa.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {empresa.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <Link
                          href={`/admin/empresas/${empresa.id}`}
                          className="text-primary-600 dark:text-primary-400 hover:underline font-medium"
                        >
                          {empresa.nombre}
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {empresa.configVisibilidadTickets === 'propios' ? 'Solo propios' : 'Toda la empresa'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div
                          className="w-6 h-6 rounded border border-gray-300"
                          style={{ backgroundColor: empresa.colorPrimario || '#2563eb' }}
                          title={empresa.colorPrimario || '#2563eb'}
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            empresa.activa
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                          }`}
                        >
                          {empresa.activa ? 'Activa' : 'Inactiva'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {new Date(empresa.fechaCreacion).toLocaleDateString('es-ES')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                        <button
                          onClick={() => handleEdit(empresa)}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleToggleActive(empresa)}
                          className={empresa.activa ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'}
                        >
                          {empresa.activa ? 'Desactivar' : 'Activar'}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              {editingEmpresa ? 'Editar Empresa' : 'Nueva Empresa'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Nombre
                </label>
                <input
                  type="text"
                  className="input w-full"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Visibilidad de Tickets
                </label>
                <select
                  className="input w-full"
                  value={formData.configVisibilidadTickets}
                  onChange={(e) => setFormData({ ...formData, configVisibilidadTickets: e.target.value })}
                >
                  <option value="propios">Solo tickets propios</option>
                  <option value="empresa">Todos los tickets de la empresa</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Color Primario
                </label>
                <input
                  type="color"
                  className="w-full h-10 rounded cursor-pointer"
                  value={formData.colorPrimario}
                  onChange={(e) => setFormData({ ...formData, colorPrimario: e.target.value })}
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="activa"
                  className="h-4 w-4 text-blue-600 rounded"
                  checked={formData.activa}
                  onChange={(e) => setFormData({ ...formData, activa: e.target.checked })}
                />
                <label htmlFor="activa" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  Empresa activa
                </label>
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                >
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  {editingEmpresa ? 'Guardar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </MainLayout>
  );
}
