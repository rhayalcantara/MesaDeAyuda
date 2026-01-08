using System.ComponentModel.DataAnnotations;

namespace MDAyuda.API.DTOs;

public class TicketDto
{
    public int Id { get; set; }
    public string Titulo { get; set; } = string.Empty;
    public string Descripcion { get; set; } = string.Empty;
    public int ClienteId { get; set; }
    public string? ClienteNombre { get; set; }
    public string? ClienteEmail { get; set; }
    public int? EmpleadoAsignadoId { get; set; }
    public string? EmpleadoAsignadoNombre { get; set; }
    public int CategoriaId { get; set; }
    public string? CategoriaNombre { get; set; }
    public string Prioridad { get; set; } = string.Empty;
    public string Estado { get; set; } = string.Empty;
    public DateTime FechaCreacion { get; set; }
    public DateTime FechaActualizacion { get; set; }
    public DateTime? FechaPrimeraRespuesta { get; set; }
    public DateTime? FechaResolucion { get; set; }
    public int ComentariosCount { get; set; }
    public int ArchivosCount { get; set; }
    // Concurrency token for optimistic locking (Base64 encoded)
    public string? RowVersion { get; set; }
}

public class CreateTicketDto
{
    [Required(ErrorMessage = "El titulo es requerido")]
    [MaxLength(200, ErrorMessage = "El titulo no puede exceder 200 caracteres")]
    public string Titulo { get; set; } = string.Empty;

    [Required(ErrorMessage = "La descripcion es requerida")]
    public string Descripcion { get; set; } = string.Empty;

    [Required(ErrorMessage = "La categoria es requerida")]
    public int CategoriaId { get; set; }

    [Required(ErrorMessage = "La prioridad es requerida")]
    public string Prioridad { get; set; } = "Media";
}

public class UpdateTicketDto
{
    [MaxLength(200)]
    public string? Titulo { get; set; }

    public string? Descripcion { get; set; }

    public int? CategoriaId { get; set; }

    public string? Prioridad { get; set; }

    // Concurrency token for optimistic locking (Base64 encoded)
    public string? RowVersion { get; set; }
}

public class AssignTicketDto
{
    // Nullable to support self-assignment when no body is provided
    public int? EmpleadoId { get; set; }
}

public class ChangeStatusDto
{
    [Required(ErrorMessage = "El estado es requerido")]
    public string Estado { get; set; } = string.Empty;
}

public class TicketListDto
{
    public List<TicketDto> Items { get; set; } = new();
    public int TotalItems { get; set; }
    public int Page { get; set; }
    public int PageSize { get; set; }
    public int TotalPages { get; set; }
}

public class TicketFilterDto
{
    public string? Estado { get; set; }
    public string? Prioridad { get; set; }
    public int? CategoriaId { get; set; }
    public int? EmpresaId { get; set; }
    public int? EmpleadoId { get; set; }
    public string? Busqueda { get; set; }
    public DateTime? FechaDesde { get; set; }
    public DateTime? FechaHasta { get; set; }
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 10;
    public string OrdenarPor { get; set; } = "fecha";
    public bool OrdenAscendente { get; set; } = false;
}
