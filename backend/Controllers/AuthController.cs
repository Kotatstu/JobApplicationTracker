using System.Net;
using backend.DTOs;
using backend.Interfaces;
using backend.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    [HttpPost]
    [Route("register")]
    public async Task<IActionResult> Register([FromBody] RegisterDTO dto)
    {
        var result = await _authService.RegisterAsync(dto);

        return result.Succeeded ? Ok(new { message = "Registered successfully" }) : BadRequest(result.Errors);
    }

    private void SetTokenCookies(string accessToken, string refreshToken)
    {
        Response.Cookies.Append("access_token", accessToken, new CookieOptions
        {
            HttpOnly = true, Secure = true, SameSite = SameSiteMode.Lax,
            Expires = DateTimeOffset.UtcNow.AddMinutes(20)
        });

        Response.Cookies.Append("refresh_token", refreshToken, new CookieOptions
        {
            HttpOnly = true, Secure = true, SameSite = SameSiteMode.Lax,
            Expires = DateTimeOffset.UtcNow.AddDays(7)
        });
    }

    [HttpPost]
    [Route("login")]
    public async Task<IActionResult> Login([FromBody] LoginDTO dto)
    {
        var tokens = await _authService.LoginAsync(dto);
        if (tokens is null)
            return Unauthorized("Invalid credentials");

        SetTokenCookies(tokens.Value.AccessToken, tokens.Value.RefreshToken);
        return Ok(new { message = "Logged in successfully" });
    }

    [HttpPost]
    [Route("refresh")]
    public async Task<IActionResult> Refresh()
    {
        if (!Request.Cookies.TryGetValue("refresh_token", out var refreshToken))
            return Unauthorized();

        var tokens = await _authService.RefreshAsync(refreshToken);
        if (tokens is null)
            return Unauthorized();

        SetTokenCookies(tokens.Value.AccessToken, tokens.Value.RefreshToken);
        return Ok(new { message = "Token refreshed" });
    }

    [HttpPost]
    [Route("logout")]
    public async Task<IActionResult> Logout()
    {
        if (Request.Cookies.TryGetValue("refresh_token", out var refreshToken))
        {
            await _authService.LogoutAsync(refreshToken);
        }

        Response.Cookies.Delete("access_token");
        Response.Cookies.Delete("refresh_token");

        return Ok(new { message = "Logged out successfully" });
    }
}