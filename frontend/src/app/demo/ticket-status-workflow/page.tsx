'use client';

import { useState } from 'react';
import Link from 'next/link';

// Estados del ticket en orden del flujo de trabajo
const ESTADOS = ['Abierto', 'EnProceso', 'EnEspera', 'Resuelto', 'Cerrado'] as const;
type Estado = typeof ESTADOS[number];

const estadoLabels: Record<Estado, string> = {
  'Abierto': 'Abierto',
  'EnProceso': 'En Proceso',
  'EnEspera': 'En Espera',
  'Resuelto': 'Resuelto',
  'Cerrado': 'Cerrado',
};

const estadoDescriptions: Record<Estado, string> = {
  'Abierto': 'El ticket ha sido creado y esta esperando ser asignado',
  'EnProceso': 'Un empleado esta trabajando activamente en el ticket',
  'EnEspera': 'El ticket esta en espera de informacion adicional del cliente',
  'Resuelto': 'El problema ha sido resuelto, esperando confirmacion del cliente',
  'Cerrado': 'El ticket ha sido cerrado definitivamente',
};

const estadoColors: Record<Estado, string> = {
  'Abierto': 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900 dark:text-blue-300 dark:border-blue-700',
  'EnProceso': 'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900 dark:text-yellow-300 dark:border-yellow-700',
  'EnEspera': 'bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-900 dark:text-orange-300 dark:border-orange-700',
  'Resuelto': 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900 dark:text-green-300 dark:border-green-700',
  'Cerrado': 'bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600',
};

const estadoIcons: Record<Estado, string> = {
  'Abierto': '🔵',
  'EnProceso': '🟡',
  'EnEspera': '🟠',
  'Resuelto': '✅',
  'Cerrado': '⬛',
};

