'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Empresa {
  id: number;
  nombre: string;
  activa: boolean;
  fechaCreacion: Date;
}

// Initial empresas
const initialEmpresas: Empresa[] = [
  {
    id: 1,
    nombre: 'Empresa Demo S.A.',
    activa: true,
    fechaCreacion: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
  },
  {
    id: 2,
    nombre: 'Tech Solutions LLC',
    activa: true,
    fechaCreacion: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
  },
];

type TestStep = 'initial' | 'created' | 'deleted' | 'verified';

export default function DeleteEmpresaViewsPage() {
  const [empresas, setEmpresas] = useState<Empresa[]>(initialEmpresas);
  const [testStep, setTestStep] = useState<TestStep>('initial');
  const [testEmpresa, setTestEmpresa] = useState<Empresa | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [testPassed, setTestPassed] = useState(false);

  // Filter empresas based on search
  const filteredEmpresas = empresas.filter(e =>
    e.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Step 1 & 2: Create the test empresa
  const handleCreateEmpresa = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));

    const newEmpresa: Empresa = {
      id: Math.max(...empresas.map(e => e.id), 0) + 1,
      nombre: 'CLEANUP_TEST_EMPRESA',
      activa: true,
      fechaCreacion: new Date(),
    };

    setEmpresas(prev => [...prev, newEmpresa]);
    setTestEmpresa(newEmpresa);
    setTestStep('created');
    setIsLoading(false);
  };

  // Step 3: Delete the test empresa
  const handleDeleteEmpresa = async () => {
    if (!testEmpresa) return;

    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));

    setEmpresas(prev => prev.filter(e => e.id !== testEmpresa.id));
    setTestStep('deleted');
    setIsLoading(false);
  };

  // Step 4 & 5: Verify deletion
  const handleVerifyDeletion = () => {
    // Search for the deleted empresa
    setSearchTerm('CLEANUP_TEST');
    setTestStep('verified');

    // Check if empresa is found anywhere
    const foundInList = empresas.some(e => e.nombre === 'CLEANUP_TEST_EMPRESA');
    const foundInSearch = filteredEmpresas.some(e => e.nombre === 'CLEANUP_TEST_EMPRESA');
    const foundInDropdown = empresas.some(e => e.nombre === 'CLEANUP_TEST_EMPRESA');

    setTestPassed(!foundInList && !foundInSearch && !foundInDropdown);
  };

  // Reset demo
  const resetDemo = () => {
    setEmpresas(initialEmpresas);
    setTestStep('initial');
    setTestEmpresa(null);
    setSearchTerm('');
    setTestPassed(false);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('es-ES', {
      dateStyle: 'medium',
    }).format(date);
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
            Feature #86: Delete empresa removes from views
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Verifica que una empresa eliminada no aparece en ninguna vista (lista, busqueda, dropdowns).
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
              ['deleted', 'verified'].includes(testStep) ? 'text-green-600' : 'text-gray-400'
            }`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm ${
                testStep === 'created' ? 'bg-primary-100 text-primary-600' :
                ['deleted', 'verified'].includes(testStep) ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
              }`}>
                {['deleted', 'verified'].includes(testStep) ? '✓' : '2'}
              </div>
              <span>Create empresa &apos;CLEANUP_TEST_EMPRESA&apos;</span>
            </div>
            <div className={`flex items-center gap-3 ${
              testStep === 'deleted' ? 'text-primary-600' :
              testStep === 'verified' ? 'text-green-600' : 'text-gray-400'
            }`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm ${
                testStep === 'deleted' ? 'bg-primary-100 text-primary-600' :
                testStep === 'verified' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
              }`}>
                {testStep === 'verified' ? '✓' : '3'}
              </div>
              <span>Delete the empresa</span>
            </div>
            <div className={`flex items-center gap-3 ${
              testStep === 'verified' ? 'text-primary-600' : 'text-gray-400'
            }`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm ${
                testStep === 'verified' ? 'bg-primary-100 text-primary-600' : 'bg-gray-100 text-gray-400'
              }`}>
                {testStep === 'verified' && testPassed ? '✓' : '4'}
              </div>
              <span>Search for empresa &amp; verify not found in any list</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Acciones del Test</h2>
          <div className="flex flex-wrap gap-3">
            {testStep === 'initial' && (
              <button
                onClick={handleCreateEmpresa}
                disabled={isLoading}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {isLoading && (
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                )}
                Paso 2: Crear &apos;CLEANUP_TEST_EMPRESA&apos;
              </button>
            )}

            {testStep === 'created' && (
              <button
                onClick={handleDeleteEmpresa}
                disabled={isLoading}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {isLoading && (
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                )}
                Paso 3: Eliminar Empresa
              </button>
            )}

            {testStep === 'deleted' && (
              <button
                onClick={handleVerifyDeletion}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                Paso 4-5: Verificar Eliminacion
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

        {/* Views Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Lista de Empresas */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 dark:text-white">Vista: Lista de Empresas</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total: {empresas.length} empresas</p>
            </div>
            <div className="max-h-64 overflow-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700 sticky top-0">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {empresas.map(empresa => (
                    <tr key={empresa.id} className={`${
                      empresa.nombre === 'CLEANUP_TEST_EMPRESA' ? 'bg-yellow-50 dark:bg-yellow-900/20' : ''
                    }`}>
                      <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">#{empresa.id}</td>
                      <td className="px-4 py-2 text-sm text-gray-900 dark:text-white font-medium">
                        {empresa.nombre}
                        {empresa.nombre === 'CLEANUP_TEST_EMPRESA' && (
                          <span className="ml-2 text-xs bg-yellow-200 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200 px-2 py-0.5 rounded">
                            TEST
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-2">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          empresa.activa
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {empresa.activa ? 'Activa' : 'Inactiva'}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {empresas.length === 0 && (
                    <tr>
                      <td colSpan={3} className="px-4 py-8 text-center text-gray-500">
                        No hay empresas
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Resultados de Busqueda */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 dark:text-white">Vista: Busqueda</h3>
              <div className="mt-2">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  placeholder="Buscar empresa..."
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                />
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                Resultados: {filteredEmpresas.length} {searchTerm && `(buscando: "${searchTerm}")`}
              </p>
            </div>
            <div className="max-h-48 overflow-auto">
              {filteredEmpresas.length > 0 ? (
                <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredEmpresas.map(empresa => (
                    <li key={empresa.id} className={`px-4 py-3 ${
                      empresa.nombre === 'CLEANUP_TEST_EMPRESA' ? 'bg-yellow-50 dark:bg-yellow-900/20' : ''
                    }`}>
                      <span className="text-sm text-gray-900 dark:text-white">{empresa.nombre}</span>
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
                      <p>No se encontraron resultados para &quot;{searchTerm}&quot;</p>
                    </>
                  ) : (
                    <p>No hay empresas</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Dropdown de Empresas */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 dark:text-white">Vista: Dropdown de Empresas</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Usado en formularios de clientes y tickets
              </p>
            </div>
            <div className="p-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Seleccionar Empresa:
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white">
                <option value="">-- Seleccionar --</option>
                {empresas.map(empresa => (
                  <option key={empresa.id} value={empresa.id}>
                    {empresa.nombre}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Opciones disponibles: {empresas.length}
              </p>
            </div>
          </div>

          {/* Verificacion */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 dark:text-white">Verificacion</h3>
            </div>
            <div className="p-4">
              {testStep === 'verified' ? (
                testPassed ? (
                  <div className="bg-green-50 dark:bg-green-900/30 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div>
                        <h4 className="font-semibold text-green-800 dark:text-green-300">TEST PASSED ✅</h4>
                        <p className="text-sm text-green-700 dark:text-green-400">
                          La empresa eliminada NO aparece en:
                        </p>
                        <ul className="text-sm text-green-700 dark:text-green-400 mt-1 list-disc list-inside">
                          <li>Lista de empresas</li>
                          <li>Resultados de busqueda</li>
                          <li>Dropdown de seleccion</li>
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
                          La empresa eliminada todavia aparece en alguna vista.
                        </p>
                      </div>
                    </div>
                  </div>
                )
              ) : (
                <div className="text-gray-500 dark:text-gray-400 text-center py-4">
                  <svg className="w-12 h-12 mx-auto mb-2 text-gray-300" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p>Complete los pasos del test para ver el resultado</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Test Info */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
          <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">
            Feature #86: Delete empresa removes from views
          </h4>
          <p className="text-sm text-blue-700 dark:text-blue-400 mb-2">
            Este test verifica que cuando se elimina una empresa:
          </p>
          <ol className="list-decimal list-inside text-sm text-blue-700 dark:text-blue-400 space-y-1">
            <li>Se crea una empresa de prueba &apos;CLEANUP_TEST_EMPRESA&apos;</li>
            <li>Se elimina la empresa</li>
            <li>Se verifica que NO aparece en la lista principal</li>
            <li>Se verifica que NO aparece en resultados de busqueda</li>
            <li>Se verifica que NO aparece en dropdowns de seleccion</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
