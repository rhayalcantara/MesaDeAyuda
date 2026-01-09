using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MDAyuda.API.Data;
using MDAyuda.API.DTOs;
using MDAyuda.API.Models;
using MDAyuda.API.Services;

namespace MDAyuda.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class UsuariosController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly IAuthService _authService;
    private readonly ILogger<UsuariosController> _logger;

    public UsuariosController(
        ApplicationDbContext context,
        IAuthService authService,
        ILogger<UsuariosController> logger)
    {
        _context = context;
        _authService = authService;
        _logger = logger;
    }

    // GET: api/usuarios
    [HttpGet]
    public async Task<ActionResult<IEnumerable<UsuarioListDto>>> GetUsuarios([FromQuery] string? rol = null)
    {
        var query = _context.Usuarios
            .Include(u => u.Empresa)
            .AsQueryable();

        if (!string.IsNullOrEmpty(rol))
        {
            query = query.Where(u => u.Rol == rol);
        }

        var usuarios = await query
            .OrderByDescending(u => u.FechaCreacion)
            .Select(u => new UsuarioListDto
            {
                Id = u.Id,
                Email = u.Email,
                Nombre = u.Nombre,
                Rol = u.Rol,
                EmpresaId = u.EmpresaId,
                EmpresaNombre = u.Empresa != null ? u.Empresa.Nombre : null,
                Activo = u.Activo,
                UltimoAcceso = u.UltimoAcceso,
                FechaCreacion = u.FechaCreacion
            })
            .ToListAsync();

        return Ok(usuarios);
    }

    // GET: api/usuarios/5
    [HttpGet("{id}")]
    public async Task<ActionResult<UsuarioListDto>> GetUsuario(int id)
    {
        var usuario = await _context.Usuarios
            .Include(u => u.Empresa)
            .FirstOrDefaultAsync(u => u.Id == id);

        if (usuario == null)
        {
            return NotFound(new { message = "Usuario no encontrado" });
        }

        return Ok(new UsuarioListDto
        {
            Id = usuario.Id,
            Email = usuario.Email,
            Nombre = usuario.Nombre,
            Rol = usuario.Rol,
            EmpresaId = usuario.EmpresaId,
            EmpresaNombre = usuario.Empresa?.Nombre,
            Activo = usuario.Activo,
            UltimoAcceso = usuario.UltimoAcceso,
            FechaCreacion = usuario.FechaCreacion
        });
    }

    // POST: api/usuarios
    [HttpPost]
    public async Task<ActionResult<UsuarioListDto>> CreateUsuario([FromBody] CreateUsuarioDto dto)
    {
        // Check if email already exists
        if (await _context.Usuarios.AnyAsync(u => u.Email == dto.Email))
        {
            return BadRequest(new { message = "El correo electronico ya esta registrado" });
        }

        // Validate empresa if provided
        if (dto.EmpresaId.HasValue)
        {
            var empresa = await _context.Empresas.FindAsync(dto.EmpresaId.Value);
            if (empresa == null)
            {
                return BadRequest(new { message = "La empresa seleccionada no existe" });
            }
        }

        // Validate rol
        var rolesValidos = new[] { "Admin", "Empleado", "Cliente" };
        if (!rolesValidos.Contains(dto.Rol))
        {
            return BadRequest(new { message = "El rol especificado no es valido" });
        }

        // Generate temporary password
        var tempPassword = GenerateTemporaryPassword();

        var usuario = new Usuario
        {
            Email = dto.Email,
            Nombre = dto.Nombre,
            Rol = dto.Rol,
            EmpresaId = dto.EmpresaId,
            PasswordHash = _authService.HashPassword(tempPassword),
            Activo = true,
            RequiereCambioPassword = true,
            FechaCreacion = DateTime.UtcNow,
            FechaActualizacion = DateTime.UtcNow
        };

        _context.Usuarios.Add(usuario);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Usuario {Email} creado por administrador", dto.Email);

        // Load empresa for response
        await _context.Entry(usuario).Reference(u => u.Empresa).LoadAsync();

        return CreatedAtAction(nameof(GetUsuario), new { id = usuario.Id }, new CreateUsuarioResponseDto
        {
            Usuario = new UsuarioListDto
            {
                Id = usuario.Id,
                Email = usuario.Email,
                Nombre = usuario.Nombre,
                Rol = usuario.Rol,
                EmpresaId = usuario.EmpresaId,
                EmpresaNombre = usuario.Empresa?.Nombre,
                Activo = usuario.Activo,
                UltimoAcceso = usuario.UltimoAcceso,
                FechaCreacion = usuario.FechaCreacion
            },
            TemporaryPassword = tempPassword
        });
    }

    // PUT: api/usuarios/5
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateUsuario(int id, [FromBody] UpdateUsuarioDto dto)
    {
        var usuario = await _context.Usuarios.FindAsync(id);
        if (usuario == null)
        {
            return NotFound(new { message = "Usuario no encontrado" });
        }

        // Check if email is being changed and if it already exists
        if (dto.Email != usuario.Email && await _context.Usuarios.AnyAsync(u => u.Email == dto.Email))
        {
            return BadRequest(new { message = "El correo electronico ya esta registrado" });
        }

        // Validate empresa if provided
        if (dto.EmpresaId.HasValue)
        {
            var empresa = await _context.Empresas.FindAsync(dto.EmpresaId.Value);
            if (empresa == null)
            {
                return BadRequest(new { message = "La empresa seleccionada no existe" });
            }
        }

        // Validate rol
        var rolesValidos = new[] { "Admin", "Empleado", "Cliente" };
        if (!rolesValidos.Contains(dto.Rol))
        {
            return BadRequest(new { message = "El rol especificado no es valido" });
        }

        usuario.Email = dto.Email;
        usuario.Nombre = dto.Nombre;
        usuario.Rol = dto.Rol;
        usuario.EmpresaId = dto.EmpresaId;
        usuario.Activo = dto.Activo;
        usuario.FechaActualizacion = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        _logger.LogInformation("Usuario {Id} actualizado", id);

        return Ok(new { message = "Usuario actualizado exitosamente" });
    }

    // DELETE: api/usuarios/5
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteUsuario(int id)
    {
        var usuario = await _context.Usuarios.FindAsync(id);
        if (usuario == null)
        {
            return NotFound(new { message = "Usuario no encontrado" });
        }

        // Check if user has tickets
        var hasTickets = await _context.Tickets
            .AnyAsync(t => t.ClienteId == id || t.EmpleadoAsignadoId == id);

        if (hasTickets)
        {
            // Soft delete - just deactivate
            usuario.Activo = false;
            usuario.FechaActualizacion = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            _logger.LogInformation("Usuario {Id} desactivado (tiene tickets asociados)", id);
            return Ok(new { message = "Usuario desactivado (tiene tickets asociados)" });
        }

        _context.Usuarios.Remove(usuario);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Usuario {Id} eliminado", id);

        return Ok(new { message = "Usuario eliminado exitosamente" });
    }

    // POST: api/usuarios/5/reset-password
    [HttpPost("{id}/reset-password")]
    public async Task<ActionResult<ResetPasswordResponseDto>> ResetPassword(int id)
    {
        var usuario = await _context.Usuarios.FindAsync(id);
        if (usuario == null)
        {
            return NotFound(new { message = "Usuario no encontrado" });
        }

        var tempPassword = GenerateTemporaryPassword();
        usuario.PasswordHash = _authService.HashPassword(tempPassword);
        usuario.RequiereCambioPassword = true;
        usuario.FechaActualizacion = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        _logger.LogInformation("Password reseteado para usuario {Id}", id);

        return Ok(new ResetPasswordResponseDto
        {
            Message = "Contrasena reseteada exitosamente",
            TemporaryPassword = tempPassword
        });
    }

    // PUT: api/usuarios/5/toggle-active
    [HttpPut("{id}/toggle-active")]
    public async Task<IActionResult> ToggleActive(int id)
    {
        var usuario = await _context.Usuarios.FindAsync(id);
        if (usuario == null)
        {
            return NotFound(new { message = "Usuario no encontrado" });
        }

        usuario.Activo = !usuario.Activo;
        usuario.FechaActualizacion = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        var estado = usuario.Activo ? "activado" : "desactivado";
        _logger.LogInformation("Usuario {Id} {Estado}", id, estado);

        return Ok(new { message = $"Usuario {estado} exitosamente", activo = usuario.Activo });
    }

    private static string GenerateTemporaryPassword()
    {
        const string chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
        var random = new Random();
        var password = new char[12];

        // Ensure at least one uppercase, one lowercase, and one digit
        password[0] = "ABCDEFGHJKLMNPQRSTUVWXYZ"[random.Next(24)];
        password[1] = "abcdefghjkmnpqrstuvwxyz"[random.Next(23)];
        password[2] = "23456789"[random.Next(8)];

        for (int i = 3; i < password.Length; i++)
        {
            password[i] = chars[random.Next(chars.Length)];
        }

        // Shuffle the password
        return new string(password.OrderBy(_ => random.Next()).ToArray());
    }
}
