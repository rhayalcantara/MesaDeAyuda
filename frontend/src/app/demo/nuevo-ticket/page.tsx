'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

// Demo page to test form validation with field-level errors
// This simulates a logged-in Cliente user creating a ticket
// Also demonstrates Feature #72: Unsaved changes warning on form navigation
// Also demonstrates Feature #46: File upload on ticket creation

interface Categoria {
  id: number;
  nombre: string;
}

interface FormErrors {
  titulo?: string;
  descripcion?: string;
  categoriaId?: string;
  archivo?: string;
}

interface UploadedFile {
  file: File;
  preview?: string;
}

// Allowed file types from app_spec.txt
const ALLOWED_FILE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain',
];

const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'doc', 'docx', 'xls', 'xlsx', 'txt'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const clienteNavItems = [
  {
    name: 'Mis Tickets',
    href: '/demo/cliente-empty',
    icon: 'M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 010 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 010-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375z'
  },
  {
    name: 'Crear Ticket',
    href: '/demo/nuevo-ticket',
    icon: 'M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z'
  },
];

const demoCategorias: Categoria[] = [
  { id: 1, nombre: 'Sistema de Ventas' },
  { id: 2, nombre: 'Sistema de Inventario' },
  { id: 3, nombre: 'Portal Web' },
  { id: 4, nombre: 'Aplicacion Movil' },
  { id: 5, nombre: 'Otro' },
];

