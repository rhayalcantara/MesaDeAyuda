'use client';

import { useState } from 'react';
import Link from 'next/link';

interface Empresa {
  id: number;
  nombre: string;
  configVisibilidadTickets: 'propios' | 'empresa';
  colorPrimario: string;
  activa: boolean;
  fechaCreacion: Date;
}

// Demo empresas data
const initialEmpresas: Empresa[] = [
  {
    id: 1,
    nombre: 'Empresa Demo S.A.',
    configVisibilidadTickets: 'empresa',
    colorPrimario: '#2563eb',
    activa: true,
    fechaCreacion: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
  },
  {
    id: 2,
    nombre: 'Tech Solutions LLC',
    configVisibilidadTickets: 'propios',
    colorPrimario: '#059669',
    activa: true,
    fechaCreacion: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
  },
];

type CrudStep = 'list' | 'create' | 'view' | 'edit' | 'delete' | 'complete';

export default function EmpresaCrudPage() {
  const [empresas, setEmpresas] = useState<Empresa[]>(initialEmpresas);
  const [currentStep, setCurrentStep] = useState<CrudStep>('list');
  const [selectedEmpresa, setSelectedEmpresa] = useState<Empresa | null>(null);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Success message state (Feature #115)
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    nombre: '',
    configVisibilidadTickets: 'propios' as 'propios' | 'empresa',
    colorPrimario: '#2563eb',
    activa: true,
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.nombre.trim()) {
      errors.nombre = 'El nombre es requerido';
    } else if (formData.nombre.length < 3) {
      errors.nombre = 'El nombre debe tener al menos 3 caracteres';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreate = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));

    const newEmpresa: Empresa = {
      id: Math.max(...empresas.map(e => e.id)) + 1,
      nombre: formData.nombre,
      configVisibilidadTickets: formData.configVisibilidadTickets,
      colorPrimario: formData.colorPrimario,
      activa: formData.activa,
      fechaCreacion: new Date(),
    };

    setEmpresas(prev => [...prev, newEmpresa]);
    setSelectedEmpresa(newEmpresa);
    setCompletedSteps(prev => [...prev, 'create']);
    setCurrentStep('view');
    setIsLoading(false);

    // Show success message (Feature #115)
    setSuccessMessage('Empresa creada exitosamente');
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  const handleEdit = async () => {
    if (!validateForm() || !selectedEmpresa) return;

    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));

    setEmpresas(prev => prev.map(e =>
      e.id === selectedEmpresa.id
        ? { ...e, ...formData }
        : e
    ));
    setSelectedEmpresa(prev => prev ? { ...prev, ...formData } : null);
    setCompletedSteps(prev => [...prev, 'edit']);
    setCurrentStep('view');
    setIsLoading(false);

    // Show success message (Feature #115)
    setSuccessMessage('Empresa actualizada exitosamente');
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  const handleDelete = async () => {
    if (!selectedEmpresa) return;

    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));

    setEmpresas(prev => prev.filter(e => e.id !== selectedEmpresa.id));
    setCompletedSteps(prev => [...prev, 'delete']);
    setCurrentStep('complete');
    setIsLoading(false);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('es-ES', {
      dateStyle: 'medium',
    }).format(date);
  };

  const resetDemo = () => {
    setEmpresas(initialEmpresas);
    setCurrentStep('list');
    setSelectedEmpresa(null);
    setCompletedSteps([]);
    setFormData({
      nombre: '',
      configVisibilidadTickets: 'propios',
      colorPrimario: '#2563eb',
      activa: true,
    });
    setFormErrors({});
  };

  // Progress indicator
  const steps = [
    { key: 'list', label: 'Ver Lista' },
    { key: 'create', label: 'Crear' },
    { key: 'view', label: 'Ver Detalle' },
    { key: 'edit', label: 'Editar' },
    { key: 'delete', label: 'Eliminar' },
    { key: 'complete', label: 'Completado' },
  ];

  const currentStepIndex = steps.findIndex(s => s.key === currentStep);

  if (currentStep === 'complete') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
            <div className="w-20 h-20 mx-auto mb-6 flex items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
              <svg className="h-10 w-10 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              CRUD de Empresas Completado
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Todas las operaciones CRUD se han ejecutado exitosamente.
            </p>

            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6 text-left">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Operaciones Completadas</h3>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <span className="text-green-500">✓</span> Crear nueva empresa
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <span className="text-green-500">✓</span> Ver detalle de empresa
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <span className="text-green-500">✓</span> Editar empresa
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <span className="text-green-500">✓</span> Eliminar empresa
                </li>
              </ul>
            </div>

            <button
              onClick={resetDemo}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Reiniciar Demo
            </button>
          </div>

          <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">
              Feature #41: Empresa CRUD complete workflow ✅
            </h4>
            <p className="text-sm text-blue-700 dark:text-blue-400 mb-2">
              Este test verifica todas las operaciones CRUD para Empresas:
            </p>
            <ol className="list-decimal list-inside text-sm text-blue-700 dark:text-blue-400 space-y-1">
              <li>✅ Crear nueva empresa con validacion</li>
              <li>✅ Ver detalle de empresa</li>
              <li>✅ Editar empresa existente</li>
              <li>✅ Eliminar empresa con confirmacion</li>
            </ol>
          </div>

          <div className="mt-4 text-center">
            <Link href="/demo" className="text-primary-600 hover:text-primary-700 dark:text-primary-400">
              ← Volver a demos
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Feature #41: CRUD de Empresas
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Demuestra las operaciones Create, Read, Update y Delete para Empresas.
          </p>
        </div>

        {/* Success Message (Feature #115) */}
        {successMessage && (
          <div
            className="mb-6 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg p-4 flex items-center gap-3"
            role="alert"
            aria-live="polite"
          >
            <svg className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-green-700 dark:text-green-300 font-medium">{successMessage}</span>
          </div>
        )}

        {/* Progress Steps */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
          <div className="flex justify-between items-center">
            {steps.map((step, index) => (
              <div key={step.key} className="flex items-center">
                <div className={`flex flex-col items-center ${index > 0 ? 'ml-4' : ''}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    index < currentStepIndex
                      ? 'bg-green-500 text-white'
                      : index === currentStepIndex
                      ? 'bg-primary-600 text-white ring-4 ring-primary-200'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
                  }`}>
                    {index < currentStepIndex ? '✓' : index + 1}
                  </div>
                  <span className={`text-xs mt-1 ${
                    index === currentStepIndex ? 'text-primary-600 font-medium' : 'text-gray-500'
                  }`}>
                    {step.label}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div className={`h-1 w-12 mx-2 ${
                    index < currentStepIndex ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* List View */}
        {currentStep === 'list' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Lista de Empresas
              </h2>
              <button
                onClick={() => {
                  setFormData({
                    nombre: '',
                    configVisibilidadTickets: 'propios',
                    colorPrimario: '#2563eb',
                    activa: true,
                  });
                  setFormErrors({});
                  setCurrentStep('create');
                }}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                Nueva Empresa
              </button>
            </div>
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Nombre</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Visibilidad</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Estado</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Fecha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {empresas.map(empresa => (
                  <tr key={empresa.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">#{empresa.id}</td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white flex items-center gap-2">
                      <div
                        className="w-4 h-4 rounded"
                        style={{ backgroundColor: empresa.colorPrimario }}
                      />
                      {empresa.nombre}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {empresa.configVisibilidadTickets === 'empresa' ? 'Toda la empresa' : 'Solo propios'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        empresa.activa
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                      }`}>
                        {empresa.activa ? 'Activa' : 'Inactiva'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(empresa.fechaCreacion)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border-t border-blue-100 dark:border-blue-800">
              <p className="text-sm text-blue-700 dark:text-blue-400">
                <strong>Paso 1:</strong> Haz clic en &quot;Nueva Empresa&quot; para comenzar el flujo CRUD.
              </p>
            </div>
          </div>
        )}

        {/* Create Form */}
        {currentStep === 'create' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
              Crear Nueva Empresa
            </h2>
            <div className="space-y-4 max-w-md">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Nombre de la Empresa *
                </label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={e => setFormData(prev => ({ ...prev, nombre: e.target.value }))}
                  className={`w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:text-white ${
                    formErrors.nombre ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                  placeholder="Ingrese el nombre"
                />
                {formErrors.nombre && (
                  <p className="text-red-500 text-sm mt-1" role="alert">{formErrors.nombre}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Visibilidad de Tickets
                </label>
                <select
                  value={formData.configVisibilidadTickets}
                  onChange={e => setFormData(prev => ({ ...prev, configVisibilidadTickets: e.target.value as 'propios' | 'empresa' }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
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
                  value={formData.colorPrimario}
                  onChange={e => setFormData(prev => ({ ...prev, colorPrimario: e.target.value }))}
                  className="w-16 h-10 rounded cursor-pointer"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="activa"
                  checked={formData.activa}
                  onChange={e => setFormData(prev => ({ ...prev, activa: e.target.checked }))}
                  className="w-4 h-4"
                />
                <label htmlFor="activa" className="text-sm text-gray-700 dark:text-gray-300">
                  Empresa activa
                </label>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleCreate}
                  disabled={isLoading}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {isLoading && (
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  )}
                  {isLoading ? 'Creando...' : 'Crear Empresa'}
                </button>
                <button
                  onClick={() => setCurrentStep('list')}
                  disabled={isLoading}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-sm text-blue-700 dark:text-blue-400">
                <strong>Paso 2:</strong> Completa el formulario y haz clic en &quot;Crear Empresa&quot;.
              </p>
            </div>
          </div>
        )}

        {/* View Detail */}
        {currentStep === 'view' && selectedEmpresa && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Detalle de Empresa
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setFormData({
                      nombre: selectedEmpresa.nombre,
                      configVisibilidadTickets: selectedEmpresa.configVisibilidadTickets,
                      colorPrimario: selectedEmpresa.colorPrimario,
                      activa: selectedEmpresa.activa,
                    });
                    setFormErrors({});
                    setCurrentStep('edit');
                  }}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                  </svg>
                  Editar
                </button>
                <button
                  onClick={() => setCurrentStep('delete')}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                  </svg>
                  Eliminar
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <dt className="text-sm text-gray-500 dark:text-gray-400">ID</dt>
                <dd className="text-gray-900 dark:text-white font-medium">#{selectedEmpresa.id}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500 dark:text-gray-400">Nombre</dt>
                <dd className="text-gray-900 dark:text-white font-medium flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: selectedEmpresa.colorPrimario }}
                  />
                  {selectedEmpresa.nombre}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500 dark:text-gray-400">Visibilidad de Tickets</dt>
                <dd className="text-gray-900 dark:text-white font-medium">
                  {selectedEmpresa.configVisibilidadTickets === 'empresa' ? 'Toda la empresa' : 'Solo propios'}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500 dark:text-gray-400">Estado</dt>
                <dd>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    selectedEmpresa.activa
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                  }`}>
                    {selectedEmpresa.activa ? 'Activa' : 'Inactiva'}
                  </span>
                </dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500 dark:text-gray-400">Fecha de Creacion</dt>
                <dd className="text-gray-900 dark:text-white font-medium">
                  {formatDate(selectedEmpresa.fechaCreacion)}
                </dd>
              </div>
            </div>
            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-sm text-blue-700 dark:text-blue-400">
                <strong>Paso 3-4:</strong> Haz clic en &quot;Editar&quot; para modificar la empresa, luego &quot;Eliminar&quot; para completar el flujo CRUD.
              </p>
            </div>
          </div>
        )}

        {/* Edit Form */}
        {currentStep === 'edit' && selectedEmpresa && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
              Editar Empresa #{selectedEmpresa.id}
            </h2>
            <div className="space-y-4 max-w-md">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Nombre de la Empresa *
                </label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={e => setFormData(prev => ({ ...prev, nombre: e.target.value }))}
                  className={`w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:text-white ${
                    formErrors.nombre ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                />
                {formErrors.nombre && (
                  <p className="text-red-500 text-sm mt-1" role="alert">{formErrors.nombre}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Visibilidad de Tickets
                </label>
                <select
                  value={formData.configVisibilidadTickets}
                  onChange={e => setFormData(prev => ({ ...prev, configVisibilidadTickets: e.target.value as 'propios' | 'empresa' }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
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
                  value={formData.colorPrimario}
                  onChange={e => setFormData(prev => ({ ...prev, colorPrimario: e.target.value }))}
                  className="w-16 h-10 rounded cursor-pointer"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="activa-edit"
                  checked={formData.activa}
                  onChange={e => setFormData(prev => ({ ...prev, activa: e.target.checked }))}
                  className="w-4 h-4"
                />
                <label htmlFor="activa-edit" className="text-sm text-gray-700 dark:text-gray-300">
                  Empresa activa
                </label>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleEdit}
                  disabled={isLoading}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {isLoading && (
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  )}
                  {isLoading ? 'Guardando...' : 'Guardar Cambios'}
                </button>
                <button
                  onClick={() => setCurrentStep('view')}
                  disabled={isLoading}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-sm text-blue-700 dark:text-blue-400">
                <strong>Paso 4:</strong> Modifica algun campo y haz clic en &quot;Guardar Cambios&quot;.
              </p>
            </div>
          </div>
        )}

        {/* Delete Confirmation */}
        {currentStep === 'delete' && selectedEmpresa && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/30">
                <svg className="h-6 w-6 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Eliminar Empresa
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  ¿Esta seguro de que desea eliminar la empresa &quot;{selectedEmpresa.nombre}&quot;? Esta accion no se puede deshacer.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleDelete}
                disabled={isLoading}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {isLoading && (
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                )}
                {isLoading ? 'Eliminando...' : 'Eliminar Empresa'}
              </button>
              <button
                onClick={() => setCurrentStep('view')}
                disabled={isLoading}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Cancelar
              </button>
            </div>
            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-sm text-blue-700 dark:text-blue-400">
                <strong>Paso 5:</strong> Haz clic en &quot;Eliminar Empresa&quot; para completar el flujo CRUD.
              </p>
            </div>
          </div>
        )}

        <div className="mt-4 text-center">
          <Link href="/demo" className="text-primary-600 hover:text-primary-700 dark:text-primary-400">
            ← Volver a demos
          </Link>
        </div>
      </div>
    </div>
  );
}
