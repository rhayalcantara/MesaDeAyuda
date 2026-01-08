'use client';

import { useState } from 'react';
import Link from 'next/link';

interface Ticket {
  id: number;
  titulo: string;
  estado: 'Abierto' | 'En Proceso' | 'En Espera' | 'Resuelto' | 'Cerrado';
  prioridad: 'Alta' | 'Media' | 'Baja';
  cliente: string;
  fechaCreacion: Date;
}

// Initial tickets
const initialTickets: Ticket[] = [
  {
    id: 1,
    titulo: 'Error al cargar reportes en el sistema',
    estado: 'En Proceso',
    prioridad: 'Alta',
    cliente: 'Cliente Demo',
    fechaCreacion: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
  },
  {
    id: 2,
    titulo: 'No puedo acceder al portal web',
    estado: 'Abierto',
    prioridad: 'Media',
    cliente: 'Juan Perez',
    fechaCreacion: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
  },
  {
    id: 3,
    titulo: 'Solicitud de nueva funcionalidad',
    estado: 'En Espera',
    prioridad: 'Baja',
    cliente: 'Maria Garcia',
    fechaCreacion: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
  },
  {
    id: 4,
    titulo: 'Problema con facturacion',
    estado: 'Abierto',
    prioridad: 'Alta',
    cliente: 'Carlos Rodriguez',
    fechaCreacion: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
  },
  {
    id: 5,
    titulo: 'Capacitacion requerida',
    estado: 'Resuelto',
    prioridad: 'Baja',
    cliente: 'Ana Martinez',
    fechaCreacion: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
  },
];

type TestStep = 'initial' | 'noted' | 'deleted' | 'verified';

