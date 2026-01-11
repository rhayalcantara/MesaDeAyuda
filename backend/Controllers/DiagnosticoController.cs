using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MDAyuda.API.Data;

namespace MDAyuda.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Policy = "AdminOnly")]
public class DiagnosticoController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public DiagnosticoController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet("estructura-bd")]
    public async Task<ActionResult<object>> GetEstructuraBD()
    {
        var resultado = new Dictionary<string, object>();

        try
        {
            // Información de conexión
            resultado["provider"] = _context.Database.ProviderName;
            resultado["canConnect"] = await _context.Database.CanConnectAsync();

            // Contar registros en cada tabla
            resultado["counts"] = new
            {
                usuarios = await _context.Usuarios.CountAsync(),
                tickets = await _context.Tickets.CountAsync(),
                categorias = await _context.Categorias.CountAsync(),
                empresas = await _context.Empresas.CountAsync(),
                comentarios = await _context.Comentarios.CountAsync(),
                archivos = await _context.Archivos.CountAsync(),
                solicitudesRegistro = await _context.SolicitudesRegistro.CountAsync(),
                configuracionesSLA = await _context.ConfiguracionesSLA.CountAsync(),
                ticketHistoriales = await _context.TicketHistoriales.CountAsync(),
                configuracionSistema = 0 // No existe en este contexto
            };

            // Verificar tickets con datos nulos
            var ticketsConClienteNull = await _context.Tickets
                .Where(t => t.ClienteId == 0 || t.Cliente == null)
                .CountAsync();

            var ticketsConCategoriaNull = await _context.Tickets
                .Where(t => t.CategoriaId == 0 || t.Categoria == null)
                .CountAsync();

            resultado["ticketsProblematicos"] = new
            {
                conClienteNull = ticketsConClienteNull,
                conCategoriaNull = ticketsConCategoriaNull
            };

            // Muestra de tickets para diagnóstico
            var ticketsSample = await _context.Tickets
                .Select(t => new
                {
                    t.Id,
                    t.Titulo,
                    t.ClienteId,
                    t.CategoriaId,
                    t.EmpleadoAsignadoId,
                    t.Estado,
                    clienteExiste = t.Cliente != null,
                    categoriaExiste = t.Categoria != null
                })
                .Take(10)
                .ToListAsync();

            resultado["ticketsSample"] = ticketsSample;

            // Muestra de categorías
            var categoriasSample = await _context.Categorias
                .Select(c => new
                {
                    c.Id,
                    c.Nombre,
                    c.Activa
                })
                .ToListAsync();

            resultado["categorias"] = categoriasSample;

            // IDs de clientes existentes
            var clienteIds = await _context.Usuarios
                .Where(u => u.Rol == "Cliente")
                .Select(u => u.Id)
                .ToListAsync();

            resultado["clienteIds"] = clienteIds;

            // IDs de categorías existentes
            var categoriaIds = await _context.Categorias
                .Select(c => c.Id)
                .ToListAsync();

            resultado["categoriaIds"] = categoriaIds;

        }
        catch (Exception ex)
        {
            resultado["error"] = ex.Message;
            resultado["stackTrace"] = ex.StackTrace;
            resultado["innerException"] = ex.InnerException?.Message;
        }

        return Ok(resultado);
    }

    [HttpGet("test-tickets")]
    public async Task<ActionResult<object>> TestTickets()
    {
        try
        {
            // Intentar cargar tickets paso a paso
            var resultado = new Dictionary<string, object>();

            // Paso 1: Solo contar
            resultado["paso1_count"] = await _context.Tickets.CountAsync();

            // Paso 2: Cargar sin includes
            var ticketsSinInclude = await _context.Tickets
                .Select(t => new { t.Id, t.Titulo, t.Estado })
                .ToListAsync();
            resultado["paso2_sinInclude"] = ticketsSinInclude;

            // Paso 3: Cargar con Include de Cliente
            try
            {
                var ticketsConCliente = await _context.Tickets
                    .Include(t => t.Cliente)
                    .Select(t => new {
                        t.Id,
                        t.ClienteId,
                        clienteNombre = t.Cliente != null ? t.Cliente.Nombre : "NULL"
                    })
                    .ToListAsync();
                resultado["paso3_conCliente"] = ticketsConCliente;
            }
            catch (Exception ex)
            {
                resultado["paso3_error"] = ex.Message;
            }

            // Paso 4: Cargar con Include de Categoria
            try
            {
                var ticketsConCategoria = await _context.Tickets
                    .Include(t => t.Categoria)
                    .Select(t => new {
                        t.Id,
                        t.CategoriaId,
                        categoriaNombre = t.Categoria != null ? t.Categoria.Nombre : "NULL"
                    })
                    .ToListAsync();
                resultado["paso4_conCategoria"] = ticketsConCategoria;
            }
            catch (Exception ex)
            {
                resultado["paso4_error"] = ex.Message;
            }

            return Ok(resultado);
        }
        catch (Exception ex)
        {
            return Ok(new
            {
                error = ex.Message,
                stackTrace = ex.StackTrace,
                innerException = ex.InnerException?.Message
            });
        }
    }
}
