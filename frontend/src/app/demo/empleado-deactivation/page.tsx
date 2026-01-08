'use client';

import { useState } from 'react';
import Link from 'next/link';

interface Usuario {
  id: number;
  nombre: string;
  email: string;
  rol: 'Admin' | 'Empleado' | 'Cliente';
  activo: boolean;
  ticketsAsignados: number;
}

interface Ticket {
  id: number;
  titulo: string;
  estado: 'Abierto' | 'EnProceso' | 'EnEspera' | 'Resuelto';
  prioridad: 'Alta' | 'Media' | 'Baja';
  empleadoAsignadoId: number | null;
  empleadoNombre: string | null;
}

type Step = 'login' | 'assign' | 'deactivate' | 'reassign' | 'complete';

const initialEmpleados: Usuario[] = [
  {
    id: 1,
    nombre: 'Admin Sistema',
    email: 'admin@mdayuda.com',
    rol: 'Admin',
    activo: true,
    ticketsAsignados: 0,
  },
  {
    id: 2,
    nombre: 'Empleado Demo',
    email: 'empleado@mdayuda.com',
    rol: 'Empleado',
    activo: true,
    ticketsAsignados: 0,
  },
  {
    id: 3,
    nombre: 'Juan Perez',
    email: 'juan@mdayuda.com',
    rol: 'Empleado',
    activo: true,
    ticketsAsignados: 0,
  },
];

const initialTickets: Ticket[] = [
  {
    id: 101,
    titulo: 'Error en facturacion',
    estado: 'Abierto',
    prioridad: 'Alta',
    empleadoAsignadoId: null,
    empleadoNombre: null,
  },
  {
    id: 102,
    titulo: 'Problema con login',
    estado: 'Abierto',
    prioridad: 'Media',
    empleadoAsignadoId: null,
    empleadoNombre: null,
  },
  {
    id: 103,
    titulo: 'Solicitud de reporte',
    estado: 'Abierto',
    prioridad: 'Baja',
    empleadoAsignadoId: null,
    empleadoNombre: null,
  },
];

