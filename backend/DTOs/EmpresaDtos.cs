using System.ComponentModel.DataAnnotations;

namespace MDAyuda.API.DTOs;

public class EmpresaDto
{
    public int Id { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string ConfigVisibilidadTickets { get; set; } = "propios";
    public string? LogoUrl { get; set; }
    public string? ColorPrimario { get; set; }
    public bool Activa { get; set; }
    public DateTime FechaCreacion { get; set; }
    public DateTime FechaActualizacion { get; set; }
    public int ClientesCount { get; set; }
}

public class CreateEmpresaDto
{
    [Required(ErrorMessage = "El nombre es requerido")]
    [MaxLength(100, ErrorMessage = "El nombre no puede exceder 100 caracteres")]
    public string Nombre { get; set; } = string.Empty;

    public string ConfigVisibilidadTickets { get; set; } = "propios";

    [MaxLength(500)]
    public string? LogoUrl { get; set; }

    [MaxLength(7)]
    public string? ColorPrimario { get; set; }
}

public class UpdateEmpresaDto
{
    [MaxLength(100)]
    public string? Nombre { get; set; }

    public string? ConfigVisibilidadTickets { get; set; }

    [MaxLength(500)]
    public string? LogoUrl { get; set; }

    [MaxLength(7)]
    public string? ColorPrimario { get; set; }

    public bool? Activa { get; set; }
}
