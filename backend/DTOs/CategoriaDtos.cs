using System.ComponentModel.DataAnnotations;

namespace MDAyuda.API.DTOs;

public class CategoriaDto
{
    public int Id { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string? Descripcion { get; set; }
    public bool Activa { get; set; }
    public DateTime FechaCreacion { get; set; }
    public int TicketsCount { get; set; }
}

public class CreateCategoriaDto
{
    [Required(ErrorMessage = "El nombre es requerido")]
    [MaxLength(100, ErrorMessage = "El nombre no puede exceder 100 caracteres")]
    public string Nombre { get; set; } = string.Empty;

    [MaxLength(500)]
    public string? Descripcion { get; set; }
}

public class UpdateCategoriaDto
{
    [MaxLength(100)]
    public string? Nombre { get; set; }

    [MaxLength(500)]
    public string? Descripcion { get; set; }

    public bool? Activa { get; set; }
}
