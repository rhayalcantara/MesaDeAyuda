using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MDAyuda.API.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Categorias",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Nombre = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Descripcion = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    Activa = table.Column<bool>(type: "bit", nullable: false),
                    FechaCreacion = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Categorias", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ConfiguracionesSistema",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Clave = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Valor = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    Descripcion = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ConfiguracionesSistema", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ConfiguracionesSLA",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Prioridad = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    TiempoRespuestaHoras = table.Column<int>(type: "int", nullable: false),
                    TiempoResolucionHoras = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ConfiguracionesSLA", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Empresas",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Nombre = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    ConfigVisibilidadTickets = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    LogoUrl = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    ColorPrimario = table.Column<string>(type: "nvarchar(7)", maxLength: 7, nullable: true),
                    Activa = table.Column<bool>(type: "bit", nullable: false),
                    FechaCreacion = table.Column<DateTime>(type: "datetime2", nullable: false),
                    FechaActualizacion = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Empresas", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Usuarios",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Email = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    PasswordHash = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    Nombre = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Rol = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    EmpresaId = table.Column<int>(type: "int", nullable: true),
                    Activo = table.Column<bool>(type: "bit", nullable: false),
                    RequiereCambioPassword = table.Column<bool>(type: "bit", nullable: false),
                    FechaCreacion = table.Column<DateTime>(type: "datetime2", nullable: false),
                    FechaActualizacion = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UltimoAcceso = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Usuarios", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Usuarios_Empresas_EmpresaId",
                        column: x => x.EmpresaId,
                        principalTable: "Empresas",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "SolicitudesRegistro",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Email = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    Nombre = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    EmpresaId = table.Column<int>(type: "int", nullable: false),
                    Estado = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    FechaSolicitud = table.Column<DateTime>(type: "datetime2", nullable: false),
                    FechaResolucion = table.Column<DateTime>(type: "datetime2", nullable: true),
                    AprobadoPorId = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SolicitudesRegistro", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SolicitudesRegistro_Empresas_EmpresaId",
                        column: x => x.EmpresaId,
                        principalTable: "Empresas",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_SolicitudesRegistro_Usuarios_AprobadoPorId",
                        column: x => x.AprobadoPorId,
                        principalTable: "Usuarios",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "Tickets",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Titulo = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Descripcion = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ClienteId = table.Column<int>(type: "int", nullable: false),
                    EmpleadoAsignadoId = table.Column<int>(type: "int", nullable: true),
                    CategoriaId = table.Column<int>(type: "int", nullable: false),
                    Prioridad = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    Estado = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    FechaCreacion = table.Column<DateTime>(type: "datetime2", nullable: false),
                    FechaActualizacion = table.Column<DateTime>(type: "datetime2", nullable: false),
                    FechaPrimeraRespuesta = table.Column<DateTime>(type: "datetime2", nullable: true),
                    FechaResolucion = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Tickets", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Tickets_Categorias_CategoriaId",
                        column: x => x.CategoriaId,
                        principalTable: "Categorias",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Tickets_Usuarios_ClienteId",
                        column: x => x.ClienteId,
                        principalTable: "Usuarios",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Tickets_Usuarios_EmpleadoAsignadoId",
                        column: x => x.EmpleadoAsignadoId,
                        principalTable: "Usuarios",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "Comentarios",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TicketId = table.Column<int>(type: "int", nullable: false),
                    UsuarioId = table.Column<int>(type: "int", nullable: false),
                    Texto = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    FechaCreacion = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Comentarios", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Comentarios_Tickets_TicketId",
                        column: x => x.TicketId,
                        principalTable: "Tickets",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Comentarios_Usuarios_UsuarioId",
                        column: x => x.UsuarioId,
                        principalTable: "Usuarios",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Archivos",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TicketId = table.Column<int>(type: "int", nullable: false),
                    ComentarioId = table.Column<int>(type: "int", nullable: true),
                    NombreOriginal = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    NombreAlmacenado = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    TipoMime = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Tamanio = table.Column<long>(type: "bigint", nullable: false),
                    SubidoPorId = table.Column<int>(type: "int", nullable: false),
                    FechaSubida = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Archivos", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Archivos_Comentarios_ComentarioId",
                        column: x => x.ComentarioId,
                        principalTable: "Comentarios",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_Archivos_Tickets_TicketId",
                        column: x => x.TicketId,
                        principalTable: "Tickets",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Archivos_Usuarios_SubidoPorId",
                        column: x => x.SubidoPorId,
                        principalTable: "Usuarios",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Archivos_ComentarioId",
                table: "Archivos",
                column: "ComentarioId");

            migrationBuilder.CreateIndex(
                name: "IX_Archivos_SubidoPorId",
                table: "Archivos",
                column: "SubidoPorId");

            migrationBuilder.CreateIndex(
                name: "IX_Archivos_TicketId",
                table: "Archivos",
                column: "TicketId");

            migrationBuilder.CreateIndex(
                name: "IX_Comentarios_TicketId",
                table: "Comentarios",
                column: "TicketId");

            migrationBuilder.CreateIndex(
                name: "IX_Comentarios_UsuarioId",
                table: "Comentarios",
                column: "UsuarioId");

            migrationBuilder.CreateIndex(
                name: "IX_ConfiguracionesSistema_Clave",
                table: "ConfiguracionesSistema",
                column: "Clave",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ConfiguracionesSLA_Prioridad",
                table: "ConfiguracionesSLA",
                column: "Prioridad",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_SolicitudesRegistro_AprobadoPorId",
                table: "SolicitudesRegistro",
                column: "AprobadoPorId");

            migrationBuilder.CreateIndex(
                name: "IX_SolicitudesRegistro_EmpresaId",
                table: "SolicitudesRegistro",
                column: "EmpresaId");

            migrationBuilder.CreateIndex(
                name: "IX_Tickets_CategoriaId",
                table: "Tickets",
                column: "CategoriaId");

            migrationBuilder.CreateIndex(
                name: "IX_Tickets_ClienteId",
                table: "Tickets",
                column: "ClienteId");

            migrationBuilder.CreateIndex(
                name: "IX_Tickets_EmpleadoAsignadoId",
                table: "Tickets",
                column: "EmpleadoAsignadoId");

            migrationBuilder.CreateIndex(
                name: "IX_Usuarios_Email",
                table: "Usuarios",
                column: "Email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Usuarios_EmpresaId",
                table: "Usuarios",
                column: "EmpresaId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Archivos");

            migrationBuilder.DropTable(
                name: "ConfiguracionesSistema");

            migrationBuilder.DropTable(
                name: "ConfiguracionesSLA");

            migrationBuilder.DropTable(
                name: "SolicitudesRegistro");

            migrationBuilder.DropTable(
                name: "Comentarios");

            migrationBuilder.DropTable(
                name: "Tickets");

            migrationBuilder.DropTable(
                name: "Categorias");

            migrationBuilder.DropTable(
                name: "Usuarios");

            migrationBuilder.DropTable(
                name: "Empresas");
        }
    }
}
