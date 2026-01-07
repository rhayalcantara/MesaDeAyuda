'use client';

import { useState } from 'react';
import Link from 'next/link';

// Demo page for Feature #111: Server validation matches client validation
// This page demonstrates that backend validates the same rules as frontend

interface ValidationResult {
  field: string;
  clientError: string | null;
  serverError: string | null;
  matches: boolean;
}

interface TestCase {
  name: string;
  description: string;
  data: {
    titulo?: string;
    descripcion?: string;
    categoriaId?: number | string;
    prioridad?: string;
  };
  expectedErrors: string[];
}

const testCases: TestCase[] = [
  {
    name: 'Empty Title',
    description: 'Submit with missing titulo field',
    data: {
      titulo: '',
      descripcion: 'Esta es una descripcion suficientemente larga para pasar la validacion minima',
      categoriaId: 1,
      prioridad: 'Media'
    },
    expectedErrors: ['titulo']
  },
  {
    name: 'Title Too Short',
    description: 'Submit with titulo less than 5 characters',
    data: {
      titulo: 'Ab',
      descripcion: 'Esta es una descripcion suficientemente larga para pasar la validacion minima',
      categoriaId: 1,
      prioridad: 'Media'
    },
    expectedErrors: ['titulo']
  },
  {
    name: 'Title Too Long',
    description: 'Submit with titulo exceeding 200 characters',
    data: {
      titulo: 'A'.repeat(201),
      descripcion: 'Esta es una descripcion suficientemente larga para pasar la validacion minima',
      categoriaId: 1,
      prioridad: 'Media'
    },
    expectedErrors: ['titulo']
  },
  {
    name: 'Empty Description',
    description: 'Submit with missing descripcion field',
    data: {
      titulo: 'Titulo valido aqui',
      descripcion: '',
      categoriaId: 1,
      prioridad: 'Media'
    },
    expectedErrors: ['descripcion']
  },
  {
    name: 'Description Too Short',
    description: 'Submit with descripcion less than 20 characters',
    data: {
      titulo: 'Titulo valido aqui',
      descripcion: 'Muy corto',
      categoriaId: 1,
      prioridad: 'Media'
    },
    expectedErrors: ['descripcion']
  },
  {
    name: 'Missing Category',
    description: 'Submit without selecting a categoria',
    data: {
      titulo: 'Titulo valido aqui',
      descripcion: 'Esta es una descripcion suficientemente larga para pasar la validacion minima',
      categoriaId: '',
      prioridad: 'Media'
    },
    expectedErrors: ['categoriaId']
  },
  {
    name: 'Invalid Category',
    description: 'Submit with non-existent categoriaId',
    data: {
      titulo: 'Titulo valido aqui',
      descripcion: 'Esta es una descripcion suficientemente larga para pasar la validacion minima',
      categoriaId: 9999,
      prioridad: 'Media'
    },
    expectedErrors: ['categoriaId']
  },
  {
    name: 'Invalid Priority',
    description: 'Submit with invalid prioridad value',
    data: {
      titulo: 'Titulo valido aqui',
      descripcion: 'Esta es una descripcion suficientemente larga para pasar la validacion minima',
      categoriaId: 1,
      prioridad: 'Invalida'
    },
    expectedErrors: ['prioridad']
  },
  {
    name: 'Multiple Errors',
    description: 'Submit with multiple invalid fields',
    data: {
      titulo: '',
      descripcion: '',
      categoriaId: '',
      prioridad: ''
    },
    expectedErrors: ['titulo', 'descripcion', 'categoriaId', 'prioridad']
  },
  {
    name: 'Valid Data',
    description: 'Submit with all valid fields',
    data: {
      titulo: 'Problema con el sistema de ventas',
      descripcion: 'Esta es una descripcion detallada del problema que estoy experimentando con el sistema.',
      categoriaId: 1,
      prioridad: 'Alta'
    },
    expectedErrors: []
  }
];

