# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Metodología de Trabajo

Seguimos este flujo de trabajo:
1. Crear un plan y discutirlo
2. Crear una lista de tareas con estados (pendiente, en progreso, finalizada)
3. Avanzar punto por punto, marcando el progreso
4. Grabar el plan y lista de tareas en un archivo

## Comandos de Desarrollo

### Backend (.NET 9)
```bash
cd backend
dotnet restore              # Restaurar dependencias
dotnet build                # Compilar
dotnet run                  # Ejecutar (puerto 5000)
dotnet ef database update   # Aplicar migraciones
dotnet ef migrations add NombreMigracion  # Nueva migración
```

### Frontend (Next.js 14)
```bash
cd frontend
npm install                 # Instalar dependencias
npm run dev                 # Desarrollo (puerto 3000)
npm run build               # Build producción
npm run lint                # ESLint
npm run type-check          # Verificar tipos TypeScript
```

### Setup Completo
```bash
./init.sh                   # Instala y ejecuta ambos servidores
./init.sh --no-start        # Solo instala, no inicia servidores
```

## Arquitectura del Proyecto

### Backend (ASP.NET Core API)
- **Controllers/**: API REST endpoints
  - `AuthController.cs`: Login, logout, cambio de contraseña
  - `TicketsController.cs`: CRUD de tickets, asignación, estados
  - `CategoriasController.cs`: Gestión de categorías
- **Models/**: Entidades EF Core (Usuario, Ticket, Empresa, Categoria, Comentario, Archivo, SolicitudRegistro, ConfiguracionSLA)
- **Services/**: Lógica de negocio (AuthService, EmailService, FileService)
- **Data/**: DbContext con configuración SQLite/SQL Server
- **DTOs/**: Data Transfer Objects para requests/responses

Base de datos: SQLite para desarrollo (`MDAyuda.db`), SQL Server para producción.

### Frontend (Next.js App Router)
- **src/app/**: Rutas con App Router
  - `admin/`: Panel administrador (empleados, empresas, categorías, SLA, reportes)
  - `empleado/`: Panel empleado (tickets, asignaciones)
  - `cliente/`: Panel cliente (mis tickets, crear ticket)
  - `login/`, `solicitar-registro/`, `cambiar-password/`: Autenticación
- **src/components/**: Componentes React
  - `layout/`: Header, Sidebar, navegación
  - `ui/`: Componentes base reutilizables
  - `forms/`: Componentes de formularios
- **src/context/**:
  - `AuthContext.tsx`: Estado de autenticación y usuario actual
  - `ThemeContext.tsx`: Tema claro/oscuro
- **src/lib/**:
  - `api.ts`: Cliente axios para backend
  - `utils.ts`: Utilidades (formateo fechas, clases CSS, etc.)
- **src/types/**: Definiciones TypeScript compartidas

### Roles de Usuario
- **Administrador**: Gestión completa (empleados, empresas, categorías, SLA, reportes)
- **Empleado**: Ver/gestionar tickets, asignarse, comentar, aprobar registros
- **Cliente**: Crear tickets, ver propios, comentar

## URLs de Desarrollo
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api
- Swagger: http://localhost:5000/swagger

## Configuración
- Frontend: `frontend/.env.local` con `NEXT_PUBLIC_API_URL`
- Backend: `backend/appsettings.json` y `appsettings.Production.json`

## Stack Tecnológico
- Backend: .NET 9, EF Core 9, JWT Auth, BCrypt
- Frontend: Next.js 14, TypeScript, Tailwind CSS, Zustand, Axios
- Base de datos: SQLite (dev) / SQL Server (prod)
