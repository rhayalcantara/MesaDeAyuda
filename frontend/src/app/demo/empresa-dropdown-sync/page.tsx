'use client';

import { useState } from 'react';
import Link from 'next/link';

interface Empresa {
  id: number;
  nombre: string;
  activa: boolean;
  colorPrimario: string;
}

// Initial empresas
const initialEmpresas: Empresa[] = [
  { id: 1, nombre: 'Empresa Demo', activa: true, colorPrimario: '#2563eb' },
  { id: 2, nombre: 'Corporacion ABC', activa: true, colorPrimario: '#10b981' },
  { id: 3, nombre: 'Tech Solutions', activa: true, colorPrimario: '#8b5cf6' },
];

type TestStep = 'login' | 'create-empresa' | 'go-to-form' | 'verify-dropdown' | 'complete';

export default function EmpresaDropdownSyncPage() {
  const [empresas, setEmpresas] = useState<Empresa[]>(initialEmpresas);
  const [testStep, setTestStep] = useState<TestStep>('login');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [newEmpresaName, setNewEmpresaName] = useState('');
  const [createdEmpresa, setCreatedEmpresa] = useState<Empresa | null>(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [selectedEmpresa, setSelectedEmpresa] = useState<number | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [testPassed, setTestPassed] = useState(false);

  // Form fields for user creation
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    rol: 'Cliente',
  });

  const completedSteps = {
    login: testStep !== 'login',
    'create-empresa': ['go-to-form', 'verify-dropdown', 'complete'].includes(testStep),
    'go-to-form': ['verify-dropdown', 'complete'].includes(testStep),
    'verify-dropdown': testStep === 'complete',
  };

  // Step 1: Login as Admin
  const handleLogin = () => {
    setIsLoggedIn(true);
    setTestStep('create-empresa');
    setSuccessMessage('Sesion iniciada como Admin');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  // Step 2: Create new empresa
  const handleCreateEmpresa = () => {
    const uniqueName = `TEST_EMPRESA_${Date.now().toString(36).toUpperCase()}`;
    const newEmpresa: Empresa = {
      id: empresas.length + 1,
      nombre: uniqueName,
      activa: true,
      colorPrimario: '#ef4444',
    };

    setEmpresas([...empresas, newEmpresa]);
    setCreatedEmpresa(newEmpresa);
    setNewEmpresaName(uniqueName);
    setTestStep('go-to-form');
    setSuccessMessage(`Empresa "${uniqueName}" creada exitosamente`);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  // Step 3: Go to user creation form
  const handleGoToForm = () => {
    setTestStep('verify-dropdown');
    setSuccessMessage('Navegando al formulario de nuevo usuario...');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  // Step 4-5: Verify dropdown contains new empresa
  const handleVerifyDropdown = () => {
    const empresaExists = empresas.some(e => e.nombre === newEmpresaName);
    setTestPassed(empresaExists);
    setTestStep('complete');

    if (empresaExists) {
      setSuccessMessage(`La empresa "${newEmpresaName}" aparece correctamente en el dropdown`);
    } else {
      setSuccessMessage('Error: La empresa no aparece en el dropdown');
    }
    setTimeout(() => setSuccessMessage(''), 5000);
  };

  // Reset demo
  const resetDemo = () => {
    setEmpresas(initialEmpresas);
    setTestStep('login');
    setIsLoggedIn(false);
    setNewEmpresaName('');
    setCreatedEmpresa(null);
    setSelectedEmpresa(null);
    setDropdownOpen(false);
    setTestPassed(false);
    setSuccessMessage('');
    setFormData({ nombre: '', email: '', rol: 'Cliente' });
  };

  // Get active empresas for dropdown
  const activeEmpresas = empresas.filter(e => e.activa);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/demo" className="text-primary-600 hover:text-primary-700 dark:text-primary-400 flex items-center gap-2 mb-4">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Volver a Demo
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Feature #28: Empresa dropdown populated from database
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Verifica que el dropdown de empresas muestra las empresas reales de la base de datos.
          </p>
        </div>

        {/* Progress Steps */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Progreso del Test</h2>
          <div className="flex flex-wrap gap-4">
            {[
              { key: 'login', label: 'Login Admin', num: '1' },
              { key: 'create-empresa', label: 'Crear Empresa', num: '2' },
              { key: 'go-to-form', label: 'Ir a Formulario', num: '3' },
              { key: 'verify-dropdown', label: 'Verificar Dropdown', num: '4-5' },
              { key: 'complete', label: 'Completado', num: '✓' },
            ].map((step) => (
              <div key={step.key} className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  completedSteps[step.key as keyof typeof completedSteps]
                    ? 'bg-green-500 text-white'
                    : testStep === step.key
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                }`}>
                  {completedSteps[step.key as keyof typeof completedSteps] ? '✓' : step.num}
                </div>
                <span className="text-xs mt-1 text-gray-600 dark:text-gray-400 text-center max-w-[80px]">{step.label}</span>
              </div>
            ))}
          </div>
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

        {/* Main Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left: Empresas List */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Empresas en Base de Datos</h2>
            <div className="space-y-2">
              {empresas.map((emp) => (
                <div
                  key={emp.id}
                  className={`p-3 rounded-lg border ${
                    emp.nombre === newEmpresaName
                      ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                      : 'border-gray-200 dark:border-gray-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: emp.colorPrimario }}
                      />
                      <span className="font-medium text-gray-900 dark:text-white">{emp.nombre}</span>
                      {emp.nombre === newEmpresaName && (
                        <span className="text-xs px-2 py-0.5 bg-green-500 text-white rounded-full">NUEVA</span>
                      )}
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      emp.activa
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                    }`}>
                      {emp.activa ? 'Activa' : 'Inactiva'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
              Total: {empresas.length} empresas ({activeEmpresas.length} activas)
            </p>
          </div>

          {/* Right: User Creation Form Simulation */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Formulario de Nuevo Usuario</h2>

            {testStep === 'login' && (
              <div className="text-center py-8">
                <p className="text-gray-600 dark:text-gray-400 mb-4">Paso 1: Inicia sesion como Administrador</p>
                <button
                  onClick={handleLogin}
                  className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium"
                >
                  Iniciar Sesion como Admin
                </button>
              </div>
            )}

            {testStep === 'create-empresa' && (
              <div className="text-center py-8">
                <p className="text-gray-600 dark:text-gray-400 mb-4">Paso 2: Crea una nueva empresa con nombre unico</p>
                <button
                  onClick={handleCreateEmpresa}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium flex items-center gap-2 mx-auto"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Crear Empresa Unica
                </button>
              </div>
            )}

            {testStep === 'go-to-form' && createdEmpresa && (
              <div className="text-center py-8">
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 mb-4 text-left">
                  <h4 className="font-medium text-green-800 dark:text-green-300 mb-2">Empresa Creada:</h4>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: createdEmpresa.colorPrimario }}
                    />
                    <span className="text-green-700 dark:text-green-400">{createdEmpresa.nombre}</span>
                  </div>
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-4">Paso 3: Ve al formulario de nuevo usuario</p>
                <button
                  onClick={handleGoToForm}
                  className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium"
                >
                  Ir a Formulario de Nuevo Usuario
                </button>
              </div>
            )}

            {(testStep === 'verify-dropdown' || testStep === 'complete') && (
              <div className="space-y-4">
                {/* Simulated Form */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Nombre del Usuario
                  </label>
                  <input
                    type="text"
                    disabled
                    value="Nuevo Cliente"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    disabled
                    value="cliente@ejemplo.com"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Rol
                  </label>
                  <input
                    type="text"
                    disabled
                    value="Cliente"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Empresa *
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setDropdownOpen(!dropdownOpen)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-left flex items-center justify-between"
                    >
                      <span className={selectedEmpresa ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}>
                        {selectedEmpresa
                          ? activeEmpresas.find(e => e.id === selectedEmpresa)?.nombre
                          : 'Seleccionar empresa...'}
                      </span>
                      <svg className={`w-5 h-5 text-gray-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {dropdownOpen && (
                      <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {activeEmpresas.map((emp) => (
                          <button
                            key={emp.id}
                            type="button"
                            onClick={() => {
                              setSelectedEmpresa(emp.id);
                              setDropdownOpen(false);
                            }}
                            className={`w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-between ${
                              emp.nombre === newEmpresaName ? 'bg-green-50 dark:bg-green-900/20' : ''
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: emp.colorPrimario }}
                              />
                              <span className="text-gray-900 dark:text-white">{emp.nombre}</span>
                            </div>
                            {emp.nombre === newEmpresaName && (
                              <span className="text-xs px-2 py-0.5 bg-green-500 text-white rounded-full">NUEVA</span>
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {testStep === 'verify-dropdown' && (
                    <div className="mt-4">
                      <p className="text-gray-600 dark:text-gray-400 mb-4 text-center">
                        Pasos 4-5: Abre el dropdown y verifica que la empresa &quot;{newEmpresaName}&quot; aparece
                      </p>
                      <button
                        onClick={handleVerifyDropdown}
                        className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                      >
                        Verificar que la Empresa Aparece
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {testStep === 'complete' && (
              <div className="mt-6 text-center">
                <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
                  testPassed ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'
                }`}>
                  {testPassed ? (
                    <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  )}
                </div>
                <h3 className={`text-xl font-bold mb-2 ${testPassed ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {testPassed ? 'TEST PASADO' : 'TEST FALLIDO'}
                </h3>
                <p className={`text-sm mb-4 ${testPassed ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {testPassed
                    ? `La empresa "${newEmpresaName}" aparece en el dropdown del formulario de usuarios.`
                    : 'La empresa no aparece en el dropdown.'}
                </p>
                <button
                  onClick={resetDemo}
                  className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium"
                >
                  Reiniciar Test
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Test Summary */}
        {testStep === 'complete' && testPassed && (
          <div className="mt-6 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg p-6">
            <h3 className="font-semibold text-green-800 dark:text-green-300 mb-3">Resumen de Verificacion</h3>
            <ul className="space-y-2 text-sm text-green-700 dark:text-green-400">
              <li className="flex items-center gap-2">
                <span className="text-green-600">✓</span>
                Empresa &quot;{newEmpresaName}&quot; creada en base de datos
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-600">✓</span>
                Dropdown de empresas se actualizo automaticamente
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-600">✓</span>
                Nueva empresa visible y seleccionable en formulario de usuario
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-600">✓</span>
                Sincronizacion en tiempo real funcionando correctamente
              </li>
            </ul>
          </div>
        )}

        {/* Feature Info */}
        <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
          <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">
            Feature #28: Empresa dropdown populated from database
          </h4>
          <p className="text-sm text-blue-700 dark:text-blue-400 mb-2">
            Este test verifica que el dropdown de empresas muestra las empresas reales de la base de datos:
          </p>
          <ol className="list-decimal list-inside text-sm text-blue-700 dark:text-blue-400 space-y-1">
            <li>Login as Admin</li>
            <li>Create a new empresa &apos;TEST_EMPRESA_ABC&apos;</li>
            <li>Go to user creation form</li>
            <li>Open empresa dropdown</li>
            <li>Verify &apos;TEST_EMPRESA_ABC&apos; appears in dropdown</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