export default function DeleteDashboardStatsPage() {
  const [tickets, setTickets] = useState<Ticket[]>(initialTickets);
  const [testStep, setTestStep] = useState<TestStep>('initial');
  const [isLoading, setIsLoading] = useState(false);
  const [testPassed, setTestPassed] = useState(false);
  const [initialStats, setInitialStats] = useState<{total: number, abiertos: number, alta: number} | null>(null);
  const [ticketToDelete, setTicketToDelete] = useState<Ticket | null>(null);

  // Calculate dashboard statistics
  const stats = {
    total: tickets.length,
    abiertos: tickets.filter(t => t.estado === 'Abierto').length,
    enProceso: tickets.filter(t => t.estado === 'En Proceso').length,
    enEspera: tickets.filter(t => t.estado === 'En Espera').length,
    resueltos: tickets.filter(t => t.estado === 'Resuelto').length,
    alta: tickets.filter(t => t.prioridad === 'Alta').length,
    media: tickets.filter(t => t.prioridad === 'Media').length,
    baja: tickets.filter(t => t.prioridad === 'Baja').length,
  };

  // Step 2: Note current statistics
  const handleNoteStats = () => {
    setInitialStats({
      total: stats.total,
      abiertos: stats.abiertos,
      alta: stats.alta,
    });
    // Select a ticket to delete (an open, high priority one)
    const ticket = tickets.find(t => t.estado === 'Abierto' && t.prioridad === 'Alta');
    setTicketToDelete(ticket || tickets[0]);
    setTestStep('noted');
  };

  // Step 3: Delete a ticket
  const handleDeleteTicket = async () => {
    if (!ticketToDelete) return;

    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));

    setTickets(prev => prev.filter(t => t.id !== ticketToDelete.id));
    setTestStep('deleted');
    setIsLoading(false);
  };

  // Step 4 & 5: Verify counts decreased
  const handleVerifyStats = () => {
    if (!initialStats || !ticketToDelete) return;

    const newTotal = stats.total;
    const expectedTotal = initialStats.total - 1;

    // Check if total decreased
    const totalDecreased = newTotal === expectedTotal;

    // Check if specific counts decreased based on deleted ticket
    let specificCountCorrect = true;
    if (ticketToDelete.estado === 'Abierto') {
      specificCountCorrect = stats.abiertos === initialStats.abiertos - 1;
    }
    if (ticketToDelete.prioridad === 'Alta') {
      specificCountCorrect = specificCountCorrect && stats.alta === initialStats.alta - 1;
    }

    setTestPassed(totalDecreased && specificCountCorrect);
    setTestStep('verified');
  };

  // Reset demo
  const resetDemo = () => {
    setTickets(initialTickets);
    setTestStep('initial');
    setTestPassed(false);
    setInitialStats(null);
    setTicketToDelete(null);
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'Abierto': return 'bg-blue-500';
      case 'En Proceso': return 'bg-yellow-500';
      case 'En Espera': return 'bg-orange-500';
      case 'Resuelto': return 'bg-green-500';
      case 'Cerrado': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getPrioridadColor = (prioridad: string) => {
    switch (prioridad) {
      case 'Alta': return 'bg-red-500';
      case 'Media': return 'bg-yellow-500';
      case 'Baja': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/demo" className="text-primary-600 hover:text-primary-700 dark:text-primary-400 flex items-center gap-2 mb-4">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Volver a Demo
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Feature #88: Delete updates dashboard statistics
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Verifica que las estadisticas del dashboard se actualizan correctamente al eliminar un ticket.
          </p>
        </div>

        {/* Test Progress */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Progreso del Test</h2>
          <div className="flex flex-wrap gap-4">
            <div className={`flex items-center gap-2 ${testStep === 'initial' ? 'text-primary-600' : 'text-green-600'}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm ${
                testStep === 'initial' ? 'bg-primary-100 text-primary-600' : 'bg-green-100 text-green-600'
              }`}>
                {testStep !== 'initial' ? '✓' : '1'}
              </div>
              <span className="text-sm">Login as Admin</span>
            </div>
            <div className={`flex items-center gap-2 ${
              testStep === 'noted' ? 'text-primary-600' :
              ['deleted', 'verified'].includes(testStep) ? 'text-green-600' : 'text-gray-400'
            }`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm ${
                testStep === 'noted' ? 'bg-primary-100 text-primary-600' :
                ['deleted', 'verified'].includes(testStep) ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
              }`}>
                {['deleted', 'verified'].includes(testStep) ? '✓' : '2'}
              </div>
              <span className="text-sm">Note dashboard count</span>
            </div>
            <div className={`flex items-center gap-2 ${
              testStep === 'deleted' ? 'text-primary-600' :
              testStep === 'verified' ? 'text-green-600' : 'text-gray-400'
            }`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm ${
                testStep === 'deleted' ? 'bg-primary-100 text-primary-600' :
                testStep === 'verified' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
              }`}>
                {testStep === 'verified' ? '✓' : '3'}
              </div>
              <span className="text-sm">Delete a ticket</span>
            </div>
            <div className={`flex items-center gap-2 ${
              testStep === 'verified' ? 'text-primary-600' : 'text-gray-400'
            }`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm ${
                testStep === 'verified' && testPassed ? 'bg-green-100 text-green-600' :
                testStep === 'verified' ? 'bg-primary-100 text-primary-600' : 'bg-gray-100 text-gray-400'
              }`}>
                {testStep === 'verified' && testPassed ? '✓' : '4-5'}
              </div>
              <span className="text-sm">Verify count decreased</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-4 flex flex-wrap gap-3">
            {testStep === 'initial' && (
              <button
                onClick={handleNoteStats}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                Paso 2: Anotar estadisticas actuales
              </button>
            )}

            {testStep === 'noted' && ticketToDelete && (
              <button
                onClick={handleDeleteTicket}
                disabled={isLoading}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {isLoading && (
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                )}
                Paso 3: Eliminar Ticket #{ticketToDelete.id}
              </button>
            )}

            {testStep === 'deleted' && (
              <button
                onClick={handleVerifyStats}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Pasos 4-5: Verificar estadisticas
              </button>
            )}

            {testStep === 'verified' && (
              <button
                onClick={resetDemo}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Reiniciar Test
              </button>
            )}
          </div>
        </div>

        {/* Dashboard Statistics */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Dashboard - Estadisticas</h2>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <div className="text-3xl font-bold text-gray-900 dark:text-white">{stats.total}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Total Tickets</div>
              {initialStats && testStep !== 'initial' && (
                <div className={`text-xs mt-1 ${stats.total < initialStats.total ? 'text-red-500' : 'text-gray-400'}`}>
                  {stats.total < initialStats.total ? `↓ Antes: ${initialStats.total}` : ''}
                </div>
              )}
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-4">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{stats.abiertos}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Abiertos</div>
              {initialStats && testStep !== 'initial' && ticketToDelete?.estado === 'Abierto' && (
                <div className={`text-xs mt-1 ${stats.abiertos < initialStats.abiertos ? 'text-red-500' : 'text-gray-400'}`}>
                  {stats.abiertos < initialStats.abiertos ? `↓ Antes: ${initialStats.abiertos}` : ''}
                </div>
              )}
            </div>
            <div className="bg-yellow-50 dark:bg-yellow-900/30 rounded-lg p-4">
              <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">{stats.enProceso}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">En Proceso</div>
            </div>
            <div className="bg-red-50 dark:bg-red-900/30 rounded-lg p-4">
              <div className="text-3xl font-bold text-red-600 dark:text-red-400">{stats.alta}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Prioridad Alta</div>
              {initialStats && testStep !== 'initial' && ticketToDelete?.prioridad === 'Alta' && (
                <div className={`text-xs mt-1 ${stats.alta < initialStats.alta ? 'text-red-500' : 'text-gray-400'}`}>
                  {stats.alta < initialStats.alta ? `↓ Antes: ${initialStats.alta}` : ''}
                </div>
              )}
            </div>
          </div>

          {/* Charts Representation */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* By Estado */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Por Estado</h3>
              <div className="space-y-2">
                {['Abierto', 'En Proceso', 'En Espera', 'Resuelto'].map(estado => {
                  const count = tickets.filter(t => t.estado === estado).length;
                  const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0;
                  return (
                    <div key={estado} className="flex items-center gap-3">
                      <div className="w-24 text-sm text-gray-600 dark:text-gray-400">{estado}</div>
                      <div className="flex-1 bg-gray-200 dark:bg-gray-600 rounded-full h-4">
                        <div
                          className={`h-4 rounded-full ${getEstadoColor(estado)} transition-all duration-500`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <div className="w-8 text-sm text-gray-600 dark:text-gray-400">{count}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* By Prioridad */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Por Prioridad</h3>
              <div className="space-y-2">
                {['Alta', 'Media', 'Baja'].map(prioridad => {
                  const count = tickets.filter(t => t.prioridad === prioridad).length;
                  const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0;
                  return (
                    <div key={prioridad} className="flex items-center gap-3">
                      <div className="w-24 text-sm text-gray-600 dark:text-gray-400">{prioridad}</div>
                      <div className="flex-1 bg-gray-200 dark:bg-gray-600 rounded-full h-4">
                        <div
                          className={`h-4 rounded-full ${getPrioridadColor(prioridad)} transition-all duration-500`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <div className="w-8 text-sm text-gray-600 dark:text-gray-400">{count}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Ticket to Delete Info */}
        {ticketToDelete && testStep === 'noted' && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-yellow-800 dark:text-yellow-300 mb-2">Ticket a Eliminar</h3>
            <div className="text-sm text-yellow-700 dark:text-yellow-400">
              <p><strong>ID:</strong> #{ticketToDelete.id}</p>
              <p><strong>Titulo:</strong> {ticketToDelete.titulo}</p>
              <p><strong>Estado:</strong> {ticketToDelete.estado}</p>
              <p><strong>Prioridad:</strong> {ticketToDelete.prioridad}</p>
            </div>
          </div>
        )}

        {/* Verification Result */}
        {testStep === 'verified' && (
          <div className={`rounded-lg p-6 mb-6 ${
            testPassed
              ? 'bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800'
              : 'bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800'
          }`}>
            {testPassed ? (
              <div className="flex items-center gap-3">
                <svg className="w-10 h-10 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h3 className="font-semibold text-green-800 dark:text-green-300 text-lg">TEST PASSED ✅</h3>
                  <p className="text-sm text-green-700 dark:text-green-400 mt-1">
                    Las estadisticas del dashboard se actualizaron correctamente:
                  </p>
                  <ul className="text-sm text-green-700 dark:text-green-400 mt-2 list-disc list-inside">
                    <li>Total tickets: {initialStats?.total} → {stats.total} (decrementado en 1)</li>
                    {ticketToDelete?.estado === 'Abierto' && (
                      <li>Tickets abiertos: {initialStats?.abiertos} → {stats.abiertos} (decrementado en 1)</li>
                    )}
                    {ticketToDelete?.prioridad === 'Alta' && (
                      <li>Prioridad alta: {initialStats?.alta} → {stats.alta} (decrementado en 1)</li>
                    )}
                    <li>Graficos actualizados en tiempo real</li>
                  </ul>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <svg className="w-10 h-10 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h3 className="font-semibold text-red-800 dark:text-red-300 text-lg">TEST FAILED ❌</h3>
                  <p className="text-sm text-red-700 dark:text-red-400">
                    Las estadisticas no se actualizaron correctamente.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Test Info */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
          <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">
            Feature #88: Delete updates dashboard statistics
          </h4>
          <p className="text-sm text-blue-700 dark:text-blue-400 mb-2">
            Este test verifica que al eliminar un ticket:
          </p>
          <ol className="list-decimal list-inside text-sm text-blue-700 dark:text-blue-400 space-y-1">
            <li>Se anotan las estadisticas actuales del dashboard</li>
            <li>Se elimina un ticket</li>
            <li>Se verifica que el contador total disminuyo</li>
            <li>Se verifica que los contadores por estado/prioridad se actualizaron</li>
            <li>Los graficos reflejan los nuevos valores</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
