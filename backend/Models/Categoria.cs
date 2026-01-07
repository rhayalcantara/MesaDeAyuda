using System.ComponentModel.DataAnnotations;

namespace MDAyuda.API.Models;

public class Categoria
{
    [Key]
    public int Id { get; set; }

    [Required]
    [MaxLength(100)]
    public string Nombre { get; set; } = string.Empty;

    [MaxLength(500)]
    public string? Descripcion { get; set; }

    public bool Activa { get; set; } = true;

    public DateTime FechaCreacion { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public ICollection<Ticket> Tickets { get; set; } = new List<Ticket>();
}
