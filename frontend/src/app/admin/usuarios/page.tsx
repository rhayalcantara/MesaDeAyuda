'use client';

import { useState, useEffect, useCallback } from 'react';
import { MainLayout } from '@/components/layout';
import api from '@/lib/api';
import { UsuarioList, Empresa, UserRole, CreateUsuarioRequest, UpdateUsuarioRequest } from '@/types';

type TabType = 'empleados' | 'clientes';

interface UsuarioFormData {
  email: string;
  nombre: string;
  rol: UserRole;
  empresaId: number | null;
  activo: boolean;
}

export default function AdminUsuariosPage() {
  const [usuarios, setUsuarios] = useState<UsuarioList[]>([]);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('empleados');

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [editingUsuario, setEditingUsuario] = useState<UsuarioList | null>(null);
  const [formData, setFormData] = useState<UsuarioFormData>({
    email: '',
    nombre: '',
    rol: 'Empleado',
    empresaId: null,
    activo: true
  });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Password modal
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [tempPassword, setTempPassword] = useState<string | null>(null);
  const [passwordUsuario, setPasswordUsuario] = useState<string | null>(null);

  // Delete confirmation
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingUsuario, setDeletingUsuario] = useState<UsuarioList | null>(null);

  const fetchUsuarios = useCallback(async () => {
    try {
      setLoading(true);
      const rol = activeTab === 'empleados' ? 'Empleado' : 'Cliente';
      const response = await api.get(`/usuarios?rol=${rol}`);
      setUsuarios(response.data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  const fetchEmpresas = async () => {
    try {
      const response = await api.get('/empresas');
      setEmpresas(response.data);
    } catch (err) {
      console.error('Error al cargar empresas:', err);
    }
  };

  useEffect(() => {
    fetchUsuarios();
    fetchEmpresas();
  }, [fetchUsuarios]);

  const handleOpenModal = (usuario?: UsuarioList) => {
    if (usuario) {
      setEditingUsuario(usuario);
      setFormData({
        email: usuario.email,
        nombre: usuario.nombre,
        rol: usuario.rol,
        empresaId: usuario.empresaId,
        activo: usuario.activo
      });
    } else {
      setEditingUsuario(null);
      setFormData({
        email: '',
        nombre: '',
        rol: activeTab === 'empleados' ? 'Empleado' : 'Cliente',
        empresaId: null,
        activo: true
      });
    }
    setFormError(null);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingUsuario(null);
    setFormError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError(null);

    try {
      if (editingUsuario) {
        // Update
        const updateData: UpdateUsuarioRequest = {
          email: formData.email,
          nombre: formData.nombre,
          rol: formData.rol,
          empresaId: formData.empresaId,
          activo: formData.activo
        };
        await api.put(`/usuarios/${editingUsuario.id}`, updateData);
        handleCloseModal();
        fetchUsuarios();
      } else {
        // Create
        const createData: CreateUsuarioRequest = {
          email: formData.email,
          nombre: formData.nombre,
          rol: formData.rol,
          empresaId: formData.empresaId
        };
        const response = await api.post('/usuarios', createData);
        handleCloseModal();
        setTempPassword(response.data.temporaryPassword);
        setPasswordUsuario(formData.nombre);
        setShowPasswordModal(true);
        fetchUsuarios();
      }
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Error al guardar usuario');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (usuario: UsuarioList) => {
    try {
      await api.put(`/usuarios/${usuario.id}/toggle-active`);
      fetchUsuarios();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cambiar estado');
    }
  };

  const handleResetPassword = async (usuario: UsuarioList) => {
    try {
      const response = await api.post(`/usuarios/${usuario.id}/reset-password`);
      setTempPassword(response.data.temporaryPassword);
      setPasswordUsuario(usuario.nombre);
      setShowPasswordModal(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al resetear contrasena');
    }
  };

  const handleDeleteClick = (usuario: UsuarioList) => {
    setDeletingUsuario(usuario);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingUsuario) return;

    try {
      await api.delete(`/usuarios/${deletingUsuario.id}`);
      setShowDeleteModal(false);
      setDeletingUsuario(null);
      fetchUsuarios();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al eliminar usuario');
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Nunca';
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredUsuarios = usuarios;

  return (
    <MainLayout requiredRoles={['Admin']}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Gestion de Usuarios
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Administra empleados y clientes del sistema
            </p>
          </div>
          <button
            className="btn-primary"
            onClick={() => handleOpenModal()}
          >
            Nuevo Usuario
          </button>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('empleados')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'empleados'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Empleados
            </button>
            <button
              onClick={() => setActiveTab('clientes')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'clientes'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Clientes
            </button>
          </nav>
        </div>

        {/* Users Table */}
        <div className="card overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
              <p className="mt-2 text-gray-500 dark:text-gray-400">Cargando usuarios...</p>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Usuario
                  </th>
                  {activeTab === 'clientes' && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Empresa
                    </th>
                  )}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Ultimo Acceso
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredUsuarios.length === 0 ? (
                  <tr>
                    <td colSpan={activeTab === 'clientes' ? 5 : 4} className="px-6 py-12 text-center">
                      <svg
                        className="mx-auto h-12 w-12 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                        />
                      </svg>
                      <p className="mt-4 text-gray-500 dark:text-gray-400">
                        No hay {activeTab === 'empleados' ? 'empleados' : 'clientes'} registrados
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredUsuarios.map((usuario) => (
                    <tr key={usuario.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0">
                            <div className="h-10 w-10 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
                              <span className="text-primary-600 dark:text-primary-400 font-medium text-sm">
                                {usuario.nombre.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {usuario.nombre}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {usuario.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      {activeTab === 'clientes' && (
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {usuario.empresaNombre || '-'}
                        </td>
                      )}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          usuario.activo
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }`}>
                          {usuario.activo ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(usuario.ultimoAcceso)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                        <button
                          onClick={() => handleOpenModal(usuario)}
                          className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300"
                          title="Editar"
                        >
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleResetPassword(usuario)}
                          className="text-yellow-600 hover:text-yellow-900 dark:text-yellow-400 dark:hover:text-yellow-300"
                          title="Resetear contrasena"
                        >
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleToggleActive(usuario)}
                          className={`${
                            usuario.activo
                              ? 'text-orange-600 hover:text-orange-900 dark:text-orange-400 dark:hover:text-orange-300'
                              : 'text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300'
                          }`}
                          title={usuario.activo ? 'Desactivar' : 'Activar'}
                        >
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={usuario.activo ? "M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" : "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"} />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeleteClick(usuario)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                          title="Eliminar"
                        >
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={handleCloseModal}></div>
            <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl transform transition-all sm:max-w-lg sm:w-full">
              <form onSubmit={handleSubmit}>
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    {editingUsuario ? 'Editar Usuario' : 'Nuevo Usuario'}
                  </h3>
                </div>
                <div className="px-6 py-4 space-y-4">
                  {formError && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                      <p className="text-sm text-red-600 dark:text-red-400">{formError}</p>
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Nombre *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.nombre}
                      onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                      className="input-field"
                      placeholder="Nombre completo"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="input-field"
                      placeholder="correo@ejemplo.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Rol *
                    </label>
                    <select
                      required
                      value={formData.rol}
                      onChange={(e) => setFormData({ ...formData, rol: e.target.value as UserRole })}
                      className="input-field"
                    >
                      <option value="Empleado">Empleado</option>
                      <option value="Cliente">Cliente</option>
                      <option value="Admin">Administrador</option>
                    </select>
                  </div>
                  {(formData.rol === 'Cliente') && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Empresa
                      </label>
                      <select
                        value={formData.empresaId || ''}
                        onChange={(e) => setFormData({ ...formData, empresaId: e.target.value ? parseInt(e.target.value) : null })}
                        className="input-field"
                      >
                        <option value="">Sin empresa</option>
                        {empresas.filter(e => e.activa).map((empresa) => (
                          <option key={empresa.id} value={empresa.id}>
                            {empresa.nombre}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                  {editingUsuario && (
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="activo"
                        checked={formData.activo}
                        onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                      <label htmlFor="activo" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                        Usuario activo
                      </label>
                    </div>
                  )}
                </div>
                <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="btn-secondary"
                    disabled={submitting}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={submitting}
                  >
                    {submitting ? 'Guardando...' : (editingUsuario ? 'Guardar Cambios' : 'Crear Usuario')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
            <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl transform transition-all sm:max-w-md sm:w-full">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Contrasena Temporal
                </h3>
              </div>
              <div className="px-6 py-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Se ha generado una contrasena temporal para <strong>{passwordUsuario}</strong>.
                  El usuario debera cambiarla en su primer inicio de sesion.
                </p>
                <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4">
                  <p className="text-center font-mono text-lg text-gray-900 dark:text-white select-all">
                    {tempPassword}
                  </p>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
                  Haz clic para seleccionar y copiar
                </p>
              </div>
              <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end">
                <button
                  onClick={() => {
                    setShowPasswordModal(false);
                    setTempPassword(null);
                    setPasswordUsuario(null);
                  }}
                  className="btn-primary"
                >
                  Entendido
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && deletingUsuario && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowDeleteModal(false)}></div>
            <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl transform transition-all sm:max-w-md sm:w-full">
              <div className="px-6 py-4">
                <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 dark:bg-red-900 rounded-full mb-4">
                  <svg className="h-6 w-6 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white text-center mb-2">
                  Eliminar Usuario
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                  ¿Estas seguro de que deseas eliminar a <strong>{deletingUsuario.nombre}</strong>?
                  Esta accion no se puede deshacer.
                </p>
              </div>
              <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="btn-secondary"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
}
