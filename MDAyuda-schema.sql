IF OBJECT_ID(N'[__EFMigrationsHistory]') IS NULL
BEGIN
    CREATE TABLE [__EFMigrationsHistory] (
        [MigrationId] nvarchar(150) NOT NULL,
        [ProductVersion] nvarchar(32) NOT NULL,
        CONSTRAINT [PK___EFMigrationsHistory] PRIMARY KEY ([MigrationId])
    );
END;
GO

BEGIN TRANSACTION;
IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260108033918_InitialCreate'
)
BEGIN
    CREATE TABLE [Categorias] (
        [Id] int NOT NULL IDENTITY,
        [Nombre] nvarchar(100) NOT NULL,
        [Descripcion] nvarchar(500) NULL,
        [Activa] bit NOT NULL,
        [FechaCreacion] datetime2 NOT NULL,
        CONSTRAINT [PK_Categorias] PRIMARY KEY ([Id])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260108033918_InitialCreate'
)
BEGIN
    CREATE TABLE [ConfiguracionesSistema] (
        [Id] int NOT NULL IDENTITY,
        [Clave] nvarchar(100) NOT NULL,
        [Valor] nvarchar(500) NOT NULL,
        [Descripcion] nvarchar(200) NULL,
        CONSTRAINT [PK_ConfiguracionesSistema] PRIMARY KEY ([Id])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260108033918_InitialCreate'
)
BEGIN
    CREATE TABLE [ConfiguracionesSLA] (
        [Id] int NOT NULL IDENTITY,
        [Prioridad] nvarchar(10) NOT NULL,
        [TiempoRespuestaHoras] int NOT NULL,
        [TiempoResolucionHoras] int NOT NULL,
        CONSTRAINT [PK_ConfiguracionesSLA] PRIMARY KEY ([Id])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260108033918_InitialCreate'
)
BEGIN
    CREATE TABLE [Empresas] (
        [Id] int NOT NULL IDENTITY,
        [Nombre] nvarchar(100) NOT NULL,
        [ConfigVisibilidadTickets] nvarchar(20) NOT NULL,
        [LogoUrl] nvarchar(500) NULL,
        [ColorPrimario] nvarchar(7) NULL,
        [Activa] bit NOT NULL,
        [FechaCreacion] datetime2 NOT NULL,
        [FechaActualizacion] datetime2 NOT NULL,
        CONSTRAINT [PK_Empresas] PRIMARY KEY ([Id])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260108033918_InitialCreate'
)
BEGIN
    CREATE TABLE [Usuarios] (
        [Id] int NOT NULL IDENTITY,
        [Email] nvarchar(255) NOT NULL,
        [PasswordHash] nvarchar(500) NOT NULL,
        [Nombre] nvarchar(100) NOT NULL,
        [Rol] nvarchar(20) NOT NULL,
        [EmpresaId] int NULL,
        [Activo] bit NOT NULL,
        [RequiereCambioPassword] bit NOT NULL,
        [FechaCreacion] datetime2 NOT NULL,
        [FechaActualizacion] datetime2 NOT NULL,
        [UltimoAcceso] datetime2 NULL,
        CONSTRAINT [PK_Usuarios] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_Usuarios_Empresas_EmpresaId] FOREIGN KEY ([EmpresaId]) REFERENCES [Empresas] ([Id]) ON DELETE SET NULL
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260108033918_InitialCreate'
)
BEGIN
    CREATE TABLE [SolicitudesRegistro] (
        [Id] int NOT NULL IDENTITY,
        [Email] nvarchar(255) NOT NULL,
        [Nombre] nvarchar(100) NOT NULL,
        [EmpresaId] int NOT NULL,
        [Estado] nvarchar(20) NOT NULL,
        [FechaSolicitud] datetime2 NOT NULL,
        [FechaResolucion] datetime2 NULL,
        [AprobadoPorId] int NULL,
        CONSTRAINT [PK_SolicitudesRegistro] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_SolicitudesRegistro_Empresas_EmpresaId] FOREIGN KEY ([EmpresaId]) REFERENCES [Empresas] ([Id]) ON DELETE CASCADE,
        CONSTRAINT [FK_SolicitudesRegistro_Usuarios_AprobadoPorId] FOREIGN KEY ([AprobadoPorId]) REFERENCES [Usuarios] ([Id]) ON DELETE SET NULL
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260108033918_InitialCreate'
)
BEGIN
    CREATE TABLE [Tickets] (
        [Id] int NOT NULL IDENTITY,
        [Titulo] nvarchar(200) NOT NULL,
        [Descripcion] nvarchar(max) NOT NULL,
        [ClienteId] int NOT NULL,
        [EmpleadoAsignadoId] int NULL,
        [CategoriaId] int NOT NULL,
        [Prioridad] nvarchar(10) NOT NULL,
        [Estado] nvarchar(20) NOT NULL,
        [FechaCreacion] datetime2 NOT NULL,
        [FechaActualizacion] datetime2 NOT NULL,
        [FechaPrimeraRespuesta] datetime2 NULL,
        [FechaResolucion] datetime2 NULL,
        CONSTRAINT [PK_Tickets] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_Tickets_Categorias_CategoriaId] FOREIGN KEY ([CategoriaId]) REFERENCES [Categorias] ([Id]) ON DELETE NO ACTION,
        CONSTRAINT [FK_Tickets_Usuarios_ClienteId] FOREIGN KEY ([ClienteId]) REFERENCES [Usuarios] ([Id]) ON DELETE NO ACTION,
        CONSTRAINT [FK_Tickets_Usuarios_EmpleadoAsignadoId] FOREIGN KEY ([EmpleadoAsignadoId]) REFERENCES [Usuarios] ([Id]) ON DELETE SET NULL
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260108033918_InitialCreate'
)
BEGIN
    CREATE TABLE [Comentarios] (
        [Id] int NOT NULL IDENTITY,
        [TicketId] int NOT NULL,
        [UsuarioId] int NOT NULL,
        [Texto] nvarchar(max) NOT NULL,
        [FechaCreacion] datetime2 NOT NULL,
        CONSTRAINT [PK_Comentarios] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_Comentarios_Tickets_TicketId] FOREIGN KEY ([TicketId]) REFERENCES [Tickets] ([Id]) ON DELETE CASCADE,
        CONSTRAINT [FK_Comentarios_Usuarios_UsuarioId] FOREIGN KEY ([UsuarioId]) REFERENCES [Usuarios] ([Id]) ON DELETE NO ACTION
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260108033918_InitialCreate'
)
BEGIN
    CREATE TABLE [Archivos] (
        [Id] int NOT NULL IDENTITY,
        [TicketId] int NOT NULL,
        [ComentarioId] int NULL,
        [NombreOriginal] nvarchar(255) NOT NULL,
        [NombreAlmacenado] nvarchar(255) NOT NULL,
        [TipoMime] nvarchar(100) NOT NULL,
        [Tamanio] bigint NOT NULL,
        [SubidoPorId] int NOT NULL,
        [FechaSubida] datetime2 NOT NULL,
        CONSTRAINT [PK_Archivos] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_Archivos_Comentarios_ComentarioId] FOREIGN KEY ([ComentarioId]) REFERENCES [Comentarios] ([Id]) ON DELETE SET NULL,
        CONSTRAINT [FK_Archivos_Tickets_TicketId] FOREIGN KEY ([TicketId]) REFERENCES [Tickets] ([Id]) ON DELETE CASCADE,
        CONSTRAINT [FK_Archivos_Usuarios_SubidoPorId] FOREIGN KEY ([SubidoPorId]) REFERENCES [Usuarios] ([Id]) ON DELETE NO ACTION
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260108033918_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_Archivos_ComentarioId] ON [Archivos] ([ComentarioId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260108033918_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_Archivos_SubidoPorId] ON [Archivos] ([SubidoPorId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260108033918_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_Archivos_TicketId] ON [Archivos] ([TicketId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260108033918_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_Comentarios_TicketId] ON [Comentarios] ([TicketId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260108033918_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_Comentarios_UsuarioId] ON [Comentarios] ([UsuarioId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260108033918_InitialCreate'
)
BEGIN
    CREATE UNIQUE INDEX [IX_ConfiguracionesSistema_Clave] ON [ConfiguracionesSistema] ([Clave]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260108033918_InitialCreate'
)
BEGIN
    CREATE UNIQUE INDEX [IX_ConfiguracionesSLA_Prioridad] ON [ConfiguracionesSLA] ([Prioridad]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260108033918_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_SolicitudesRegistro_AprobadoPorId] ON [SolicitudesRegistro] ([AprobadoPorId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260108033918_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_SolicitudesRegistro_EmpresaId] ON [SolicitudesRegistro] ([EmpresaId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260108033918_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_Tickets_CategoriaId] ON [Tickets] ([CategoriaId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260108033918_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_Tickets_ClienteId] ON [Tickets] ([ClienteId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260108033918_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_Tickets_EmpleadoAsignadoId] ON [Tickets] ([EmpleadoAsignadoId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260108033918_InitialCreate'
)
BEGIN
    CREATE UNIQUE INDEX [IX_Usuarios_Email] ON [Usuarios] ([Email]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260108033918_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_Usuarios_EmpresaId] ON [Usuarios] ([EmpresaId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260108033918_InitialCreate'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20260108033918_InitialCreate', N'9.0.0');
END;

COMMIT;
GO

