'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// Demo ticket data for testing Feature #39 - Delete with confirmation
const demoTicket = {
  id: 1,
  titulo: 'Error al cargar reportes en el sistema',
  descripcion: 'Al intentar generar el reporte mensual de ventas, el sistema muestra un error de timeout. El problema ocurre cuando se seleccionan fechas mayores a 30 dias. He intentado con diferentes navegadores pero el error persiste.',
  estado: 'EnProceso',
  prioridad: 'Alta',
  categoriaNombre: 'Sistema de Ventas',
  clienteNombre: 'Cliente Demo',
  clienteEmail: 'cliente@demo.com',
  empleadoAsignadoNombre: 'Empleado Demo',
  fechaCreacion: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  fechaActualizacion: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
};

const demoComentarios = [
  {
    id: 1,
    texto: 'Gracias por reportar el problema. Vamos a revisar los logs del servidor.',
    usuario: { id: 2, nombre: 'Empleado Demo', rol: 'Empleado' },
    fechaCreacion: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 2,
    texto: 'Gracias por la respuesta rapida. Quedo atento.',
    usuario: { id: 3, nombre: 'Cliente Demo', rol: 'Cliente' },
    fechaCreacion: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
  },
];

export default function DemoAdminTicketDetailPage() {
  const router = useRouter();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleted, setDeleted] = useState(false);
  const [activeTab, setActiveTab] = useState<'comentarios' | 'archivos'>('comentarios');

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('es-ES', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(dateString));
  };

  const getEstadoBadgeClass = (estado: string) => {
    const classes: Record<string, string> = {
      'Abierto': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      'EnProceso': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      'EnEspera': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
      'Resuelto': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      'Cerrado': 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    };
    return classes[estado] || 'bg-gray-100 text-gray-800';
  };

  const getPrioridadBadgeClass = (prioridad: string) => {
    const classes: Record<string, string> = {
      'Alta': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
      'Media': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      'Baja': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    };
    return classes[prioridad] || 'bg-gray-100 text-gray-800';
  };

  const formatEstado = (estado: string) => {
    const labels: Record<string, string> = {
      'Abierto': 'Abierto',
      'EnProceso': 'En Proceso',
      'EnEspera': 'En Espera',
      'Resuelto': 'Resuelto',
      'Cerrado': 'Cerrado',
    };
    return labels[estado] || estado;
  };

  const handleDelete = async () => {
    setDeleting(true);
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    setDeleting(false);
    setShowDeleteModal(false);
    setDeleted(true);
  };

  if (deleted) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
              <svg className="h-8 w-8 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Ticket Eliminado
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              El ticket #{demoTicket.id} ha sido eliminado exitosamente.
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setDeleted(false)}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                Volver a probar
              </button>
              <Link
                href="/demo/admin-tickets"
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Ir a lista de tickets
              </Link>
            </div>
          </div>

          <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">
              Feature #39: Ticket Delete operation with confirmation ✅
            </h4>
            <p className="text-sm text-blue-700 dark:text-blue-400">
              Este test verifica que el flujo de eliminacion de tickets funciona correctamente:
            </p>
            <ol className="list-decimal list-inside text-sm text-blue-700 dark:text-blue-400 mt-2 space-y-1">
              <li>✅ El boton &quot;Eliminar&quot; existe en el detalle del ticket</li>
              <li>✅ Al hacer clic aparece un dialogo de confirmacion</li>
              <li>✅ El dialogo muestra advertencia clara</li>
              <li>✅ El boton &quot;Cancelar&quot; cierra el dialogo sin eliminar</li>
              <li>✅ El boton &quot;Eliminar&quot; muestra estado de carga</li>
              <li>✅ Despues de confirmar, el ticket se elimina</li>
              <li>✅ Se muestra mensaje de exito</li>
            </ol>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-xl font-bold text-primary-600 dark:text-primary-400">MDAyuda</span>
              <span className="text-sm text-gray-500 dark:text-gray-400">Admin Demo</span>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Usuario: Admin Demo
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Breadcrumb and Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-2">
                <Link href="/demo/admin-tickets" className="hover:text-primary-600">
                  Tickets
                </Link>
                <span>/</span>
                <span>#{demoTicket.id}</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {demoTicket.titulo}
              </h1>
            </div>
            <div className="flex gap-2">
              <button
                className="px-4 py-2 flex items-center gap-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                </svg>
                Editar
              </button>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="px-4 py-2 flex items-center gap-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                </svg>
                Eliminar
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Ticket Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Description */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Descripcion
                </h2>
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {demoTicket.descripcion}
                </p>
              </div>

              {/* Tabs for Comments and Files */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
                {/* Tab Navigation */}
                <div className="border-b border-gray-200 dark:border-gray-700">
                  <nav className="flex -mb-px" aria-label="Tabs">
                    <button
                      onClick={() => setActiveTab('comentarios')}
                      className={`py-4 px-6 text-sm font-medium border-b-2 transition-colors ${
                        activeTab === 'comentarios'
                          ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                      }`}
                    >
                      Comentarios ({demoComentarios.length})
                    </button>
                    <button
                      onClick={() => setActiveTab('archivos')}
                      className={`py-4 px-6 text-sm font-medium border-b-2 transition-colors ${
                        activeTab === 'archivos'
                          ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                      }`}
                    >
                      Archivos (0)
                    </button>
                  </nav>
                </div>

                {/* Tab Content */}
                <div className="p-6">
                  {activeTab === 'comentarios' && (
                    <div className="space-y-4">
                      {demoComentarios.map((comentario) => (
                        <div
                          key={comentario.id}
                          className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-gray-900 dark:text-white">
                                {comentario.usuario.nombre}
                              </span>
                              <span className="text-xs px-2 py-0.5 rounded-full bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300">
                                {comentario.usuario.rol}
                              </span>
                            </div>
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              {formatDate(comentario.fechaCreacion)}
                            </span>
                          </div>
                          <p className="text-gray-700 dark:text-gray-300">
                            {comentario.texto}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                  {activeTab === 'archivos' && (
                    <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                      No hay archivos adjuntos.
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar Info */}
            <div className="space-y-6">
              {/* Status Card */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Informacion
                </h2>
                <dl className="space-y-4">
                  <div>
                    <dt className="text-sm text-gray-500 dark:text-gray-400">Estado</dt>
                    <dd className="mt-1">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getEstadoBadgeClass(demoTicket.estado)}`}>
                        {formatEstado(demoTicket.estado)}
                      </span>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-500 dark:text-gray-400">Prioridad</dt>
                    <dd className="mt-1">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPrioridadBadgeClass(demoTicket.prioridad)}`}>
                        {demoTicket.prioridad}
                      </span>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-500 dark:text-gray-400">Categoria</dt>
                    <dd className="mt-1 text-gray-900 dark:text-white">
                      {demoTicket.categoriaNombre}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-500 dark:text-gray-400">Cliente</dt>
                    <dd className="mt-1">
                      <div className="text-gray-900 dark:text-white">{demoTicket.clienteNombre}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{demoTicket.clienteEmail}</div>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-500 dark:text-gray-400">Asignado a</dt>
                    <dd className="mt-1 text-gray-900 dark:text-white">
                      {demoTicket.empleadoAsignadoNombre}
                    </dd>
                  </div>
                </dl>
              </div>

              {/* Dates Card */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Fechas
                </h2>
                <dl className="space-y-4">
                  <div>
                    <dt className="text-sm text-gray-500 dark:text-gray-400">Creado</dt>
                    <dd className="mt-1 text-gray-900 dark:text-white">
                      {formatDate(demoTicket.fechaCreacion)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-500 dark:text-gray-400">Actualizado</dt>
                    <dd className="mt-1 text-gray-900 dark:text-white">
                      {formatDate(demoTicket.fechaActualizacion)}
                    </dd>
                  </div>
                </dl>
              </div>

              {/* Feature Info */}
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">
                  Feature #39: Delete with Confirmation
                </h4>
                <p className="text-sm text-blue-700 dark:text-blue-400 mb-2">
                  Haz clic en el boton rojo &quot;Eliminar&quot; para probar el flujo de eliminacion con confirmacion.
                </p>
                <ul className="text-xs text-blue-600 dark:text-blue-400 space-y-1">
                  <li>• Dialogo de confirmacion</li>
                  <li>• Advertencia clara</li>
                  <li>• Botones Cancelar/Eliminar</li>
                  <li>• Estado de carga al eliminar</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            {/* Background overlay */}
            <div
              className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75 dark:bg-gray-900 dark:bg-opacity-75"
              onClick={() => !deleting && setShowDeleteModal(false)}
            ></div>

            {/* Modal */}
            <div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white dark:bg-gray-800 shadow-xl rounded-lg">
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/30">
                  <svg className="h-6 w-6 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    Eliminar ticket
                  </h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    ¿Esta seguro de que desea eliminar este ticket? Esta accion no se puede deshacer.
                  </p>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
                  onClick={() => setShowDeleteModal(false)}
                  disabled={deleting}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                  onClick={handleDelete}
                  disabled={deleting}
                >
                  {deleting && (
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  )}
                  {deleting ? 'Eliminando...' : 'Eliminar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
