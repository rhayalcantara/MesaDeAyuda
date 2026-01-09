'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MainLayout } from '@/components/layout';
import api from '@/lib/api';

interface ConfiguracionSLA {
  id: number;
  prioridad: string;
  tiempoRespuestaHoras: number;
  tiempoResolucionHoras: number;
}

export default function ConfiguracionSLAPage() {
  const router = useRouter();
  const [configs, setConfigs] = useState<ConfiguracionSLA[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchConfigs();
  }, []);

  const fetchConfigs = async () => {
    try {
      const response = await api.get('/configuracion/sla');
      setConfigs(response.data);
    } catch (err) {
      setError('Error al cargar la configuracion de SLA');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (id: number, field: 'tiempoRespuestaHoras' | 'tiempoResolucionHoras', value: number) => {
    setConfigs(prev =>
      prev.map(c => (c.id === id ? { ...c, [field]: value } : c))
    );
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      await api.put('/configuracion/sla', configs);
      setSuccess('Configuracion de SLA guardada correctamente');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al guardar la configuracion');
    } finally {
      setSaving(false);
    }
  };

  const getPriorityColor = (prioridad: string) => {
    switch (prioridad) {
      case 'Alta':
        return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20';
      case 'Media':
        return 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20';
      case 'Baja':
        return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  if (loading) {
    return (
      <MainLayout requiredRoles={['Admin']}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout requiredRoles={['Admin']}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Configuracion de SLA
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Define los tiempos de respuesta y resolucion por prioridad
            </p>
          </div>
          <button
            onClick={() => router.push('/admin/configuracion')}
            className="btn-secondary"
          >
            Volver
          </button>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 px-4 py-3 rounded">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="card overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Prioridad
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Tiempo de Respuesta (horas)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Tiempo de Resolucion (horas)
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                {configs.map(config => (
                  <tr key={config.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(config.prioridad)}`}>
                        {config.prioridad}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="number"
                        min="1"
                        value={config.tiempoRespuestaHoras}
                        onChange={e => handleChange(config.id, 'tiempoRespuestaHoras', parseInt(e.target.value) || 1)}
                        className="input w-24"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="number"
                        min="1"
                        value={config.tiempoResolucionHoras}
                        onChange={e => handleChange(config.id, 'tiempoResolucionHoras', parseInt(e.target.value) || 1)}
                        className="input w-24"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="card p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
            <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-2">
              Informacion sobre SLA
            </h3>
            <ul className="text-sm text-blue-700 dark:text-blue-400 space-y-1">
              <li>• <strong>Tiempo de Respuesta:</strong> Tiempo maximo para la primera respuesta al cliente</li>
              <li>• <strong>Tiempo de Resolucion:</strong> Tiempo maximo para resolver completamente el ticket</li>
              <li>• Los tiempos se calculan en horas habiles desde la creacion del ticket</li>
            </ul>
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => router.push('/admin/configuracion')}
              className="btn-secondary"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="btn-primary"
            >
              {saving ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>
    </MainLayout>
  );
}
