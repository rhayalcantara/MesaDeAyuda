using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MDAyuda.API.Models;

public class Usuario
{
    [Key]
    public int Id { get; set; }

    [Required]
    [MaxLength(255)]
    public string Email { get; set; } = string.Empty;

    [Required]
    [MaxLength(500)]
    public string PasswordHash { get; set; } = string.Empty;

    [Required]
    [MaxLength(100)]
    public string Nombre { get; set; } = string.Empty;

    [Required]
    [MaxLength(20)]
    public string Rol { get; set; } = "Cliente"; // 'Admin' | 'Empleado' | 'Cliente'

    public int? EmpresaId { get; set; }

    [ForeignKey("EmpresaId")]
    public Empresa? Empresa { get; set; }

    public bool Activo { get; set; } = true;

    public bool RequiereCambioPassword { get; set; } = false;

    public DateTime FechaCreacion { get; set; } = DateTime.UtcNow;

    public DateTime FechaActualizacion { get; set; } = DateTime.UtcNow;

    public DateTime? UltimoAcceso { get; set; }

    // Navigation properties
    public ICollection<Ticket> TicketsCreados { get; set; } = new List<Ticket>();
    public ICollection<Ticket> TicketsAsignados { get; set; } = new List<Ticket>();
    public ICollection<Comentario> Comentarios { get; set; } = new List<Comentario>();
    public ICollection<Archivo> Archivos { get; set; } = new List<Archivo>();
}
