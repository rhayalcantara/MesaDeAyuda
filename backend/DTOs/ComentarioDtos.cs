using System.ComponentModel.DataAnnotations;

namespace MDAyuda.API.DTOs;

public class ComentarioDto
{
    public int Id { get; set; }
    public int TicketId { get; set; }
    public int UsuarioId { get; set; }
    public string UsuarioNombre { get; set; } = string.Empty;
    public string UsuarioRol { get; set; } = string.Empty;
    public string Texto { get; set; } = string.Empty;
    public DateTime FechaCreacion { get; set; }
}

public class CreateComentarioDto
{
    [Required(ErrorMessage = "El texto del comentario es requerido")]
    [MinLength(1, ErrorMessage = "El comentario no puede estar vacio")]
    public string Texto { get; set; } = string.Empty;
}
