# MDAyuda - Sistema de Mesa de Ayuda

Sistema de mesa de ayuda donde clientes de multiples empresas pueden reportar problemas o situaciones con sus sistemas. Los empleados atienden estos tickets, mantienen conversaciones con los clientes, y resuelven los problemas.

## Caracteristicas Principales

- **Gestion de Tickets**: Crear, editar, asignar y resolver tickets con seguimiento completo
- **Roles de Usuario**: Administrador, Empleado y Cliente con permisos diferenciados
- **Multi-empresa**: Soporte para multiples empresas con visibilidad configurable
- **Conversaciones**: Comentarios y archivos adjuntos en cada ticket
- **SLA**: Configuracion de tiempos de respuesta y resolucion por prioridad
- **Notificaciones**: Correos automaticos en eventos clave
- **Dashboards**: Estadisticas y reportes en tiempo real
- **Personalizacion**: Temas claro/oscuro, colores configurables

## Stack Tecnologico

### Frontend
- **Next.js** con TypeScript
- **Tailwind CSS** para estilos
- **Zustand / React Context** para estado

### Backend
- **ASP.NET Core** con C#
- **Entity Framework Core** como ORM
- **SQL Server** para base de datos

## Requisitos Previos

- .NET SDK 8.0 o superior
- Node.js 18+ y npm
- SQL Server (LocalDB para desarrollo)
- Editor de codigo (VS Code recomendado)

## Instalacion

### 1. Clonar el repositorio

```bash
git clone <repository-url>
cd MesaDeAyuda
```

### 2. Ejecutar script de setup

```bash
./init.sh
```

O para instalar sin iniciar servidores:

```bash
./init.sh --no-start
```

### 3. Configuracion manual (alternativa)

#### Backend

```bash
cd backend
dotnet restore
dotnet ef database update
dotnet run
```

#### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Estructura del Proyecto

```
MesaDeAyuda/
├── backend/                    # ASP.NET Core API
│   ├── Controllers/            # Controladores API
│   ├── Models/                 # Modelos de Entity Framework
│   ├── Services/               # Logica de negocio
│   ├── Data/                   # Contexto de base de datos
│   └── Migrations/             # Migraciones de EF Core
│
├── frontend/                   # Next.js App
│   ├── src/
│   │   ├── app/               # App Router de Next.js
│   │   ├── components/        # Componentes React
│   │   ├── hooks/             # Custom hooks
│   │   ├── lib/               # Utilidades y API client
│   │   └── types/             # Tipos TypeScript
│   └── public/                # Archivos estaticos
│
├── init.sh                    # Script de setup
├── features.db                # Base de datos de features (desarrollo)
└── README.md                  # Este archivo
```

## Roles y Permisos

### Administrador
- Gestion completa de empleados (CRUD)
- Gestion de empresas y clientes
- Configuracion de categorias y SLA
- Acceso a todos los reportes
- Configuracion del sistema

### Empleado
- Ver y gestionar tickets
- Asignarse tickets
- Agregar comentarios
- Cambiar estados de tickets
- Aprobar solicitudes de registro

### Cliente
- Crear nuevos tickets
- Ver sus propios tickets
- Agregar comentarios y archivos
- Filtrar y buscar tickets

## URLs de Desarrollo

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000/api
- **Swagger**: http://localhost:5000/swagger

## Variables de Entorno

### Frontend (frontend/.env.local)

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_ENABLE_DARK_MODE=true
```

### Backend (backend/appsettings.Development.json)

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=(localdb)\\mssqllocaldb;Database=MDAyuda;Trusted_Connection=True;"
  },
  "Jwt": {
    "Key": "your-secret-key-here-min-32-chars",
    "Issuer": "MDAyuda",
    "Audience": "MDAyuda",
    "ExpirationMinutes": 60
  },
  "Email": {
    "SmtpServer": "smtp.example.com",
    "Port": 587,
    "Username": "user@example.com",
    "Password": "password"
  }
}
```

## Endpoints API Principales

### Autenticacion
- `POST /api/auth/login` - Iniciar sesion
- `POST /api/auth/logout` - Cerrar sesion
- `POST /api/auth/cambiar-password` - Cambiar contrasena
- `GET /api/auth/me` - Obtener usuario actual

### Tickets
- `GET /api/tickets` - Listar tickets
- `POST /api/tickets` - Crear ticket
- `GET /api/tickets/{id}` - Ver ticket
- `PUT /api/tickets/{id}` - Actualizar ticket
- `PUT /api/tickets/{id}/asignar` - Asignar ticket
- `PUT /api/tickets/{id}/estado` - Cambiar estado

### Empresas, Usuarios, Categorias
- CRUD completo en `/api/empresas`, `/api/usuarios`, `/api/categorias`

## Contribucion

1. Crear feature branch: `git checkout -b feature/nueva-funcionalidad`
2. Realizar cambios y commits
3. Push a la rama: `git push origin feature/nueva-funcionalidad`
4. Crear Pull Request

## Licencia

Este proyecto es de uso interno.
