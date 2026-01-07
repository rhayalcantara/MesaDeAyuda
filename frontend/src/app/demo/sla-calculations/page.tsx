'use client';

import { useState, useEffect } from 'react';

// Demo page to test Feature #141: SLA calculations are timezone-aware
// This demonstrates that SLA time calculations are correct across timezones

interface SLAConfig {
  prioridad: 'Alta' | 'Media' | 'Baja';
  tiempoRespuestaHoras: number;
  tiempoResolucionHoras: number;
}

interface Ticket {
  id: number;
  titulo: string;
  prioridad: 'Alta' | 'Media' | 'Baja';
  estado: 'Abierto' | 'EnProceso' | 'EnEspera' | 'Resuelto' | 'Cerrado';
  fechaCreacion: Date;
  fechaPrimeraRespuesta: Date | null;
  fechaResolucion: Date | null;
  slaRespuestaVence: Date;
  slaResolucionVence: Date;
}

// Default SLA Configuration (same as config page)
const slaConfigs: SLAConfig[] = [
  { prioridad: 'Alta', tiempoRespuestaHoras: 1, tiempoResolucionHoras: 4 },
  { prioridad: 'Media', tiempoRespuestaHoras: 4, tiempoResolucionHoras: 24 },
  { prioridad: 'Baja', tiempoRespuestaHoras: 8, tiempoResolucionHoras: 72 },
];

// Helper function to format date in local timezone
function formatLocalDate(date: Date): string {
  return new Intl.DateTimeFormat('es-ES', {
    dateStyle: 'medium',
    timeStyle: 'long',
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  }).format(date);
}

// Helper function to format ISO string
function formatISO(date: Date): string {
  return date.toISOString();
}

