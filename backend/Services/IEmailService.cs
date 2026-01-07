namespace MDAyuda.API.Services;

public interface IEmailService
{
    Task SendEmailAsync(string to, string subject, string body);
    Task SendRegistrationApprovedEmailAsync(string to, string nombre, string temporaryPassword);
    Task SendTicketCreatedEmailAsync(string to, string ticketTitle, int ticketId);
    Task SendTicketCommentEmailAsync(string to, string ticketTitle, int ticketId, string commenterName);
    Task SendTicketResolvedEmailAsync(string to, string ticketTitle, int ticketId);
}
