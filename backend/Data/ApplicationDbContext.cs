using Microsoft.EntityFrameworkCore;
using MDAyuda.API.Models;

namespace MDAyuda.API.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public DbSet<Empresa> Empresas { get; set; }
    public DbSet<Usuario> Usuarios { get; set; }
    public DbSet<SolicitudRegistro> SolicitudesRegistro { get; set; }
    public DbSet<Categoria> Categorias { get; set; }
    public DbSet<Ticket> Tickets { get; set; }
    public DbSet<Comentario> Comentarios { get; set; }
    public DbSet<Archivo> Archivos { get; set; }
    public DbSet<ConfiguracionSLA> ConfiguracionesSLA { get; set; }
    public DbSet<ConfiguracionSistema> ConfiguracionesSistema { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // For SQLite, ignore the RowVersion column as SQLite doesn't support [Timestamp]
        // This prevents "no such column: t.RowVersion" errors
        modelBuilder.Entity<Ticket>().Ignore(t => t.RowVersion);

        // Configure unique constraints
        modelBuilder.Entity<Usuario>()
            .HasIndex(u => u.Email)
            .IsUnique();

        modelBuilder.Entity<ConfiguracionSistema>()
            .HasIndex(c => c.Clave)
            .IsUnique();

        modelBuilder.Entity<ConfiguracionSLA>()
            .HasIndex(c => c.Prioridad)
            .IsUnique();

        // Configure relationships
        modelBuilder.Entity<Usuario>()
            .HasOne(u => u.Empresa)
            .WithMany(e => e.Usuarios)
            .HasForeignKey(u => u.EmpresaId)
            .OnDelete(DeleteBehavior.SetNull);

        modelBuilder.Entity<SolicitudRegistro>()
            .HasOne(s => s.Empresa)
            .WithMany(e => e.SolicitudesRegistro)
            .HasForeignKey(s => s.EmpresaId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<SolicitudRegistro>()
            .HasOne(s => s.AprobadoPor)
            .WithMany()
            .HasForeignKey(s => s.AprobadoPorId)
            .OnDelete(DeleteBehavior.SetNull);

        modelBuilder.Entity<Ticket>()
            .HasOne(t => t.Cliente)
            .WithMany(u => u.TicketsCreados)
            .HasForeignKey(t => t.ClienteId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Ticket>()
            .HasOne(t => t.EmpleadoAsignado)
            .WithMany(u => u.TicketsAsignados)
            .HasForeignKey(t => t.EmpleadoAsignadoId)
            .OnDelete(DeleteBehavior.SetNull);

        modelBuilder.Entity<Ticket>()
            .HasOne(t => t.Categoria)
            .WithMany(c => c.Tickets)
            .HasForeignKey(t => t.CategoriaId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Comentario>()
            .HasOne(c => c.Ticket)
            .WithMany(t => t.Comentarios)
            .HasForeignKey(c => c.TicketId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Comentario>()
            .HasOne(c => c.Usuario)
            .WithMany(u => u.Comentarios)
            .HasForeignKey(c => c.UsuarioId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Archivo>()
            .HasOne(a => a.Ticket)
            .WithMany(t => t.Archivos)
            .HasForeignKey(a => a.TicketId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Archivo>()
            .HasOne(a => a.Comentario)
            .WithMany(c => c.Archivos)
            .HasForeignKey(a => a.ComentarioId)
            .OnDelete(DeleteBehavior.SetNull);

        modelBuilder.Entity<Archivo>()
            .HasOne(a => a.SubidoPor)
            .WithMany(u => u.Archivos)
            .HasForeignKey(a => a.SubidoPorId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
