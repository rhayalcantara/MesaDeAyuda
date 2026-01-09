# Plan Fase 6: Implementar Soft Delete para Tickets

## Objetivo
Implementar eliminación lógica (soft delete) para tickets en lugar de eliminación física.

## Lista de Tareas

| # | Tarea | Estado |
|---|-------|--------|
| 1 | Leer archivos existentes (Ticket.cs, ApplicationDbContext.cs, TicketsController.cs) | Finalizada |
| 2 | Agregar campos de soft delete al modelo Ticket.cs | Finalizada |
| 3 | Actualizar ApplicationDbContext.cs con configuración y query filter | Finalizada |
| 4 | Modificar endpoint DELETE en TicketsController.cs para soft delete | Finalizada |
| 5 | Crear migración AddSoftDeleteToTickets | Finalizada |
| 6 | Verificar que compile sin errores | Finalizada |

## Cambios a Realizar

### 1. Ticket.cs
Agregar campos:
- `IsDeleted` (bool) - Flag de eliminación
- `DeletedAt` (DateTime?) - Fecha de eliminación
- `DeletedById` (int?) - ID del usuario que eliminó
- `DeletedBy` (Usuario?) - Navegación al usuario

### 2. ApplicationDbContext.cs
- Configurar relación DeletedBy -> Usuario
- Agregar query filter global para excluir tickets eliminados automáticamente

### 3. TicketsController.cs
- Modificar método DeleteTicket para hacer soft delete
- Usar IgnoreQueryFilters para encontrar tickets incluso si están eliminados

## Notas Importantes
- NO ejecutar `dotnet ef database update` después de crear la migración
- La migración se aplicará manualmente después
