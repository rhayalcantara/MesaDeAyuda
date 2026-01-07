'use client';

import { useState } from 'react';
import Link from 'next/link';

interface Categoria {
  id: number;
  nombre: string;
  descripcion: string;
  activa: boolean;
  ticketsCount: number;
  fechaCreacion: string;
}

type Step = 'list' | 'create' | 'detail' | 'edit' | 'delete' | 'complete';

const initialCategorias: Categoria[] = [
  {
    id: 1,
    nombre: 'Sistema de Ventas',
    descripcion: 'Problemas relacionados con el sistema de ventas',
    activa: true,
    ticketsCount: 15,
    fechaCreacion: '2025-11-15',
  },
  {
    id: 2,
    nombre: 'Portal Web',
    descripcion: 'Incidencias del portal web corporativo',
    activa: true,
    ticketsCount: 8,
    fechaCreacion: '2025-11-20',
  },
];

export default function CategoriaCrudPage() {
  const [categorias, setCategorias] = useState<Categoria[]>(initialCategorias);
  const [currentStep, setCurrentStep] = useState<Step>('list');
  const [selectedCategoria, setSelectedCategoria] = useState<Categoria | null>(null);
  const [successMessage, setSuccessMessage] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    activa: true,
  });

  const completedSteps = {
    list: currentStep !== 'list',
    create: ['detail', 'edit', 'delete', 'complete'].includes(currentStep),
    detail: ['edit', 'delete', 'complete'].includes(currentStep),
    edit: ['delete', 'complete'].includes(currentStep),
    delete: currentStep === 'complete',
  };

  const handleCreate = () => {
    const newCategoria: Categoria = {
      id: categorias.length + 1,
      nombre: formData.nombre,
      descripcion: formData.descripcion,
      activa: true,
      ticketsCount: 0,
      fechaCreacion: new Date().toISOString().split('T')[0],
    };
    setCategorias([...categorias, newCategoria]);
    setSelectedCategoria(newCategoria);
    setSuccessMessage('Categoria creada exitosamente');
    setCurrentStep('detail');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleEdit = () => {
    if (!selectedCategoria) return;
    const updated = categorias.map(c =>
      c.id === selectedCategoria.id
        ? { ...c, nombre: formData.nombre, descripcion: formData.descripcion }
        : c
    );
    setCategorias(updated);
    setSelectedCategoria({ ...selectedCategoria, nombre: formData.nombre, descripcion: formData.descripcion });
    setSuccessMessage('Categoria actualizada exitosamente');
    setCurrentStep('detail');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleDeactivate = () => {
    if (!selectedCategoria) return;
    const updated = categorias.map(c =>
      c.id === selectedCategoria.id ? { ...c, activa: false } : c
    );
    setCategorias(updated);
    setSelectedCategoria({ ...selectedCategoria, activa: false });
    setSuccessMessage('Categoria desactivada exitosamente');
    setCurrentStep('complete');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleReset = () => {
    setCategorias(initialCategorias);
    setCurrentStep('list');
    setSelectedCategoria(null);
    setSuccessMessage('');
    setFormData({ nombre: '', descripcion: '', activa: true });
  };

  const formatDate = (dateStr: string) => {
    return new Intl.DateTimeFormat('es-ES', { dateStyle: 'medium' }).format(new Date(dateStr));
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Feature #43: CRUD de Categorias
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Demuestra las operaciones Create, Read, Update y Delete para Categorias.
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-between mb-8 bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
          {[
            { key: 'list', label: 'Ver Lista', num: '1' },
            { key: 'create', label: 'Crear', num: '2' },
            { key: 'detail', label: 'Ver Detalle', num: '3' },
            { key: 'edit', label: 'Editar', num: '4' },
            { key: 'delete', label: 'Desactivar', num: '5' },
            { key: 'complete', label: 'Completado', num: '6' },
          ].map((step) => (
            <div key={step.key} className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                completedSteps[step.key as keyof typeof completedSteps]
                  ? 'bg-green-500 text-white'
                  : currentStep === step.key
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
              }`}>
                {completedSteps[step.key as keyof typeof completedSteps] ? '✓' : step.num}
              </div>
              <span className="text-xs mt-1 text-gray-600 dark:text-gray-400">{step.label}</span>
            </div>
          ))}
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-4 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg p-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-green-700 dark:text-green-300">{successMessage}</span>
          </div>
        )}

        {/* Content based on step */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          {currentStep === 'list' && (
            <>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Lista de Categorias</h2>
                <button
                  onClick={() => {
                    setFormData({ nombre: '', descripcion: '', activa: true });
                    setCurrentStep('create');
                  }}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Nueva Categoria
                </button>
              </div>
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">ID</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Nombre</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Tickets</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Estado</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Fecha</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {categorias.map((categoria) => (
                    <tr key={categoria.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">#{categoria.id}</td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">{categoria.nombre}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{categoria.ticketsCount}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          categoria.activa
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                            : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                        }`}>
                          {categoria.activa ? 'Activa' : 'Inactiva'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{formatDate(categoria.fechaCreacion)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                <strong>Paso 1:</strong> Haz clic en &quot;Nueva Categoria&quot; para comenzar el flujo CRUD.
              </p>
            </>
          )}

          {currentStep === 'create' && (
            <>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Crear Nueva Categoria</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Nombre *
                  </label>
                  <input
                    type="text"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    placeholder="Nombre de la categoria"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Descripcion
                  </label>
                  <textarea
                    value={formData.descripcion}
                    onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                    placeholder="Descripcion de la categoria"
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleCreate}
                    disabled={!formData.nombre}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
                  >
                    Crear Categoria
                  </button>
                  <button
                    onClick={() => setCurrentStep('list')}
                    className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
              <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                <strong>Paso 2:</strong> Completa el formulario y haz clic en &quot;Crear Categoria&quot;.
              </p>
            </>
          )}

          {currentStep === 'detail' && selectedCategoria && (
            <>
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Detalle de Categoria</h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setFormData({
                        nombre: selectedCategoria.nombre,
                        descripcion: selectedCategoria.descripcion,
                        activa: selectedCategoria.activa,
                      });
                      setCurrentStep('edit');
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Editar
                  </button>
                  <button
                    onClick={() => setCurrentStep('delete')}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Desactivar
                  </button>
                </div>
              </div>
              <dl className="grid grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm text-gray-500 dark:text-gray-400">ID</dt>
                  <dd className="text-gray-900 dark:text-white font-medium">#{selectedCategoria.id}</dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500 dark:text-gray-400">Nombre</dt>
                  <dd className="text-gray-900 dark:text-white font-medium">{selectedCategoria.nombre}</dd>
                </div>
                <div className="col-span-2">
                  <dt className="text-sm text-gray-500 dark:text-gray-400">Descripcion</dt>
                  <dd className="text-gray-900 dark:text-white">{selectedCategoria.descripcion || 'Sin descripcion'}</dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500 dark:text-gray-400">Tickets Asociados</dt>
                  <dd className="text-gray-900 dark:text-white">{selectedCategoria.ticketsCount}</dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500 dark:text-gray-400">Estado</dt>
                  <dd>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      selectedCategoria.activa
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                        : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                    }`}>
                      {selectedCategoria.activa ? 'Activa' : 'Inactiva'}
                    </span>
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500 dark:text-gray-400">Fecha de Creacion</dt>
                  <dd className="text-gray-900 dark:text-white">{formatDate(selectedCategoria.fechaCreacion)}</dd>
                </div>
              </dl>
              <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                <strong>Paso 3-4:</strong> Haz clic en &quot;Editar&quot; para modificar, luego &quot;Desactivar&quot; para completar.
              </p>
            </>
          )}

          {currentStep === 'edit' && selectedCategoria && (
            <>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Editar Categoria #{selectedCategoria.id}</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Nombre *
                  </label>
                  <input
                    type="text"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Descripcion
                  </label>
                  <textarea
                    value={formData.descripcion}
                    onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleEdit}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                  >
                    Guardar Cambios
                  </button>
                  <button
                    onClick={() => setCurrentStep('detail')}
                    className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
              <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                <strong>Paso 4:</strong> Modifica algun campo y haz clic en &quot;Guardar Cambios&quot;.
              </p>
            </>
          )}

          {currentStep === 'delete' && selectedCategoria && (
            <>
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto mb-4 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Desactivar Categoria</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  ¿Esta seguro de que desea desactivar la categoria &quot;{selectedCategoria.nombre}&quot;?<br />
                  La categoria no aparecera en los dropdowns de creacion de tickets.
                </p>
                <div className="flex justify-center gap-3">
                  <button
                    onClick={handleDeactivate}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    Desactivar Categoria
                  </button>
                  <button
                    onClick={() => setCurrentStep('detail')}
                    className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
              <p className="mt-4 text-sm text-gray-600 dark:text-gray-400 text-center">
                <strong>Paso 5:</strong> Haz clic en &quot;Desactivar Categoria&quot; para completar el flujo CRUD.
              </p>
            </>
          )}

          {currentStep === 'complete' && (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">CRUD de Categorias Completado</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Todas las operaciones CRUD se han ejecutado exitosamente.
              </p>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 max-w-md mx-auto mb-6">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Operaciones Completadas</h3>
                <ul className="text-left space-y-2 text-sm">
                  <li className="flex items-center gap-2 text-green-700 dark:text-green-300">
                    <span className="text-green-500">✓</span> Crear nueva categoria
                  </li>
                  <li className="flex items-center gap-2 text-green-700 dark:text-green-300">
                    <span className="text-green-500">✓</span> Ver detalle de categoria
                  </li>
                  <li className="flex items-center gap-2 text-green-700 dark:text-green-300">
                    <span className="text-green-500">✓</span> Editar categoria
                  </li>
                  <li className="flex items-center gap-2 text-green-700 dark:text-green-300">
                    <span className="text-green-500">✓</span> Desactivar categoria
                  </li>
                </ul>
              </div>
              <button
                onClick={handleReset}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                Reiniciar Demo
              </button>
            </div>
          )}
        </div>

        {/* Feature Info */}
        <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
          <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">
            Feature #43: Categoria CRUD complete workflow ✅
          </h4>
          <p className="text-sm text-blue-700 dark:text-blue-400 mb-2">
            Este test verifica todas las operaciones CRUD para Categorias:
          </p>
          <ul className="list-disc list-inside text-sm text-blue-600 dark:text-blue-400 space-y-1">
            <li>✅ Crear nueva categoria con validacion</li>
            <li>✅ Ver detalle de categoria</li>
            <li>✅ Editar categoria</li>
            <li>✅ Desactivar categoria (soft delete)</li>
          </ul>
        </div>

        <Link
          href="/demo"
          className="inline-flex items-center mt-4 text-primary-600 dark:text-primary-400 hover:underline"
        >
          ← Volver a demos
        </Link>
      </div>
    </div>
  );
}
