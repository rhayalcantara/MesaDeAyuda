using System.Net;
using System.Text.Json;

namespace MDAyuda.API.Middleware;

public class ErrorHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ErrorHandlingMiddleware> _logger;

    public ErrorHandlingMiddleware(RequestDelegate next, ILogger<ErrorHandlingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            await HandleExceptionAsync(context, ex);
        }
    }

    private async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        _logger.LogError(exception, "An unhandled exception occurred");

        var response = context.Response;
        response.ContentType = "application/json";

        var (statusCode, message) = exception switch
        {
            UnauthorizedAccessException => (HttpStatusCode.Unauthorized, "No autorizado"),
            KeyNotFoundException => (HttpStatusCode.NotFound, "Recurso no encontrado"),
            ArgumentException ex => (HttpStatusCode.BadRequest, ex.Message),
            InvalidOperationException ex => (HttpStatusCode.BadRequest, ex.Message),
            _ => (HttpStatusCode.InternalServerError, "Ocurrio un error interno. Por favor intente mas tarde.")
        };

        response.StatusCode = (int)statusCode;

        var result = JsonSerializer.Serialize(new
        {
            message,
            statusCode = (int)statusCode
        });

        await response.WriteAsync(result);
    }
}
