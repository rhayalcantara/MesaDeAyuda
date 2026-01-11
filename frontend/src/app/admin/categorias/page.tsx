'use client';

import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout';
import api from '@/lib/api';

interface Categoria {
  id: number;
  nombre: string;
  descripcion: string | null;
  activa: boolean;
  fechaCreacion: string;
}

export default function AdminCategoriasPage() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategoria, setEditingCategoria] = useState<Categoria | null>(null);
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    activa: true,
  });

  useEffect(() => {
    fetchCategorias();
  }, []);

  const fetchCategorias = async () => {
    try {
      const response = await api.get('/categorias');
      setCategorias(response.data);
    } catch (error) {
      console.error('Error fetching categorias:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCategoria) {
        await api.put(`/categorias/${editingCategoria.id}`, formData);
      } else {
        await api.post('/categorias', formData);
      }
      fetchCategorias();
      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error('Error saving categoria:', error);
    }
  };

  const handleEdit = (categoria: Categoria) => {
    setEditingCategoria(categoria);
    setFormData({
      nombre: categoria.nombre,
      descripcion: categoria.descripcion || '',
      activa: categoria.activa,
    });
    setShowModal(true);
  };

  const handleToggleActive = async (categoria: Categoria) => {
    try {
      await api.put(`/categorias/${categoria.id}`, {
        ...categoria,
        activa: !categoria.activa,
      });
      fetchCategorias();
    } catch (error) {
      console.error('Error toggling categoria:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Esta seguro de eliminar esta categoria?')) return;

    try {
      await api.delete(`/categorias/${id}`);
      fetchCategorias();
    } catch (error) {
      console.error('Error deleting categoria:', error);
    }
  };

  const resetForm = () => {
    setEditingCategoria(null);
    setFormData({
      nombre: '',
      descripcion: '',
      activa: true,
    });
  };

  return (
    <MainLayout requiredRoles={['Admin']}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Gestion de Categorias
          </h1>
          <button
            className="btn-primary"
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
          >
            Nueva Categoria
          </button>
        </div>

        {/* Info */}
        <div className="card p-4 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <p className="text-sm text-blue-800 dark:text-blue-300">
            Las categorias representan los sistemas o areas sobre los cuales los clientes pueden reportar problemas.
          </p>
        </div>

        {/* Categorias Table */}
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
                    Descripcion
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
                    <td colSpan={6} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                      Cargando...
                    </td>
                  </tr>
                ) : categorias.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                      No hay categorias registradas
                    </td>
                  </tr>
                ) : (
                  categorias.map((categoria) => (
                    <tr key={categoria.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {categoria.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white font-medium">
                        {categoria.nombre}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 max-w-xs truncate" title={categoria.descripcion || ''}>
                        {categoria.descripcion || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            categoria.activa
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                          }`}
                        >
                          {categoria.activa ? 'Activa' : 'Inactiva'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {new Date(categoria.fechaCreacion).toLocaleDateString('es-ES')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                        <button
                          onClick={() => handleEdit(categoria)}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleToggleActive(categoria)}
                          className={categoria.activa ? 'text-orange-600 hover:text-orange-900' : 'text-green-600 hover:text-green-900'}
                        >
                          {categoria.activa ? 'Desactivar' : 'Activar'}
                        </button>
                        <button
                          onClick={() => handleDelete(categoria.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Eliminar
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
              {editingCategoria ? 'Editar Categoria' : 'Nueva Categoria'}
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
                  placeholder="Ej: Sistema de Facturacion"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Descripcion
                </label>
                <textarea
                  className="input w-full"
                  rows={3}
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  placeholder="Descripcion opcional de la categoria"
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
                  Categoria activa
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
                  {editingCategoria ? 'Guardar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </MainLayout>
  );
}
