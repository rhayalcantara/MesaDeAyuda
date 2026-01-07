using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MDAyuda.API.Models;

public class Archivo
{
    [Key]
    public int Id { get; set; }

    public int TicketId { get; set; }

    [ForeignKey("TicketId")]
    public Ticket? Ticket { get; set; }

    public int? ComentarioId { get; set; }

    [ForeignKey("ComentarioId")]
    public Comentario? Comentario { get; set; }

    [Required]
    [MaxLength(255)]
    public string NombreOriginal { get; set; } = string.Empty;

    [Required]
    [MaxLength(255)]
    public string NombreAlmacenado { get; set; } = string.Empty;

    [Required]
    [MaxLength(100)]
    public string TipoMime { get; set; } = string.Empty;

    public long Tamanio { get; set; }

    public int SubidoPorId { get; set; }

    [ForeignKey("SubidoPorId")]
    public Usuario? SubidoPor { get; set; }

    public DateTime FechaSubida { get; set; } = DateTime.UtcNow;
}
