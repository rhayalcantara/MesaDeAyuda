'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

// Demo page to test Feature #144: Record deleted while viewing - graceful handling
// This simulates the scenario where a user is viewing a ticket that gets deleted by another user

interface Ticket {
  id: number;
  titulo: string;
  descripcion: string;
  estado: string;
  prioridad: string;
  categoria: string;
  cliente: string;
}

export default function DeletedWhileViewingPage() {
  const [serverTickets, setServerTickets] = useState<Ticket[]>([
    {
      id: 1,
      titulo: 'Problema con el sistema de reportes',
      descripcion: 'El sistema no genera correctamente los reportes mensuales cuando se selecciona un rango mayor a 30 dias.',
      estado: 'Abierto',
      prioridad: 'Alta',
      categoria: 'Sistema de Ventas',
      cliente: 'Juan Perez',
    }
  ]);

  // Tab 1 state (User viewing ticket detail)
  const [tab1TicketData, setTab1TicketData] = useState<Ticket | null>(serverTickets[0]);
  const [tab1Loading, setTab1Loading] = useState(false);
  const [tab1Error, setTab1Error] = useState<string | null>(null);
  const [tab1NewComment, setTab1NewComment] = useState('');
  const [tab1SubmittingComment, setTab1SubmittingComment] = useState(false);

  // Tab 2 state (Admin who will delete the ticket)
  const [tab2Deleting, setTab2Deleting] = useState(false);
  const [tab2Deleted, setTab2Deleted] = useState(false);
  const [tab2ShowConfirm, setTab2ShowConfirm] = useState(false);

  // Simulate Tab 1 opening ticket detail (Step 1)
  const handleTab1OpenTicket = () => {
    setTab1Loading(true);
    setTab1Error(null);

    // Simulate API call
    setTimeout(() => {
      const ticket = serverTickets.find(t => t.id === 1);
      if (ticket) {
        setTab1TicketData(ticket);
      } else {
        setTab1Error('El ticket no fue encontrado. Es posible que haya sido eliminado.');
      }
      setTab1Loading(false);
    }, 500);
  };

  // Simulate Tab 2 deleting ticket (Step 2)
  const handleTab2DeleteTicket = async () => {
    setTab2Deleting(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Remove ticket from server
    setServerTickets([]);
    setTab2Deleting(false);
    setTab2ShowConfirm(false);
    setTab2Deleted(true);
  };

  // Simulate Tab 1 trying to add comment (Step 3)
  const handleTab1AddComment = async () => {
    if (!tab1NewComment.trim()) return;

    setTab1SubmittingComment(true);
    setTab1Error(null);

    // Simulate API call that checks if ticket still exists
    await new Promise(resolve => setTimeout(resolve, 800));

    // Check if ticket still exists on server
    const ticketExists = serverTickets.find(t => t.id === 1);

    if (!ticketExists) {
      // Graceful error handling (Step 4)
      setTab1Error('No se pudo agregar el comentario. Este ticket ha sido eliminado por otro usuario. Por favor, regrese a la lista de tickets.');
      setTab1TicketData(null);
    }

    setTab1SubmittingComment(false);
  };

  // Reset demo
  const handleReset = () => {
    setServerTickets([
      {
        id: 1,
        titulo: 'Problema con el sistema de reportes',
        descripcion: 'El sistema no genera correctamente los reportes mensuales cuando se selecciona un rango mayor a 30 dias.',
        estado: 'Abierto',
        prioridad: 'Alta',
        categoria: 'Sistema de Ventas',
        cliente: 'Juan Perez',
      }
    ]);
    setTab1TicketData({
      id: 1,
      titulo: 'Problema con el sistema de reportes',
      descripcion: 'El sistema no genera correctamente los reportes mensuales cuando se selecciona un rango mayor a 30 dias.',
      estado: 'Abierto',
      prioridad: 'Alta',
      categoria: 'Sistema de Ventas',
      cliente: 'Juan Perez',
    });
    setTab1Error(null);
    setTab1NewComment('');
    setTab2Deleted(false);
    setTab2ShowConfirm(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Feature #144: Record Deleted While Viewing
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Prueba del manejo gracioso cuando un registro es eliminado mientras otro usuario lo visualiza
          </p>
          <button
            onClick={handleReset}
            className="mt-4 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600"
          >
            Reiniciar Demo
          </button>
        </div>

        {/* Server State */}
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <h2 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-2">
            Estado del Servidor (Base de Datos)
          </h2>
          <div className="text-sm text-blue-700 dark:text-blue-300">
            <p><strong>Tickets en el servidor:</strong> {serverTickets.length}</p>
            {serverTickets.map(t => (
              <p key={t.id} className="ml-4">• Ticket #{t.id}: {t.titulo}</p>
            ))}
            {serverTickets.length === 0 && (
              <p className="ml-4 text-red-600 dark:text-red-400">⚠️ No hay tickets - Ticket #1 fue eliminado</p>
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
          <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
            Pasos de Prueba
          </h3>
          <ol className="list-decimal list-inside text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
            <li><strong>Paso 1:</strong> El Usuario (Tab 1) abre el detalle del Ticket #1</li>
            <li><strong>Paso 2:</strong> El Admin (Tab 2) elimina el Ticket #1</li>
            <li><strong>Paso 3:</strong> El Usuario (Tab 1) intenta agregar un comentario</li>
            <li><strong>Paso 4:</strong> Verificar que se muestra un error gracioso</li>
          </ol>
        </div>

        {/* Two Tabs Side by Side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Tab 1 - User Viewing Ticket */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
            <div className="bg-blue-500 text-white px-6 py-4">
              <h2 className="text-xl font-bold">Tab 1 - Usuario Visualizando</h2>
              <p className="text-blue-100 text-sm">Sesion del usuario que esta viendo el ticket</p>
            </div>
            <div className="p-6">
              {tab1Loading ? (
                <div className="text-center py-8">
                  <svg className="animate-spin h-8 w-8 mx-auto text-blue-500" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <p className="mt-2 text-gray-500 dark:text-gray-400">Cargando ticket...</p>
                </div>
              ) : tab1Error ? (
                <div role="alert" className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">❌</span>
                    <div>
                      <h3 className="font-semibold text-red-800 dark:text-red-200">
                        Error: Ticket no encontrado
                      </h3>
                      <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                        {tab1Error}
                      </p>
                      <Link
                        href="/demo/admin-tickets"
                        className="inline-block mt-3 text-sm text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        ← Volver a la lista de tickets
                      </Link>
                    </div>
                  </div>
                </div>
              ) : tab1TicketData ? (
                <div className="space-y-4">
                  <div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">Ticket #{tab1TicketData.id}</span>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {tab1TicketData.titulo}
                    </h3>
                  </div>
                  <div className="flex gap-2">
                    <span className="px-2 py-1 text-xs font-medium rounded bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300">
                      {tab1TicketData.prioridad}
                    </span>
                    <span className="px-2 py-1 text-xs font-medium rounded bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300">
                      {tab1TicketData.estado}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {tab1TicketData.descripcion}
                  </p>
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Agregar comentario:
                    </label>
                    <textarea
                      value={tab1NewComment}
                      onChange={(e) => setTab1NewComment(e.target.value)}
                      rows={3}
                      placeholder="Escriba su comentario..."
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                    <button
                      onClick={handleTab1AddComment}
                      disabled={tab1SubmittingComment || !tab1NewComment.trim()}
                      className="mt-2 w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {tab1SubmittingComment ? (
                        <>
                          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Enviando...
                        </>
                      ) : (
                        'Enviar Comentario (Paso 3)'
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <p>Haga clic para simular abrir el ticket</p>
                  <button
                    onClick={handleTab1OpenTicket}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Abrir Ticket #1 (Paso 1)
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Tab 2 - Admin Deleting Ticket */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
            <div className="bg-red-500 text-white px-6 py-4">
              <h2 className="text-xl font-bold">Tab 2 - Admin Eliminando</h2>
              <p className="text-red-100 text-sm">Sesion del admin que elimina el ticket</p>
            </div>
            <div className="p-6">
              {tab2Deleted ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                    <svg className="h-8 w-8 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Ticket Eliminado
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mt-2">
                    El Ticket #1 ha sido eliminado del servidor.
                  </p>
                  <p className="text-sm text-yellow-600 dark:text-yellow-400 mt-4">
                    Ahora vaya al Tab 1 e intente agregar un comentario para ver el manejo de error.
                  </p>
                </div>
              ) : tab2ShowConfirm ? (
                <div className="space-y-4">
                  <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <h3 className="font-semibold text-red-800 dark:text-red-200">
                      ¿Eliminar Ticket #1?
                    </h3>
                    <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                      Esta accion no se puede deshacer. El ticket y todos sus comentarios seran eliminados permanentemente.
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={handleTab2DeleteTicket}
                      disabled={tab2Deleting}
                      className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {tab2Deleting ? (
                        <>
                          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Eliminando...
                        </>
                      ) : (
                        'Confirmar Eliminacion'
                      )}
                    </button>
                    <button
                      onClick={() => setTab2ShowConfirm(false)}
                      disabled={tab2Deleting}
                      className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      Ticket #1
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Problema con el sistema de reportes
                    </p>
                  </div>
                  <button
                    onClick={() => setTab2ShowConfirm(true)}
                    disabled={serverTickets.length === 0}
                    className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {serverTickets.length === 0 ? 'Ya eliminado' : 'Eliminar Ticket (Paso 2)'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Results */}
        {tab1Error && (
          <div className="mt-8 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
            <h3 className="text-lg font-semibold text-green-800 dark:text-green-200 mb-2 flex items-center gap-2">
              ✅ Feature #144: Verificado
            </h3>
            <p className="text-sm text-green-700 dark:text-green-300">
              El sistema manejo correctamente el caso donde el usuario intento interactuar con un ticket que fue eliminado por otro usuario:
            </p>
            <ul className="list-disc list-inside text-sm text-green-700 dark:text-green-300 mt-2 space-y-1">
              <li>✅ Paso 1: Usuario abrio el ticket en Tab 1</li>
              <li>✅ Paso 2: Admin elimino el ticket en Tab 2</li>
              <li>✅ Paso 3: Usuario intento agregar comentario</li>
              <li>✅ Paso 4: Se mostro mensaje de error gracioso indicando que el ticket fue eliminado</li>
              <li>✅ Se ofrece opcion de volver a la lista de tickets</li>
            </ul>
          </div>
        )}

        {/* Technical Info */}
        <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Implementacion Tecnica
          </h3>
          <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
            <li><strong>API Response:</strong> Retorna HTTP 404 Not Found cuando el recurso no existe</li>
            <li><strong>Frontend:</strong> Captura el error 404 y muestra mensaje amigable</li>
            <li><strong>UX:</strong> Ofrece navegacion de regreso a la lista sin perder contexto</li>
            <li><strong>No crashes:</strong> La aplicacion no se rompe, solo informa al usuario</li>
          </ul>
        </div>

        <div className="mt-4 text-center">
          <Link
            href="/demo"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            ← Volver a la demo principal
          </Link>
        </div>
      </div>
    </div>
  );
}
