'use client';

import { useState, useEffect } from 'react';

// Demo page to test concurrency handling (Feature #143)
// This simulates two users editing the same ticket simultaneously

interface Ticket {
  id: number;
  titulo: string;
  descripcion: string;
  prioridad: string;
  estado: string;
  rowVersion: string;
}

export default function ConcurrencyDemoPage() {
  // Simulate two "sessions" with the same ticket data
  const [originalTicket] = useState<Ticket>({
    id: 1,
    titulo: 'Problema de sincronizacion',
    descripcion: 'El sistema no sincroniza los datos correctamente entre modulos.',
    prioridad: 'Media',
    estado: 'Abierto',
    rowVersion: 'AAAAAAAAAA1=' // Simulated initial version
  });

  // User A's view of the ticket (loaded first)
  const [userATicket, setUserATicket] = useState<Ticket>(originalTicket);
  const [userASaving, setUserASaving] = useState(false);
  const [userAMessage, setUserAMessage] = useState<{ type: 'success' | 'error' | 'conflict'; text: string } | null>(null);

  // User B's view of the ticket (loaded at same time)
  const [userBTicket, setUserBTicket] = useState<Ticket>(originalTicket);
  const [userBSaving, setUserBSaving] = useState(false);
  const [userBMessage, setUserBMessage] = useState<{ type: 'success' | 'error' | 'conflict'; text: string } | null>(null);

  // Server state (simulates database)
  const [serverTicket, setServerTicket] = useState<Ticket>(originalTicket);
  const [serverVersion, setServerVersion] = useState(1);

  const handleUserASave = async () => {
    setUserASaving(true);
    setUserAMessage(null);

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Check if version matches server
    if (userATicket.rowVersion !== serverTicket.rowVersion) {
      setUserAMessage({
        type: 'conflict',
        text: 'Este ticket ha sido modificado por otro usuario. Por favor, recargue la pagina e intente de nuevo.'
      });
      setUserASaving(false);
      return;
    }

    // Success - update server state
    const newVersion = serverVersion + 1;
    const newRowVersion = `AAAAAAAAAA${newVersion}=`;
    const updatedTicket = { ...userATicket, rowVersion: newRowVersion };

    setServerTicket(updatedTicket);
    setServerVersion(newVersion);
    setUserATicket(updatedTicket);
    setUserAMessage({
      type: 'success',
      text: 'Ticket actualizado exitosamente'
    });
    setUserASaving(false);
  };

  const handleUserBSave = async () => {
    setUserBSaving(true);
    setUserBMessage(null);

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Check if version matches server
    if (userBTicket.rowVersion !== serverTicket.rowVersion) {
      setUserBMessage({
        type: 'conflict',
        text: 'Este ticket ha sido modificado por otro usuario. Por favor, recargue la pagina e intente de nuevo.'
      });
      setUserBSaving(false);
      return;
    }

    // Success - update server state
    const newVersion = serverVersion + 1;
    const newRowVersion = `AAAAAAAAAA${newVersion}=`;
    const updatedTicket = { ...userBTicket, rowVersion: newRowVersion };

    setServerTicket(updatedTicket);
    setServerVersion(newVersion);
    setUserBTicket(updatedTicket);
    setUserBMessage({
      type: 'success',
      text: 'Ticket actualizado exitosamente'
    });
    setUserBSaving(false);
  };

  const handleUserAReload = () => {
    setUserATicket(serverTicket);
    setUserAMessage(null);
  };

  const handleUserBReload = () => {
    setUserBTicket(serverTicket);
    setUserBMessage(null);
  };

  const resetDemo = () => {
    setUserATicket(originalTicket);
    setUserBTicket(originalTicket);
    setServerTicket(originalTicket);
    setServerVersion(1);
    setUserAMessage(null);
    setUserBMessage(null);
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Demo: Concurrencia - Feature #143
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Prueba de manejo de edicion concurrente del mismo registro
          </p>
          <button
            onClick={resetDemo}
            className="mt-4 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600"
          >
            Reiniciar Demo
          </button>
        </div>

        {/* Server State Display */}
        <div className="mb-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <h2 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-2">
            Estado del Servidor (Base de Datos)
          </h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-blue-600 dark:text-blue-400 font-medium">Titulo:</span>{' '}
              <span className="text-gray-700 dark:text-gray-300">{serverTicket.titulo}</span>
            </div>
            <div>
              <span className="text-blue-600 dark:text-blue-400 font-medium">Prioridad:</span>{' '}
              <span className="text-gray-700 dark:text-gray-300">{serverTicket.prioridad}</span>
            </div>
            <div>
              <span className="text-blue-600 dark:text-blue-400 font-medium">RowVersion:</span>{' '}
              <code className="text-gray-700 dark:text-gray-300 bg-blue-100 dark:bg-blue-800/50 px-2 py-1 rounded">
                {serverTicket.rowVersion}
              </code>
            </div>
            <div>
              <span className="text-blue-600 dark:text-blue-400 font-medium">Version #:</span>{' '}
              <span className="text-gray-700 dark:text-gray-300">{serverVersion}</span>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="mb-8 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
          <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
            Instrucciones de prueba
          </h3>
          <ol className="list-decimal list-inside text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
            <li>Ambos usuarios (A y B) tienen el mismo ticket abierto para editar</li>
            <li>El Usuario A modifica el titulo y guarda primero</li>
            <li>El Usuario B modifica la prioridad e intenta guardar</li>
            <li>El Usuario B recibe un <strong>error de conflicto</strong> porque el ticket fue modificado</li>
            <li>El Usuario B debe recargar para obtener la version actual antes de poder guardar</li>
          </ol>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* User A Panel */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
            <div className="bg-green-500 text-white px-6 py-4">
              <h2 className="text-xl font-bold">Usuario A</h2>
              <p className="text-green-100 text-sm">Sesion del primer usuario</p>
            </div>
            <div className="p-6 space-y-4">
              {userAMessage && (
                <div
                  role="alert"
                  className={`p-4 rounded-md ${
                    userAMessage.type === 'success'
                      ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200 border border-green-200 dark:border-green-800'
                      : userAMessage.type === 'conflict'
                      ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-800 dark:text-orange-200 border border-orange-200 dark:border-orange-800'
                      : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-800'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {userAMessage.type === 'success' && <span>✅</span>}
                    {userAMessage.type === 'conflict' && <span>⚠️</span>}
                    {userAMessage.type === 'error' && <span>❌</span>}
                    <span>{userAMessage.text}</span>
                  </div>
                  {userAMessage.type === 'conflict' && (
                    <button
                      onClick={handleUserAReload}
                      className="mt-2 text-sm underline hover:no-underline"
                    >
                      Recargar datos actuales
                    </button>
                  )}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Titulo
                </label>
                <input
                  type="text"
                  value={userATicket.titulo}
                  onChange={(e) => setUserATicket({ ...userATicket, titulo: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Prioridad
                </label>
                <select
                  value={userATicket.prioridad}
                  onChange={(e) => setUserATicket({ ...userATicket, prioridad: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="Baja">Baja</option>
                  <option value="Media">Media</option>
                  <option value="Alta">Alta</option>
                </select>
              </div>

              <div className="text-xs text-gray-500 dark:text-gray-400">
                RowVersion local: <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">{userATicket.rowVersion}</code>
              </div>

              <button
                onClick={handleUserASave}
                disabled={userASaving}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {userASaving ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Guardando...
                  </>
                ) : (
                  'Guardar cambios'
                )}
              </button>
            </div>
          </div>

          {/* User B Panel */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
            <div className="bg-purple-500 text-white px-6 py-4">
              <h2 className="text-xl font-bold">Usuario B</h2>
              <p className="text-purple-100 text-sm">Sesion del segundo usuario</p>
            </div>
            <div className="p-6 space-y-4">
              {userBMessage && (
                <div
                  role="alert"
                  className={`p-4 rounded-md ${
                    userBMessage.type === 'success'
                      ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200 border border-green-200 dark:border-green-800'
                      : userBMessage.type === 'conflict'
                      ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-800 dark:text-orange-200 border border-orange-200 dark:border-orange-800'
                      : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-800'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {userBMessage.type === 'success' && <span>✅</span>}
                    {userBMessage.type === 'conflict' && <span>⚠️</span>}
                    {userBMessage.type === 'error' && <span>❌</span>}
                    <span>{userBMessage.text}</span>
                  </div>
                  {userBMessage.type === 'conflict' && (
                    <button
                      onClick={handleUserBReload}
                      className="mt-2 text-sm underline hover:no-underline"
                    >
                      Recargar datos actuales
                    </button>
                  )}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Titulo
                </label>
                <input
                  type="text"
                  value={userBTicket.titulo}
                  onChange={(e) => setUserBTicket({ ...userBTicket, titulo: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Prioridad
                </label>
                <select
                  value={userBTicket.prioridad}
                  onChange={(e) => setUserBTicket({ ...userBTicket, prioridad: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="Baja">Baja</option>
                  <option value="Media">Media</option>
                  <option value="Alta">Alta</option>
                </select>
              </div>

              <div className="text-xs text-gray-500 dark:text-gray-400">
                RowVersion local: <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">{userBTicket.rowVersion}</code>
              </div>

              <button
                onClick={handleUserBSave}
                disabled={userBSaving}
                className="w-full px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {userBSaving ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Guardando...
                  </>
                ) : (
                  'Guardar cambios'
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Technical Explanation */}
        <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Implementacion Tecnica
          </h3>
          <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
            <li><strong>Optimistic Locking:</strong> Usamos un campo RowVersion (timestamp) para detectar conflictos</li>
            <li><strong>Backend:</strong> El modelo Ticket tiene [Timestamp] RowVersion que EF Core maneja automaticamente</li>
            <li><strong>API:</strong> PUT /api/tickets/:id incluye el RowVersion y retorna HTTP 409 Conflict si hay conflicto</li>
            <li><strong>Frontend:</strong> Muestra mensaje claro y opcion de recargar cuando hay conflicto</li>
            <li><strong>UX:</strong> El usuario no pierde sus cambios - puede recargar y volver a aplicarlos</li>
          </ul>
        </div>

        <div className="mt-4 text-center">
          <a
            href="/demo"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            ← Volver a la demo principal
          </a>
        </div>
      </div>
    </div>
  );
}
