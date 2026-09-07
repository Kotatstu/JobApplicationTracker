using Microsoft.AspNetCore.Identity;

namespace backend.Interfaces;

public interface ITokenService
{
    string GenerateAccessToken(IdentityUser<Guid> user);
    string GenerateRefreshToken();
    string HashToken(string token);
}