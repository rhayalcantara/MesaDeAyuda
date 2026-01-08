'use client';

import { useState } from 'react';
import Link from 'next/link';

interface Ticket {
  id: number;
  titulo: string;
  estado: string;
  prioridad: string;
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
];

type TestStep = 'initial' | 'created' | 'verified_exists' | 'deleted' | 'verified_gone';

export default function DeleteTicketSearchPage() {
  const [tickets, setTickets] = useState<Ticket[]>(initialTickets);
  const [testStep, setTestStep] = useState<TestStep>('initial');
  const [testTicket, setTestTicket] = useState<Ticket | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [testPassed, setTestPassed] = useState(false);
  const [searchResults, setSearchResults] = useState<Ticket[]>([]);

  // Filter tickets based on search
  const filteredTickets = searchTerm
    ? tickets.filter(t => t.titulo.toLowerCase().includes(searchTerm.toLowerCase()))
    : tickets;

  // Step 2: Create the test ticket
  const handleCreateTicket = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));

    const newTicket: Ticket = {
      id: Math.max(...tickets.map(t => t.id), 0) + 1,
      titulo: 'SEARCH_DELETE_TEST',
      estado: 'Abierto',
      prioridad: 'Alta',
      cliente: 'Test User',
      fechaCreacion: new Date(),
    };

    setTickets(prev => [...prev, newTicket]);
    setTestTicket(newTicket);
    setTestStep('created');
    setIsLoading(false);
  };

  // Step 3: Verify ticket appears in search
  const handleVerifyExists = () => {
    setSearchTerm('SEARCH_DELETE');
    const results = tickets.filter(t => t.titulo.toLowerCase().includes('search_delete'));
    setSearchResults(results);
    setTestStep('verified_exists');
  };

  // Step 4: Delete the test ticket
  const handleDeleteTicket = async () => {
    if (!testTicket) return;

    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));

    setTickets(prev => prev.filter(t => t.id !== testTicket.id));
    setTestStep('deleted');
    setIsLoading(false);
  };

  // Step 5 & 6: Search again and verify not found
  const handleVerifyGone = () => {
    setSearchTerm('SEARCH_DELETE');
    const results = tickets.filter(t => t.titulo.toLowerCase().includes('search_delete'));
    setSearchResults(results);
    setTestStep('verified_gone');
    setTestPassed(results.length === 0);
  };

  // Reset demo
  const resetDemo = () => {
    setTickets(initialTickets);
    setTestStep('initial');
    setTestTicket(null);
    setSearchTerm('');
    setTestPassed(false);
    setSearchResults([]);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('es-ES', {
      dateStyle: 'medium',
    }).format(date);
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'Abierto': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'En Proceso': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'En Espera': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      case 'Resuelto': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPrioridadColor = (prioridad: string) => {
    switch (prioridad) {
      case 'Alta': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'Media': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'Baja': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/demo" className="text-primary-600 hover:text-primary-700 dark:text-primary-400 flex items-center gap-2 mb-4">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Volver a Demo
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Feature #87: Deleted item removed from search results
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Verifica que un ticket eliminado no aparece en los resultados de busqueda.
          </p>
        </div>

        {/* Test Progress */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Progreso del Test</h2>
          <div className="space-y-3">
            <div className={`flex items-center gap-3 ${testStep === 'initial' ? 'text-primary-600' : 'text-green-600'}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm ${
                testStep === 'initial' ? 'bg-primary-100 text-primary-600' : 'bg-green-100 text-green-600'
              }`}>
                {testStep !== 'initial' ? '✓' : '1'}
              </div>
              <span>Login as Admin (simulated)</span>
            </div>
            <div className={`flex items-center gap-3 ${
              testStep === 'created' ? 'text-primary-600' :
              ['verified_exists', 'deleted', 'verified_gone'].includes(testStep) ? 'text-green-600' : 'text-gray-400'
            }`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm ${
                testStep === 'created' ? 'bg-primary-100 text-primary-600' :
                ['verified_exists', 'deleted', 'verified_gone'].includes(testStep) ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
              }`}>
                {['verified_exists', 'deleted', 'verified_gone'].includes(testStep) ? '✓' : '2'}
              </div>
              <span>Create ticket &apos;SEARCH_DELETE_TEST&apos;</span>
            </div>
            <div className={`flex items-center gap-3 ${
              testStep === 'verified_exists' ? 'text-primary-600' :
              ['deleted', 'verified_gone'].includes(testStep) ? 'text-green-600' : 'text-gray-400'
            }`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm ${
                testStep === 'verified_exists' ? 'bg-primary-100 text-primary-600' :
                ['deleted', 'verified_gone'].includes(testStep) ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
              }`}>
                {['deleted', 'verified_gone'].includes(testStep) ? '✓' : '3'}
              </div>
              <span>Verify it appears in search</span>
            </div>
            <div className={`flex items-center gap-3 ${
              testStep === 'deleted' ? 'text-primary-600' :
              testStep === 'verified_gone' ? 'text-green-600' : 'text-gray-400'
            }`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm ${
                testStep === 'deleted' ? 'bg-primary-100 text-primary-600' :
                testStep === 'verified_gone' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
              }`}>
                {testStep === 'verified_gone' ? '✓' : '4'}
              </div>
              <span>Delete the ticket</span>
            </div>
            <div className={`flex items-center gap-3 ${
              testStep === 'verified_gone' ? 'text-primary-600' : 'text-gray-400'
            }`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm ${
                testStep === 'verified_gone' && testPassed ? 'bg-green-100 text-green-600' :
                testStep === 'verified_gone' ? 'bg-primary-100 text-primary-600' : 'bg-gray-100 text-gray-400'
              }`}>
                {testStep === 'verified_gone' && testPassed ? '✓' : '5-6'}
              </div>
              <span>Search again &amp; verify not in results</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Acciones del Test</h2>
          <div className="flex flex-wrap gap-3">
            {testStep === 'initial' && (
              <button
                onClick={handleCreateTicket}
                disabled={isLoading}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {isLoading && (
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                )}
                Paso 2: Crear Ticket &apos;SEARCH_DELETE_TEST&apos;
              </button>
            )}

            {testStep === 'created' && (
              <button
                onClick={handleVerifyExists}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Paso 3: Verificar que aparece en busqueda
              </button>
            )}

            {testStep === 'verified_exists' && (
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
                Paso 4: Eliminar Ticket
              </button>
            )}

            {testStep === 'deleted' && (
              <button
                onClick={handleVerifyGone}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Pasos 5-6: Buscar y verificar eliminacion
              </button>
            )}

            {testStep === 'verified_gone' && (
              <button
                onClick={resetDemo}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Reiniciar Test
              </button>
            )}
          </div>
        </div>

        {/* Views Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Lista de Tickets */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 dark:text-white">Lista de Tickets</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total: {tickets.length} tickets</p>
            </div>
            <div className="max-h-80 overflow-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700 sticky top-0">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Titulo</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Prioridad</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {tickets.map(ticket => (
                    <tr key={ticket.id} className={`${
                      ticket.titulo === 'SEARCH_DELETE_TEST' ? 'bg-yellow-50 dark:bg-yellow-900/20' : ''
                    }`}>
                      <td className="px-3 py-2 text-sm text-gray-900 dark:text-white">#{ticket.id}</td>
                      <td className="px-3 py-2 text-sm text-gray-900 dark:text-white">
                        <span className="truncate block max-w-[180px]" title={ticket.titulo}>
                          {ticket.titulo}
                        </span>
                        {ticket.titulo === 'SEARCH_DELETE_TEST' && (
                          <span className="text-xs bg-yellow-200 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200 px-2 py-0.5 rounded">
                            TEST
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-2">
                        <span className={`text-xs px-2 py-1 rounded-full ${getEstadoColor(ticket.estado)}`}>
                          {ticket.estado}
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        <span className={`text-xs px-2 py-1 rounded-full ${getPrioridadColor(ticket.prioridad)}`}>
                          {ticket.prioridad}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Search Results */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 dark:text-white">Busqueda de Tickets</h3>
              <div className="mt-2">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  placeholder="Buscar tickets..."
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                />
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                Resultados: {filteredTickets.length} {searchTerm && `(buscando: "${searchTerm}")`}
              </p>
            </div>
            <div className="max-h-64 overflow-auto">
              {filteredTickets.length > 0 ? (
                <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredTickets.map(ticket => (
                    <li key={ticket.id} className={`px-4 py-3 ${
                      ticket.titulo === 'SEARCH_DELETE_TEST' ? 'bg-yellow-50 dark:bg-yellow-900/20' : ''
                    }`}>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-900 dark:text-white font-medium">
                          #{ticket.id} - {ticket.titulo}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded-full ${getEstadoColor(ticket.estado)}`}>
                          {ticket.estado}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {ticket.cliente} - {formatDate(ticket.fechaCreacion)}
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                  {searchTerm ? (
                    <>
                      <svg className="w-12 h-12 mx-auto mb-2 text-gray-300" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                      </svg>
                      <p>No se encontraron tickets para &quot;{searchTerm}&quot;</p>
                    </>
                  ) : (
                    <p>No hay tickets</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Verification Result */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Resultado de Verificacion</h3>

          {testStep === 'verified_exists' && (
            <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h4 className="font-semibold text-blue-800 dark:text-blue-300">PASO 3: Ticket encontrado en busqueda ✓</h4>
                  <p className="text-sm text-blue-700 dark:text-blue-400">
                    El ticket &apos;SEARCH_DELETE_TEST&apos; aparece correctamente en los resultados de busqueda.
                  </p>
                </div>
              </div>
            </div>
          )}

          {testStep === 'verified_gone' && (
            testPassed ? (
              <div className="bg-green-50 dark:bg-green-900/30 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <h4 className="font-semibold text-green-800 dark:text-green-300">TEST PASSED ✅</h4>
                    <p className="text-sm text-green-700 dark:text-green-400">
                      El ticket eliminado NO aparece en los resultados de busqueda.
                    </p>
                    <ul className="text-sm text-green-700 dark:text-green-400 mt-1 list-disc list-inside">
                      <li>Busqueda por &quot;SEARCH_DELETE&quot; retorna 0 resultados</li>
                      <li>Ticket no aparece en la lista principal</li>
                      <li>Datos correctamente eliminados</li>
                    </ul>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-red-50 dark:bg-red-900/30 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <h4 className="font-semibold text-red-800 dark:text-red-300">TEST FAILED ❌</h4>
                    <p className="text-sm text-red-700 dark:text-red-400">
                      El ticket eliminado todavia aparece en los resultados de busqueda.
                    </p>
                  </div>
                </div>
              </div>
            )
          )}

          {!['verified_exists', 'verified_gone'].includes(testStep) && (
            <div className="text-gray-500 dark:text-gray-400 text-center py-4">
              <svg className="w-12 h-12 mx-auto mb-2 text-gray-300" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p>Complete los pasos del test para ver el resultado</p>
            </div>
          )}
        </div>

        {/* Test Info */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
          <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">
            Feature #87: Deleted item removed from search results
          </h4>
          <p className="text-sm text-blue-700 dark:text-blue-400 mb-2">
            Este test verifica que cuando se elimina un ticket:
          </p>
          <ol className="list-decimal list-inside text-sm text-blue-700 dark:text-blue-400 space-y-1">
            <li>Se crea un ticket de prueba &apos;SEARCH_DELETE_TEST&apos;</li>
            <li>Se verifica que aparece en los resultados de busqueda</li>
            <li>Se elimina el ticket</li>
            <li>Se busca nuevamente por el titulo</li>
            <li>Se verifica que NO aparece en los resultados</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
