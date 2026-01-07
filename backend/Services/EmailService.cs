using System.Net;
using System.Net.Mail;

namespace MDAyuda.API.Services;

public class EmailService : IEmailService
{
    private readonly IConfiguration _configuration;
    private readonly ILogger<EmailService> _logger;

    public EmailService(IConfiguration configuration, ILogger<EmailService> logger)
    {
        _configuration = configuration;
        _logger = logger;
    }

    public async Task SendEmailAsync(string to, string subject, string body)
    {
        try
        {
            var emailSettings = _configuration.GetSection("Email");
            var smtpServer = emailSettings["SmtpServer"];
            var port = int.Parse(emailSettings["Port"] ?? "587");
            var username = emailSettings["Username"];
            var password = emailSettings["Password"];
            var fromEmail = emailSettings["FromEmail"];
            var fromName = emailSettings["FromName"];

            using var client = new SmtpClient(smtpServer, port)
            {
                EnableSsl = true,
                Credentials = new NetworkCredential(username, password)
            };

            var mailMessage = new MailMessage
            {
                From = new MailAddress(fromEmail!, fromName),
                Subject = subject,
                Body = body,
                IsBodyHtml = true
            };

            mailMessage.To.Add(to);

            await client.SendMailAsync(mailMessage);
            _logger.LogInformation("Email sent successfully to {To}", to);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send email to {To}", to);
            // Don't throw - email failures shouldn't break the main flow
        }
    }

    public async Task SendRegistrationApprovedEmailAsync(string to, string nombre, string temporaryPassword)
    {
        var subject = "Bienvenido a MDAyuda - Registro Aprobado";
        var body = $@"
            <html>
            <body style='font-family: Arial, sans-serif;'>
                <h2>Bienvenido a MDAyuda, {nombre}!</h2>
                <p>Tu solicitud de registro ha sido aprobada.</p>
                <p>Puedes iniciar sesion con los siguientes datos:</p>
                <ul>
                    <li><strong>Correo:</strong> {to}</li>
                    <li><strong>Contrasena temporal:</strong> {temporaryPassword}</li>
                </ul>
                <p><strong>Importante:</strong> Deberas cambiar tu contrasena en el primer inicio de sesion.</p>
                <p>Accede al sistema: <a href='http://localhost:3000/login'>Iniciar sesion</a></p>
                <hr>
                <p style='color: #666; font-size: 12px;'>Este es un mensaje automatico. Por favor no responda a este correo.</p>
            </body>
            </html>";

        await SendEmailAsync(to, subject, body);
    }

    public async Task SendTicketCreatedEmailAsync(string to, string ticketTitle, int ticketId)
    {
        var subject = $"Nuevo Ticket #{ticketId}: {ticketTitle}";
        var body = $@"
            <html>
            <body style='font-family: Arial, sans-serif;'>
                <h2>Nuevo Ticket Creado</h2>
                <p>Se ha creado un nuevo ticket que requiere atencion:</p>
                <ul>
                    <li><strong>Ticket ID:</strong> #{ticketId}</li>
                    <li><strong>Titulo:</strong> {ticketTitle}</li>
                </ul>
                <p><a href='http://localhost:3000/tickets/{ticketId}'>Ver ticket</a></p>
                <hr>
                <p style='color: #666; font-size: 12px;'>Este es un mensaje automatico de MDAyuda.</p>
            </body>
            </html>";

        await SendEmailAsync(to, subject, body);
    }

    public async Task SendTicketCommentEmailAsync(string to, string ticketTitle, int ticketId, string commenterName)
    {
        var subject = $"Nuevo comentario en Ticket #{ticketId}: {ticketTitle}";
        var body = $@"
            <html>
            <body style='font-family: Arial, sans-serif;'>
                <h2>Nuevo Comentario en tu Ticket</h2>
                <p>{commenterName} ha agregado un comentario a tu ticket:</p>
                <ul>
                    <li><strong>Ticket ID:</strong> #{ticketId}</li>
                    <li><strong>Titulo:</strong> {ticketTitle}</li>
                </ul>
                <p><a href='http://localhost:3000/tickets/{ticketId}'>Ver ticket</a></p>
                <hr>
                <p style='color: #666; font-size: 12px;'>Este es un mensaje automatico de MDAyuda.</p>
            </body>
            </html>";

        await SendEmailAsync(to, subject, body);
    }

    public async Task SendTicketResolvedEmailAsync(string to, string ticketTitle, int ticketId)
    {
        var subject = $"Ticket #{ticketId} Resuelto: {ticketTitle}";
        var body = $@"
            <html>
            <body style='font-family: Arial, sans-serif;'>
                <h2>Tu Ticket ha sido Resuelto</h2>
                <p>Te informamos que tu ticket ha sido marcado como resuelto:</p>
                <ul>
                    <li><strong>Ticket ID:</strong> #{ticketId}</li>
                    <li><strong>Titulo:</strong> {ticketTitle}</li>
                </ul>
                <p>Si tienes alguna pregunta adicional, puedes agregar un comentario al ticket.</p>
                <p><a href='http://localhost:3000/tickets/{ticketId}'>Ver ticket</a></p>
                <hr>
                <p style='color: #666; font-size: 12px;'>Este es un mensaje automatico de MDAyuda.</p>
            </body>
            </html>";

        await SendEmailAsync(to, subject, body);
    }
}
