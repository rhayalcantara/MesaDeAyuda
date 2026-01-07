using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MDAyuda.API.Data;
using MDAyuda.API.DTOs;
using MDAyuda.API.Models;

namespace MDAyuda.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CategoriasController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<CategoriasController> _logger;

    public CategoriasController(ApplicationDbContext context, ILogger<CategoriasController> logger)
    {
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// Get all categories (public endpoint for ticket creation form)
    /// </summary>
    [HttpGet]
    [AllowAnonymous]
    public async Task<ActionResult<List<CategoriaDto>>> GetCategorias([FromQuery] bool? activas = null)
    {
        var query = _context.Categorias.AsQueryable();

        // By default, only return active categories for anonymous/client users
        if (activas.HasValue)
        {
            query = query.Where(c => c.Activa == activas.Value);
        }
        else if (!User.Identity?.IsAuthenticated == true || User.IsInRole("Cliente"))
        {
            query = query.Where(c => c.Activa);
        }

        var categorias = await query
            .OrderBy(c => c.Nombre)
            .Select(c => new CategoriaDto
            {
                Id = c.Id,
                Nombre = c.Nombre,
                Descripcion = c.Descripcion,
                Activa = c.Activa,
                FechaCreacion = c.FechaCreacion,
                TicketsCount = c.Tickets.Count
            })
            .ToListAsync();

        return Ok(categorias);
    }

    /// <summary>
    /// Get a specific category by ID
    /// </summary>
    [HttpGet("{id}")]
    [Authorize]
    public async Task<ActionResult<CategoriaDto>> GetCategoria(int id)
    {
        var categoria = await _context.Categorias
            .Include(c => c.Tickets)
            .FirstOrDefaultAsync(c => c.Id == id);

        if (categoria == null)
        {
            return NotFound(new { message = "Categoria no encontrada" });
        }

        return Ok(new CategoriaDto
        {
            Id = categoria.Id,
            Nombre = categoria.Nombre,
            Descripcion = categoria.Descripcion,
            Activa = categoria.Activa,
            FechaCreacion = categoria.FechaCreacion,
            TicketsCount = categoria.Tickets.Count
        });
    }

    /// <summary>
    /// Create a new category (Admin only)
    /// </summary>
    [HttpPost]
    [Authorize(Policy = "AdminOnly")]
    public async Task<ActionResult<CategoriaDto>> CreateCategoria([FromBody] CreateCategoriaDto dto)
    {
        // Check if category with same name exists
        var existingCategoria = await _context.Categorias
            .FirstOrDefaultAsync(c => c.Nombre.ToLower() == dto.Nombre.ToLower());

        if (existingCategoria != null)
        {
            return BadRequest(new { message = "Ya existe una categoria con ese nombre" });
        }

        var categoria = new Categoria
        {
            Nombre = dto.Nombre,
            Descripcion = dto.Descripcion,
            Activa = true,
            FechaCreacion = DateTime.UtcNow
        };

        _context.Categorias.Add(categoria);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Category {CategoriaId} '{Nombre}' created", categoria.Id, categoria.Nombre);

        return CreatedAtAction(nameof(GetCategoria), new { id = categoria.Id }, new CategoriaDto
        {
            Id = categoria.Id,
            Nombre = categoria.Nombre,
            Descripcion = categoria.Descripcion,
            Activa = categoria.Activa,
            FechaCreacion = categoria.FechaCreacion,
            TicketsCount = 0
        });
    }

    /// <summary>
    /// Update a category (Admin only)
    /// </summary>
    [HttpPut("{id}")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> UpdateCategoria(int id, [FromBody] UpdateCategoriaDto dto)
    {
        var categoria = await _context.Categorias.FindAsync(id);
        if (categoria == null)
        {
            return NotFound(new { message = "Categoria no encontrada" });
        }

        // Check for duplicate name if changing
        if (!string.IsNullOrEmpty(dto.Nombre) && dto.Nombre.ToLower() != categoria.Nombre.ToLower())
        {
            var existingCategoria = await _context.Categorias
                .FirstOrDefaultAsync(c => c.Nombre.ToLower() == dto.Nombre.ToLower() && c.Id != id);

            if (existingCategoria != null)
            {
                return BadRequest(new { message = "Ya existe una categoria con ese nombre" });
            }

            categoria.Nombre = dto.Nombre;
        }

        if (dto.Descripcion != null)
            categoria.Descripcion = dto.Descripcion;

        if (dto.Activa.HasValue)
            categoria.Activa = dto.Activa.Value;

        await _context.SaveChangesAsync();

        _logger.LogInformation("Category {CategoriaId} updated", id);

        return Ok(new { message = "Categoria actualizada exitosamente" });
    }

    /// <summary>
    /// Delete a category (Admin only)
    /// </summary>
    [HttpDelete("{id}")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> DeleteCategoria(int id)
    {
        var categoria = await _context.Categorias
            .Include(c => c.Tickets)
            .FirstOrDefaultAsync(c => c.Id == id);

        if (categoria == null)
        {
            return NotFound(new { message = "Categoria no encontrada" });
        }

        // Check if category has tickets
        if (categoria.Tickets.Any())
        {
            return BadRequest(new { message = "No se puede eliminar una categoria que tiene tickets asociados. Desactivela en su lugar." });
        }

        _context.Categorias.Remove(categoria);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Category {CategoriaId} deleted", id);

        return Ok(new { message = "Categoria eliminada exitosamente" });
    }

    /// <summary>
    /// Toggle category active status (Admin only)
    /// </summary>
    [HttpPut("{id}/toggle-activa")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> ToggleActiva(int id)
    {
        var categoria = await _context.Categorias.FindAsync(id);
        if (categoria == null)
        {
            return NotFound(new { message = "Categoria no encontrada" });
        }

        categoria.Activa = !categoria.Activa;
        await _context.SaveChangesAsync();

        _logger.LogInformation("Category {CategoriaId} active status toggled to {Activa}", id, categoria.Activa);

        return Ok(new { message = $"Categoria {(categoria.Activa ? "activada" : "desactivada")} exitosamente", activa = categoria.Activa });
    }
}
