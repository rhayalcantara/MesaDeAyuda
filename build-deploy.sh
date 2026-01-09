#!/bin/bash

# MDAyuda - Script de Build para Deployment Unificado
# Este script genera todos los archivos necesarios para deployment en IIS

set -e

echo "========================================="
echo "MDAyuda - Build para Deployment Unificado"
echo "========================================="

# Directorio raiz del proyecto
PROJECT_ROOT="$(cd "$(dirname "$0")" && pwd)"
DEPLOY_DIR="$PROJECT_ROOT/deploy"
FRONTEND_DIR="$PROJECT_ROOT/frontend"
BACKEND_DIR="$PROJECT_ROOT/backend"

# Limpiar builds anteriores
echo ""
echo "[1/4] Limpiando builds anteriores..."
rm -rf "$DEPLOY_DIR"
rm -rf "$FRONTEND_DIR/out"
rm -rf "$FRONTEND_DIR/.next"

# Build frontend
echo ""
echo "[2/4] Construyendo frontend (Next.js)..."
cd "$FRONTEND_DIR"

if [ ! -d "node_modules" ]; then
    echo "     Instalando dependencias de npm..."
    npm install
fi

# Temporarily rename .env.local to prevent it from overriding .env.production
# This ensures the production build uses relative API URLs (/api) instead of localhost
if [ -f ".env.local" ]; then
    echo "     Moviendo .env.local temporalmente para build de produccion..."
    mv .env.local .env.local.bak
    RESTORE_ENV_LOCAL=true
fi

echo "     Ejecutando build..."
npm run build

# Restore .env.local for local development
if [ "$RESTORE_ENV_LOCAL" = true ] && [ -f ".env.local.bak" ]; then
    echo "     Restaurando .env.local..."
    mv .env.local.bak .env.local
fi

# Build backend
echo ""
echo "[3/4] Construyendo backend (ASP.NET Core)..."
cd "$BACKEND_DIR"

echo "     Restaurando paquetes NuGet..."
dotnet restore

echo "     Publicando para produccion..."
dotnet publish -c Release -o "$DEPLOY_DIR"

# Combinar frontend y backend
echo ""
echo "[4/4] Combinando frontend y backend..."

# Crear directorio wwwroot si no existe
mkdir -p "$DEPLOY_DIR/wwwroot"

# Copiar frontend exportado a wwwroot
echo "     Copiando archivos del frontend..."
cp -r "$FRONTEND_DIR/out/"* "$DEPLOY_DIR/wwwroot/"

# Copiar web.config
cp "$BACKEND_DIR/web.config" "$DEPLOY_DIR/"

# Crear directorio de uploads
mkdir -p "$DEPLOY_DIR/wwwroot/uploads"

# Crear directorio de logs
mkdir -p "$DEPLOY_DIR/logs"

echo ""
echo "========================================="
echo "Build completado exitosamente!"
echo "========================================="
echo ""
echo "Los archivos de deployment estan en:"
echo "  $DEPLOY_DIR"
echo ""
echo "Estructura generada:"
find "$DEPLOY_DIR" -maxdepth 2 -type f | head -20
echo "  ..."
echo ""
echo "Proximos pasos:"
echo "  1. Copiar la carpeta 'deploy' al servidor IIS"
echo "  2. Configurar appsettings.Production.json"
echo "  3. Configurar el sitio en IIS"
echo "  4. Ver DEPLOYMENT.md para instrucciones detalladas"
