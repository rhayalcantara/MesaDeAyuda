# MDAyuda - Guia de Deployment Unificado para IIS

Este documento describe como desplegar MDAyuda como una aplicacion unificada en IIS,
donde el backend ASP.NET Core sirve tanto la API como el frontend estatico de Next.js.

## Requisitos Previos

### Servidor
- Windows Server 2016+ o Windows 10+
- IIS 10+ con ASP.NET Core Hosting Bundle instalado
- SQL Server (o SQL Server Express)
- .NET 8.0 Runtime

### Herramientas de Build
- .NET SDK 8.0
- Node.js 18+
- npm o yarn

## Arquitectura de Deployment

```
IIS Site
   |
   +-- wwwroot/
   |      +-- index.html        (Next.js export)
   |      +-- _next/            (Next.js assets)
   |      +-- login/index.html  (SPA routes)
   |      +-- admin/...         (SPA routes)
   |      +-- uploads/          (Uploaded files)
   |
   +-- MDAyuda.API.dll          (Backend)
   +-- web.config               (IIS configuration)
   +-- appsettings.json         (Configuration)
   +-- appsettings.Production.json
```

## Pasos de Build

### 1. Build del Frontend (Next.js)

```bash
cd frontend

# Instalar dependencias
npm install

# Crear build estatico
npm run build
```

Esto generara una carpeta `out/` con todos los archivos estaticos.

### 2. Build del Backend (ASP.NET Core)

```bash
cd backend

# Restaurar paquetes
dotnet restore

# Publicar para produccion
dotnet publish -c Release -o ./publish
```

Esto generara una carpeta `publish/` con el backend compilado.

### 3. Preparar Estructura de Deployment

```bash
# Crear carpeta de deployment
mkdir deploy

# Copiar backend publicado
cp -r backend/publish/* deploy/

# Copiar frontend exportado a wwwroot
mkdir -p deploy/wwwroot
cp -r frontend/out/* deploy/wwwroot/

# Copiar web.config
cp backend/web.config deploy/
```

### Script de Build Automatizado

Crear `build-deploy.sh` (o `build-deploy.ps1` para Windows):

```bash
#!/bin/bash

# Limpiar builds anteriores
rm -rf deploy

# Build frontend
echo "Building frontend..."
cd frontend
npm install
npm run build
cd ..

# Build backend
echo "Building backend..."
cd backend
dotnet restore
dotnet publish -c Release -o ../deploy
cd ..

# Copiar frontend a wwwroot
echo "Copying frontend to wwwroot..."
cp -r frontend/out/* deploy/wwwroot/

# Copiar web.config
cp backend/web.config deploy/

echo "Build completado! Los archivos estan en la carpeta 'deploy'"
```

Para Windows PowerShell (`build-deploy.ps1`):

```powershell
# Limpiar builds anteriores
if (Test-Path deploy) { Remove-Item -Recurse -Force deploy }

# Build frontend
Write-Host "Building frontend..."
Set-Location frontend
npm install
npm run build
Set-Location ..

# Build backend
Write-Host "Building backend..."
Set-Location backend
dotnet restore
dotnet publish -c Release -o ../deploy
Set-Location ..

# Copiar frontend a wwwroot
Write-Host "Copying frontend to wwwroot..."
Copy-Item -Recurse frontend/out/* deploy/wwwroot/

# Copiar web.config
Copy-Item backend/web.config deploy/

Write-Host "Build completado! Los archivos estan en la carpeta 'deploy'"
```

## Configuracion de IIS

### 1. Instalar ASP.NET Core Hosting Bundle

Descargar e instalar desde:
https://dotnet.microsoft.com/download/dotnet/8.0

### 2. Crear Sitio en IIS

1. Abrir IIS Manager
2. Click derecho en "Sites" -> "Add Website"
3. Configurar:
   - Site name: `MDAyuda`
   - Physical path: `C:\inetpub\MDAyuda` (o ruta deseada)
   - Binding: puerto 80 o configurar HTTPS
4. Click OK

### 3. Configurar Application Pool

1. Seleccionar el Application Pool creado
2. Click derecho -> "Advanced Settings"
3. Configurar:
   - .NET CLR Version: `No Managed Code`
   - Start Mode: `AlwaysRunning` (recomendado)
   - Idle Time-out: `0` (para que no se detenga)

### 4. Copiar Archivos

Copiar todo el contenido de la carpeta `deploy/` a la ruta fisica del sitio.

