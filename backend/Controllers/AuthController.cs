using System.Net;
using backend.DTOs;
using backend.Interfaces;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly UserManager<IdentityUser<Guid>> _userManager;
    private readonly ITokenService _tokenSerivce;
    public AuthController(UserManager<IdentityUser<Guid>> userManager, ITokenService tokenService)
    {
        _userManager = userManager;
        _tokenSerivce = tokenService;
    }

    [HttpPost]
    [Route("register")]
    public async Task<IActionResult> Register([FromBody] RegisterDTO dto)
    {
        var user = new IdentityUser<Guid>{ UserName = dto.Email, Email = dto.Email};
        var result = await _userManager.CreateAsync(user, dto.Password);

        if(result.Succeeded == false)
            return BadRequest(result.Errors);

        return Ok(new {message = "Registered succeedfully"});
    }

    [HttpPost]
    [Route("login")]
    public async Task<IActionResult> Login([FromBody] LoginDTO dto)
    {
        var user = await _userManager.FindByEmailAsync(dto.Email);
        
        if(user == null || await _userManager.CheckPasswordAsync(user, dto.Password) == false)
            return Unauthorized("Invalid credentials");

        var accessToken = _tokenSerivce.GenerateAccessToken(user);

        Response.Cookies.Append("access_token", accessToken, new CookieOptions
        {
           HttpOnly = true,
           Secure = true, //http will fail, work with https
           SameSite = SameSiteMode.Lax,
           Expires = DateTimeOffset.Now.AddMinutes(20) 
        });

        return Ok(new {message = "Logged in successfully", userId = user.Id});
    }
}