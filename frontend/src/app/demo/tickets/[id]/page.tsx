'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

// Demo ticket detail page for testing timezone display and tab navigation
// This page doesn't require authentication

interface Ticket {
  id: number;
  titulo: string;
  descripcion: string;
  estado: 'Abierto' | 'EnProceso' | 'EnEspera' | 'Resuelto' | 'Cerrado';
  prioridad: 'Alta' | 'Media' | 'Baja';
  categoria: string;
  fechaCreacion: Date;
  fechaActualizacion: Date;
  fechaPrimeraRespuesta?: Date;
  cliente: string;
  empleadoAsignado?: string;
}

interface Comment {
  id: number;
  usuario: string;
  rol: string;
  texto: string;
  fecha: Date;
  archivo?: {
    nombreOriginal: string;
    tamanio: number;
    tipoMime: string;
  };
}

interface Archivo {
  id: number;
  nombreOriginal: string;
  tamanio: number;
  tipoMime: string;
  fechaSubida: Date;
  subidoPor: string;
  previewUrl?: string; // For image previews
}

// Helper function to format date in local timezone
function formatLocalDate(date: Date): string {
  return new Intl.DateTimeFormat('es-ES', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  }).format(date);
}

// Helper function to get relative time
function getRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'hace un momento';
  if (diffMins < 60) return `hace ${diffMins} minuto${diffMins !== 1 ? 's' : ''}`;
  if (diffHours < 24) return `hace ${diffHours} hora${diffHours !== 1 ? 's' : ''}`;
  if (diffDays < 7) return `hace ${diffDays} día${diffDays !== 1 ? 's' : ''}`;
  return formatLocalDate(date);
}

// Priority badge component
function PriorityBadge({ prioridad }: { prioridad: Ticket['prioridad'] }) {
  const config = {
    Alta: {
      bg: 'bg-red-100 dark:bg-red-900/50',
      text: 'text-red-800 dark:text-red-200',
      border: 'border-red-200 dark:border-red-800',
      icon: '⚠️',
    },
    Media: {
      bg: 'bg-yellow-100 dark:bg-yellow-900/50',
      text: 'text-yellow-800 dark:text-yellow-200',
      border: 'border-yellow-200 dark:border-yellow-800',
      icon: '●',
    },
    Baja: {
      bg: 'bg-green-100 dark:bg-green-900/50',
      text: 'text-green-800 dark:text-green-200',
      border: 'border-green-200 dark:border-green-800',
      icon: '○',
    },
  };

  const styles = config[prioridad];

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles.bg} ${styles.text} ${styles.border}`}>
      <span aria-hidden="true">{styles.icon}</span>
      {prioridad}
    </span>
  );
}

// Status badge component
function StatusBadge({ estado }: { estado: Ticket['estado'] }) {
  const config = {
    Abierto: { bg: 'bg-blue-100 dark:bg-blue-900/50', text: 'text-blue-800 dark:text-blue-200', border: 'border-blue-200 dark:border-blue-800', icon: '🔵' },
    EnProceso: { bg: 'bg-purple-100 dark:bg-purple-900/50', text: 'text-purple-800 dark:text-purple-200', border: 'border-purple-200 dark:border-purple-800', icon: '🟣' },
    EnEspera: { bg: 'bg-orange-100 dark:bg-orange-900/50', text: 'text-orange-800 dark:text-orange-200', border: 'border-orange-200 dark:border-orange-800', icon: '🟠' },
    Resuelto: { bg: 'bg-green-100 dark:bg-green-900/50', text: 'text-green-800 dark:text-green-200', border: 'border-green-200 dark:border-green-800', icon: '✅' },
    Cerrado: { bg: 'bg-gray-100 dark:bg-gray-700', text: 'text-gray-800 dark:text-gray-200', border: 'border-gray-200 dark:border-gray-600', icon: '⬛' },
  };

  const labels: Record<string, string> = {
    Abierto: 'Abierto',
    EnProceso: 'En Proceso',
    EnEspera: 'En Espera',
    Resuelto: 'Resuelto',
    Cerrado: 'Cerrado',
  };

  const styles = config[estado];

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles.bg} ${styles.text} ${styles.border}`}>
      <span aria-hidden="true">{styles.icon}</span>
      {labels[estado]}
    </span>
  );
}

