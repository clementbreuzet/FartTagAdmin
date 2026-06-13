using System.Security.Claims;
using FartSocial.Application.Auth;
using FartSocial.Application.Auth.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FartSocial.Api.Controllers;

/// <summary>
/// Provides identity and authorization information for the authenticated user.
/// </summary>
/// <param name="authService">The authentication service.</param>
[ApiController]
[Authorize]
[Route("api/me")]
public sealed class MeController(IAuthService authService) : ControllerBase
{
    /// <summary>Gets the authenticated user's identity, roles, and permissions.</summary>
    [HttpGet]
    public async Task<ActionResult<MeResponseDto>> GetMe(CancellationToken cancellationToken)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? User.FindFirstValue("sub");

        if (!Guid.TryParse(userId, out var parsedUserId))
        {
            return Unauthorized();
        }

        var response = await authService.GetMeAsync(parsedUserId, cancellationToken);
        return Ok(response);
    }
}
