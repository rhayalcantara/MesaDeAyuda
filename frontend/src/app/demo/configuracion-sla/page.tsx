'use client';

import { useState } from 'react';
import Link from 'next/link';

// Sensible default SLA configuration (Feature #95)
// Based on industry standards for IT support
const defaultSLAConfig = {
  Alta: {
    tiempoRespuestaHoras: 1,   // 1 hour first response for high priority
    tiempoResolucionHoras: 4,  // 4 hours resolution for high priority
  },
  Media: {
    tiempoRespuestaHoras: 4,   // 4 hours first response for medium priority
    tiempoResolucionHoras: 24, // 24 hours resolution for medium priority
  },
  Baja: {
    tiempoRespuestaHoras: 8,   // 8 hours first response for low priority
    tiempoResolucionHoras: 72, // 72 hours resolution for low priority
  },
};

export default function DemoConfiguracionSLAPage() {
  const [slaConfig, setSlaConfig] = useState(defaultSLAConfig);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleChange = (prioridad: 'Alta' | 'Media' | 'Baja', field: 'tiempoRespuestaHoras' | 'tiempoResolucionHoras', value: number) => {
    setSlaConfig(prev => ({
      ...prev,
      [prioridad]: {
        ...prev[prioridad],
        [field]: value,
      },
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSaving(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleReset = () => {
    setSlaConfig(defaultSLAConfig);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Demo - Configuracion de SLA
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Define los tiempos de respuesta y resolucion por nivel de prioridad
          </p>
        </div>

        {/* Success message */}
        {saveSuccess && (
          <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg p-4 flex items-center gap-3" role="alert">
            <svg className="h-5 w-5 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-green-700 dark:text-green-300">
              Configuracion de SLA guardada exitosamente
            </span>
          </div>
        )}

        {/* SLA Configuration Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">
              Tiempos de SLA por Prioridad
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Los valores por defecto estan basados en estandares de la industria para soporte de TI
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Prioridad
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Tiempo de Primera Respuesta (horas)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Tiempo de Resolucion (horas)
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {/* Alta Priority */}
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300">
                      Alta
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="number"
                      value={slaConfig.Alta.tiempoRespuestaHoras}
                      onChange={(e) => handleChange('Alta', 'tiempoRespuestaHoras', parseInt(e.target.value) || 0)}
                      min={1}
                      max={24}
                      className="w-20 px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="number"
                      value={slaConfig.Alta.tiempoResolucionHoras}
                      onChange={(e) => handleChange('Alta', 'tiempoResolucionHoras', parseInt(e.target.value) || 0)}
                      min={1}
                      max={168}
                      className="w-20 px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                    />
                  </td>
                </tr>

                {/* Media Priority */}
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300">
                      Media
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="number"
                      value={slaConfig.Media.tiempoRespuestaHoras}
                      onChange={(e) => handleChange('Media', 'tiempoRespuestaHoras', parseInt(e.target.value) || 0)}
                      min={1}
                      max={48}
                      className="w-20 px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="number"
                      value={slaConfig.Media.tiempoResolucionHoras}
                      onChange={(e) => handleChange('Media', 'tiempoResolucionHoras', parseInt(e.target.value) || 0)}
                      min={1}
                      max={336}
                      className="w-20 px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                    />
                  </td>
                </tr>

                {/* Baja Priority */}
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300">
                      Baja
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="number"
                      value={slaConfig.Baja.tiempoRespuestaHoras}
                      onChange={(e) => handleChange('Baja', 'tiempoRespuestaHoras', parseInt(e.target.value) || 0)}
                      min={1}
                      max={72}
                      className="w-20 px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="number"
                      value={slaConfig.Baja.tiempoResolucionHoras}
                      onChange={(e) => handleChange('Baja', 'tiempoResolucionHoras', parseInt(e.target.value) || 0)}
                      min={1}
                      max={504}
                      className="w-20 px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center">
          <button
            onClick={handleReset}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            Restablecer Valores por Defecto
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {isSaving ? (
              <>
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Guardando...
              </>
            ) : (
              'Guardar Configuracion'
            )}
          </button>
        </div>

        {/* Feature Info */}
        <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">
            Informacion de Demo - Feature #95: SLA defaults are sensible
          </h4>
          <p className="text-blue-700 dark:text-blue-300 text-sm">
            Esta pagina demuestra que la configuracion de SLA tiene <strong>valores por defecto sensibles</strong>.
          </p>
          <ul className="list-disc list-inside text-sm text-blue-700 dark:text-blue-300 mt-2 space-y-1">
            <li><strong>Alta:</strong> Respuesta en 1 hora, Resolucion en 4 horas (urgente)</li>
            <li><strong>Media:</strong> Respuesta en 4 horas, Resolucion en 24 horas (estandar)</li>
            <li><strong>Baja:</strong> Respuesta en 8 horas, Resolucion en 72 horas (no urgente)</li>
            <li>Los valores estan basados en estandares de la industria para soporte de TI</li>
            <li>Todos los valores son mayores que 0 y tienen limites razonables</li>
          </ul>
        </div>

        <div className="mt-6">
          <Link
            href="/demo"
            className="text-primary-600 dark:text-primary-400 hover:underline text-sm"
          >
            ← Volver a la demo principal
          </Link>
        </div>
      </div>
    </div>
  );
}
