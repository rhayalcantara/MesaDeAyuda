using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MDAyuda.API.Models;

public class Empresa
{
    [Key]
    public int Id { get; set; }

    [Required]
    [MaxLength(100)]
    public string Nombre { get; set; } = string.Empty;

    [MaxLength(20)]
    public string ConfigVisibilidadTickets { get; set; } = "propios"; // 'propios' | 'empresa'

    [MaxLength(500)]
    public string? LogoUrl { get; set; }

    [MaxLength(7)]
    public string? ColorPrimario { get; set; }

    public bool Activa { get; set; } = true;

    public DateTime FechaCreacion { get; set; } = DateTime.UtcNow;

    public DateTime FechaActualizacion { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public ICollection<Usuario> Usuarios { get; set; } = new List<Usuario>();
    public ICollection<SolicitudRegistro> SolicitudesRegistro { get; set; } = new List<SolicitudRegistro>();
}
