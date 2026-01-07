using MDAyuda.API.Models;

namespace MDAyuda.API.Services;

public interface IAuthService
{
    string GenerateJwtToken(Usuario user);
    string HashPassword(string password);
    bool VerifyPassword(string password, string hash);
    string GenerateTemporaryPassword();
}
