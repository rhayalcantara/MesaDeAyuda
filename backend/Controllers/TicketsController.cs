using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MDAyuda.API.Data;
using MDAyuda.API.DTOs;
using MDAyuda.API.Models;
using MDAyuda.API.Services;
using System.Security.Claims;

namespace MDAyuda.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class TicketsController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly IEmailService _emailService;
    private readonly ILogger<TicketsController> _logger;

    public TicketsController(
        ApplicationDbContext context,
        IEmailService emailService,
        ILogger<TicketsController> logger)
    {
        _context = context;
        _emailService = emailService;
        _logger = logger;
    }

    private int GetUserId() => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
    private string GetUserRole() => User.FindFirstValue(ClaimTypes.Role)!;

    [HttpGet]
    [Authorize(Policy = "EmpleadoOrAdmin")]
    public async Task<ActionResult<TicketListDto>> GetTickets([FromQuery] TicketFilterDto filter)
    {
        var query = _context.Tickets
            .Include(t => t.Cliente)
            .Include(t => t.EmpleadoAsignado)
            .Include(t => t.Categoria)
            .AsQueryable();

        // Apply filters
        if (!string.IsNullOrEmpty(filter.Estado))
            query = query.Where(t => t.Estado == filter.Estado);

        if (!string.IsNullOrEmpty(filter.Prioridad))
            query = query.Where(t => t.Prioridad == filter.Prioridad);

        if (filter.CategoriaId.HasValue)
            query = query.Where(t => t.CategoriaId == filter.CategoriaId);

        if (filter.EmpresaId.HasValue)
            query = query.Where(t => t.Cliente!.EmpresaId == filter.EmpresaId);

        if (filter.EmpleadoId.HasValue)
            query = query.Where(t => t.EmpleadoAsignadoId == filter.EmpleadoId);

        if (!string.IsNullOrEmpty(filter.Busqueda))
        {
            var busqueda = filter.Busqueda.ToLower();
            query = query.Where(t =>
                t.Titulo.ToLower().Contains(busqueda) ||
                t.Descripcion.ToLower().Contains(busqueda) ||
                t.Id.ToString().Contains(busqueda));
        }

        if (filter.FechaDesde.HasValue)
            query = query.Where(t => t.FechaCreacion >= filter.FechaDesde);

        if (filter.FechaHasta.HasValue)
            query = query.Where(t => t.FechaCreacion <= filter.FechaHasta);

        // Apply sorting
        query = filter.OrdenarPor switch
        {
            "prioridad" => filter.OrdenAscendente
                ? query.OrderBy(t => t.Prioridad)
                : query.OrderByDescending(t => t.Prioridad),
            _ => filter.OrdenAscendente
                ? query.OrderBy(t => t.FechaCreacion)
                : query.OrderByDescending(t => t.FechaCreacion)
        };

        var totalItems = await query.CountAsync();
        var totalPages = (int)Math.Ceiling(totalItems / (double)filter.PageSize);

        var tickets = await query
            .Skip((filter.Page - 1) * filter.PageSize)
            .Take(filter.PageSize)
            .Select(t => new TicketDto
            {
                Id = t.Id,
                Titulo = t.Titulo,
                Descripcion = t.Descripcion,
                ClienteId = t.ClienteId,
                ClienteNombre = t.Cliente != null ? t.Cliente.Nombre : "Sin cliente",
                ClienteEmail = t.Cliente != null ? t.Cliente.Email : null,
                EmpleadoAsignadoId = t.EmpleadoAsignadoId,
                EmpleadoAsignadoNombre = t.EmpleadoAsignado != null ? t.EmpleadoAsignado.Nombre : null,
                CategoriaId = t.CategoriaId,
                CategoriaNombre = t.Categoria != null ? t.Categoria.Nombre : "Sin categoría",
                Prioridad = t.Prioridad,
                Estado = t.Estado,
                FechaCreacion = t.FechaCreacion,
                FechaActualizacion = t.FechaActualizacion,
                FechaPrimeraRespuesta = t.FechaPrimeraRespuesta,
                FechaResolucion = t.FechaResolucion,
                ComentariosCount = t.Comentarios != null ? t.Comentarios.Count : 0,
                ArchivosCount = t.Archivos != null ? t.Archivos.Count : 0
            })
            .ToListAsync();

        return Ok(new TicketListDto
        {
            Items = tickets,
            TotalItems = totalItems,
            Page = filter.Page,
            PageSize = filter.PageSize,
            TotalPages = totalPages
        });
    }

    [HttpGet("mis-tickets")]
    public async Task<ActionResult<TicketListDto>> GetMyTickets([FromQuery] TicketFilterDto filter)
    {
        var userId = GetUserId();
        var userRole = GetUserRole();

        var query = _context.Tickets
            .Include(t => t.Cliente)
            .Include(t => t.EmpleadoAsignado)
            .Include(t => t.Categoria)
            .AsQueryable();

        if (userRole == "Cliente")
        {
            // Get user's empresa visibility configuration
            var user = await _context.Usuarios
                .Include(u => u.Empresa)
                .FirstOrDefaultAsync(u => u.Id == userId);

            if (user?.Empresa?.ConfigVisibilidadTickets == "empresa")
            {
                // Show all tickets from the same empresa
                query = query.Where(t => t.Cliente!.EmpresaId == user.EmpresaId);
            }
            else
            {
                // Show only own tickets
                query = query.Where(t => t.ClienteId == userId);
            }
        }
        else if (userRole == "Empleado")
        {
            query = query.Where(t => t.EmpleadoAsignadoId == userId);
        }

        // Apply other filters...
        if (!string.IsNullOrEmpty(filter.Estado))
            query = query.Where(t => t.Estado == filter.Estado);

        if (!string.IsNullOrEmpty(filter.Busqueda))
        {
            var busqueda = filter.Busqueda.ToLower();
            query = query.Where(t =>
                t.Titulo.ToLower().Contains(busqueda) ||
                t.Descripcion.ToLower().Contains(busqueda));
        }

        query = query.OrderByDescending(t => t.FechaCreacion);

        var totalItems = await query.CountAsync();
        var totalPages = (int)Math.Ceiling(totalItems / (double)filter.PageSize);

        var tickets = await query
            .Skip((filter.Page - 1) * filter.PageSize)
            .Take(filter.PageSize)
            .Select(t => new TicketDto
            {
                Id = t.Id,
                Titulo = t.Titulo,
                Descripcion = t.Descripcion,
                ClienteId = t.ClienteId,
                ClienteNombre = t.Cliente != null ? t.Cliente.Nombre : "Sin cliente",
                EmpleadoAsignadoId = t.EmpleadoAsignadoId,
                EmpleadoAsignadoNombre = t.EmpleadoAsignado != null ? t.EmpleadoAsignado.Nombre : null,
                CategoriaId = t.CategoriaId,
                CategoriaNombre = t.Categoria != null ? t.Categoria.Nombre : "Sin categoría",
                Prioridad = t.Prioridad,
                Estado = t.Estado,
                FechaCreacion = t.FechaCreacion,
                FechaActualizacion = t.FechaActualizacion,
                ComentariosCount = t.Comentarios != null ? t.Comentarios.Count : 0,
                ArchivosCount = t.Archivos != null ? t.Archivos.Count : 0
            })
            .ToListAsync();

        return Ok(new TicketListDto
        {
            Items = tickets,
            TotalItems = totalItems,
            Page = filter.Page,
            PageSize = filter.PageSize,
            TotalPages = totalPages
        });
    }

    [HttpGet("sin-asignar")]
    [Authorize(Policy = "EmpleadoOrAdmin")]
    public async Task<ActionResult<List<TicketDto>>> GetUnassignedTickets()
    {
        var tickets = await _context.Tickets
            .Include(t => t.Cliente)
            .Include(t => t.Categoria)
            .Where(t => t.EmpleadoAsignadoId == null && t.Estado == "Abierto")
            .OrderByDescending(t => t.Prioridad == "Alta")
            .ThenByDescending(t => t.Prioridad == "Media")
            .ThenBy(t => t.FechaCreacion)
            .Select(t => new TicketDto
            {
                Id = t.Id,
                Titulo = t.Titulo,
                Descripcion = t.Descripcion,
                ClienteId = t.ClienteId,
                ClienteNombre = t.Cliente != null ? t.Cliente.Nombre : "Sin cliente",
                CategoriaId = t.CategoriaId,
                CategoriaNombre = t.Categoria != null ? t.Categoria.Nombre : "Sin categoría",
                Prioridad = t.Prioridad,
                Estado = t.Estado,
                FechaCreacion = t.FechaCreacion
            })
            .ToListAsync();

        return Ok(tickets);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<TicketDto>> GetTicket(int id)
    {
        var ticket = await _context.Tickets
            .Include(t => t.Cliente)
            .Include(t => t.EmpleadoAsignado)
            .Include(t => t.Categoria)
            .Include(t => t.Comentarios)
            .Include(t => t.Archivos)
            .FirstOrDefaultAsync(t => t.Id == id);

        if (ticket == null)
        {
            return NotFound(new { message = "Ticket no encontrado" });
        }

        // Check access permissions
        var userId = GetUserId();
        var userRole = GetUserRole();

        if (userRole == "Cliente")
        {
            var user = await _context.Usuarios
                .Include(u => u.Empresa)
                .FirstOrDefaultAsync(u => u.Id == userId);

            if (user?.Empresa?.ConfigVisibilidadTickets == "empresa")
            {
                if (ticket.Cliente?.EmpresaId != user.EmpresaId)
                {
                    return Forbid();
                }
            }
            else if (ticket.ClienteId != userId)
            {
                return Forbid();
            }
        }

        return Ok(new TicketDto
        {
            Id = ticket.Id,
            Titulo = ticket.Titulo,
            Descripcion = ticket.Descripcion,
            ClienteId = ticket.ClienteId,
            ClienteNombre = ticket.Cliente?.Nombre,
            ClienteEmail = ticket.Cliente?.Email,
            EmpleadoAsignadoId = ticket.EmpleadoAsignadoId,
            EmpleadoAsignadoNombre = ticket.EmpleadoAsignado?.Nombre,
            CategoriaId = ticket.CategoriaId,
            CategoriaNombre = ticket.Categoria?.Nombre,
            Prioridad = ticket.Prioridad,
            Estado = ticket.Estado,
            FechaCreacion = ticket.FechaCreacion,
            FechaActualizacion = ticket.FechaActualizacion,
            FechaPrimeraRespuesta = ticket.FechaPrimeraRespuesta,
            FechaResolucion = ticket.FechaResolucion,
            ComentariosCount = ticket.Comentarios?.Count ?? 0,
            ArchivosCount = ticket.Archivos?.Count ?? 0,
            RowVersion = ticket.RowVersion != null ? Convert.ToBase64String(ticket.RowVersion) : null
        });
    }

    [HttpPost]
    public async Task<ActionResult<TicketDto>> CreateTicket([FromBody] CreateTicketDto dto)
    {
        var userId = GetUserId();
        var userRole = GetUserRole();

        // Validate category
        var categoria = await _context.Categorias.FindAsync(dto.CategoriaId);
        if (categoria == null || !categoria.Activa)
        {
            return BadRequest(new { message = "La categoria seleccionada no existe o no esta activa" });
        }

        // Validate priority
        var validPriorities = new[] { "Baja", "Media", "Alta" };
        if (!validPriorities.Contains(dto.Prioridad))
        {
            return BadRequest(new { message = "Prioridad invalida" });
        }

        var ticket = new Ticket
        {
            Titulo = dto.Titulo,
            Descripcion = dto.Descripcion,
            ClienteId = userId,
            CategoriaId = dto.CategoriaId,
            Prioridad = dto.Prioridad,
            Estado = "Abierto",
            FechaCreacion = DateTime.UtcNow,
            FechaActualizacion = DateTime.UtcNow
        };

        _context.Tickets.Add(ticket);
        await _context.SaveChangesAsync();

        // Load related entities
        await _context.Entry(ticket).Reference(t => t.Cliente).LoadAsync();
        await _context.Entry(ticket).Reference(t => t.Categoria).LoadAsync();

        _logger.LogInformation("Ticket {TicketId} created by user {UserId}", ticket.Id, userId);

        // Notify employees about new ticket (async, don't wait)
        _ = NotifyEmployeesAboutNewTicket(ticket);

        return CreatedAtAction(nameof(GetTicket), new { id = ticket.Id }, new TicketDto
        {
            Id = ticket.Id,
            Titulo = ticket.Titulo,
            Descripcion = ticket.Descripcion,
            ClienteId = ticket.ClienteId,
            ClienteNombre = ticket.Cliente!.Nombre,
            CategoriaId = ticket.CategoriaId,
            CategoriaNombre = ticket.Categoria!.Nombre,
            Prioridad = ticket.Prioridad,
            Estado = ticket.Estado,
            FechaCreacion = ticket.FechaCreacion,
            FechaActualizacion = ticket.FechaActualizacion
        });
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateTicket(int id, [FromBody] UpdateTicketDto dto)
    {
        var ticket = await _context.Tickets.FindAsync(id);
        if (ticket == null)
        {
            return NotFound(new { message = "Ticket no encontrado" });
        }

        var userId = GetUserId();
        var userRole = GetUserRole();

        // Only cliente who created or admin/empleado can update
        if (userRole == "Cliente" && ticket.ClienteId != userId)
        {
            return Forbid();
        }

        // Check for concurrency conflict using RowVersion
        if (!string.IsNullOrEmpty(dto.RowVersion))
        {
            try
            {
                var clientRowVersion = Convert.FromBase64String(dto.RowVersion);
                if (ticket.RowVersion != null && !ticket.RowVersion.SequenceEqual(clientRowVersion))
                {
                    return Conflict(new {
                        message = "Este ticket ha sido modificado por otro usuario. Por favor, recargue la pagina e intente de nuevo.",
                        code = "CONCURRENCY_CONFLICT"
                    });
                }
            }
            catch (FormatException)
            {
                // Invalid Base64 string, ignore and proceed
            }
        }

        if (!string.IsNullOrEmpty(dto.Titulo))
            ticket.Titulo = dto.Titulo;

        if (!string.IsNullOrEmpty(dto.Descripcion))
            ticket.Descripcion = dto.Descripcion;

        if (dto.CategoriaId.HasValue)
        {
            var categoria = await _context.Categorias.FindAsync(dto.CategoriaId);
            if (categoria == null || !categoria.Activa)
            {
                return BadRequest(new { message = "Categoria invalida" });
            }
            ticket.CategoriaId = dto.CategoriaId.Value;
        }

        if (!string.IsNullOrEmpty(dto.Prioridad))
        {
            var validPriorities = new[] { "Baja", "Media", "Alta" };
            if (!validPriorities.Contains(dto.Prioridad))
            {
                return BadRequest(new { message = "Prioridad invalida" });
            }
            ticket.Prioridad = dto.Prioridad;
        }

        ticket.FechaActualizacion = DateTime.UtcNow;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            return Conflict(new {
                message = "Este ticket ha sido modificado por otro usuario. Por favor, recargue la pagina e intente de nuevo.",
                code = "CONCURRENCY_CONFLICT"
            });
        }

        // Return updated ticket with new RowVersion
        return Ok(new {
            message = "Ticket actualizado exitosamente",
            rowVersion = ticket.RowVersion != null ? Convert.ToBase64String(ticket.RowVersion) : null
        });
    }

    [HttpPut("{id}/asignar")]
    [Authorize(Policy = "EmpleadoOrAdmin")]
    public async Task<IActionResult> AssignTicket(int id, [FromBody] AssignTicketDto? dto = null)
    {
        var ticket = await _context.Tickets.FindAsync(id);
        if (ticket == null)
        {
            return NotFound(new { message = "Ticket no encontrado" });
        }

        var userId = GetUserId();
        var userRole = GetUserRole();

        // If no body provided, self-assign to current user
        var empleadoId = dto?.EmpleadoId ?? userId;

        // Validación: Si el ticket ya está asignado, solo admin puede reasignar
        if (ticket.EmpleadoAsignadoId != null && userRole != "Admin")
        {
            // Excepción: un empleado puede auto-asignarse si el ticket no tiene asignado
            // Pero si ya está asignado a otro, solo admin puede reasignar
            if (ticket.EmpleadoAsignadoId != userId)
            {
                _logger.LogWarning("Empleado {UserId} intentó reasignar el ticket {TicketId} que ya está asignado a {AsignadoId}",
                    userId, id, ticket.EmpleadoAsignadoId);
                return StatusCode(403, new { message = "Este ticket ya está asignado. Solo un administrador puede reasignarlo." });
            }
        }

        // Validación: Empleados solo pueden asignarse a sí mismos
        if (userRole == "Empleado" && empleadoId != userId)
        {
            _logger.LogWarning("Empleado {UserId} intentó asignar el ticket {TicketId} a otro empleado {EmpleadoId}",
                userId, id, empleadoId);
            return StatusCode(403, new { message = "Solo puedes asignarte tickets a ti mismo" });
        }

        var empleado = await _context.Usuarios.FindAsync(empleadoId);
        if (empleado == null || empleado.Rol != "Empleado" && empleado.Rol != "Admin" || !empleado.Activo)
        {
            return BadRequest(new { message = "Empleado invalido" });
        }

        var empleadoAnteriorId = ticket.EmpleadoAsignadoId;
        var empleadoAnteriorNombre = empleadoAnteriorId.HasValue
            ? (await _context.Usuarios.FindAsync(empleadoAnteriorId))?.Nombre
            : null;

        ticket.EmpleadoAsignadoId = empleadoId;
        var estadoAnterior = ticket.Estado;
        if (ticket.Estado == "Abierto")
        {
            ticket.Estado = "EnProceso";
        }
        ticket.FechaActualizacion = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        // Registrar asignación en el historial
        await RegistrarHistorial(
            ticketId: id,
            usuarioId: userId,
            tipoAccion: "Asignacion",
            campo: "EmpleadoAsignado",
            valorAnterior: empleadoAnteriorNombre,
            valorNuevo: empleado.Nombre,
            descripcion: empleadoAnteriorId.HasValue
                ? $"Reasignado de {empleadoAnteriorNombre} a {empleado.Nombre}"
                : $"Asignado a {empleado.Nombre}"
        );

        // Si el estado cambió, registrar también ese cambio
        if (estadoAnterior != ticket.Estado)
        {
            await RegistrarHistorial(
                ticketId: id,
                usuarioId: userId,
                tipoAccion: "CambioEstado",
                campo: "Estado",
                valorAnterior: estadoAnterior,
                valorNuevo: ticket.Estado,
                descripcion: $"Estado cambiado automáticamente de {estadoAnterior} a {ticket.Estado} por asignación"
            );
        }

        _logger.LogInformation("Ticket {TicketId} assigned to employee {EmpleadoId}", id, empleadoId);

        return Ok(new { message = "Ticket asignado exitosamente" });
    }

    [HttpPut("{id}/estado")]
    [Authorize(Policy = "EmpleadoOrAdmin")]
    public async Task<IActionResult> ChangeStatus(int id, [FromBody] ChangeStatusDto dto)
    {
        var ticket = await _context.Tickets
            .Include(t => t.Cliente)
            .FirstOrDefaultAsync(t => t.Id == id);

        if (ticket == null)
        {
            return NotFound(new { message = "Ticket no encontrado" });
        }

        // Validación de permisos: Empleados solo pueden cambiar estado de tickets asignados a ellos
        var userId = GetUserId();
        var userRole = GetUserRole();

        if (userRole == "Empleado" && ticket.EmpleadoAsignadoId != userId)
        {
            _logger.LogWarning("Empleado {UserId} intentó cambiar estado del ticket {TicketId} que no está asignado a él", userId, id);
            return StatusCode(403, new { message = "Solo puedes cambiar el estado de tickets asignados a ti" });
        }

        var validStatuses = new[] { "Abierto", "EnProceso", "EnEspera", "Resuelto", "Cerrado" };
        if (!validStatuses.Contains(dto.Estado))
        {
            return BadRequest(new { message = "Estado invalido" });
        }

        // Validar transición de estado usando la máquina de estados
        if (!TicketStateService.IsValidTransition(ticket.Estado, dto.Estado, userRole))
        {
            return BadRequest(new {
                message = TicketStateService.GetTransitionErrorMessage(ticket.Estado, dto.Estado, userRole),
                transicionesPermitidas = TicketStateService.GetTransicionesPermitidas(ticket.Estado, userRole)
            });
        }

        var previousState = ticket.Estado;
        ticket.Estado = dto.Estado;
        ticket.FechaActualizacion = DateTime.UtcNow;

        // Set resolution date if resolved
        if (dto.Estado == "Resuelto" && ticket.FechaResolucion == null)
        {
            ticket.FechaResolucion = DateTime.UtcNow;

            // Notify client
            if (ticket.Cliente != null)
            {
                _ = _emailService.SendTicketResolvedEmailAsync(
                    ticket.Cliente.Email,
                    ticket.Titulo,
                    ticket.Id);
            }
        }

        await _context.SaveChangesAsync();

        // Registrar en el historial
        await RegistrarHistorial(
            ticketId: id,
            usuarioId: userId,
            tipoAccion: "CambioEstado",
            campo: "Estado",
            valorAnterior: previousState,
            valorNuevo: dto.Estado,
            descripcion: $"Estado cambiado de {previousState} a {dto.Estado}"
        );

        _logger.LogInformation("Ticket {TicketId} status changed from {OldStatus} to {NewStatus}",
            id, previousState, dto.Estado);

        return Ok(new { message = "Estado actualizado exitosamente" });
    }

    [HttpGet("{id}/transiciones")]
    [Authorize(Policy = "EmpleadoOrAdmin")]
    public async Task<ActionResult<object>> GetTransicionesPermitidas(int id)
    {
        var ticket = await _context.Tickets.FindAsync(id);
        if (ticket == null)
        {
            return NotFound(new { message = "Ticket no encontrado" });
        }

        var userId = GetUserId();
        var userRole = GetUserRole();

        // Validar que el empleado solo pueda ver transiciones de tickets asignados a él
        if (userRole == "Empleado" && ticket.EmpleadoAsignadoId != userId)
        {
            return StatusCode(403, new { message = "Solo puedes ver las transiciones de tickets asignados a ti" });
        }

        var transicionesPermitidas = TicketStateService.GetTransicionesPermitidas(ticket.Estado, userRole);

        return Ok(new
        {
            ticketId = ticket.Id,
            estadoActual = ticket.Estado,
            transicionesPermitidas = transicionesPermitidas,
            userRole = userRole
        });
    }

    [HttpDelete("{id}")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> DeleteTicket(int id)
    {
        // Usar IgnoreQueryFilters para poder encontrar tickets incluso si ya estan "eliminados"
        var ticket = await _context.Tickets
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(t => t.Id == id);

        if (ticket == null)
        {
            return NotFound(new { message = "Ticket no encontrado" });
        }

        if (ticket.IsDeleted)
        {
            return BadRequest(new { message = "Este ticket ya fue eliminado" });
        }

        var userId = GetUserId();

        ticket.IsDeleted = true;
        ticket.DeletedAt = DateTime.UtcNow;
        ticket.DeletedById = userId;

        await _context.SaveChangesAsync();

        // Registrar eliminación en el historial
        await RegistrarHistorial(
            ticketId: id,
            usuarioId: userId,
            tipoAccion: "Eliminacion",
            descripcion: $"Ticket eliminado (soft delete)"
        );

        _logger.LogInformation("Ticket {TicketId} eliminado (soft delete) por usuario {UserId}", id, userId);

        return Ok(new { message = "Ticket eliminado correctamente" });
    }

    [HttpGet("estadisticas")]
    [Authorize(Policy = "EmpleadoOrAdmin")]
    public async Task<ActionResult<object>> GetEstadisticas()
    {
        var totalTickets = await _context.Tickets.CountAsync();
        var ticketsEnProceso = await _context.Tickets.CountAsync(t => t.Estado == "EnProceso");
        var ticketsAbiertos = await _context.Tickets.CountAsync(t => t.Estado == "Abierto");
        var ticketsResueltos = await _context.Tickets.CountAsync(t => t.Estado == "Resuelto");
        var ticketsCerrados = await _context.Tickets.CountAsync(t => t.Estado == "Cerrado");
        var ticketsEnEspera = await _context.Tickets.CountAsync(t => t.Estado == "EnEspera");
        var ticketsSinAsignar = await _context.Tickets.CountAsync(t => t.EmpleadoAsignadoId == null && t.Estado == "Abierto");

        var totalEmpleados = await _context.Usuarios.CountAsync(u => u.Rol == "Empleado" && u.Activo);
        var totalEmpresas = await _context.Empresas.CountAsync(e => e.Activa);
        var totalClientes = await _context.Usuarios.CountAsync(u => u.Rol == "Cliente" && u.Activo);

        // Tickets by priority
        var ticketsAlta = await _context.Tickets.CountAsync(t => t.Prioridad == "Alta" && t.Estado != "Cerrado" && t.Estado != "Resuelto");
        var ticketsMedia = await _context.Tickets.CountAsync(t => t.Prioridad == "Media" && t.Estado != "Cerrado" && t.Estado != "Resuelto");
        var ticketsBaja = await _context.Tickets.CountAsync(t => t.Prioridad == "Baja" && t.Estado != "Cerrado" && t.Estado != "Resuelto");

        return Ok(new
        {
            totalTickets,
            ticketsEnProceso,
            ticketsAbiertos,
            ticketsResueltos,
            ticketsCerrados,
            ticketsEnEspera,
            ticketsSinAsignar,
            totalEmpleados,
            totalEmpresas,
            totalClientes,
            ticketsAlta,
            ticketsMedia,
            ticketsBaja
        });
    }

    // ==================== COMENTARIOS ====================

    [HttpGet("{id}/comentarios")]
    public async Task<ActionResult<List<ComentarioDto>>> GetComentarios(int id)
    {
        var ticket = await _context.Tickets.FindAsync(id);
        if (ticket == null)
        {
            return NotFound(new { message = "Ticket no encontrado" });
        }

        // Check access permissions
        var userId = GetUserId();
        var userRole = GetUserRole();

        if (userRole == "Cliente" && ticket.ClienteId != userId)
        {
            var user = await _context.Usuarios
                .Include(u => u.Empresa)
                .FirstOrDefaultAsync(u => u.Id == userId);

            if (user?.Empresa?.ConfigVisibilidadTickets != "empresa" ||
                ticket.ClienteId != userId)
            {
                // Check if same empresa
                var ticketClient = await _context.Usuarios.FindAsync(ticket.ClienteId);
                if (ticketClient?.EmpresaId != user?.EmpresaId)
                {
                    return Forbid();
                }
            }
        }

        var comentarios = await _context.Comentarios
            .Include(c => c.Usuario)
            .Where(c => c.TicketId == id)
            .OrderBy(c => c.FechaCreacion)
            .Select(c => new ComentarioDto
            {
                Id = c.Id,
                TicketId = c.TicketId,
                UsuarioId = c.UsuarioId,
                UsuarioNombre = c.Usuario!.Nombre,
                UsuarioRol = c.Usuario.Rol,
                Texto = c.Texto,
                FechaCreacion = c.FechaCreacion
            })
            .ToListAsync();

        return Ok(comentarios);
    }

    [HttpPost("{id}/comentarios")]
    public async Task<ActionResult<ComentarioDto>> AddComentario(int id, [FromBody] CreateComentarioDto dto)
    {
        var ticket = await _context.Tickets
            .Include(t => t.Cliente)
            .FirstOrDefaultAsync(t => t.Id == id);

        if (ticket == null)
        {
            return NotFound(new { message = "Ticket no encontrado" });
        }

        var userId = GetUserId();
        var userRole = GetUserRole();

        // Check access permissions
        if (userRole == "Cliente" && ticket.ClienteId != userId)
        {
            var user = await _context.Usuarios
                .Include(u => u.Empresa)
                .FirstOrDefaultAsync(u => u.Id == userId);

            if (user?.Empresa?.ConfigVisibilidadTickets != "empresa")
            {
                return Forbid();
            }

            var ticketClient = await _context.Usuarios.FindAsync(ticket.ClienteId);
            if (ticketClient?.EmpresaId != user?.EmpresaId)
            {
                return Forbid();
            }
        }

        var comentario = new Comentario
        {
            TicketId = id,
            UsuarioId = userId,
            Texto = dto.Texto,
            FechaCreacion = DateTime.UtcNow
        };

        _context.Comentarios.Add(comentario);

        // Update first response time if this is the first employee/admin response
        if ((userRole == "Empleado" || userRole == "Admin") && ticket.FechaPrimeraRespuesta == null)
        {
            ticket.FechaPrimeraRespuesta = DateTime.UtcNow;
        }

        ticket.FechaActualizacion = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        // Load user for response
        await _context.Entry(comentario).Reference(c => c.Usuario).LoadAsync();

        _logger.LogInformation("Comment added to ticket {TicketId} by user {UserId}", id, userId);

        // Notify ticket owner if comment is from employee
        if (userRole != "Cliente" && ticket.Cliente != null)
        {
            _ = _emailService.SendTicketCommentEmailAsync(
                ticket.Cliente.Email,
                ticket.Titulo,
                ticket.Id,
                comentario.Usuario!.Nombre);
        }

        return CreatedAtAction(nameof(GetComentarios), new { id }, new ComentarioDto
        {
            Id = comentario.Id,
            TicketId = comentario.TicketId,
            UsuarioId = comentario.UsuarioId,
            UsuarioNombre = comentario.Usuario!.Nombre,
            UsuarioRol = comentario.Usuario.Rol,
            Texto = comentario.Texto,
            FechaCreacion = comentario.FechaCreacion
        });
    }

    // ==================== HISTORIAL ====================

    [HttpGet("{id}/historial")]
    [Authorize(Policy = "EmpleadoOrAdmin")]
    public async Task<ActionResult<List<TicketHistorialDto>>> GetHistorial(int id)
    {
        var ticket = await _context.Tickets.FindAsync(id);
        if (ticket == null)
        {
            return NotFound(new { message = "Ticket no encontrado" });
        }

        var historial = await _context.TicketHistoriales
            .Include(h => h.Usuario)
            .Where(h => h.TicketId == id)
            .OrderByDescending(h => h.FechaCambio)
            .Select(h => new TicketHistorialDto
            {
                Id = h.Id,
                TicketId = h.TicketId,
                UsuarioId = h.UsuarioId,
                UsuarioNombre = h.Usuario!.Nombre,
                TipoAccion = h.TipoAccion,
                CampoModificado = h.CampoModificado,
                ValorAnterior = h.ValorAnterior,
                ValorNuevo = h.ValorNuevo,
                Descripcion = h.Descripcion,
                FechaCambio = h.FechaCambio
            })
            .ToListAsync();

        return Ok(historial);
    }

    // ==================== HELPERS ====================

    private async Task RegistrarHistorial(int ticketId, int usuarioId, string tipoAccion,
        string? campo = null, string? valorAnterior = null, string? valorNuevo = null, string? descripcion = null)
    {
        var historial = new TicketHistorial
        {
            TicketId = ticketId,
            UsuarioId = usuarioId,
            TipoAccion = tipoAccion,
            CampoModificado = campo,
            ValorAnterior = valorAnterior,
            ValorNuevo = valorNuevo,
            Descripcion = descripcion,
            FechaCambio = DateTime.UtcNow
        };
        _context.TicketHistoriales.Add(historial);
        await _context.SaveChangesAsync();
    }

    private async Task NotifyEmployeesAboutNewTicket(Ticket ticket)
    {
        try
        {
            var employees = await _context.Usuarios
                .Where(u => (u.Rol == "Empleado" || u.Rol == "Admin") && u.Activo)
                .Select(u => u.Email)
                .ToListAsync();

            foreach (var email in employees)
            {
                await _emailService.SendTicketCreatedEmailAsync(email, ticket.Titulo, ticket.Id);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to notify employees about new ticket {TicketId}", ticket.Id);
        }
    }
}
