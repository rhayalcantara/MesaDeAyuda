'use client';

import { useState } from 'react';

// Demo ticket creation form for testing accessibility
// This page doesn't require authentication

interface Categoria {
  id: number;
  nombre: string;
}

const demoCategorias: Categoria[] = [
  { id: 1, nombre: 'Sistema de Ventas' },
  { id: 2, nombre: 'Sistema de Inventario' },
  { id: 3, nombre: 'Portal Web' },
  { id: 4, nombre: 'Aplicacion Movil' },
  { id: 5, nombre: 'Otro' },
];

export default function DemoTicketFormPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [errorField, setErrorField] = useState<string | null>(null);
  const [success, setSuccess] = useState('');

  // Form fields
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [categoriaId, setCategoriaId] = useState('');
  const [prioridad, setPrioridad] = useState('Media');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setErrorField(null);
    setSuccess('');
    setIsLoading(true);

    // Validation
    if (!titulo.trim()) {
      setError('El titulo es requerido');
      setErrorField('titulo');
      setIsLoading(false);
      return;
    }

    if (!descripcion.trim()) {
      setError('La descripcion es requerida');
      setErrorField('descripcion');
      setIsLoading(false);
      return;
    }

    if (!categoriaId) {
      setError('Debe seleccionar una categoria');
      setErrorField('categoria');
      setIsLoading(false);
      return;
    }

    // Simulate API call
    setTimeout(() => {
      setSuccess('Ticket creado exitosamente (Demo)');
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Crear Nuevo Ticket (Demo)
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Esta es una pagina demo para probar accesibilidad de formularios
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-6">
          {error && (
            <div
              id="form-error"
              className="bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg text-sm"
              role="alert"
              aria-live="assertive"
            >
              {error}
            </div>
          )}

          {success && (
            <div
              id="form-success"
              className="bg-green-50 dark:bg-green-900/50 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 px-4 py-3 rounded-lg text-sm"
              role="status"
              aria-live="polite"
            >
              {success}
            </div>
          )}

          {/* Titulo */}
          <div>
            <label htmlFor="titulo" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Titulo del ticket <span className="text-red-500">*</span>
            </label>
            <input
              id="titulo"
              name="titulo"
              type="text"
              required
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                errorField === 'titulo' ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'
              }`}
              placeholder="Describe brevemente el problema"
              maxLength={200}
              aria-describedby={errorField === 'titulo' ? 'form-error titulo-hint' : 'titulo-hint'}
              aria-invalid={errorField === 'titulo' ? 'true' : undefined}
            />
            <p id="titulo-hint" className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Maximo 200 caracteres
            </p>
          </div>

          {/* Categoria */}
          <div>
            <label htmlFor="categoria" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Categoria (Sistema) <span className="text-red-500">*</span>
            </label>
            <select
              id="categoria"
              name="categoria"
              required
              value={categoriaId}
              onChange={(e) => setCategoriaId(e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                errorField === 'categoria' ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'
              }`}
              aria-describedby={errorField === 'categoria' ? 'form-error categoria-hint' : 'categoria-hint'}
              aria-invalid={errorField === 'categoria' ? 'true' : undefined}
            >
              <option value="">Seleccione una categoria</option>
              {demoCategorias.map((cat) => (
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
            <label htmlFor="prioridad" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Prioridad <span className="text-red-500">*</span>
            </label>
            <select
              id="prioridad"
              name="prioridad"
              required
              value={prioridad}
              onChange={(e) => setPrioridad(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
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
            <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Descripcion detallada <span className="text-red-500">*</span>
            </label>
            <textarea
              id="descripcion"
              name="descripcion"
              required
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 min-h-[150px] resize-y ${
                errorField === 'descripcion' ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'
              }`}
              placeholder="Describa el problema con el mayor detalle posible. Incluya pasos para reproducirlo, mensajes de error, etc."
              aria-describedby={errorField === 'descripcion' ? 'form-error descripcion-hint' : 'descripcion-hint'}
              aria-invalid={errorField === 'descripcion' ? 'true' : undefined}
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
              className="flex-1 py-3 px-4 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white font-medium rounded-lg transition-colors"
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
              onClick={() => window.history.back()}
              className="flex-1 py-3 px-4 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-medium rounded-lg transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>

        {/* Accessibility information */}
        <div className="mt-6 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <h2 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
            Informacion de Accesibilidad
          </h2>
          <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1 list-disc list-inside">
            <li>Todos los campos tienen etiquetas asociadas via htmlFor/id</li>
            <li>Los campos requeridos estan marcados con asterisco</li>
            <li>Cada campo tiene texto de ayuda con aria-describedby</li>
            <li>Los mensajes de error usan role="alert" y aria-live="assertive"</li>
            <li>Los mensajes de exito usan role="status" y aria-live="polite"</li>
            <li>Errores se asocian con campos via aria-describedby e id</li>
            <li>Campos con error tienen aria-invalid="true"</li>
            <li>Campos con error tienen borde rojo visual</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
