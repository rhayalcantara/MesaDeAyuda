using System.ComponentModel.DataAnnotations;

namespace MDAyuda.API.Models;

public class ConfiguracionSistema
{
    [Key]
    public int Id { get; set; }

    [Required]
    [MaxLength(100)]
    public string Clave { get; set; } = string.Empty;

    [Required]
    [MaxLength(500)]
    public string Valor { get; set; } = string.Empty;

    [MaxLength(200)]
    public string? Descripcion { get; set; }
}
