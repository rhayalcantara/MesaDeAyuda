using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Microsoft.Extensions.FileProviders;
using MDAyuda.API.Data;
using MDAyuda.API.Services;
using MDAyuda.API.Middleware;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

// Configure Swagger
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "MDAyuda API",
        Version = "v1",
        Description = "API para el sistema de mesa de ayuda MDAyuda"
    });

    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. Example: \"Authorization: Bearer {token}\"",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

// Configure Entity Framework
var dbProvider = builder.Configuration.GetValue<string>("DatabaseProvider") ?? "SqlServer";
builder.Services.AddDbContext<ApplicationDbContext>(options =>
{
    if (dbProvider == "Sqlite")
    {
        options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection"));
    }
    else
    {
        options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection"));
    }

    // Suppress pending model changes warning (migrations are managed via CLI)
    options.ConfigureWarnings(w => w.Ignore(Microsoft.EntityFrameworkCore.Diagnostics.RelationalEventId.PendingModelChangesWarning));
});

// Configure JWT Authentication
var jwtSettings = builder.Configuration.GetSection("Jwt");
var key = Encoding.ASCII.GetBytes(jwtSettings["Key"] ?? "your-secret-key-here-min-32-chars!!");

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = false;
    options.SaveToken = true;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(key),
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidIssuer = jwtSettings["Issuer"],
        ValidAudience = jwtSettings["Audience"],
        ClockSkew = TimeSpan.Zero
    };
});

// Configure Authorization Policies
builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("AdminOnly", policy => policy.RequireRole("Admin"));
    options.AddPolicy("EmpleadoOrAdmin", policy => policy.RequireRole("Admin", "Empleado"));
    options.AddPolicy("AllAuthenticated", policy => policy.RequireAuthenticatedUser());
});

// Register services
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IEmailService, EmailService>();
builder.Services.AddScoped<IFileService, FileService>();

// Configure CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        // In production with unified deployment, CORS is less critical
        // since frontend and backend are on the same origin
        var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>()
            ?? new[] { "http://localhost:3000", "http://localhost:3001" };

        policy.WithOrigins(allowedOrigins)
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials();
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "MDAyuda API v1");
    });
}

// Also enable Swagger in production if configured
var enableSwaggerInProd = builder.Configuration.GetValue<bool>("EnableSwaggerInProduction");
if (!app.Environment.IsDevelopment() && enableSwaggerInProd)
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "MDAyuda API v1");
    });
}

app.UseHttpsRedirection();

// For unified deployment, serve static files from wwwroot
// The Next.js export will be placed in wwwroot folder
var wwwrootPath = Path.Combine(app.Environment.ContentRootPath, "wwwroot");
if (Directory.Exists(wwwrootPath))
{
    app.UseDefaultFiles(new DefaultFilesOptions
    {
        FileProvider = new PhysicalFileProvider(wwwrootPath),
        DefaultFileNames = new List<string> { "index.html" }
    });

    app.UseStaticFiles(new StaticFileOptions
    {
        FileProvider = new PhysicalFileProvider(wwwrootPath),
        ServeUnknownFileTypes = false,
        OnPrepareResponse = ctx =>
        {
            // Cache static assets for 1 year
            if (ctx.File.Name.EndsWith(".js") ||
                ctx.File.Name.EndsWith(".css") ||
                ctx.File.Name.EndsWith(".woff2") ||
                ctx.File.Name.EndsWith(".png") ||
                ctx.File.Name.EndsWith(".jpg") ||
                ctx.File.Name.EndsWith(".svg"))
            {
                ctx.Context.Response.Headers.Append("Cache-Control", "public,max-age=31536000,immutable");
            }
            // Don't cache HTML files
            else if (ctx.File.Name.EndsWith(".html"))
            {
                ctx.Context.Response.Headers.Append("Cache-Control", "no-cache,no-store,must-revalidate");
            }
        }
    });
}

app.UseCors("AllowFrontend");

app.UseAuthentication();
app.UseAuthorization();

// Custom middleware for error handling
app.UseMiddleware<ErrorHandlingMiddleware>();

app.MapControllers();

// SPA fallback: Serve index.html for non-API routes that don't match static files
// This must come AFTER MapControllers
app.MapFallback(async context =>
{
    // Don't fallback for API routes - they should return 404
    if (context.Request.Path.StartsWithSegments("/api"))
    {
        context.Response.StatusCode = 404;
        await context.Response.WriteAsJsonAsync(new { error = "API endpoint not found" });
        return;
    }

    // Don't fallback for swagger
    if (context.Request.Path.StartsWithSegments("/swagger"))
    {
        context.Response.StatusCode = 404;
        return;
    }

    // Serve index.html for SPA routes
    var indexPath = Path.Combine(wwwrootPath, "index.html");
    if (File.Exists(indexPath))
    {
        context.Response.ContentType = "text/html";
        context.Response.Headers.Append("Cache-Control", "no-cache,no-store,must-revalidate");
        await context.Response.SendFileAsync(indexPath);
    }
    else
    {
        context.Response.StatusCode = 404;
        await context.Response.WriteAsync("Frontend not deployed. Please run 'npm run build' in the frontend folder and copy the 'out' folder to 'wwwroot'.");
    }
});

// Ensure database is created and seed data
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    var configuration = scope.ServiceProvider.GetRequiredService<IConfiguration>();
    var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();

    try
    {
        var provider = configuration.GetValue<string>("DatabaseProvider") ?? "SqlServer";
        if (provider == "Sqlite")
        {
            // For SQLite, use EnsureCreated (simpler for dev)
            context.Database.EnsureCreated();
        }
        else
        {
            // For SQL Server, use migrations
            context.Database.Migrate();
        }
        await DbSeeder.SeedAsync(context);
        logger.LogInformation("Database initialized successfully.");
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "An error occurred while initializing the database.");
    }
}

app.Run();
