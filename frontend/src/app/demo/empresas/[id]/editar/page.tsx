'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

// Demo empresa edit page for testing CRUD navigation without backend authentication

interface Empresa {
  id: number;
  nombre: string;
  configVisibilidadTickets: string;
  colorPrimario: string;
  activa: boolean;
}

const demoEmpresas: Record<number, Empresa> = {
  1: {
    id: 1,
    nombre: 'Empresa Demo SA',
    configVisibilidadTickets: 'propios',
    colorPrimario: '#2563eb',
    activa: true,
  },
  2: {
    id: 2,
    nombre: 'Tecnologias ABC',
    configVisibilidadTickets: 'empresa',
    colorPrimario: '#16a34a',
    activa: true,
  },
  3: {
    id: 3,
    nombre: 'Consultores XYZ',
    configVisibilidadTickets: 'propios',
    colorPrimario: '#dc2626',
    activa: false,
  },
};

export default function DemoEmpresaEditPage() {
  const params = useParams();
  const router = useRouter();
  const empresaId = parseInt(params.id as string);

  const empresa = demoEmpresas[empresaId];

  const [formData, setFormData] = useState({
    nombre: empresa?.nombre || '',
    configVisibilidadTickets: empresa?.configVisibilidadTickets || 'propios',
    colorPrimario: empresa?.colorPrimario || '#2563eb',
    activa: empresa?.activa ?? true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In demo mode, just show alert and go back
    alert('Demo: Los cambios se guardarian en la base de datos');
    router.push('/demo/empresas');
  };

  if (!empresa) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Empresa no encontrada
          </h2>
          <Link href="/demo/empresas" className="px-4 py-2 bg-primary-600 text-white rounded-lg inline-block">
            Volver a empresas
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
          <Link href="/demo/empresas" className="hover:text-primary-600 dark:hover:text-primary-400">
            Empresas
          </Link>
          <svg className="mx-2 h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
          <Link href={`/demo/empresas/${empresa.id}`} className="hover:text-primary-600 dark:hover:text-primary-400">
            {empresa.nombre}
          </Link>
          <svg className="mx-2 h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
          <span className="text-gray-900 dark:text-white font-medium">Editar</span>
        </nav>

        {/* Info Banner */}
        <div className="mb-6 bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <h2 className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-2">
            Formulario de Edicion - ID #{empresa.id}
          </h2>
          <p className="text-sm text-yellow-700 dark:text-yellow-300">
            Este formulario carga los datos de la empresa con ID <strong>{empresa.id}</strong>.
            Los campos estan pre-llenados con los datos actuales.
          </p>
        </div>

        {/* Edit Form */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
            Editar Empresa: {empresa.nombre}
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Nombre de la Empresa
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
              <label htmlFor="visibilidad" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Visibilidad de Tickets
              </label>
              <select
                id="visibilidad"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                value={formData.configVisibilidadTickets}
                onChange={(e) => setFormData({ ...formData, configVisibilidadTickets: e.target.value })}
              >
                <option value="propios">Solo tickets propios</option>
                <option value="empresa">Todos los tickets de la empresa</option>
              </select>
            </div>

            <div>
              <label htmlFor="color" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Color Primario
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  id="color"
                  className="w-12 h-10 rounded cursor-pointer border border-gray-300"
                  value={formData.colorPrimario}
                  onChange={(e) => setFormData({ ...formData, colorPrimario: e.target.value })}
                />
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {formData.colorPrimario}
                </span>
              </div>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="activa"
                className="h-4 w-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
                checked={formData.activa}
                onChange={(e) => setFormData({ ...formData, activa: e.target.checked })}
              />
              <label htmlFor="activa" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                Empresa activa
              </label>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <Link
                href="/demo/empresas"
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
