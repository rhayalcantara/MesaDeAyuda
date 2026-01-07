using MDAyuda.API.Models;
using BCrypt.Net;

namespace MDAyuda.API.Data;

public static class DbSeeder
{
    public static async Task SeedAsync(ApplicationDbContext context)
    {
        // Seed default admin user
        if (!context.Usuarios.Any(u => u.Rol == "Admin"))
        {
            var admin = new Usuario
            {
                Email = "admin@mdayuda.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin123!"),
                Nombre = "Administrador",
                Rol = "Admin",
                Activo = true,
                RequiereCambioPassword = false,
                FechaCreacion = DateTime.UtcNow,
                FechaActualizacion = DateTime.UtcNow
            };

            context.Usuarios.Add(admin);
        }

        // Seed default SLA configurations
        if (!context.ConfiguracionesSLA.Any())
        {
            var slaConfigs = new List<ConfiguracionSLA>
            {
                new ConfiguracionSLA
                {
                    Prioridad = "Alta",
                    TiempoRespuestaHoras = 2,
                    TiempoResolucionHoras = 8
                },
                new ConfiguracionSLA
                {
                    Prioridad = "Media",
                    TiempoRespuestaHoras = 8,
                    TiempoResolucionHoras = 24
                },
                new ConfiguracionSLA
                {
                    Prioridad = "Baja",
                    TiempoRespuestaHoras = 24,
                    TiempoResolucionHoras = 72
                }
            };

            context.ConfiguracionesSLA.AddRange(slaConfigs);
        }

        // Seed default system configurations
        if (!context.ConfiguracionesSistema.Any())
        {
            var systemConfigs = new List<ConfiguracionSistema>
            {
                new ConfiguracionSistema
                {
                    Clave = "SessionTimeoutMinutes",
                    Valor = "60",
                    Descripcion = "Tiempo de inactividad antes de cerrar sesion (minutos)"
                },
                new ConfiguracionSistema
                {
                    Clave = "ColorPrimario",
                    Valor = "#2563eb",
                    Descripcion = "Color primario del sistema"
                },
                new ConfiguracionSistema
                {
                    Clave = "ColorSecundario",
                    Valor = "#64748b",
                    Descripcion = "Color secundario del sistema"
                },
                new ConfiguracionSistema
                {
                    Clave = "NombreSistema",
                    Valor = "MDAyuda",
                    Descripcion = "Nombre del sistema mostrado en la interfaz"
                },
                new ConfiguracionSistema
                {
                    Clave = "LogoUrl",
                    Valor = "",
                    Descripcion = "URL del logo del sistema"
                }
            };

            context.ConfiguracionesSistema.AddRange(systemConfigs);
        }

        // Seed default company for testing
        Empresa? testEmpresa = null;
        if (!context.Empresas.Any())
        {
            testEmpresa = new Empresa
            {
                Nombre = "Empresa Demo",
                ConfigVisibilidadTickets = "empresa",
                ColorPrimario = "#2563eb",
                Activa = true,
                FechaCreacion = DateTime.UtcNow,
                FechaActualizacion = DateTime.UtcNow
            };
            context.Empresas.Add(testEmpresa);
            await context.SaveChangesAsync();
        }
        else
        {
            testEmpresa = context.Empresas.FirstOrDefault();
        }

        // Seed test Empleado user
        if (!context.Usuarios.Any(u => u.Rol == "Empleado"))
        {
            var empleado = new Usuario
            {
                Email = "empleado@mdayuda.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Empleado123!"),
                Nombre = "Empleado Demo",
                Rol = "Empleado",
                Activo = true,
                RequiereCambioPassword = false,
                FechaCreacion = DateTime.UtcNow,
                FechaActualizacion = DateTime.UtcNow
            };
            context.Usuarios.Add(empleado);
        }

        // Seed test Cliente user
        if (!context.Usuarios.Any(u => u.Rol == "Cliente") && testEmpresa != null)
        {
            var cliente = new Usuario
            {
                Email = "cliente@demo.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Cliente123!"),
                Nombre = "Cliente Demo",
                Rol = "Cliente",
                EmpresaId = testEmpresa.Id,
                Activo = true,
                RequiereCambioPassword = false,
                FechaCreacion = DateTime.UtcNow,
                FechaActualizacion = DateTime.UtcNow
            };
            context.Usuarios.Add(cliente);
        }

        // Seed default categories
        if (!context.Categorias.Any())
        {
            var categorias = new List<Categoria>
            {
                new Categoria
                {
                    Nombre = "Sistema de Facturacion",
                    Descripcion = "Problemas relacionados con el sistema de facturacion",
                    Activa = true,
                    FechaCreacion = DateTime.UtcNow
                },
                new Categoria
                {
                    Nombre = "Sistema de Inventario",
                    Descripcion = "Problemas relacionados con el control de inventario",
                    Activa = true,
                    FechaCreacion = DateTime.UtcNow
                },
                new Categoria
                {
                    Nombre = "Sistema de Nomina",
                    Descripcion = "Problemas relacionados con el sistema de nomina",
                    Activa = true,
                    FechaCreacion = DateTime.UtcNow
                },
                new Categoria
                {
                    Nombre = "Correo Electronico",
                    Descripcion = "Problemas con el servicio de correo electronico",
                    Activa = true,
                    FechaCreacion = DateTime.UtcNow
                },
                new Categoria
                {
                    Nombre = "Acceso y Permisos",
                    Descripcion = "Problemas de acceso o permisos a sistemas",
                    Activa = true,
                    FechaCreacion = DateTime.UtcNow
                },
                new Categoria
                {
                    Nombre = "Otro",
                    Descripcion = "Otros problemas no categorizados",
                    Activa = true,
                    FechaCreacion = DateTime.UtcNow
                }
            };

            context.Categorias.AddRange(categorias);
        }

        await context.SaveChangesAsync();
    }
}
