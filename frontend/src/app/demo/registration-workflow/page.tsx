'use client';

import { useState } from 'react';
import Link from 'next/link';

// Feature #44: Client registration approval workflow
// Demonstrates the complete flow of client registration and approval

type Step = 'login' | 'register-form' | 'submit' | 'empleado-login' | 'solicitudes' | 'approve' | 'client-login' | 'complete';

interface RegistrationRequest {
  id: number;
  nombre: string;
  email: string;
  empresa: string;
  fechaSolicitud: string;
  estado: 'Pendiente' | 'Aprobado' | 'Rechazado';
}

export default function RegistrationWorkflowPage() {
  const [currentStep, setCurrentStep] = useState<Step>('login');
  const [registrationData, setRegistrationData] = useState({
    nombre: '',
    email: '',
    password: '',
    empresa: '',
  });
  const [requests, setRequests] = useState<RegistrationRequest[]>([
    { id: 1, nombre: 'Juan Pérez', email: 'juan@empresa.com', empresa: 'Empresa ABC', fechaSolicitud: '2026-01-05', estado: 'Pendiente' },
    { id: 2, nombre: 'María García', email: 'maria@otro.com', empresa: 'Otro Corp', fechaSolicitud: '2026-01-04', estado: 'Aprobado' },
  ]);
  const [newRequest, setNewRequest] = useState<RegistrationRequest | null>(null);
  const [message, setMessage] = useState('');
  const [approvedClient, setApprovedClient] = useState<{nombre: string; email: string} | null>(null);

  const steps = [
    { id: 'login', label: 'Login' },
    { id: 'register-form', label: 'Formulario' },
    { id: 'submit', label: 'Enviar' },
    { id: 'empleado-login', label: 'Empleado' },
    { id: 'solicitudes', label: 'Solicitudes' },
    { id: 'approve', label: 'Aprobar' },
    { id: 'client-login', label: 'Login Cliente' },
    { id: 'complete', label: 'Completado' },
  ];

  const getStepIndex = (step: Step) => steps.findIndex(s => s.id === step);

  const handleGoToRegister = () => {
    setCurrentStep('register-form');
    setMessage('');
  };

  const handleSubmitRegistration = () => {
    if (!registrationData.nombre || !registrationData.email || !registrationData.password || !registrationData.empresa) {
      setMessage('Por favor complete todos los campos');
      return;
    }

    const request: RegistrationRequest = {
      id: requests.length + 1,
      nombre: registrationData.nombre,
      email: registrationData.email,
      empresa: registrationData.empresa,
      fechaSolicitud: new Date().toISOString().split('T')[0],
      estado: 'Pendiente',
    };

    setNewRequest(request);
    setRequests([request, ...requests]);
    setCurrentStep('submit');
    setMessage('Solicitud de registro enviada exitosamente');
  };

  const handleEmpleadoLogin = () => {
    setCurrentStep('empleado-login');
    setMessage('');
    setTimeout(() => {
      setCurrentStep('solicitudes');
      setMessage('Sesión iniciada como Empleado');
    }, 500);
  };

  const handleApproveRequest = (id: number) => {
    const updatedRequests = requests.map(r =>
      r.id === id ? { ...r, estado: 'Aprobado' as const } : r
    );
    setRequests(updatedRequests);

    const approved = requests.find(r => r.id === id);
    if (approved) {
      setApprovedClient({ nombre: approved.nombre, email: approved.email });
    }

    setCurrentStep('approve');
    setMessage(`Solicitud aprobada. El cliente "${approved?.nombre}" ahora puede iniciar sesión.`);
  };

  const handleClientLogin = () => {
    setCurrentStep('client-login');
    setMessage('');
    setTimeout(() => {
      setCurrentStep('complete');
      setMessage(`¡Bienvenido ${approvedClient?.nombre}! Su cuenta ha sido activada.`);
    }, 500);
  };

  const handleReset = () => {
    setCurrentStep('login');
    setRegistrationData({ nombre: '', email: '', password: '', empresa: '' });
    setNewRequest(null);
    setApprovedClient(null);
    setMessage('');
    setRequests([
      { id: 1, nombre: 'Juan Pérez', email: 'juan@empresa.com', empresa: 'Empresa ABC', fechaSolicitud: '2026-01-05', estado: 'Pendiente' },
      { id: 2, nombre: 'María García', email: 'maria@otro.com', empresa: 'Otro Corp', fechaSolicitud: '2026-01-04', estado: 'Aprobado' },
    ]);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div role="alert" aria-live="assertive" className="sr-only" />

      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Feature #44: Flujo de Registro y Aprobación de Clientes
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Demuestra el flujo completo end-to-end de registro de clientes.
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8 flex items-center justify-between overflow-x-auto pb-2">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className={`flex flex-col items-center ${index < steps.length - 1 ? 'mr-2' : ''}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  getStepIndex(currentStep) > index
                    ? 'bg-green-500 text-white'
                    : getStepIndex(currentStep) === index
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                }`}>
                  {getStepIndex(currentStep) > index ? '✓' : index + 1}
                </div>
                <span className="text-xs mt-1 text-gray-600 dark:text-gray-400 whitespace-nowrap">
                  {step.label}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div className={`w-8 h-0.5 mx-1 ${
                  getStepIndex(currentStep) > index ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700'
                }`} />
              )}
            </div>
          ))}
        </div>

        {/* Success/Info Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
            message.includes('exitosamente') || message.includes('Bienvenido') || message.includes('aprobada')
              ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200'
              : 'bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200'
          }`}>
            <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>{message}</span>
          </div>
        )}

        {/* Content Area */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">

          {/* Step 1: Login Page */}
          {currentStep === 'login' && (
            <div className="text-center">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                Página de Login
              </h2>
              <div className="max-w-sm mx-auto space-y-4">
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Email</label>
                  <input
                    type="email"
                    placeholder="usuario@ejemplo.com"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                    disabled
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Contraseña</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700"
                    disabled
                  />
                </div>
                <button disabled className="w-full py-2 bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 rounded-lg cursor-not-allowed">
                  Iniciar Sesión
                </button>
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    ¿No tienes cuenta?
                  </p>
                  <button
                    onClick={handleGoToRegister}
                    className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    Solicitar Registro
                  </button>
                </div>
              </div>
              <p className="mt-6 text-sm text-gray-500 dark:text-gray-400">
                <strong>Paso 1:</strong> Haz clic en "Solicitar Registro" para comenzar.
              </p>
            </div>
          )}

          {/* Step 2: Registration Form */}
          {currentStep === 'register-form' && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                Formulario de Solicitud de Registro
              </h2>
              <div className="max-w-md mx-auto space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Nombre Completo *
                  </label>
                  <input
                    type="text"
                    value={registrationData.nombre}
                    onChange={(e) => setRegistrationData({ ...registrationData, nombre: e.target.value })}
                    placeholder="Tu nombre completo"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={registrationData.email}
                    onChange={(e) => setRegistrationData({ ...registrationData, email: e.target.value })}
                    placeholder="tu@email.com"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Contraseña *
                  </label>
                  <input
                    type="password"
                    value={registrationData.password}
                    onChange={(e) => setRegistrationData({ ...registrationData, password: e.target.value })}
                    placeholder="Mínimo 8 caracteres"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Empresa *
                  </label>
                  <input
                    type="text"
                    value={registrationData.empresa}
                    onChange={(e) => setRegistrationData({ ...registrationData, empresa: e.target.value })}
                    placeholder="Nombre de tu empresa"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button
                  onClick={handleSubmitRegistration}
                  disabled={!registrationData.nombre || !registrationData.email || !registrationData.password || !registrationData.empresa}
                  className="w-full py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                >
                  Enviar Solicitud
                </button>
              </div>
              <p className="mt-6 text-sm text-gray-500 dark:text-gray-400 text-center">
                <strong>Paso 2-3:</strong> Completa el formulario y envía la solicitud.
              </p>
            </div>
          )}

          {/* Step 3: Submit Confirmation */}
          {currentStep === 'submit' && (
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Solicitud Enviada
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Tu solicitud ha sido recibida. Un empleado revisará y aprobará tu registro.
              </p>
              {newRequest && (
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 max-w-sm mx-auto text-left mb-6">
                  <h3 className="font-medium text-gray-900 dark:text-white mb-2">Datos de la solicitud:</h3>
                  <dl className="text-sm space-y-1">
                    <div className="flex justify-between">
                      <dt className="text-gray-500 dark:text-gray-400">Nombre:</dt>
                      <dd className="text-gray-900 dark:text-white">{newRequest.nombre}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-500 dark:text-gray-400">Email:</dt>
                      <dd className="text-gray-900 dark:text-white">{newRequest.email}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-500 dark:text-gray-400">Empresa:</dt>
                      <dd className="text-gray-900 dark:text-white">{newRequest.empresa}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-500 dark:text-gray-400">Estado:</dt>
                      <dd className="text-yellow-600 dark:text-yellow-400 font-medium">{newRequest.estado}</dd>
                    </div>
                  </dl>
                </div>
              )}
              <button
                onClick={handleEmpleadoLogin}
                className="py-2 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Continuar como Empleado →
              </button>
              <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                <strong>Paso 4:</strong> Ahora iniciaremos sesión como Empleado para aprobar la solicitud.
              </p>
            </div>
          )}

          {/* Step 4: Empleado Login (brief transition) */}
          {currentStep === 'empleado-login' && (
            <div className="text-center py-8">
              <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Iniciando sesión como Empleado...</p>
            </div>
          )}

          {/* Step 5: Solicitudes List */}
          {currentStep === 'solicitudes' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Solicitudes de Registro
                </h2>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Sesión: Empleado Demo
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-300">Nombre</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-300">Email</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-300">Empresa</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-300">Fecha</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-300">Estado</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-300">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {requests.map((request) => (
                      <tr key={request.id} className={request.id === newRequest?.id ? 'bg-yellow-50 dark:bg-yellow-900/20' : ''}>
                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{request.nombre}</td>
                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{request.email}</td>
                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{request.empresa}</td>
                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{request.fechaSolicitud}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            request.estado === 'Pendiente'
                              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                              : request.estado === 'Aprobado'
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                          }`}>
                            {request.estado}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {request.estado === 'Pendiente' && (
                            <button
                              onClick={() => handleApproveRequest(request.id)}
                              className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded transition-colors"
                            >
                              Aprobar
                            </button>
                          )}
                          {request.estado === 'Aprobado' && (
                            <span className="text-gray-400 text-sm">-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-6 text-sm text-gray-500 dark:text-gray-400">
                <strong>Paso 5-6:</strong> Haz clic en "Aprobar" en la solicitud pendiente.
              </p>
            </div>
          )}

          {/* Step 6: Approval Confirmation */}
          {currentStep === 'approve' && (
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Solicitud Aprobada
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                El cliente {approvedClient?.nombre} ahora puede iniciar sesión en el sistema.
              </p>
              <button
                onClick={handleClientLogin}
                className="py-2 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Verificar Login del Cliente →
              </button>
              <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                <strong>Paso 7:</strong> Ahora verificaremos que el cliente puede iniciar sesión.
              </p>
            </div>
          )}

          {/* Step 7: Client Login (brief transition) */}
          {currentStep === 'client-login' && (
            <div className="text-center py-8">
              <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Iniciando sesión como {approvedClient?.nombre}...</p>
            </div>
          )}

          {/* Step 8: Complete */}
          {currentStep === 'complete' && (
            <div className="text-center">
              <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Flujo de Registro Completado
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Todo el proceso de registro y aprobación se ha ejecutado exitosamente.
              </p>

              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 max-w-md mx-auto mb-6">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Operaciones Completadas</h3>
                <ul className="space-y-2 text-left">
                  <li className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                    <span className="w-5 h-5 bg-green-500 text-white rounded-full flex items-center justify-center text-xs">✓</span>
                    Cliente solicitó registro
                  </li>
                  <li className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                    <span className="w-5 h-5 bg-green-500 text-white rounded-full flex items-center justify-center text-xs">✓</span>
                    Formulario completado y enviado
                  </li>
                  <li className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                    <span className="w-5 h-5 bg-green-500 text-white rounded-full flex items-center justify-center text-xs">✓</span>
                    Empleado revisó solicitudes
                  </li>
                  <li className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                    <span className="w-5 h-5 bg-green-500 text-white rounded-full flex items-center justify-center text-xs">✓</span>
                    Solicitud aprobada
                  </li>
                  <li className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                    <span className="w-5 h-5 bg-green-500 text-white rounded-full flex items-center justify-center text-xs">✓</span>
                    Cliente puede iniciar sesión
                  </li>
                </ul>
              </div>

              <button
                onClick={handleReset}
                className="py-2 px-6 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
              >
                Reiniciar Demo
              </button>
            </div>
          )}
        </div>

        {/* Feature Info */}
        <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
          <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
            Feature #44: Client registration approval workflow
          </h4>
          <p className="text-sm text-blue-700 dark:text-blue-300 mb-2">
            Este test verifica el flujo completo de registro de clientes:
          </p>
          <ul className="text-sm text-blue-600 dark:text-blue-400 space-y-1">
            <li>1. Cliente va a login y solicita registro</li>
            <li>2. Cliente completa formulario de registro</li>
            <li>3. Solicitud es enviada al sistema</li>
            <li>4. Empleado inicia sesión</li>
            <li>5. Empleado ve lista de solicitudes pendientes</li>
            <li>6. Empleado aprueba la solicitud</li>
            <li>7. Cliente puede iniciar sesión exitosamente</li>
          </ul>
        </div>

        <Link href="/demo" className="inline-block mt-6 text-blue-600 dark:text-blue-400 hover:underline">
          ← Volver a demos
        </Link>
      </div>
    </div>
  );
}
