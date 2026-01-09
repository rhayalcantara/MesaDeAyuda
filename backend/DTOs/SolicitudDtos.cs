namespace MDAyuda.API.DTOs;

public class SolicitudRegistroDto
{
    public int Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string Nombre { get; set; } = string.Empty;
    public int EmpresaId { get; set; }
    public string? EmpresaNombre { get; set; }
    public string Estado { get; set; } = string.Empty;
    public DateTime FechaSolicitud { get; set; }
    public DateTime? FechaResolucion { get; set; }
    public int? AprobadoPorId { get; set; }
    public string? AprobadoPorNombre { get; set; }
}

public class AprobacionResponseDto
{
    public string Message { get; set; } = string.Empty;
    public int UsuarioId { get; set; }
    public string Email { get; set; } = string.Empty;
    public string TemporaryPassword { get; set; } = string.Empty;
}

public class RechazarSolicitudDto
{
    public string? Motivo { get; set; }
}