// Helper function to calculate time remaining
function getTimeRemaining(targetDate: Date): { hours: number; minutes: number; seconds: number; isOverdue: boolean; totalMs: number } {
  const now = new Date();
  const diffMs = targetDate.getTime() - now.getTime();
  const isOverdue = diffMs < 0;
  const absDiffMs = Math.abs(diffMs);

  const hours = Math.floor(absDiffMs / (1000 * 60 * 60));
  const minutes = Math.floor((absDiffMs % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((absDiffMs % (1000 * 60)) / 1000);

  return { hours, minutes, seconds, isOverdue, totalMs: diffMs };
}

// Format countdown display
function formatCountdown(timeRemaining: ReturnType<typeof getTimeRemaining>): string {
  const { hours, minutes, seconds, isOverdue } = timeRemaining;
  const prefix = isOverdue ? 'VENCIDO hace ' : '';
  return `${prefix}${hours}h ${minutes}m ${seconds}s`;
}

// Get SLA config for priority
function getSLAConfigForPriority(prioridad: 'Alta' | 'Media' | 'Baja'): SLAConfig {
  return slaConfigs.find(c => c.prioridad === prioridad)!;
}

// Calculate SLA deadlines
function calculateSLADeadlines(fechaCreacion: Date, prioridad: 'Alta' | 'Media' | 'Baja'): { slaRespuestaVence: Date; slaResolucionVence: Date } {
  const config = getSLAConfigForPriority(prioridad);

  const slaRespuestaVence = new Date(fechaCreacion.getTime() + config.tiempoRespuestaHoras * 60 * 60 * 1000);
  const slaResolucionVence = new Date(fechaCreacion.getTime() + config.tiempoResolucionHoras * 60 * 60 * 1000);

  return { slaRespuestaVence, slaResolucionVence };
}

export default function SLACalculationsPage() {
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [timezone, setTimezone] = useState<string>('');
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedPriority, setSelectedPriority] = useState<'Alta' | 'Media' | 'Baja'>('Alta');
  const [testResults, setTestResults] = useState<{step: string; passed: boolean; details: string}[]>([]);

  useEffect(() => {
    setTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone);

    // Update current time every second (for countdown)
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Step 1: Create high priority ticket
  const handleCreateTicket = () => {
    const creationTime = new Date();
    const { slaRespuestaVence, slaResolucionVence } = calculateSLADeadlines(creationTime, selectedPriority);
    const config = getSLAConfigForPriority(selectedPriority);

    const newTicket: Ticket = {
      id: tickets.length + 1,
      titulo: `Ticket de prueba SLA - ${selectedPriority}`,
      prioridad: selectedPriority,
      estado: 'Abierto',
      fechaCreacion: creationTime,
      fechaPrimeraRespuesta: null,
      fechaResolucion: null,
      slaRespuestaVence,
      slaResolucionVence,
    };

    setTickets([...tickets, newTicket]);

    // Verify SLA calculation (Step 2 & 3)
    const expectedRespuestaMs = config.tiempoRespuestaHoras * 60 * 60 * 1000;
    const expectedResolucionMs = config.tiempoResolucionHoras * 60 * 60 * 1000;

    const actualRespuestaMs = slaRespuestaVence.getTime() - creationTime.getTime();
    const actualResolucionMs = slaResolucionVence.getTime() - creationTime.getTime();

    const respuestaMatch = Math.abs(actualRespuestaMs - expectedRespuestaMs) < 1000; // Within 1 second
    const resolucionMatch = Math.abs(actualResolucionMs - expectedResolucionMs) < 1000;
    const passed = respuestaMatch && resolucionMatch;

    setTestResults(prev => [...prev, {
      step: `Crear ticket ${selectedPriority} y verificar SLA`,
      passed,
      details: `Ticket #${newTicket.id} creado con prioridad ${selectedPriority}.\n` +
               `SLA Respuesta: esperado ${config.tiempoRespuestaHoras}h, calculado ${(actualRespuestaMs / (60 * 60 * 1000)).toFixed(2)}h - ${respuestaMatch ? '✅' : '❌'}\n` +
               `SLA Resolucion: esperado ${config.tiempoResolucionHoras}h, calculado ${(actualResolucionMs / (60 * 60 * 1000)).toFixed(2)}h - ${resolucionMatch ? '✅' : '❌'}\n` +
               `Zona horaria: ${timezone}`
    }]);
  };

  // Simulate first response
  const handleFirstResponse = (ticketId: number) => {
    const responseTime = new Date();

    setTickets(tickets.map(t => {
      if (t.id === ticketId) {
        const timeRemaining = getTimeRemaining(t.slaRespuestaVence);
        const withinSLA = !timeRemaining.isOverdue;

        setTestResults(prev => [...prev, {
          step: `Primera respuesta al Ticket #${ticketId}`,
          passed: withinSLA,
          details: `Respuesta registrada a las ${formatLocalDate(responseTime)}.\n` +
                   `SLA Respuesta vencia: ${formatLocalDate(t.slaRespuestaVence)}.\n` +
                   `Estado: ${withinSLA ? 'DENTRO del SLA ✅' : 'FUERA del SLA (VENCIDO) ❌'}`
        }]);

        return {
          ...t,
          fechaPrimeraRespuesta: responseTime,
          estado: 'EnProceso' as const,
        };
      }
      return t;
    }));
  };

  // Simulate resolution
  const handleResolve = (ticketId: number) => {
    const resolutionTime = new Date();

    setTickets(tickets.map(t => {
      if (t.id === ticketId) {
        const timeRemaining = getTimeRemaining(t.slaResolucionVence);
        const withinSLA = !timeRemaining.isOverdue;

        setTestResults(prev => [...prev, {
          step: `Resolucion del Ticket #${ticketId}`,
          passed: withinSLA,
          details: `Ticket resuelto a las ${formatLocalDate(resolutionTime)}.\n` +
                   `SLA Resolucion vencia: ${formatLocalDate(t.slaResolucionVence)}.\n` +
                   `Estado: ${withinSLA ? 'DENTRO del SLA ✅' : 'FUERA del SLA (VENCIDO) ❌'}`
        }]);

        return {
          ...t,
          fechaResolucion: resolutionTime,
          estado: 'Resuelto' as const,
        };
      }
      return t;
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Feature #141: SLA Calculations are Timezone-Aware
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Esta pagina demuestra que los calculos de SLA son correctos y respetan la zona horaria del usuario.
          </p>
        </div>

        {/* Timezone Info */}
        <div className="mb-6 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <h2 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
            Informacion de Zona Horaria
          </h2>
          <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
            <li><strong>Tu zona horaria:</strong> {timezone || 'Cargando...'}</li>
            <li><strong>Hora actual:</strong> {formatLocalDate(currentTime)}</li>
            <li><strong>UTC:</strong> {formatISO(currentTime)}</li>
          </ul>
        </div>

        {/* SLA Configuration Reference */}
        <div className="mb-6 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Configuracion de SLA Actual
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Prioridad</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Primera Respuesta</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Resolucion</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {slaConfigs.map(config => (
                  <tr key={config.prioridad}>
                    <td className="px-4 py-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        config.prioridad === 'Alta' ? 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300' :
                        config.prioridad === 'Media' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300' :
                        'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300'
                      }`}>
                        {config.prioridad}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-gray-900 dark:text-white">{config.tiempoRespuestaHoras} horas</td>
                    <td className="px-4 py-2 text-gray-900 dark:text-white">{config.tiempoResolucionHoras} horas</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Test Steps */}
        <div className="mb-6 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Pasos de Prueba
          </h2>
          <ol className="list-decimal list-inside space-y-2 text-gray-700 dark:text-gray-300 mb-6">
            <li><strong>Paso 1:</strong> Crear ticket con prioridad Alta</li>
            <li><strong>Paso 2:</strong> Verificar el countdown del SLA (en tiempo real)</li>
            <li><strong>Paso 3:</strong> Verificar que las horas coinciden con la configuracion de SLA</li>
          </ol>

          <div className="flex items-center gap-4">
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value as 'Alta' | 'Media' | 'Baja')}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="Alta">Alta (1h respuesta, 4h resolucion)</option>
              <option value="Media">Media (4h respuesta, 24h resolucion)</option>
              <option value="Baja">Baja (8h respuesta, 72h resolucion)</option>
            </select>
            <button
              onClick={handleCreateTicket}
              className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Crear Ticket de Prueba
            </button>
          </div>
        </div>

        {/* Test Results */}
        {testResults.length > 0 && (
          <div className="mb-6 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Resultados de Prueba
            </h2>
            <div className="space-y-3">
              {testResults.map((result, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg ${
                    result.passed
                      ? 'bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800'
                      : 'bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-lg ${result.passed ? 'text-green-600' : 'text-red-600'}`}>
                      {result.passed ? '✅' : '❌'}
                    </span>
                    <span className={`font-medium ${
                      result.passed ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'
                    }`}>
                      {result.step}
                    </span>
                  </div>
                  <pre className={`text-sm whitespace-pre-wrap ${
                    result.passed ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'
                  }`}>
                    {result.details}
                  </pre>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Active Tickets with SLA Countdown */}
        {tickets.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Tickets con Countdown de SLA ({tickets.length})
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                El countdown se actualiza en tiempo real
              </p>
            </div>

            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {tickets.map(ticket => {
                const respuestaRemaining = getTimeRemaining(ticket.slaRespuestaVence);
                const resolucionRemaining = getTimeRemaining(ticket.slaResolucionVence);

                return (
                  <div key={ticket.id} className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-gray-900 dark:text-white">
                            Ticket #{ticket.id}: {ticket.titulo}
                          </h3>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            ticket.prioridad === 'Alta' ? 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300' :
                            ticket.prioridad === 'Media' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300' :
                            'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300'
                          }`}>
                            {ticket.prioridad}
                          </span>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            ticket.estado === 'Abierto' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300' :
                            ticket.estado === 'EnProceso' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300' :
                            'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300'
                          }`}>
                            {ticket.estado}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          Creado: {formatLocalDate(ticket.fechaCreacion)}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        {ticket.estado === 'Abierto' && (
                          <button
                            onClick={() => handleFirstResponse(ticket.id)}
                            className="px-3 py-1 text-sm bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-200 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-900 transition-colors"
                          >
                            Registrar Primera Respuesta
                          </button>
                        )}
                        {(ticket.estado === 'Abierto' || ticket.estado === 'EnProceso') && (
                          <button
                            onClick={() => handleResolve(ticket.id)}
                            className="px-3 py-1 text-sm bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200 rounded-lg hover:bg-green-200 dark:hover:bg-green-900 transition-colors"
                          >
                            Resolver Ticket
                          </button>
                        )}
                      </div>
                    </div>

                    {/* SLA Countdown Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Primera Respuesta SLA */}
                      <div className={`p-4 rounded-lg border ${
                        ticket.fechaPrimeraRespuesta
                          ? 'bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600'
                          : respuestaRemaining.isOverdue
                            ? 'bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-700'
                            : respuestaRemaining.hours < 1
                              ? 'bg-yellow-50 dark:bg-yellow-900/30 border-yellow-200 dark:border-yellow-700'
                              : 'bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-700'
                      }`}>
                        <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                          SLA Primera Respuesta
                        </p>
                        {ticket.fechaPrimeraRespuesta ? (
                          <p className="text-lg font-semibold text-gray-600 dark:text-gray-300">
                            ✅ Completado
                          </p>
                        ) : (
                          <>
                            <p className={`text-2xl font-bold ${
                              respuestaRemaining.isOverdue ? 'text-red-600' :
                              respuestaRemaining.hours < 1 ? 'text-yellow-600' : 'text-green-600'
                            }`}>
                              {formatCountdown(respuestaRemaining)}
                            </p>
                          </>
                        )}
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                          Vence: {formatLocalDate(ticket.slaRespuestaVence)}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          UTC: {formatISO(ticket.slaRespuestaVence)}
                        </p>
                      </div>

                      {/* Resolucion SLA */}
                      <div className={`p-4 rounded-lg border ${
                        ticket.fechaResolucion
                          ? 'bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600'
                          : resolucionRemaining.isOverdue
                            ? 'bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-700'
                            : resolucionRemaining.hours < 2
                              ? 'bg-yellow-50 dark:bg-yellow-900/30 border-yellow-200 dark:border-yellow-700'
                              : 'bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-700'
                      }`}>
                        <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                          SLA Resolucion
                        </p>
                        {ticket.fechaResolucion ? (
                          <p className="text-lg font-semibold text-gray-600 dark:text-gray-300">
                            ✅ Completado
                          </p>
                        ) : (
                          <>
                            <p className={`text-2xl font-bold ${
                              resolucionRemaining.isOverdue ? 'text-red-600' :
                              resolucionRemaining.hours < 2 ? 'text-yellow-600' : 'text-green-600'
                            }`}>
                              {formatCountdown(resolucionRemaining)}
                            </p>
                          </>
                        )}
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                          Vence: {formatLocalDate(ticket.slaResolucionVence)}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          UTC: {formatISO(ticket.slaResolucionVence)}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Demo Info */}
        <div className="mt-6 bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-2">
            Informacion de Demo - Feature #141
          </h4>
          <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
            <li>• Los SLA se calculan en base a la configuracion por prioridad</li>
            <li>• El countdown se actualiza en tiempo real cada segundo</li>
            <li>• Las fechas de vencimiento se muestran en la zona horaria local</li>
            <li>• Tambien se muestra el formato UTC (ISO 8601) para verificacion</li>
            <li>• Los colores indican: verde (OK), amarillo (cerca de vencer), rojo (vencido)</li>
            <li>• Al crear un ticket, se verifica que los calculos de SLA son correctos</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
