// User types
export type UserRole = 'Admin' | 'Empleado' | 'Cliente';

export interface User {
  id: number;
  email: string;
  nombre: string;
  rol: UserRole;
  empresaId: number | null;
  empresa?: Empresa;
  activo: boolean;
  requiereCambioPassword: boolean;
  fechaCreacion: string;
  fechaActualizacion: string;
  ultimoAcceso: string | null;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// Usuario management types
export interface UsuarioList {
  id: number;
  email: string;
  nombre: string;
  rol: UserRole;
  empresaId: number | null;
  empresaNombre: string | null;
  activo: boolean;
  ultimoAcceso: string | null;
  fechaCreacion: string;
}

export interface CreateUsuarioRequest {
  email: string;
  nombre: string;
  rol: UserRole;
  empresaId?: number | null;
}

export interface UpdateUsuarioRequest {
  email: string;
  nombre: string;
  rol: UserRole;
  empresaId?: number | null;
  activo: boolean;
}

export interface CreateUsuarioResponse {
  usuario: UsuarioList;
  temporaryPassword: string;
}

export interface ResetPasswordResponse {
  message: string;
  temporaryPassword: string;
}

// Empresa types
export type TicketVisibility = 'propios' | 'empresa';

export interface Empresa {
  id: number;
  nombre: string;
  configVisibilidadTickets: TicketVisibility;
  logoUrl: string | null;
  colorPrimario: string | null;
  activa: boolean;
  fechaCreacion: string;
  fechaActualizacion: string;
}

export interface CreateEmpresaRequest {
  nombre: string;
  configVisibilidadTickets?: TicketVisibility;
  logoUrl?: string;
  colorPrimario?: string;
}

export interface UpdateEmpresaRequest extends CreateEmpresaRequest {
  activa?: boolean;
}

// Categoria types
export interface Categoria {
  id: number;
  nombre: string;
  descripcion: string | null;
  activa: boolean;
  fechaCreacion: string;
}

export interface CreateCategoriaRequest {
  nombre: string;
  descripcion?: string;
}

export interface UpdateCategoriaRequest extends CreateCategoriaRequest {
  activa?: boolean;
}

// Ticket types
export type TicketPriority = 'Baja' | 'Media' | 'Alta';
export type TicketStatus = 'Abierto' | 'EnProceso' | 'EnEspera' | 'Resuelto' | 'Cerrado';

export interface Ticket {
  id: number;
  titulo: string;
  descripcion: string;
  clienteId: number;
  cliente?: User;
  empleadoAsignadoId: number | null;
  empleadoAsignado?: User;
  categoriaId: number;
  categoria?: Categoria;
  prioridad: TicketPriority;
  estado: TicketStatus;
  fechaCreacion: string;
  fechaActualizacion: string;
  fechaPrimeraRespuesta: string | null;
  fechaResolucion: string | null;
  comentarios?: Comentario[];
  archivos?: Archivo[];
}

export interface CreateTicketRequest {
  titulo: string;
  descripcion: string;
  categoriaId: number;
  prioridad: TicketPriority;
}

export interface UpdateTicketRequest {
  titulo?: string;
  descripcion?: string;
  categoriaId?: number;
  prioridad?: TicketPriority;
}

export interface AssignTicketRequest {
  empleadoId: number;
}

export interface ChangeStatusRequest {
  estado: TicketStatus;
}

// Comentario types
export interface Comentario {
  id: number;
  ticketId: number;
  usuarioId: number;
  usuario?: User;
  texto: string;
  fechaCreacion: string;
  archivos?: Archivo[];
}

export interface CreateComentarioRequest {
  texto: string;
}

// Archivo types
export interface Archivo {
  id: number;
  ticketId: number;
  comentarioId: number | null;
  nombreOriginal: string;
  nombreAlmacenado: string;
  tipoMime: string;
  tamanio: number;
  subidoPorId: number;
  subidoPor?: User;
  fechaSubida: string;
}

// Solicitud de registro types
export type SolicitudStatus = 'Pendiente' | 'Aprobada' | 'Rechazada';

export interface SolicitudRegistro {
  id: number;
  email: string;
  nombre: string;
  empresaId: number;
  empresa?: Empresa;
  estado: SolicitudStatus;
  fechaSolicitud: string;
  fechaResolucion: string | null;
  aprobadoPorId: number | null;
  aprobadoPor?: User;
}

export interface CreateSolicitudRequest {
  email: string;
  nombre: string;
  empresaId: number;
}

// SLA types
export interface ConfiguracionSLA {
  id: number;
  prioridad: TicketPriority;
  tiempoRespuestaHoras: number;
  tiempoResolucionHoras: number;
}

export interface UpdateSLARequest {
  tiempoRespuestaHoras: number;
  tiempoResolucionHoras: number;
}

// System configuration types
export interface ConfiguracionSistema {
  id: number;
  clave: string;
  valor: string;
  descripcion: string | null;
}

export interface UpdateConfiguracionRequest {
  valor: string;
}

// Pagination and filtering
export interface PaginatedResponse<T> {
  items: T[];
  totalItems: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface TicketFilters {
  estado?: TicketStatus;
  prioridad?: TicketPriority;
  categoriaId?: number;
  empresaId?: number;
  empleadoId?: number;
  busqueda?: string;
  fechaDesde?: string;
  fechaHasta?: string;
  page?: number;
  pageSize?: number;
  ordenarPor?: 'fecha' | 'prioridad';
  ordenAscendente?: boolean;
}

// Dashboard types
export interface DashboardStats {
  totalTickets: number;
  ticketsAbiertos: number;
  ticketsEnProceso: number;
  ticketsResueltos: number;
  ticketsCerrados: number;
  ticketsPorPrioridad: {
    alta: number;
    media: number;
    baja: number;
  };
  slaIncumplidos: number;
}

export interface EmpleadoDashboard {
  ticketsAsignados: number;
  ticketsSinAsignar: number;
  ticketsAtendidosHoy: number;
  ticketsPendientes: number;
  ticketsRecientes: Ticket[];
}

// Report types
export interface ReporteTicketsPeriodo {
  periodo: string;
  total: number;
  abiertos: number;
  resueltos: number;
  cerrados: number;
}

export interface ReporteRendimientoEmpleado {
  empleadoId: number;
  empleadoNombre: string;
  ticketsAsignados: number;
  ticketsResueltos: number;
  tiempoPromedioResolucion: number;
  slasCumplidos: number;
  slasIncumplidos: number;
}

// API Error type
export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
  statusCode?: number;
}
