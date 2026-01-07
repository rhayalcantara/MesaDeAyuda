import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, formatDistanceToNow, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { TicketPriority, TicketStatus } from '@/types';

// Merge Tailwind classes
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Date formatting
export function formatDate(dateString: string): string {
  try {
    return format(parseISO(dateString), 'dd/MM/yyyy', { locale: es });
  } catch {
    return dateString;
  }
}

export function formatDateTime(dateString: string): string {
  try {
    return format(parseISO(dateString), 'dd/MM/yyyy HH:mm', { locale: es });
  } catch {
    return dateString;
  }
}

export function formatRelativeTime(dateString: string): string {
  try {
    return formatDistanceToNow(parseISO(dateString), { addSuffix: true, locale: es });
  } catch {
    return dateString;
  }
}

// Priority helpers
export const priorityLabels: Record<TicketPriority, string> = {
  Alta: 'Alta',
  Media: 'Media',
  Baja: 'Baja',
};

export const priorityColors: Record<TicketPriority, string> = {
  Alta: 'priority-alta',
  Media: 'priority-media',
  Baja: 'priority-baja',
};

export const priorityOrder: Record<TicketPriority, number> = {
  Alta: 1,
  Media: 2,
  Baja: 3,
};

// Status helpers
export const statusLabels: Record<TicketStatus, string> = {
  Abierto: 'Abierto',
  EnProceso: 'En Proceso',
  EnEspera: 'En Espera',
  Resuelto: 'Resuelto',
  Cerrado: 'Cerrado',
};

export const statusColors: Record<TicketStatus, string> = {
  Abierto: 'status-abierto',
  EnProceso: 'status-enproceso',
  EnEspera: 'status-enespera',
  Resuelto: 'status-resuelto',
  Cerrado: 'status-cerrado',
};

// File helpers
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function getFileExtension(filename: string): string {
  return filename.slice(((filename.lastIndexOf('.') - 1) >>> 0) + 2).toLowerCase();
}

export function isImageFile(mimeType: string): boolean {
  return mimeType.startsWith('image/');
}

export const allowedFileTypes = [
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

export const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'doc', 'docx', 'xls', 'xlsx', 'txt'];

export const maxFileSize = 10 * 1024 * 1024; // 10MB

// Validation helpers
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isValidPassword(password: string): boolean {
  // Minimum 8 chars, at least one uppercase, one lowercase, one number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  return passwordRegex.test(password);
}

export function getPasswordStrength(password: string): 'weak' | 'medium' | 'strong' {
  if (password.length < 8) return 'weak';

  let strength = 0;
  if (/[a-z]/.test(password)) strength++;
  if (/[A-Z]/.test(password)) strength++;
  if (/\d/.test(password)) strength++;
  if (/[^a-zA-Z0-9]/.test(password)) strength++;

  if (strength <= 2) return 'weak';
  if (strength === 3) return 'medium';
  return 'strong';
}

// String helpers
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - 3) + '...';
}

export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

// SLA helpers
export function getSLAStatus(
  createdAt: string,
  firstResponseAt: string | null,
  slaResponseHours: number
): 'ok' | 'warning' | 'expired' {
  const now = new Date();
  const created = parseISO(createdAt);
  const deadline = new Date(created.getTime() + slaResponseHours * 60 * 60 * 1000);

  if (firstResponseAt) return 'ok';

  const hoursRemaining = (deadline.getTime() - now.getTime()) / (60 * 60 * 1000);

  if (hoursRemaining <= 0) return 'expired';
  if (hoursRemaining <= slaResponseHours * 0.25) return 'warning';
  return 'ok';
}

// URL helpers
export function buildQueryString(params: Record<string, any>): string {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, String(value));
    }
  });

  return searchParams.toString();
}

export function parseQueryString(queryString: string): Record<string, string> {
  const params = new URLSearchParams(queryString);
  const result: Record<string, string> = {};

  params.forEach((value, key) => {
    result[key] = value;
  });

  return result;
}
