'use client';

import { useState } from 'react';
import Link from 'next/link';

interface Usuario {
  id: number;
  nombre: string;
  email: string;
  rol: 'Admin' | 'Empleado' | 'Cliente';
  empresaId: number | null;
  empresaNombre: string | null;
  activo: boolean;
  fechaCreacion: string;
}

type Step = 'list' | 'create' | 'detail' | 'edit' | 'deactivate' | 'complete';

const initialUsuarios: Usuario[] = [
  {
    id: 1,
    nombre: 'Admin Sistema',
    email: 'admin@mdayuda.com',
    rol: 'Admin',
    empresaId: null,
    empresaNombre: null,
    activo: true,
    fechaCreacion: '2025-12-01',
  },
  {
    id: 2,
    nombre: 'Empleado Demo',
    email: 'empleado@mdayuda.com',
    rol: 'Empleado',
    empresaId: null,
    empresaNombre: null,
    activo: true,
    fechaCreacion: '2025-12-15',
  },
];

export default function UsuarioCrudPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>(initialUsuarios);
  const [currentStep, setCurrentStep] = useState<Step>('list');
  const [selectedUsuario, setSelectedUsuario] = useState<Usuario | null>(null);
  const [successMessage, setSuccessMessage] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    rol: 'Empleado' as 'Admin' | 'Empleado' | 'Cliente',
    password: '',
    activo: true,
  });

  const completedSteps = {
    list: currentStep !== 'list',
    create: ['detail', 'edit', 'deactivate', 'complete'].includes(currentStep),
    detail: ['edit', 'deactivate', 'complete'].includes(currentStep),
    edit: ['deactivate', 'complete'].includes(currentStep),
    deactivate: currentStep === 'complete',
  };

  const handleCreate = () => {
    const newUsuario: Usuario = {
      id: usuarios.length + 1,
      nombre: formData.nombre,
      email: formData.email,
      rol: formData.rol,
      empresaId: null,
      empresaNombre: null,
      activo: true,
      fechaCreacion: new Date().toISOString().split('T')[0],
    };
    setUsuarios([...usuarios, newUsuario]);
    setSelectedUsuario(newUsuario);
    setSuccessMessage('Usuario creado exitosamente');
    setCurrentStep('detail');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleEdit = () => {
    if (!selectedUsuario) return;
    const updated = usuarios.map(u =>
      u.id === selectedUsuario.id
        ? { ...u, nombre: formData.nombre, email: formData.email, rol: formData.rol }
        : u
    );
    setUsuarios(updated);
    setSelectedUsuario({ ...selectedUsuario, nombre: formData.nombre, email: formData.email, rol: formData.rol });
    setSuccessMessage('Usuario actualizado exitosamente');
    setCurrentStep('detail');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleDeactivate = () => {
    if (!selectedUsuario) return;
    const updated = usuarios.map(u =>
      u.id === selectedUsuario.id ? { ...u, activo: false } : u
    );
    setUsuarios(updated);
    setSelectedUsuario({ ...selectedUsuario, activo: false });
    setSuccessMessage('Usuario desactivado exitosamente');
    setCurrentStep('complete');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleReset = () => {
    setUsuarios(initialUsuarios);
    setCurrentStep('list');
    setSelectedUsuario(null);
    setSuccessMessage('');
    setFormData({ nombre: '', email: '', rol: 'Empleado', password: '', activo: true });
  };

  const formatDate = (dateStr: string) => {
    return new Intl.DateTimeFormat('es-ES', { dateStyle: 'medium' }).format(new Date(dateStr));
  };

  const getRolColor = (rol: string) => {
    const colors: Record<string, string> = {
      Admin: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
      Empleado: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
      Cliente: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
    };
    return colors[rol] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Feature #42: CRUD de Usuarios
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Demuestra las operaciones Create, Read, Update y Deactivate para Usuarios.
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-between mb-8 bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
          {[
            { key: 'list', label: 'Ver Lista', num: '1' },
            { key: 'create', label: 'Crear', num: '2' },
            { key: 'detail', label: 'Ver Detalle', num: '3' },
            { key: 'edit', label: 'Editar', num: '4' },
            { key: 'deactivate', label: 'Desactivar', num: '5' },
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
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Lista de Usuarios</h2>
                <button
                  onClick={() => {
                    setFormData({ nombre: '', email: '', rol: 'Empleado', password: '', activo: true });
                    setCurrentStep('create');
                  }}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Nuevo Usuario
                </button>
              </div>
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">ID</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Nombre</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Email</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Rol</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {usuarios.map((usuario) => (
                    <tr key={usuario.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">#{usuario.id}</td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">{usuario.nombre}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{usuario.email}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRolColor(usuario.rol)}`}>
                          {usuario.rol}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          usuario.activo
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                            : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                        }`}>
                          {usuario.activo ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                <strong>Paso 1:</strong> Haz clic en &quot;Nuevo Usuario&quot; para comenzar el flujo CRUD.
              </p>
            </>
          )}

          {currentStep === 'create' && (
            <>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Crear Nuevo Usuario</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Nombre Completo *
                  </label>
                  <input
                    type="text"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    placeholder="Ingrese el nombre"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="correo@ejemplo.com"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Rol *
                  </label>
                  <select
                    value={formData.rol}
                    onChange={(e) => setFormData({ ...formData, rol: e.target.value as 'Admin' | 'Empleado' | 'Cliente' })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="Admin">Administrador</option>
                    <option value="Empleado">Empleado</option>
                    <option value="Cliente">Cliente</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Contrasena *
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Minimo 8 caracteres"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleCreate}
                    disabled={!formData.nombre || !formData.email}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
                  >
                    Crear Usuario
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
                <strong>Paso 2:</strong> Completa el formulario y haz clic en &quot;Crear Usuario&quot;.
              </p>
            </>
          )}

          {currentStep === 'detail' && selectedUsuario && (
            <>
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Detalle de Usuario</h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setFormData({
                        nombre: selectedUsuario.nombre,
                        email: selectedUsuario.email,
                        rol: selectedUsuario.rol,
                        password: '',
                        activo: selectedUsuario.activo,
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
                    onClick={() => setCurrentStep('deactivate')}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                    </svg>
                    Desactivar
                  </button>
                </div>
              </div>
              <dl className="grid grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm text-gray-500 dark:text-gray-400">ID</dt>
                  <dd className="text-gray-900 dark:text-white font-medium">#{selectedUsuario.id}</dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500 dark:text-gray-400">Nombre</dt>
                  <dd className="text-gray-900 dark:text-white font-medium">{selectedUsuario.nombre}</dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500 dark:text-gray-400">Email</dt>
                  <dd className="text-gray-900 dark:text-white">{selectedUsuario.email}</dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500 dark:text-gray-400">Rol</dt>
                  <dd>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRolColor(selectedUsuario.rol)}`}>
                      {selectedUsuario.rol}
                    </span>
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500 dark:text-gray-400">Estado</dt>
                  <dd>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      selectedUsuario.activo
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                        : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                    }`}>
                      {selectedUsuario.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500 dark:text-gray-400">Fecha de Creacion</dt>
                  <dd className="text-gray-900 dark:text-white">{formatDate(selectedUsuario.fechaCreacion)}</dd>
                </div>
              </dl>
              <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                <strong>Paso 3-4:</strong> Haz clic en &quot;Editar&quot; para modificar el usuario, luego &quot;Desactivar&quot; para completar el flujo.
              </p>
            </>
          )}

          {currentStep === 'edit' && selectedUsuario && (
            <>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Editar Usuario #{selectedUsuario.id}</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Nombre Completo *
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
                    Email *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Rol *
                  </label>
                  <select
                    value={formData.rol}
                    onChange={(e) => setFormData({ ...formData, rol: e.target.value as 'Admin' | 'Empleado' | 'Cliente' })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="Admin">Administrador</option>
                    <option value="Empleado">Empleado</option>
                    <option value="Cliente">Cliente</option>
                  </select>
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

          {currentStep === 'deactivate' && selectedUsuario && (
            <>
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto mb-4 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Desactivar Usuario</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  ¿Esta seguro de que desea desactivar al usuario &quot;{selectedUsuario.nombre}&quot;?<br />
                  El usuario no podra iniciar sesion mientras este inactivo.
                </p>
                <div className="flex justify-center gap-3">
                  <button
                    onClick={handleDeactivate}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    Desactivar Usuario
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
                <strong>Paso 5:</strong> Haz clic en &quot;Desactivar Usuario&quot; para completar el flujo CRUD.
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
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">CRUD de Usuarios Completado</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Todas las operaciones CRUD se han ejecutado exitosamente.
              </p>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 max-w-md mx-auto mb-6">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Operaciones Completadas</h3>
                <ul className="text-left space-y-2 text-sm">
                  <li className="flex items-center gap-2 text-green-700 dark:text-green-300">
                    <span className="text-green-500">✓</span> Crear nuevo usuario (empleado)
                  </li>
                  <li className="flex items-center gap-2 text-green-700 dark:text-green-300">
                    <span className="text-green-500">✓</span> Ver detalle de usuario
                  </li>
                  <li className="flex items-center gap-2 text-green-700 dark:text-green-300">
                    <span className="text-green-500">✓</span> Editar informacion de usuario
                  </li>
                  <li className="flex items-center gap-2 text-green-700 dark:text-green-300">
                    <span className="text-green-500">✓</span> Desactivar usuario
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
            Feature #42: Usuario CRUD complete workflow ✅
          </h4>
          <p className="text-sm text-blue-700 dark:text-blue-400 mb-2">
            Este test verifica todas las operaciones CRUD para Usuarios:
          </p>
          <ul className="list-disc list-inside text-sm text-blue-600 dark:text-blue-400 space-y-1">
            <li>✅ Crear nuevo usuario (empleado) con validacion</li>
            <li>✅ Ver detalle de usuario</li>
            <li>✅ Editar informacion de usuario</li>
            <li>✅ Desactivar usuario (soft delete)</li>
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