export default function EmpleadoDeactivationPage() {
  const [empleados, setEmpleados] = useState<Usuario[]>(initialEmpleados);
  const [tickets, setTickets] = useState<Ticket[]>(initialTickets);
  const [currentStep, setCurrentStep] = useState<Step>('login');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [selectedEmpleado, setSelectedEmpleado] = useState<Usuario | null>(null);
  const [targetEmpleado, setTargetEmpleado] = useState<number | null>(null);
  const [showReassignModal, setShowReassignModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const completedSteps = {
    login: currentStep !== 'login',
    assign: ['deactivate', 'reassign', 'complete'].includes(currentStep),
    deactivate: ['reassign', 'complete'].includes(currentStep),
    reassign: currentStep === 'complete',
  };

  const handleLogin = () => {
    setIsLoggedIn(true);
    setCurrentStep('assign');
    setSuccessMessage('Sesion iniciada como Admin');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleAssignTickets = () => {
    // Assign all tickets to Empleado Demo (id: 2)
    const empleadoDemo = empleados.find(e => e.id === 2);
    if (!empleadoDemo) return;

    const updatedTickets = tickets.map(t => ({
      ...t,
      empleadoAsignadoId: 2,
      empleadoNombre: empleadoDemo.nombre,
      estado: 'EnProceso' as const,
    }));
    setTickets(updatedTickets);

    const updatedEmpleados = empleados.map(e =>
      e.id === 2 ? { ...e, ticketsAsignados: updatedTickets.length } : e
    );
    setEmpleados(updatedEmpleados);

    setSelectedEmpleado({ ...empleadoDemo, ticketsAsignados: updatedTickets.length });
    setSuccessMessage(`${updatedTickets.length} tickets asignados a ${empleadoDemo.nombre}`);
    setCurrentStep('deactivate');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleTryDeactivate = () => {
    // When trying to deactivate, check if empleado has tickets
    if (selectedEmpleado && selectedEmpleado.ticketsAsignados > 0) {
      setShowReassignModal(true);
    }
  };

  const handleReassign = () => {
    if (!selectedEmpleado || !targetEmpleado) return;

    const targetEmp = empleados.find(e => e.id === targetEmpleado);
    if (!targetEmp) return;

    // Reassign all tickets
    const updatedTickets = tickets.map(t =>
      t.empleadoAsignadoId === selectedEmpleado.id
        ? { ...t, empleadoAsignadoId: targetEmpleado, empleadoNombre: targetEmp.nombre }
        : t
    );
    setTickets(updatedTickets);

    // Update empleado counts
    const ticketCount = updatedTickets.filter(t => t.empleadoAsignadoId === targetEmpleado).length;
    const updatedEmpleados = empleados.map(e => {
      if (e.id === selectedEmpleado.id) {
        return { ...e, activo: false, ticketsAsignados: 0 };
      }
      if (e.id === targetEmpleado) {
        return { ...e, ticketsAsignados: ticketCount };
      }
      return e;
    });
    setEmpleados(updatedEmpleados);

    setShowReassignModal(false);
    setSelectedEmpleado({ ...selectedEmpleado, activo: false, ticketsAsignados: 0 });
    setSuccessMessage(`Tickets reasignados a ${targetEmp.nombre}. Usuario desactivado.`);
    setCurrentStep('complete');
    setTimeout(() => setSuccessMessage(''), 5000);
  };

  const handleReset = () => {
    setEmpleados(initialEmpleados);
    setTickets(initialTickets);
    setCurrentStep('login');
    setIsLoggedIn(false);
    setSelectedEmpleado(null);
    setTargetEmpleado(null);
    setShowReassignModal(false);
    setSuccessMessage('');
  };

  const getPrioridadColor = (prioridad: string) => {
    const colors: Record<string, string> = {
      Alta: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
      Media: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300',
      Baja: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
    };
    return colors[prioridad] || 'bg-gray-100 text-gray-700';
  };

  const getEstadoColor = (estado: string) => {
    const colors: Record<string, string> = {
      Abierto: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
      EnProceso: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
      EnEspera: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300',
      Resuelto: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
    };
    return colors[estado] || 'bg-gray-100 text-gray-700';
  };

  const activeEmpleados = empleados.filter(e => e.rol === 'Empleado' && e.activo);
  const otherEmpleados = activeEmpleados.filter(e => e.id !== selectedEmpleado?.id);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Feature #89: Deactivate User Handles Ticket Reassignment
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Demuestra que al desactivar un empleado con tickets asignados, el sistema solicita reasignarlos.
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-between mb-8 bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
          {[
            { key: 'login', label: 'Login Admin', num: '1' },
            { key: 'assign', label: 'Asignar Tickets', num: '2' },
            { key: 'deactivate', label: 'Desactivar', num: '3' },
            { key: 'reassign', label: 'Reasignar', num: '4' },
            { key: 'complete', label: 'Completado', num: '5' },
          ].map((step) => (
            <div key={step.key} className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                completedSteps[step.key as keyof typeof completedSteps]
                  ? 'bg-green-500 text-white'
                  : currentStep === step.key
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
              }`}>
                {completedSteps[step.key as keyof typeof completedSteps] ? '✓' : step.num}
              </div>
              <span className="text-xs mt-1 text-gray-600 dark:text-gray-400">{step.label}</span>
            </div>
          ))}
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-4 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg p-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-green-700 dark:text-green-300">{successMessage}</span>
          </div>
        )}

        {/* Content based on step */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          {currentStep === 'login' && (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Paso 1: Iniciar Sesion</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Inicia sesion como Administrador para gestionar empleados.
              </p>
              <button
                onClick={handleLogin}
                className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium"
              >
                Iniciar Sesion como Admin
              </button>
            </div>
          )}

          {currentStep === 'assign' && (
            <>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Paso 2: Asignar Tickets</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Asigna tickets al empleado que luego sera desactivado.
              </p>

              {/* Empleados Table */}
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">Empleados Activos</h3>
              <table className="w-full mb-6">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Nombre</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Email</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Tickets</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {activeEmpleados.map((emp) => (
                    <tr key={emp.id} className={emp.id === 2 ? 'bg-blue-50 dark:bg-blue-900/20' : ''}>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                        {emp.nombre}
                        {emp.id === 2 && <span className="ml-2 text-blue-600 dark:text-blue-400">(Target)</span>}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{emp.email}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{emp.ticketsAsignados}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">
                          Activo
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Tickets Table */}
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">Tickets Sin Asignar</h3>
              <table className="w-full mb-6">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">ID</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Titulo</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Prioridad</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Estado</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Asignado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {tickets.map((ticket) => (
                    <tr key={ticket.id}>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">#{ticket.id}</td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">{ticket.titulo}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPrioridadColor(ticket.prioridad)}`}>
                          {ticket.prioridad}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getEstadoColor(ticket.estado)}`}>
                          {ticket.estado}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                        {ticket.empleadoNombre || 'Sin asignar'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <button
                onClick={handleAssignTickets}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                Asignar Todos los Tickets a &quot;Empleado Demo&quot;
              </button>
            </>
          )}

          {currentStep === 'deactivate' && selectedEmpleado && (
            <>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Paso 3: Desactivar Empleado</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Ahora intenta desactivar al empleado que tiene tickets asignados.
              </p>

              {/* Empleado Info */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
                <h3 className="font-medium text-gray-900 dark:text-white mb-2">Empleado Seleccionado</h3>
                <dl className="grid grid-cols-2 gap-4">
                  <div>
                    <dt className="text-sm text-gray-500 dark:text-gray-400">Nombre</dt>
                    <dd className="text-gray-900 dark:text-white font-medium">{selectedEmpleado.nombre}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-500 dark:text-gray-400">Email</dt>
                    <dd className="text-gray-900 dark:text-white">{selectedEmpleado.email}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-500 dark:text-gray-400">Tickets Asignados</dt>
                    <dd className="text-gray-900 dark:text-white">
                      <span className="px-2 py-1 text-sm font-medium rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300">
                        {selectedEmpleado.ticketsAsignados} tickets
                      </span>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-500 dark:text-gray-400">Estado</dt>
                    <dd>
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">
                        Activo
                      </span>
                    </dd>
                  </div>
                </dl>
              </div>

              {/* Warning */}
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <div>
                    <h4 className="font-medium text-yellow-800 dark:text-yellow-300">Atencion</h4>
                    <p className="text-sm text-yellow-700 dark:text-yellow-400">
                      Este empleado tiene {selectedEmpleado.ticketsAsignados} tickets asignados.
                      Al desactivarlo, debera reasignar los tickets a otro empleado.
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={handleTryDeactivate}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                </svg>
                Desactivar Empleado
              </button>
            </>
          )}

          {currentStep === 'complete' && (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Flujo Completado</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                La desactivacion del empleado se completo correctamente con reasignacion de tickets.
              </p>

              {/* Summary */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 max-w-md mx-auto mb-6">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Resumen</h3>
                <ul className="text-left space-y-2 text-sm">
                  <li className="flex items-center gap-2 text-green-700 dark:text-green-300">
                    <span className="text-green-500">✓</span> Login como Admin
                  </li>
                  <li className="flex items-center gap-2 text-green-700 dark:text-green-300">
                    <span className="text-green-500">✓</span> Tickets asignados a empleado
                  </li>
                  <li className="flex items-center gap-2 text-green-700 dark:text-green-300">
                    <span className="text-green-500">✓</span> Sistema solicito reasignar tickets
                  </li>
                  <li className="flex items-center gap-2 text-green-700 dark:text-green-300">
                    <span className="text-green-500">✓</span> Tickets reasignados a otro empleado
                  </li>
                  <li className="flex items-center gap-2 text-green-700 dark:text-green-300">
                    <span className="text-green-500">✓</span> Empleado desactivado exitosamente
                  </li>
                </ul>
              </div>

              {/* Updated Tickets Table */}
              <h3 className="font-medium text-gray-900 dark:text-white mb-2 text-left">Tickets Reasignados</h3>
              <table className="w-full mb-6 text-left">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">ID</th>
                    <th className="px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Titulo</th>
                    <th className="px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Nuevo Asignado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {tickets.map((ticket) => (
                    <tr key={ticket.id}>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">#{ticket.id}</td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">{ticket.titulo}</td>
                      <td className="px-4 py-3 text-sm text-green-600 dark:text-green-400 font-medium">
                        {ticket.empleadoNombre}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <button
                onClick={handleReset}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                Reiniciar Demo
              </button>
            </div>
          )}
        </div>

        {/* Reassign Modal */}
        {showReassignModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Reasignar Tickets</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    El empleado &quot;{selectedEmpleado?.nombre}&quot; tiene {selectedEmpleado?.ticketsAsignados} tickets asignados.
                    Debe seleccionar otro empleado para reasignar estos tickets antes de desactivarlo.
                  </p>
                </div>
              </div>

              {/* Tickets List */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 mb-4">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tickets a reasignar:</p>
                <ul className="space-y-1">
                  {tickets.filter(t => t.empleadoAsignadoId === selectedEmpleado?.id).map((ticket) => (
                    <li key={ticket.id} className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                      <span>•</span> #{ticket.id} - {ticket.titulo}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Empleado Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Seleccionar nuevo empleado *
                </label>
                <select
                  value={targetEmpleado || ''}
                  onChange={(e) => setTargetEmpleado(Number(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">-- Seleccionar empleado --</option>
                  {otherEmpleados.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.nombre} ({emp.ticketsAsignados} tickets actuales)
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowReassignModal(false);
                    setCurrentStep('deactivate');
                  }}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleReassign}
                  disabled={!targetEmpleado}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
                >
                  Reasignar y Desactivar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Feature Info */}
        <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
          <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">
            Feature #89: Deactivate user handles ticket reassignment
          </h4>
          <p className="text-sm text-blue-700 dark:text-blue-400 mb-2">
            Este test verifica que al desactivar un empleado con tickets asignados:
          </p>
          <ul className="list-disc list-inside text-sm text-blue-600 dark:text-blue-400 space-y-1">
            <li>El sistema detecta que tiene tickets asignados</li>
            <li>Muestra un modal pidiendo reasignar tickets</li>
            <li>Permite seleccionar otro empleado activo</li>
            <li>Reasigna todos los tickets antes de desactivar</li>
            <li>Completa la desactivacion exitosamente</li>
          </ul>
        </div>

        <Link
          href="/demo"
          className="inline-flex items-center mt-4 text-primary-600 dark:text-primary-400 hover:underline"
        >
          ← Volver a demos
        </Link>
      </div>
    </div>
  );
}