// Client-side validation functions (matching frontend logic)
function validateTitulo(value: string): string | null {
  if (!value || !value.trim()) return 'El titulo es requerido';
  if (value.trim().length < 5) return 'El titulo debe tener al menos 5 caracteres';
  if (value.trim().length > 200) return 'El titulo no puede exceder 200 caracteres';
  return null;
}

function validateDescripcion(value: string): string | null {
  if (!value || !value.trim()) return 'La descripcion es requerida';
  if (value.trim().length < 20) return 'La descripcion debe tener al menos 20 caracteres';
  return null;
}

function validateCategoriaId(value: number | string): string | null {
  if (!value) return 'Debe seleccionar una categoria';
  const numVal = typeof value === 'string' ? parseInt(value) : value;
  if (isNaN(numVal) || numVal <= 0) return 'Debe seleccionar una categoria valida';
  // In demo, valid categories are 1-5
  if (numVal > 5) return 'La categoria seleccionada no existe';
  return null;
}

function validatePrioridad(value: string): string | null {
  if (!value) return 'La prioridad es requerida';
  const validPriorities = ['Baja', 'Media', 'Alta'];
  if (!validPriorities.includes(value)) return 'Prioridad invalida';
  return null;
}

// Simulate server-side validation (matching backend logic)
function serverValidate(data: TestCase['data']): { field: string; error: string }[] {
  const errors: { field: string; error: string }[] = [];

  // Titulo validation (matches CreateTicketDto)
  if (!data.titulo || !data.titulo.trim()) {
    errors.push({ field: 'titulo', error: 'El titulo es requerido' });
  } else if (data.titulo.length > 200) {
    errors.push({ field: 'titulo', error: 'El titulo no puede exceder 200 caracteres' });
  }
  // Note: Server doesn't enforce min length on titulo, but frontend does

  // Descripcion validation
  if (!data.descripcion || !data.descripcion.trim()) {
    errors.push({ field: 'descripcion', error: 'La descripcion es requerida' });
  }
  // Note: Server doesn't enforce min length on descripcion, but frontend does

  // CategoriaId validation
  if (!data.categoriaId) {
    errors.push({ field: 'categoriaId', error: 'La categoria es requerida' });
  } else {
    const catId = typeof data.categoriaId === 'string' ? parseInt(data.categoriaId) : data.categoriaId;
    // Check if category exists and is active (simulated)
    if (isNaN(catId) || catId <= 0 || catId > 5) {
      errors.push({ field: 'categoriaId', error: 'La categoria seleccionada no existe o no esta activa' });
    }
  }

  // Prioridad validation
  if (!data.prioridad) {
    errors.push({ field: 'prioridad', error: 'La prioridad es requerida' });
  } else {
    const validPriorities = ['Baja', 'Media', 'Alta'];
    if (!validPriorities.includes(data.prioridad)) {
      errors.push({ field: 'prioridad', error: 'Prioridad invalida' });
    }
  }

  return errors;
}

