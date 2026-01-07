using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MDAyuda.API.Models;

public class Comentario
{
    [Key]
    public int Id { get; set; }

    public int TicketId { get; set; }

    [ForeignKey("TicketId")]
    public Ticket? Ticket { get; set; }

    public int UsuarioId { get; set; }

    [ForeignKey("UsuarioId")]
    public Usuario? Usuario { get; set; }

    [Required]
    public string Texto { get; set; } = string.Empty;

    public DateTime FechaCreacion { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public ICollection<Archivo> Archivos { get; set; } = new List<Archivo>();
}
