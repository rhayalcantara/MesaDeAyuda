using System.ComponentModel.DataAnnotations;

namespace MDAyuda.API.DTOs;

public class LoginRequestDto
{
    [Required(ErrorMessage = "El correo electronico es requerido")]
    [EmailAddress(ErrorMessage = "El correo electronico no es valido")]
    public string Email { get; set; } = string.Empty;

    [Required(ErrorMessage = "La contrasena es requerida")]
    public string Password { get; set; } = string.Empty;
}

public class LoginResponseDto
{
    public string Token { get; set; } = string.Empty;
    public UserDto User { get; set; } = null!;
}

public class ChangePasswordRequestDto
{
    [Required(ErrorMessage = "La contrasena actual es requerida")]
    public string CurrentPassword { get; set; } = string.Empty;

    [Required(ErrorMessage = "La nueva contrasena es requerida")]
    [MinLength(8, ErrorMessage = "La contrasena debe tener al menos 8 caracteres")]
    public string NewPassword { get; set; } = string.Empty;

    [Required(ErrorMessage = "La confirmacion de contrasena es requerida")]
    public string ConfirmPassword { get; set; } = string.Empty;
}

public class RegistrationRequestDto
{
    [Required(ErrorMessage = "El correo electronico es requerido")]
    [EmailAddress(ErrorMessage = "El correo electronico no es valido")]
    public string Email { get; set; } = string.Empty;

    [Required(ErrorMessage = "El nombre es requerido")]
    [MaxLength(100)]
    public string Nombre { get; set; } = string.Empty;

    [Required(ErrorMessage = "La empresa es requerida")]
    public int EmpresaId { get; set; }
}

public class UserDto
{
    public int Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string Nombre { get; set; } = string.Empty;
    public string Rol { get; set; } = string.Empty;
    public int? EmpresaId { get; set; }
    public string? EmpresaNombre { get; set; }
    public bool Activo { get; set; }
    public bool RequiereCambioPassword { get; set; }
}
