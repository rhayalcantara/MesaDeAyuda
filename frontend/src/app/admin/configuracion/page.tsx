'use client';

import { MainLayout } from '@/components/layout';

export default function AdminConfiguracionPage() {
  return (
    <MainLayout requiredRoles={['Admin']}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Configuracion del Sistema
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Administra la configuracion general del sistema
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* SLA Configuration */}
          <div className="card p-6">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Configuracion de SLA
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Define los tiempos de respuesta y resolucion por prioridad
            </p>
            <a href="/admin/configuracion/sla" className="btn-primary">
              Configurar SLA
            </a>
          </div>

          {/* System Settings */}
          <div className="card p-6">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Configuracion General
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Personaliza los colores, logo y timeout de sesion
            </p>
            <a href="/admin/configuracion/sistema" className="btn-primary">
              Configurar Sistema
            </a>
          </div>

          {/* Theme Settings */}
          <div className="card p-6">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Tema y Apariencia
            </h2>
            <div className="space-y-4">
              <div>
                <label className="label">Color Primario</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    defaultValue="#2563eb"
                    className="h-10 w-20 rounded cursor-pointer"
                  />
                  <span className="text-sm text-gray-500 dark:text-gray-400">#2563eb</span>
                </div>
              </div>
              <div>
                <label className="label">Color Secundario</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    defaultValue="#64748b"
                    className="h-10 w-20 rounded cursor-pointer"
                  />
                  <span className="text-sm text-gray-500 dark:text-gray-400">#64748b</span>
                </div>
              </div>
            </div>
          </div>

          {/* Session Settings */}
          <div className="card p-6">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Timeout de Sesion
            </h2>
            <div className="space-y-4">
              <div>
                <label className="label">Tiempo de inactividad (minutos)</label>
                <input
                  type="number"
                  defaultValue={60}
                  min={5}
                  max={480}
                  className="input w-32"
                />
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                La sesion se cerrara automaticamente despues de este tiempo de inactividad
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button className="btn-primary">
            Guardar Cambios
          </button>
        </div>
      </div>
    </MainLayout>
  );
}
