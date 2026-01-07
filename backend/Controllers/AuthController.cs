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
public class AuthController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly IAuthService _authService;
    private readonly ILogger<AuthController> _logger;

    public AuthController(
        ApplicationDbContext context,
        IAuthService authService,
        ILogger<AuthController> logger)
    {
        _context = context;
        _authService = authService;
        _logger = logger;
    }

    [HttpPost("login")]
    public async Task<ActionResult<LoginResponseDto>> Login([FromBody] LoginRequestDto request)
    {
        var user = await _context.Usuarios
            .Include(u => u.Empresa)
            .FirstOrDefaultAsync(u => u.Email == request.Email);

        if (user == null || !_authService.VerifyPassword(request.Password, user.PasswordHash))
        {
            return Unauthorized(new { message = "Credenciales invalidas" });
        }

        if (!user.Activo)
        {
            return Unauthorized(new { message = "Usuario desactivado. Contacte al administrador." });
        }

        // Update last access
        user.UltimoAcceso = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        var token = _authService.GenerateJwtToken(user);

        return Ok(new LoginResponseDto
        {
            Token = token,
            User = new UserDto
            {
                Id = user.Id,
                Email = user.Email,
                Nombre = user.Nombre,
                Rol = user.Rol,
                EmpresaId = user.EmpresaId,
                EmpresaNombre = user.Empresa?.Nombre,
                Activo = user.Activo,
                RequiereCambioPassword = user.RequiereCambioPassword
            }
        });
    }

    [Authorize]
    [HttpPost("logout")]
    public IActionResult Logout()
    {
        // In a stateless JWT setup, logout is handled client-side
        // This endpoint can be used to invalidate refresh tokens if implemented
        return Ok(new { message = "Sesion cerrada exitosamente" });
    }

    [Authorize]
    [HttpGet("me")]
    public async Task<ActionResult<UserDto>> GetCurrentUser()
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        var user = await _context.Usuarios
            .Include(u => u.Empresa)
            .FirstOrDefaultAsync(u => u.Id == userId);

        if (user == null)
        {
            return NotFound(new { message = "Usuario no encontrado" });
        }

        return Ok(new UserDto
        {
            Id = user.Id,
            Email = user.Email,
            Nombre = user.Nombre,
            Rol = user.Rol,
            EmpresaId = user.EmpresaId,
            EmpresaNombre = user.Empresa?.Nombre,
            Activo = user.Activo,
            RequiereCambioPassword = user.RequiereCambioPassword
        });
    }

    [Authorize]
    [HttpPost("cambiar-password")]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequestDto request)
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        var user = await _context.Usuarios.FindAsync(userId);
        if (user == null)
        {
            return NotFound(new { message = "Usuario no encontrado" });
        }

        if (!_authService.VerifyPassword(request.CurrentPassword, user.PasswordHash))
        {
            return BadRequest(new { message = "La contrasena actual es incorrecta" });
        }

        if (request.NewPassword != request.ConfirmPassword)
        {
            return BadRequest(new { message = "Las contrasenas nuevas no coinciden" });
        }

        // Validate password strength
        if (request.NewPassword.Length < 8 ||
            !request.NewPassword.Any(char.IsUpper) ||
            !request.NewPassword.Any(char.IsLower) ||
            !request.NewPassword.Any(char.IsDigit))
        {
            return BadRequest(new { message = "La contrasena debe tener al menos 8 caracteres, una mayuscula, una minuscula y un numero" });
        }

        user.PasswordHash = _authService.HashPassword(request.NewPassword);
        user.RequiereCambioPassword = false;
        user.FechaActualizacion = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        _logger.LogInformation("User {UserId} changed their password", userId);

        return Ok(new { message = "Contrasena cambiada exitosamente" });
    }

    [HttpPost("solicitar-registro")]
    public async Task<IActionResult> RequestRegistration([FromBody] RegistrationRequestDto request)
    {
        // Check if email already exists
        if (await _context.Usuarios.AnyAsync(u => u.Email == request.Email))
        {
            return BadRequest(new { message = "El correo electronico ya esta registrado" });
        }

        // Check if there's a pending request
        if (await _context.SolicitudesRegistro.AnyAsync(s =>
            s.Email == request.Email && s.Estado == "Pendiente"))
        {
            return BadRequest(new { message = "Ya existe una solicitud pendiente con este correo" });
        }

        // Validate empresa exists
        var empresa = await _context.Empresas.FindAsync(request.EmpresaId);
        if (empresa == null || !empresa.Activa)
        {
            return BadRequest(new { message = "La empresa seleccionada no existe o no esta activa" });
        }

        var solicitud = new SolicitudRegistro
        {
            Email = request.Email,
            Nombre = request.Nombre,
            EmpresaId = request.EmpresaId,
            Estado = "Pendiente",
            FechaSolicitud = DateTime.UtcNow
        };

        _context.SolicitudesRegistro.Add(solicitud);
        await _context.SaveChangesAsync();

        _logger.LogInformation("New registration request from {Email}", request.Email);

        return Ok(new { message = "Solicitud de registro enviada. Un administrador revisara tu solicitud pronto." });
    }
}
