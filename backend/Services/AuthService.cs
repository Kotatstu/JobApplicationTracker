using backend.Data;
using backend.DTOs;
using backend.Interfaces;
using backend.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace backend.Services;

public class AuthService : IAuthService
{
    private readonly UserManager<IdentityUser<Guid>> _userManager;
    private readonly AppDbContext _context;
    private readonly ITokenService _tokenService;

    public AuthService(UserManager<IdentityUser<Guid>> userManager, AppDbContext context, ITokenService tokenService)
    {
        _userManager = userManager;
        _context = context;
        _tokenService = tokenService;
    }

    public async Task<IdentityResult> RegisterAsync(RegisterDTO dto)
    {
        var user = new IdentityUser<Guid> { UserName = dto.Email, Email = dto.Email };

        return await _userManager.CreateAsync(user, dto.Password);
    }

    public async Task<(string AccessToken, string RefreshToken)?> LoginAsync(LoginDTO dto)
    {
        var user = await _userManager.FindByEmailAsync(dto.Email);

        if (user is null || !await _userManager.CheckPasswordAsync(user, dto.Password))
            return null;

        var accessToken = _tokenService.GenerateAccessToken(user);
        var refreshToken = _tokenService.GenerateRefreshToken();

        _context.RefreshTokens.Add(new RefreshToken
        {
            UserId = user.Id,
            TokenHash = _tokenService.HashToken(refreshToken),
            ExpiresAt = DateTime.Now.AddDays(7)
        });

        await _context.SaveChangesAsync();

        return (accessToken, refreshToken);
    }

    public async Task<(string AccessToken, string RefreshToken)?> RefreshAsync(string refreshToken)
    {
        var tokenHash = _tokenService.HashToken(refreshToken);

        var existing = await _context.RefreshTokens.FirstOrDefaultAsync(rt => rt.TokenHash == tokenHash);

        if (existing is null || existing.RevokedAt is not null || existing.ExpiresAt <= DateTime.Now)
            return null;

        var user = await _userManager.FindByIdAsync(existing.UserId.ToString());
        if (user is null)
            return null;

        using var transaction = await _context.Database.BeginTransactionAsync();

        var newRawToken = _tokenService.GenerateRefreshToken();
        var newTokenEntity = new RefreshToken
        {
            UserId = existing.UserId,
            TokenHash = _tokenService.HashToken(newRawToken),
            ExpiresAt = DateTime.Now.AddDays(7)
        };

        _context.RefreshTokens.Add(newTokenEntity);
        await _context.SaveChangesAsync();

        existing.RevokedAt = DateTime.Now;
        existing.ReplacedByTokenId = newTokenEntity.Id;
        await _context.SaveChangesAsync();

        await transaction.CommitAsync();

        var newAccessToken = _tokenService.GenerateAccessToken(user);
        return (newAccessToken, newRawToken);
    }
    
    public async Task LogoutAsync(string refreshToken)
    {
        var tokenHash = _tokenService.HashToken(refreshToken);

        var existing = await _context.RefreshTokens
            .FirstOrDefaultAsync(rt => rt.TokenHash == tokenHash && rt.RevokedAt == null);

        if (existing is not null)
        {
            existing.RevokedAt = DateTime.Now;
            await _context.SaveChangesAsync();
        }
    }

}