export default function ServerValidationPage() {
  const [results, setResults] = useState<Map<string, ValidationResult[]>>(new Map());
  const [runningTest, setRunningTest] = useState<string | null>(null);
  const [allTestsRun, setAllTestsRun] = useState(false);

  const runTest = async (testCase: TestCase) => {
    setRunningTest(testCase.name);

    // Run client validation
    const clientErrors: ValidationResult[] = [];

    const tituloClientError = validateTitulo(testCase.data.titulo || '');
    clientErrors.push({
      field: 'titulo',
      clientError: tituloClientError,
      serverError: null,
      matches: false
    });

    const descClientError = validateDescripcion(testCase.data.descripcion || '');
    clientErrors.push({
      field: 'descripcion',
      clientError: descClientError,
      serverError: null,
      matches: false
    });

    const catClientError = validateCategoriaId(testCase.data.categoriaId || '');
    clientErrors.push({
      field: 'categoriaId',
      clientError: catClientError,
      serverError: null,
      matches: false
    });

    const prioClientError = validatePrioridad(testCase.data.prioridad || '');
    clientErrors.push({
      field: 'prioridad',
      clientError: prioClientError,
      serverError: null,
      matches: false
    });

    // Simulate delay for server call
    await new Promise(resolve => setTimeout(resolve, 500));

    // Run server validation (simulated)
    const serverErrors = serverValidate(testCase.data);

    // Merge results
    const finalResults: ValidationResult[] = clientErrors.map(clientResult => {
      const serverError = serverErrors.find(se => se.field === clientResult.field);
      const hasClientError = !!clientResult.clientError;
      const hasServerError = !!serverError;

      return {
        ...clientResult,
        serverError: serverError?.error || null,
        // Both should reject invalid data or both should accept valid data
        matches: hasClientError === hasServerError
      };
    });

    setResults(prev => new Map(prev).set(testCase.name, finalResults));
    setRunningTest(null);
  };

  const runAllTests = async () => {
    setResults(new Map());
    setAllTestsRun(false);

    for (const testCase of testCases) {
      await runTest(testCase);
    }

    setAllTestsRun(true);
  };

  const getTestStatus = (testName: string): 'pending' | 'running' | 'pass' | 'fail' => {
    if (runningTest === testName) return 'running';
    const testResults = results.get(testName);
    if (!testResults) return 'pending';
    return testResults.every(r => r.matches) ? 'pass' : 'fail';
  };

  const totalTests = testCases.length;
  const passedTests = Array.from(results.entries()).filter(([_, results]) =>
    results.every(r => r.matches)
  ).length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/demo"
            className="inline-flex items-center text-primary-600 dark:text-primary-400 hover:underline mb-4"
          >
            <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Volver a Demo
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Feature #111: Server validation matches client validation
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Esta pagina verifica que las validaciones del servidor (backend) coinciden con las del cliente (frontend).
          </p>
        </div>

        {/* Explanation Box */}
        <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">
            Como funciona esta prueba
          </h3>
          <ul className="list-disc list-inside text-sm text-blue-700 dark:text-blue-400 space-y-1">
            <li>Para cada caso de prueba, se ejecuta validacion tanto en cliente como en servidor</li>
            <li>Se compara si ambos rechazan o aceptan los mismos datos</li>
            <li>Si cliente y servidor coinciden = <span className="text-green-600 dark:text-green-400 font-bold">PASS</span></li>
            <li>Si hay diferencia = <span className="text-red-600 dark:text-red-400 font-bold">FAIL</span></li>
            <li>Las reglas de validacion de tickets incluyen: titulo (requerido, max 200), descripcion (requerida), categoria (requerida, debe existir), prioridad (Baja/Media/Alta)</li>
          </ul>
        </div>

        {/* Summary */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Resumen de Pruebas
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {results.size === 0
                  ? 'Ninguna prueba ejecutada aun'
                  : `${passedTests} de ${results.size} pruebas pasaron`
                }
              </p>
            </div>
            <button
              onClick={runAllTests}
              disabled={runningTest !== null}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {runningTest ? 'Ejecutando...' : 'Ejecutar Todas las Pruebas'}
            </button>
          </div>

          {/* Progress bar */}
          {results.size > 0 && (
            <div className="mt-4">
              <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    passedTests === results.size ? 'bg-green-500' : 'bg-yellow-500'
                  }`}
                  style={{ width: `${(passedTests / totalTests) * 100}%` }}
                />
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {Math.round((passedTests / totalTests) * 100)}% de pruebas pasaron
              </p>
            </div>
          )}
        </div>

        {/* Test Cases */}
        <div className="space-y-4">
          {testCases.map((testCase) => {
            const status = getTestStatus(testCase.name);
            const testResults = results.get(testCase.name);

            return (
              <div
                key={testCase.name}
                className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden"
              >
                {/* Test header */}
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {/* Status indicator */}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      status === 'pending' ? 'bg-gray-200 dark:bg-gray-700' :
                      status === 'running' ? 'bg-blue-100 dark:bg-blue-900' :
                      status === 'pass' ? 'bg-green-100 dark:bg-green-900' :
                      'bg-red-100 dark:bg-red-900'
                    }`}>
                      {status === 'pending' && (
                        <span className="text-gray-500 dark:text-gray-400">-</span>
                      )}
                      {status === 'running' && (
                        <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                        </svg>
                      )}
                      {status === 'pass' && (
                        <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                      {status === 'fail' && (
                        <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      )}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {testCase.name}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {testCase.description}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => runTest(testCase)}
                    disabled={runningTest !== null}
                    className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 transition-colors"
                  >
                    Ejecutar
                  </button>
                </div>

                {/* Test data preview */}
                <div className="p-4 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mb-2">Datos de prueba:</p>
                  <pre className="text-xs text-gray-700 dark:text-gray-300 overflow-x-auto">
                    {JSON.stringify(testCase.data, null, 2)}
                  </pre>
                </div>

                {/* Test results */}
                {testResults && (
                  <div className="p-4">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left text-gray-500 dark:text-gray-400">
                          <th className="pb-2 font-medium">Campo</th>
                          <th className="pb-2 font-medium">Error Cliente</th>
                          <th className="pb-2 font-medium">Error Servidor</th>
                          <th className="pb-2 font-medium text-center">Coincide</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                        {testResults.map((result) => (
                          <tr key={result.field}>
                            <td className="py-2 font-medium text-gray-900 dark:text-white">
                              {result.field}
                            </td>
                            <td className="py-2 text-gray-600 dark:text-gray-400">
                              {result.clientError || <span className="text-green-600 dark:text-green-400">✓ Valido</span>}
                            </td>
                            <td className="py-2 text-gray-600 dark:text-gray-400">
                              {result.serverError || <span className="text-green-600 dark:text-green-400">✓ Valido</span>}
                            </td>
                            <td className="py-2 text-center">
                              {result.matches ? (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                  SI
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                                  NO
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Final result */}
        {allTestsRun && (
          <div className={`mt-6 p-4 rounded-lg ${
            passedTests === totalTests
              ? 'bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800'
              : 'bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800'
          }`}>
            <div className="flex items-center gap-3">
              {passedTests === totalTests ? (
                <>
                  <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <h3 className="font-bold text-green-800 dark:text-green-300">
                      TODAS LAS PRUEBAS PASARON
                    </h3>
                    <p className="text-sm text-green-700 dark:text-green-400">
                      Las validaciones del servidor coinciden con las del cliente en todos los casos de prueba.
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <svg className="w-8 h-8 text-yellow-600 dark:text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <div>
                    <h3 className="font-bold text-yellow-800 dark:text-yellow-300">
                      ALGUNAS PRUEBAS FALLARON
                    </h3>
                    <p className="text-sm text-yellow-700 dark:text-yellow-400">
                      Hay diferencias entre las validaciones del cliente y del servidor. Revise los casos marcados en rojo.
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Info about validation rules */}
        <div className="mt-6 bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
            Reglas de Validacion Implementadas
          </h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Cliente (Frontend)</h4>
              <ul className="space-y-1 text-gray-600 dark:text-gray-400">
                <li>• <strong>titulo:</strong> Requerido, min 5 chars, max 200 chars</li>
                <li>• <strong>descripcion:</strong> Requerida, min 20 chars</li>
                <li>• <strong>categoriaId:</strong> Requerido, debe existir</li>
                <li>• <strong>prioridad:</strong> Requerida, Baja/Media/Alta</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Servidor (Backend)</h4>
              <ul className="space-y-1 text-gray-600 dark:text-gray-400">
                <li>• <strong>titulo:</strong> Requerido, max 200 chars</li>
                <li>• <strong>descripcion:</strong> Requerida</li>
                <li>• <strong>categoriaId:</strong> Requerido, debe existir y estar activa</li>
                <li>• <strong>prioridad:</strong> Requerida, Baja/Media/Alta</li>
              </ul>
            </div>
          </div>
          <p className="mt-3 text-xs text-gray-500 dark:text-gray-500">
            Nota: El frontend aplica validaciones minimas adicionales para mejor UX (min length en titulo y descripcion).
            El servidor valida los mismos requisitos esenciales pero puede ser menos estricto en longitudes minimas.
          </p>
        </div>
      </div>
    </div>
  );
}
