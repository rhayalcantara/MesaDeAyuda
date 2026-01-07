'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';

interface Categoria {
  id: number;
  nombre: string;
}

export default function NuevoTicketPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loadingCategorias, setLoadingCategorias] = useState(true);

  // Form fields
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [categoriaId, setCategoriaId] = useState('');
  const [prioridad, setPrioridad] = useState('Media');

  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        const response = await api.get('/categorias');
        setCategorias(response.data);
      } catch (err) {
        console.error('Error loading categories:', err);
        // Use demo categories if API fails
        setCategorias([
          { id: 1, nombre: 'Sistema de Ventas' },
          { id: 2, nombre: 'Sistema de Inventario' },
          { id: 3, nombre: 'Portal Web' },
          { id: 4, nombre: 'Aplicacion Movil' },
          { id: 5, nombre: 'Otro' },
        ]);
      } finally {
        setLoadingCategorias(false);
      }
    };

    fetchCategorias();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    // Validation
    if (!titulo.trim()) {
      setError('El titulo es requerido');
      setIsLoading(false);
      return;
    }

    if (!descripcion.trim()) {
      setError('La descripcion es requerida');
      setIsLoading(false);
      return;
    }

    if (!categoriaId) {
      setError('Debe seleccionar una categoria');
      setIsLoading(false);
      return;
    }

    try {
      await api.post('/tickets', {
        titulo: titulo.trim(),
        descripcion: descripcion.trim(),
        categoriaId: parseInt(categoriaId),
        prioridad,
      });

      setSuccess('Ticket creado exitosamente');

      // Redirect to tickets list after 1.5 seconds
      setTimeout(() => {
        router.push('/cliente/tickets');
      }, 1500);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al crear el ticket');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <MainLayout requiredRole="Cliente">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Crear Nuevo Ticket
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Complete el formulario para reportar un problema o solicitud
          </p>
        </div>

        <form onSubmit={handleSubmit} className="card p-6 space-y-6">
          {error && (
            <div
              className="bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg text-sm"
              role="alert"
              aria-live="assertive"
            >
              {error}
            </div>
          )}

          {success && (
            <div
              className="bg-green-50 dark:bg-green-900/50 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 px-4 py-3 rounded-lg text-sm"
              role="status"
              aria-live="polite"
            >
              {success}
            </div>
          )}

          {/* Titulo */}
          <div>
            <label htmlFor="titulo" className="label">
              Titulo del ticket <span className="text-red-500">*</span>
            </label>
            <input
              id="titulo"
              name="titulo"
              type="text"
              required
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              className="input"
              placeholder="Describe brevemente el problema"
              maxLength={200}
              aria-describedby="titulo-hint"
            />
            <p id="titulo-hint" className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Maximo 200 caracteres
            </p>
          </div>

          {/* Categoria */}
          <div>
            <label htmlFor="categoria" className="label">
              Categoria (Sistema) <span className="text-red-500">*</span>
            </label>
            <select
              id="categoria"
              name="categoria"
              required
              value={categoriaId}
              onChange={(e) => setCategoriaId(e.target.value)}
              className="input"
              disabled={loadingCategorias}
              aria-describedby="categoria-hint"
            >
              <option value="">Seleccione una categoria</option>
              {categorias.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.nombre}
                </option>
              ))}
            </select>
            <p id="categoria-hint" className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Seleccione el sistema relacionado con el problema
            </p>
          </div>

          {/* Prioridad */}
          <div>
            <label htmlFor="prioridad" className="label">
              Prioridad <span className="text-red-500">*</span>
            </label>
            <select
              id="prioridad"
              name="prioridad"
              required
              value={prioridad}
              onChange={(e) => setPrioridad(e.target.value)}
              className="input"
              aria-describedby="prioridad-hint"
            >
              <option value="Baja">Baja - Puede esperar</option>
              <option value="Media">Media - Necesita atencion pronto</option>
              <option value="Alta">Alta - Urgente</option>
            </select>
            <p id="prioridad-hint" className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Indique la urgencia del problema
            </p>
          </div>

          {/* Descripcion */}
          <div>
            <label htmlFor="descripcion" className="label">
              Descripcion detallada <span className="text-red-500">*</span>
            </label>
            <textarea
              id="descripcion"
              name="descripcion"
              required
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              className="input min-h-[150px] resize-y"
              placeholder="Describa el problema con el mayor detalle posible. Incluya pasos para reproducirlo, mensajes de error, etc."
              aria-describedby="descripcion-hint"
            />
            <p id="descripcion-hint" className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Proporcione todos los detalles que puedan ayudar a resolver el problema
            </p>
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary flex-1 py-3"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Creando ticket...
                </span>
              ) : (
                'Crear Ticket'
              )}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="btn-secondary flex-1 py-3"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </MainLayout>
  );
}
