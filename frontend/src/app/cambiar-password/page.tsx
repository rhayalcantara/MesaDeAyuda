'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { ChangePasswordRequest } from '@/types';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function CambiarPasswordPage() {
  const { user, updateUser, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();

  const [formData, setFormData] = useState<ChangePasswordRequest>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Check if this is a mandatory password change
  const isMandatory = user?.requiereCambioPassword === true;

  // Password strength indicator
  const getPasswordStrength = (password: string): { strength: number; label: string; color: string } => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;

    if (strength <= 2) return { strength, label: 'Debil', color: 'bg-red-500' };
    if (strength <= 3) return { strength, label: 'Moderada', color: 'bg-yellow-500' };
    if (strength <= 4) return { strength, label: 'Buena', color: 'bg-blue-500' };
    return { strength, label: 'Excelente', color: 'bg-green-500' };
  };

  const passwordStrength = getPasswordStrength(formData.newPassword);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Current password is always required
    if (!formData.currentPassword) {
      newErrors.currentPassword = isMandatory
        ? 'Ingrese la contraseña temporal que recibió'
        : 'La contraseña actual es requerida';
    }

    // New password validation
    if (!formData.newPassword) {
      newErrors.newPassword = 'La nueva contraseña es requerida';
    } else {
      if (formData.newPassword.length < 8) {
        newErrors.newPassword = 'La contraseña debe tener al menos 8 caracteres';
      } else if (!/[A-Z]/.test(formData.newPassword)) {
        newErrors.newPassword = 'La contraseña debe contener al menos una mayuscula';
      } else if (!/[a-z]/.test(formData.newPassword)) {
        newErrors.newPassword = 'La contraseña debe contener al menos una minuscula';
      } else if (!/[0-9]/.test(formData.newPassword)) {
        newErrors.newPassword = 'La contraseña debe contener al menos un numero';
      }
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Debe confirmar la nueva contraseña';
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }

    // Ensure new password is different from current
    if (formData.currentPassword && formData.newPassword === formData.currentPassword) {
      newErrors.newPassword = 'La nueva contraseña debe ser diferente a la actual';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // Call the API to change password
      await api.post('/auth/cambiar-password', formData);

      // Update user state to remove requiereCambioPassword flag
      if (user) {
        updateUser({ ...user, requiereCambioPassword: false });
      }

      toast.success('Contraseña actualizada exitosamente');

      // Redirect to appropriate dashboard based on role
      if (user) {
        switch (user.rol) {
          case 'Admin':
            router.push('/admin/dashboard');
            break;
          case 'Empleado':
            router.push('/empleado/dashboard');
            break;
          case 'Cliente':
            router.push('/cliente/tickets');
            break;
          default:
            router.push('/');
        }
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Error al cambiar la contraseña';
      toast.error(message);

      // Handle specific error cases
      if (error.response?.status === 401) {
        setErrors({ currentPassword: 'La contraseña actual es incorrecta' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Prevent navigation away for mandatory password changes
  useEffect(() => {
    if (isMandatory) {
      const handleBeforeUnload = (e: BeforeUnloadEvent) => {
        e.preventDefault();
        e.returnValue = '';
      };
      window.addEventListener('beforeunload', handleBeforeUnload);
      return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }
  }, [isMandatory]);

  return (
    <div className={`min-h-screen flex flex-col ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Header */}
      <header className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <span className="text-xl font-bold text-blue-600">MDAyuda</span>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={toggleTheme}
                className={`p-2 rounded-md ${theme === 'dark' ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-500 hover:bg-gray-100'}`}
                aria-label={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
              >
                {theme === 'dark' ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                    <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                  </svg>
                )}
              </button>
              {!isMandatory && (
                <button
                  onClick={logout}
                  className={`text-sm ${theme === 'dark' ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}
                >
                  Cerrar sesion
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className={`max-w-md w-full space-y-8 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} p-8 rounded-lg shadow-lg`}>
          {/* Alert for mandatory password change */}
          {isMandatory && (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6" role="alert">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">
                    <strong>Cambio de contraseña obligatorio.</strong> Por seguridad, debe cambiar su contraseña temporal antes de continuar.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="text-center">
            <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {isMandatory ? 'Establecer Nueva Contraseña' : 'Cambiar Contraseña'}
            </h1>
            <p className={`mt-2 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              {isMandatory
                ? 'Cree una contraseña segura para su cuenta'
                : 'Actualice su contraseña para mantener su cuenta segura'
              }
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            {/* Current password - always shown */}
            <div>
              <label htmlFor="currentPassword" className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                {isMandatory ? 'Contraseña temporal' : 'Contraseña actual'}
              </label>
              <div className="mt-1 relative">
                <input
                  id="currentPassword"
                  name="currentPassword"
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={formData.currentPassword}
                  onChange={handleChange}
                  className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                    errors.currentPassword
                      ? 'border-red-300 text-red-900'
                      : theme === 'dark'
                        ? 'border-gray-600 bg-gray-700 text-white'
                        : 'border-gray-300'
                  }`}
                  aria-invalid={errors.currentPassword ? 'true' : 'false'}
                  aria-describedby={errors.currentPassword ? 'currentPassword-error' : undefined}
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  aria-label={showCurrentPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showCurrentPassword ? (
                    <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              {errors.currentPassword && (
                <p id="currentPassword-error" className="mt-1 text-sm text-red-600" role="alert">
                  {errors.currentPassword}
                </p>
              )}
            </div>

            {/* New password */}
            <div>
              <label htmlFor="newPassword" className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Nueva contraseña
              </label>
              <div className="mt-1 relative">
                <input
                  id="newPassword"
                  name="newPassword"
                  type={showNewPassword ? 'text' : 'password'}
                  value={formData.newPassword}
                  onChange={handleChange}
                  className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                    errors.newPassword
                      ? 'border-red-300 text-red-900'
                      : theme === 'dark'
                        ? 'border-gray-600 bg-gray-700 text-white'
                        : 'border-gray-300'
                  }`}
                  aria-invalid={errors.newPassword ? 'true' : 'false'}
                  aria-describedby={errors.newPassword ? 'newPassword-error' : 'password-requirements'}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  aria-label={showNewPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showNewPassword ? (
                    <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              {errors.newPassword ? (
                <p id="newPassword-error" className="mt-1 text-sm text-red-600" role="alert">
                  {errors.newPassword}
                </p>
              ) : (
                <div id="password-requirements" className="mt-2">
                  <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    Requisitos: minimo 8 caracteres, una mayuscula, una minuscula y un numero
                  </p>
                  {formData.newPassword && (
                    <div className="mt-2">
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${passwordStrength.color} transition-all`}
                            style={{ width: `${(passwordStrength.strength / 5) * 100}%` }}
                          />
                        </div>
                        <span className={`text-xs font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          {passwordStrength.label}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Confirm password */}
            <div>
              <label htmlFor="confirmPassword" className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Confirmar nueva contraseña
              </label>
              <div className="mt-1 relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                    errors.confirmPassword
                      ? 'border-red-300 text-red-900'
                      : theme === 'dark'
                        ? 'border-gray-600 bg-gray-700 text-white'
                        : 'border-gray-300'
                  }`}
                  aria-invalid={errors.confirmPassword ? 'true' : 'false'}
                  aria-describedby={errors.confirmPassword ? 'confirmPassword-error' : undefined}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  aria-label={showConfirmPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showConfirmPassword ? (
                    <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p id="confirmPassword-error" className="mt-1 text-sm text-red-600" role="alert">
                  {errors.confirmPassword}
                </p>
              )}
              {formData.confirmPassword && !errors.confirmPassword && formData.newPassword === formData.confirmPassword && (
                <p className="mt-1 text-sm text-green-600 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Las contraseñas coinciden
                </p>
              )}
            </div>

            {/* Submit button */}
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed ${
                  theme === 'dark' ? 'focus:ring-offset-gray-800' : ''
                }`}
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Actualizando...
                  </span>
                ) : (
                  isMandatory ? 'Establecer contraseña' : 'Actualizar contraseña'
                )}
              </button>
            </div>

            {/* Cancel button - only for non-mandatory changes */}
            {!isMandatory && (
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className={`text-sm ${theme === 'dark' ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-900'}`}
                >
                  Cancelar y volver
                </button>
              </div>
            )}
          </form>
        </div>
      </main>
    </div>
  );
}
