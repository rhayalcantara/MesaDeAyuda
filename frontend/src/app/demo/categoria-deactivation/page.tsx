'use client';

import { useState } from 'react';
import Link from 'next/link';

// Demo page for Feature #90: Deactivate categoria updates ticket forms
// Shows that deactivated categories don't appear in ticket form dropdowns

interface Categoria {
  id: number;
  nombre: string;
  descripcion: string | null;
  activa: boolean;
  fechaCreacion: string;
}

const initialCategorias: Categoria[] = [
  {
    id: 1,
    nombre: 'Sistema de Facturacion',
    descripcion: 'Problemas con el modulo de facturacion',
    activa: true,
    fechaCreacion: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 2,
    nombre: 'Portal Web',
    descripcion: 'Incidencias del portal web publico',
    activa: true,
    fechaCreacion: new Date(Date.now() - 80 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 3,
    nombre: 'Aplicacion Movil',
    descripcion: 'Soporte para la app movil',
    activa: true,
    fechaCreacion: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export default function CategoriaDeactivationDemo() {
  const [categorias, setCategorias] = useState<Categoria[]>(initialCategorias);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');
  const [createError, setCreateError] = useState('');

  // Ticket form state
  const [selectedCategoria, setSelectedCategoria] = useState('');

  // Get only active categories for dropdown
  const activeCategorias = categorias.filter(c => c.activa);

  // Create new category
  const handleCreateCategory = () => {
    if (!newCatName.trim()) {
      setCreateError('El nombre es requerido');
      return;
    }

    const newCat: Categoria = {
      id: Math.max(...categorias.map(c => c.id)) + 1,
      nombre: newCatName.trim(),
      descripcion: newCatDesc.trim() || null,
      activa: true,
      fechaCreacion: new Date().toISOString(),
    };

    setCategorias([...categorias, newCat]);
    setNewCatName('');
    setNewCatDesc('');
    setCreateError('');
    setShowCreateModal(false);
  };

  // Toggle category active status
  const handleToggleActive = (id: number) => {
    setCategorias(prev => prev.map(cat => {
      if (cat.id === id) {
        return { ...cat, activa: !cat.activa };
      }
      return cat;
    }));

    // If the deactivated category was selected, clear selection
    const cat = categorias.find(c => c.id === id);
    if (cat && cat.activa && selectedCategoria === id.toString()) {
      setSelectedCategoria('');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <Link
              href="/demo"
              className="text-sm text-primary-600 dark:text-primary-400 hover:underline mb-2 inline-block"
            >
              ← Volver a Demo
            </Link>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Feature #90: Desactivar Categoria
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Verificar que las categorias desactivadas no aparecen en los dropdowns de tickets
            </p>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <h2 className="text-sm font-semibold text-blue-800 dark:text-blue-200 mb-2">
            Pasos para verificar:
          </h2>
          <ol className="list-decimal list-inside text-sm text-blue-700 dark:text-blue-300 space-y-1">
            <li>Crea una nueva categoria usando el boton &quot;Nueva Categoria&quot; (ej: &quot;DEACTIVATE_CAT_TEST&quot;)</li>
            <li>Verifica que aparece en el dropdown &quot;Categoria para Ticket&quot; a la derecha</li>
            <li>Haz clic en &quot;Desactivar&quot; para cambiar su estado</li>
            <li>Verifica que la categoria ya NO aparece en el dropdown</li>
            <li>Puedes &quot;Activar&quot; la categoria nuevamente y verificar que vuelve al dropdown</li>
          </ol>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Category Management Panel */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Gestion de Categorias (Admin)
              </h2>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors"
              >
                Nueva Categoria
              </button>
            </div>

            <div className="p-4">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      Nombre
                    </th>
                    <th className="text-left py-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      Estado
                    </th>
                    <th className="text-left py-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {categorias.map(cat => (
                    <tr key={cat.id}>
                      <td className="py-3 text-sm text-gray-900 dark:text-white">
                        {cat.nombre}
                      </td>
                      <td className="py-3">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            cat.activa
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                          }`}
                        >
                          {cat.activa ? 'Activa' : 'Inactiva'}
                        </span>
                      </td>
                      <td className="py-3">
                        <button
                          onClick={() => handleToggleActive(cat.id)}
                          className={`text-sm font-medium ${
                            cat.activa
                              ? 'text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300'
                              : 'text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300'
                          }`}
                        >
                          {cat.activa ? 'Desactivar' : 'Activar'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {categorias.length === 0 && (
                <p className="text-center py-8 text-gray-500 dark:text-gray-400">
                  No hay categorias. Crea una nueva.
                </p>
              )}
            </div>
          </div>

          {/* Ticket Form Panel */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Formulario de Ticket (Cliente)
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Solo muestra categorias ACTIVAS
              </p>
            </div>

            <div className="p-4 space-y-4">
              <div>
                <label htmlFor="ticket-cat" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Categoria para Ticket <span className="text-red-500">*</span>
                </label>
                <select
                  id="ticket-cat"
                  value={selectedCategoria}
                  onChange={(e) => setSelectedCategoria(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">Seleccione una categoria</option>
                  {activeCategorias.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.nombre}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  {activeCategorias.length} categoria(s) disponible(s) de {categorias.length} total
                </p>
              </div>

              {/* Visual indicator of what's in dropdown */}
              <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Categorias en el dropdown:
                </p>
                {activeCategorias.length > 0 ? (
                  <ul className="space-y-1">
                    {activeCategorias.map(cat => (
                      <li key={cat.id} className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                        {cat.nombre}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                    No hay categorias activas
                  </p>
                )}
              </div>

              {/* Categories NOT in dropdown */}
              {categorias.filter(c => !c.activa).length > 0 && (
                <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <p className="text-sm font-medium text-red-700 dark:text-red-300 mb-2">
                    Categorias DESACTIVADAS (no aparecen en dropdown):
                  </p>
                  <ul className="space-y-1">
                    {categorias.filter(c => !c.activa).map(cat => (
                      <li key={cat.id} className="text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
                        <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                        {cat.nombre}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Test Results */}
        <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-green-800 dark:text-green-200 mb-2">
            Estado de la verificacion:
          </h3>
          <ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
            <li className="flex items-center gap-2">
              <span className={categorias.length > initialCategorias.length ? 'text-green-600' : 'text-gray-400'}>
                {categorias.length > initialCategorias.length ? '✓' : '○'}
              </span>
              Paso 2: Crear nueva categoria
            </li>
            <li className="flex items-center gap-2">
              <span className={categorias.some(c => !c.activa) ? 'text-green-600' : 'text-gray-400'}>
                {categorias.some(c => !c.activa) ? '✓' : '○'}
              </span>
              Paso 4: Desactivar una categoria
            </li>
            <li className="flex items-center gap-2">
              <span className={!activeCategorias.some(c => !initialCategorias.some(ic => ic.id === c.id)) && categorias.some(c => !c.activa) ? 'text-green-600' : 'text-gray-400'}>
                {categorias.some(c => !c.activa) && !activeCategorias.some(c => categorias.find(cat => cat.id === c.id && !cat.activa)) ? '✓' : '○'}
              </span>
              Paso 5: Categoria desactivada no aparece en dropdown
            </li>
          </ul>
        </div>
      </div>

      {/* Create Category Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Nueva Categoria
            </h3>

            <div className="space-y-4">
              <div>
                <label htmlFor="cat-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Nombre <span className="text-red-500">*</span>
                </label>
                <input
                  id="cat-name"
                  type="text"
                  value={newCatName}
                  onChange={(e) => {
                    setNewCatName(e.target.value);
                    setCreateError('');
                  }}
                  placeholder="Ej: DEACTIVATE_CAT_TEST"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                />
                {createError && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{createError}</p>
                )}
              </div>

              <div>
                <label htmlFor="cat-desc" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Descripcion (opcional)
                </label>
                <textarea
                  id="cat-desc"
                  value={newCatDesc}
                  onChange={(e) => setNewCatDesc(e.target.value)}
                  placeholder="Descripcion de la categoria"
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setNewCatName('');
                  setNewCatDesc('');
                  setCreateError('');
                }}
                className="flex-1 py-2 px-4 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateCategory}
                className="flex-1 py-2 px-4 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
              >
                Crear
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