export default function DemoNuevoTicketPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  // Form state
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [categoriaId, setCategoriaId] = useState('');
  const [prioridad, setPrioridad] = useState('Media');
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Field-level errors
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Created ticket state for Feature #46 verification
  const [createdTicket, setCreatedTicket] = useState<{
    id: number;
    titulo: string;
    descripcion: string;
    categoria: string;
    prioridad: string;
    archivos: { nombre: string; tipo: string; tamanio: number }[];
  } | null>(null);

  // Unsaved changes modal state (Feature #72)
  const [showUnsavedWarning, setShowUnsavedWarning] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null);

  // Check if form has unsaved changes
  const hasUnsavedChanges = useCallback(() => {
    return titulo.trim() !== '' || descripcion.trim() !== '' || categoriaId !== '' || uploadedFiles.length > 0;
  }, [titulo, descripcion, categoriaId, uploadedFiles]);

  // File upload handler
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newErrors: FormErrors = { ...errors };
    delete newErrors.archivo;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        newErrors.archivo = `El archivo "${file.name}" excede el limite de 10MB. Tamaño: ${(file.size / (1024 * 1024)).toFixed(1)} MB`;
        setErrors(newErrors);
        return;
      }

      // Validate file type
      const extension = file.name.split('.').pop()?.toLowerCase();
      if (!extension || !ALLOWED_EXTENSIONS.includes(extension)) {
        newErrors.archivo = `El tipo de archivo "${extension}" no esta permitido. Tipos permitidos: ${ALLOWED_EXTENSIONS.join(', ')}`;
        setErrors(newErrors);
        return;
      }

      // Create preview for images
      const uploadedFile: UploadedFile = { file };
      if (file.type.startsWith('image/')) {
        uploadedFile.preview = URL.createObjectURL(file);
      }

      setUploadedFiles(prev => [...prev, uploadedFile]);
    }

    setErrors(newErrors);
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Remove uploaded file
  const handleRemoveFile = (index: number) => {
    setUploadedFiles(prev => {
      const newFiles = [...prev];
      // Revoke object URL to prevent memory leaks
      if (newFiles[index].preview) {
        URL.revokeObjectURL(newFiles[index].preview!);
      }
      newFiles.splice(index, 1);
      return newFiles;
    });
  };

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle browser back/refresh with unsaved changes (Feature #72)
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges()) {
        e.preventDefault();
        e.returnValue = ''; // Required for Chrome
        return ''; // Required for some browsers
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  // Handle navigation with unsaved changes warning
  const handleNavigationClick = (href: string) => {
    if (hasUnsavedChanges()) {
      setPendingNavigation(href);
      setShowUnsavedWarning(true);
    } else {
      router.push(href);
    }
  };

  // Confirm leaving with unsaved changes
  const confirmNavigation = () => {
    if (pendingNavigation) {
      router.push(pendingNavigation);
    }
    setShowUnsavedWarning(false);
    setPendingNavigation(null);
  };

  // Cancel navigation, stay on form
  const cancelNavigation = () => {
    setShowUnsavedWarning(false);
    setPendingNavigation(null);
  };

  const handleToggleSidebar = () => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setMobileMenuOpen(!mobileMenuOpen);
    } else {
      setSidebarCollapsed(!sidebarCollapsed);
    }
  };

  const handleMobileMenuClose = () => {
    setMobileMenuOpen(false);
  };

  // Validate a single field
  const validateField = (name: string, value: string): string | undefined => {
    switch (name) {
      case 'titulo':
        if (!value.trim()) return 'El titulo es requerido';
        if (value.trim().length < 5) return 'El titulo debe tener al menos 5 caracteres';
        if (value.trim().length > 200) return 'El titulo no puede exceder 200 caracteres';
        return undefined;
      case 'descripcion':
        if (!value.trim()) return 'La descripcion es requerida';
        if (value.trim().length < 20) return 'La descripcion debe tener al menos 20 caracteres';
        return undefined;
      case 'categoriaId':
        if (!value) return 'Debe seleccionar una categoria';
        return undefined;
      default:
        return undefined;
    }
  };

  // Validate all fields
  const validateForm = (): FormErrors => {
    const newErrors: FormErrors = {};

    const tituloError = validateField('titulo', titulo);
    if (tituloError) newErrors.titulo = tituloError;

    const descripcionError = validateField('descripcion', descripcion);
    if (descripcionError) newErrors.descripcion = descripcionError;

    const categoriaError = validateField('categoriaId', categoriaId);
    if (categoriaError) newErrors.categoriaId = categoriaError;

    return newErrors;
  };

  // Handle field blur
  const handleBlur = (name: string, value: string) => {
    setTouched(prev => ({ ...prev, [name]: true }));
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess('');

    // Mark all fields as touched
    setTouched({ titulo: true, descripcion: true, categoriaId: true });

    // Validate all fields
    const formErrors = validateForm();
    setErrors(formErrors);

    // If there are errors, don't submit
    if (Object.keys(formErrors).length > 0) {
      return;
    }

    // Simulate submission
    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      // Create ticket object with attached files (Feature #46)
      const categoria = demoCategorias.find(c => c.id === parseInt(categoriaId));
      const ticket = {
        id: Math.floor(Math.random() * 1000) + 100,
        titulo,
        descripcion,
        categoria: categoria?.nombre || 'Sin categoria',
        prioridad,
        archivos: uploadedFiles.map(f => ({
          nombre: f.file.name,
          tipo: f.file.type,
          tamanio: f.file.size,
        })),
      };

      setCreatedTicket(ticket);
      setSuccess(`Ticket #${ticket.id} creado exitosamente!${uploadedFiles.length > 0 ? ` Se adjuntaron ${uploadedFiles.length} archivo(s).` : ''}`);
      setIsLoading(false);

      // Reset form
      setTitulo('');
      setDescripcion('');
      setCategoriaId('');
      setPrioridad('Media');
      // Clear uploaded files and revoke URLs
      uploadedFiles.forEach(f => {
        if (f.preview) URL.revokeObjectURL(f.preview);
      });
      setUploadedFiles([]);
      setTouched({});
      setErrors({});
    }, 1500);
  };

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 z-50">
        <div className="h-full px-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={handleToggleSidebar}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Toggle sidebar"
            >
              <svg className="h-6 w-6 text-gray-600 dark:text-gray-300" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            </button>
            <span className="text-xl font-bold text-primary-600 dark:text-primary-400">
              MDAyuda
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 hidden sm:block">
              Cliente Demo
            </span>
            <span className="inline-block px-2 py-0.5 text-xs font-medium rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
              Cliente
            </span>
          </div>
        </div>
      </header>

      {/* Mobile backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={handleMobileMenuClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-16 h-[calc(100vh-4rem)] bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 z-40',
          'hidden md:block',
          mobileMenuOpen && 'block',
          sidebarCollapsed ? 'md:w-16' : 'md:w-64',
          'w-64'
        )}
      >
        {/* Mobile close button */}
        <div className="md:hidden flex justify-end p-2">
          <button
            onClick={handleMobileMenuClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Cerrar menu"
          >
            <svg className="h-6 w-6 text-gray-600 dark:text-gray-300" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <nav className="h-full overflow-y-auto py-2 md:py-4">
          <ul className="space-y-1 px-3">
            {clienteNavItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');

              return (
                <li key={item.name}>
                  <button
                    onClick={() => {
                      handleMobileMenuClose();
                      handleNavigationClick(item.href);
                    }}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors w-full text-left',
                      isActive
                        ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/50 dark:text-primary-300'
                        : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                    )}
                    title={sidebarCollapsed ? item.name : undefined}
                  >
                    <svg className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                    </svg>
                    <span className={cn('md:hidden', !sidebarCollapsed && 'md:inline')}>
                      {item.name}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>

      {/* Main content */}
      <main
        className={cn(
          'pt-16 transition-all duration-300',
          'ml-0',
          sidebarCollapsed ? 'md:ml-16' : 'md:ml-64'
        )}
      >
        <div className="p-4 md:p-6">
          <div className="max-w-2xl mx-auto">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Crear Nuevo Ticket
              </h1>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Complete el formulario para reportar un problema o solicitud
              </p>
            </div>

            <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-6" noValidate>
              {/* Success message */}
              {success && (
                <div
                  className="bg-green-50 dark:bg-green-900/50 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 px-4 py-3 rounded-lg text-sm"
                  role="status"
                  aria-live="polite"
                >
                  {success}
                </div>
              )}

              {/* Created Ticket Detail - Feature #46 Verification */}
              {createdTicket && (
                <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-300 mb-3">
                    Detalle del Ticket Creado
                  </h3>
                  <div className="space-y-2 text-sm text-blue-700 dark:text-blue-400">
                    <p><strong>ID:</strong> #{createdTicket.id}</p>
                    <p><strong>Titulo:</strong> {createdTicket.titulo}</p>
                    <p><strong>Categoria:</strong> {createdTicket.categoria}</p>
                    <p><strong>Prioridad:</strong> {createdTicket.prioridad}</p>
                    <p><strong>Descripcion:</strong> {createdTicket.descripcion.substring(0, 100)}...</p>
                    {createdTicket.archivos.length > 0 && (
                      <div>
                        <strong>Archivos adjuntos ({createdTicket.archivos.length}):</strong>
                        <ul className="list-disc list-inside ml-2 mt-1">
                          {createdTicket.archivos.map((archivo, index) => (
                            <li key={index}>
                              {archivo.nombre} ({formatFileSize(archivo.tamanio)})
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setCreatedTicket(null)}
                    className="mt-3 text-sm text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Crear otro ticket
                  </button>
                </div>
              )}

              {/* Titulo */}
              <div>
                <label htmlFor="titulo" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Titulo del ticket <span className="text-red-500">*</span>
                </label>
                <input
                  id="titulo"
                  name="titulo"
                  type="text"
                  value={titulo}
                  onChange={(e) => {
                    setTitulo(e.target.value);
                    if (touched.titulo) {
                      const error = validateField('titulo', e.target.value);
                      setErrors(prev => ({ ...prev, titulo: error }));
                    }
                  }}
                  onBlur={() => handleBlur('titulo', titulo)}
                  className={cn(
                    "w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors",
                    errors.titulo && touched.titulo
                      ? "border-red-500 dark:border-red-400"
                      : "border-gray-300 dark:border-gray-600"
                  )}
                  placeholder="Describe brevemente el problema"
                  maxLength={200}
                  aria-describedby={errors.titulo ? "titulo-error" : "titulo-hint"}
                  aria-invalid={!!errors.titulo && touched.titulo}
                />
                {errors.titulo && touched.titulo ? (
                  <p id="titulo-error" className="mt-1 text-sm text-red-600 dark:text-red-400" role="alert">
                    {errors.titulo}
                  </p>
                ) : (
                  <p id="titulo-hint" className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Maximo 200 caracteres
                  </p>
                )}
              </div>

              {/* Categoria */}
              <div>
                <label htmlFor="categoria" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Categoria (Sistema) <span className="text-red-500">*</span>
                </label>
                <select
                  id="categoria"
                  name="categoria"
                  value={categoriaId}
                  onChange={(e) => {
                    setCategoriaId(e.target.value);
                    if (touched.categoriaId) {
                      const error = validateField('categoriaId', e.target.value);
                      setErrors(prev => ({ ...prev, categoriaId: error }));
                    }
                  }}
                  onBlur={() => handleBlur('categoriaId', categoriaId)}
                  className={cn(
                    "w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors",
                    errors.categoriaId && touched.categoriaId
                      ? "border-red-500 dark:border-red-400"
                      : "border-gray-300 dark:border-gray-600"
                  )}
                  aria-describedby={errors.categoriaId ? "categoria-error" : "categoria-hint"}
                  aria-invalid={!!errors.categoriaId && touched.categoriaId}
                >
                  <option value="">Seleccione una categoria</option>
                  {demoCategorias.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.nombre}
                    </option>
                  ))}
                </select>
                {errors.categoriaId && touched.categoriaId ? (
                  <p id="categoria-error" className="mt-1 text-sm text-red-600 dark:text-red-400" role="alert">
                    {errors.categoriaId}
                  </p>
                ) : (
                  <p id="categoria-hint" className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Seleccione el sistema relacionado con el problema
                  </p>
                )}
              </div>

              {/* Prioridad */}
              <div>
                <label htmlFor="prioridad" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Prioridad <span className="text-red-500">*</span>
                </label>
                <select
                  id="prioridad"
                  name="prioridad"
                  value={prioridad}
                  onChange={(e) => setPrioridad(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                  aria-describedby="prioridad-hint"
                >
                  <option value="Baja">Baja - Puede esperar</option>
                  <option value="Media">Media - Necesita atencion pronto</option>
                  <option value="Alta">Alta - Urgente</option>
                </select>
                <p id="prioridad-hint" className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Indique la urgencia del problema
                </p>
              </div>

              {/* Descripcion */}
              <div>
                <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Descripcion detallada <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="descripcion"
                  name="descripcion"
                  value={descripcion}
                  onChange={(e) => {
                    setDescripcion(e.target.value);
                    if (touched.descripcion) {
                      const error = validateField('descripcion', e.target.value);
                      setErrors(prev => ({ ...prev, descripcion: error }));
                    }
                  }}
                  onBlur={() => handleBlur('descripcion', descripcion)}
                  className={cn(
                    "w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors min-h-[150px] resize-y",
                    errors.descripcion && touched.descripcion
                      ? "border-red-500 dark:border-red-400"
                      : "border-gray-300 dark:border-gray-600"
                  )}
                  placeholder="Describa el problema con el mayor detalle posible. Incluya pasos para reproducirlo, mensajes de error, etc."
                  aria-describedby={errors.descripcion ? "descripcion-error" : "descripcion-hint"}
                  aria-invalid={!!errors.descripcion && touched.descripcion}
                />
                {errors.descripcion && touched.descripcion ? (
                  <p id="descripcion-error" className="mt-1 text-sm text-red-600 dark:text-red-400" role="alert">
                    {errors.descripcion}
                  </p>
                ) : (
                  <p id="descripcion-hint" className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Proporcione todos los detalles que puedan ayudar a resolver el problema (minimo 20 caracteres)
                  </p>
                )}
              </div>

              {/* File Upload Section - Feature #46 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Archivos adjuntos (opcional)
                </label>
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4">
                  <input
                    ref={fileInputRef}
                    type="file"
                    id="archivo"
                    onChange={handleFileSelect}
                    accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx,.xls,.xlsx,.txt"
                    className="hidden"
                    multiple
                  />
                  <div className="text-center">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="mt-2 px-4 py-2 bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 rounded-lg hover:bg-primary-200 dark:hover:bg-primary-800 transition-colors font-medium text-sm"
                    >
                      Seleccionar archivos
                    </button>
                    <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                      JPG, PNG, GIF, PDF, DOC, DOCX, XLS, XLSX, TXT (max. 10MB cada uno)
                    </p>
                  </div>

                  {/* Uploaded files list */}
                  {uploadedFiles.length > 0 && (
                    <div className="mt-4 space-y-2">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Archivos seleccionados ({uploadedFiles.length}):
                      </p>
                      {uploadedFiles.map((uploadedFile, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-3 p-2 bg-gray-50 dark:bg-gray-700 rounded-lg"
                        >
                          {/* Preview for images */}
                          {uploadedFile.preview ? (
                            <img
                              src={uploadedFile.preview}
                              alt={uploadedFile.file.name}
                              className="w-10 h-10 object-cover rounded"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-gray-200 dark:bg-gray-600 rounded flex items-center justify-center">
                              <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                              </svg>
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
                              {uploadedFile.file.name}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {formatFileSize(uploadedFile.file.size)}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveFile(index)}
                            className="p-1 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                            aria-label={`Eliminar ${uploadedFile.file.name}`}
                          >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* File error message */}
                {errors.archivo && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400" role="alert">
                    {errors.archivo}
                  </p>
                )}
              </div>

              {/* Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 py-3 px-4 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center">
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Creando ticket...
                    </span>
                  ) : (
                    'Crear Ticket'
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => handleNavigationClick('/demo/cliente-empty')}
                  className="flex-1 py-3 px-4 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors font-medium text-center"
                >
                  Cancelar
                </button>
              </div>
            </form>

            {/* Demo info box */}
            <div className="mt-6 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-2">
                Informacion de Demo - Features #46, #48 y #72
              </h4>
              <p className="text-sm text-blue-700 dark:text-blue-400 mb-2">
                Esta pagina demuestra la <strong>subida de archivos al crear ticket</strong>, <strong>validacion de campos</strong> y el <strong>aviso de cambios sin guardar</strong>.
              </p>
              <ul className="list-disc list-inside text-sm text-blue-700 dark:text-blue-400 space-y-1">
                <li><strong>Feature #46:</strong> Adjunte archivos usando el boton &quot;Seleccionar archivos&quot;</li>
                <li>Tipos permitidos: JPG, PNG, GIF, PDF, DOC, DOCX, XLS, XLSX, TXT (max 10MB)</li>
                <li>Los archivos se muestran con vista previa (imagenes) o icono</li>
                <li>Al crear el ticket, los archivos aparecen en el detalle</li>
                <li>Intente enviar el formulario vacio para ver errores de campo</li>
                <li>Cada campo muestra su propio mensaje de error especifico</li>
                <li>Los campos con error tienen borde rojo</li>
                <li><strong>Feature #72:</strong> Escriba algo en el formulario e intente navegar a &quot;Mis Tickets&quot; o &quot;Cancelar&quot;</li>
                <li>Aparecera un aviso preguntando si desea descartar los cambios</li>
              </ul>
            </div>
          </div>
        </div>
      </main>

      {/* Unsaved Changes Warning Modal (Feature #72) */}
      {showUnsavedWarning && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="unsaved-warning-title">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-yellow-100 dark:bg-yellow-900 flex items-center justify-center">
                <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 id="unsaved-warning-title" className="text-lg font-semibold text-gray-900 dark:text-white">
                Cambios sin guardar
              </h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Tiene cambios sin guardar en el formulario. Si sale ahora, perdera toda la informacion ingresada.
            </p>
            <div className="flex gap-3">
              <button
                onClick={cancelNavigation}
                className="flex-1 py-2 px-4 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors font-medium"
              >
                Seguir editando
              </button>
              <button
                onClick={confirmNavigation}
                className="flex-1 py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                Descartar cambios
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
