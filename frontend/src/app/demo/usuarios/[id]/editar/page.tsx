'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

// Demo usuario edit page for testing CRUD navigation without backend authentication

interface Usuario {
  id: number;
  nombre: string;
  email: string;
  rol: 'Admin' | 'Empleado' | 'Cliente';
  activo: boolean;
  empresaId?: number;
  empresaNombre?: string;
  telefono?: string;
  departamento?: string;
}

const demoUsuarios: Record<number, Usuario> = {
  1: {
    id: 1,
    nombre: 'Admin Sistema',
    email: 'admin@mesadeayuda.com',
    rol: 'Admin',
    activo: true,
    telefono: '+1 555-0100',
    departamento: 'Administracion',
  },
  2: {
    id: 2,
    nombre: 'Carlos Soporte',
    email: 'carlos@mesadeayuda.com',
    rol: 'Empleado',
    activo: true,
    telefono: '+1 555-0101',
    departamento: 'Soporte Tecnico',
  },
  3: {
    id: 3,
    nombre: 'Maria Tecnica',
    email: 'maria@mesadeayuda.com',
    rol: 'Empleado',
    activo: true,
    telefono: '+1 555-0102',
    departamento: 'Desarrollo',
  },
  4: {
    id: 4,
    nombre: 'Juan Perez',
    email: 'juan@empresa-demo.com',
    rol: 'Cliente',
    activo: true,
    empresaId: 1,
    empresaNombre: 'Empresa Demo SA',
    telefono: '+1 555-0200',
  },
  5: {
    id: 5,
    nombre: 'Pedro Gonzalez',
    email: 'pedro@tecnologias-abc.com',
    rol: 'Cliente',
    activo: false,
    empresaId: 2,
    empresaNombre: 'Tecnologias ABC',
    telefono: '+1 555-0201',
  },
};

export default function DemoUsuarioEditPage() {
  const params = useParams();
  const router = useRouter();
  const usuarioId = parseInt(params.id as string);

  const usuario = demoUsuarios[usuarioId];

  const [formData, setFormData] = useState({
    nombre: usuario?.nombre || '',
    email: usuario?.email || '',
    rol: usuario?.rol || 'Cliente',
    telefono: usuario?.telefono || '',
    departamento: usuario?.departamento || '',
    activo: usuario?.activo ?? true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In demo mode, just show alert and go back
    alert('Demo: Los cambios se guardarian en la base de datos');
    router.push('/demo/usuarios');
  };

  if (!usuario) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Usuario no encontrado
          </h2>
          <Link href="/demo/usuarios" className="px-4 py-2 bg-primary-600 text-white rounded-lg inline-block">
            Volver a usuarios
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Breadcrumbs */}
        <nav className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-6" aria-label="Breadcrumb">
          <Link href="/demo" className="hover:text-primary-600 dark:hover:text-primary-400">
            Inicio
          </Link>
          <svg className="mx-2 h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
          <Link href="/demo/usuarios" className="hover:text-primary-600 dark:hover:text-primary-400">
            Usuarios
          </Link>
          <svg className="mx-2 h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
          <Link href={`/demo/usuarios/${usuario.id}`} className="hover:text-primary-600 dark:hover:text-primary-400">
            {usuario.nombre}
          </Link>
          <svg className="mx-2 h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
          <span className="text-gray-900 dark:text-white font-medium">Editar</span>
        </nav>

        {/* Info Banner */}
        <div className="mb-6 bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <h2 className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-2">
            Formulario de Edicion - ID #{usuario.id}
          </h2>
          <p className="text-sm text-yellow-700 dark:text-yellow-300">
            Este formulario carga los datos del usuario con ID <strong>{usuario.id}</strong>.
            Los campos estan pre-llenados con los datos actuales.
          </p>
        </div>

        {/* Edit Form */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
            Editar Usuario: {usuario.nombre}
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Nombre Completo
              </label>
              <input
                type="text"
                id="nombre"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                required
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email
              </label>
              <input
                type="email"
                id="email"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div>
              <label htmlFor="telefono" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Telefono
              </label>
              <input
                type="tel"
                id="telefono"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                value={formData.telefono}
                onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
              />
            </div>

            <div>
              <label htmlFor="rol" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Rol
              </label>
              <select
                id="rol"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                value={formData.rol}
                onChange={(e) => setFormData({ ...formData, rol: e.target.value as 'Admin' | 'Empleado' | 'Cliente' })}
              >
                <option value="Admin">Administrador</option>
                <option value="Empleado">Empleado</option>
                <option value="Cliente">Cliente</option>
              </select>
            </div>

            {(formData.rol === 'Admin' || formData.rol === 'Empleado') && (
              <div>
                <label htmlFor="departamento" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Departamento
                </label>
                <input
                  type="text"
                  id="departamento"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  value={formData.departamento}
                  onChange={(e) => setFormData({ ...formData, departamento: e.target.value })}
                />
              </div>
            )}

            <div className="flex items-center">
              <input
                type="checkbox"
                id="activo"
                className="h-4 w-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
                checked={formData.activo}
                onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
              />
              <label htmlFor="activo" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                Usuario activo
              </label>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <Link
                href="/demo/usuarios"
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancelar
              </Link>
              <button
                type="submit"
                className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors"
              >
                Guardar Cambios
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