// Helper function to format file size
function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

// Helper function to create and download a demo file
function downloadDemoFile(archivo: Archivo) {
  let content: string;
  let mimeType: string;

  // Create demo content based on file type
  if (archivo.tipoMime.startsWith('image/')) {
    // Create a simple SVG image as demo
    content = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">
      <rect width="400" height="300" fill="#f0f0f0"/>
      <text x="200" y="140" text-anchor="middle" font-family="Arial" font-size="20" fill="#666">Demo Image</text>
      <text x="200" y="170" text-anchor="middle" font-family="Arial" font-size="14" fill="#999">${archivo.nombreOriginal}</text>
      <rect x="50" y="200" width="100" height="60" fill="#e74c3c" rx="5"/>
      <rect x="170" y="220" width="80" height="40" fill="#3498db" rx="5"/>
      <circle cx="330" cy="230" r="30" fill="#2ecc71"/>
    </svg>`;
    mimeType = 'image/svg+xml';
  } else if (archivo.tipoMime === 'application/pdf') {
    // Create a simple text file as PDF demo (browsers will treat as text)
    content = `Demo PDF Content
================

File: ${archivo.nombreOriginal}
Size: ${formatFileSize(archivo.tamanio)}
Uploaded by: ${archivo.subidoPor}

This is a demo file generated by MDAyuda.
In a production environment, this would be the actual uploaded PDF file.

Sample Report Data:
------------------
Date: ${new Date().toLocaleDateString('es-ES')}
Status: Complete
Total Items: 156
Processing Time: 2.5 seconds

Notes:
This file demonstrates the download functionality for ticket attachments.
`;
    mimeType = 'text/plain';
  } else {
    // Text or other file types
    content = `Demo File Content
=================

File: ${archivo.nombreOriginal}
Type: ${archivo.tipoMime}
Size: ${formatFileSize(archivo.tamanio)}
Uploaded by: ${archivo.subidoPor}
Upload date: ${formatLocalDate(archivo.fechaSubida)}

This is a demo file generated by MDAyuda.
In a production environment, this would be the actual uploaded file.

Log entries:
------------
[${new Date().toISOString()}] INFO: Application started
[${new Date().toISOString()}] INFO: Processing request
[${new Date().toISOString()}] DEBUG: Query executed in 45ms
[${new Date().toISOString()}] INFO: Request completed successfully
`;
    mimeType = archivo.tipoMime || 'text/plain';
  }

  // Create a blob and download
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = archivo.nombreOriginal;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export default function DemoTicketDetailPage() {
  const params = useParams();
  const ticketId = params.id;

  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [timezone, setTimezone] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'comentarios' | 'archivos'>('comentarios');
  const [previewImage, setPreviewImage] = useState<Archivo | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploadFileName, setUploadFileName] = useState<string>('');
  const [uploadedFiles, setUploadedFiles] = useState<Archivo[]>([]);
  const [uploadError, setUploadError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Comment form state
  const [newComment, setNewComment] = useState('');
  const [commentFile, setCommentFile] = useState<File | null>(null);
  const [commentFileError, setCommentFileError] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [submittedComments, setSubmittedComments] = useState<Comment[]>([]);
  const commentFileInputRef = useRef<HTMLInputElement>(null);

  // Max file size: 10MB
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes

  // Allowed file types
  const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'doc', 'docx', 'xls', 'xlsx', 'txt'];
  const ALLOWED_MIME_TYPES = [
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

  // Helper to get file extension
  const getFileExtension = (filename: string): string => {
    const parts = filename.split('.');
    return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : '';
  };

  // Simulated file upload with progress indicator
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Clear any previous error
    setUploadError('');

    // Check file type by extension and MIME type
    const extension = getFileExtension(file.name);
    const isValidExtension = ALLOWED_EXTENSIONS.includes(extension);
    const isValidMimeType = ALLOWED_MIME_TYPES.includes(file.type) || file.type === '';

    if (!isValidExtension) {
      setUploadError(`El tipo de archivo ".${extension}" no esta permitido. Tipos permitidos: JPG, PNG, GIF, PDF, DOC, DOCX, XLS, XLSX, TXT.`);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      setUploadError(`El archivo "${file.name}" excede el limite de 10MB. Tamaño del archivo: ${formatFileSize(file.size)}. Por favor, seleccione un archivo mas pequeño.`);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    setUploadFileName(file.name);
    setUploadProgress(0);

    // Simulate upload progress with intervals
    const totalSteps = 20;
    let currentStep = 0;

    const progressInterval = setInterval(() => {
      currentStep++;
      const progress = Math.min((currentStep / totalSteps) * 100, 100);
      setUploadProgress(progress);

      if (currentStep >= totalSteps) {
        clearInterval(progressInterval);

        // Create a new file entry after "upload" completes
        const newFile: Archivo = {
          id: Date.now(),
          nombreOriginal: file.name,
          tamanio: file.size,
          tipoMime: file.type || 'application/octet-stream',
          fechaSubida: new Date(),
          subidoPor: 'Demo User',
          previewUrl: file.type.startsWith('image/')
            ? URL.createObjectURL(file)
            : undefined,
        };

        // Add to uploaded files
        setUploadedFiles(prev => [...prev, newFile]);

        // Reset progress after a brief delay to show 100%
        setTimeout(() => {
          setUploadProgress(null);
          setUploadFileName('');
        }, 500);
      }
    }, 150); // 150ms * 20 steps = 3 seconds total

    // Reset file input so same file can be uploaded again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle comment file selection
  const handleCommentFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setCommentFileError('');

    // Check file type by extension
    const extension = getFileExtension(file.name);
    const isValidExtension = ALLOWED_EXTENSIONS.includes(extension);

    if (!isValidExtension) {
      setCommentFileError(`El tipo de archivo ".${extension}" no esta permitido.`);
      if (commentFileInputRef.current) {
        commentFileInputRef.current.value = '';
      }
      return;
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      setCommentFileError(`El archivo excede el limite de 10MB (${formatFileSize(file.size)}).`);
      if (commentFileInputRef.current) {
        commentFileInputRef.current.value = '';
      }
      return;
    }

    setCommentFile(file);
  };

  // Handle comment submission with optional file
  const handleSubmitComment = async () => {
    if (!newComment.trim()) {
      return;
    }

    setIsSubmittingComment(true);

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Create new comment
    const newCommentObj: Comment = {
      id: Date.now(),
      usuario: 'Demo User',
      rol: 'Empleado',
      texto: newComment,
      fecha: new Date(),
      archivo: commentFile ? {
        nombreOriginal: commentFile.name,
        tamanio: commentFile.size,
        tipoMime: commentFile.type || 'application/octet-stream',
      } : undefined,
    };

    setSubmittedComments(prev => [...prev, newCommentObj]);
    setNewComment('');
    setCommentFile(null);
    setIsSubmittingComment(false);

    if (commentFileInputRef.current) {
      commentFileInputRef.current.value = '';
    }
  };

  useEffect(() => {
    // Get the user's timezone
    setTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone);

    // Update current time every second
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Demo tickets data - matches the list in /demo/tickets
  const now = new Date();
  const demoTickets: Record<number, Ticket> = {
    1: {
      id: 1,
      titulo: 'Error al generar reportes de ventas',
      descripcion: 'Al intentar generar el reporte mensual de ventas, el sistema muestra un error "Timeout exceeded". Esto ocurre cuando selecciono más de 30 días de datos. El problema comenzó después de la última actualización del sistema.\n\nPasos para reproducir:\n1. Ir a Reportes > Ventas\n2. Seleccionar rango de fechas mayor a 30 días\n3. Hacer clic en "Generar Reporte"\n4. El sistema muestra error de timeout',
      estado: 'Abierto',
      prioridad: 'Alta',
      categoria: 'Sistema de Ventas',
      fechaCreacion: new Date(now.getTime() - 3600000 * 24 * 2),
      fechaActualizacion: new Date(now.getTime() - 3600000 * 2),
      fechaPrimeraRespuesta: new Date(now.getTime() - 3600000 * 24),
      cliente: 'Juan Perez',
      empleadoAsignado: 'Maria Garcia',
    },
    2: {
      id: 2,
      titulo: 'Actualizacion de datos de inventario lenta',
      descripcion: 'La sincronización del inventario está tardando más de 10 minutos cuando antes tardaba 2 minutos. El problema ocurre principalmente durante las horas pico (10am-12pm).\n\nSe nota especialmente cuando hay más de 500 productos para sincronizar.',
      estado: 'EnProceso',
      prioridad: 'Media',
      categoria: 'Sistema de Inventario',
      fechaCreacion: new Date(now.getTime() - 3600000 * 24 * 3),
      fechaActualizacion: new Date(now.getTime() - 3600000 * 5),
      fechaPrimeraRespuesta: new Date(now.getTime() - 3600000 * 48),
      cliente: 'Maria Garcia',
      empleadoAsignado: 'Carlos Lopez',
    },
    3: {
      id: 3,
      titulo: 'Solicitud de nuevo modulo de facturacion',
      descripcion: 'Necesitamos un nuevo módulo de facturación electrónica que cumpla con los requisitos de la DGII. El módulo debe permitir:\n\n1. Generar NCF automáticamente\n2. Enviar facturas por correo\n3. Generar reportes mensuales de facturación',
      estado: 'EnEspera',
      prioridad: 'Baja',
      categoria: 'Portal Web',
      fechaCreacion: new Date(now.getTime() - 3600000 * 24 * 5),
      fechaActualizacion: new Date(now.getTime() - 3600000 * 24),
      cliente: 'Carlos Lopez',
    },
    4: {
      id: 4,
      titulo: 'Bug en la aplicacion movil al sincronizar',
      descripcion: 'La aplicación móvil se cierra inesperadamente cuando intento sincronizar datos sin conexión a internet. El error ocurre en Android 12 y 13.',
      estado: 'Resuelto',
      prioridad: 'Alta',
      categoria: 'Aplicacion Movil',
      fechaCreacion: new Date(now.getTime() - 3600000 * 24 * 4),
      fechaActualizacion: new Date(now.getTime() - 3600000 * 12),
      fechaPrimeraRespuesta: new Date(now.getTime() - 3600000 * 72),
      cliente: 'Ana Martinez',
      empleadoAsignado: 'Maria Garcia',
    },
    5: {
      id: 5,
      titulo: 'Consulta sobre configuracion del sistema',
      descripcion: 'Necesito ayuda para configurar las notificaciones por correo. No estoy seguro de cuáles opciones debo activar.',
      estado: 'Cerrado',
      prioridad: 'Baja',
      categoria: 'Otro',
      fechaCreacion: new Date(now.getTime() - 3600000 * 24 * 7),
      fechaActualizacion: new Date(now.getTime() - 3600000 * 48),
      fechaPrimeraRespuesta: new Date(now.getTime() - 3600000 * 24 * 6),
      cliente: 'Pedro Sanchez',
      empleadoAsignado: 'Carlos Lopez',
    },
    6: {
      id: 6,
      titulo: 'Este es un titulo extremadamente largo que deberia truncarse o ajustarse correctamente sin causar desbordamiento horizontal en la tabla de tickets',
      descripcion: 'Este ticket es para probar el manejo de texto largo en la interfaz.',
      estado: 'Abierto',
      prioridad: 'Media',
      categoria: 'Sistema de Pruebas de Texto Largo',
      fechaCreacion: new Date(now.getTime() - 3600000 * 24),
      fechaActualizacion: new Date(now.getTime() - 3600000),
      cliente: 'Usuario Con Nombre Muy Largo Para Probar Truncamiento',
    },
  };

  // Get ticket by ID or default to ticket 1
  const numericId = Number(ticketId) || 1;
  const ticket: Ticket = demoTickets[numericId] || demoTickets[1];

  // Demo comments with timestamps
  const comments: Comment[] = [
    {
      id: 1,
      usuario: 'Maria Garcia',
      rol: 'Empleado',
      texto: 'He recibido tu ticket y estoy investigando el problema. Parece estar relacionado con el tamaño del conjunto de datos.',
      fecha: new Date(now.getTime() - 3600000 * 24), // 1 day ago
    },
    {
      id: 2,
      usuario: 'Juan Perez',
      rol: 'Cliente',
      texto: 'Gracias por la respuesta rápida. ¿Hay algún workaround mientras tanto?',
      fecha: new Date(now.getTime() - 3600000 * 20), // 20 hours ago
    },
    {
      id: 3,
      usuario: 'Maria Garcia',
      rol: 'Empleado',
      texto: 'Sí, por ahora puedes generar reportes en rangos de 15 días y combinarlos. Estoy trabajando en una solución permanente.',
      fecha: new Date(now.getTime() - 3600000 * 2), // 2 hours ago
    },
  ];

  // Demo files for testing tab navigation
  // Using placeholder images for demo previews
  const archivos: Archivo[] = [
    {
      id: 1,
      nombreOriginal: 'captura_error.png',
      tamanio: 245760, // ~240KB
      tipoMime: 'image/png',
      fechaSubida: new Date(now.getTime() - 3600000 * 48), // 2 days ago
      subidoPor: 'Juan Perez',
      previewUrl: 'https://placehold.co/800x600/e74c3c/ffffff?text=Error+Screenshot',
    },
    {
      id: 2,
      nombreOriginal: 'log_servidor.txt',
      tamanio: 15360, // ~15KB
      tipoMime: 'text/plain',
      fechaSubida: new Date(now.getTime() - 3600000 * 24), // 1 day ago
      subidoPor: 'Maria Garcia',
    },
    {
      id: 3,
      nombreOriginal: 'reporte_ventas_mayo.pdf',
      tamanio: 1048576, // 1MB
      tipoMime: 'application/pdf',
      fechaSubida: new Date(now.getTime() - 3600000 * 2), // 2 hours ago
      subidoPor: 'Juan Perez',
    },
    {
      id: 4,
      nombreOriginal: 'diagrama_flujo.jpg',
      tamanio: 512000, // ~500KB
      tipoMime: 'image/jpeg',
      fechaSubida: new Date(now.getTime() - 3600000 * 6), // 6 hours ago
      subidoPor: 'Maria Garcia',
      previewUrl: 'https://placehold.co/800x600/3498db/ffffff?text=Flow+Diagram',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Breadcrumb */}
        <div className="mb-4">
          <Link
            href="/demo/tickets"
            className="text-primary-600 dark:text-primary-400 hover:underline text-sm"
          >
            ← Volver a lista de tickets
          </Link>
        </div>

        {/* Timezone info */}
        <div className="mb-6 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <h2 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
            Información de Zona Horaria
          </h2>
          <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
            <li><strong>Tu zona horaria:</strong> {timezone || 'Cargando...'}</li>
            <li><strong>Hora actual (local):</strong> {formatLocalDate(currentTime)}</li>
            <li>Todas las fechas se muestran en tu zona horaria local</li>
          </ul>
        </div>

        {/* Ticket header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
          <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
            <div>
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-1">
                <span>Ticket #{ticket.id}</span>
                <span>•</span>
                <span>{ticket.categoria}</span>
              </div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                {ticket.titulo}
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <StatusBadge estado={ticket.estado} />
              <PriorityBadge prioridad={ticket.prioridad} />
            </div>
          </div>

          {/* Timestamps */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Fecha de Creación
              </p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {formatLocalDate(ticket.fechaCreacion)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                ({getRelativeTime(ticket.fechaCreacion)})
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Primera Respuesta
              </p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {ticket.fechaPrimeraRespuesta ? formatLocalDate(ticket.fechaPrimeraRespuesta) : '-'}
              </p>
              {ticket.fechaPrimeraRespuesta && (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  ({getRelativeTime(ticket.fechaPrimeraRespuesta)})
                </p>
              )}
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Última Actualización
              </p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {formatLocalDate(ticket.fechaActualizacion)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                ({getRelativeTime(ticket.fechaActualizacion)})
              </p>
            </div>
          </div>

          {/* Assignee info */}
          <div className="mt-4 flex flex-wrap gap-4 text-sm">
            <div>
              <span className="text-gray-500 dark:text-gray-400">Cliente:</span>{' '}
              <span className="text-gray-900 dark:text-white font-medium">{ticket.cliente}</span>
            </div>
            {ticket.empleadoAsignado && (
              <div>
                <span className="text-gray-500 dark:text-gray-400">Asignado a:</span>{' '}
                <span className="text-gray-900 dark:text-white font-medium">{ticket.empleadoAsignado}</span>
              </div>
            )}
          </div>
        </div>

        {/* Description */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Descripción
          </h2>
          <div className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
            {ticket.descripcion}
          </div>
        </div>

        {/* Tabs for Comments and Files */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          {/* Tab Navigation */}
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex -mb-px" aria-label="Tabs">
              <button
                onClick={() => setActiveTab('comentarios')}
                className={`py-4 px-6 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'comentarios'
                    ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
                aria-selected={activeTab === 'comentarios'}
                role="tab"
                id="tab-comentarios"
                aria-controls="tabpanel-comentarios"
              >
                <span className="flex items-center gap-2">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
                  </svg>
                  Comentarios ({comments.length})
                </span>
              </button>
              <button
                onClick={() => setActiveTab('archivos')}
                className={`py-4 px-6 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'archivos'
                    ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
                aria-selected={activeTab === 'archivos'}
                role="tab"
                id="tab-archivos"
                aria-controls="tabpanel-archivos"
              >
                <span className="flex items-center gap-2">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.112 2.13" />
                  </svg>
                  Archivos ({archivos.length})
                </span>
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* Comments Tab Panel */}
            {activeTab === 'comentarios' && (
              <div
                role="tabpanel"
                id="tabpanel-comentarios"
                aria-labelledby="tab-comentarios"
              >
                <div className="space-y-4">
                  {/* Combine demo comments with submitted comments */}
                  {[...comments, ...submittedComments].map((comment) => (
                    <div key={comment.id} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900 dark:text-white">
                            {comment.usuario}
                          </span>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300">
                            {comment.rol}
                          </span>
                        </div>
                        <time
                          dateTime={comment.fecha.toISOString()}
                          className="text-sm text-gray-500 dark:text-gray-400"
                          title={formatLocalDate(comment.fecha)}
                        >
                          {getRelativeTime(comment.fecha)}
                        </time>
                      </div>
                      <p className="text-gray-700 dark:text-gray-300">
                        {comment.texto}
                      </p>
                      {/* Show attached file if exists */}
                      {comment.archivo && (
                        <div className="mt-3 flex items-center gap-2 p-2 bg-white dark:bg-gray-600 rounded border border-gray-200 dark:border-gray-500">
                          <svg className="h-5 w-5 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.112 2.13" />
                          </svg>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                              {comment.archivo.nombreOriginal}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {formatFileSize(comment.archivo.tamanio)}
                            </p>
                          </div>
                          <span className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                            </svg>
                            Adjunto
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Comment form with file attachment */}
                <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <label htmlFor="new-comment" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Agregar comentario
                  </label>
                  <textarea
                    id="new-comment"
                    rows={3}
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    disabled={isSubmittingComment}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:opacity-50"
                    placeholder="Escribe tu comentario..."
                  />

                  {/* File attachment section */}
                  <div className="mt-3">
                    <input
                      type="file"
                      ref={commentFileInputRef}
                      onChange={handleCommentFileSelect}
                      className="hidden"
                      aria-label="Adjuntar archivo al comentario"
                    />

                    {/* Selected file display */}
                    {commentFile && (
                      <div className="flex items-center gap-2 p-2 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg mb-2">
                        <svg className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.112 2.13" />
                        </svg>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-blue-800 dark:text-blue-200 truncate">
                            {commentFile.name}
                          </p>
                          <p className="text-xs text-blue-600 dark:text-blue-400">
                            {formatFileSize(commentFile.size)}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setCommentFile(null);
                            if (commentFileInputRef.current) {
                              commentFileInputRef.current.value = '';
                            }
                          }}
                          className="text-blue-500 hover:text-blue-700 dark:hover:text-blue-300"
                          aria-label="Quitar archivo adjunto"
                        >
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    )}

                    {/* File error message */}
                    {commentFileError && (
                      <div className="p-2 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg mb-2" role="alert">
                        <p className="text-sm text-red-700 dark:text-red-300">{commentFileError}</p>
                      </div>
                    )}
                  </div>

                  <div className="mt-2 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => {
                        setCommentFileError('');
                        commentFileInputRef.current?.click();
                      }}
                      disabled={isSubmittingComment}
                      className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 disabled:opacity-50"
                    >
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.112 2.13" />
                      </svg>
                      Adjuntar archivo
                    </button>
                    <button
                      type="button"
                      onClick={handleSubmitComment}
                      disabled={isSubmittingComment || !newComment.trim()}
                      className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {isSubmittingComment ? (
                        <>
                          <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Enviando...
                        </>
                      ) : (
                        'Enviar'
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Files Tab Panel */}
            {activeTab === 'archivos' && (
              <div
                role="tabpanel"
                id="tabpanel-archivos"
                aria-labelledby="tab-archivos"
              >
                {/* Combine demo files with uploaded files */}
                {(() => {
                  const allFiles = [...archivos, ...uploadedFiles];
                  return allFiles.length === 0 ? (
                    <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                      No hay archivos adjuntos.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {allFiles.map((archivo) => (
                      <div
                        key={archivo.id}
                        className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        {/* Thumbnail/Icon - clickable for images */}
                        <div className="flex-shrink-0">
                          {archivo.tipoMime.startsWith('image/') && archivo.previewUrl ? (
                            <button
                              onClick={() => setPreviewImage(archivo)}
                              className="relative group cursor-pointer"
                              title="Ver imagen"
                              aria-label={`Ver vista previa de ${archivo.nombreOriginal}`}
                            >
                              <img
                                src={archivo.previewUrl}
                                alt={`Miniatura de ${archivo.nombreOriginal}`}
                                className="h-16 w-16 object-cover rounded-lg border border-gray-200 dark:border-gray-600"
                              />
                              <div className="absolute inset-0 bg-black/40 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM10.5 7.5v6m3-3h-6" />
                                </svg>
                              </div>
                            </button>
                          ) : archivo.tipoMime.startsWith('image/') ? (
                            <div className="h-16 w-16 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex items-center justify-center">
                              <svg className="h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                              </svg>
                            </div>
                          ) : archivo.tipoMime === 'application/pdf' ? (
                            <div className="h-16 w-16 bg-red-100 dark:bg-red-900/50 rounded-lg flex items-center justify-center">
                              <svg className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                              </svg>
                            </div>
                          ) : (
                            <div className="h-16 w-16 bg-gray-100 dark:bg-gray-600 rounded-lg flex items-center justify-center">
                              <svg className="h-8 w-8 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 dark:text-white truncate">
                            {archivo.nombreOriginal}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {formatFileSize(archivo.tamanio)} • Subido por {archivo.subidoPor} • {formatLocalDate(archivo.fechaSubida)}
                          </p>
                          {archivo.tipoMime.startsWith('image/') && archivo.previewUrl && (
                            <button
                              onClick={() => setPreviewImage(archivo)}
                              className="text-sm text-primary-600 dark:text-primary-400 hover:underline mt-1"
                            >
                              Ver imagen
                            </button>
                          )}
                        </div>
                        <button
                          onClick={() => downloadDemoFile(archivo)}
                          className="flex-shrink-0 p-2 text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
                          title="Descargar archivo"
                          aria-label={`Descargar ${archivo.nombreOriginal}`}
                        >
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                          </svg>
                        </button>
                      </div>
                      ))}
                    </div>
                  );
                })()}

                {/* Upload progress indicator */}
                {uploadProgress !== null && (
                  <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                        Subiendo: {uploadFileName}
                      </span>
                      <span className="text-sm font-bold text-blue-700 dark:text-blue-300">
                        {Math.round(uploadProgress)}%
                      </span>
                    </div>
                    <div className="w-full bg-blue-200 dark:bg-blue-800 rounded-full h-3">
                      <div
                        className="bg-blue-600 dark:bg-blue-500 h-3 rounded-full transition-all duration-150"
                        style={{ width: `${uploadProgress}%` }}
                        role="progressbar"
                        aria-valuenow={Math.round(uploadProgress)}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-label={`Progreso de subida: ${Math.round(uploadProgress)}%`}
                      />
                    </div>
                    <p className="mt-2 text-xs text-blue-600 dark:text-blue-400">
                      {uploadProgress < 100 ? 'Subiendo archivo...' : '¡Completado!'}
                    </p>
                  </div>
                )}

                {/* File upload error message */}
                {uploadError && (
                  <div
                    className="mb-4 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg"
                    role="alert"
                    aria-live="assertive"
                  >
                    <div className="flex items-start gap-3">
                      <svg className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                      </svg>
                      <div className="flex-1">
                        <h4 className="text-sm font-semibold text-red-800 dark:text-red-200">
                          {uploadError.includes('tipo de archivo') ? 'Tipo de archivo no permitido' : 'Archivo demasiado grande'}
                        </h4>
                        <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                          {uploadError}
                        </p>
                      </div>
                      <button
                        onClick={() => setUploadError('')}
                        className="text-red-500 hover:text-red-700 dark:hover:text-red-300"
                        aria-label="Cerrar mensaje de error"
                      >
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                )}

                {/* Upload button and hidden input */}
                <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    className="hidden"
                    aria-label="Seleccionar archivo para subir"
                  />
                  <div className="flex flex-col gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setUploadError('');
                        fileInputRef.current?.click();
                      }}
                      disabled={uploadProgress !== null}
                      className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed w-fit"
                    >
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                      </svg>
                      {uploadProgress !== null ? 'Subiendo...' : 'Subir archivo'}
                    </button>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Tamaño maximo: 10MB. Tipos permitidos: JPG, PNG, GIF, PDF, DOC, DOCX, XLS, XLSX, TXT
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Image Preview Modal */}
      {previewImage && previewImage.previewUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setPreviewImage(null)}
          role="dialog"
          aria-modal="true"
          aria-label={`Vista previa de ${previewImage.nombreOriginal}`}
        >
          <div className="relative max-w-4xl max-h-full">
            {/* Close button */}
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors"
              aria-label="Cerrar vista previa"
            >
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Image */}
            <img
              src={previewImage.previewUrl}
              alt={previewImage.nombreOriginal}
              className="max-w-full max-h-[80vh] object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />

            {/* Image info */}
            <div className="mt-4 text-center text-white">
              <p className="font-medium">{previewImage.nombreOriginal}</p>
              <p className="text-sm text-gray-300">
                {formatFileSize(previewImage.tamanio)} • Subido por {previewImage.subidoPor}
              </p>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  downloadDemoFile(previewImage);
                }}
                className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                </svg>
                Descargar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
