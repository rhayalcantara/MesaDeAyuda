# MDAyuda - Script de Build para Deployment Unificado (PowerShell)
# Este script genera todos los archivos necesarios para deployment en IIS

$ErrorActionPreference = "Stop"

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "MDAyuda - Build para Deployment Unificado" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan

# Directorio raiz del proyecto
$ProjectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$DeployDir = Join-Path $ProjectRoot "deploy"
$FrontendDir = Join-Path $ProjectRoot "frontend"
$BackendDir = Join-Path $ProjectRoot "backend"

# Limpiar builds anteriores
Write-Host ""
Write-Host "[1/4] Limpiando builds anteriores..." -ForegroundColor Yellow
if (Test-Path $DeployDir) {
    Remove-Item -Recurse -Force $DeployDir
}
$FrontendOut = Join-Path $FrontendDir "out"
$FrontendNext = Join-Path $FrontendDir ".next"
if (Test-Path $FrontendOut) {
    Remove-Item -Recurse -Force $FrontendOut
}
if (Test-Path $FrontendNext) {
    Remove-Item -Recurse -Force $FrontendNext
}

# Build frontend
Write-Host ""
Write-Host "[2/4] Construyendo frontend (Next.js)..." -ForegroundColor Yellow
Set-Location $FrontendDir

$NodeModules = Join-Path $FrontendDir "node_modules"
if (-not (Test-Path $NodeModules)) {
    Write-Host "     Instalando dependencias de npm..."
    npm install
}

Write-Host "     Ejecutando build..."
npm run build

# Build backend
Write-Host ""
Write-Host "[3/4] Construyendo backend (ASP.NET Core)..." -ForegroundColor Yellow
Set-Location $BackendDir

Write-Host "     Restaurando paquetes NuGet..."
dotnet restore

Write-Host "     Publicando para produccion..."
dotnet publish -c Release -o $DeployDir

# Combinar frontend y backend
Write-Host ""
Write-Host "[4/4] Combinando frontend y backend..." -ForegroundColor Yellow

# Crear directorio wwwroot si no existe
$WwwrootDir = Join-Path $DeployDir "wwwroot"
if (-not (Test-Path $WwwrootDir)) {
    New-Item -ItemType Directory -Path $WwwrootDir | Out-Null
}

# Copiar frontend exportado a wwwroot
Write-Host "     Copiando archivos del frontend..."
$FrontendOutPath = Join-Path $FrontendDir "out\*"
Copy-Item -Recurse -Force $FrontendOutPath $WwwrootDir

# Copiar web.config
$WebConfigSource = Join-Path $BackendDir "web.config"
Copy-Item $WebConfigSource $DeployDir

# Crear directorio de uploads
$UploadsDir = Join-Path $WwwrootDir "uploads"
if (-not (Test-Path $UploadsDir)) {
    New-Item -ItemType Directory -Path $UploadsDir | Out-Null
}

# Crear directorio de logs
$LogsDir = Join-Path $DeployDir "logs"
if (-not (Test-Path $LogsDir)) {
    New-Item -ItemType Directory -Path $LogsDir | Out-Null
}

# Volver al directorio original
Set-Location $ProjectRoot

Write-Host ""
Write-Host "=========================================" -ForegroundColor Green
Write-Host "Build completado exitosamente!" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Los archivos de deployment estan en:"
Write-Host "  $DeployDir" -ForegroundColor White
Write-Host ""
Write-Host "Estructura generada:"
Get-ChildItem -Path $DeployDir -Recurse -Depth 2 | Select-Object -First 20 | ForEach-Object {
    Write-Host "  $($_.FullName.Replace($DeployDir, ''))"
}
Write-Host "  ..."
Write-Host ""
Write-Host "Proximos pasos:" -ForegroundColor Yellow
Write-Host "  1. Copiar la carpeta 'deploy' al servidor IIS"
Write-Host "  2. Configurar appsettings.Production.json"
Write-Host "  3. Configurar el sitio en IIS"
Write-Host "  4. Ver DEPLOYMENT.md para instrucciones detalladas"
