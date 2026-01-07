using System.ComponentModel.DataAnnotations;

namespace MDAyuda.API.Models;

public class ConfiguracionSLA
{
    [Key]
    public int Id { get; set; }

    [Required]
    [MaxLength(10)]
    public string Prioridad { get; set; } = string.Empty; // 'Baja' | 'Media' | 'Alta'

    public int TiempoRespuestaHoras { get; set; }

    public int TiempoResolucionHoras { get; set; }
}
