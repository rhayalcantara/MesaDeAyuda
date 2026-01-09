using System.ComponentModel.DataAnnotations;

namespace MDAyuda.API.DTOs;

public class UsuarioListDto
{
    public int Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string Nombre { get; set; } = string.Empty;
    public string Rol { get; set; } = string.Empty;
    public int? EmpresaId { get; set; }
    public string? EmpresaNombre { get; set; }
    public bool Activo { get; set; }
    public DateTime? UltimoAcceso { get; set; }
    public DateTime FechaCreacion { get; set; }
}

public class CreateUsuarioDto
{
    [Required(ErrorMessage = "El correo electronico es requerido")]
    [EmailAddress(ErrorMessage = "El correo electronico no es valido")]
    [MaxLength(255)]
    public string Email { get; set; } = string.Empty;

    [Required(ErrorMessage = "El nombre es requerido")]
    [MaxLength(100)]
    public string Nombre { get; set; } = string.Empty;

    [Required(ErrorMessage = "El rol es requerido")]
    public string Rol { get; set; } = "Cliente";

    public int? EmpresaId { get; set; }
}

public class UpdateUsuarioDto
{
    [Required(ErrorMessage = "El correo electronico es requerido")]
    [EmailAddress(ErrorMessage = "El correo electronico no es valido")]
    [MaxLength(255)]
    public string Email { get; set; } = string.Empty;

    [Required(ErrorMessage = "El nombre es requerido")]
    [MaxLength(100)]
    public string Nombre { get; set; } = string.Empty;

    [Required(ErrorMessage = "El rol es requerido")]
    public string Rol { get; set; } = "Cliente";

    public int? EmpresaId { get; set; }

    public bool Activo { get; set; } = true;
}

public class CreateUsuarioResponseDto
{
    public UsuarioListDto Usuario { get; set; } = null!;
    public string TemporaryPassword { get; set; } = string.Empty;
}

public class ResetPasswordResponseDto
{
    public string Message { get; set; } = string.Empty;
    public string TemporaryPassword { get; set; } = string.Empty;
}
