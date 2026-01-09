using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MDAyuda.API.Data;
using MDAyuda.API.DTOs;

namespace MDAyuda.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Policy = "EmpleadoOrAdmin")]
public class ReportesController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<ReportesController> _logger;

    public ReportesController(
        ApplicationDbContext context,
        ILogger<ReportesController> logger)
    {
        _context = context;
        _logger = logger;
    }

    // GET: api/reportes/tickets-por-estado
    [HttpGet("tickets-por-estado")]
    public async Task<ActionResult<object>> GetTicketsPorEstado()
    {
        var stats = await _context.Tickets
            .GroupBy(t => t.Estado)
            .Select(g => new { Estado = g.Key, Count = g.Count() })
            .ToListAsync();

        return Ok(new
        {
            abiertos = stats.FirstOrDefault(s => s.Estado == "Abierto")?.Count ?? 0,
            enProceso = stats.FirstOrDefault(s => s.Estado == "EnProceso")?.Count ?? 0,
            enEspera = stats.FirstOrDefault(s => s.Estado == "EnEspera")?.Count ?? 0,
            resueltos = stats.FirstOrDefault(s => s.Estado == "Resuelto")?.Count ?? 0,
            cerrados = stats.FirstOrDefault(s => s.Estado == "Cerrado")?.Count ?? 0
        });
    }

    // GET: api/reportes/tickets-por-prioridad
    [HttpGet("tickets-por-prioridad")]
    public async Task<ActionResult<object>> GetTicketsPorPrioridad()
    {
        var stats = await _context.Tickets
            .Where(t => t.Estado != "Cerrado" && t.Estado != "Resuelto")
            .GroupBy(t => t.Prioridad)
            .Select(g => new { Prioridad = g.Key, Count = g.Count() })
            .ToListAsync();

        return Ok(new
        {
            alta = stats.FirstOrDefault(s => s.Prioridad == "Alta")?.Count ?? 0,
            media = stats.FirstOrDefault(s => s.Prioridad == "Media")?.Count ?? 0,
            baja = stats.FirstOrDefault(s => s.Prioridad == "Baja")?.Count ?? 0
        });
    }

    // GET: api/reportes/tickets-por-categoria
    [HttpGet("tickets-por-categoria")]
    public async Task<ActionResult<List<object>>> GetTicketsPorCategoria()
    {
        var stats = await _context.Tickets
            .Include(t => t.Categoria)
            .GroupBy(t => new { t.CategoriaId, t.Categoria!.Nombre })
            .Select(g => new
            {
                categoriaId = g.Key.CategoriaId,
                categoriaNombre = g.Key.Nombre,
                total = g.Count(),
                abiertos = g.Count(t => t.Estado == "Abierto" || t.Estado == "EnProceso" || t.Estado == "EnEspera"),
                resueltos = g.Count(t => t.Estado == "Resuelto" || t.Estado == "Cerrado")
            })
            .OrderByDescending(x => x.total)
            .ToListAsync();

        return Ok(stats);
    }

    // GET: api/reportes/tickets-por-periodo
    [HttpGet("tickets-por-periodo")]
    public async Task<ActionResult<List<object>>> GetTicketsPorPeriodo(
        [FromQuery] DateTime? desde = null,
        [FromQuery] DateTime? hasta = null,
        [FromQuery] string agrupacion = "dia") // dia, semana, mes
    {
        var fechaDesde = desde ?? DateTime.UtcNow.AddMonths(-1);
        var fechaHasta = hasta ?? DateTime.UtcNow;

        var tickets = await _context.Tickets
            .Where(t => t.FechaCreacion >= fechaDesde && t.FechaCreacion <= fechaHasta)
            .ToListAsync();

        var result = agrupacion switch
        {
            "semana" => tickets
                .GroupBy(t => new { Year = t.FechaCreacion.Year, Week = GetWeekOfYear(t.FechaCreacion) })
                .Select(g => new
                {
                    periodo = $"Semana {g.Key.Week}, {g.Key.Year}",
                    fecha = GetFirstDayOfWeek(g.Key.Year, g.Key.Week),
                    total = g.Count(),
                    abiertos = g.Count(t => t.Estado == "Abierto"),
                    resueltos = g.Count(t => t.Estado == "Resuelto" || t.Estado == "Cerrado")
                })
                .OrderBy(x => x.fecha)
                .ToList<object>(),

            "mes" => tickets
                .GroupBy(t => new { t.FechaCreacion.Year, t.FechaCreacion.Month })
                .Select(g => new
                {
                    periodo = $"{GetMonthName(g.Key.Month)} {g.Key.Year}",
                    fecha = new DateTime(g.Key.Year, g.Key.Month, 1),
                    total = g.Count(),
                    abiertos = g.Count(t => t.Estado == "Abierto"),
                    resueltos = g.Count(t => t.Estado == "Resuelto" || t.Estado == "Cerrado")
                })
                .OrderBy(x => x.fecha)
                .ToList<object>(),

            _ => tickets // dia
                .GroupBy(t => t.FechaCreacion.Date)
                .Select(g => new
                {
                    periodo = g.Key.ToString("dd/MM/yyyy"),
                    fecha = g.Key,
                    total = g.Count(),
                    abiertos = g.Count(t => t.Estado == "Abierto"),
                    resueltos = g.Count(t => t.Estado == "Resuelto" || t.Estado == "Cerrado")
                })
                .OrderBy(x => x.fecha)
                .ToList<object>()
        };

        return Ok(result);
    }

    // GET: api/reportes/rendimiento-empleados
    [HttpGet("rendimiento-empleados")]
    public async Task<ActionResult<List<object>>> GetRendimientoEmpleados(
        [FromQuery] DateTime? desde = null,
        [FromQuery] DateTime? hasta = null)
    {
        var fechaDesde = desde ?? DateTime.UtcNow.AddMonths(-1);
        var fechaHasta = hasta ?? DateTime.UtcNow;

        var empleados = await _context.Usuarios
            .Where(u => (u.Rol == "Empleado" || u.Rol == "Admin") && u.Activo)
            .Select(e => new
            {
                empleadoId = e.Id,
                empleadoNombre = e.Nombre,
                empleadoEmail = e.Email
            })
            .ToListAsync();

        var tickets = await _context.Tickets
            .Where(t => t.FechaCreacion >= fechaDesde && t.FechaCreacion <= fechaHasta)
            .ToListAsync();

        var result = empleados.Select(e =>
        {
            var ticketsAsignados = tickets.Where(t => t.EmpleadoAsignadoId == e.empleadoId).ToList();
            var ticketsResueltos = ticketsAsignados.Where(t => t.Estado == "Resuelto" || t.Estado == "Cerrado").ToList();

            // Calculate average resolution time
            var ticketsConResolucion = ticketsResueltos.Where(t => t.FechaResolucion.HasValue).ToList();
            var tiempoPromedioHoras = ticketsConResolucion.Any()
                ? ticketsConResolucion.Average(t => (t.FechaResolucion!.Value - t.FechaCreacion).TotalHours)
                : 0;

            return new
            {
                e.empleadoId,
                e.empleadoNombre,
                e.empleadoEmail,
                ticketsAsignados = ticketsAsignados.Count,
                ticketsResueltos = ticketsResueltos.Count,
                ticketsPendientes = ticketsAsignados.Count(t => t.Estado != "Resuelto" && t.Estado != "Cerrado"),
                tiempoPromedioResolucionHoras = Math.Round(tiempoPromedioHoras, 1),
                tasaResolucion = ticketsAsignados.Any()
                    ? Math.Round((double)ticketsResueltos.Count / ticketsAsignados.Count * 100, 1)
                    : 0
            };
        })
        .OrderByDescending(x => x.ticketsResueltos)
        .ToList();

        return Ok(result);
    }

    // GET: api/reportes/tickets-por-empresa
    [HttpGet("tickets-por-empresa")]
    public async Task<ActionResult<List<object>>> GetTicketsPorEmpresa()
    {
        var stats = await _context.Tickets
            .Include(t => t.Cliente)
            .ThenInclude(c => c!.Empresa)
            .Where(t => t.Cliente!.EmpresaId != null)
            .GroupBy(t => new { t.Cliente!.EmpresaId, t.Cliente.Empresa!.Nombre })
            .Select(g => new
            {
                empresaId = g.Key.EmpresaId,
                empresaNombre = g.Key.Nombre,
                total = g.Count(),
                abiertos = g.Count(t => t.Estado == "Abierto" || t.Estado == "EnProceso" || t.Estado == "EnEspera"),
                resueltos = g.Count(t => t.Estado == "Resuelto" || t.Estado == "Cerrado")
            })
            .OrderByDescending(x => x.total)
            .ToListAsync();

        return Ok(stats);
    }

    // GET: api/reportes/sla
    [HttpGet("sla")]
    public async Task<ActionResult<object>> GetSLAStats()
    {
        var configSLA = await _context.ConfiguracionesSLA.ToListAsync();
        var tickets = await _context.Tickets
            .Where(t => t.Estado != "Cerrado")
            .ToListAsync();

        var ahora = DateTime.UtcNow;
        var slaViolations = new List<object>();

        foreach (var ticket in tickets)
        {
            var config = configSLA.FirstOrDefault(c => c.Prioridad == ticket.Prioridad);
            if (config == null) continue;

            var horasTranscurridas = (ahora - ticket.FechaCreacion).TotalHours;

            // Check response SLA
            var respuestaViolada = !ticket.FechaPrimeraRespuesta.HasValue &&
                                   horasTranscurridas > config.TiempoRespuestaHoras;

            // Check resolution SLA
            var resolucionViolada = ticket.Estado != "Resuelto" &&
                                    horasTranscurridas > config.TiempoResolucionHoras;

            if (respuestaViolada || resolucionViolada)
            {
                slaViolations.Add(new
                {
                    ticketId = ticket.Id,
                    titulo = ticket.Titulo,
                    prioridad = ticket.Prioridad,
                    estado = ticket.Estado,
                    horasTranscurridas = Math.Round(horasTranscurridas, 1),
                    respuestaViolada,
                    resolucionViolada,
                    tiempoRespuestaLimite = config.TiempoRespuestaHoras,
                    tiempoResolucionLimite = config.TiempoResolucionHoras
                });
            }
        }

        return Ok(new
        {
            totalTicketsActivos = tickets.Count,
            ticketsConViolacionSLA = slaViolations.Count,
            porcentajeCumplimiento = tickets.Any()
                ? Math.Round((1 - (double)slaViolations.Count / tickets.Count) * 100, 1)
                : 100,
            violaciones = slaViolations.OrderByDescending(v => ((dynamic)v).horasTranscurridas).Take(10)
        });
    }

    // GET: api/reportes/resumen
    [HttpGet("resumen")]
    public async Task<ActionResult<object>> GetResumen()
    {
        var ahora = DateTime.UtcNow;
        var hace7Dias = ahora.AddDays(-7);
        var hace30Dias = ahora.AddDays(-30);

        var totalTickets = await _context.Tickets.CountAsync();
        var ticketsAbiertos = await _context.Tickets.CountAsync(t => t.Estado == "Abierto");
        var ticketsEnProceso = await _context.Tickets.CountAsync(t => t.Estado == "EnProceso");
        var ticketsResueltos = await _context.Tickets.CountAsync(t => t.Estado == "Resuelto");

        var ticketsUltimos7Dias = await _context.Tickets.CountAsync(t => t.FechaCreacion >= hace7Dias);
        var ticketsUltimos30Dias = await _context.Tickets.CountAsync(t => t.FechaCreacion >= hace30Dias);

        var resueltos30Dias = await _context.Tickets
            .Where(t => t.FechaResolucion >= hace30Dias)
            .CountAsync();

        // Average resolution time
        var ticketsConResolucion = await _context.Tickets
            .Where(t => t.FechaResolucion.HasValue && t.FechaResolucion >= hace30Dias)
            .ToListAsync();

        var tiempoPromedioResolucion = ticketsConResolucion.Any()
            ? ticketsConResolucion.Average(t => (t.FechaResolucion!.Value - t.FechaCreacion).TotalHours)
            : 0;

        return Ok(new
        {
            totalTickets,
            ticketsAbiertos,
            ticketsEnProceso,
            ticketsResueltos,
            ticketsUltimos7Dias,
            ticketsUltimos30Dias,
            resueltos30Dias,
            tiempoPromedioResolucionHoras = Math.Round(tiempoPromedioResolucion, 1),
            totalEmpleados = await _context.Usuarios.CountAsync(u => u.Rol == "Empleado" && u.Activo),
            totalClientes = await _context.Usuarios.CountAsync(u => u.Rol == "Cliente" && u.Activo),
            totalEmpresas = await _context.Empresas.CountAsync(e => e.Activa)
        });
    }

    private static int GetWeekOfYear(DateTime date)
    {
        var cal = System.Globalization.CultureInfo.CurrentCulture.Calendar;
        return cal.GetWeekOfYear(date, System.Globalization.CalendarWeekRule.FirstDay, DayOfWeek.Monday);
    }

    private static DateTime GetFirstDayOfWeek(int year, int week)
    {
        var jan1 = new DateTime(year, 1, 1);
        var daysOffset = DayOfWeek.Monday - jan1.DayOfWeek;
        var firstMonday = jan1.AddDays(daysOffset);
        var firstWeek = System.Globalization.CultureInfo.CurrentCulture.Calendar.GetWeekOfYear(jan1, System.Globalization.CalendarWeekRule.FirstDay, DayOfWeek.Monday);
        var weekNum = week;
        if (firstWeek <= 1) weekNum -= 1;
        return firstMonday.AddDays(weekNum * 7);
    }

    private static string GetMonthName(int month)
    {
        return month switch
        {
            1 => "Enero",
            2 => "Febrero",
            3 => "Marzo",
            4 => "Abril",
            5 => "Mayo",
            6 => "Junio",
            7 => "Julio",
            8 => "Agosto",
            9 => "Septiembre",
            10 => "Octubre",
            11 => "Noviembre",
            12 => "Diciembre",
            _ => ""
        };
    }
}