### 5. Configurar Base de Datos

1. Crear base de datos en SQL Server
2. Editar `appsettings.Production.json`:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=YOUR_SERVER;Database=MDAyuda;User Id=YOUR_USER;Password=YOUR_PASSWORD;TrustServerCertificate=true;"
  },
  "DatabaseProvider": "SqlServer"
}
```

### 6. Configurar JWT Secret

Generar una clave segura y configurar en `appsettings.Production.json`:

```json
{
  "Jwt": {
    "Key": "UNA_CLAVE_SEGURA_DE_AL_MENOS_32_CARACTERES_ALEATORIA"
  }
}
```

### 7. Configurar Email (Opcional)

```json
{
  "Email": {
    "SmtpServer": "smtp.tudominio.com",
    "Port": 587,
    "Username": "noreply@tudominio.com",
    "Password": "tu_password",
    "FromEmail": "noreply@tudominio.com",
    "FromName": "MDAyuda"
  }
}
```

### 8. Permisos de Carpeta

Asegurar que el Application Pool tenga permisos de escritura en:
- `wwwroot/uploads/` (para subida de archivos)
- Carpeta de logs si se habilita stdout logging

```powershell
# Dar permisos al Application Pool
icacls "C:\inetpub\MDAyuda\wwwroot\uploads" /grant "IIS AppPool\MDAyuda:(OI)(CI)M"
```

## Configuracion HTTPS

### Opcion 1: Certificado SSL en IIS

1. En IIS Manager, seleccionar el servidor
2. Click en "Server Certificates"
3. Importar o crear certificado
4. En el sitio, agregar binding HTTPS

### Opcion 2: Let's Encrypt con win-acme

```powershell
# Descargar win-acme
# https://github.com/win-acme/win-acme

# Ejecutar para obtener certificado
wacs.exe
```

## Verificacion del Deployment

### 1. Probar Acceso al Frontend

Navegar a `http://tu-servidor/` - deberia mostrar la pagina de login.

### 2. Probar Acceso a la API

```bash
curl http://tu-servidor/api/auth/me
# Deberia retornar 401 Unauthorized
```

### 3. Probar Login

Navegar a `http://tu-servidor/login` y usar:
- Email: `admin@mdayuda.com`
- Password: `Admin123!`

### 4. Verificar Swagger (si habilitado)

Navegar a `http://tu-servidor/swagger`

## Troubleshooting

### Error 500.19 - web.config invalido

- Verificar que ASP.NET Core Hosting Bundle este instalado
- Verificar sintaxis del web.config

### Error 502.5 - Proceso no inicia

- Verificar que .NET 8.0 Runtime este instalado
- Revisar logs en Event Viewer
- Habilitar stdout logging:

```xml
<aspNetCore stdoutLogEnabled="true" stdoutLogFile=".\logs\stdout">
```

### Frontend no carga (404)

- Verificar que los archivos de `frontend/out/` estan en `wwwroot/`
- Verificar que `index.html` existe en `wwwroot/`

### API retorna 404

- Verificar que los controladores estan registrados
- Verificar que la ruta incluye `/api/`

### SPA routing no funciona

- El backend maneja el fallback a `index.html`
- Verificar que `MapFallback` esta configurado en Program.cs

## Actualizaciones

Para actualizar la aplicacion:

1. Detener el sitio en IIS
2. Ejecutar build (frontend + backend)
3. Copiar archivos nuevos a la carpeta del sitio
4. Iniciar el sitio en IIS

**Nota:** No es necesario recrear la base de datos. Las migraciones se ejecutan automaticamente al iniciar.

## Variables de Entorno

Alternativamente, se pueden usar variables de entorno en lugar de appsettings:

```powershell
# En IIS Application Pool
ASPNETCORE_ENVIRONMENT=Production
ConnectionStrings__DefaultConnection=Server=...
Jwt__Key=...
```

## Monitoreo

### Logs

- Habilitar stdout logging para debugging
- Configurar logging en appsettings para produccion

### Health Check

Agregar endpoint `/api/health` para monitoreo:

```csharp
app.MapGet("/api/health", () => Results.Ok(new { status = "healthy", timestamp = DateTime.UtcNow }));
```

## Soporte

Para problemas o preguntas, revisar:
1. Event Viewer de Windows
2. Logs de IIS
3. stdout logs si habilitado
4. Network tab en DevTools del navegador
