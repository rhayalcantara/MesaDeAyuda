using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MDAyuda.API.Models;

public class SolicitudRegistro
{
    [Key]
    public int Id { get; set; }

    [Required]
    [MaxLength(255)]
    public string Email { get; set; } = string.Empty;

    [Required]
    [MaxLength(100)]
    public string Nombre { get; set; } = string.Empty;

    public int EmpresaId { get; set; }

    [ForeignKey("EmpresaId")]
    public Empresa? Empresa { get; set; }

    [MaxLength(20)]
    public string Estado { get; set; } = "Pendiente"; // 'Pendiente' | 'Aprobada' | 'Rechazada'

    public DateTime FechaSolicitud { get; set; } = DateTime.UtcNow;

    public DateTime? FechaResolucion { get; set; }

    public int? AprobadoPorId { get; set; }

    [ForeignKey("AprobadoPorId")]
    public Usuario? AprobadoPor { get; set; }
}
