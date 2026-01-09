'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MainLayout } from '@/components/layout';
import api from '@/lib/api';

interface ConfiguracionSistema {
  id: number;
  clave: string;
  valor: string;
  descripcion: string | null;
}

const SETTING_LABELS: Record<string, string> = {
  SessionTimeoutMinutes: 'Timeout de Sesion (minutos)',
  ColorPrimario: 'Color Primario',
  ColorSecundario: 'Color Secundario',
  NombreSistema: 'Nombre del Sistema',
  LogoUrl: 'URL del Logo',
};

export default function ConfiguracionSistemaPage() {
  const router = useRouter();
  const [configs, setConfigs] = useState<ConfiguracionSistema[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchConfigs();
  }, []);

  const fetchConfigs = async () => {
    try {
      const response = await api.get('/configuracion/sistema');
      setConfigs(response.data);
    } catch (err) {
      setError('Error al cargar la configuracion del sistema');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (id: number, value: string) => {
    setConfigs(prev =>
      prev.map(c => (c.id === id ? { ...c, valor: value } : c))
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
      await api.put('/configuracion/sistema', configs);
      setSuccess('Configuracion del sistema guardada correctamente');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al guardar la configuracion');
    } finally {
      setSaving(false);
    }
  };

  const renderInput = (config: ConfiguracionSistema) => {
    const isColor = config.clave.toLowerCase().includes('color');
    const isNumber = config.clave === 'SessionTimeoutMinutes';

    if (isColor) {
      return (
        <div className="flex items-center space-x-3">
          <input
            type="color"
            value={config.valor || '#000000'}
            onChange={e => handleChange(config.id, e.target.value)}
            className="h-10 w-16 rounded cursor-pointer border border-gray-300 dark:border-gray-600"
          />
          <input
            type="text"
            value={config.valor}
            onChange={e => handleChange(config.id, e.target.value)}
            placeholder="#000000"
            className="input w-32"
          />
        </div>
      );
    }

    if (isNumber) {
      return (
        <input
          type="number"
          min="5"
          max="480"
          value={config.valor}
          onChange={e => handleChange(config.id, e.target.value)}
          className="input w-32"
        />
      );
    }

    return (
      <input
        type="text"
        value={config.valor}
        onChange={e => handleChange(config.id, e.target.value)}
        placeholder={config.clave === 'LogoUrl' ? 'https://...' : ''}
        className="input w-full max-w-md"
      />
    );
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
              Configuracion del Sistema
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Personaliza los ajustes generales del sistema
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
          <div className="card divide-y divide-gray-200 dark:divide-gray-700">
            {configs.map(config => (
              <div key={config.id} className="p-6">
                <div className="flex flex-col space-y-2">
                  <label className="text-sm font-medium text-gray-900 dark:text-white">
                    {SETTING_LABELS[config.clave] || config.clave}
                  </label>
                  {config.descripcion && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {config.descripcion}
                    </p>
                  )}
                  <div className="mt-2">
                    {renderInput(config)}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="card p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
            <h3 className="text-sm font-medium text-amber-800 dark:text-amber-300 mb-2">
              Nota Importante
            </h3>
            <p className="text-sm text-amber-700 dark:text-amber-400">
              Algunos cambios pueden requerir recargar la pagina para verse reflejados.
              Los cambios de colores afectaran toda la interfaz del sistema.
            </p>
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
