'use client';

import { useEffect, useState } from 'react';
import { MainLayout } from '@/components/layout';
import { useSystemTheme } from '@/context/SystemThemeContext';
import api from '@/lib/api';

interface ConfiguracionSLA {
  id: number;
  prioridad: string;
  tiempoRespuestaHoras: number;
  tiempoResolucionHoras: number;
}

export default function AdminConfiguracionPage() {
  const { systemTheme } = useSystemTheme();
  const [slaConfigs, setSlaConfigs] = useState<ConfiguracionSLA[]>([]);
  const [sessionTimeout, setSessionTimeout] = useState<string>('60');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [slaRes, timeoutRes] = await Promise.all([
          api.get('/configuracion/sla'),
          api.get('/configuracion/sistema/SessionTimeoutMinutes'),
        ]);
        setSlaConfigs(slaRes.data);
        setSessionTimeout(timeoutRes.data.valor || '60');
      } catch (error) {
        console.error('Error fetching configuration:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

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
            {!loading && slaConfigs.length > 0 && (
              <div className="mb-4 space-y-2 text-sm">
                {slaConfigs.map(sla => (
                  <div key={sla.id} className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>{sla.prioridad}:</span>
                    <span>{sla.tiempoRespuestaHoras}h resp. / {sla.tiempoResolucionHoras}h resol.</span>
                  </div>
                ))}
              </div>
            )}
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

          {/* Theme Settings - Read Only Preview */}
          <div className="card p-6">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Tema y Apariencia
            </h2>
            <div className="space-y-4">
              <div>
                <label className="label">Nombre del Sistema</label>
                <p className="text-gray-900 dark:text-white font-medium">
                  {systemTheme.nombreSistema}
                </p>
              </div>
              <div>
                <label className="label">Color Primario</label>
                <div className="flex items-center space-x-2">
                  <div
                    className="h-8 w-12 rounded border border-gray-300 dark:border-gray-600"
                    style={{ backgroundColor: systemTheme.colorPrimario }}
                  />
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {systemTheme.colorPrimario}
                  </span>
                </div>
              </div>
              <div>
                <label className="label">Color Secundario</label>
                <div className="flex items-center space-x-2">
                  <div
                    className="h-8 w-12 rounded border border-gray-300 dark:border-gray-600"
                    style={{ backgroundColor: systemTheme.colorSecundario }}
                  />
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {systemTheme.colorSecundario}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Session Settings - Read Only Preview */}
          <div className="card p-6">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Timeout de Sesion
            </h2>
            <div className="space-y-4">
              <div>
                <label className="label">Tiempo de inactividad</label>
                <p className="text-gray-900 dark:text-white font-medium">
                  {sessionTimeout} minutos
                </p>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                La sesion se cerrara automaticamente despues de este tiempo de inactividad
              </p>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
