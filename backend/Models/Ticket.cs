using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MDAyuda.API.Models;

public class Ticket
{
    [Key]
    public int Id { get; set; }

    [Required]
    [MaxLength(200)]
    public string Titulo { get; set; } = string.Empty;

    [Required]
    public string Descripcion { get; set; } = string.Empty;

    public int ClienteId { get; set; }

    [ForeignKey("ClienteId")]
    public Usuario? Cliente { get; set; }

    public int? EmpleadoAsignadoId { get; set; }

    [ForeignKey("EmpleadoAsignadoId")]
    public Usuario? EmpleadoAsignado { get; set; }

    public int CategoriaId { get; set; }

    [ForeignKey("CategoriaId")]
    public Categoria? Categoria { get; set; }

    [Required]
    [MaxLength(10)]
    public string Prioridad { get; set; } = "Media"; // 'Baja' | 'Media' | 'Alta'

    [Required]
    [MaxLength(20)]
    public string Estado { get; set; } = "Abierto"; // 'Abierto' | 'EnProceso' | 'EnEspera' | 'Resuelto' | 'Cerrado'

    public DateTime FechaCreacion { get; set; } = DateTime.UtcNow;

    public DateTime FechaActualizacion { get; set; } = DateTime.UtcNow;

    public DateTime? FechaPrimeraRespuesta { get; set; }

    public DateTime? FechaResolucion { get; set; }

    // Navigation properties
    public ICollection<Comentario> Comentarios { get; set; } = new List<Comentario>();
    public ICollection<Archivo> Archivos { get; set; } = new List<Archivo>();
}
