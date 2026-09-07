using backend.DTOs;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore.Diagnostics;

namespace backend.Interfaces;

public interface IAuthService
{
    Task<IdentityResult> RegisterAsync(RegisterDTO dto);
    Task<(string AccessToken, string RefreshToken)?> LoginAsync(LoginDTO dto);
    Task<(string AccessToken, string RefreshToken)?> RefreshAsync(string refreshToken);
    Task LogoutAsync(string refreshToken);
}