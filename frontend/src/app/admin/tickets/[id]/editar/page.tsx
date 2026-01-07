'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { MainLayout } from '@/components/layout';
import api from '@/lib/api';

interface Categoria {
  id: number;
  nombre: string;
  activa: boolean;
}

interface Empleado {
  id: number;
  nombre: string;
}

interface Ticket {
  id: number;
  titulo: string;
  descripcion: string;
  estado: string;
  prioridad: string;
  categoriaId: number;
  empleadoAsignadoId: number | null;
}

// Demo data for testing without backend
const demoCategorias: Categoria[] = [
  { id: 1, nombre: 'Sistema de Ventas', activa: true },
  { id: 2, nombre: 'Sistema de Inventario', activa: true },
  { id: 3, nombre: 'Portal Web', activa: true },
  { id: 4, nombre: 'Aplicacion Movil', activa: true },
  { id: 5, nombre: 'Otro', activa: true },
];

const demoEmpleados: Empleado[] = [
  { id: 1, nombre: 'Admin Demo' },
  { id: 2, nombre: 'Empleado Demo' },
];

const demoTicket: Ticket = {
  id: 1,
  titulo: 'Error al cargar reportes en el sistema',
  descripcion: 'Al intentar generar el reporte mensual de ventas, el sistema muestra un error de timeout. El problema ocurre cuando se seleccionan fechas mayores a 30 dias.',
  estado: 'EnProceso',
  prioridad: 'Alta',
  categoriaId: 1,
  empleadoAsignadoId: 2,
};

