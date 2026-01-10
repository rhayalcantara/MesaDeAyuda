using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MDAyuda.API.Data;
using MDAyuda.API.Models;

namespace MDAyuda.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class ConfiguracionController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<ConfiguracionController> _logger;

    public ConfiguracionController(ApplicationDbContext context, ILogger<ConfiguracionController> logger)
    {
        _context = context;
        _logger = logger;
    }

    // ==================== SLA ENDPOINTS ====================

    /// <summary>
    /// Get all SLA configurations
    /// </summary>
    [HttpGet("sla")]
    public async Task<ActionResult<List<ConfiguracionSLA>>> GetSLAConfigurations()
    {
        var configs = await _context.ConfiguracionesSLA
            .OrderBy(c => c.Prioridad == "Alta" ? 1 : c.Prioridad == "Media" ? 2 : 3)
            .ToListAsync();

        return Ok(configs);
    }

    /// <summary>
    /// Update SLA configuration
    /// </summary>
    [HttpPut("sla/{id}")]
    public async Task<IActionResult> UpdateSLAConfiguration(int id, [FromBody] ConfiguracionSLA dto)
    {
        var config = await _context.ConfiguracionesSLA.FindAsync(id);
        if (config == null)
        {
            return NotFound(new { message = "Configuracion SLA no encontrada" });
        }

        if (dto.TiempoRespuestaHoras < 1)
        {
            return BadRequest(new { message = "El tiempo de respuesta debe ser al menos 1 hora" });
        }

        if (dto.TiempoResolucionHoras < dto.TiempoRespuestaHoras)
        {
            return BadRequest(new { message = "El tiempo de resolucion debe ser mayor o igual al tiempo de respuesta" });
        }

        config.TiempoRespuestaHoras = dto.TiempoRespuestaHoras;
        config.TiempoResolucionHoras = dto.TiempoResolucionHoras;

        await _context.SaveChangesAsync();

        _logger.LogInformation("SLA configuration updated for priority {Priority}", config.Prioridad);

        return Ok(config);
    }

    /// <summary>
    /// Update all SLA configurations at once
    /// </summary>
    [HttpPut("sla")]
    public async Task<IActionResult> UpdateAllSLAConfigurations([FromBody] List<ConfiguracionSLA> dtos)
    {
        foreach (var dto in dtos)
        {
            var config = await _context.ConfiguracionesSLA.FindAsync(dto.Id);
            if (config == null) continue;

            if (dto.TiempoRespuestaHoras < 1)
            {
                return BadRequest(new { message = $"El tiempo de respuesta para {config.Prioridad} debe ser al menos 1 hora" });
            }

            if (dto.TiempoResolucionHoras < dto.TiempoRespuestaHoras)
            {
                return BadRequest(new { message = $"El tiempo de resolucion para {config.Prioridad} debe ser mayor o igual al tiempo de respuesta" });
            }

            config.TiempoRespuestaHoras = dto.TiempoRespuestaHoras;
            config.TiempoResolucionHoras = dto.TiempoResolucionHoras;
        }

        await _context.SaveChangesAsync();

        _logger.LogInformation("All SLA configurations updated");

        return Ok(await _context.ConfiguracionesSLA.ToListAsync());
    }

    // ==================== SYSTEM SETTINGS ENDPOINTS ====================

    /// <summary>
    /// Get all system settings
    /// </summary>
    [HttpGet("sistema")]
    public async Task<ActionResult<List<ConfiguracionSistema>>> GetSystemSettings()
    {
        var configs = await _context.ConfiguracionesSistema
            .OrderBy(c => c.Clave)
            .ToListAsync();

        return Ok(configs);
    }

    /// <summary>
    /// Get a specific system setting by key
    /// </summary>
    [HttpGet("sistema/{clave}")]
    [AllowAnonymous]
    public async Task<ActionResult<ConfiguracionSistema>> GetSystemSetting(string clave)
    {
        var config = await _context.ConfiguracionesSistema
            .FirstOrDefaultAsync(c => c.Clave == clave);

        if (config == null)
        {
            return NotFound(new { message = "Configuracion no encontrada" });
        }

        return Ok(config);
    }

    /// <summary>
    /// Get theme/branding settings (public endpoint for dynamic theming)
    /// </summary>
    [HttpGet("tema")]
    [AllowAnonymous]
    public async Task<ActionResult<object>> GetThemeSettings()
    {
        var configs = await _context.ConfiguracionesSistema
            .Where(c => c.Clave == "ColorPrimario" ||
                       c.Clave == "ColorSecundario" ||
                       c.Clave == "NombreSistema" ||
                       c.Clave == "LogoUrl")
            .ToDictionaryAsync(c => c.Clave, c => c.Valor);

        return Ok(new
        {
            colorPrimario = configs.GetValueOrDefault("ColorPrimario", "#2563eb"),
            colorSecundario = configs.GetValueOrDefault("ColorSecundario", "#64748b"),
            nombreSistema = configs.GetValueOrDefault("NombreSistema", "MDAyuda"),
            logoUrl = configs.GetValueOrDefault("LogoUrl", "")
        });
    }

    /// <summary>
    /// Update a system setting
    /// </summary>
    [HttpPut("sistema/{id}")]
    public async Task<IActionResult> UpdateSystemSetting(int id, [FromBody] ConfiguracionSistema dto)
    {
        var config = await _context.ConfiguracionesSistema.FindAsync(id);
        if (config == null)
        {
            return NotFound(new { message = "Configuracion no encontrada" });
        }

        config.Valor = dto.Valor;
        if (!string.IsNullOrEmpty(dto.Descripcion))
        {
            config.Descripcion = dto.Descripcion;
        }

        await _context.SaveChangesAsync();

        _logger.LogInformation("System setting {Key} updated", config.Clave);

        return Ok(config);
    }

    /// <summary>
    /// Update multiple system settings at once
    /// </summary>
    [HttpPut("sistema")]
    public async Task<IActionResult> UpdateAllSystemSettings([FromBody] List<ConfiguracionSistema> dtos)
    {
        foreach (var dto in dtos)
        {
            var config = await _context.ConfiguracionesSistema.FindAsync(dto.Id);
            if (config == null) continue;

            config.Valor = dto.Valor;
            if (!string.IsNullOrEmpty(dto.Descripcion))
            {
                config.Descripcion = dto.Descripcion;
            }
        }

        await _context.SaveChangesAsync();

        _logger.LogInformation("All system settings updated");

        return Ok(await _context.ConfiguracionesSistema.ToListAsync());
    }
}
