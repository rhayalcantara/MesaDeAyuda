# Servidor de Producción - MDAyuda

## URL de Producción

**Sitio Web:** https://rhayalcantara-002-site1.ntempurl.com

## Base de Datos

- **Servidor:** SQL5113.site4now.net
- **Base de datos:** db_aae4a2_mdayuda
- **Proveedor:** SQL Server

## Hosting

- **Proveedor:** Site4Now / nTempUrl
- **Tipo:** IIS con ASP.NET Core

## Acceso FTP

- **Servidor FTP:** win8106.site4now.net
- **Usuario:** rhayalcantara-002
- **Carpeta del sitio:** `/MDAyuda`

### Estructura de la carpeta `/MDAyuda`:
```
/MDAyuda/
├── appsettings.json
├── appsettings.Production.json
├── MDAyuda.API.dll          # Backend compilado
├── web.config               # Configuración IIS
├── runtimes/                # Runtime dependencies
├── publish/                 # Archivos publicados
└── wwwroot/                 # Frontend estático
    ├── index.html
    ├── _next/               # Assets Next.js
    ├── admin/               # Panel administrador
    ├── empleado/            # Panel empleado
    ├── cliente/             # Panel cliente
    ├── login/
    ├── uploads/             # Archivos subidos
    └── ...
```

### Acceso directo vía MCP FTP
Claude Code puede interactuar directamente con el servidor usando el MCP FTP para:
- Listar contenido: `ftp_list`
- Subir archivos: `ftp_upload`
- Descargar archivos: `ftp_download`
- Leer archivos remotos: `ftp_read`
- Escribir archivos remotos: `ftp_write`

## Endpoints de Diagnóstico

| Endpoint | Descripción |
|----------|-------------|
| `/api/diagnostico/estructura-bd` | Estructura de BD, conteos y tickets problemáticos |
| `/api/diagnostico/test-tickets` | Prueba paso a paso de carga de tickets |

## Credenciales de Acceso

- **Admin:** admin@mdayuda.com / BcdefG7h*
- **Empleado:** ralcantara@mdayuda.com / BcdefG7h*

## Archivos de Configuración

- `appsettings.Production.json` - Configuración de producción
- `web.config` - Configuración de IIS

## Notas

- El frontend usa URL relativa `/api` (mismo servidor)
- Swagger está deshabilitado en producción
- Las migraciones se ejecutan automáticamente al iniciar

---

## Paquete de Despliegue

### Archivo: `MDAyuda-deploy-completo.zip`

**Fecha de creación:** 10 de enero 2026
**Tamaño:** 22 MB

### Contenido del paquete:
- ✅ Backend compilado (.NET 9 Release)
- ✅ Frontend compilado (Next.js 14 static export)
- ✅ DiagnosticoController (nuevo)
- ✅ Correcciones de NullReferenceException en tickets/categorías
- ✅ web.config para IIS
- ✅ appsettings.json y appsettings.Production.json

### Correcciones incluidas:
1. **Error 500 en `/api/tickets`** - Corregido NullReferenceException
2. **Error 500 en `/api/categorias`** - Corregido NullReferenceException
3. **Error 500 en `/api/tickets/estadisticas`** - Corregido NullReferenceException
4. **Nuevo endpoint `/api/diagnostico/estructura-bd`** - Para diagnóstico de BD
5. **Nuevo endpoint `/api/diagnostico/test-tickets`** - Para pruebas de tickets

---

## Instrucciones de Despliegue

### Paso 1: Descargar el paquete
El archivo `MDAyuda-deploy-completo.zip` está en la raíz del proyecto.

### Paso 2: Detener el sitio en IIS
1. Acceder al panel de control de Site4Now
2. Detener el sitio web

### Paso 3: Subir archivos
1. Descomprimir `MDAyuda-deploy-completo.zip`
2. Subir **TODO** el contenido a la carpeta del sitio vía FTP
3. Sobrescribir los archivos existentes

### Paso 4: Verificar configuración
Asegurarse de que `appsettings.Production.json` tenga:
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=SQL5113.site4now.net;Database=db_aae4a2_mdayuda;..."
  },
  "DatabaseProvider": "SqlServer"
}
```

### Paso 5: Reiniciar el sitio
1. Iniciar el sitio en IIS
2. Las migraciones se ejecutarán automáticamente

### Paso 6: Verificar funcionamiento
```bash
# Debe devolver datos, no error 500
curl http://rhayalcantara-002-site1.ntempurl.com/api/tickets/estadisticas

# Debe devolver lista de categorías
curl http://rhayalcantara-002-site1.ntempurl.com/api/categorias

# Nuevo endpoint de diagnóstico (requiere login admin)
curl http://rhayalcantara-002-site1.ntempurl.com/api/diagnostico/estructura-bd
```

---

## Script de Migración SQL

### Archivo: `migracion-produccion.sql`

Este script agrega las columnas y tablas faltantes en la base de datos de producción:

**Columnas agregadas a Tickets:**
- `IsDeleted` (BIT) - Soft delete flag
- `DeletedAt` (DATETIME2) - Fecha de eliminación
- `DeletedById` (INT) - Usuario que eliminó
- `FechaPrimeraRespuesta` (DATETIME2) - Primera respuesta
- `FechaResolucion` (DATETIME2) - Fecha resolución

**Tablas nuevas:**
- `TicketHistoriales` - Historial de cambios en tickets
- `ConfiguracionesSistema` - Configuración del sistema
- `ConfiguracionesSLA` - Tiempos de SLA por prioridad

### Cómo ejecutar:
1. Acceder al panel de Site4Now
2. Ir a la sección de base de datos SQL Server
3. Abrir el Query Manager o usar SSMS
4. Copiar y ejecutar el contenido de `migracion-produccion.sql`
5. Reiniciar el sitio web

---

## Historial de Despliegues

| Fecha | Paquete | Cambios |
|-------|---------|---------|
| 2026-01-10 | MDAyuda-deploy-completo.zip | Fix errores 500, DiagnosticoController |
| 2026-01-10 | migracion-produccion.sql | Columnas IsDeleted, TicketHistoriales, ConfiguracionesSLA |