export default function AdminTicketEditPage() {
  const params = useParams();
  const router = useRouter();
  const ticketId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [empleados, setEmpleados] = useState<Empleado[]>([]);

  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    estado: 'Abierto',
    prioridad: 'Media',
    categoriaId: '',
    empleadoAsignadoId: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchData();
  }, [ticketId]);

  const fetchData = async () => {
    try {
      // Try to fetch from API
      const [ticketRes, categoriasRes, empleadosRes] = await Promise.all([
        api.get(`/tickets/${ticketId}`),
        api.get('/categorias'),
        api.get('/usuarios/empleados'),
      ]);

      const ticket = ticketRes.data;
      setFormData({
        titulo: ticket.titulo,
        descripcion: ticket.descripcion,
        estado: ticket.estado,
        prioridad: ticket.prioridad,
        categoriaId: String(ticket.categoriaId),
        empleadoAsignadoId: ticket.empleadoAsignadoId ? String(ticket.empleadoAsignadoId) : '',
      });
      setCategorias(categoriasRes.data);
      setEmpleados(empleadosRes.data);
    } catch (error) {
      // Fall back to demo data
      console.log('Using demo data (API not available)');
      const ticket = { ...demoTicket, id: parseInt(ticketId) };
      setFormData({
        titulo: ticket.titulo,
        descripcion: ticket.descripcion,
        estado: ticket.estado,
        prioridad: ticket.prioridad,
        categoriaId: String(ticket.categoriaId),
        empleadoAsignadoId: ticket.empleadoAsignadoId ? String(ticket.empleadoAsignadoId) : '',
      });
      setCategorias(demoCategorias);
      setEmpleados(demoEmpleados);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.titulo.trim()) {
      newErrors.titulo = 'El titulo es requerido';
    } else if (formData.titulo.length > 200) {
      newErrors.titulo = 'El titulo no puede exceder 200 caracteres';
    }

    if (!formData.descripcion.trim()) {
      newErrors.descripcion = 'La descripcion es requerida';
    }

    if (!formData.categoriaId) {
      newErrors.categoriaId = 'Seleccione una categoria';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSaving(true);
    try {
      await api.put(`/tickets/${ticketId}`, {
        ...formData,
        categoriaId: parseInt(formData.categoriaId),
        empleadoAsignadoId: formData.empleadoAsignadoId ? parseInt(formData.empleadoAsignadoId) : null,
      });
      router.push(`/admin/tickets/${ticketId}`);
    } catch (error) {
      // In demo mode, just redirect
      console.log('Demo: Ticket would be updated');
      router.push(`/admin/tickets/${ticketId}`);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when field is modified
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  if (loading) {
    return (
      <MainLayout requiredRoles={['Admin']}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout requiredRoles={['Admin']}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-2">
            <Link href="/admin/tickets" className="hover:text-primary-600">
              Tickets
            </Link>
            <span>/</span>
            <Link href={`/admin/tickets/${ticketId}`} className="hover:text-primary-600">
              #{ticketId}
            </Link>
            <span>/</span>
            <span>Editar</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Editar Ticket #{ticketId}
          </h1>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="card p-6 space-y-6">
          {/* Titulo */}
          <div>
            <label htmlFor="titulo" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Titulo del ticket <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="titulo"
              name="titulo"
              value={formData.titulo}
              onChange={handleChange}
              className={`input w-full ${errors.titulo ? 'border-red-500' : ''}`}
              placeholder="Describe brevemente el problema"
              aria-invalid={!!errors.titulo}
              aria-describedby={errors.titulo ? 'titulo-error' : undefined}
            />
            {errors.titulo && (
              <p id="titulo-error" className="mt-1 text-sm text-red-500" role="alert">
                {errors.titulo}
              </p>
            )}
          </div>

          {/* Estado y Prioridad */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="estado" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Estado <span className="text-red-500">*</span>
              </label>
              <select
                id="estado"
                name="estado"
                value={formData.estado}
                onChange={handleChange}
                className="input w-full"
              >
                <option value="Abierto">Abierto</option>
                <option value="EnProceso">En Proceso</option>
                <option value="EnEspera">En Espera</option>
                <option value="Resuelto">Resuelto</option>
                <option value="Cerrado">Cerrado</option>
              </select>
            </div>

            <div>
              <label htmlFor="prioridad" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Prioridad <span className="text-red-500">*</span>
              </label>
              <select
                id="prioridad"
                name="prioridad"
                value={formData.prioridad}
                onChange={handleChange}
                className="input w-full"
              >
                <option value="Baja">Baja</option>
                <option value="Media">Media</option>
                <option value="Alta">Alta</option>
              </select>
            </div>
          </div>

          {/* Categoria y Asignacion */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="categoriaId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Categoria <span className="text-red-500">*</span>
              </label>
              <select
                id="categoriaId"
                name="categoriaId"
                value={formData.categoriaId}
                onChange={handleChange}
                className={`input w-full ${errors.categoriaId ? 'border-red-500' : ''}`}
                aria-invalid={!!errors.categoriaId}
                aria-describedby={errors.categoriaId ? 'categoria-error' : undefined}
              >
                <option value="">Seleccione una categoria</option>
                {categorias.filter(c => c.activa).map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.nombre}
                  </option>
                ))}
              </select>
              {errors.categoriaId && (
                <p id="categoria-error" className="mt-1 text-sm text-red-500" role="alert">
                  {errors.categoriaId}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="empleadoAsignadoId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Asignar a empleado
              </label>
              <select
                id="empleadoAsignadoId"
                name="empleadoAsignadoId"
                value={formData.empleadoAsignadoId}
                onChange={handleChange}
                className="input w-full"
              >
                <option value="">Sin asignar</option>
                {empleados.map(emp => (
                  <option key={emp.id} value={emp.id}>
                    {emp.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Descripcion */}
          <div>
            <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Descripcion detallada <span className="text-red-500">*</span>
            </label>
            <textarea
              id="descripcion"
              name="descripcion"
              value={formData.descripcion}
              onChange={handleChange}
              rows={6}
              className={`input w-full ${errors.descripcion ? 'border-red-500' : ''}`}
              placeholder="Describa el problema con el mayor detalle posible"
              aria-invalid={!!errors.descripcion}
              aria-describedby={errors.descripcion ? 'descripcion-error' : undefined}
            />
            {errors.descripcion && (
              <p id="descripcion-error" className="mt-1 text-sm text-red-500" role="alert">
                {errors.descripcion}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Link
              href={`/admin/tickets/${ticketId}`}
              className="btn-secondary"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="btn-primary"
            >
              {saving ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </div>
        </form>
      </div>
    </MainLayout>
  );
}
