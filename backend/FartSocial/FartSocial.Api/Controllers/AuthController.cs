using FartSocial.Application.Auth;
using FartSocial.Application.Auth.Dtos;
using Microsoft.AspNetCore.Mvc;

namespace FartSocial.Api.Controllers;

/// <summary>
/// Handles user registration, authentication, token renewal, and logout.
/// </summary>
/// <param name="authService">The authentication service.</param>
[ApiController]
[Route("api/auth")]
public sealed class AuthController(IAuthService authService) : ControllerBase
{
    /// <summary>Registers a new user and returns authentication tokens.</summary>
    [HttpPost("register")]
    public async Task<ActionResult<AuthResponseDto>> Register([FromBody] RegisterRequestDto request, CancellationToken cancellationToken)
    {
        var response = await authService.RegisterAsync(request, GetClientIp(), cancellationToken);
        return Ok(response);
    }

    /// <summary>Authenticates a user and returns authentication tokens.</summary>
    [HttpPost("login")]
    public async Task<ActionResult<AuthResponseDto>> Login([FromBody] LoginRequestDto request, CancellationToken cancellationToken)
    {
        var response = await authService.LoginAsync(request, GetClientIp(), cancellationToken);
        return Ok(response);
    }

    /// <summary>Renews authentication tokens using a valid refresh token.</summary>
    [HttpPost("refresh")]
    public async Task<ActionResult<AuthResponseDto>> Refresh([FromBody] RefreshTokenRequestDto request, CancellationToken cancellationToken)
    {
        var response = await authService.RefreshAsync(request, GetClientIp(), cancellationToken);
        return Ok(response);
    }

    /// <summary>Revokes the supplied refresh token.</summary>
    [HttpPost("logout")]
    public async Task<IActionResult> Logout([FromBody] LogoutRequestDto request, CancellationToken cancellationToken)
    {
        await authService.LogoutAsync(request, GetClientIp(), cancellationToken);
        return NoContent();
    }

    private string? GetClientIp() =>
        HttpContext.Connection.RemoteIpAddress?.ToString();
}