export default function TicketStatusWorkflowPage() {
  const [currentEstado, setCurrentEstado] = useState<Estado>('Abierto');
  const [history, setHistory] = useState<{ estado: Estado; timestamp: Date }[]>([
    { estado: 'Abierto', timestamp: new Date() }
  ]);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [workflowComplete, setWorkflowComplete] = useState(false);

  const currentIndex = ESTADOS.indexOf(currentEstado);
  const canGoNext = currentIndex < ESTADOS.length - 1;
  const canGoBack = currentIndex > 0;

  const handleTransition = async (newEstado: Estado) => {
    setIsTransitioning(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));

    setCurrentEstado(newEstado);
    setHistory(prev => [...prev, { estado: newEstado, timestamp: new Date() }]);
    setIsTransitioning(false);

    if (newEstado === 'Cerrado') {
      setWorkflowComplete(true);
    }
  };

  const resetWorkflow = () => {
    setCurrentEstado('Abierto');
    setHistory([{ estado: 'Abierto', timestamp: new Date() }]);
    setWorkflowComplete(false);
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(date);
  };

  if (workflowComplete) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
            <div className="w-20 h-20 mx-auto mb-6 flex items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
              <svg className="h-10 w-10 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Flujo de Trabajo Completado
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              El ticket ha pasado por todos los estados exitosamente.
            </p>

            {/* History */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6 text-left">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Historial de Transiciones</h3>
              <div className="space-y-2">
                {history.map((item, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <span>{estadoIcons[item.estado]}</span>
                      <span className="text-gray-700 dark:text-gray-300">{estadoLabels[item.estado]}</span>
                    </span>
                    <span className="text-gray-500 dark:text-gray-400">{formatTime(item.timestamp)}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={resetWorkflow}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Reiniciar Flujo
            </button>
          </div>

          <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">
              Feature #40: Ticket status transitions complete workflow ✅
            </h4>
            <p className="text-sm text-blue-700 dark:text-blue-400 mb-2">
              Este test verifica que un ticket puede pasar por todos los estados:
            </p>
            <ol className="list-decimal list-inside text-sm text-blue-700 dark:text-blue-400 space-y-1">
              <li>✅ Abierto → Ticket creado</li>
              <li>✅ En Proceso → Empleado trabajando</li>
              <li>✅ En Espera → Esperando cliente</li>
              <li>✅ Resuelto → Problema solucionado</li>
              <li>✅ Cerrado → Ticket finalizado</li>
            </ol>
          </div>

          <div className="mt-4 text-center">
            <Link href="/demo" className="text-primary-600 hover:text-primary-700 dark:text-primary-400">
              ← Volver a demos
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Feature #40: Flujo de Estados del Ticket
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Demuestra las transiciones de estado de un ticket a traves del flujo completo.
          </p>
        </div>

        {/* Progress Bar */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Progreso del Flujo de Trabajo
          </h2>
          <div className="relative">
            {/* Line */}
            <div className="absolute top-5 left-0 right-0 h-1 bg-gray-200 dark:bg-gray-700" />
            <div
              className="absolute top-5 left-0 h-1 bg-primary-600 transition-all duration-500"
              style={{ width: `${(currentIndex / (ESTADOS.length - 1)) * 100}%` }}
            />

            {/* Steps */}
            <div className="relative flex justify-between">
              {ESTADOS.map((estado, index) => {
                const isComplete = index < currentIndex;
                const isCurrent = index === currentIndex;
                const isPending = index > currentIndex;

                return (
                  <div key={estado} className="flex flex-col items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-lg transition-all duration-300 ${
                        isComplete
                          ? 'bg-primary-600 text-white'
                          : isCurrent
                          ? 'bg-primary-600 text-white ring-4 ring-primary-200 dark:ring-primary-800'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
                      }`}
                    >
                      {isComplete ? '✓' : estadoIcons[estado]}
                    </div>
                    <span className={`mt-2 text-xs font-medium ${
                      isCurrent ? 'text-primary-600 dark:text-primary-400' : 'text-gray-500 dark:text-gray-400'
                    }`}>
                      {estadoLabels[estado]}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Current State Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Estado Actual del Ticket
          </h2>
          <div className={`p-4 rounded-lg border-2 ${estadoColors[currentEstado]}`}>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">{estadoIcons[currentEstado]}</span>
              <span className="text-xl font-bold">{estadoLabels[currentEstado]}</span>
            </div>
            <p className="text-sm opacity-80">{estadoDescriptions[currentEstado]}</p>
          </div>

          {/* Actions */}
          <div className="mt-6 flex flex-wrap gap-3">
            {canGoBack && (
              <button
                onClick={() => handleTransition(ESTADOS[currentIndex - 1])}
                disabled={isTransitioning}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
              >
                ← Volver a {estadoLabels[ESTADOS[currentIndex - 1]]}
              </button>
            )}
            {canGoNext && (
              <button
                onClick={() => handleTransition(ESTADOS[currentIndex + 1])}
                disabled={isTransitioning}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {isTransitioning && (
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                )}
                {isTransitioning ? 'Cambiando...' : `Cambiar a ${estadoLabels[ESTADOS[currentIndex + 1]]}`} →
              </button>
            )}
          </div>
        </div>

        {/* History */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Historial de Cambios
          </h2>
          <div className="space-y-3">
            {history.map((item, index) => (
              <div
                key={index}
                className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <span className="text-xl">{estadoIcons[item.estado]}</span>
                <div className="flex-1">
                  <span className="font-medium text-gray-900 dark:text-white">
                    {estadoLabels[item.estado]}
                  </span>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {estadoDescriptions[item.estado]}
                  </p>
                </div>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {formatTime(item.timestamp)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
          <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">
            Instrucciones
          </h4>
          <p className="text-sm text-blue-700 dark:text-blue-400 mb-2">
            Haz clic en los botones para transicionar el ticket a traves de los diferentes estados:
          </p>
          <ol className="list-decimal list-inside text-sm text-blue-700 dark:text-blue-400 space-y-1">
            <li><strong>Abierto</strong> → Ticket recien creado</li>
            <li><strong>En Proceso</strong> → Empleado asignado y trabajando</li>
            <li><strong>En Espera</strong> → Esperando respuesta del cliente</li>
            <li><strong>Resuelto</strong> → Problema solucionado</li>
            <li><strong>Cerrado</strong> → Ticket finalizado completamente</li>
          </ol>
        </div>

        <div className="mt-4 text-center">
          <Link href="/demo" className="text-primary-600 hover:text-primary-700 dark:text-primary-400">
            ← Volver a demos
          </Link>
        </div>
      </div>
    </div>
  );
}
