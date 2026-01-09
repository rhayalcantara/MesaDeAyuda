using System;
using System.ComponentModel.DataAnnotations;

namespace MDAyuda.API.Models;

public class TicketHistorial
{
    public int Id { get; set; }

    [Required]
    public int TicketId { get; set; }
    public Ticket Ticket { get; set; } = null!;

    [Required]
    public int UsuarioId { get; set; }
    public Usuario Usuario { get; set; } = null!;

    [Required]
    [MaxLength(50)]
    public string TipoAccion { get; set; } = string.Empty; // "CambioEstado", "Asignacion", "Creacion", "Edicion"

    [MaxLength(50)]
    public string? CampoModificado { get; set; } // "Estado", "EmpleadoAsignado", etc.

    [MaxLength(100)]
    public string? ValorAnterior { get; set; }

    [MaxLength(100)]
    public string? ValorNuevo { get; set; }

    [MaxLength(500)]
    public string? Descripcion { get; set; }

    public DateTime FechaCambio { get; set; } = DateTime.UtcNow;
}
