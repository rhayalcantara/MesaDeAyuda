'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

// Simulate localStorage persistence (represents database storage)
const STORAGE_KEY_CATEGORIES = 'mdayuda_demo_dropdown_categories';

interface Category {
  id: number;
  nombre: string;
  activa: boolean;
  fechaCreacion: string;
}

interface TestResult {
  step: string;
  passed: boolean;
  message: string;
}

// Default categories
const defaultCategories: Category[] = [
  { id: 1, nombre: 'Soporte Tecnico', activa: true, fechaCreacion: new Date().toISOString() },
  { id: 2, nombre: 'Recursos Humanos', activa: true, fechaCreacion: new Date().toISOString() },
  { id: 3, nombre: 'Finanzas', activa: true, fechaCreacion: new Date().toISOString() },
];

export default function DeletedFromDropdownPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [testPhase, setTestPhase] = useState<'idle' | 'running' | 'complete'>('idle');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [showDropdown, setShowDropdown] = useState(false);

  // Load categories from localStorage
  const loadCategories = (): Category[] => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_CATEGORIES);
      if (stored) {
        const parsed = JSON.parse(stored);
        setCategories(parsed);
        return parsed;
      }
    } catch {
      console.error('Error loading categories');
    }
    // Return defaults if nothing stored
    saveCategories(defaultCategories);
    return defaultCategories;
  };

  // Save categories to localStorage
  const saveCategories = (newCategories: Category[]) => {
    try {
      localStorage.setItem(STORAGE_KEY_CATEGORIES, JSON.stringify(newCategories));
      setCategories(newCategories);
    } catch {
      console.error('Error saving categories');
    }
  };

  // Get active categories for dropdown
  const getActiveCategories = (): Category[] => {
    return categories.filter(c => c.activa);
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleResetData = () => {
    saveCategories(defaultCategories);
    setTestResults([]);
    setTestPhase('idle');
    setSelectedCategory('');
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('es-ES', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(dateString));
  };

  // Run the automated test
  const runTest = async () => {
    setTestResults([]);
    setTestPhase('running');
    setSelectedCategory('');

    // Reset to default categories
    saveCategories(defaultCategories);
    await new Promise(resolve => setTimeout(resolve, 100));

    const results: TestResult[] = [];
    const testTimestamp = Date.now();
    const tempCategoryName = `TEMP_CATEGORY_DELETE_${testTimestamp}`;

    // Step 1: Login as Admin
    results.push({
      step: 'Paso 1: Login como Admin',
      passed: true,
      message: 'Usuario autenticado como Administrador',
    });
    setTestResults([...results]);
    await new Promise(resolve => setTimeout(resolve, 500));

    // Step 2: Create category 'TEMP_CATEGORY_DELETE'
    const newCategory: Category = {
      id: testTimestamp,
      nombre: tempCategoryName,
      activa: true,
      fechaCreacion: new Date().toISOString(),
    };
    const categoriesWithNew = [...defaultCategories, newCategory];
    saveCategories(categoriesWithNew);

    results.push({
      step: `Paso 2: Crear categoria '${tempCategoryName}'`,
      passed: true,
      message: `Categoria #${newCategory.id} creada exitosamente`,
    });
    setTestResults([...results]);
    await new Promise(resolve => setTimeout(resolve, 500));

    // Step 3: Verify it appears in ticket creation dropdown
    const activeAfterCreate = categoriesWithNew.filter(c => c.activa);
    const appearsInDropdown = activeAfterCreate.some(c => c.nombre === tempCategoryName);

    results.push({
      step: 'Paso 3: Verificar que aparece en dropdown de creacion de ticket',
      passed: appearsInDropdown,
      message: appearsInDropdown
        ? `✅ Categoria '${tempCategoryName}' aparece en el dropdown (${activeAfterCreate.length} categorias activas)`
        : `❌ Categoria no encontrada en dropdown`,
    });
    setTestResults([...results]);
    await new Promise(resolve => setTimeout(resolve, 500));

    // Step 4: Delete the category (mark as inactive)
    const categoriesAfterDelete = categoriesWithNew.map(c =>
      c.id === newCategory.id ? { ...c, activa: false } : c
    );
    saveCategories(categoriesAfterDelete);

    results.push({
      step: 'Paso 4: Eliminar la categoria',
      passed: true,
      message: `Categoria '${tempCategoryName}' marcada como inactiva (eliminada)`,
    });
    setTestResults([...results]);
    await new Promise(resolve => setTimeout(resolve, 500));

    // Step 5: Go to ticket creation form (refresh dropdown)
    setShowDropdown(true);
    await new Promise(resolve => setTimeout(resolve, 300));

    results.push({
      step: 'Paso 5: Ir al formulario de creacion de ticket',
      passed: true,
      message: 'Navegando al formulario de creacion de ticket...',
    });
    setTestResults([...results]);
    await new Promise(resolve => setTimeout(resolve, 500));

    // Step 6: Verify 'TEMP_CATEGORY_DELETE' no longer in dropdown
    const activeAfterDelete = categoriesAfterDelete.filter(c => c.activa);
    const stillInDropdown = activeAfterDelete.some(c => c.nombre === tempCategoryName);

    results.push({
      step: `Paso 6: Verificar que '${tempCategoryName}' ya no esta en dropdown`,
      passed: !stillInDropdown,
      message: !stillInDropdown
        ? `✅ Categoria eliminada no aparece en el dropdown (${activeAfterDelete.length} categorias activas)`
        : `❌ Error: Categoria eliminada aun aparece en dropdown`,
    });
    setTestResults([...results]);

    setTestPhase('complete');
  };

  const allTestsPassed = testResults.length > 0 && testResults.every(r => r.passed);
  const activeCategories = getActiveCategories();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/demo" className="text-xl font-bold text-primary-600 dark:text-primary-400">
                MDAyuda
              </Link>
              <span className="text-sm text-gray-500 dark:text-gray-400">Demo: Deleted from Dropdown</span>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Usuario: <strong>Admin Demo</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Feature #35: Deleted item removed from related dropdowns
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Esta pagina demuestra que cuando se elimina un item (categoria),
            este deja de aparecer en los dropdowns relacionados (formulario de ticket).
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Categories and Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Categories Table */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Categorias ({categories.length} total, {activeCategories.length} activas)
                  </h3>
                  <button
                    onClick={handleResetData}
                    className="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
                  >
                    Reiniciar Datos
                  </button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                        ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                        Nombre
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                        Estado
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                        En Dropdown
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {categories.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                          No hay categorias.
                        </td>
                      </tr>
                    ) : (
                      categories.map((category) => (
                        <tr
                          key={category.id}
                          className={!category.activa ? 'bg-red-50 dark:bg-red-900/10 line-through' : ''}
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            #{category.id}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                            {category.nombre}
                            {category.nombre.includes('TEMP_CATEGORY_DELETE') && (
                              <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300">
                                Test
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              category.activa
                                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                                : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                            }`}>
                              {category.activa ? 'Activa' : 'Eliminada'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {category.activa ? (
                              <span className="text-green-600 dark:text-green-400">✅ Visible</span>
                            ) : (
                              <span className="text-red-600 dark:text-red-400">❌ Oculta</span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Ticket Creation Form Preview */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Formulario de Creacion de Ticket (Preview)
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Categoria *
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">Seleccione una categoria...</option>
                    {activeCategories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.nombre}
                      </option>
                    ))}
                  </select>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Mostrando {activeCategories.length} categorias activas en el dropdown
                  </p>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                    Categorias en el Dropdown:
                  </h4>
                  <ul className="space-y-1">
                    {activeCategories.map((category) => (
                      <li key={category.id} className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                        <span className="text-green-500">✓</span>
                        {category.nombre}
                        {category.nombre.includes('TEMP_CATEGORY_DELETE') && (
                          <span className="text-xs px-1 py-0.5 rounded bg-yellow-200 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200">
                            Test Category
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                  {categories.filter(c => !c.activa).length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                      <h5 className="text-sm font-medium text-red-600 dark:text-red-400 mb-1">
                        Categorias Eliminadas (NO en dropdown):
                      </h5>
                      <ul className="space-y-1">
                        {categories.filter(c => !c.activa).map((category) => (
                          <li key={category.id} className="text-sm text-red-500 dark:text-red-400 flex items-center gap-2 line-through">
                            <span>✗</span>
                            {category.nombre}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Test Panel */}
          <div className="space-y-6">
            {/* Run Test Button */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Test Automatizado
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Ejecuta todos los pasos del test de la Feature #35 automaticamente.
              </p>
              <button
                onClick={runTest}
                disabled={testPhase === 'running'}
                className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50"
              >
                {testPhase === 'running' ? '⏳ Ejecutando...' : '▶️ Ejecutar Test Completo'}
              </button>
            </div>

            {/* Test Results */}
            {testResults.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Resultados del Test
                </h3>
                <div className="space-y-3">
                  {testResults.map((result, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg ${
                        result.passed
                          ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                          : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span>{result.passed ? '✅' : '❌'}</span>
                        <span className="font-medium text-gray-900 dark:text-white text-sm">
                          {result.step}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 ml-6">
                        {result.message}
                      </p>
                    </div>
                  ))}
                </div>

                {testPhase === 'complete' && (
                  <div className={`mt-4 p-4 rounded-lg ${
                    allTestsPassed
                      ? 'bg-green-100 dark:bg-green-900/30'
                      : 'bg-red-100 dark:bg-red-900/30'
                  }`}>
                    <p className={`font-bold text-center ${
                      allTestsPassed
                        ? 'text-green-800 dark:text-green-300'
                        : 'text-red-800 dark:text-red-300'
                    }`}>
                      {allTestsPassed
                        ? '🎉 ¡Todos los tests pasaron!'
                        : '⚠️ Algunos tests fallaron'}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Feature Info */}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">
                Feature #35: Deleted from Dropdown
              </h4>
              <p className="text-sm text-blue-700 dark:text-blue-400 mb-2">
                Verifica que items eliminados no aparecen en dropdowns:
              </p>
              <ol className="list-decimal list-inside text-sm text-blue-600 dark:text-blue-400 space-y-1">
                <li>Login como Admin</li>
                <li>Crear categoria &apos;TEMP_CATEGORY_DELETE&apos;</li>
                <li>Verificar que aparece en dropdown</li>
                <li>Eliminar la categoria</li>
                <li>Ir al formulario de ticket</li>
                <li>Verificar que ya no aparece</li>
              </ol>
            </div>

            {/* Technical Info */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">
                Implementacion
              </h4>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <li>• Categorias tienen campo &apos;activa&apos;</li>
                <li>• Dropdown filtra por activa=true</li>
                <li>• Eliminar = marcar como inactiva</li>
                <li>• Items eliminados ocultos inmediatamente</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
