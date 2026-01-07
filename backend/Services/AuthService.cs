using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using MDAyuda.API.Models;

namespace MDAyuda.API.Services;

public class AuthService : IAuthService
{
    private readonly IConfiguration _configuration;

    public AuthService(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public string GenerateJwtToken(Usuario user)
    {
        var jwtSettings = _configuration.GetSection("Jwt");
        var key = Encoding.ASCII.GetBytes(jwtSettings["Key"] ?? throw new InvalidOperationException("JWT Key not configured"));

        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.Name, user.Nombre),
            new Claim(ClaimTypes.Role, user.Rol)
        };

        if (user.EmpresaId.HasValue)
        {
            claims.Add(new Claim("EmpresaId", user.EmpresaId.Value.ToString()));
        }

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(claims),
            Expires = DateTime.UtcNow.AddMinutes(int.Parse(jwtSettings["ExpirationMinutes"] ?? "60")),
            Issuer = jwtSettings["Issuer"],
            Audience = jwtSettings["Audience"],
            SigningCredentials = new SigningCredentials(
                new SymmetricSecurityKey(key),
                SecurityAlgorithms.HmacSha256Signature)
        };

        var tokenHandler = new JwtSecurityTokenHandler();
        var token = tokenHandler.CreateToken(tokenDescriptor);

        return tokenHandler.WriteToken(token);
    }

    public string HashPassword(string password)
    {
        return BCrypt.Net.BCrypt.HashPassword(password);
    }

    public bool VerifyPassword(string password, string hash)
    {
        return BCrypt.Net.BCrypt.Verify(password, hash);
    }

    public string GenerateTemporaryPassword()
    {
        const string upperCase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        const string lowerCase = "abcdefghijklmnopqrstuvwxyz";
        const string digits = "0123456789";
        const string special = "!@#$%";

        var random = new Random();
        var password = new char[12];

        // Ensure at least one of each type
        password[0] = upperCase[random.Next(upperCase.Length)];
        password[1] = lowerCase[random.Next(lowerCase.Length)];
        password[2] = digits[random.Next(digits.Length)];
        password[3] = special[random.Next(special.Length)];

        // Fill the rest randomly
        var allChars = upperCase + lowerCase + digits + special;
        for (int i = 4; i < 12; i++)
        {
            password[i] = allChars[random.Next(allChars.Length)];
        }

        // Shuffle
        return new string(password.OrderBy(x => random.Next()).ToArray());
    }
}
