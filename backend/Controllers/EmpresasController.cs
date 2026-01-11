using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MDAyuda.API.Data;
using MDAyuda.API.DTOs;
using MDAyuda.API.Models;

namespace MDAyuda.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class EmpresasController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<EmpresasController> _logger;

    public EmpresasController(ApplicationDbContext context, ILogger<EmpresasController> logger)
    {
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// Get all empresas (Admin and Empleado only)
    /// </summary>
    [HttpGet]
    [Authorize(Policy = "EmpleadoOrAdmin")]
    public async Task<ActionResult<List<EmpresaDto>>> GetEmpresas([FromQuery] bool? activas = null)
    {
        var query = _context.Empresas.AsQueryable();

        if (activas.HasValue)
        {
            query = query.Where(e => e.Activa == activas.Value);
        }

        var empresas = await query
            .OrderBy(e => e.Nombre)
            .Select(e => new EmpresaDto
            {
                Id = e.Id,
                Nombre = e.Nombre,
                ConfigVisibilidadTickets = e.ConfigVisibilidadTickets,
                LogoUrl = e.LogoUrl,
                ColorPrimario = e.ColorPrimario,
                Activa = e.Activa,
                FechaCreacion = e.FechaCreacion,
                FechaActualizacion = e.FechaActualizacion,
                ClientesCount = e.Usuarios.Count(u => u.Rol == "Cliente")
            })
            .ToListAsync();

        return Ok(empresas);
    }

    /// <summary>
    /// Get active empresas (public endpoint for registration)
    /// </summary>
    [HttpGet("activas")]
    [AllowAnonymous]
    public async Task<ActionResult<List<object>>> GetEmpresasActivas()
    {
        var empresas = await _context.Empresas
            .Where(e => e.Activa)
            .OrderBy(e => e.Nombre)
            .Select(e => new { e.Id, e.Nombre })
            .ToListAsync();

        return Ok(empresas);
    }

    /// <summary>
    /// Get a specific empresa by ID
    /// </summary>
    [HttpGet("{id}")]
    [Authorize(Policy = "EmpleadoOrAdmin")]
    public async Task<ActionResult<EmpresaDto>> GetEmpresa(int id)
    {
        var empresa = await _context.Empresas
            .Include(e => e.Usuarios)
            .FirstOrDefaultAsync(e => e.Id == id);

        if (empresa == null)
        {
            return NotFound(new { message = "Empresa no encontrada" });
        }

        return Ok(new EmpresaDto
        {
            Id = empresa.Id,
            Nombre = empresa.Nombre,
            ConfigVisibilidadTickets = empresa.ConfigVisibilidadTickets,
            LogoUrl = empresa.LogoUrl,
            ColorPrimario = empresa.ColorPrimario,
            Activa = empresa.Activa,
            FechaCreacion = empresa.FechaCreacion,
            FechaActualizacion = empresa.FechaActualizacion,
            ClientesCount = empresa.Usuarios.Count(u => u.Rol == "Cliente")
        });
    }

    /// <summary>
    /// Get clientes of a specific empresa
    /// </summary>
    [HttpGet("{id}/clientes")]
    [Authorize(Policy = "EmpleadoOrAdmin")]
    public async Task<ActionResult> GetEmpresaClientes(int id)
    {
        var empresa = await _context.Empresas
            .Include(e => e.Usuarios)
            .FirstOrDefaultAsync(e => e.Id == id);

        if (empresa == null)
        {
            return NotFound(new { message = "Empresa no encontrada" });
        }

        var clientes = empresa.Usuarios
            .Where(u => u.Rol == "Cliente")
            .Select(u => new
            {
                u.Id,
                u.Nombre,
                u.Email,
                u.Activo,
                u.FechaCreacion
            })
            .OrderBy(u => u.Nombre)
            .ToList();

        return Ok(clientes);
    }

    /// <summary>
    /// Create a new empresa (Admin only)
    /// </summary>
    [HttpPost]
    [Authorize(Policy = "AdminOnly")]
    public async Task<ActionResult<EmpresaDto>> CreateEmpresa([FromBody] CreateEmpresaDto dto)
    {
        // Check if empresa with same name exists
        var existingEmpresa = await _context.Empresas
            .FirstOrDefaultAsync(e => e.Nombre.ToLower() == dto.Nombre.ToLower());

        if (existingEmpresa != null)
        {
            return BadRequest(new { message = "Ya existe una empresa con ese nombre" });
        }

        var empresa = new Empresa
        {
            Nombre = dto.Nombre,
            ConfigVisibilidadTickets = dto.ConfigVisibilidadTickets ?? "propios",
            LogoUrl = dto.LogoUrl,
            ColorPrimario = dto.ColorPrimario,
            Activa = true,
            FechaCreacion = DateTime.UtcNow,
            FechaActualizacion = DateTime.UtcNow
        };

        _context.Empresas.Add(empresa);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Empresa {EmpresaId} '{Nombre}' created", empresa.Id, empresa.Nombre);

        return CreatedAtAction(nameof(GetEmpresa), new { id = empresa.Id }, new EmpresaDto
        {
            Id = empresa.Id,
            Nombre = empresa.Nombre,
            ConfigVisibilidadTickets = empresa.ConfigVisibilidadTickets,
            LogoUrl = empresa.LogoUrl,
            ColorPrimario = empresa.ColorPrimario,
            Activa = empresa.Activa,
            FechaCreacion = empresa.FechaCreacion,
            FechaActualizacion = empresa.FechaActualizacion,
            ClientesCount = 0
        });
    }

    /// <summary>
    /// Update an empresa (Admin only)
    /// </summary>
    [HttpPut("{id}")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> UpdateEmpresa(int id, [FromBody] UpdateEmpresaDto dto)
    {
        var empresa = await _context.Empresas.FindAsync(id);
        if (empresa == null)
        {
            return NotFound(new { message = "Empresa no encontrada" });
        }

        // Check for duplicate name if changing
        if (!string.IsNullOrEmpty(dto.Nombre) && dto.Nombre.ToLower() != empresa.Nombre.ToLower())
        {
            var existingEmpresa = await _context.Empresas
                .FirstOrDefaultAsync(e => e.Nombre.ToLower() == dto.Nombre.ToLower() && e.Id != id);

            if (existingEmpresa != null)
            {
                return BadRequest(new { message = "Ya existe una empresa con ese nombre" });
            }

            empresa.Nombre = dto.Nombre;
        }

        if (dto.ConfigVisibilidadTickets != null)
            empresa.ConfigVisibilidadTickets = dto.ConfigVisibilidadTickets;

        if (dto.LogoUrl != null)
            empresa.LogoUrl = dto.LogoUrl;

        if (dto.ColorPrimario != null)
            empresa.ColorPrimario = dto.ColorPrimario;

        if (dto.Activa.HasValue)
            empresa.Activa = dto.Activa.Value;

        empresa.FechaActualizacion = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        _logger.LogInformation("Empresa {EmpresaId} updated", id);

        return Ok(new { message = "Empresa actualizada exitosamente" });
    }

    /// <summary>
    /// Delete an empresa (Admin only)
    /// </summary>
    [HttpDelete("{id}")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> DeleteEmpresa(int id)
    {
        var empresa = await _context.Empresas
            .Include(e => e.Usuarios)
            .FirstOrDefaultAsync(e => e.Id == id);

        if (empresa == null)
        {
            return NotFound(new { message = "Empresa no encontrada" });
        }

        // Check if empresa has users
        if (empresa.Usuarios.Any())
        {
            return BadRequest(new { message = "No se puede eliminar una empresa que tiene usuarios asociados. Desactivela en su lugar." });
        }

        _context.Empresas.Remove(empresa);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Empresa {EmpresaId} deleted", id);

        return Ok(new { message = "Empresa eliminada exitosamente" });
    }

    /// <summary>
    /// Toggle empresa active status (Admin only)
    /// </summary>
    [HttpPut("{id}/toggle-activa")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> ToggleActiva(int id)
    {
        var empresa = await _context.Empresas.FindAsync(id);
        if (empresa == null)
        {
            return NotFound(new { message = "Empresa no encontrada" });
        }

        empresa.Activa = !empresa.Activa;
        empresa.FechaActualizacion = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        _logger.LogInformation("Empresa {EmpresaId} active status toggled to {Activa}", id, empresa.Activa);

        return Ok(new { message = $"Empresa {(empresa.Activa ? "activada" : "desactivada")} exitosamente", activa = empresa.Activa });
    }
}
