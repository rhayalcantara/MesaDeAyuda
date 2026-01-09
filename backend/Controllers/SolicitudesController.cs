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
[Authorize(Policy = "EmpleadoOrAdmin")]
public class SolicitudesController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly IAuthService _authService;
    private readonly IEmailService _emailService;
    private readonly ILogger<SolicitudesController> _logger;

    public SolicitudesController(
        ApplicationDbContext context,
        IAuthService authService,
        IEmailService emailService,
        ILogger<SolicitudesController> logger)
    {
        _context = context;
        _authService = authService;
        _emailService = emailService;
        _logger = logger;
    }

    private int GetUserId() => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    // GET: api/solicitudes
    [HttpGet]
    public async Task<ActionResult<List<SolicitudRegistroDto>>> GetSolicitudes([FromQuery] string? estado = null)
    {
        var query = _context.SolicitudesRegistro
            .Include(s => s.Empresa)
            .Include(s => s.AprobadoPor)
            .AsQueryable();

        if (!string.IsNullOrEmpty(estado))
        {
            query = query.Where(s => s.Estado == estado);
        }

        var solicitudes = await query
            .OrderByDescending(s => s.FechaSolicitud)
            .Select(s => new SolicitudRegistroDto
            {
                Id = s.Id,
                Email = s.Email,
                Nombre = s.Nombre,
                EmpresaId = s.EmpresaId,
                EmpresaNombre = s.Empresa != null ? s.Empresa.Nombre : null,
                Estado = s.Estado,
                FechaSolicitud = s.FechaSolicitud,
                FechaResolucion = s.FechaResolucion,
                AprobadoPorId = s.AprobadoPorId,
                AprobadoPorNombre = s.AprobadoPor != null ? s.AprobadoPor.Nombre : null
            })
            .ToListAsync();

        return Ok(solicitudes);
    }

    // GET: api/solicitudes/5
    [HttpGet("{id}")]
    public async Task<ActionResult<SolicitudRegistroDto>> GetSolicitud(int id)
    {
        var solicitud = await _context.SolicitudesRegistro
            .Include(s => s.Empresa)
            .Include(s => s.AprobadoPor)
            .FirstOrDefaultAsync(s => s.Id == id);

        if (solicitud == null)
        {
            return NotFound(new { message = "Solicitud no encontrada" });
        }

        return Ok(new SolicitudRegistroDto
        {
            Id = solicitud.Id,
            Email = solicitud.Email,
            Nombre = solicitud.Nombre,
            EmpresaId = solicitud.EmpresaId,
            EmpresaNombre = solicitud.Empresa?.Nombre,
            Estado = solicitud.Estado,
            FechaSolicitud = solicitud.FechaSolicitud,
            FechaResolucion = solicitud.FechaResolucion,
            AprobadoPorId = solicitud.AprobadoPorId,
            AprobadoPorNombre = solicitud.AprobadoPor?.Nombre
        });
    }

    // PUT: api/solicitudes/5/aprobar
    [HttpPut("{id}/aprobar")]
    public async Task<ActionResult<AprobacionResponseDto>> AprobarSolicitud(int id)
    {
        var solicitud = await _context.SolicitudesRegistro
            .Include(s => s.Empresa)
            .FirstOrDefaultAsync(s => s.Id == id);

        if (solicitud == null)
        {
            return NotFound(new { message = "Solicitud no encontrada" });
        }

        if (solicitud.Estado != "Pendiente")
        {
            return BadRequest(new { message = "Esta solicitud ya fue procesada" });
        }

        // Check if email already exists
        if (await _context.Usuarios.AnyAsync(u => u.Email == solicitud.Email))
        {
            return BadRequest(new { message = "Ya existe un usuario con este correo electronico" });
        }

        // Generate temporary password
        var tempPassword = GenerateTemporaryPassword();

        // Create user
        var usuario = new Usuario
        {
            Email = solicitud.Email,
            Nombre = solicitud.Nombre,
            Rol = "Cliente",
            EmpresaId = solicitud.EmpresaId,
            PasswordHash = _authService.HashPassword(tempPassword),
            Activo = true,
            RequiereCambioPassword = true,
            FechaCreacion = DateTime.UtcNow,
            FechaActualizacion = DateTime.UtcNow
        };

        _context.Usuarios.Add(usuario);

        // Update solicitud
        solicitud.Estado = "Aprobada";
        solicitud.FechaResolucion = DateTime.UtcNow;
        solicitud.AprobadoPorId = GetUserId();

        await _context.SaveChangesAsync();

        _logger.LogInformation("Registration request {SolicitudId} approved, user {Email} created", id, solicitud.Email);

        // Send welcome email with credentials
        _ = _emailService.SendRegistrationApprovedEmailAsync(solicitud.Email, solicitud.Nombre, tempPassword);

        return Ok(new AprobacionResponseDto
        {
            Message = "Solicitud aprobada exitosamente. Se ha creado el usuario.",
            UsuarioId = usuario.Id,
            Email = usuario.Email,
            TemporaryPassword = tempPassword
        });
    }

    // PUT: api/solicitudes/5/rechazar
    [HttpPut("{id}/rechazar")]
    public async Task<IActionResult> RechazarSolicitud(int id, [FromBody] RechazarSolicitudDto? dto = null)
    {
        var solicitud = await _context.SolicitudesRegistro.FindAsync(id);

        if (solicitud == null)
        {
            return NotFound(new { message = "Solicitud no encontrada" });
        }

        if (solicitud.Estado != "Pendiente")
        {
            return BadRequest(new { message = "Esta solicitud ya fue procesada" });
        }

        solicitud.Estado = "Rechazada";
        solicitud.FechaResolucion = DateTime.UtcNow;
        solicitud.AprobadoPorId = GetUserId();

        await _context.SaveChangesAsync();

        _logger.LogInformation("Registration request {SolicitudId} rejected", id);

        // Log rejection reason if provided
        if (!string.IsNullOrEmpty(dto?.Motivo))
        {
            _logger.LogInformation("Rejection reason for request {SolicitudId}: {Motivo}", id, dto.Motivo);
        }

        return Ok(new { message = "Solicitud rechazada" });
    }

    // DELETE: api/solicitudes/5
    [HttpDelete("{id}")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> DeleteSolicitud(int id)
    {
        var solicitud = await _context.SolicitudesRegistro.FindAsync(id);

        if (solicitud == null)
        {
            return NotFound(new { message = "Solicitud no encontrada" });
        }

        _context.SolicitudesRegistro.Remove(solicitud);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Registration request {SolicitudId} deleted", id);

        return Ok(new { message = "Solicitud eliminada" });
    }

    // GET: api/solicitudes/estadisticas
    [HttpGet("estadisticas")]
    public async Task<ActionResult<object>> GetEstadisticas()
    {
        var pendientes = await _context.SolicitudesRegistro.CountAsync(s => s.Estado == "Pendiente");
        var aprobadas = await _context.SolicitudesRegistro.CountAsync(s => s.Estado == "Aprobada");
        var rechazadas = await _context.SolicitudesRegistro.CountAsync(s => s.Estado == "Rechazada");

        return Ok(new
        {
            pendientes,
            aprobadas,
            rechazadas,
            total = pendientes + aprobadas + rechazadas
        });
    }

    private static string GenerateTemporaryPassword()
    {
        const string chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
        var random = new Random();
        var password = new char[12];

        password[0] = "ABCDEFGHJKLMNPQRSTUVWXYZ"[random.Next(24)];
        password[1] = "abcdefghjkmnpqrstuvwxyz"[random.Next(23)];
        password[2] = "23456789"[random.Next(8)];

        for (int i = 3; i < password.Length; i++)
        {
            password[i] = chars[random.Next(chars.Length)];
        }

        return new string(password.OrderBy(_ => random.Next()).ToArray());
    }
}
